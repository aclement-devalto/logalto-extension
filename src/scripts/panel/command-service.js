angular.module('prome.services')
	.factory('Commander', [
		'$rootScope', '$http', '$sce', 'Messaging',

		function($rootScope, $http, $sce, Messaging) {

			var toggleToolbarStatus = function(status) {
				var toolbarIcon = document.getElementById('logalto-dev-toolbar');

				toolbarIcon.className = toolbarIcon.className.replace(/(success|error)/, '');
				toolbarIcon.className += ' ' + status
			};

			var serverHostname = 'localhost:7500';

			return {
				requestsWaitingCount: 0,
				queue: [],
				shouldReload: false,

				sendRequest: function(commandAlias, command, tenantAlias, requestObj) {
					var me = this;

					var task = {
						commandAlias: commandAlias,
						command: command,
						tenantAlias: tenantAlias,
						requestObj: requestObj
					};

					if (command.wait_for) {
						task.waitFor = command.wait_for;
					}

					// Queue task
					this.queue.push(task);
					this.requestsWaitingCount++;

					var delayed = false;

					if (task.waitFor) {
						// If task has dependency, check if a dependent task is currently processing
						var length = this.queue.length;
						for (var i = 0; i < length; i++) {
							var queuedTask = me.queue[i];

							// If a dependent task is processing, delay the current task
							if (queuedTask == task.waitFor) {
								delayed = true;
								break;
							}
						}
					}

					if (!delayed) {
						this.processRequest(task, requestObj);
					}
				},

				processRequest: function(task, requestObj) {
					var me = this,
						socket = io.connect('http://' + serverHostname),
						startTime;

					toggleToolbarStatus('');

					var formatOutput = function (output) {
						if (!output) {
							return output;
						}

						lines = output.split("\n");

						for (i = 0, len = lines.length; i < len; ++i) {
							lines[i] = String(lines[i]).replace(/\[INF\]/g, '<span style="color: green;">[INF]</span>');
							lines[i] = String(lines[i]).replace(/\[WRN\]/g, '<span style="color: yellow;">[WRN]</span>');
							lines[i] = String(lines[i]).replace(/\[ERR\]/g, '<span style="color: red;">[ERR]</span>');
						}

						return lines.join('<br>');
					};

					// Open socket connection to server backend
					socket.on('connect', function(){
						startTime = new Date();

						socket.emit('execute-task', {
							task: task.commandAlias,
							tenant: task.tenantAlias
						});

						socket.on('task-status', function(response){
							$rootScope.$apply(function () {
								var currentOutput = "";
								if (requestObj.output) {
									currentOutput = $sce.getTrustedHtml(requestObj.output);
								}

								if (response.output) {
									requestObj.output = $sce.trustAsHtml(currentOutput + formatOutput(response.output));
								} else if (response.error) {
									requestObj.output = $sce.trustAsHtml(currentOutput + '<span style="color: red;">' + formatOutput(response.error) + '</span>');
								}

								setTimeout(function(){
									var wrapper = document.getElementById('logalto-dev-panel-output-wrapper');
									wrapper.scrollTop = wrapper.scrollHeight;
								}, 100);
							});
						});

						socket.on('task-complete', function(response) {
							$rootScope.$apply(function () {
								if (response.status) {
									toggleToolbarStatus('success');

									requestObj.status = 'success';
									requestObj.info = 'Request completed in ' + Math.round((new Date() - startTime) / 1000) + 's.';
									me.requestsWaitingCount--;

									if ($rootScope.currentPage.activeCommand.alias == task.commandAlias) {
										requestObj.unread = false;
									}

									// Database cleaned : log out user to prevent 'User not found' exception
									if (task.commandAlias == 'create-database' || task.commandAlias == 'drop-database' || task.commandAlias == 'reset-setup') {
										localStorage.removeItem('prome_user');
									}

									if (task.command.refresh_browser) {
										me.shouldReload = true;
									}

									// Reload inspected page if no other requests waiting
									if (me.requestsWaitingCount == 0 && me.shouldReload) {
										Messaging.sendRequest({action: 'reload-tab'});
									}

									if (response.output) {
										var currentOutput = "";
										if (requestObj.output) {
											currentOutput = $sce.getTrustedHtml(requestObj.output);
										}

										requestObj.output = $sce.trustAsHtml(currentOutput + '<br>' + formatOutput(response.output));
									}
								} else {
									toggleToolbarStatus('error');

									requestObj.status = 'error';
									me.requestsWaitingCount--;

									if ($rootScope.currentPage.activeCommand.alias == task.commandAlias) {
										requestObj.unread = false;
									}

									var currentOutput = "";
									if (requestObj.output) {
										currentOutput = $sce.getTrustedHtml(requestObj.output);
									}

									if (response.error) {
										requestObj.output = $sce.trustAsHtml(currentOutput + '<br><span style="color: red;">' + formatOutput(response.error) + '</span>');
									} else if (response.output) {
										requestObj.output = $sce.trustAsHtml(currentOutput + '<br>' + formatOutput(response.output));
									}

									requestObj.info = 'Request failed.';
								}

								me.completeTask(task, response);
							});

							socket.disconnect();
				        });

				        socket.on('disconnect', function(message) {
							if (requestObj.status == 'loading') {
								requestObj.status = 'error';
								me.requestsWaitingCount--;

								if ($rootScope.currentPage.activeCommand.alias == task.commandAlias) {
									requestObj.unread = false;
								}

								requestObj.info = 'Request failed: connection closed';

								me.completeTask(task, {
									status: false
								});
							}
						});
				    });
				},

				completeTask: function(task, response) {
					var me = this,
						taskIndex,
						dependentTask;

					// Find queued task
					var length = this.queue.length;
					for (var i = 0; i < length; i++) {
						var queuedTask = me.queue[i];

						if (queuedTask == task.commandAlias) {
							taskIndex = i;
						}

						if (queuedTask.waitFor && queuedTask.waitFor == task.commandAlias) {
							dependentTask = queuedTask;
						}
					}

					// Unqueue task
					me.queue.splice(taskIndex, 1);

					// If this task is a dependency to another task, execute the other task
					if (response.status && dependentTask) {
						this.processRequest(dependentTask, dependentTask.requestObj);
					}
				},

				ping: function() {
					$http.get('http://' + serverHostname + '/ping', {
						timeout: 1000
					})
						.success(function(response, status) {
							$rootScope.serverIsOnline = true;
						})
						.error(function(response, status) {
							$rootScope.serverIsOnline = false;
						});
				},

				fetchTasksList: function() {
					var promise = $http.get('http://' + serverHostname + '/tasks', {
						timeout: 1000
					})
						.then(function(response) {
							if (response.status == 200) {
								return response.data;
							} else {
								return false;
							}						
						}, function(response) {							
							return false;
						});

					return promise;
				}
			};
		}
	]);
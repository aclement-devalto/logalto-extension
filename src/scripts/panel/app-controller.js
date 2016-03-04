angular.module('prome.controllers')
	.controller('AppController', [
		'$rootScope', '$scope', '$window', 'localStorageService', 'Tenant', 'Messaging', 'Commander',

		function($rootScope, $scope, $window, localStorageService, Tenant, Messaging, Commander){

			$scope.tasks = {};

			/**
			 * Manually refresh current inspected page
			 */
			$scope.refreshCurrentPage = function() {
				if (!$scope.currentPage || $scope.currentPage.tabId != chrome.devtools.inspectedWindow.tabId) {
					Messaging.sendRequest({action: 'init', tabId: chrome.devtools.inspectedWindow.tabId});
				}
			};

			$scope.pingServer = function() {
				Commander.ping();
			};

			/**
			 * Open Prome with provided tenant and environment in a new tab
			 *
			 * @param {{tenant: String, env: String}} options
			 */
			$scope.openPromeUrl = function(options) {
		        Messaging.sendRequest({
		            action: 'new-tab',
		            content: {
		                url: 'http://' + options.tenant + '.prome.' + options.env
		            }
		        });
			};

			$scope.getActiveRequest = function() {
				if (!$scope.currentPage || !$scope.currentPage.activeCommand) return null;

				return $scope.currentPage.requests[$scope.currentPage.activeCommand.alias];
			};

			/**
			 *
			 * @param {string} commandAlias
			 * @param {string} categoryAlias
			 * @param {boolean} launchRequest
			 */
			$scope.switchCommand = function(commandAlias, categoryAlias, launchRequest) {
				var category = $scope.tasks[categoryAlias],
					command = category.tasks[commandAlias];

				if ($scope.currentPage.requests[commandAlias]) {
					$scope.currentPage.requests[commandAlias].unread = false;
				}

				if ($scope.currentPage.activeCommand && $scope.currentPage.activeCommand.alias == commandAlias) {
					launchRequest = true;
				}

				$scope.currentPage.activeCommand = command;
				$scope.currentPage.activeCommand.alias = commandAlias;

				if (launchRequest) {
					$scope.launchRequest($scope.currentPage.activeCommand);
				}
			};

			$scope.launchRequest = function(command) {
				// Stop if similar request is already underway
				if ($scope.currentPage.requests[command.alias] && $scope.currentPage.requests[command.alias].status == 'loading') return true;
				
				$scope.currentPage.requests[command.alias] = {
					status: 'loading',
					unread: true
				};

				// Send command request to virtual machine listener
				Commander.sendRequest(command.alias, $scope.currentPage.tenant.alias, $scope.currentPage.requests[command.alias]);
			};

			$scope.togglePanel = function() {
				var toolbarPanel = document.getElementById('logalto-dev-panel'),
					toolbarIcon = document.getElementById('logalto-dev-toolbar');
				if (toolbarPanel.className.indexOf('open') > -1) {
					toolbarPanel.className = toolbarPanel.className.replace(/open/, '');

					toolbarIcon.className = toolbarIcon.className.replace(/open/, '');
				} else {
					toolbarIcon.className = toolbarIcon.className.replace(/(success|error)/, '');
					toolbarIcon.className += 'open';

					toolbarPanel.className += 'open';
				}
			};

			$scope.fetchTasks = function() {
				Commander.fetchTasksList().then(function(tasks){
					if (tasks) {
						$scope.serverIsOnline = true;
						$scope.tasks = tasks;
					} else {
						$scope.serverIsOnline = false;
					}
				});
			};

			$scope.init = function() {
				$scope.currentPage = $rootScope.currentPage;
				angular.merge($rootScope.currentPage, Tenant.getCurrentPageInfo());

				$scope.serverIsOnline = $rootScope.serverIsOnline;

				var toolbar = document.createElement('div');
				toolbar.id = 'logalto-dev-toolbar';
				toolbar.innerHTML = "<div class='logo'><img src='/resources/images/logo/logo-logalto-small.png'></div><div clear='both'></div>";
				document.body.appendChild(toolbar);

				toolbar.addEventListener('click', $scope.togglePanel);

				$scope.fetchTasks();
			};

			$scope.init();
		}
	]);
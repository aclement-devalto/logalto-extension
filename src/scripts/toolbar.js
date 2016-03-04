(function() {

	var panelTpl = 
	'<div lang="fr" ng-app="prome" id="ng-app" ng-controller="AppController">' + 
	'		<div class="sidebar" ng-class="{offline: !serverIsOnline}">' + 
	'			<ul class="nav nav-sidebar" ng-repeat="(commandAlias, command) in tasks">' + 
	'				<li class="nav-header">{{command.title}}</li>' + 
	'				<li class="action" ng-class="{active: currentPage.activeCommand.alias == actionAlias, loading: currentPage.requests[actionAlias].status == \'loading\', success: currentPage.requests[actionAlias].status == \'success\' && currentPage.requests[actionAlias].unread == true, error: currentPage.requests[actionAlias].status == \'error\' && currentPage.requests[actionAlias].unread == true}" ng-repeat="(actionAlias, action)  in command.tasks"><a ng-click="switchCommand(actionAlias, commandAlias)" ng-dblclick="switchCommand(actionAlias, commandAlias, true)">{{action.label}}<span class="glyphicon"></span></a><div class="spinner"><div class="double-bounce1"></div><div class="double-bounce2"></div></div></li>' + 
	'			</ul>' + 
	'		</div>' + 
	'		<div class="main-view" ng-class="{offline: !serverIsOnline}">' + 
	'			<div class="request" ng-class="{loading: getActiveRequest().status == \'loading\', success: getActiveRequest().status == \'success\',  error: getActiveRequest().status == \'error\'}">' + 
	'				<h3 ng-hide="!currentPage.activeCommand"><span class="title">{{currentPage.activeCommand.title}}</span><span class="glyphicon"></span><div class="spinner"><div class="double-bounce1"></div><div class="double-bounce2"></div></div><div class="loading-message">Processing</div></h3>' + 
	'				<div class="wrapper" id="logalto-dev-panel-output-wrapper">' +
	'				<div class="output" ng-hide="!getActiveRequest().output" ng-bind-html="getActiveRequest().output"></div>' + 
	'				<div class="info" ng-hide="getActiveRequest().status == \'loading\' || !getActiveRequest().info">{{getActiveRequest().info}}</div>' + 
	'				<button class="btn btn-success btn-send" ng-hide="!currentPage.activeCommand || getActiveRequest().status == \'loading\'" ng-click="launchRequest(currentPage.activeCommand)">Send command</button>' + 
	'				</div>' +
	'			</div>' + 
	'			<div class="offline-server"><h1><span class="glyphicon icon-alert"></span>&nbsp;&nbsp;Serveur indisponible</h1><p>Le serveur NodeJS ne répond pas.<br>Vérifiez que le serveur est bien démarré sur le port 7500.</p><button class="btn btn-retry" ng-click="fetchTasks()">Réessayer</button></div>' +
	'		</div>' + 
	'		<a class="close-button" ng-click="togglePanel()"><span class="glyphicon icon-close"></span>Fermer</a>'
	'</div>';

	var panel = document.createElement('div');
	panel.id = 'logalto-dev-panel';
	panel.innerHTML = panelTpl;

	document.body.appendChild(panel);
})();
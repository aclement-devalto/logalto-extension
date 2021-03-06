'use strict';

// Declare app level module which depends on filters, and services
angular.module('prome', [
	'prome.controllers',
	'prome.services',
	'LocalStorageModule'
])
	.config([
		'localStorageServiceProvider',

		function(localStorageServiceProvider) {
			localStorageServiceProvider
				.setPrefix('promeDevExtension')
				.setStorageType('sessionStorage')
				.setNotify(true, true);
		}
	])
	.run([
		'$rootScope',

		function ($rootScope) {
			$rootScope.currentPage = {
				requests: {}
			};

			$rootScope.serverIsOnline = true;
			$rootScope.tasks = {};
		}
	]);

angular.module('prome.controllers', []);
angular.module('prome.services', []);
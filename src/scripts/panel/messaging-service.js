angular.module('prome.services')
	.factory('Messaging', [
		'$rootScope',

		function($rootScope) {

			var Messaging = {
				port: null
			};

			/**
			 * Handle incoming response from inspected page or background page
			 *
			 * @param {object} message
			 * @param MessageSender sender
			 */
			// Messaging.handleResponse = function(message) {
			// 	switch(message.type) {
			// 		case 'inspected-page':
			// 			if (!$rootScope.currentPage) $rootScope.currentPage = {};

			// 			$rootScope.$apply(function () {
			// 				angular.merge($rootScope.currentPage, message.content);
			// 				$rootScope.tenants = message.content.tenants;
			// 			});
			// 			break;
			// 	}
			// };

			/**
			 * Send request message to background page
			 * @param message
			 */
			Messaging.sendRequest = function(message) {
				Messaging.port.postMessage(message);
			};

			Messaging.init = function() {
				// Create a port with background page for continous message communication
				Messaging.port = chrome.runtime.connect({
					name: 'devtools'
				});

				// // Listen to messages from the background page
				// Messaging.port.onMessage.addListener(function(message){
				// 	angular.element(document.body).scope().listenMessagingResponse(message);
				// });
			};

			Messaging.initWebSocket = function() {
				return new WebSocket('ws://localhost:7500/socket');
			};
			
			Messaging.init();

			return Messaging;
		}
	]);
angular.module('prome.services')
	.factory('Tenant', [
		'$rootScope', 

		function($rootScope) {
			var getLocationHost = function(location) {
				return String(document.location.hostname);
			};

			return {
				getCurrentPageInfo: function() {
					var host = getLocationHost(location),
						tenantAlias = null,
						env = null,
						currentTenant = null;

					// Check if inspected page is from Logalto
					if (host.match(/prome.(dev|prod)/i)) {
						// Extract tenant alias from host
						tenantAlias = String(host.replace(/.?prome.(dev|prod)/i, ''));

						// Extract dev environment from host
						if (host.match(/prome.dev/i)) {
							env = 'dev';
						} else {
							env = 'prod';
						}
					}

					var tenantName = tenantAlias.split('-');

					currentTenant = {
						alias: tenantAlias,
						name: tenantName[0].toUpperCase() + ' (' + tenantName[1].toUpperCase() + ')'
					};

					return {
						host: host,
						tenant: currentTenant,
						env: env
					}
				}
			};
		}
	]);
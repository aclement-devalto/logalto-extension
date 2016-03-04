chrome.runtime.onInstalled.addListener(function() {
  var context = "all";
  var title = "Hide loading mask";
  var id = chrome.contextMenus.create({
  	title: title,
  	contexts: [context], 
  	id: 'logalto-loading-mask-menuItem',
  	documentUrlPatterns: ['*://*.prome.prod/*','*://*.prome.dev/*','*://*.prome3.cloudalto.net/*']
  });  
});

// add click event
chrome.contextMenus.onClicked.addListener(onClickHandler);

// The onClicked callback function.
function onClickHandler(info, tab) {
	chrome.tabs.sendMessage(tab.id, 'remove-selected-loading-mask');
};

// Listen to internal messaging from inspected pages or devtools panel
chrome.runtime.onConnect.addListener(function (port) {
	if (port.name !== 'devtools') return;

	var extensionListener = function (message, messageSender) {

		switch (message.action) {
			case 'new-tab':
				// Open new tab with provided URL
				chrome.tabs.create({
					url: message.content.url
				});
			break;
			case 'reload-tab':
				// Clear cache & reload tab
				chrome.browsingData.removeCache({
					"since": new Date().setDate(new Date().getDate() - 7)
				}, function(){
					chrome.tabs.reload(messageSender.sender.tab.id);
				});
			break;
			default:
				//Pass message to inspectedPage
				chrome.tabs.sendMessage(message.tabId, message, sendResponse);
		}
    };

    // Listens to messages sent from the panel
	port.onMessage.addListener(extensionListener);

    port.onDisconnect.addListener(function(port) {
		port.onMessage.removeListener(extensionListener);
    });

});
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
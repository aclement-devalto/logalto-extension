console.log('content script loaded');

var lastElementContext;

document.addEventListener('contextmenu', function(event) {
    lastElementContext = event.target;
}, true);

function addCustomScript() {
    var scriptContent = "document.body.addEventListener('removeloadingmask',function(e){Ext.getCmp(e.detail.targetId).unmask();}, false);";

    var script = document.createElement('script');
    script.id = 'tmpScript';
    script.appendChild(document.createTextNode(scriptContent));
    (document.body || document.head || document.documentElement).appendChild(script);
}

addCustomScript();

chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
	switch(message) {
		case "remove-selected-loading-mask":
			// Check if selected element is a loading mask
			if (lastElementContext.className.indexOf('x-mask') > -1) {
				var parentNode = lastElementContext.parentNode;
				if (parentNode.className.indexOf('x-masked') > -1) {
					// Send custom event to embedded script to unmask component
					var removeMaskEvent = new CustomEvent('removeloadingmask', {detail: {targetId: parentNode.id}});
					document.body.dispatchEvent(removeMaskEvent);
				}
			}
		break;
	}
});
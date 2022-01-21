'use strict';

// Get the background page. used for console logging
// const bg = chrome.extension.getBackgroundPage();

// Function ran when a site is blocked. By default it redirects to a custom page.
// Don't block the current domain is in the whitelist
const blockRequest = (request) => {
    chrome.storage.local.get(['enabled', 'whitelist'], data => {
        if(data.enabled) {
            chrome.tabs.query({currentWindow: true, active: true}, function (tab) {
                const domain = new URL(request.url).hostname.replace('www.','');
                if(!data.hasOwnProperty('whitelist') ||!data.whitelist.includes(domain)) {
                    let blocked = chrome.extension.getURL("src/blocked.html")
                        .concat(`?blocked-page=${request.url}`);
                    chrome.tabs.update(tab.id, {url: blocked});             
                }
            });
        }
    });
};

// Fetch the url list from localstorage and update the listener
function updateListener() {
    // TODO
};

// Wait for messages from other pages withing the extension
chrome.runtime.onMessage.addListener((request) => {

    // Message requesting a blacklist update
    if (request.message == "update") {
        updateListener();
    }
});

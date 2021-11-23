'use strict';

// Get the background page. used for console logging
const bg = chrome.extension.getBackgroundPage();

// Function ran when a site is blocked. By default it redirects to a custom page.
const blockRequest = (request) => {
    chrome.storage.local.get(['enabled'], data => {
        if (data.enabled) {
            bg.console.log("Blocked!");
            chrome.tabs.query({currentWindow: true, active: true}, function (tab) {
                let blocked = chrome.extension.getURL("src/blocked.html").concat(`?blocked-page=${request.url}`);
                chrome.tabs.update(tab.id, {url: blocked});
            });
        }
    });
};

// Fetch the url list from localstorage and update the listener
function updateListener() {
    if (chrome.webRequest.onBeforeRequest.hasListener(blockRequest)) {
        chrome.webRequest.onBeforeRequest.removeListener(blockRequest);
    }
    
    chrome.storage.local.get(['urls'], urls => {
        bg.console.log("Updating urls...");
        bg.console.log(JSON.stringify(urls, undefined, 4));
        if (urls.length !== 0) {
            try {
                chrome.webRequest.onBeforeRequest.addListener(
                    blockRequest,
                    {urls: urls.urls},
                    ['blocking']);
            } catch (e) {
                bg.console.error(e);
            }
        }
    });
};


// Load url list if it exists when the extension is first enabled
chrome.storage.local.get(['urls'], (urls) => {
    if(urls) {
        chrome.webRequest.onBeforeRequest.addListener(
            blockRequest,
            {
                urls: urls.urls,
                types: ["main_frame"]
            },
            ['blocking']
        );
    }
});

// Wait for messages from other pages withing the extension
chrome.runtime.onMessage.addListener((request) => {

    // Message requesting a blacklist update
    if (request.message == "update") {
        updateListener();
    }
});

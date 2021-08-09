"use strict";

const urls = ["*://*.google.com/*",
              "*://*.youtube.com/*"];

chrome.webRequest.onBeforeRequest.addListener(
        function logRequests(request) {
            chrome.storage.local.get(['enabled'], data => {
                if (data.enabled && request.type == "main_frame") {
                    chrome.tabs.query({currentWindow: true, active: true}, function (tab) {
                        chrome.tabs.update(tab.id, {url: chrome.extension.getURL("src/views/blocked/blocked.html")});
                    });
                }
            });
        },
        { urls: urls },
        ['blocking']
    );

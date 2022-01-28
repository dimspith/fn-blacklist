'use strict';


const isProtectedOrEmpty = (url) => {
    const protectedPrefixes = [
        "chrome://",
        "brave://",
        "chrome-extension://"
    ];
    if (!url || url.length === 0) {
        return true;
    }
    for(var i = 0; i < protectedPrefixes.length; i++) {
        if(url.startsWith(protectedPrefixes[i])) {
            console.log("Url is protected! Starts with: " + protectedPrefixes[i]);
            return true;
        }
    }
    return false;
};

// Function ran when a site is blocked. By default it redirects to a custom page.
// Don't block the current domain is in the whitelist
const blockIfFake = (url, tabID) => {
    chrome.storage.local.get(['enabled', 'whitelist'], data => {
        if(data.enabled) {
            const domain = url.replace('www.','');
            if(isProtectedOrEmpty(url) || (data.hasOwnProperty('whitelist') && data.whitelist.includes(domain))) {
                console.log(domain + " in whitelist or protected!");
            } else {
                console.log(domain + " not whitelisted!");
                let blocked = chrome.runtime.getURL("src/blocked.html")
                    .concat(`?blocked-page=${url}`);
                chrome.tabs.update(tabID, {url: blocked});
            }
        } else {
            console.log("Extension not enabled!");
        }
    });
};

chrome.tabs.onActivated.addListener( function(activeInfo){
    chrome.tabs.get(activeInfo.tabId, function(tab){
        const url = tab.url;
        console.log("(Tab activated) you are here: " + url);
        blockIfFake(url, tab.id);
    });
});

chrome.tabs.onUpdated.addListener((tabId, change, tab) => {
    if (tab.active && change.url) {
        const url = change.url;
        console.log("(Tab updated) you are here: " + url);
        blockIfFake(url, tab.id);
    }
});

// Wait for messages from other pages withing the extension
chrome.runtime.onMessage.addListener((request) => {
    // Message requesting a blacklist update
    if (request.message == "update") {
        chrome.storage.local.get(function(data) {
            console.log(data);
        });
    } else {
        console.log(request.message);
    }
});

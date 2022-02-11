'use strict';

// ---------- Function Declarations ----------

// Check if URL is empty (happens with tabs) or protected
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
            return true;
        }
    }
    return false;
};

// Block page if it's in the blacklist and not whitelisted or protected
const blockIfFake = (url, tabID) => {
    chrome.storage.local.get(['enabled', 'whitelist', 'urls'], data => {
        if(data.enabled) {
            if(isProtectedOrEmpty(url)) {
                console.log("URL is protected!");
                return;
            }
            const domain = (new URL(url)).hostname.replace('www.','');
            if (data.hasOwnProperty('whitelist') && data.whitelist.includes(domain)) {
                console.log(domain + " in whitelist!");
            } else if (data.urls.includes(domain)) {
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

// Check if active tab is in the blacklist
const checkOnActiveTab = (activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, function(tab){
        const url = tab.url;
        blockIfFake(url, tab.id);
    });    
};

// Check if updated tab tab is in the blacklist
const checkOnTabUpdate = (tabID, change, tab) => {
    if (tab.active && change.url) {
        const url = change.url;
        blockIfFake(url, tab.id);
    }    
};

// Add listeners on activated and updated tabs
const addTabListeners = () => {
    chrome.tabs.onActivated.addListener(checkOnActiveTab);
    chrome.tabs.onUpdated.addListener(checkOnTabUpdate);
};

// Remove all tab listeners
const removeTabListeners = () => {
    chrome.tabs.onActivated.removeListener(checkOnActiveTab);
    chrome.tabs.onUpdated.removeListener(checkOnTabUpdate);
};

// ---------- Startup Procedures ----------

// When the extension is loaded, add required listeners
addTabListeners();

// Set the API's default URL
chrome.storage.local.get(['api'], data => {
    if(!data.hasOwnProperty('api')) {
        chrome.storage.local.set({'api': "https://fnapi.dimspith.com/api/fetch"});
    }
});

// Wait for messages from other pages withing the extension
chrome.runtime.onMessage.addListener((request) => {
    switch(request.message) {
    case "toggle":
        if(request.value == true) {
            chrome.storage.local.set({'enabled': true});
            addTabListeners();
        } else {
            chrome.storage.local.set({'enabled': false});
            removeTabListeners();
        }
        break;
    case "update":
        chrome.storage.local.set({'urls': request.value});
        chrome.storage.local.set({'lastUpdate': Date.now()});
        break;
    case "set-api":
        chrome.storage.local.set({'api': request.value});
    default:
        break;
        
    }
});

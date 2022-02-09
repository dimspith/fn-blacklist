'use strict';


// ---------- Function Declarations ----------

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

// Function ran when a site is blocked. By default it redirects to a custom page.
// Don't block the current domain is in the whitelist
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

const checkOnActiveTab = (activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, function(tab){
        const url = tab.url;
        console.log("(Tab activated) you are here: " + url);
        blockIfFake(url, tab.id);
    });    
};

const checkOnTabUpdate = (tabID, change, tab) => {
    if (tab.active && change.url) {
        const url = change.url;
        console.log("(Tab updated) you are here: " + url);
        blockIfFake(url, tab.id);
    }    
};

const addTabListeners = () => {
    chrome.tabs.onActivated.addListener(checkOnActiveTab);
    chrome.tabs.onUpdated.addListener(checkOnTabUpdate);
};

const removeTabListeners = () => {
    chrome.tabs.onActivated.removeListener(checkOnActiveTab);
    chrome.tabs.onUpdated.removeListener(checkOnTabUpdate);
};

chrome.storage.local.get(['api'], data => {
    if(!data.hasOwnProperty('api')) {
        chrome.storage.local.set({'api': "https://fnapi.dimspith.com/api/fetch"});
    }
});

// ---------- Startup Procedures ----------

// When the extension is loaded, add required listeners
addTabListeners();

// Wait for messages from other pages withing the extension
chrome.runtime.onMessage.addListener((request) => {
    switch(request.message) {
    case "update":
        chrome.storage.local.get(function(data) {
            console.log(data);
        });
        break;
        
    case "toggle":
        if(request.value == true) {
            chrome.storage.local.set({'enabled': true});
            addTabListeners();
        } else {
            chrome.storage.local.set({'enabled': false});
            removeTabListeners();
        }
        break;
        
    default:
        break;
        
    }
});

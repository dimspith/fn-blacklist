'use strict';

// ---------- Function Declarations ----------

// Binary search algorithm
function binarySearch(items, value) {
    var startIndex = 0,
        stopIndex = items.length - 1,
        middle = Math.floor((stopIndex + startIndex) / 2);

    while (items[middle] != value && startIndex < stopIndex) {

        //adjust search area
        if (value < items[middle]) {
            stopIndex = middle - 1;
        } else if (value > items[middle]) {
            startIndex = middle + 1;
        }

        //recalculate middle
        middle = Math.floor((stopIndex + startIndex) / 2);
    }

    //make sure it's the right value
    return (items[middle] != value) ? false : true;
}

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
    for (var i = 0; i < protectedPrefixes.length; i++) {
        if (url.startsWith(protectedPrefixes[i])) {
            return true;
        }
    }
    return false;
};

// Block page if it's in the blacklist and not whitelisted or protected
const blockIfFake = (url, tabID) => {
    chrome.storage.local.get(['enabled', 'whitelist', 'urls'], data => {
        if (isProtectedOrEmpty(url)) {
            return;
        }
        const domain = (new URL(url)).hostname.replace('www.', '');
        if (data.hasOwnProperty('whitelist') && data.whitelist.includes(domain)) {
            console.log(domain + " in whitelist!");
        } else if (binarySearch(data.urls, domain)) {
            console.log(domain + " not whitelisted!");
            let blocked = chrome.runtime.getURL("src/blocked.html")
                .concat(`?blocked-page=${url}`);
            chrome.tabs.update(tabID, { url: blocked });
        }
    });

};

// Check if active tab is in the blacklist
const checkOnActiveTab = (activeInfo) => {
    chrome.tabs.get(activeInfo.tabId, function(tab) {
        const url = tab.url;
        console.time("Blocking");
        blockIfFake(url, tab.id);
        console.timeEnd("Blocking");
    });
};

// Check if updated tab tab is in the blacklist
const checkOnTabUpdate = (tabID, change, tab) => {
    if (tab.active && change.url) {
        const url = change.url;
        console.time("Blocking");
        blockIfFake(url, tab.id);
        console.timeEnd("Blocking");
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
    if (!data.hasOwnProperty('api')) {
        chrome.storage.local.set({ 'api': "http://localhost:4000" });
    }
});

// Set the last API Update to 0
chrome.storage.local.get(['lastAPIUpdate'], data => {
    if (!data.hasOwnProperty('lastAPIUpdate')) {
        chrome.storage.local.set({ 'lastAPIUpdate': 0 });
    }
});

// Set the last Client Update to 0
chrome.storage.local.get(['lastUpdate'], data => {
    if (!data.hasOwnProperty('lastUpdate')) {
        chrome.storage.local.set({ 'lastUpdate': 0 });
    }
});

// Set the whitelist to an empty array
chrome.storage.local.get(['whitelist'], data => {
    if (!data.hasOwnProperty('whitelist')) {
        chrome.storage.local.set({ 'whitelist': [] });
    }
});

// Wait for messages from other pages withing the extension
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    switch (request.message) {
        case "debug":
            console.log(request.value);
            break;
        case "toggle":
            if (request.value == true) {
                chrome.storage.local.set({ 'enabled': true });
                addTabListeners();
            } else {
                chrome.storage.local.set({ 'enabled': false });
                removeTabListeners();
            }
            break;
        case "toggle-whitelist":
            chrome.storage.local.get(['whitelist'], (data) => {
                var whitelist = data.whitelist;
                if (whitelist.includes(request.domain)) {
                    whitelist.splice(whitelist.indexOf(request.domain), 1);
                    chrome.storage.local.set({ 'whitelist': whitelist });
                } else {
                    whitelist.push(request.domain);
                    chrome.storage.local.set({ 'whitelist': whitelist });
                }
            });
            break;
        case "update":
            chrome.storage.local.set({
                'urls': request.data.sites,
                'lastUpdate': Date.now(),
                'lastAPIUpdate': request.data.lastupdate
            });
            sendResponse({ success: true });
            break;
        case "update-diff":
            chrome.storage.local.get(['urls'], data => {
                // Apply diffs to urls
                chrome.storage.local.set({
                    'urls': data.urls
                        .concat(request.insertions)
                        .filter(function(item) {
                            return request.deletions.indexOf(item) === -1;
                        }).sort(),
                    'lastUpdate': Date.now(),
                    'lastAPIUpdate': request.lastAPIUpdate
                });
            });
            sendResponse({ success: true });
            break;
        case "set-api":
            chrome.storage.local.set({ 'api': request.value });
        default:
            break;

    }
});

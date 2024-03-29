'use strict';

// ---------- Function Declarations ---------

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
    if (url.length === 0) {
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
            console.log("Protected!");
            return;
        } else if (!data.hasOwnProperty("urls") || data.urls.length === 0) {
            console.log("No urls in blacklist!");
            return;
        }
        const domain = (new URL(url)).hostname.replace('www.', '');
        if (data.hasOwnProperty('whitelist') && data.whitelist.includes(domain)) {
            console.log(domain + " in whitelist!");
        } else if (binarySearch(data.urls, domain)) {
            console.log(domain + " not whitelisted!");
            let blocked = chrome.runtime.getURL("src/blocked.html")
                .concat(`?blocked-domain=${url}`);
            chrome.tabs.update(tabID, { url: blocked });
        }
    });

};

// Check if active tab is in the blacklist
const checkOnActiveTab = (activeInfo) => {
    console.time("(ACT) Blocking");

    chrome.tabs.get(activeInfo.tabId, function(tab) {
        blockIfFake(tab.url, tab.id);
    });

    console.timeEnd("(ACT) Blocking");
};

// Check if updated tab tab is in the blacklist
const checkOnTabUpdate = (tabID, change, tab) => {
    console.time("(UPD) Blocking");

    if (tab.active && change.url) {
        const url = change.url;
        blockIfFake(url, tab.id);
    }

    console.timeEnd("(UPD) Blocking");
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

const reloadTabListeners = () => {
    chrome.storage.local.get(['enabled'], data => {
        if (data.hasOwnProperty('enabled') && data.enabled) {
            addTabListeners();
        } else {
            removeTabListeners();
        }
    });
};

// ---------- Startup Procedures ----------
const populateLocalStorage = () => {
    // Set the enabled status. Also add listeners when extension is enabled.
    chrome.storage.local.get(['enabled'], data => {
        if (!data.hasOwnProperty('enabled')) {
            chrome.storage.local.set({ 'enabled': false });
        } else if(!data.enabled) {
            removeTabListeners();
        } else {
            addTabListeners();
        }
    });

    // Set the API's default URL
    chrome.storage.local.get(['api'], data => {
        if (!data.hasOwnProperty('api')) {
            chrome.storage.local.set({ 'api': "http://localhost:4000" });
        }
    });

    // Set the last API Update to 0
    chrome.storage.local.get(['APICheckpoint'], data => {
        if (!data.hasOwnProperty('APICheckpoint')) {
            chrome.storage.local.set({ 'APICheckpoint': 0 });
        }
    });

    // Set the last Client Update to 0
    chrome.storage.local.get(['localCheckpoint'], data => {
        if (!data.hasOwnProperty('localCheckpoint')) {
            chrome.storage.local.set({ 'localCheckpoint': 0 });
        }
    });

    // Set the whitelist to an empty array
    chrome.storage.local.get(['whitelist'], data => {
        if (!data.hasOwnProperty('whitelist')) {
            chrome.storage.local.set({ 'whitelist': [] });
        }
    });
    
    // Set the whitelist to an empty array
    chrome.storage.local.get(['urls'], data => {
        if (!data.hasOwnProperty('urls')) {
            chrome.storage.local.set({ 'urls': [] });
        }
    });

    // Set the whitelist to an empty array
    chrome.storage.local.get(['token'], data => {
        if (!data.hasOwnProperty('token')) {
            chrome.storage.local.set({ 'token': "" });
        }
    });

    chrome.storage.local.get(['contributor'], data => {
        if (!data.hasOwnProperty('contributor')) {
            chrome.storage.local.set({ 'contributor': false });
        }
    });
    
};

populateLocalStorage();

// Wait for messages from other pages withing the extension
chrome.runtime.onMessage.addListener((request, _sender, sendResponse) => {
    switch (request.message) {

        // Print debug messages to console
    case "debug":
        console.log(request.value);
        break;

        // Toggle extension status (enabled/disabled)
    case "toggle":
        if (request.value == true) {
            chrome.storage.local.set({ 'enabled': true });
            addTabListeners();
        } else {
            chrome.storage.local.set({ 'enabled': false });
            removeTabListeners();
        }
        // Dummy response to keep the console quiet
        sendResponse({ dummy: true });
        break;

        // Toggle whitelist status of a domain
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
        sendResponse({ dummy: true });
        break;

        // Update the blacklist by downloading the latest version
    case "update":
        chrome.storage.local.set({
            'urls': request.data.sites,
            'localCheckpoint': Date.now(),
            'APICheckpoint': request.data.checkpoint
        });
        reloadTabListeners();
        sendResponse({ success: true });
        break;

        // Update the blacklist by downloading diffs since the latest version
    case "update-diff":
        chrome.storage.local.get(['urls'], data => {
            // Apply diffs to urls
            chrome.storage.local.set({
                'urls': data.urls
                    .concat(request.insertions)
                    .filter(function(item) {
                        return request.deletions.indexOf(item) === -1;
                    }).sort(),
                'localCheckpoint': Date.now(),
                'APICheckpoint': request.APICheckpoint
            });
        });
        reloadTabListeners();
        sendResponse({ success: true });
        break;

        // Set the contributor status of the user (for labelling)
    case "set-contributor":
        chrome.storage.local.set({ 'contributor': request.value });
        break;

        // Set the API URL
    case "set-api":
        chrome.storage.local.set({ 'api': request.value });
        break;

        // Set the labelling token
    case "set-token":
        chrome.storage.local.set({ 'token': request.value });
        break;
    case "reset":
        // Set the last client update to 0
        chrome.storage.local.set({ 'localCheckpoint': 0 });

        // Set the last API update to 0
        chrome.storage.local.set({ 'APICheckpoint': 0 });

        // Set the whitelist to an empty array
        chrome.storage.local.set({ 'whitelist': [] });
        
        // Set the whitelist to an empty array
        chrome.storage.local.set({ 'urls': [] });

        sendResponse({ success: true });
        break;
    default:
        break;

    }
});

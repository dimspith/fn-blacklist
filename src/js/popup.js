'use strict';

import * as utils from './utils.js';

// Get the background page. used for console logging
// const bg = chrome.extension.getBackgroundPage();

// State of the extension (enabled/disabled)
var enabled = false;

// UI elements
const powerButton = document.getElementById("OnOffButton");
const powerButtonText = document.getElementById("OnOff");
const settingsButton = document.getElementById("SettingsButton");
const whitelistButton = document.getElementById("whitelistButton");

const updateButton = document.getElementById("updateButton");
const lastUpdateElem = document.getElementById("lastUpdate");
const apiWarning = document.getElementById("api-warning");

// Enables or disables the extension by notifying the background service worker
const enableOrDisableExtension = () => {
    enabled = !enabled;
    powerButtonText.innerHTML = enabled ? 'ON' : 'OFF';

    chrome.runtime.sendMessage({message: "toggle", value: enabled});
    if(enabled) {
        powerButton.classList.replace('is-danger', 'is-success');
    } else {
        powerButton.classList.replace('is-success', 'is-danger');
    }
};

// Update the blacklist
const updateBlacklist = () => {
    let current = Date.now();
    updateButton.classList.add('is-loading');
    chrome.storage.local.get('api', data => {
        fetch(data.api + "/api/fetch")
            .then(response => response.json())
            .then((data) => {
                if(!(apiWarning.classList.contains('is-hidden'))) {
                    apiWarning.classList.add('is-hidden');
                }
                chrome.runtime.sendMessage({message: "update",
                                            value: data.sites});
                updateButton.classList.remove('is-loading');
                lastUpdateElem.innerHTML = utils.elapsedTimeToString(current);
            }) .catch( _ => {
                updateButton.classList.remove('is-loading');
                apiWarning.classList.remove('is-hidden');
            });
    });
};

// Get extension state (ON/OFF) 
chrome.storage.local.get('enabled', data => {
    enabled = !!data.enabled;
    powerButtonText.innerHTML = enabled ? 'ON' : 'OFF';
    if(enabled) {
        powerButton.classList.replace('is-danger', 'is-success');
    } else {
        powerButton.classList.replace('is-success', 'is-danger');
    }
});

// Show elapsed time since last update
chrome.storage.local.get('lastUpdate', data => {
    let lastUpdate = data.lastUpdate;
    if (typeof lastUpdate !== 'undefined') {
        lastUpdateElem.innerHTML = utils.elapsedTimeToString(lastUpdate);
    } else {
        lastUpdateElem.innerHTML = "never";
    }
});

// Display whitelist button based on current page's status
chrome.tabs.query({currentWindow: true, active: true}, function (tab) {
    let status = utils.siteInWhitelist(tab[0].url);
    status.then((status) => {
        if(status === true) {
            whitelistButton.classList.replace('is-info', 'is-danger');
            whitelistButton.innerHTML = utils.whitelistedHTML;
            feather.replace();
        }
    });
});

// Add button listeners
powerButton.addEventListener("click", enableOrDisableExtension);
updateButton.addEventListener("click", updateBlacklist);
whitelistButton.addEventListener("click", () => {utils.togglePageWhitelist(true);});
settingsButton.addEventListener('click', function() {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        window.open(chrome.runtime.getURL('src/options.html'));
    }
});

'use strict';

import * as utils from './utils.js';

// Get the background page. used for console logging
const bg = chrome.extension.getBackgroundPage();

// State of the extension (enabled/disabled)
var enabled = false;

const notWhitelistedHTML = `
<span class="icon-text">
    <span class="icon is-large">
        <i data-feather="plus-circle"></i>
    </span>
    <span>Whitelist</span>
</span>`;

const whitelistedHTML = `
<span class="icon-text">
    <span class="icon is-large">
        <i data-feather="minus-circle"></i>
    </span>
    <span>Whitelist</span>
</span>
`;


// UI elements
const powerButton = document.getElementById("OnOffButton");
const powerButtonText = document.getElementById("OnOff");
const settingsButton = document.getElementById("SettingsButton");
const whitelistButton = document.getElementById("whitelistButton");

const updateButton = document.getElementById("updateButton");
const lastUpdateElem = document.getElementById("lastUpdate");
const apiWarning = document.getElementById("api-warning");

// Enables or disables the extension by changing a localstorage variable
// and notifying the background script
const enableOrDisableExtension = () => {
    enabled = !enabled;
    chrome.storage.local.set({'enabled': enabled});
    powerButtonText.innerHTML = enabled ? 'ON' : 'OFF';
    if(enabled) {
        powerButton.classList.replace('is-danger', 'is-success');
    } else {
        powerButton.classList.replace('is-success', 'is-danger');
    }
};

const whitelistCurrentPage = () => {
    chrome.storage.local.get(['whitelist'], (data) => {
        chrome.tabs.query({currentWindow: true, active: true}, function (tab) {
            const blockedURL = utils.getCurrentSite(tab[0].url);
            var urls = data.whitelist;
            bg.console.log(urls);
            if(typeof(urls) == "undefined" || Object.entries(urls).length === 0) {
                whitelistButton.classList.replace('is-info', 'is-danger');
                whitelistButton.innerHTML = whitelistedHTML;                    
                chrome.storage.local.set({'whitelist': [blockedURL]});
            } else if (!urls.includes(blockedURL)){
                whitelistButton.classList.replace('is-info', 'is-danger');
                whitelistButton.innerHTML = whitelistedHTML;                    
                urls.push(blockedURL);
                chrome.storage.local.set({'whitelist': urls});
            } else {
                whitelistButton.classList.replace('is-danger', 'is-info');
                whitelistButton.innerHTML = notWhitelistedHTML;
                urls.splice(urls.indexOf(blockedURL), 1);
                chrome.storage.local.set({'whitelist': urls});
            }
            feather.replace();
        });
    });
};


// updates the blacklist (WIP)
const updateBlacklist = () => {
    let current = Date.now();
    updateButton.classList.add('is-loading');
    fetch("http://localhost:5000/api/fetch")
        .then(response => response.json())
        .then((data) => {
            if(!(apiWarning.classList.contains('is-hidden'))) {
                apiWarning.classList.add('is-hidden');
            }
            chrome.storage.local.set({'urls': data.sites});
            chrome.runtime.sendMessage({message: "update"});
            updateButton.classList.remove('is-loading');
            lastUpdateElem.innerHTML = utils.elapsedTimeToString(current);
            chrome.storage.local.set({'lastUpdate': current});                        
        }) .catch( _ => {
            updateButton.classList.remove('is-loading');
            apiWarning.classList.remove('is-hidden');
        });
};

// When the popup UI is loaded, add listeners
document.addEventListener("DOMContentLoaded", function () {

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
            bg.console.log("Status: " + status);
            if(status === true) {
                whitelistButton.classList.replace('is-info', 'is-danger');
                whitelistButton.innerHTML = whitelistedHTML;
                feather.replace();
            }
        });
    });

    powerButton.addEventListener("click", enableOrDisableExtension);
    updateButton.addEventListener("click", updateBlacklist);
    whitelistButton.addEventListener("click", whitelistCurrentPage);
    settingsButton.addEventListener('click', function() {
        if (chrome.runtime.openOptionsPage) {
            chrome.runtime.openOptionsPage();
        } else {
            window.open(chrome.runtime.getURL('options.html'));
        }
    });

});

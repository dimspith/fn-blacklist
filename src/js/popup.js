'use strict';

import * as utils from './utils.js';

// State of the extension (enabled/disabled)
var enabled = false;

// UI elements
const powerButton = document.getElementById("OnOffButton");
const powerButtonText = document.getElementById("OnOff");
const settingsButton = document.getElementById("SettingsButton");
const whitelistButton = document.getElementById("whitelistButton");

const updateButton = document.getElementById("updateButton");
const lastUpdateElem = document.getElementById("lastUpdate");
const modal = document.getElementById("modal");
const apiWarning = document.getElementById("api-warning");
const updateWarning = document.getElementById("update-warning");
const labellingForm = u('.labelling_form');
const labellingDomain = u('.labelling_domain');

// Enables or disables the extension by notifying the background service worker
const enableOrDisableExtension = () => {
    enabled = !enabled;
    powerButtonText.innerHTML = enabled ? 'ON' : 'OFF';

    chrome.runtime.sendMessage({ message: "toggle", value: enabled });
    if (enabled) {
        powerButton.classList.replace('is-danger', 'is-success');
    } else {
        powerButton.classList.replace('is-success', 'is-danger');
    }
};

// Sets the last update time in the UI and localstorage
const setLastUpdateTime = () => {
    let current = Date.now();
    chrome.storage.local.set({ 'lastUpdate': current });
    lastUpdateElem.innerHTML = utils.elapsedTimeToString(current);
};

// Show a specific warning
const showWarning = (warning) => {
    switch (warning) {
        case "update":
            updateWarning.classList.remove('is-hidden');
            break;
        case "api":
            apiWarning.classList.remove('is-hidden');
            break;
        default:
            break;
    }
    modal.classList.add('is-active');
    updateButton.classList.remove('is-loading');
    setLastUpdateTime();
};

// Execute a blacklist update with diffs
const updateWithDiffs = (url) => {
    fetch(url)
        .then(response => response.json())
        .then((data) => {
            chrome.runtime.sendMessage({
                message: "update-diff",
                insertions: data.insertions,
                deletions: data.deletions,
                lastAPIUpdate: data.lastupdate
            }, function(response) {
                if (response.success) {
                    updateButton.classList.remove('is-loading');
                }
            });
        }).catch(_ => {
            showWarning("api");
        });
};

// Execute a total blacklist update
const updateWithoutDiffs = (url) => {
    fetch(url)
        .then(response => response.json())
        .then((data) => {
            chrome.runtime.sendMessage({
                message: "update",
                data: data
            }, function(response) {
                if (response.success) {
                    updateButton.classList.remove('is-loading');
                }
            });
        }).catch(err => {
            showWarning("api");
        });
};

// Update the blacklist
const updateBlacklist = () => {
    let current = Date.now();

    updateButton.classList.add('is-loading');

    chrome.storage.local.get(['api', 'lastAPIUpdate'], data => {

        // Default Values
        var fetchURL = new URL(data.api + "/api/fetch/");
        var lastAPIUpdateURL = new URL(data.api + "/api/latest/");

        // Get last API Update
        fetch(lastAPIUpdateURL)

            .then(res => res.json())
            .then(json => json.lastupdate)
            .then((lastAPIUpdate) => {
                
                // If we have the most recent list version, don't update.
                if (lastAPIUpdate <= data.lastAPIUpdate) {
                    showWarning("update");
                    return;
                }

                // If it's the first time updating, download the whole list,
                // otherwise, download diffs.
                if (data.lastAPIUpdate == 0) {
                    updateWithoutDiffs(fetchURL.href);
                } else {
                    fetchURL.searchParams.append("lastupdate", data.lastAPIUpdate);
                    updateWithDiffs(fetchURL.href);
                }
            })
            .catch((_) => {
                showWarning("api");
            });

        // Set the last update attempt value and remove button loading
        lastUpdateElem.innerHTML = utils.elapsedTimeToString(current);
    });
};

// Get extension state (ON/OFF) 
chrome.storage.local.get('enabled', data => {
    enabled = !!data.enabled;
    powerButtonText.innerHTML = enabled ? 'ON' : 'OFF';
    if (enabled) {
        powerButton.classList.replace('is-danger', 'is-success');
    } else {
        powerButton.classList.replace('is-success', 'is-danger');
    }
});

// If authorized, enable labelling
chrome.storage.local.get(['contributor'], data => {
    if(data.contributor == true) {
        u(labellingForm).removeClass('is-hidden');
        chrome.tabs.query({ currentWindow: true, active: true }, function(tab) {
            u(labellingDomain).attr('value', utils.getCurrentDomain(tab[0].url));
        });

    }
});

// Show elapsed time since last update
chrome.storage.local.get(['lastUpdate'], data => {
    if (data.hasOwnProperty('lastUpdate')) {
        lastUpdateElem.innerHTML = utils.elapsedTimeToString(data.lastUpdate);
    } else {
        lastUpdateElem.innerHTML = "never";
    }
});

// Display whitelist button based on current page's status
chrome.tabs.query({ currentWindow: true, active: true }, function(tab) {
    let status = utils.siteInWhitelist(tab[0].url);
    status.then((status) => {
        if (status === true) {
            whitelistButton.classList.replace('is-info', 'is-danger');
            whitelistButton.innerHTML = utils.whitelistedHTML;
            feather.replace();
        }
    });
});

// Custom redirect for labelling form.
// Passes domain to the form.
u('form').handle('submit', (event) => {
    const domain = u(labellingDomain).first().value;
    const labelling_url = chrome.runtime.getURL("src/labelling.html")
          .concat(`?domain=${domain}`);
    window.open(labelling_url, "_blank");
});

// Add button listeners
powerButton.addEventListener("click", enableOrDisableExtension);
updateButton.addEventListener("click", updateBlacklist);
whitelistButton.addEventListener("click", () => { utils.togglePageWhitelist(true); });
settingsButton.addEventListener('click', function() {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        window.open(chrome.runtime.getURL('src/options.html'));
    }
});

// Add a click event on various child elements to close the modal
// Also hide all children when modal closes
(document.querySelectorAll('.modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button') || []).forEach(($close) => {
    const $target = $close.closest('.modal');

    $close.addEventListener('click', () => {
        $target.classList.remove('is-active');
    });
});

// Add listener to receive messages from background page
chrome.runtime.onMessage.addListener(function(request) {
    switch (request.result) {
        case 'success':
            updateButton.classList.remove('is-loading');
            break;
    }
});

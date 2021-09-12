"use strict";

// Get the background page. used for console logging
const bg = chrome.extension.getBackgroundPage();

// State of the extension (enabled/disabled)
var enabled = false;

// UI elements to be 
const powerButton = document.getElementById("OnOffButton");
const powerButtonText = document.getElementById("OnOff");

const updateButton = document.getElementById("updateButton");
const lastUpdateElem = document.getElementById("lastUpdate");
const apiWarning = document.getElementById("api-warning");

// Enables or disables the extension by changing a localstorage variable
// and notifying the background script
const enableOrDisableExtension = () => {
    enabled = !enabled;
    chrome.storage.local.set({'enabled': enabled}, () => {});
    powerButtonText.innerHTML = enabled ? 'ON' : 'OFF';
    if(enabled) {
        powerButton.classList.replace('is-danger', 'is-success');
    } else {
        powerButton.classList.replace('is-success', 'is-danger');
    }
};

// Taken from uBlock Origin's code
const elapsedTimeToString = (timestamp) => {
    let value = (Date.now() - timestamp) / 60000;

    if (value < 2 ) {
        return('Less than a minute ago');
    }
    if (value < 60) {
        return('Many minutes ago');
    }
    value /= 60;
    if (value < 2) {
        return('An hour ago');
    }
    if (value < 24) {
        return('Many hours ago');
    }
    value /= 24;
    if (value < 2) {
        return('One day ago');
    }
    return('Many days ago');
};

// Updates the blacklist (WIP)
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
            lastUpdateElem.innerHTML = elapsedTimeToString(current);
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
            lastUpdateElem.innerHTML = elapsedTimeToString(lastUpdate);
        } else {
            lastUpdateElem.innerHTML = "never";
        }
    });

    powerButton.addEventListener("click", enableOrDisableExtension);
    updateButton.addEventListener("click", updateBlacklist);

});



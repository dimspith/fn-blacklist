"use strict";

document.addEventListener("DOMContentLoaded", function () {
    var enabled = false;
    var lastUpdate;

    const powerButton = document.getElementById("OnOffButton");
    const powerButtonText = document.getElementById("OnOff");

    const updateButton = document.getElementById("updateButton");
    const lastUpdateElem = document.getElementById("lastUpdate");

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

    // Updates the blocklist (WIP)
    const updateBlocklist = () => {
        let current = new Date();
        let cDate = current.getFullYear() + '-' + (current.getMonth() + 1) + '-' + current.getDate();
        let cTime = current.getHours() + ":" + current.getMinutes() + ":" + current.getSeconds();
        let dateTime = cDate + ' ' + cTime;
        updateButton.classList.add('is-loading');
        setTimeout(function() {
            updateButton.classList.remove('is-loading');
        }, 1000);
        lastUpdateElem.innerHTML = dateTime;
        chrome.storage.local.set({'lastUpdate': dateTime}, () => {});
    };

    chrome.storage.local.get('enabled', data => {
        enabled = !!data.enabled;
        powerButtonText.innerHTML = enabled ? 'ON' : 'OFF';
        if(enabled) {
            powerButton.classList.replace('is-danger', 'is-success');
        } else {
            powerButton.classList.replace('is-success', 'is-danger');
        }
    });

    chrome.storage.local.get('lastUpdate', data => {
        lastUpdate = data.lastUpdate;
        if (typeof lastUpdate !== 'undefined') {
            lastUpdateElem.innerHTML = lastUpdate;
        } else {
            lastUpdateElem.innerHTML = "never";
        }
    });

    powerButton.addEventListener("click", enableOrDisableExtension);
    updateButton.addEventListener("click", updateBlocklist);
});



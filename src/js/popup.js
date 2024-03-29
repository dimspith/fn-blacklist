"use strict";

import * as utils from "./utils.js";

// State of the extension (enabled/disabled)
var enabled = false;

// UI elements
const powerButton = u("#OnOffButton");
const powerButtonText = u("#OnOff");
const settingsButton = u("#SettingsButton");
const whitelistButton = u("#whitelistButton");

const updateButton = u("#updateButton");
const lastUpdateElem = u("#lastUpdate");
const modal = u(".modal");

const apiWarning = u("#api-warning");
const updateWarning = u("#update-warning");
const updateSuccess = u("#update-success");

const labellingForm = u(".labelling_form");
const labellingDomain = u(".labelling_domain");

// Enables or disables the extension by notifying the background service worker
const toggleExtension = () => {
    enabled = !enabled;
    powerButtonText.text(enabled ? "ON" : "OFF");
    powerButton.toggleClass(["is-success", "is-danger"]);
    chrome.runtime.sendMessage({ message: "toggle", value: enabled });
};

// Sets the last update time in the UI and localstorage
const setLastUpdateTime = () => {
    const current = Date.now();
    chrome.storage.local.set({ "localCheckpoint": current });
    lastUpdateElem.html(utils.elapsedTimeToString(current));
};

// Show a specific warning
const showWarning = (warning) => {
    let warnings = [apiWarning, updateWarning, updateSuccess]

    // Hide all warnings
    warnings.map((warning) => {warning.addClass("is-hidden");});

    switch (warning) {
        case "update":
            updateWarning.removeClass("is-hidden");
            break;
        case "api":
            apiWarning.removeClass("is-hidden");
            break;
        case "success":
            updateSuccess.removeClass("is-hidden");
            break;
        default:
            break;
    }
    modal.addClass("is-active");
    updateButton.removeClass("is-loading");
    setLastUpdateTime();
};

// Execute a blacklist update with diffs
const updateWithDiffs = (url) => {
    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            chrome.runtime.sendMessage({
                message: "update-diff",
                insertions: data.insertions,
                deletions: data.deletions,
                APICheckpoint: data.checkpoint,
            }, function(response) {
                if (response.success) {
                    updateButton.removeClass("is-loading");
                    showWarning("success");
                }
            });
        }).catch((_) => {
            showWarning("api");
        });
};

// Execute a total blacklist update
const updateWithoutDiffs = (url) => {
    fetch(url)
        .then((response) => response.json())
        .then((data) => {
            chrome.runtime.sendMessage({
                message: "update",
                data: data,
            }, function(response) {
                if (response.success) {
                    updateButton.removeClass("is-loading");
                    showWarning("success");
                }
            });
        }).catch((_err) => {
            showWarning("api");
        });
};

// Update the blacklist
const updateBlacklist = () => {
    const current = Date.now();

    updateButton.addClass("is-loading");

    chrome.storage.local.get(["api", "APICheckpoint"], (data) => {
        // Default Values
        var fetchURL = new URL(`${data.api}/list/get/`);
        var lastAPIUpdateURL = new URL(`${data.api}/list/last-checkpoint/`);

        // Get last API Update
        fetch(lastAPIUpdateURL)
            .then((res) => res.json())
            .then((json) => json.checkpoint)
            .then((APICheckpoint) => {
                // If we have the most recent list version, don't update.
                if (APICheckpoint <= data.APICheckpoint) {
                    showWarning("update");
                } else {
                    // If it's the first time updating, download the whole list,
                    // otherwise, download diffs.
                    if (data.APICheckpoint == 0) {
                        updateWithoutDiffs(fetchURL.href);
                    } else {
                        fetchURL.searchParams.append("checkpoint", data.APICheckpoint);
                        updateWithDiffs(fetchURL.href);
                    }
                }
            })
            .catch((_) => {
                showWarning("api");
            });

        // Set the last update attempt value and remove button loading
        lastUpdateElem.html(utils.elapsedTimeToString(current));
    });
};

// Get extension state (ON/OFF)
chrome.storage.local.get("enabled", (data) => {
    enabled = data.enabled;
    powerButtonText.text(enabled ? "ON" : "OFF");

    if (enabled) {
        u(powerButton).toggleClass('is-danger is-success');
    }
});

// If authorized, enable labelling
chrome.storage.local.get(["contributor"], (data) => {
    if (data.contributor == true) {
        u(labellingForm).removeClass("is-hidden");
        chrome.tabs.query({ currentWindow: true, active: true }, function(tab) {
            u(labellingDomain).attr("value", utils.getCurrentDomain(tab[0].url));
        });
    }
});

// Show elapsed time since last update
chrome.storage.local.get(["localCheckpoint"], (data) => {
    if (data.hasOwnProperty("localCheckpoint")) {
        lastUpdateElem.html(utils.elapsedTimeToString(data.localCheckpoint));
    } else {
        lastUpdateElem.html("never");
    }
});

// Display whitelist button based on current page's status
chrome.tabs.query({ currentWindow: true, active: true }, function(tab) {
    let status = utils.domainInWhitelist(tab[0].url);
    status.then((status) => {
        if (status === true) {
            whitelistButton.toggleClass(["is-info", "is-danger"]);
            whitelistButton.html(utils.whitelistedHTML);
            feather.replace();
        }
    });
});

// Custom redirect for labelling form.
// Passes domain to the form.
u("form").handle("submit", (_event) => {
    const domain = u(labellingDomain).first().value;
    const labelling_url = chrome.runtime.getURL("src/labelling.html")
        .concat(`?domain=${domain}`);
    window.open(labelling_url, "_blank");
});

// Add button listeners
powerButton.on("click", toggleExtension);
updateButton.on("click", updateBlacklist);
whitelistButton.on("click", () => {
    utils.toggleDomainWhitelist(true);
});
settingsButton.on("click", function() {
    if (chrome.runtime.openOptionsPage) {
        chrome.runtime.openOptionsPage();
    } else {
        window.open(chrome.runtime.getURL("src/options.html"));
    }
});

// Add a click event on various child elements to close the modal
// Also hide all children when modal closes
(document.querySelectorAll(
    ".modal-background, .modal-close, .modal-card-head .delete, .modal-card-foot .button",
) || []).forEach(($close) => {
    const $target = $close.closest(".modal");

    $close.addEventListener("click", () => {
        $target.classList.remove("is-active");
    });
});

// Add listener to receive messages from background page
chrome.runtime.onMessage.addListener(function(request) {
    switch (request.result) {
        case "success":
            updateButton.classList.remove("is-loading");
            break;
        default:
            break;
    }
});

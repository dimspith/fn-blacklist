'use strict';

const bg = chrome.extension.getBackgroundPage();

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

// Taken from uBlock Origin's code
const elapsedTimeToString = (timestamp) => {
    let value = (Date.now() - timestamp) / 60000;

    if (value < 2) {
        return ('Less than a minute ago');
    }
    if (value < 60) {
        return ('Many minutes ago');
    }
    value /= 60;
    if (value < 2) {
        return ('An hour ago');
    }
    if (value < 24) {
        return ('Many hours ago');
    }
    value /= 24;
    if (value < 2) {
        return ('One day ago');
    }
    return ('Many days ago');
};

const getQueryStringParams = (params, url) => {
    // first decode URL to get readable data
    var href = decodeURIComponent(url);
    // regular expression to get value
    var regEx = new RegExp('[?&]' + params + '=([^&#]*)', 'i');
    var value = regEx.exec(href);
    // return the value if it exists
    return value ? value[1] : null;
};

const getCurrentDomain = (url) => {
    if (url.startsWith(chrome.runtime.getURL(""))) {
        const domain = new URL(getQueryStringParams('blocked-page', url)).hostname.replace('www.', '');
        if(domain != null) {
            console.log("Domain: " + domain);
            return domain;
        } else {
            return "";
        }
    } else {
        return new URL(url).hostname.replace('www.', '');
    }
};

const siteInWhitelist = async (url) => {
    return new Promise(resolve => {
        chrome.storage.local.get('whitelist', (data) => {
            let whitelist = data.whitelist;
            if (!data.hasOwnProperty('whitelist')) {
                resolve(false);
            } else if (whitelist.includes(getCurrentDomain(url))) {
                resolve(true);
            } else {
                resolve(false);
            }
        });
    });
};

// Toggles whitelist status on current page.
// Argument specifies whether this function is called in the popup.
const togglePageWhitelist = (isPopup) => {
    chrome.storage.local.get(['whitelist'], (data) => {
        chrome.tabs.query({ currentWindow: true, active: true }, function(tab) {
            const blockedURL = getCurrentDomain(tab[0].url);
            var whitelist = data.whitelist;

            if (!whitelist.includes(blockedURL)) {
                console.log("NOT WHITELISTED");
                if(isPopup) {
                    whitelistButton.classList.replace('is-info', 'is-danger');
                    whitelistButton.innerHTML = whitelistedHTML;                    
                }
                whitelist.push(blockedURL);
                console.log("Url: " + blockedURL);
                console.log("Whitelist: " + whitelist);
                chrome.storage.local.set({ 'whitelist': whitelist });
            } else {
                console.log("WHITELISTED");
                if(isPopup) {
                    whitelistButton.classList.replace('is-danger', 'is-info');
                    whitelistButton.innerHTML = notWhitelistedHTML;                    
                }
                whitelist.splice(whitelist.indexOf(blockedURL), 1);
                chrome.storage.local.set({ 'whitelist': whitelist });
            }
            feather.replace();
        });
    });
};

export {
    whitelistedHTML,
    notWhitelistedHTML,
    elapsedTimeToString,
    getQueryStringParams,
    getCurrentDomain,
    siteInWhitelist,
    togglePageWhitelist
};

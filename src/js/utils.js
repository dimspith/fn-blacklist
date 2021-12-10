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
    let domain = new URL(url).hostname.replace('www.', '');
    if (url.startsWith("chrome-extension://" + window.document.domain)) {
        return new URL(getQueryStringParams('blocked-page', url)).hostname.replace('www.', '');
    } else {
        return domain;
    }
};

const siteInWhitelist = async (url) => {
    return new Promise(resolve => {
        chrome.storage.local.get('whitelist', (data) => {
            let whitelist = data.whitelist;
            if (typeof (whitelist) == "undefined" || Object.entries(whitelist).length === 0) {
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
            var urls = data.whitelist;
            if (Object.entries(urls).length === 0) {
                if(isPopup) {
                    whitelistButton.classList.replace('is-info', 'is-danger');
                    whitelistButton.innerHTML = whitelistedHTML;                    
                }
                chrome.storage.local.set({ 'whitelist': [blockedURL] });
            } else if (!urls.includes(blockedURL)) {
                if(isPopup) {
                    whitelistButton.classList.replace('is-info', 'is-danger');
                    whitelistButton.innerHTML = whitelistedHTML;                    
                }
                urls.push(blockedURL);
                chrome.storage.local.set({ 'whitelist': urls });
            } else {
                if(isPopup) {
                    whitelistButton.classList.replace('is-danger', 'is-info');
                    whitelistButton.innerHTML = notWhitelistedHTML;                    
                }
                urls.splice(urls.indexOf(blockedURL), 1);
                chrome.storage.local.set({ 'whitelist': urls });
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

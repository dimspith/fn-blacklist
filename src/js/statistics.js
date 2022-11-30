'use strict';

const whitelist = u(".whitelist-list");
const blacklist = u(".blacklist-list");
const whitelistSize = u(".whitelist-size");
const blacklistSize = u(".blacklist-size");

const getWhitelistHTML = (domain) => {
    return `
<span class="is-size-6 whitelist-elem tag is-white column is-full">
    <a href="http://${domain}" target="_blank" class="whitelist-domain">${domain}</a>
    <button class="whitelist-delete ml-auto delete"></button>
</span>`;
};

const getBlacklistHTML = (domain) => {
    return `
<span class="is-size-6 blacklist-elem tag is-white column is-full">
    <a href="http://${domain}" target="_blank" class="mr-auto">${domain}</a>
</span>`;
};

const activateDeleteButtons = () => {
    u(".whitelist-delete").on('click', function() {
        const domain = u(this).parent().find(".whitelist-domain").text();
        const parent = u(this).parent();
        chrome.runtime.sendMessage({
            message: "toggle-whitelist",
            domain: domain
        });
        parent.remove();
        u(whitelistSize).text(parseInt((whitelistSize).text()) - 1);
    });    
};

const addDomainToWhitelist = (domain) => {
    chrome.runtime.sendMessage({
        message: "toggle-whitelist",
        domain: domain
    });
    u(whitelist).append(getWhitelistHTML(domain));
    u(whitelistSize).text(parseInt((whitelistSize).text()) + 1);    
    activateDeleteButtons();
};

chrome.storage.local.get(['whitelist', 'urls'], data => {
    if (data.hasOwnProperty('whitelist')) {

        // Add whitelisted domains in the UI with buttons to delete each one
        data.whitelist.forEach((domain) => {
            u(whitelist).append(getWhitelistHTML(domain));
        });

        // Add blacklisted domains in the UI
        data.urls.slice(0, 100).forEach((domain) => {
            u(blacklist).append(getBlacklistHTML(domain));
        });

        document.getElementById("delete-all").disabled = false;
        activateDeleteButtons();

        // Add whitelist and blacklist counts
        if(data.whitelist) {
            u(whitelistSize).text(data.whitelist.length);
        }
        if(data.urls) {
            u(blacklistSize).text(data.urls.length);        
        }
    }
});

u("#delete-all").on('click', () => {
    chrome.storage.local.set({ 'whitelist': [] });
    u(whitelist).html("");
});

u(".add-to-whitelist").on('click', () => {
    const domain = u(".whitelist-domain-input").first().value;
    addDomainToWhitelist(domain);
});

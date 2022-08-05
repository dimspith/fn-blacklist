'use strict';

const whitelist = u(".whitelist-list");
const blacklist = u(".blacklist-list");
const whitelistSize = u(".whitelist-size");
const blacklistSize = u(".blacklist-size");

const getWhitelistHTML = (domain) => {
    return `
<span class="is-size-6 whitelist-elem tag is-white column is-full">
    <a href="${domain}" target="_blank" class="whitelist-domain">${domain}</a>
    <button class="whitelist-delete ml-auto delete"></button>
</span>`;
};

const getBlacklistHTML = (domain) => {
    return `
<span class="is-size-6 blacklist-elem tag is-white column is-full">
    <a href="${domain}" target="_blank" class="mr-auto">${domain}</a>
</span>`;
};

chrome.storage.local.get(['whitelist', 'urls'], data => {
    if (data.hasOwnProperty('whitelist')) {

        // Add whitelisted domains in the UI with buttons to delete each one
        data.whitelist.forEach((domain) => {
            u(whitelist).append(getWhitelistHTML(domain));
        });

        // Add blacklisted domains in the UI
        data.urls.forEach((domain) => {
            u(blacklist).append(getBlacklistHTML(domain));
        });

        document.getElementById("delete-all").disabled = false;

        u(".whitelist-delete").on('click', function() {
            const domain = u(this).parent().find(".whitelist-domain").text();
            const parent = u(this).parent();
            chrome.runtime.sendMessage({
                message: "toggle-whitelist",
                domain: domain
            });
            parent.remove();
        });

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


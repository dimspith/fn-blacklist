'use strict';

const whitelist = u(".whitelist-list");
const whitelistSize = u(".whitelist-size");
const blacklistSize = u(".blacklist-size");

const getWhitelistHTML = (domain) => {
    return `
<span class="whitelist-elem tag column is-full">
    <div class="whitelist-site">${domain}</div>
    <button class="whitelist-delete ml-auto delete"></button>
</span>`;
};

chrome.storage.local.get(['whitelist', 'urls'], data => {
    if (data.hasOwnProperty('whitelist')) {

        // Add whitelisted sites in the UI with buttons to delete each one
        data.whitelist.forEach((domain) => {
            u(whitelist).append(getWhitelistHTML(domain));
        });
        document.getElementById("delete-all").disabled = false;

        u(".whitelist-delete").on('click', function() {
            const domain = u(this).parent().find(".whitelist-site").text();
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


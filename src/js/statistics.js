'use strict';

const whitelist = u(".whitelist-list");
const whitelistSize = u(".whitelist-size");
const blacklistSize = u(".blacklist-size");

const getWhitelistHTML = (site) => {
    return `
<span class="whitelist-elem tag column is-full">
    <div class="whitelist-site">${site}</div>
    <button class="whitelist-delete ml-auto delete"></button>
</span>`;
};

chrome.storage.local.get(['whitelist', 'urls'], data => {
    if(data.hasOwnProperty('whitelist')) {

        // Add whitelisted sites in the UI with buttons to delete each one
        data.whitelist.forEach((site) => {
            u(whitelist).append(getWhitelistHTML(site));
        });
        document.getElementById("delete-all").disabled = false;
        
        u(".whitelist-delete").on('click', function() {
            const site = u(this).parent().find(".whitelist-site").text();
            const parent = u(this).parent();
            console.log(site);
            chrome.storage.local.get(['whitelist'], (data) => {
                var urls = data.whitelist;
                urls.splice(urls.indexOf(), 1);
                chrome.storage.local.set({'whitelist': urls});
            });
            parent.remove();
        });

        // Add whitelist and blacklist counts
        u(whitelistSize).text(data.whitelist.length);
        u(blacklistSize).text(data.urls.length);
        
    }
});

u("#delete-all").on('click', () => {
    chrome.storage.local.set({'whitelist': []});
    u(whitelist).html("");
});


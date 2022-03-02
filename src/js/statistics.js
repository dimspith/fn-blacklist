'use strict';

const whitelist = u(".whitelist-list");

const getWhitelistHTML = (site) => {
    return `
<span class="whitelist-elem tag column is-full">
    <div class="whitelist-site">${site}</div>
    <button class="whitelist-delete ml-auto delete"></button>
</span>`;
};

chrome.storage.local.get(['whitelist'], data => {
    if(data.hasOwnProperty('whitelist')) {
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
    }
});

u("#delete-all").on('click', () => {
    chrome.storage.local.set({'whitelist': []});
    u(whitelist).html("");
});


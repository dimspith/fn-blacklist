'use strict';

import { toggleDomainWhitelist } from "./utils.js";

// const blockedPage = document.getElementById("blockedPage");
// const backButton = document.getElementById("backButton");
// const goButton = document.getElementById("whitelistAndGoButton");

const blockedDomain = u("#blockedDomain");
const backButton = u("#backButton");
const whitelistButton = u("#whitelistButton");

const urlParams = new URLSearchParams(window.location.search);
const blockedURL = urlParams.get('blocked-domain');
const domain = (new URL(blockedURL)).hostname.replace('www.', '');

// Whitelist domain and visit it
const whitelistDomainAndGo = function() {
    toggleDomainWhitelist(false);
    window.location.replace(blockedURL);
};

// Add blocked url to page
blockedDomain.text(domain);

// Go to the previous page in history
backButton.on('click', function() {
    window.history.go(-2);
});

whitelistButton.on('click', whitelistDomainAndGo);

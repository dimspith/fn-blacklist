'use strict';

import {togglePageWhitelist} from "./utils.js";

document.addEventListener("DOMContentLoaded", function () {
    const blockedPage = document.getElementById("blockedPage");
    const backButton = document.getElementById("backButton");
    const goButton = document.getElementById("whitelistAndGoButton");

    const urlParams = new URLSearchParams(window.location.search);
    let blockedURL = urlParams.get('blocked-page');
    let domain = (new URL(blockedURL)).hostname;

    const whitelistSiteAndGo = () => {
        togglePageWhitelist(false);
        window.location.href = blockedURL;
    };
    
    // Add blocked url to page
    blockedPage.innerHTML = domain;

    // Go to the previous site when pressing "Go Back"
    backButton.addEventListener("click", () => {window.history.go(-2);});

    goButton.addEventListener("click", whitelistSiteAndGo);
});

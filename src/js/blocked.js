'use strict';

document.addEventListener("DOMContentLoaded", function () {
    const blockedPage = document.getElementById("blocked-page");
    const continueButton = document.getElementById("continue-button");

    const urlParams = new URLSearchParams(window.location.search);
    let blockedURL = urlParams.get('blocked-page');

    // Add blocked url to page
    blockedPage.innerHTML = blockedURL;

    // Proceed to site when pressing continue
    continueButton.href = blockedURL;
});

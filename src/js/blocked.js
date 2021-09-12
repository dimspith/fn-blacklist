document.addEventListener("DOMContentLoaded", function () {
    const blockedPage = document.getElementById("blocked-page");
    const urlParams = new URLSearchParams(window.location.search);
    const url = urlParams.get('blocked-page');
    blockedPage.innerHTML = url;
});

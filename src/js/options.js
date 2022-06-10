'use strict';

// Set the correct iframe page and active navbar item
const navigateToPage = () => {
    const hash = window.location.hash;
    if (hash.length == 0) {
        u('#contents').attr({ src: getURLFromHash('#settings') });
    } else {
        u('#contents').attr({ src: getURLFromHash(hash) });
        u('.tabs li').removeClass('is-active');
        u(`[href="${hash}"]`).parent().addClass('is-active');
    }
};

// Get an internal url from a url hash
const getURLFromHash = (hash) => {
    return chrome.runtime.getURL('src/' + hash.replace('#', '') + '.html');
};

// Add navbar listeners to change pages
const addNavListeners = () => {
    const navItems = u('.tabs li');

    navItems.map((node) => {

        u(node).on('click', () => {
            const navLink = u(node).children('a:first-child');
            const sourceFile = u(navLink).attr('href').replace('#', '');
            const sourceFileURL = chrome.runtime.getURL('src/' + sourceFile + '.html');
            u('#contents').attr({ src: sourceFileURL });

            navItems.map((node) => {
                if (u(node).hasClass('is-active')) {
                    u(node).removeClass('is-active');
                }
            });

            u(node).addClass('is-active');

        });
    });
};

addNavListeners();
navigateToPage();

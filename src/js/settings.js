'use strict';

const customAPI = u('.updates_custom-api');
const customAPISubmit = u('.updates_custom-api-submit');
const token = u('.labelling_token');
const tokenSubmit = u('.labelling_token-submit');
const contributor = u('.labelling_contributor');
const tokenForm = u('.labelling_token-form');
const resetButton = u('.actions_reset');
const redownloadButton = u('.actions_re-download');

// Configure toast
bulmaToast.setDefaults({
    duration: 3000,
    position: 'top-center',
    closeOnClick: true,
    dismissible: true
});

// Get relevant settings from localstorage
const getSettings = () => {
    chrome.storage.local.get(['api'], data => {
        u(customAPI).attr('value', data.api);
    });
    
    chrome.storage.local.get(['token'], data => {
        u(token).attr('value', data.token);
    });

    chrome.storage.local.get(['contributor'], data => {
        if(data.contributor == true) {
            u(tokenForm).removeClass('is-hidden');
            document.querySelector('.labelling_contributor').checked=true;
        }
    });

};

// Add listeners to elements
const addListeners = () => {
    u(customAPISubmit).on('click', () => {
        chrome.runtime.sendMessage({
            message: "set-api",
            value: u(customAPI).first().value
        });
        bulmaToast.toast({ message: 'API URL submitted successfully!', type: 'is-success' });
    });

    u(tokenSubmit).on('click', () => {
        chrome.runtime.sendMessage({
            message: "set-token",
            value: u(token).first().value
        });
        bulmaToast.toast({ message: 'Token submitted successfully!', type: 'is-success' });
    });

    u(contributor).on('click', () => {
        if(u(contributor).is(':checked')) {
            u(tokenForm).removeClass('is-hidden');
            chrome.runtime.sendMessage({message: "set-contributor",
                                        value: true});
        } else {
            u(tokenForm).addClass('is-hidden');
            chrome.runtime.sendMessage({message: "set-contributor",
                                        value: false});
        }
    });

    // Reset the extension
    u(resetButton).on('click', () => {
        chrome.runtime.sendMessage({message: "reset"});
        bulmaToast.toast({ message: 'Extension was reset successfully!', type: 'is-success' });
    });

};

// Prevent all forms from redirecting
u('form').on('submit', (event) => {
    event.preventDefault();
});

addListeners();
getSettings();

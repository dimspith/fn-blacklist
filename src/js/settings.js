'use strict';

const customAPI = u('.updates_custom-api');
const customAPISubmit = u('.updates_custom-api-submit');
const token = u('.advanced_token');
const tokenSubmit = u('.advanced_token-submit');


const getAPIURL = () => {
    chrome.storage.local.get(['api'], data => {
        u(customAPI).attr('value', data.api);
    });
};

const getToken = () => {
    chrome.storage.local.get(['token'], data => {
        u(token).attr('value', data.token);
    });
};

const addListeners = () => {
    u(customAPISubmit).on('click', () => {
        chrome.runtime.sendMessage({
            message: "set-api",
            value: u(customAPI).first().value
        });
    });

    u(tokenSubmit).on('click', () => {
        chrome.runtime.sendMessage({
            message: "set-token",
            value: u(token).first().value
        });
    });
};

// Prevent all forms from redirecting
u('form').on('submit', (event) => {
    event.preventDefault();
});

addListeners();
getAPIURL();
getToken();

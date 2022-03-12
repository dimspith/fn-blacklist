'use strict';

const getAPIURL = () => {
    chrome.storage.local.get(['api'], data => {
        u('.custom-api').attr('value', data.api);
    });
};

const addListeners = () => {
    u('.custom-api-submit').on('click', () => {
        console.log(u('.custom-api').first().value);
        chrome.runtime.sendMessage({
            message: "set-api",
            value: u('.custom-api').first().value
        });
    });
};

getAPIURL();
addListeners();

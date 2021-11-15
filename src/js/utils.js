'use strict';

// Taken from uBlock Origin's code
const elapsedTimeToString = (timestamp) => {
    let value = (Date.now() - timestamp) / 60000;

    if (value < 2 ) {
        return('Less than a minute ago');
    }
    if (value < 60) {
        return('Many minutes ago');
    }
    value /= 60;
    if (value < 2) {
        return('An hour ago');
    }
    if (value < 24) {
        return('Many hours ago');
    }
    value /= 24;
    if (value < 2) {
        return('One day ago');
    }
    return('Many days ago');
};

export { elapsedTimeToString };

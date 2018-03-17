const path = require('path');

export const config = {
    dev: false,
    icon: path.join(__dirname, '../favicon.ico'),
    url: {
        pathname: path.join(__dirname, '../index.html'),
        protocol: 'file:',
        slashes: true
    }
};
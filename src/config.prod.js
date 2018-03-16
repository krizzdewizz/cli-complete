// @ts-check
const path = require('path');

module.exports = {
    dev: false,
    icon: path.join(__dirname, 'favicon.ico'),
    url: {
        pathname: path.join(__dirname, 'index.html'),
        protocol: 'file:',
        slashes: true
    }
}
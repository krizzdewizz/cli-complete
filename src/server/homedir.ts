// references

// copied from homedir module which could not be used with systemjs

const path = require('path');
const home = process.env[(process.platform === 'win32') ? 'USERPROFILE' : 'HOME'];

export function homedir(username?) {
  return username ? path.resolve(path.dirname(home), username) : home;
}


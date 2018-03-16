//@ts-check
const fs = require('fs')

const pack = require('./package.json');
const prodPack = {
    main: 'electron.js'
};

['name', 'version', 'license', 'productName', 'description'].forEach(name => prodPack[name] = pack[name]);

fs.writeFileSync('dist/package.json', JSON.stringify(prodPack));
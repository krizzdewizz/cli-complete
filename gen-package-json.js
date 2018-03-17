//@ts-check
const fs = require('fs')

const pack = require('./package.json');
const prodPackTemplate = require('./src/package.json');
const prodPack = {
    main: prodPackTemplate.main
};

['name', 'version', 'license', 'productName', 'description'].forEach(name => prodPack[name] = pack[name]);

fs.writeFileSync('dist/package.json', JSON.stringify(prodPack));
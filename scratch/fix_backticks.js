const fs = require('fs');
let c = fs.readFileSync('public/js/main.js', 'utf8');
c = c.replace(/\\\`/g, '`');
c = c.replace(/\\\\'/g, "\\'");
fs.writeFileSync('public/js/main.js', c);

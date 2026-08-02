const fs = require('fs');

let css = fs.readFileSync('public/css/style.css', 'utf8');

// 1. cart-overlay
css = css.replace(
  '    backdrop-filter: blur(4px);\r\n    z-index: 1000;', 
  '    backdrop-filter: blur(4px);\r\n    z-index: 10000;'
);
css = css.replace(
  '    backdrop-filter: blur(4px);\n    z-index: 1000;', 
  '    backdrop-filter: blur(4px);\n    z-index: 10000;'
);

// 2. cart-drawer
css = css.replace(
  '    backdrop-filter: blur(20px);\r\n    z-index: 1005;', 
  '    backdrop-filter: blur(20px);\r\n    z-index: 10005;'
);
css = css.replace(
  '    backdrop-filter: blur(20px);\n    z-index: 1005;', 
  '    backdrop-filter: blur(20px);\n    z-index: 10005;'
);

// 3. mobile-nav-overlay
css = css.replace(
  '    background-color: rgba(0, 0, 0, 0.4);\r\n    z-index: 1095;', 
  '    background-color: rgba(0, 0, 0, 0.4);\r\n    z-index: 10000;'
);
css = css.replace(
  '    background-color: rgba(0, 0, 0, 0.4);\n    z-index: 1095;', 
  '    background-color: rgba(0, 0, 0, 0.4);\n    z-index: 10000;'
);

// 4. mobile-nav
css = css.replace(
  '    background-color: var(--color-bg-card);\r\n    z-index: 1100;', 
  '    background-color: var(--color-bg-card);\r\n    z-index: 10005;'
);
css = css.replace(
  '    background-color: var(--color-bg-card);\n    z-index: 1100;', 
  '    background-color: var(--color-bg-card);\n    z-index: 10005;'
);

fs.writeFileSync('public/css/style.css', css);
console.log('Fixed z-indices.');

const fs = require('fs');
const lines = fs.readFileSync('public/products.html', 'utf8').split(/\r?\n/);

// Find the index of line 152 (0-indexed it is 151)
// We want to keep lines 0 to 151.
// And we want to keep lines starting from 311 (which is index 310 in the array).
// But we also need to insert the missing lines between them.

const newLines = [
  ...lines.slice(0, 152),
  '            <line x1="4" y1="6" x2="20" y2="6" />',
  '            <line x1="4" y1="18" x2="20" y2="18" />',
  '          </svg>',
  '        </button>',
  '      </div>',
  '    </div>',
  '  </header>',
  ...lines.slice(311)
];

fs.writeFileSync('public/products.html', newLines.join('\n'));
console.log('Fixed products.html');

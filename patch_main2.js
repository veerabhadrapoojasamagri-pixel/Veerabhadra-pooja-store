const fs = require('fs');
let content = fs.readFileSync('public/js/main.js', 'utf8');

const targetStr = `          <ul class="amazon-desc-list">
            \${item.description ? item.description.split('\\n').filter(l=>l.trim()).map(line => \`<li>\${line}</li>\`).join('') : \`<li>Premium quality traditional pooja item</li><li>Perfect for your sacred space and rituals</li><li>Carefully packed and delivered securely</li>\`}
          </ul>
        </div>`;

const replacementStr = `          <ul class="amazon-desc-list">
            \${item.description ? item.description.split('\\n').filter(l=>l.trim()).map(line => \`<li>\${line}</li>\`).join('') : \`<li>Premium quality traditional pooja item</li><li>Perfect for your sacred space and rituals</li><li>Carefully packed and delivered securely</li>\`}
          </ul>
          \${item.includedItems ? \`
          <h3 style="margin-top: 1.5rem;">Items included in this kit</h3>
          <ul class="amazon-desc-list">
            \${item.includedItems.split('\\n').filter(l=>l.trim()).map(line => \`<li>\${line}</li>\`).join('')}
          </ul>
          \` : ''}
        </div>`;

content = content.replace(targetStr, replacementStr);
fs.writeFileSync('public/js/main.js', content, 'utf8');
console.log('Done!');

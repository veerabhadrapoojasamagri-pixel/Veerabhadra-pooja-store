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
            <h4 style="margin-top: 1.5rem; margin-bottom: 0.5rem; font-size: 1.1rem; color: #0f1111;">Items included in this kit</h4>
            <ul class="amazon-desc-list" style="margin-bottom: 0;">
              \${item.includedItems.split('\\n').filter(l=>l.trim()).map(line => \`<li>\${line}</li>\`).join('')}
            </ul>
          \` : ''}
        </div>`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync('public/js/main.js', content, 'utf8');
  console.log('Successfully patched main.js');
} else {
  console.log('Could not find target string in main.js');
}

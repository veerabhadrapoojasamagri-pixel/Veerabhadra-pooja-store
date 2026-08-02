const fs = require('fs');
const path = require('path');

const publicDir = 'public';
const htmlFiles = fs.readdirSync(publicDir).filter(f => f.endsWith('.html'));

htmlFiles.forEach(file => {
  const filePath = path.join(publicDir, file);
  let content = fs.readFileSync(filePath, 'utf8');
  if (content.includes('Order on WhatsApp (Free Delivery)')) {
    content = content.replace(/Order on WhatsApp \(Free Delivery\)/g, 'Order on WhatsApp');
    fs.writeFileSync(filePath, content);
    console.log(`Updated ${file}`);
  }
});
console.log('Done.');

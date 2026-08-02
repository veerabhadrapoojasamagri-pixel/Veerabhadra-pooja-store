const fs = require('fs');

const replacement = `function renderSingleProductPage() {
  const container = document.getElementById('single-product-dynamic-container');
  if (!container) return; // Only runs on product.html
  
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  
  if (!productId) {
    container.innerHTML = \\\`<div style="text-align:center; padding: 4rem 2rem;"><h2>Product Not Found</h2><a href="/products" class="btn btn-primary" style="margin-top:1rem;">Back to Products</a></div>\\\`;
    return;
  }
  
  const item = globalProducts.find(p => p.id === productId);
  if (!item) {
    container.innerHTML = \\\`<div style="text-align:center; padding: 4rem 2rem;"><h2>Product Not Found</h2><a href="/products" class="btn btn-primary" style="margin-top:1rem;">Back to Products</a></div>\\\`;
    return;
  }
  
  const discount = item.mrp && item.price && item.mrp > item.price
    ? Math.round(((item.mrp - item.price) / item.mrp) * 100)
    : 0;
  const saveAmt = item.mrp && item.price ? item.mrp - item.price : 0;
  const categoryLabel = CATEGORY_META[item.category]?.label || (item.category || 'Products').replace(/-/g, ' ').replace(/\\b\\w/g, c => c.toUpperCase());
  const safeName = item.name.replace(/'/g, "\\\\'");
  const isOOS = !!item.outOfStock;

  container.innerHTML = \\\`
    <div class="amazon-product-container" itemscope itemtype="https://schema.org/Product">
      
      <!-- LEFT: Image Box -->
      <div class="amazon-image-col">
        \${discount > 0 && !isOOS ? \\\`<span class="amazon-discount-badge">\${discount}% OFF</span>\\\` : ''}
        \${isOOS ? \\\`<div class="amazon-oos-overlay"><span>Out of Stock</span></div>\\\` : ''}
        <img src="\${item.image || 'images/brass-diya.png'}" alt="\${item.name}" class="amazon-main-image" style="\${isOOS ? 'opacity:0.5;filter:grayscale(40%);' : ''}" itemprop="image">
      </div>
      
      <!-- MIDDLE: Product Info -->
      <div class="amazon-info-col">
        <h1 class="amazon-title" itemprop="name">\${item.name}</h1>
        <div class="amazon-brand">Visit the Veerabhadra Store</div>
        
        <div class="amazon-rating-row">
          <span class="amazon-stars">4.8 <span class="amazon-stars-visual">★★★★★</span></span>
          <span class="amazon-rating-count">1,244 ratings</span>
        </div>
        
        <div class="amazon-divider"></div>
        
        <div class="amazon-price-block" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
          \${discount > 0 
            ? \\\`<div class="amazon-discount-row"><span class="amazon-discount-pct">-\${discount}%</span> <span class="amazon-price">₹\${item.price}</span></div>\\\` 
            : \\\`<div class="amazon-price">₹\${item.price}</div>\\\`}
          <meta itemprop="price" content="\${item.price}" />
          <meta itemprop="priceCurrency" content="INR" />
          
          \${item.mrp && item.mrp > item.price ? \\\`<div class="amazon-mrp">M.R.P.: <span>₹\${item.mrp}</span></div>\\\` : ''}
          <div class="amazon-taxes">Inclusive of all taxes</div>
        </div>
        
        <div class="amazon-divider"></div>
        
        <div class="amazon-offers">
          <div class="amazon-offers-title">Offers</div>
          <div class="amazon-offers-grid">
            <div class="amazon-offer-box">
              <strong>Cashback</strong>
              <p>Up to ₹50 on Amazon Pay...</p>
            </div>
            <div class="amazon-offer-box">
              <strong>Bank Offer</strong>
              <p>Upto ₹100 discount on Credit Cards...</p>
            </div>
          </div>
        </div>
        
        <div class="amazon-divider"></div>
        
        <div class="amazon-desc-block">
          <h3>About this item</h3>
          <ul class="amazon-desc-list">
            \${item.description ? item.description.split('\\n').filter(l=>l.trim()).map(line => \\\`<li>\${line}</li>\\\`).join('') : \\\`<li>Premium quality traditional pooja item</li><li>Perfect for your sacred space and rituals</li><li>Carefully packed and delivered securely</li>\\\`}
          </ul>
        </div>
      </div>
      
      <!-- RIGHT: Buy Box -->
      <div class="amazon-buy-box">
        <div class="amazon-buy-price">₹\${item.price}</div>
        <div class="amazon-delivery">FREE delivery <strong>Tomorrow</strong> on your first order.</div>
        
        \${isOOS 
          ? \\\`<h3 class="amazon-stock-status" style="color:#B12704;">Temporarily out of stock.</h3>\\\` 
          : \\\`<h3 class="amazon-stock-status">In stock</h3>\\\`}
        
        \${!isOOS ? \\\`<div class="amazon-qty">
          <label for="buyQty">Quantity: </label>
          <select id="buyQty" class="amazon-qty-select">
            <option>1</option><option>2</option><option>3</option><option>4</option>
          </select>
        </div>\\\` : ''}
        
        <div class="amazon-buy-actions">
          \${isOOS 
            ? \\\`<button class="amazon-btn amazon-btn-notify" onclick="subscribeStockNotification('\${item.id}', '\${safeName}')">Notify Me When Available</button>\\\`
            : \\\`<button class="amazon-btn amazon-btn-cart add-to-cart-btn" data-id="\${item.id}" data-name="\${item.name}" data-price="\${item.price}" data-image="\${item.image || 'images/brass-diya.png'}">Add to cart</button>
               <button class="amazon-btn amazon-btn-buy" onclick="orderDirect('\${safeName}', \${item.price})">Buy Now</button>\\\`
          }
        </div>
        
        <div class="amazon-ships-from">
          <table>
            <tr><td>Ships from</td><td>Veerabhadra Store</td></tr>
            <tr><td>Sold by</td><td>Veerabhadra Store</td></tr>
            <tr><td>Payment</td><td>Secure transaction</td></tr>
          </table>
        </div>
      </div>
      
    </div>
  \\\`;
  
  // Update document title for SEO
  document.title = \\\`\${item.name} | Veerabhadra Pooja Store\\\`;

  // Render related products
  const relatedSection = document.getElementById('relatedProductsSection');
  const relatedContainer = document.getElementById('related-products-container');
  if (relatedSection && relatedContainer) {
    const relatedItems = globalProducts.filter(p => p.category === item.category && p.id !== item.id && p.type === 'sale').slice(0, 4);
    if (relatedItems.length > 0) {
      relatedContainer.innerHTML = relatedItems.map(buildProductCardHtml).join('');
      relatedSection.style.display = 'block';
    }
  }

  // Re-attach cart button event listeners after dynamic render
  bindAddToCartButtons();
}`;

let content = fs.readFileSync('public/js/main.js', 'utf8');

// Find the start and end of the current renderSingleProductPage
const startIdx = content.indexOf('function renderSingleProductPage() {');
if (startIdx === -1) {
  console.error("Could not find function");
  process.exit(1);
}

// Find the end by looking for the next function or the end of the file
// The old function ends right before "function bindAddToCartButtons()" or similar if it's there.
// Actually, I can just replace from startIdx to the end of the file since it's the last function in main.js right now.
// Let's check if it's the last thing.
const endIdx = content.indexOf('function bindAddToCartButtons()', startIdx);
if (endIdx !== -1) {
  // Replace only the function
  content = content.substring(0, startIdx) + replacement + '\n\n' + content.substring(endIdx);
} else {
  // It's the end of the file
  content = content.substring(0, startIdx) + replacement;
}

fs.writeFileSync('public/js/main.js', content);
console.log('Successfully replaced renderSingleProductPage');

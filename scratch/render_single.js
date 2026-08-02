function renderSingleProductPage() {
  const container = document.getElementById('single-product-dynamic-container');
  if (!container) return; // Only runs on product.html
  
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  
  if (!productId) {
    container.innerHTML = `<div style="text-align:center; padding: 4rem 2rem;"><h2>Product Not Found</h2><a href="/products" class="btn btn-primary" style="margin-top:1rem;">Back to Products</a></div>`;
    return;
  }
  
  const item = globalProducts.find(p => p.id === productId);
  if (!item) {
    container.innerHTML = `<div style="text-align:center; padding: 4rem 2rem;"><h2>Product Not Found</h2><a href="/products" class="btn btn-primary" style="margin-top:1rem;">Back to Products</a></div>`;
    return;
  }
  
  const discount = item.mrp && item.price && item.mrp > item.price
    ? Math.round(((item.mrp - item.price) / item.mrp) * 100)
    : 0;
  const saveAmt = item.mrp && item.price ? item.mrp - item.price : 0;
  const categoryLabel = CATEGORY_META[item.category]?.label || (item.category || 'Products').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const safeName = item.name.replace(/'/g, "\\'");
  const isOOS = !!item.outOfStock;

  let actionButtonsHtml = '';
  if (isOOS) {
    actionButtonsHtml = `
      <button class="btn btn-secondary btn-lg add-to-cart-btn" disabled
        style="opacity:0.45;cursor:not-allowed;pointer-events:none; width:100%; margin-bottom: 1rem;"
        data-id="${item.id}"
        data-name="${item.name}"
        data-price="${item.price}"
        data-image="${item.image || 'images/brass-diya.png'}">
        Add to Cart
      </button>
      <button class="btn btn-lg"
        onclick="subscribeStockNotification('${item.id}', '${safeName}')"
        style="background: linear-gradient(135deg, #25D366, #128C7E); color: #fff; border: none; border-radius: var(--radius-md); font-size: 1.1rem; font-weight: 700; padding: 1rem; width: 100%; cursor: pointer; display: flex; align-items: center; justify-content:center; gap: 8px; box-shadow: 0 4px 12px rgba(37,211,102,0.3); pointer-events: auto;">
        🔔 Notify Me When Available
      </button>
    `;
  } else {
    actionButtonsHtml = `
      <button class="btn btn-secondary btn-lg add-to-cart-btn"
        style="width: 100%; margin-bottom: 1rem; padding: 1rem; font-size: 1.1rem;"
        data-id="${item.id}"
        data-name="${item.name}"
        data-price="${item.price}"
        data-image="${item.image || 'images/brass-diya.png'}">
        🛒 Add to Cart
      </button>
      <button class="btn btn-whatsapp btn-lg" 
        style="width: 100%; padding: 1rem; font-size: 1.1rem;"
        onclick="orderDirect('${safeName}', ${item.price})">
        Order Now on WhatsApp
      </button>
    `;
  }

  container.innerHTML = `
    <div class="single-product-container" itemscope itemtype="https://schema.org/Product">
      <div class="single-product-image-col">
        ${discount > 0 && !isOOS ? `<span class="single-discount-badge">${discount}% OFF</span>` : ''}
        ${isOOS ? `<div style="position:absolute;inset:0;background:rgba(255,255,255,0.6);display:flex;align-items:center;justify-content:center;z-index:2;"><span style="background:#ef4444;color:#fff;font-size:1.2rem;font-weight:800;padding:10px 24px;border-radius:30px;letter-spacing:1px;text-transform:uppercase;box-shadow:0 4px 12px rgba(239,68,68,0.3);">Out of Stock</span></div>` : ''}
        <img src="${item.image || 'images/brass-diya.png'}" alt="${item.name}" class="single-product-image" style="${isOOS ? 'opacity:0.5;filter:grayscale(40%);' : ''}" itemprop="image">
      </div>
      <div class="single-product-info-col">
        <div class="single-product-category">${categoryLabel}</div>
        <h1 class="single-product-title" itemprop="name">${item.name}</h1>
        
        <div style="color:#f59e0b; margin-bottom:1.5rem; font-size:1.2rem;">
          ★★★★★ <span style="color:#666; font-size:0.95rem;">(Trusted Quality)</span>
        </div>
        
        <div class="single-product-price-row" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
          <span class="single-selling-price">₹${item.price}</span>
          <meta itemprop="price" content="${item.price}" />
          <meta itemprop="priceCurrency" content="INR" />
          ${item.mrp && item.mrp > item.price ? `<span class="single-mrp">₹${item.mrp}</span>` : ''}
          ${saveAmt > 0 ? `<span class="single-you-save">You Save ₹${saveAmt}</span>` : ''}
        </div>
        
        <div class="single-product-desc-container">
          <h3>Product Details</h3>
          <p class="single-product-desc" itemprop="description">
            ${item.description ? item.description.replace(/\\n/g, '<br>') : 'A beautiful, traditional item for your sacred space, handpicked for its quality and significance.'}
          </p>
        </div>

        <div class="single-product-actions">
          ${actionButtonsHtml}
        </div>
        
        <div class="single-product-trust-badges">
          <div class="trust-badge">
            <span style="font-size: 1.5rem;">🛡️</span> 
            <div>
              <strong>Secure</strong>
              <div style="font-size: 0.8rem; color: #666;">100% Safe Payments</div>
            </div>
          </div>
          <div class="trust-badge">
            <span style="font-size: 1.5rem;">🚚</span> 
            <div>
              <strong>Delivery</strong>
              <div style="font-size: 0.8rem; color: #666;">Reliable local delivery</div>
            </div>
          </div>
          <div class="trust-badge">
            <span style="font-size: 1.5rem;">✨</span> 
            <div>
              <strong>Authentic</strong>
              <div style="font-size: 0.8rem; color: #666;">Premium Quality</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
  
  // Update document title for SEO
  document.title = \`\${item.name} | Veerabhadra Pooja Store\`;

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
}

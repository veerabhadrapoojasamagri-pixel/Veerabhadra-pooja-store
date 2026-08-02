const fs = require('fs');

let content = fs.readFileSync('public/js/main.js', 'utf8');

// 1. Remove ratings
const ratingsBlock = `        <div class="amazon-rating-row">
          <span class="amazon-stars">4.8 <span class="amazon-stars-visual">★★★★★</span></span>
          <span class="amazon-rating-count">1,244 ratings</span>
        </div>
        
        <div class="amazon-divider"></div>`;
content = content.replace(ratingsBlock, '');

// 2. Remove offers
const offersBlock = `        <div class="amazon-divider"></div>
        
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
        </div>`;
content = content.replace(offersBlock, '');

// 3. Remove delivery
const deliveryBlock = `        <div class="amazon-delivery">FREE delivery <strong>Tomorrow</strong> on your first order.</div>`;
content = content.replace(deliveryBlock, '');

// 4. Change Buy Now to WhatsApp
const buyNowBlock = `<button class="amazon-btn amazon-btn-buy" onclick="orderDirect('\${safeName}', \${item.price})">Buy Now</button>`;
const whatsappBlock = `<button class="amazon-btn" style="background:#25D366; border-color:#25D366; color:#fff;" onclick="orderDirect('\${safeName}', \${item.price})">Order on WhatsApp</button>`;
content = content.replace(buyNowBlock, whatsappBlock);

fs.writeFileSync('public/js/main.js', content);
console.log("Replacements complete.");

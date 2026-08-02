const fs = require('fs');

const amazonCss = `/* ==========================================================================
   Amazon-Style Single Product Detail Page
   ========================================================================== */
.amazon-product-container {
  display: grid;
  grid-template-columns: 1fr;
  gap: 2rem;
  max-width: 1500px;
  margin: 0 auto;
  padding: 1rem;
  font-family: Arial, sans-serif;
  color: #0F1111;
}

@media (min-width: 900px) {
  .amazon-product-container {
    grid-template-columns: minmax(300px, 1fr) minmax(400px, 2fr) minmax(280px, 300px);
    gap: 2.5rem;
  }
}

/* Image Column */
.amazon-image-col {
  position: relative;
  display: flex;
  justify-content: center;
  align-items: flex-start;
  padding: 1rem;
}

.amazon-main-image {
  max-width: 100%;
  max-height: 500px;
  object-fit: contain;
  cursor: zoom-in;
}

.amazon-discount-badge {
  position: absolute;
  top: 0;
  left: 0;
  background-color: #CC0C39;
  color: white;
  padding: 4px 8px;
  font-size: 0.85rem;
  font-weight: bold;
  border-radius: 2px;
}

/* Info Column */
.amazon-info-col {
  display: flex;
  flex-direction: column;
}

.amazon-title {
  font-size: 1.5rem;
  font-weight: 400;
  line-height: 1.3;
  margin-bottom: 0.2rem;
  color: #0F1111;
}

.amazon-brand {
  color: #007185;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  cursor: pointer;
}

.amazon-brand:hover {
  text-decoration: underline;
  color: #C7511F;
}

.amazon-rating-row {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  font-size: 0.9rem;
  color: #007185;
  margin-bottom: 0.8rem;
}

.amazon-stars {
  display: flex;
  align-items: center;
  gap: 4px;
}

.amazon-stars-visual {
  color: #FFA41C;
  font-size: 1.1rem;
}

.amazon-divider {
  height: 1px;
  background-color: #E7E7E7;
  margin: 1rem 0;
}

/* Price Block */
.amazon-price-block {
  margin-bottom: 0.5rem;
}

.amazon-discount-row {
  display: flex;
  align-items: flex-start;
  gap: 0.5rem;
  margin-bottom: 0.2rem;
}

.amazon-discount-pct {
  color: #CC0C39;
  font-size: 1.75rem;
  font-weight: 300;
}

.amazon-price {
  font-size: 1.75rem;
  font-weight: 500;
  color: #0F1111;
}

.amazon-mrp {
  font-size: 0.85rem;
  color: #565959;
}

.amazon-mrp span {
  text-decoration: line-through;
}

.amazon-taxes {
  font-size: 0.85rem;
  color: #565959;
  margin-top: 0.2rem;
}

/* Offers Block */
.amazon-offers-title {
  font-weight: 700;
  margin-bottom: 0.5rem;
}

.amazon-offers-grid {
  display: flex;
  gap: 1rem;
  overflow-x: auto;
  padding-bottom: 0.5rem;
}

.amazon-offer-box {
  min-width: 130px;
  max-width: 150px;
  border: 1px solid #D5D9D9;
  border-radius: 8px;
  padding: 0.8rem;
  box-shadow: 0 1px 2px rgba(0,0,0,0.05);
}

.amazon-offer-box strong {
  display: block;
  font-size: 0.9rem;
  margin-bottom: 0.3rem;
  color: #0F1111;
}

.amazon-offer-box p {
  font-size: 0.85rem;
  color: #0F1111;
  line-height: 1.3;
}

/* Description Block */
.amazon-desc-block h3 {
  font-size: 1rem;
  font-weight: 700;
  margin-bottom: 0.5rem;
  color: #0F1111;
}

.amazon-desc-list {
  padding-left: 1.2rem;
  margin: 0;
}

.amazon-desc-list li {
  font-size: 0.9rem;
  line-height: 1.4;
  margin-bottom: 0.4rem;
  color: #0F1111;
}

/* Buy Box (Right Column) */
.amazon-buy-box {
  border: 1px solid #D5D9D9;
  border-radius: 8px;
  padding: 1.2rem;
  align-self: start;
}

.amazon-buy-price {
  font-size: 1.5rem;
  font-weight: 500;
  margin-bottom: 0.5rem;
  color: #0F1111;
}

.amazon-delivery {
  font-size: 0.9rem;
  color: #007185;
  margin-bottom: 1rem;
  line-height: 1.3;
}

.amazon-delivery strong {
  color: #0F1111;
}

.amazon-stock-status {
  font-size: 1.1rem;
  color: #007600;
  font-weight: 500;
  margin-bottom: 1rem;
}

.amazon-qty {
  margin-bottom: 1rem;
}

.amazon-qty-select {
  padding: 4px 8px;
  border-radius: 7px;
  border: 1px solid #D5D9D9;
  background-color: #F0F2F2;
  box-shadow: 0 2px 5px rgba(15,17,17,.15);
  cursor: pointer;
}

.amazon-buy-actions {
  display: flex;
  flex-direction: column;
  gap: 0.5rem;
  margin-bottom: 1rem;
}

.amazon-btn {
  width: 100%;
  padding: 0.6rem;
  border-radius: 100px;
  border: 1px solid;
  font-size: 0.9rem;
  cursor: pointer;
  text-align: center;
  box-shadow: 0 2px 5px 0 rgba(213,217,217,.5);
}

.amazon-btn-cart {
  background: #FFD814;
  border-color: #FCD200;
  color: #0F1111;
}

.amazon-btn-cart:hover {
  background: #F7CA00;
}

.amazon-btn-buy {
  background: #FFA41C;
  border-color: #FF8F00;
  color: #0F1111;
}

.amazon-btn-buy:hover {
  background: #FA8900;
}

.amazon-btn-notify {
  background: #007185;
  border-color: #007185;
  color: #fff;
  border-radius: 8px;
}

.amazon-ships-from {
  font-size: 0.75rem;
  color: #565959;
}

.amazon-ships-from table {
  width: 100%;
  border-collapse: collapse;
}

.amazon-ships-from td {
  padding: 2px 0;
  vertical-align: top;
}

.amazon-ships-from td:first-child {
  width: 35%;
}

.amazon-ships-from td:last-child {
  color: #0F1111;
}
`;

let content = fs.readFileSync('public/css/style.css', 'utf8');

const startIdx = content.indexOf('/* ==========================================================================');
const nextIdx = content.indexOf('Single Product Detail Page', startIdx);
if (startIdx !== -1 && nextIdx !== -1 && nextIdx - startIdx < 150) {
  content = content.substring(0, startIdx);
}

content += amazonCss;

fs.writeFileSync('public/css/style.css', content);
console.log('Successfully updated style.css');

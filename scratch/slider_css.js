const fs = require('fs');
const css = `
/* ==========================================================================
   Product Image Slider
   ========================================================================== */
.product-slider-container {
  position: relative;
  width: 100%;
  height: 100%;
  overflow: hidden;
  border-radius: 12px;
  background-color: var(--color-bg-card);
}

.product-slider-track {
  display: flex;
  width: 100%;
  height: 100%;
  transition: transform 0.4s ease-in-out;
}

.product-slider-slide {
  flex: 0 0 100%;
  width: 100%;
  height: 100%;
  display: flex;
  align-items: center;
  justify-content: center;
}

.product-slider-slide img {
  max-width: 100%;
  max-height: 100%;
  object-fit: contain;
}

.slider-arrow {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  background: rgba(255, 255, 255, 0.8);
  border: 1px solid rgba(0,0,0,0.1);
  border-radius: 50%;
  width: 40px;
  height: 40px;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  z-index: 10;
  color: var(--color-text);
  font-size: 20px;
  box-shadow: 0 2px 5px rgba(0,0,0,0.15);
  transition: background 0.2s, transform 0.2s;
}

.slider-arrow:hover {
  background: #ffffff;
  transform: translateY(-50%) scale(1.1);
}

.slider-arrow.prev {
  left: 10px;
}

.slider-arrow.next {
  right: 10px;
}

.slider-dots {
  position: absolute;
  bottom: 15px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 8px;
  z-index: 10;
}

.slider-dot {
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: rgba(0,0,0,0.3);
  cursor: pointer;
  transition: background 0.3s;
}

.slider-dot.active {
  background: var(--color-primary);
}
`;

fs.appendFileSync('public/css/style.css', css);
console.log('Appended slider css.');

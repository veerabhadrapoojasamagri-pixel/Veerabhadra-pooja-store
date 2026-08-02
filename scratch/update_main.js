const fs = require('fs');

let js = fs.readFileSync('public/js/main.js', 'utf8');

const oldImageCol = `      <!-- LEFT: Image Box -->
      <div class="amazon-image-col">
        \${discount > 0 && !isOOS ? \`<span class="amazon-discount-badge">\${discount}% OFF</span>\` : ''}
        \${isOOS ? \`<div class="amazon-oos-overlay"><span>Out of Stock</span></div>\` : ''}
        <img src="\${item.image || 'images/brass-diya.png'}" alt="\${item.name}" class="amazon-main-image" style="\${isOOS ? 'opacity:0.5;filter:grayscale(40%);' : ''}" itemprop="image">
      </div>`;

const newImageCol = `      <!-- LEFT: Image Box -->
      <div class="amazon-image-col" style="position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; min-height: 400px; background: #fff;">
        \${discount > 0 && !isOOS ? \`<span class="amazon-discount-badge" style="z-index: 20;">\${discount}% OFF</span>\` : ''}
        \${isOOS ? \`<div class="amazon-oos-overlay" style="z-index: 20;"><span>Out of Stock</span></div>\` : ''}
        
        \${(item.images && item.images.length > 1) ? \`
          <div class="product-slider-container">
            <div class="product-slider-track" id="productSliderTrack">
              \${item.images.map(imgSrc => \`
                <div class="product-slider-slide">
                  <img src="\${imgSrc}" alt="\${item.name}" style="\${isOOS ? 'opacity:0.5;filter:grayscale(40%);' : ''}" itemprop="image">
                </div>
              \`).join('')}
            </div>
            <button class="slider-arrow prev" onclick="moveSlider(-1)">&#10094;</button>
            <button class="slider-arrow next" onclick="moveSlider(1)">&#10095;</button>
            <div class="slider-dots" id="productSliderDots">
              \${item.images.map((_, i) => \`
                <div class="slider-dot \${i === 0 ? 'active' : ''}" onclick="goToSlide(\${i})"></div>
              \`).join('')}
            </div>
          </div>
        \` : \`
          <img src="\${item.image || 'images/brass-diya.png'}" alt="\${item.name}" class="amazon-main-image" style="\${isOOS ? 'opacity:0.5;filter:grayscale(40%);' : ''}" itemprop="image">
        \`}
      </div>`;

js = js.replace(oldImageCol, newImageCol);

// Append the slider control functions
const sliderFunctions = `
// Product Slider State
let currentSlideIndex = 0;

window.moveSlider = function(direction) {
  const track = document.getElementById('productSliderTrack');
  const dots = document.querySelectorAll('#productSliderDots .slider-dot');
  if (!track || dots.length <= 1) return;
  
  currentSlideIndex += direction;
  
  if (currentSlideIndex >= dots.length) {
    currentSlideIndex = 0; // Loop back to start
  } else if (currentSlideIndex < 0) {
    currentSlideIndex = dots.length - 1; // Loop to end
  }
  
  updateSlider(track, dots);
};

window.goToSlide = function(index) {
  const track = document.getElementById('productSliderTrack');
  const dots = document.querySelectorAll('#productSliderDots .slider-dot');
  if (!track || dots.length <= 1) return;
  
  currentSlideIndex = index;
  updateSlider(track, dots);
};

function updateSlider(track, dots) {
  track.style.transform = \`translateX(-\${currentSlideIndex * 100}%)\`;
  
  dots.forEach((dot, i) => {
    if (i === currentSlideIndex) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
}
`;

js += '\n' + sliderFunctions;

fs.writeFileSync('public/js/main.js', js);
console.log('main.js updated with slider logic.');

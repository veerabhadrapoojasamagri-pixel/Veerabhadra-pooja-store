// Pooja Store - Main JS Configuration & Interactive Features

const WHATSAPP_PHONE = '918143242659'; // Store Owner WhatsApp Number (with country code, no + or spaces)
const DEFAULT_ITEMS = [];

// Cart State Management
let cart = [];
let isLoggedIn = false;
let globalProducts = [...DEFAULT_ITEMS];

async function fetchProducts() {
  try {
    if (typeof supabaseClient !== 'undefined') {
      const { data, error } = await supabaseClient
        .from('orders')
        .select('items')
        .eq('id', '00000000-0000-0000-0000-000000000000')
        .single();
      
      if (!error && data && data.items && data.items.length > 0) {
        globalProducts = data.items;
      }
    }
  } catch(e) {
    console.error('Failed to load products from Supabase:', e);
  }
}

// Initialize Page
document.addEventListener('DOMContentLoaded', async () => {
  initMobileMenu();
  initCart();
  initBookingForm();
  updateActiveNavLink();
  checkAuthState();
  
  await fetchProducts(); // Fetch globally synced inventory
  
  renderProductsPage(); // Renders admin-added products dynamically on products.html
  renderHomeProducts(); // Renders featured products dynamically on index.html
  renderSingleProductPage(); // Renders single product on product.html
  renderRatings();      // Injects ratings + variant dropdowns on rendered cards
});

// =============================================================================
// Dynamic Products Page Renderer
// Renders all product cards on products.html from localStorage / DEFAULT_ITEMS
// =============================================================================
const CATEGORY_META = {
  'brass-items':      { label: 'Brass Items',             desc: 'Bring brightness and positive energy with our heavy-cast, highly polished brass items.' },
  'copper-items':     { label: 'Copper Items',            desc: 'Pure copper containers and utensils designed for water storage and holy offerings.' },
  'photo-frames':     { label: 'Photo Frames',            desc: 'Beautifully crafted framed representations of deities for your pooja mandir.' },
  'daily-essentials': { label: 'Daily Pooja Essentials',  desc: 'Consumables, lighting aids, and purifiers needed for daily prayers and rituals.' },
  'decorative-items': { label: 'Decorative Items',        desc: 'Enhance your sacred spaces with traditional decorative garlands, torans, hanging lamps, and backdrop drapes.' },
};

function buildProductCardHtml(item) {
  const discount = item.mrp && item.price && item.mrp > item.price
    ? Math.round(((item.mrp - item.price) / item.mrp) * 100)
    : 0;
  const saveAmt = item.mrp && item.price ? item.mrp - item.price : 0;
  const categoryLabel = CATEGORY_META[item.category]?.label || (item.category || 'Products').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
  const safeName = item.name.replace(/'/g, "\'");
  const isOOS = !!item.outOfStock;

  return `
    <div class="product-card${isOOS ? ' product-card--oos' : ''}">
      <a href="product.html?id=${item.id}" class="product-image-container" style="display:block; text-decoration:none; cursor:pointer;">
        ${discount > 0 && !isOOS ? `<span class="discount-badge">${discount}% OFF</span>` : ''}
        ${isOOS ? `<div style="position:absolute;inset:0;background:rgba(0,0,0,0.45);border-radius:inherit;display:flex;align-items:center;justify-content:center;z-index:2;">
          <span style="background:#ef4444;color:#fff;font-size:0.78rem;font-weight:800;padding:5px 14px;border-radius:20px;letter-spacing:0.5px;text-transform:uppercase;box-shadow:0 2px 8px rgba(239,68,68,0.4);">Out of Stock</span>
        </div>` : ''}
        <img src="${item.image || 'images/brass-diya.png'}" alt="${item.name}" class="product-image" loading="lazy" style="${isOOS ? 'opacity:0.55;filter:grayscale(30%);' : ''}">
      </a>
      <div class="product-info">
        <span class="product-category">${categoryLabel}</span>
        <a href="product.html?id=${item.id}" style="text-decoration:none; color:inherit;"><h3 class="product-name" style="transition: color 0.2s;" onmouseover="this.style.color='var(--color-primary)'" onmouseout="this.style.color='inherit'">${item.name}</h3></a>
        <div class="price-row" style="${isOOS ? 'opacity:0.55;' : ''}">
          <span class="selling-price">₹${item.price}</span>
          ${item.mrp && item.mrp > item.price ? `<span class="mrp">₹${item.mrp}</span>` : ''}
          ${saveAmt > 0 ? `<span class="you-save">Save ₹${saveAmt}</span>` : ''}
        </div>
        <div class="product-actions">
          ${isOOS
            ? `<button class="btn btn-secondary btn-sm add-to-cart-btn" disabled
                style="opacity:0.45;cursor:not-allowed;pointer-events:none;"
                data-id="${item.id}"
                data-name="${item.name}"
                data-price="${item.price}"
                data-image="${item.image || 'images/brass-diya.png'}">
                Add to Cart
              </button>
              <button class="btn btn-sm"
                onclick="subscribeStockNotification('${item.id}', '${safeName}')"
                style="background: linear-gradient(135deg, #25D366, #128C7E); color: #fff; border: none; border-radius: var(--radius-full, 50px); font-size: 0.825rem; font-weight: 700; padding: 0.55rem 1.1rem; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 4px 12px rgba(37,211,102,0.3); pointer-events: auto;">
                🔔 Notify Me
              </button>`
            : `<button class="btn btn-secondary btn-sm add-to-cart-btn"
                data-id="${item.id}"
                data-name="${item.name}"
                data-price="${item.price}"
                data-image="${item.image || 'images/brass-diya.png'}">
                Add to Cart
              </button>
              <button class="btn btn-whatsapp btn-sm" onclick="orderDirect('${safeName}', ${item.price})">
                Order Now
              </button>`
          }
        </div>
      </div>
    </div>
  `;
}

function renderProductsPage() {
  const container = document.getElementById('products-dynamic-container');
  if (!container) return; // Only runs on products.html

  // Load items from global synced inventory
  let allItems = globalProducts;

  // Filter only sale items (not rentals)
  const saleItems = allItems.filter(i => i.type === 'sale');

  if (saleItems.length === 0) {
    container.innerHTML = `
      <div style="text-align:center; padding: 4rem 2rem; color: #888;">
        <div style="font-size: 3rem; margin-bottom: 1rem;">🪔</div>
        <p style="font-size: 1.1rem; font-weight: 600;">No products available yet.</p>
        <p style="font-size: 0.9rem; margin-top: 0.5rem;">Check back soon or contact us on WhatsApp.</p>
      </div>`;
    return;
  }

  // Group items by category (preserve insertion order)
  const categoryOrder = Object.keys(CATEGORY_META);
  const grouped = {};

  saleItems.forEach(item => {
    const cat = item.category || 'daily-essentials';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(item);
  });

  // Sort categories: known ones first in order, then unknown alphabetically
  const sortedCats = [
    ...categoryOrder.filter(c => grouped[c]),
    ...Object.keys(grouped).filter(c => !categoryOrder.includes(c)).sort()
  ];

  let html = '';
  sortedCats.forEach(cat => {
    const meta = CATEGORY_META[cat] || {
      label: cat.replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase()),
      desc: ''
    };
    const cardsHtml = grouped[cat].map(buildProductCardHtml).join('');

    html += `
      <div class="category-block" id="${cat}">
        <div class="category-block-header">
          <h2>${meta.label}</h2>
          ${meta.desc ? `<p>${meta.desc}</p>` : ''}
        </div>
        <div class="products-grid">
          ${cardsHtml}
        </div>
      </div>
    `;
  });

  container.innerHTML = html;

  // Re-attach cart button event listeners after dynamic render
  bindAddToCartButtons();
}

function renderHomeProducts() {
  const container = document.getElementById('home-dynamic-products');
  if (!container) return; // Only runs on index.html

  let allItems = globalProducts;

  // Filter only sale items
  const saleItems = allItems.filter(i => i.type === 'sale');

  if (saleItems.length === 0) {
    container.innerHTML = `<p style="text-align:center; width:100%; color:#666;">No featured products available.</p>`;
    return;
  }

  const cardsHtml = saleItems.map(buildProductCardHtml).join('');
  container.innerHTML = cardsHtml;

  // Re-attach cart button event listeners after dynamic render
  bindAddToCartButtons();
}

// Function to inject star ratings dynamically under product names
function renderRatings() {
  let itemsList = globalProducts;

  function getStarsHtml(rating) {
    const fullStars = Math.floor(rating);
    const hasHalf = rating % 1 >= 0.4;
    let stars = '';
    for (let i = 0; i < 5; i++) {
      if (i < fullStars) {
        stars += '<span style="color:#ffb300;">★</span>';
      } else if (i === fullStars && hasHalf) {
        stars += '<span style="color:#ffb300;position:relative;display:inline-block;width:0.5em;overflow:hidden;vertical-align:bottom;">★</span><span style="color:#ddd;position:absolute;margin-left:-0.5em;width:0.5em;overflow:hidden;vertical-align:bottom;">★</span>';
      } else {
        stars += '<span style="color:#ddd;">★</span>';
      }
    }
    return `<div style="display:inline-flex; align-items:center; gap:2px; font-size:1.1rem; line-height:1;">${stars}</div>`;
  }

  itemsList.forEach(item => {
    // 1. Render on products and homepages (which have .product-card)
    const cartBtn = document.querySelector(`.add-to-cart-btn[data-id="${item.id}"], .add-to-cart-btn[data-id^="${item.id}-"]`);
    if (cartBtn) {
      const card = cartBtn.closest('.product-card');
      if (card) {
        // Apply Out of Stock styling if item is out of stock (important for homepage static cards)
        if (item.outOfStock) {
          card.classList.add('product-card--oos');
          const imgContainer = card.querySelector('.product-image-container');
          if (imgContainer && !imgContainer.querySelector('.oos-overlay')) {
            const discountBadge = imgContainer.querySelector('.discount-badge');
            if (discountBadge) discountBadge.style.display = 'none';
            
            const oosOverlay = document.createElement('div');
            oosOverlay.className = 'oos-overlay';
            oosOverlay.style.cssText = 'position:absolute;inset:0;background:rgba(0,0,0,0.45);border-radius:inherit;display:flex;align-items:center;justify-content:center;z-index:2;';
            oosOverlay.innerHTML = '<span style="background:#ef4444;color:#fff;font-size:0.78rem;font-weight:800;padding:5px 14px;border-radius:20px;letter-spacing:0.5px;text-transform:uppercase;box-shadow:0 2px 8px rgba(239,68,68,0.4);">Out of Stock</span>';
            imgContainer.appendChild(oosOverlay);
            
            const img = imgContainer.querySelector('.product-image');
            if (img) {
              img.style.opacity = '0.55';
              img.style.filter = 'grayscale(30%)';
            }
          }
          const priceRow = card.querySelector('.price-row');
          if (priceRow) priceRow.style.opacity = '0.55';
          
          // Disable Add to Cart button
          cartBtn.setAttribute('disabled', 'true');
          cartBtn.style.cssText = 'opacity:0.45;cursor:not-allowed;pointer-events:none;';
          
          // Replace Order Now button with "Notify Me" button for Out of Stock items
          const orderNowBtn = card.querySelector('button[onclick^="orderDirect"]');
          if (orderNowBtn) {
            orderNowBtn.removeAttribute('disabled');
            orderNowBtn.style.cssText = 'background: linear-gradient(135deg, #25D366, #128C7E); color: #fff; border: none; border-radius: var(--radius-full, 50px); font-size: 0.825rem; font-weight: 700; padding: 0.55rem 1.1rem; cursor: pointer; display: inline-flex; align-items: center; gap: 4px; box-shadow: 0 4px 12px rgba(37,211,102,0.3); pointer-events: auto;';
            orderNowBtn.innerHTML = '🔔 Notify Me';
            const escapedName = (item.name || '').replace(/'/g, "\'");
            orderNowBtn.setAttribute('onclick', `subscribeStockNotification('${item.id}', '${escapedName}')`);
          }
        }

        const infoSection = card.querySelector('.product-info');
        
        // Render variants select dropdown if variants exist
        if (infoSection && item.variants && item.variants.length > 0 && !infoSection.querySelector('.variant-select-container')) {

          const selectContainer = document.createElement('div');
          selectContainer.className = 'variant-select-container';
          selectContainer.style.cssText = 'margin: 8px 0 10px; text-align: left;';
          
          let optionsHtml = '';
          item.variants.forEach((v, idx) => {
            optionsHtml += `<option value="${idx}">${v.name} - ₹${v.price}</option>`;
          });
          
          selectContainer.innerHTML = `
            <label style="font-size: 0.72rem; font-weight: 700; color: #888; display: block; margin-bottom: 4px; text-transform: uppercase; letter-spacing: 0.5px;">Choose Quantity:</label>
            <select class="variant-select" style="width: 100%; padding: 6px 10px; border-radius: 6px; border: 1px solid #e0e0e0; font-family: 'Outfit', sans-serif; font-size: 0.85rem; color: #1a1a2e; background-color: #fff; cursor: pointer; outline: none; transition: border-color 0.2s;">
              ${optionsHtml}
            </select>
          `;
          
          const priceRow = infoSection.querySelector('.price-row');
          if (priceRow) {
            priceRow.parentNode.insertBefore(selectContainer, priceRow);
          } else {
            infoSection.appendChild(selectContainer);
          }
          
          const selectEl = selectContainer.querySelector('.variant-select');
          
          const updateCardVariant = (index) => {
            const selectedVariant = item.variants[index];
            if (!selectedVariant) return;
            
            // 1. Update prices in UI
            const sellingPriceEl = infoSection.querySelector('.selling-price');
            const mrpEl = infoSection.querySelector('.mrp');
            const youSaveEl = infoSection.querySelector('.you-save');
            
            if (sellingPriceEl) sellingPriceEl.textContent = `₹${selectedVariant.price}`;
            if (mrpEl) mrpEl.textContent = `₹${selectedVariant.mrp}`;
            
            if (youSaveEl) {
              const saveAmt = selectedVariant.mrp - selectedVariant.price;
              if (saveAmt > 0) {
                youSaveEl.textContent = `Save ₹${saveAmt}`;
                youSaveEl.style.display = 'inline-block';
              } else {
                youSaveEl.style.display = 'none';
              }
            }
            
            // 2. Calculate and update discount badge if present
            const cardParent = infoSection.closest('.product-card');
            if (cardParent) {
              const badge = cardParent.querySelector('.discount-badge');
              if (badge) {
                const discount = Math.round(((selectedVariant.mrp - selectedVariant.price) / selectedVariant.mrp) * 100);
                if (discount > 0) {
                  badge.textContent = `${discount}% OFF`;
                  badge.style.display = 'block';
                } else {
                  badge.style.display = 'none';
                }
              }
            }
            
            // 3. Update Add to Cart button dataset
            if (cartBtn) {
              cartBtn.setAttribute('data-price', selectedVariant.price);
              const cleanVariantName = selectedVariant.name;
              cartBtn.setAttribute('data-name', `${item.name} (${cleanVariantName})`);
              cartBtn.setAttribute('data-id', `${item.id}-${cleanVariantName.replace(/\s+/g, '-').toLowerCase()}`);
            }
            
            // 4. Update Order Now button onclick handler
            const orderNowBtn = infoSection.querySelector('button[onclick^="orderDirect"]');
            if (orderNowBtn) {
              orderNowBtn.setAttribute('onclick', `orderDirect("${item.name} (${selectedVariant.name})", ${selectedVariant.price})`);
            }
          };
          
          // Initial trigger for the default variant
          updateCardVariant(0);
          
          selectEl.addEventListener('change', (e) => {
            updateCardVariant(parseInt(e.target.value));
          });
        }
      }
    }

    // 2. Rental details page (rental.html) - ratings removed
  });
}


async function checkAuthState() {
  if (typeof supabaseClient === 'undefined') return;
  const { data: { session } } = await supabaseClient.auth.getSession();
  isLoggedIn = !!session;
  const authBtn = document.getElementById('navAuthBtn');
  const mobileAuthLink = document.getElementById('mobileAuthLink');
  const cartTrigger = document.querySelector('.cart-trigger');
  const navLinks = document.querySelector('.nav-links');
  
  if (session) {
    if (authBtn) {
      // Remove settings button from header actions in laptop view
      authBtn.style.display = 'none';
    }
    if (mobileAuthLink) {
      // Show Settings option in the mobile sidebar when logged in
      mobileAuthLink.style.display = 'block';
      mobileAuthLink.innerHTML = `Settings`;
      mobileAuthLink.href = 'dashboard.html';
    }
    if (cartTrigger) {
      cartTrigger.style.display = 'flex';
    }
    
    // Add Settings link to desktop navbar menu if not already present
    if (navLinks && !document.getElementById('navSettingsLink')) {
      const li = document.createElement('li');
      li.id = 'navSettingsLink';
      const isActive = window.location.pathname.includes('dashboard.html');
      li.innerHTML = `<a href="dashboard.html" ${isActive ? 'class="active"' : ''}>Settings</a>`;
      navLinks.appendChild(li);
    }
  } else {
    if (authBtn) {
      authBtn.style.display = 'inline-flex';
      authBtn.textContent = 'Sign In';
      authBtn.href = 'login.html';
      authBtn.className = 'btn btn-secondary btn-sm';
      authBtn.style.borderRadius = 'var(--radius-full)';
      authBtn.style.padding = '0.4rem 1rem';
    }
    if (mobileAuthLink) {
      mobileAuthLink.style.display = 'block';
      mobileAuthLink.innerHTML = `Sign In`;
      mobileAuthLink.href = 'login.html';
    }
    if (cartTrigger) {
      cartTrigger.style.display = 'flex';
    }
    
    // Remove Settings link from desktop navbar menu
    const settingsLink = document.getElementById('navSettingsLink');
    if (settingsLink) {
      settingsLink.remove();
    }
  }
}

// 1. Mobile Menu Functionality
function initMobileMenu() {
  const menuToggle = document.querySelector('.menu-toggle');
  const closeBtn = document.querySelector('.close-btn');
  const mobileNav = document.querySelector('.mobile-nav');
  const overlay = document.querySelector('.mobile-nav-overlay');

  if (menuToggle && mobileNav && overlay) {
    const toggleMenu = () => {
      mobileNav.classList.toggle('active');
      overlay.classList.toggle('active');
      document.body.style.overflow = mobileNav.classList.contains('active') ? 'hidden' : '';
    };

    menuToggle.addEventListener('click', toggleMenu);
    closeBtn.addEventListener('click', toggleMenu);
    overlay.addEventListener('click', toggleMenu);

    // Close mobile nav when clicking a link
    const mobileLinks = mobileNav.querySelectorAll('a');
    mobileLinks.forEach(link => {
      link.addEventListener('click', () => {
        mobileNav.classList.remove('active');
        overlay.classList.remove('active');
        document.body.style.overflow = '';
      });
    });
  }
}

// 2. Navigation Active State
function updateActiveNavLink() {
  const currentPath = window.location.pathname;
  let pageName = currentPath.substring(currentPath.lastIndexOf('/') + 1);
  if (pageName === '') pageName = 'index.html';

  const navLinks = document.querySelectorAll('.nav-links a, .mobile-nav-links a');
  navLinks.forEach(link => {
    const linkPath = link.getAttribute('href') || '';
    
    // Normalize both paths (strip slash and extension) to compare them fairly
    const normLink = linkPath.replace('.html', '').replace(/^\//, '') || 'index';
    const normPage = pageName.replace('.html', '').replace(/^\//, '') || 'index';
    
    if (normLink === normPage) {
      link.classList.add('active');
    } else {
      link.classList.remove('active');
    }
  });
}

// 3. Shopping Cart Functionality
function initCart() {
  // Load cart from LocalStorage
  const savedCart = localStorage.getItem('pooja_store_cart');
  if (savedCart) {
    try {
      cart = JSON.parse(savedCart);
    } catch (e) {
      cart = [];
    }
  }

  // Bind Cart Drawer Open / Close Events
  const cartTrigger = document.querySelector('.cart-trigger');
  const cartOverlay = document.querySelector('.cart-overlay');
  const cartClose = document.querySelector('.cart-close-btn');
  const cartDrawer = document.querySelector('.cart-drawer');

  if (cartTrigger && cartDrawer && cartOverlay) {
    const toggleCart = () => {
      cartDrawer.classList.toggle('active');
      cartOverlay.classList.toggle('active');
      document.body.style.overflow = cartDrawer.classList.contains('active') ? 'hidden' : '';
      renderCart();
    };

    cartTrigger.addEventListener('click', toggleCart);
    cartOverlay.addEventListener('click', toggleCart);
    if (cartClose) {
      cartClose.addEventListener('click', toggleCart);
    }
  }

  // Bind Add To Cart buttons
  bindAddToCartButtons();

  // Initial render
  updateCartBadge();
}

function bindAddToCartButtons() {
  const addButtons = document.querySelectorAll('.add-to-cart-btn');
  addButtons.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      
      if (!isLoggedIn) {
        window.location.href = 'login.html';
        return;
      }

      const id = btn.getAttribute('data-id');
      const name = btn.getAttribute('data-name');
      const price = parseFloat(btn.getAttribute('data-price'));
      const image = btn.getAttribute('data-image');

      addToCart(id, name, price, image);

      // Animate badge
      const badge = document.querySelector('.cart-badge');
      if (badge) {
        badge.style.transform = 'scale(1.4)';
        setTimeout(() => {
          badge.style.transform = 'scale(1)';
        }, 300);
      }

      // Briefly change button text to indicate success
      const originalText = btn.innerHTML;
      btn.innerHTML = '✓ Added to Cart';
      btn.style.backgroundColor = '#2e7d32';
      setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.backgroundColor = '';
      }, 1500);
    });
  });
}

function addToCart(id, name, price, image) {
  const existingIndex = cart.findIndex(item => item.id === id);
  if (existingIndex > -1) {
    cart[existingIndex].qty += 1;
  } else {
    cart.push({ id, name, price, image, qty: 1 });
  }
  saveCart();
  updateCartBadge();
}

function saveCart() {
  localStorage.setItem('pooja_store_cart', JSON.stringify(cart));
}

function updateCartBadge() {
  const badges = document.querySelectorAll('.cart-badge');
  const totalItems = cart.reduce((sum, item) => sum + item.qty, 0);
  badges.forEach(badge => {
    badge.textContent = totalItems;
    badge.style.display = totalItems > 0 ? 'flex' : 'none';
  });
}

function renderCart() {
  const container = document.querySelector('.cart-items-container');
  const totalEl = document.querySelector('.cart-total-value');
  const checkoutBtn = document.querySelector('.cart-checkout-btn');

  if (!container) return;

  if (cart.length === 0) {
    container.innerHTML = `
      <div class="cart-empty-message" style="display:flex; flex-direction:column; align-items:center; justify-content:center; height:80%; text-align:center; gap:0.75rem; padding:2rem 1rem;">
        <svg width="120" height="120" viewBox="0 0 120 120" fill="none" xmlns="http://www.w3.org/2000/svg" style="margin-bottom:0.5rem; filter:drop-shadow(0 8px 16px rgba(243,112,34,0.12));">
          <circle cx="60" cy="60" r="50" fill="url(#paint0_linear)" fill-opacity="0.08"/>
          <circle cx="60" cy="60" r="40" fill="url(#paint0_linear)" fill-opacity="0.12"/>
          <path d="M40 45V35C40 23.9543 48.9543 15 60 15C71.0457 15 80 23.9543 80 35V45" stroke="url(#paint1_linear)" stroke-width="3" stroke-linecap="round"/>
          <rect x="30" y="42" width="60" height="50" rx="12" fill="#FFFFFF" stroke="url(#paint1_linear)" stroke-width="3"/>
          <path d="M60 55C56 61 51 61 51 65C51 69 55 71 60 71C65 71 69 69 69 65C69 61 64 61 60 55Z" fill="url(#paint1_linear)" fill-opacity="0.85"/>
          <path d="M60 59C58 63 55 64 55 66.5C55 69 57.5 70 60 70C62.5 70 65 69 65 66.5C65 64 62 63 60 59Z" fill="#FFF"/>
          <path d="M25 30L27 34L31 35L27 36L25 40L23 36L19 35L23 34L25 30Z" fill="#ffb300"/>
          <path d="M95 38L96.5 41L99.5 42L96.5 43L95 46L93.5 43L90.5 42L93.5 41L95 38Z" fill="#f37022"/>
          <path d="M50 82L51 84L53 84.5L51 85L50 87L49 85L47 84.5L49 84L50 82Z" fill="#f37022"/>
          <defs>
            <linearGradient id="paint0_linear" x1="10" y1="10" x2="110" y2="110" gradientUnits="userSpaceOnUse">
              <stop stop-color="#f37022"/>
              <stop offset="1" stop-color="#ffb300"/>
            </linearGradient>
            <linearGradient id="paint1_linear" x1="30" y1="42" x2="90" y2="92" gradientUnits="userSpaceOnUse">
              <stop stop-color="#f37022"/>
              <stop offset="1" stop-color="#ffb300"/>
            </linearGradient>
          </defs>
        </svg>
        <h3 style="font-family:var(--font-heading); font-size:1.35rem; color:var(--color-accent); font-weight:700; margin:0.25rem 0 0;">Your Cart is Empty</h3>
        <p style="font-size:0.85rem; max-width:280px; line-height:1.6; color:var(--color-text-light); margin:0;">Bring home tradition & purity. Fill your basket with our handpicked pooja essentials.</p>
        <a href="products.html" class="btn btn-secondary btn-sm" style="margin-top:0.75rem; border-radius:var(--radius-full, 50px); padding:0.6rem 1.6rem; font-size:0.82rem; font-weight:700; letter-spacing:0.3px; box-shadow:0 6px 16px rgba(243,112,34,0.15);">Browse Collections</a>
      </div>
    `;
    if (totalEl) totalEl.textContent = '₹0';
    if (checkoutBtn) checkoutBtn.style.display = 'none';
    return;
  }

  if (checkoutBtn) checkoutBtn.style.display = 'flex';

  let html = '';
  let totalPrice = 0;

  cart.forEach(item => {
    const itemTotal = item.price * item.qty;
    totalPrice += itemTotal;

    html += `
      <div class="cart-item" data-id="${item.id}">
        <img src="${item.image || 'images/brass-diya.png'}" alt="${item.name}" class="cart-item-img" onerror="this.src='images/brass-diya.png'">
        <div class="cart-item-info">
          <span class="cart-item-name">${item.name}</span>
          <span class="cart-item-price">₹${item.price}</span>
          <div class="cart-item-qty-control">
            <button class="qty-btn minus-qty" onclick="changeQty('${item.id}', -1)">-</button>
            <span class="qty-val">${item.qty}</span>
            <button class="qty-btn plus-qty" onclick="changeQty('${item.id}', 1)">+</button>
          </div>
        </div>
        <button class="cart-item-remove" onclick="removeCartItem('${item.id}')" title="Remove item">
          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
        </button>
      </div>
    `;
  });

  container.innerHTML = html;
  if (totalEl) totalEl.textContent = `₹${totalPrice}`;
}

// Global scope functions for onclick event handlers
window.changeQty = (id, change) => {
  const index = cart.findIndex(item => item.id === id);
  if (index > -1) {
    cart[index].qty += change;
    if (cart[index].qty <= 0) {
      cart.splice(index, 1);
    }
    saveCart();
    updateCartBadge();
    renderCart();
  }
};

window.removeCartItem = (id) => {
  cart = cart.filter(item => item.id !== id);
  saveCart();
  updateCartBadge();
  renderCart();
};

// Helper to save order to Supabase cloud database (works across all devices)
async function saveOrderToStorage(orderData) {
  try {
    const now = new Date();
    let hours = now.getHours();
    const ampm = hours >= 12 ? 'PM' : 'AM';
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const dateStr = now.getFullYear() + '-' + 
                    String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                    String(now.getDate()).padStart(2, '0') + ' ' + 
                    String(hours).padStart(2, '0') + ':' + minutes + ' ' + ampm;

    // Get the logged-in user's ID to link order to their account
    let userId = null;
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session && session.user) {
        userId = session.user.id;
      }
    } catch (e) {
      console.log('Could not get user ID for order:', e);
    }

    const insertData = {
      customer_name: orderData.customerName || 'WhatsApp Customer',
      mobile_number: orderData.mobileNumber || 'Via WhatsApp',
      address: orderData.address || 'Provided via WhatsApp',
      order_date: dateStr,
      items: orderData.items || [],
      total_amount: orderData.totalAmount || 0,
      payment_method: orderData.paymentMethod || 'UPI/Cash',
      status: orderData.status || 'Pending',
      notification_history: []
    };

    // Add user_id if logged in
    if (userId) {
      insertData.user_id = userId;
    }

    const { data, error } = await supabaseClient
      .from('orders')
      .insert(insertData)
      .select();

    if (!error && data && data.length > 0) {
      return data[0].id;
    }
    console.error('Supabase insert error:', error);
  } catch (err) {
    console.error('Error saving order to Supabase:', err);
  }
  // Fallback to offline ID generation
  return 'VRB' + Date.now();
}

// Customer Details - fetches directly from profile, no popup
async function showCustomerDetailsModal(callback) {
  // Check if user is logged in
  if (typeof supabaseClient === 'undefined') {
    alert('Please sign in to place an order.');
    window.location.href = 'login.html';
    return;
  }

  try {
    const { data: { session } } = await supabaseClient.auth.getSession();
    
    if (!session || !session.user) {
      alert('Please sign in to place an order.');
      window.location.href = 'login.html';
      return;
    }

    const name = session.user.user_metadata?.full_name || '';
    const phone = session.user.user_metadata?.phone || '';

    if (name && phone) {
      // Profile is complete — proceed directly without any popup
      callback({ name, phone, address: 'Provided via Profile' });
    } else {
      // Profile is incomplete — show modal to collect missing details
      const existing = document.getElementById('collectDetailsModal');
      if (existing) existing.remove();

      const modal = document.createElement('div');
      modal.id = 'collectDetailsModal';
      modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.6);display:flex;align-items:center;justify-content:center;z-index:10000;backdrop-filter:blur(4px);';
      modal.innerHTML = `
        <div style="background:#fff;border-radius:16px;padding:28px 24px;width:90%;max-width:400px;box-shadow:0 20px 60px rgba(0,0,0,0.3);font-family:'Outfit',sans-serif;">
          <h3 style="margin:0 0 6px;font-size:1.25rem;color:#1a1a2e;font-weight:700;">📋 Complete Your Details</h3>
          <p style="margin:0 0 18px;font-size:0.85rem;color:#666;">Please provide your mobile number to complete your order. This will be saved to your profile.</p>
          <div style="margin-bottom:14px;">
            <label style="display:block;font-size:0.8rem;font-weight:600;color:#333;margin-bottom:4px;">Full Name *</label>
            <input type="text" id="custName" value="${name}" placeholder="Enter your full name" required
              style="width:100%;padding:10px 12px;border:1.5px solid #ddd;border-radius:8px;font-size:0.9rem;font-family:inherit;box-sizing:border-box;outline:none;transition:border 0.2s;"
              onfocus="this.style.borderColor='#e8630a'" onblur="this.style.borderColor='#ddd'">
          </div>
          <div style="margin-bottom:18px;">
            <label style="display:block;font-size:0.8rem;font-weight:600;color:#333;margin-bottom:4px;">Phone Number *</label>
            <input type="tel" id="custPhone" value="${phone}" placeholder="Enter 10-digit mobile number" required
              style="width:100%;padding:10px 12px;border:1.5px solid #ddd;border-radius:8px;font-size:0.9rem;font-family:inherit;box-sizing:border-box;outline:none;transition:border 0.2s;"
              onfocus="this.style.borderColor='#e8630a'" onblur="this.style.borderColor='#ddd'">
          </div>
          <div id="custError" style="color:#e53e3e;font-size:0.8rem;margin-bottom:10px;display:none;"></div>
          <div style="display:flex;gap:10px;">
            <button id="custCancel" style="flex:1;padding:10px;border:1.5px solid #ddd;border-radius:8px;background:#fff;color:#555;font-size:0.9rem;font-weight:600;cursor:pointer;font-family:inherit;">Cancel</button>
            <button id="custSubmit" style="flex:1;padding:10px;border:none;border-radius:8px;background:linear-gradient(135deg,#e8630a,#ff8c42);color:#fff;font-size:0.9rem;font-weight:600;cursor:pointer;font-family:inherit;">Save & Order</button>
          </div>
        </div>
      `;
      document.body.appendChild(modal);

      // Focus on first empty field
      setTimeout(() => {
        if (!name) document.getElementById('custName').focus();
        else if (!phone) document.getElementById('custPhone').focus();
      }, 100);

      document.getElementById('custCancel').onclick = () => modal.remove();
      modal.addEventListener('click', (e) => { if (e.target === modal) modal.remove(); });

      document.getElementById('custSubmit').onclick = async () => {
        const inputName = document.getElementById('custName').value.trim();
        const inputPhone = document.getElementById('custPhone').value.trim();
        const errorEl = document.getElementById('custError');
        const submitBtn = document.getElementById('custSubmit');

        if (!inputName || !inputPhone) {
          errorEl.textContent = 'Please fill in all fields.';
          errorEl.style.display = 'block';
          return;
        }
        if (!/^\d{10}$/.test(inputPhone)) {
          errorEl.textContent = 'Please enter a valid 10-digit phone number.';
          errorEl.style.display = 'block';
          return;
        }

        submitBtn.textContent = 'Saving...';
        submitBtn.disabled = true;

        try {
          // Save details to Supabase account
          const { error } = await supabaseClient.auth.updateUser({
            data: {
              full_name: inputName,
              phone: inputPhone
            }
          });

          if (error) throw error;

          modal.remove();
          callback({ name: inputName, phone: inputPhone, address: 'Provided via Profile' });
        } catch (err) {
          console.error('Error saving profile details:', err);
          errorEl.textContent = err.message || 'Failed to save profile. Please try again.';
          errorEl.style.display = 'block';
          submitBtn.textContent = 'Save & Order';
          submitBtn.disabled = false;
        }
      };
    }
  } catch (e) {
    console.error('Error fetching session:', e);
    alert('Please sign in to place an order.');
    window.location.href = 'login.html';
  }
}

// Simple toast notification
function showToast(message) {
  const existing = document.getElementById('appToast');
  if (existing) existing.remove();

  const toast = document.createElement('div');
  toast.id = 'appToast';
  toast.textContent = message;
  toast.style.cssText = `
    position: fixed; bottom: 30px; left: 50%; transform: translateX(-50%);
    background: #1a1a2e; color: #fff; padding: 14px 24px; border-radius: 12px;
    font-size: 0.9rem; font-family: 'Outfit', sans-serif; z-index: 99999;
    box-shadow: 0 8px 30px rgba(0,0,0,0.3); max-width: 90%; text-align: center;
    animation: toastIn 0.3s ease-out;
  `;
  document.body.appendChild(toast);
  setTimeout(() => toast.remove(), 4000);
}

// Confirmation overlay helper for WhatsApp redirects
function showWhatsAppConfirmationModal(orderId, isRental = false, onConfirm = null) {
  const existing = document.getElementById('whatsappConfirmModal');
  if (existing) existing.remove();

  const modal = document.createElement('div');
  modal.id = 'whatsappConfirmModal';
  modal.style.cssText = 'position:fixed;top:0;left:0;width:100%;height:100%;background:rgba(0,0,0,0.65);display:flex;align-items:center;justify-content:center;z-index:20000;backdrop-filter:blur(4px);';
  modal.innerHTML = `
    <div style="background:#fff;border-radius:16px;padding:32px 24px;width:90%;max-width:400px;box-shadow:0 24px 64px rgba(0,0,0,0.3);font-family:'Outfit',sans-serif;text-align:center;">
      <div style="font-size:3rem;margin-bottom:12px;">💬</div>
      <h3 style="margin:0 0 10px;font-size:1.3rem;color:#1a1a2e;font-weight:700;">Sent the message?</h3>
      <p style="margin:0 0 24px;font-size:0.88rem;line-height:1.5;color:#555;">We opened WhatsApp for you. Please click <strong>"Yes, I Sent It"</strong> below ONLY after you successfully send the message to complete your order.</p>
      <div style="display:flex;flex-direction:column;gap:10px;">
        <button id="confirmWhatsAppSent" style="padding:12px;border:none;border-radius:8px;background:linear-gradient(135deg,#e8630a,#ff8c42);color:#fff;font-size:0.9rem;font-weight:700;cursor:pointer;font-family:inherit;box-shadow:0 4px 12px rgba(232,99,10,0.25);">Yes, I Sent It</button>
        <button id="cancelWhatsAppOrder" style="padding:10px;border:1.5px solid #eee;border-radius:8px;background:#fff;color:#777;font-size:0.85rem;font-weight:600;cursor:pointer;font-family:inherit;transition:background 0.2s;" onmouseover="this.style.background='#fafafa'" onmouseout="this.style.background='#fff'">No, Cancel Order</button>
      </div>
    </div>
  `;
  document.body.appendChild(modal);

  document.getElementById('confirmWhatsAppSent').onclick = async () => {
    try {
      showToast('Processing order...');
      const { error } = await supabaseClient
        .from('orders')
        .update({ status: 'Pending' })
        .eq('id', orderId);

      if (error) throw error;
      
      showToast('Order placed successfully!');
      if (onConfirm) onConfirm();
    } catch (e) {
      console.error('Error confirming order:', e);
      showToast('Order confirmed locally.');
      if (onConfirm) onConfirm();
    } finally {
      modal.remove();
    }
  };

  document.getElementById('cancelWhatsAppOrder').onclick = async () => {
    if (confirm("Are you sure you want to cancel this order request? Your cart will be preserved.")) {
      try {
        showToast('Cancelling order...');
        await supabaseClient
          .from('orders')
          .delete()
          .eq('id', orderId);
        
        showToast('Order request cancelled.');
      } catch (e) {
        console.error('Error deleting draft order:', e);
      } finally {
        modal.remove();
      }
    }
  };
}

// Helper to format absolute image URL for WhatsApp previews
function getFullImageUrl(img) {
  if (!img) return '';
  if (img.startsWith('http://') || img.startsWith('https://')) return img;
  return window.location.origin + '/' + img.replace(/^\//, '');
}

// Checkout Flow
window.checkoutWhatsApp = () => {
  if (cart.length === 0) return;

  const proceed = confirm("Are you sure you want to proceed to checkout with this order?");
  if (!proceed) return;

  showCustomerDetailsModal(async (customer) => {
    let total = 0;
    cart.forEach((item) => {
      total += item.price * item.qty;
    });

    const orderId = await saveOrderToStorage({
      customerName: customer.name,
      mobileNumber: customer.phone,
      address: customer.address,
      items: cart.map(item => ({
        name: item.name,
        price: item.price,
        quantity: item.qty,
        image: getFullImageUrl(item.image || 'images/brass-diya.png')
      })),
      totalAmount: total,
      status: 'Pending'
    });

    let message = `Hello! I would like to order the following items from your Pooja Store:\n\n`;
    message += `*ORDER ID:* ${orderId}\n\n`;
    message += `*CUSTOMER DETAILS:*\n`;
    message += `- *Name:* ${customer.name}\n`;
    message += `- *Phone:* ${customer.phone}\n\n`;
    message += `*ORDER DETAILS:*\n`;

    cart.forEach((item, index) => {
      const itemTotal = item.price * item.qty;
      const fullImg = getFullImageUrl(item.image || 'images/brass-diya.png');
      message += `${index + 1}. *${item.name}* (Qty: ${item.qty}) - ₹${item.price} each [Total: ₹${itemTotal}]\n`;
      if (fullImg) {
        message += `   📷 Photo: ${fullImg}\n`;
      }
    });

    message += `\n*TOTAL AMOUNT:* ₹${total}\n\n`;
    message += `Please confirm the order and share delivery details. Thank you!`;

    const encodedText = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');

    // Show confirmation modal
    showWhatsAppConfirmationModal(orderId, false, () => {
      // Clear cart ONLY when successfully confirmed
      cart = [];
      saveCart();
      updateCartBadge();
      renderCart();
    });
  });
};

// Immediate Single Item WhatsApp Order Direct
window.orderDirect = (name, price, customImage) => {
  // Find matching product image from stored items / DEFAULT_ITEMS
  let matchedImg = customImage || '';
  if (!matchedImg) {
    const allProducts = globalProducts;
    const found = allProducts.find(p => p.name === name || name.startsWith(p.name));
    if (found && found.image) matchedImg = found.image;
  }
  const fullImg = getFullImageUrl(matchedImg || 'images/brass-diya.png');

  if (price > 0 && !name.includes('Inquiry') && !name.includes('Query')) {
    const proceed = confirm(`Are you sure you want to proceed with ordering "${name}"?`);
    if (!proceed) return;

    showCustomerDetailsModal(async (customer) => {
      const orderId = await saveOrderToStorage({
        customerName: customer.name,
        mobileNumber: customer.phone,
        address: customer.address,
        items: [{ name: name, price: price, quantity: 1, image: fullImg }],
        totalAmount: price,
        status: 'Pending'
      });

      let message = `Hello! I want to order the following item:\n\n`;
      message += `*ORDER ID:* ${orderId}\n\n`;
      message += `*CUSTOMER DETAILS:*\n`;
      message += `- *Name:* ${customer.name}\n`;
      message += `- *Phone:* ${customer.phone}\n\n`;
      message += `*Product:* ${name}\n`;
      message += `*Price:* ₹${price}\n`;
      if (fullImg) {
        message += `📷 *Photo:* ${fullImg}\n`;
      }
      message += `\nPlease confirm availability. Thank you!`;

      const encodedText = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodedText}`;
      window.open(whatsappUrl, '_blank');

      // Show confirmation modal
      showWhatsAppConfirmationModal(orderId, false);
    });
  } else {
    // For inquiries (no price), just open WhatsApp directly
    let message = `Hello! I want to inquire about: ${name}\n`;
    if (fullImg) {
      message += `📷 Photo: ${fullImg}\n`;
    }
    message += `\nPlease share details. Thank you!`;
    const encodedText = encodeURIComponent(message);
    const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodedText}`;
    window.open(whatsappUrl, '_blank');
  }
};


// 4. Rental Booking Form
function initBookingForm() {
  const form = document.getElementById('bookingForm');
  if (form) {
    // Set default date to tomorrow
    const dateInput = document.getElementById('bookingDate');
    if (dateInput) {
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      dateInput.min = tomorrow.toISOString().split('T')[0];
      dateInput.value = tomorrow.toISOString().split('T')[0];
    }

    form.addEventListener('submit', async (e) => {
      e.preventDefault();

      const name = document.getElementById('fullName').value.trim();
      const phone = document.getElementById('phoneNumber').value.trim();
      const date = document.getElementById('bookingDate').value;
      const duration = parseInt(document.getElementById('duration').value, 10);
      const address = document.getElementById('address').value.trim();

      if (!name || !phone || !date || !address) {
        alert('Please fill out all fields.');
        return;
      }

      const proceed = confirm("Are you sure you want to proceed with this rental booking?");
      if (!proceed) return;

      const totalAmount = (299 * duration) + 500;
      const orderId = await saveOrderToStorage({
        customerName: name,
        mobileNumber: phone,
        address: address,
        items: [{ name: 'Vratam Peta Setup Kit', price: 299, quantity: duration }],
        totalAmount: totalAmount,
        paymentMethod: 'UPI/Cash',
        status: 'Pending'
      });

      let message = `Hello! I would like to book a *Vratam Peta Rental* package:\n\n`;
      message += `*ORDER ID:* ${orderId}\n\n`;
      message += `*BOOKING DETAILS:*\n`;
      message += `- *Name:* ${name}\n`;
      message += `- *Phone:* ${phone}\n`;
      message += `- *Booking Date:* ${date}\n`;
      message += `- *Duration:* ${duration} Day(s)\n\n`;
      message += `Please confirm booking availability and details. Thank you!`;

      const encodedText = encodeURIComponent(message);
      const whatsappUrl = `https://wa.me/${WHATSAPP_PHONE}?text=${encodedText}`;
      window.open(whatsappUrl, '_blank');

      // Show confirmation modal
      showWhatsAppConfirmationModal(orderId, true, () => {
        // Reset form upon successful verification
        form.reset();
      });
    });
  }
}

// Subscribe to Back-in-Stock WhatsApp Notifications
window.subscribeStockNotification = async function(productId, productName) {
  let customerName = 'Customer';
  let mobileNumber = '';

  // Check if user is logged in
  if (typeof supabaseClient !== 'undefined') {
    try {
      const { data: { session } } = await supabaseClient.auth.getSession();
      if (session && session.user) {
        customerName = session.user.user_metadata?.full_name || 'Customer';
        mobileNumber = session.user.user_metadata?.phone || '';
      }
    } catch (e) {
      console.log('Error fetching user session:', e);
    }
  }

  // Prompt for mobile number if not present in profile
  if (!mobileNumber) {
    const input = prompt(`🔔 Back in Stock Alert\n\nEnter your 10-digit Mobile Number to receive a WhatsApp alert when "${productName}" is back in stock:`);
    if (!input) return;
    mobileNumber = input.replace(/\D/g, '');
    if (mobileNumber.length < 10) {
      alert('Please enter a valid 10-digit mobile number.');
      return;
    }
  }

  // Clean phone number (ensure 10 digits or 91 country code)
  let cleanMobile = mobileNumber.replace(/\D/g, '');
  if (cleanMobile.length === 10) cleanMobile = '91' + cleanMobile;

  // 1. Store subscription in LocalStorage (guaranteed local availability)
  try {
    const existing = JSON.parse(localStorage.getItem('pooja_stock_notifications') || '[]');
    // Avoid duplicate pending subscription for same product and mobile
    const alreadySubscribed = existing.some(n => !n.notified && (n.product_id === productId || n.product_name === productName) && n.mobile_number === cleanMobile);
    if (!alreadySubscribed) {
      existing.push({
        id: 'sn-' + Date.now(),
        product_id: productId,
        product_name: productName,
        customer_name: customerName,
        mobile_number: cleanMobile,
        notified: false,
        created_at: new Date().toISOString()
      });
      localStorage.setItem('pooja_stock_notifications', JSON.stringify(existing));
    }
  } catch (e) {
    console.error('LocalStorage stock_notifications error:', e);
  }

  // 2. Store subscription in Supabase table `stock_notifications`
  if (typeof supabaseClient !== 'undefined') {
    try {
      await supabaseClient
        .from('stock_notifications')
        .insert({
          product_id: productId,
          product_name: productName,
          customer_name: customerName,
          mobile_number: cleanMobile,
          notified: false
        });
    } catch (err) {
      console.warn('Supabase stock_notifications insert fallback:', err);
    }
  }

  alert(`✅ Thank you, ${customerName}!\n\nWe will send a WhatsApp alert to +${cleanMobile} as soon as "${productName}" is back in stock! 🪔`);
};



function renderSingleProductPage() {
  const container = document.getElementById('single-product-dynamic-container');
  if (!container) return; // Only runs on product.html
  
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get('id');
  
  if (typeof currentSlideIndex !== 'undefined') {
    currentSlideIndex = 0;
  }
  
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
  const safeName = item.name.replace(/'/g, "\'");
  const isOOS = !!item.outOfStock;

  container.innerHTML = `
    <div class="amazon-product-container" itemscope itemtype="https://schema.org/Product">
      
      <!-- LEFT: Image Box -->
      <div class="amazon-image-col" style="position: relative; overflow: hidden; display: flex; align-items: center; justify-content: center; min-height: 400px; background: #fff;">
        ${discount > 0 && !isOOS ? `<span class="amazon-discount-badge" style="z-index: 20;">${discount}% OFF</span>` : ''}
        ${isOOS ? `<div class="amazon-oos-overlay" style="z-index: 20;"><span>Out of Stock</span></div>` : ''}
        
        ${(item.images && item.images.length > 1) ? `
          <div class="product-slider-container">
            <div class="product-slider-track" id="productSliderTrack">
              ${item.images.map(imgSrc => `
                <div class="product-slider-slide">
                  <img src="${imgSrc}" alt="${item.name}" style="${isOOS ? 'opacity:0.5;filter:grayscale(40%);' : ''}" itemprop="image">
                </div>
              `).join('')}
            </div>
            <button class="slider-arrow prev" onclick="moveSlider(-1)">&#10094;</button>
            <button class="slider-arrow next" onclick="moveSlider(1)">&#10095;</button>
            <div class="slider-dots" id="productSliderDots">
              ${item.images.map((_, i) => `
                <div class="slider-dot ${i === 0 ? 'active' : ''}" onclick="goToSlide(${i})"></div>
              `).join('')}
            </div>
          </div>
        ` : `
          <img src="${item.image || 'images/brass-diya.png'}" alt="${item.name}" class="amazon-main-image" style="${isOOS ? 'opacity:0.5;filter:grayscale(40%);' : ''}" itemprop="image">
        `}
      </div>
      
      <!-- MIDDLE: Product Info -->
      <div class="amazon-info-col">
        <h1 class="amazon-title" itemprop="name">${item.name}</h1>
        <div class="amazon-brand">Visit the Veerabhadra Store</div>
        

        
        <div class="amazon-price-block" itemprop="offers" itemscope itemtype="https://schema.org/Offer">
          ${discount > 0 
            ? `<div class="amazon-discount-row"><span class="amazon-discount-pct">-${discount}%</span> <span class="amazon-price">₹${item.price}</span></div>` 
            : `<div class="amazon-price">₹${item.price}</div>`}
          <meta itemprop="price" content="${item.price}" />
          <meta itemprop="priceCurrency" content="INR" />
          
          ${item.mrp && item.mrp > item.price ? `<div class="amazon-mrp">M.R.P.: <span>₹${item.mrp}</span></div>` : ''}
          <div class="amazon-taxes">Inclusive of all taxes</div>
        </div>
        

        
        <div class="amazon-divider"></div>
        
        <div class="amazon-desc-block">
          <h3>About this item</h3>
          <ul class="amazon-desc-list">
            ${item.description ? item.description.split('\n').filter(l=>l.trim()).map(line => `<li>${line}</li>`).join('') : `<li>Premium quality traditional pooja item</li><li>Perfect for your sacred space and rituals</li><li>Carefully packed and delivered securely</li>`}
          </ul>
        </div>
      </div>
      
      <!-- RIGHT: Buy Box -->
      <div class="amazon-buy-box">
        <div class="amazon-buy-price">₹${item.price}</div>

        
        ${isOOS 
          ? `<h3 class="amazon-stock-status" style="color:#B12704;">Temporarily out of stock.</h3>` 
          : `<h3 class="amazon-stock-status">In stock</h3>`}
        
        ${!isOOS ? `<div class="amazon-qty">
          <label for="buyQty">Quantity: </label>
          <select id="buyQty" class="amazon-qty-select">
            <option>1</option><option>2</option><option>3</option><option>4</option>
          </select>
        </div>` : ''}
        
        <div class="amazon-buy-actions">
          ${isOOS 
            ? `<button class="amazon-btn amazon-btn-notify" onclick="subscribeStockNotification('${item.id}', '${safeName}')">Notify Me When Available</button>`
            : `<button class="amazon-btn amazon-btn-cart add-to-cart-btn" data-id="${item.id}" data-name="${item.name}" data-price="${item.price}" data-image="${item.image || 'images/brass-diya.png'}">Add to cart</button>
               <button class="amazon-btn" style="background:#25D366; border-color:#25D366; color:#fff;" onclick="orderDirect('${safeName}', ${item.price})">Order on WhatsApp</button>`
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
  `;
  
  // Update document title for SEO
  document.title = `${item.name} | Veerabhadra Pooja Store`;

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
  track.style.transform = `translateX(-${currentSlideIndex * 100}%)`;
  
  dots.forEach((dot, i) => {
    if (i === currentSlideIndex) {
      dot.classList.add('active');
    } else {
      dot.classList.remove('active');
    }
  });
}

/**
 * Smart Search Engine & Autocomplete UI Component
 * Veerabhadra Pooja Store & Rentals
 */

(function () {
  'use strict';

  // --- Constants & Config ---
  const MAX_RECENT_SEARCHES = 8;
  const DEBOUNCE_DELAY_MS = 250;
  const LOCAL_STORAGE_KEY = 'smart_recent_searches';

  const POPULAR_KEYWORDS = [
    { label: '🪔 Diyas', keyword: 'Diya' },
    { label: '🔔 Bells', keyword: 'Bell' },
    { label: '🪙 Brass Items', keyword: 'Brass' },
    { label: '🥣 Copper Items', keyword: 'Copper' },
    { label: '🖼️ Frames', keyword: 'Frame' },
    { label: '🛕 Rental Setups', keyword: 'Vratam' }
  ];

  // Default fallback products if database dynamic load is pending
  const DEFAULT_PRODUCTS = [
    { id: 1, name: 'Brass Diya (Deepam)', category: 'brass-items', price: 249, mrp: 399, rating: 4.9, image: 'images/brass-diya.png', description: 'Traditional handcrafted brass deepam for daily pooja.', tags: ['diya', 'deepam', 'brass', 'lamp'], sku: 'DIYA-BRASS-01' },
    { id: 2, name: 'Copper Kalash', category: 'copper-items', price: 349, mrp: 499, rating: 4.8, image: 'images/copper-kalash.png', description: 'Pure heavy-gauge copper kalash for rituals.', tags: ['kalash', 'copper', 'pot', 'pooja'], sku: 'KAL-COP-02' },
    { id: 3, name: 'Pooja Bell (Ghanti)', category: 'brass-items', price: 199, mrp: 299, rating: 4.7, image: 'images/brass-diya.png', description: 'Acoustic brass pooja bell with divine sound.', tags: ['bell', 'ghanti', 'brass', 'chime'], sku: 'BELL-BRASS-03' },
    { id: 4, name: 'Brass Agarbatti Stand', category: 'brass-items', price: 149, mrp: 199, rating: 4.6, image: 'images/brass-diya.png', description: 'Multi-hole brass incense holder.', tags: ['agarbatti', 'stand', 'incense', 'brass'], sku: 'INC-BRASS-04' },
    { id: 5, name: 'Camphor (Karpuram) Pack', category: 'pooja-samagri', price: 99, mrp: 120, rating: 4.9, image: 'images/brass-diya.png', description: '100% pure refined camphor for aarti.', tags: ['camphor', 'karpuram', 'aarti', 'samagri'], sku: 'CAM-SAM-05' },
    { id: 6, name: 'Satyanarayana Vratam Setup Kit', category: 'vratam-setups', price: 1499, mrp: 1999, rating: 5.0, image: 'images/hero.png', type: 'rental', description: 'Complete traditional setup kit for Satyanarayana Swamy Vratam.', tags: ['vratam', 'satyanarayana', 'rental', 'setup'], sku: 'SET-VRAT-06' },
    { id: 7, name: 'Varalakshmi Pooja Rental Set', category: 'vratam-setups', price: 1999, mrp: 2499, rating: 5.0, image: 'images/hero.png', type: 'rental', description: 'Grand Varalakshmi Vratham backdrop and peta setup.', tags: ['varalakshmi', 'vratham', 'rental', 'setup'], sku: 'SET-VARA-07' }
  ];

  // --- State Variables ---
  let productCatalog = [];
  let recentSearches = [];
  let activeIndex = -1;
  let currentSuggestions = [];
  let debounceTimer = null;

  // --- DOM Element References ---
  let searchInput = null;
  let searchWrapper = null;
  let searchBox = null;
  let clearBtn = null;
  let dropdown = null;
  let kbdShortcut = null;

  // --- Initialize Engine ---
  document.addEventListener('DOMContentLoaded', () => {
    initCatalog();
    loadRecentSearches();
    bindDOM();
    setupKeyboardShortcuts();
  });

  // Load Catalog from window.DEFAULT_ITEMS or fallback
  function initCatalog() {
    if (typeof window.DEFAULT_ITEMS !== 'undefined' && Array.isArray(window.DEFAULT_ITEMS)) {
      productCatalog = window.DEFAULT_ITEMS;
    } else {
      productCatalog = DEFAULT_PRODUCTS;
    }
  }

  // --- Recent Searches LocalStorage Logic ---
  function loadRecentSearches() {
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      recentSearches = stored ? JSON.parse(stored) : ['Brass Diya', 'Copper Kalash', 'Pooja Bell'];
    } catch (e) {
      recentSearches = ['Brass Diya', 'Copper Kalash'];
    }
  }

  function saveRecentSearch(query) {
    const trimmed = query.trim();
    if (!trimmed || trimmed.length < 2) return;

    recentSearches = recentSearches.filter(item => item.toLowerCase() !== trimmed.toLowerCase());
    recentSearches.unshift(trimmed);
    if (recentSearches.length > MAX_RECENT_SEARCHES) {
      recentSearches = recentSearches.slice(0, MAX_RECENT_SEARCHES);
    }
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(recentSearches));
    } catch (e) {
      // Ignore localStorage errors
    }
  }

  function removeRecentSearch(query, event) {
    if (event) event.stopPropagation();
    recentSearches = recentSearches.filter(item => item !== query);
    try {
      localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(recentSearches));
    } catch (e) {}
    renderDropdown();
  }

  function clearAllRecentSearches(event) {
    if (event) event.stopPropagation();
    recentSearches = [];
    try {
      localStorage.removeItem(LOCAL_STORAGE_KEY);
    } catch (e) {}
    renderDropdown();
  }

  // --- Fuzzy / Levenshtein Distance Calculation for Typos ---
  function levenshteinDistance(a, b) {
    if (a.length === 0) return b.length;
    if (b.length === 0) return a.length;
    const matrix = [];
    for (let i = 0; i <= b.length; i++) matrix[i] = [i];
    for (let j = 0; j <= a.length; j++) matrix[0][j] = j;

    for (let i = 1; i <= b.length; i++) {
      for (let j = 1; j <= a.length; j++) {
        if (b.charAt(i - 1) === a.charAt(j - 1)) {
          matrix[i][j] = matrix[i - 1][j - 1];
        } else {
          matrix[i][j] = Math.min(
            matrix[i - 1][j - 1] + 1, // substitution
            matrix[i][j - 1] + 1,     // insertion
            matrix[i - 1][j] + 1      // deletion
          );
        }
      }
    }
    return matrix[b.length][a.length];
  }

  // --- Intelligent Scoring & Search Scope Algorithm ---
  function performSearch(query) {
    const q = query.trim().toLowerCase();
    if (!q) return [];

    // Singular/plural normalized term (e.g. "diyas" -> "diya", "bells" -> "bell")
    const qSingular = q.endsWith('s') && q.length > 3 ? q.slice(0, -1) : q;

    const scoredResults = [];

    productCatalog.forEach(item => {
      let score = 0;
      const name = (item.name || '').toLowerCase();
      const category = (item.category || '').toLowerCase().replace(/-/g, ' ');
      const desc = (item.description || '').toLowerCase();
      const sku = (item.sku || '').toLowerCase();
      const tags = Array.isArray(item.tags) ? item.tags.join(' ').toLowerCase() : '';

      // 1. Exact Name match or StartsWith Name Match (Highest priority score)
      if (name === q || name === qSingular) {
        score += 100;
      } else if (name.startsWith(q) || name.startsWith(qSingular)) {
        score += 75;
      } else if (name.includes(` ${q}`) || name.includes(` ${qSingular}`)) {
        score += 60;
      } else if (name.includes(q) || name.includes(qSingular)) {
        score += 45;
      }

      // 2. Category match
      if (category.includes(q) || category.includes(qSingular)) {
        score += 35;
      }

      // 3. Tags & Keywords match
      if (tags.includes(q) || tags.includes(qSingular)) {
        score += 30;
      }

      // 4. SKU match
      if (sku.includes(q)) {
        score += 25;
      }

      // 5. Description match
      if (desc.includes(q) || desc.includes(qSingular)) {
        score += 15;
      }

      // 6. Typo Tolerance via Fuzzy Match if length >= 3
      if (score === 0 && q.length >= 3) {
        const words = name.split(/\s+/);
        words.forEach(w => {
          if (Math.abs(w.length - q.length) <= 2) {
            const dist = levenshteinDistance(q, w);
            if (dist === 1) score += 20; // 1 typo error
            else if (dist === 2 && q.length >= 5) score += 10; // 2 typo errors
          }
        });
      }

      if (score > 0) {
        scoredResults.push({ item, score });
      }
    });

    // Sort by score descending
    scoredResults.sort((a, b) => b.score - a.score);
    return scoredResults.map(res => res.item).slice(0, 10);
  }

  // --- Highlight Matching Query Substring ---
  function highlightText(text, query) {
    if (!query) return text;
    const escapedQuery = query.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${escapedQuery})`, 'gi');
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
  }

  // --- Bind DOM Elements & Event Listeners ---
  function bindDOM() {
    searchInput = document.getElementById('smartSearchInput');
    searchWrapper = document.querySelector('.smart-search-wrapper');
    searchBox = document.querySelector('.smart-search-box');
    clearBtn = document.getElementById('smartSearchClearBtn');
    dropdown = document.getElementById('smartSearchDropdown');
    kbdShortcut = document.getElementById('searchKbdBadge');

    if (!searchInput || !dropdown) return;

    // Detect OS for Cmd+K vs Ctrl+K display
    if (kbdShortcut) {
      const isMac = navigator.platform.toUpperCase().indexOf('MAC') >= 0;
      kbdShortcut.textContent = isMac ? '⌘K' : 'Ctrl+K';
    }

    // Input Typing Handler (Debounced)
    searchInput.addEventListener('input', () => {
      toggleClearBtn();
      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        renderDropdown();
      }, DEBOUNCE_DELAY_MS);
    });

    // Focus & Click Handler
    searchInput.addEventListener('focus', () => {
      renderDropdown();
    });

    // Clear Button Click Handler
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        toggleClearBtn();
        renderDropdown();
        searchInput.focus();
      });
    }

    // Quick Chips Handler
    document.addEventListener('click', (e) => {
      const chip = e.target.closest('.quick-chip');
      if (chip) {
        const keyword = chip.getAttribute('data-keyword');
        if (keyword && searchInput) {
          searchInput.value = keyword;
          toggleClearBtn();
          saveRecentSearch(keyword);
          renderDropdown();
          searchInput.focus();
        }
      }
    });

    // Close Dropdown on Click Outside
    document.addEventListener('click', (e) => {
      if (searchWrapper && !searchWrapper.contains(e.target)) {
        closeDropdown();
      }
    });
  }

  function toggleClearBtn() {
    if (!clearBtn) return;
    if (searchInput.value.trim().length > 0) {
      clearBtn.style.display = 'flex';
    } else {
      clearBtn.style.display = 'none';
    }
  }

  function closeDropdown() {
    if (dropdown) {
      dropdown.style.display = 'none';
      if (searchInput) searchInput.setAttribute('aria-expanded', 'false');
    }
    activeIndex = -1;
  }

  // --- Render Dropdown (State Machine) ---
  function renderDropdown() {
    if (!searchInput || !dropdown) return;

    const query = searchInput.value.trim();
    activeIndex = -1;

    // STATE 1: Empty Query -> Show Recent Searches & Popular Chips
    if (!query) {
      renderEmptyFocusState();
      return;
    }

    // STATE 2: Performing Search
    const matches = performSearch(query);
    currentSuggestions = matches;

    // STATE 3: Zero Results Found
    if (matches.length === 0) {
      renderZeroResultsState(query);
      return;
    }

    // STATE 4: Matching Live Suggestions (Amazon-like Horizontal List Format)
    let html = `
      <div class="search-dropdown-header" style="background:#fdfbf7; padding:10px 16px; font-size:0.78rem; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#800000; border-bottom:1px solid #f0e6d6; display:flex; justify-content:space-between; align-items:center;">
        <span>Matching Products (${matches.length})</span>
        <span style="font-weight:normal; font-size:0.72rem; color:#777;">Click item to view details</span>
      </div>
      <ul class="search-results-list" role="listbox" id="smartSearchResultsList" style="list-style:none !important; margin:0 !important; padding:0 !important;">
    `;

    matches.forEach((item, index) => {
      const categoryLabel = (item.category || 'Products').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const highlightedName = highlightText(item.name, query);
      const isOos = !!item.outOfStock;
      const isRental = item.type === 'rental';

      html += `
        <li class="search-suggestion-item amazon-item-row" id="searchOption-${index}" role="option" aria-selected="false" data-index="${index}" data-id="${item.id}" data-category="${item.category || ''}" data-name="${item.name.replace(/"/g, '&quot;')}" style="display:flex !important; align-items:center !important; justify-content:space-between !important; gap:14px !important; padding:12px 16px !important; border-bottom:1px solid #f0f0f0 !important; cursor:pointer !important; list-style:none !important; text-align:left !important; background:#ffffff !important; transition:background 0.15s ease !important;">
          <div class="item-thumb-wrapper" style="width:52px !important; height:52px !important; min-width:52px !important; min-height:52px !important; max-width:52px !important; max-height:52px !important; border-radius:8px !important; overflow:hidden !important; background:#f9f9f9 !important; border:1px solid #eaeaea !important; flex-shrink:0 !important; display:flex !important; align-items:center !important; justify-content:center !important;">
            <img src="${item.image || 'images/brass-diya.png'}" alt="${item.name}" class="item-thumb" style="width:100% !important; height:100% !important; object-fit:cover !important; border-radius:7px !important; display:block !important; margin:0 !important;">
          </div>
          <div class="item-details" style="flex:1 !important; min-width:0 !important; text-align:left !important;">
            <div class="item-name" style="font-weight:700 !important; font-size:0.92rem !important; color:#111111 !important; white-space:nowrap !important; overflow:hidden !important; text-overflow:ellipsis !important; margin:0 0 4px 0 !important; line-height:1.25 !important;">${highlightedName}</div>
            <div class="item-meta" style="display:flex !important; align-items:center !important; flex-wrap:wrap !important; gap:6px !important;">
              <span class="item-category-tag" style="font-size:0.72rem !important; color:#444444 !important; background:#f4f4f4 !important; font-weight:600 !important; padding:2px 8px !important; border-radius:10px !important; display:inline-block !important;">${categoryLabel}</span>
              ${item.rating ? `<span class="item-rating-tag" style="font-size:0.72rem !important; color:#b45309 !important; background:#fef3c7 !important; font-weight:700 !important; padding:2px 8px !important; border-radius:10px !important; display:inline-flex !important; align-items:center !important; gap:2px !important;">★ ${item.rating}</span>` : ''}
              ${isRental ? '<span class="item-rental-tag" style="font-size:0.72rem !important; color:#800000 !important; background:#fde8e8 !important; font-weight:700 !important; padding:2px 8px !important; border-radius:10px !important; display:inline-block !important;">Rental Setup</span>' : ''}
              ${isOos ? '<span class="item-oos-tag" style="font-size:0.72rem !important; color:#d32f2f !important; background:#ffebee !important; font-weight:700 !important; padding:2px 8px !important; border-radius:10px !important; display:inline-block !important;">Out of Stock</span>' : ''}
            </div>
          </div>
          <div class="item-action-col" style="display:flex !important; flex-direction:column !important; align-items:flex-end !important; justify-content:center !important; flex-shrink:0 !important; min-width:85px !important;">
            <div class="item-price" style="font-weight:800 !important; font-size:0.96rem !important; color:#800000 !important; white-space:nowrap !important;">
              ₹${item.price}${isRental ? '<span style="font-size:0.7rem;font-weight:normal;color:#666;">/day</span>' : ''}
            </div>
            ${item.mrp && item.mrp > item.price ? `<div style="font-size:0.72rem; color:#888; text-decoration:line-through; font-weight:500;">₹${item.mrp}</div>` : ''}
            <span class="view-item-link" style="font-size:0.75rem !important; font-weight:700 !important; color:#d4af37 !important; margin-top:2px !important; display:inline-flex !important; align-items:center !important;">View &rarr;</span>
          </div>
        </li>
      `;
    });

    html += `</ul>`;
    dropdown.innerHTML = html;
    dropdown.style.display = 'block';
    searchInput.setAttribute('aria-expanded', 'true');

    bindItemClickEvents();
  }

  // --- State 1: Render Recent Searches & Popular Chips ---
  function renderEmptyFocusState() {
    let html = '';

    if (recentSearches.length > 0) {
      html += `
        <div class="search-dropdown-header" style="background:#fdfbf7; padding:8px 14px; font-size:0.78rem; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#800000; border-bottom:1px solid #f0e6d6; display:flex; justify-content:space-between; align-items:center;">
          <span>Recent Searches</span>
          <button type="button" id="clearAllRecentBtn" style="background:none; border:none; color:#888; font-size:0.75rem; cursor:pointer; text-decoration:underline;">Clear All</button>
        </div>
        <ul style="list-style:none; margin:0; padding:0;">
      `;
      recentSearches.forEach((term, idx) => {
        html += `
          <li class="search-recent-item" data-term="${term.replace(/"/g, '&quot;')}" style="display:flex; align-items:center; justify-content:space-between; padding:9px 14px; border-bottom:1px solid #f5f5f5; cursor:pointer; font-size:0.88rem; color:#333;">
            <span style="display:flex; align-items:center; gap:8px;">
              <span style="opacity:0.5;">🕒</span> ${term}
            </span>
            <button type="button" class="remove-recent-btn" data-term="${term.replace(/"/g, '&quot;')}" aria-label="Remove search" style="background:none; border:none; color:#aaa; font-size:1rem; cursor:pointer; padding:0 4px;">&times;</button>
          </li>
        `;
      });
      html += `</ul>`;
    }

    html += `
      <div class="search-dropdown-header" style="background:#fdfbf7; padding:8px 14px; font-size:0.78rem; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#800000; border-bottom:1px solid #f0e6d6;">Popular Searches</div>
      <div style="padding:10px 14px; display:flex; flex-wrap:wrap; gap:8px; background:#fff;">
    `;
    POPULAR_KEYWORDS.forEach(chip => {
      html += `
        <button type="button" class="quick-chip" data-keyword="${chip.keyword}" style="background:#fcf9f2; border:1px solid #e0d0b0; border-radius:20px; padding:5px 12px; font-size:0.8rem; font-weight:600; color:#800000; cursor:pointer;">
          ${chip.label}
        </button>
      `;
    });
    html += `</div>`;

    dropdown.innerHTML = html;
    dropdown.style.display = 'block';
    searchInput.setAttribute('aria-expanded', 'true');

    // Bind Clear All & Remove handlers
    const clearAllBtn = document.getElementById('clearAllRecentBtn');
    if (clearAllBtn) {
      clearAllBtn.addEventListener('click', clearAllRecentSearches);
    }
    const removeBtns = dropdown.querySelectorAll('.remove-recent-btn');
    removeBtns.forEach(btn => {
      btn.addEventListener('click', (e) => {
        const term = btn.getAttribute('data-term');
        removeRecentSearch(term, e);
      });
    });

    const recentItems = dropdown.querySelectorAll('.search-recent-item');
    recentItems.forEach(item => {
      item.addEventListener('click', (e) => {
        if (e.target.classList.contains('remove-recent-btn')) return;
        const term = item.getAttribute('data-term');
        if (term) {
          searchInput.value = term;
          toggleClearBtn();
          saveRecentSearch(term);
          renderDropdown();
          searchInput.focus();
        }
      });
    });
  }

  // --- State 3: Render Zero Results Empty State ---
  function renderZeroResultsState(query) {
    let html = `
      <div class="search-empty-state" style="text-align:center; padding:1.5rem 1rem; color:#666;">
        <div style="font-size:2rem; margin-bottom:0.4rem;">🪔</div>
        <p style="font-weight:700; color:#222; font-size:0.95rem; margin:0;">No products found for "${query}"</p>
        <p style="font-size:0.82rem; color:#777; margin:4px 0 12px 0;">Try searching for popular items below:</p>
        <div style="display:flex; flex-wrap:wrap; justify-content:center; gap:6px;">
    `;
    POPULAR_KEYWORDS.slice(0, 4).forEach(chip => {
      html += `
        <button type="button" class="quick-chip" data-keyword="${chip.keyword}" style="background:#fcf9f2; border:1px solid #e0d0b0; border-radius:20px; padding:4px 10px; font-size:0.78rem; font-weight:600; color:#800000; cursor:pointer;">
          ${chip.label}
        </button>
      `;
    });
    html += `
        </div>
      </div>
    `;

    dropdown.innerHTML = html;
    dropdown.style.display = 'block';
    searchInput.setAttribute('aria-expanded', 'true');
  }

  // --- Item Click Handler & Navigation ---
  function bindItemClickEvents() {
    const items = dropdown.querySelectorAll('.search-suggestion-item');
    items.forEach(el => {
      el.addEventListener('click', () => {
        const name = el.getAttribute('data-name');
        const category = el.getAttribute('data-category');
        if (name) saveRecentSearch(name);

        closeDropdown();

        if (category === 'vratam-setups' || category === 'rental') {
          window.location.href = '/rental';
        } else if (category) {
          window.location.href = `/products#${category}`;
        } else {
          window.location.href = '/products';
        }
      });
    });
  }

  // --- Keyboard & Shortcuts Setup (Ctrl+K, Arrows, Enter, Esc) ---
  function setupKeyboardShortcuts() {
    // Global Ctrl+K or Cmd+K
    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        if (searchInput) {
          searchInput.focus();
          searchInput.select();
          renderDropdown();
        }
      }
    });

    if (!searchInput) return;

    // Navigation inside search input
    searchInput.addEventListener('keydown', (e) => {
      const listItems = dropdown ? dropdown.querySelectorAll('.search-suggestion-item, .search-recent-item') : [];

      if (e.key === 'Escape') {
        closeDropdown();
        return;
      }

      if (listItems.length === 0 || dropdown.style.display === 'none') return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndex = (activeIndex + 1) % listItems.length;
        updateKeyboardFocus(listItems);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex = (activeIndex - 1 + listItems.length) % listItems.length;
        updateKeyboardFocus(listItems);
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeIndex >= 0 && listItems[activeIndex]) {
          listItems[activeIndex].click();
        } else if (currentSuggestions.length > 0 && currentSuggestions[0]) {
          const first = currentSuggestions[0];
          saveRecentSearch(first.name);
          closeDropdown();
          if (first.category === 'vratam-setups') {
            window.location.href = '/rental';
          } else {
            window.location.href = `/products#${first.category || ''}`;
          }
        } else if (searchInput.value.trim()) {
          saveRecentSearch(searchInput.value.trim());
          closeDropdown();
          window.location.href = '/products';
        }
      }
    });
  }

  function updateKeyboardFocus(items) {
    items.forEach((item, index) => {
      if (index === activeIndex) {
        item.classList.add('active-keyboard-focus');
        item.setAttribute('aria-selected', 'true');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('active-keyboard-focus');
        item.setAttribute('aria-selected', 'false');
      }
    });
  }

})();

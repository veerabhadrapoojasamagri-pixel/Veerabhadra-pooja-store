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
  let searchIcon = null;

  // --- Initialize Engine ---
  document.addEventListener('DOMContentLoaded', () => {
    initCatalog();
    loadRecentSearches();
    bindDOM();
    setupKeyboardShortcuts();
  });

  // Load Catalog from globalProducts or fallback
  function initCatalog() {
    if (typeof globalProducts !== 'undefined' && Array.isArray(globalProducts) && globalProducts.length > 0) {
      productCatalog = globalProducts;
    } else if (typeof window.DEFAULT_ITEMS !== 'undefined' && Array.isArray(window.DEFAULT_ITEMS)) {
      productCatalog = window.DEFAULT_ITEMS;
    } else {
      productCatalog = DEFAULT_PRODUCTS;
    }
  }

  window.addEventListener('productsLoaded', (e) => {
    if (e.detail && Array.isArray(e.detail)) {
      productCatalog = e.detail;
    }
  });

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
      
      const query = searchInput.value.trim();
      if (query.length > 0) {
        searchBox.classList.add('is-loading');
      } else {
        searchBox.classList.remove('is-loading');
      }

      clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        searchBox.classList.remove('is-loading');
        renderDropdown();
      }, DEBOUNCE_DELAY_MS);
    });

    // Focus & Click Handler
    searchInput.addEventListener('focus', () => {
      renderDropdown();
      searchBox.classList.add('is-focused');
    });

    searchInput.addEventListener('blur', () => {
      searchBox.classList.remove('is-focused');
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
      dropdown.classList.remove('show');
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

    // STATE 4: Matching Live Suggestions
    let html = `
      <div class="search-dropdown-header">
        <span>Matching Products (${matches.length})</span>
        <span class="search-dropdown-hint">Click item to view details</span>
      </div>
      <ul class="search-results-list" role="listbox" id="smartSearchResultsList">
    `;

    matches.forEach((item, index) => {
      const categoryLabel = (item.category || 'Products').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const highlightedName = highlightText(item.name, query);
      const isOos = !!item.outOfStock;
      const isRental = item.type === 'rental';

      html += `
        <li class="search-suggestion-item amazon-item-row" id="searchOption-${index}" role="option" aria-selected="false" data-index="${index}" data-id="${item.id}" data-category="${item.category || ''}" data-name="${item.name.replace(/"/g, '&quot;')}">
          <div class="item-thumb-wrapper">
            <img src="${item.image || 'images/brass-diya.png'}" alt="${item.name}" class="item-thumb" loading="lazy">
          </div>
          <div class="item-details">
            <div class="item-name" title="${item.name}">${highlightedName}</div>
            <div class="item-meta">
              <span class="item-category-tag">${categoryLabel}</span>
              ${item.rating ? `<span class="item-rating-tag"><svg viewBox="0 0 24 24" fill="currentColor" width="10" height="10"><path d="M12 17.27L18.18 21l-1.64-7.03L22 9.24l-7.19-.61L12 2 9.19 8.63 2 9.24l5.46 4.73L5.82 21z"/></svg> ${item.rating}</span>` : ''}
              ${isRental ? '<span class="item-rental-tag">Rental Setup</span>' : ''}
              ${isOos ? '<span class="item-oos-tag">Out of Stock</span>' : ''}
            </div>
          </div>
          <div class="item-action-col">
            <span class="view-item-link">View &rarr;</span>
          </div>
        </li>
      `;
    });

    html += `</ul>`;
    dropdown.innerHTML = html;
    dropdown.classList.add('show');
    searchInput.setAttribute('aria-expanded', 'true');

    bindItemClickEvents();
  }

  // --- State 1: Render Recent Searches & Popular Chips ---
  function renderEmptyFocusState() {
    let html = '';

    if (recentSearches.length > 0) {
      html += `
        <div class="search-dropdown-header">
          <span>Recent Searches</span>
          <button type="button" id="clearAllRecentBtn" class="search-clear-all-btn">Clear All</button>
        </div>
        <ul class="search-recent-list">
      `;
      recentSearches.forEach((term, idx) => {
        html += `
          <li class="search-recent-item" data-term="${term.replace(/"/g, '&quot;')}">
            <span class="recent-term-label">
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2"><circle cx="12" cy="12" r="10"></circle><polyline points="12 6 12 12 16 14"></polyline></svg>
              ${term}
            </span>
            <button type="button" class="remove-recent-btn" data-term="${term.replace(/"/g, '&quot;')}" aria-label="Remove search">&times;</button>
          </li>
        `;
      });
      html += `</ul>`;
    }

    html += `
      <div class="search-dropdown-header">Popular Searches</div>
      <div class="search-popular-chips-container">
    `;
    POPULAR_KEYWORDS.forEach(chip => {
      html += `
        <button type="button" class="quick-chip" data-keyword="${chip.keyword}">
          ${chip.label}
        </button>
      `;
    });
    html += `</div>`;

    dropdown.innerHTML = html;
    dropdown.classList.add('show');
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
      <div class="search-empty-state">
        <div class="empty-state-icon">🪔</div>
        <p class="empty-state-title">No products found for "${query}"</p>
        <p class="empty-state-subtitle">Try searching for popular items below:</p>
        <div class="search-popular-chips-container empty-state-chips">
    `;
    POPULAR_KEYWORDS.slice(0, 4).forEach(chip => {
      html += `
        <button type="button" class="quick-chip" data-keyword="${chip.keyword}">
          ${chip.label}
        </button>
      `;
    });
    html += `
        </div>
      </div>
    `;

    dropdown.innerHTML = html;
    dropdown.classList.add('show');
    searchInput.setAttribute('aria-expanded', 'true');
  }

  // --- Item Click Handler & Navigation ---
  function bindItemClickEvents() {
    const items = dropdown.querySelectorAll('.search-suggestion-item');
    items.forEach(el => {
      el.addEventListener('click', () => {
        const name = el.getAttribute('data-name');
        const category = el.getAttribute('data-category');
        const id = el.getAttribute('data-id');
        if (name) saveRecentSearch(name);

        closeDropdown();

        if (id) {
          window.location.href = `/product.html?id=${id}`;
        } else if (category === 'vratam-setups' || category === 'rental') {
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

      if (listItems.length === 0 || !dropdown.classList.contains('show')) return;

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
          if (first.id) {
            window.location.href = `/product.html?id=${first.id}`;
          } else if (first.category === 'vratam-setups') {
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

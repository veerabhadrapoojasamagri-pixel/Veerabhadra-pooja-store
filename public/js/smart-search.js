// =============================================================================
// Smart Search Component - Veerabhadra Pooja Store
// Intuitive, fast, and accessible search experience for non-tech-savvy users
// =============================================================================

(function () {
  'use strict';

  // Local Storage Keys
  const RECENT_SEARCHES_KEY = 'pooja_recent_searches';
  const MAX_RECENT_SEARCHES = 5;

  // Synonyms & Common Keyword Mappings for Typo / Vernacular Matching
  const SYNONYM_MAP = {
    'diya': ['deepam', 'lamp', 'oil lamp', 'brass diya', 'diyas', 'dee', 'depam', 'jyoti'],
    'deepam': ['diya', 'lamp', 'brass diya', 'diyas'],
    'bell': ['ganta', 'ghanti', 'handbell', 'pooja bell', 'bells', 'bel'],
    'ganta': ['bell', 'handbell', 'pooja bell'],
    'kalash': ['copper kalash', 'pot', 'lota', 'chumbu', 'water pot', 'kalasha', 'kalasa'],
    'lota': ['kalash', 'copper lota', 'chumbu', 'pot'],
    'camphor': ['karpuram', 'karpooram', 'kapoor', 'tablets'],
    'karpuram': ['camphor', 'karpooram', 'kapoor'],
    'sandalwood': ['chandanam', 'chandan', 'sandal paste'],
    'chandanam': ['sandalwood', 'chandan'],
    'frame': ['photo frame', 'ganesha', 'lakshmi', 'radha krishna', 'deity frame', 'god photo'],
    'peta': ['vratam peta', 'rental', 'setup kit', 'vratam setup', 'peeta', 'peetam'],
    'rental': ['vratam peta', 'peta', 'setup kit', 'rent'],
    'kit': ['pooja kit', 'essentials kit', 'vratam peta'],
    'brass': ['diya', 'bell', 'plate', 'aarti thali', 'brass items'],
    'copper': ['kalash', 'panchapatra', 'lota', 'copper items'],
    'kumkum': ['vermillion', 'sindoor', 'pooja powder'],
    'coconut': ['kobbari', 'tenkayi', 'pooja coconut'],
    'idols': ['vigraham', 'statue', 'brass idol', 'god statue']
  };

  // Main State Variables
  let searchInput, clearBtn, dropdown, chipsContainer;
  let debounceTimer = null;
  let activeIndex = -1;
  let currentSuggestions = [];

  // Helper: Get catalog items from localStorage or fallback
  function getCatalogItems() {
    try {
      const stored = localStorage.getItem('pooja_store_items');
      if (stored) {
        const parsed = JSON.parse(stored);
        if (Array.isArray(parsed) && parsed.length > 0) return parsed;
      }
    } catch (e) {
      console.warn('[SmartSearch] Could not read stored catalog:', e);
    }
    return typeof DEFAULT_ITEMS !== 'undefined' ? DEFAULT_ITEMS : [];
  }

  // Helper: Get recent searches
  function getRecentSearches() {
    try {
      const searches = localStorage.getItem(RECENT_SEARCHES_KEY);
      return searches ? JSON.parse(searches) : [];
    } catch (e) {
      return [];
    }
  }

  // Helper: Save recent search query
  function saveRecentSearch(query) {
    if (!query || !query.trim()) return;
    const cleanQuery = query.trim();
    let searches = getRecentSearches();
    searches = searches.filter(s => s.toLowerCase() !== cleanQuery.toLowerCase());
    searches.unshift(cleanQuery);
    if (searches.length > MAX_RECENT_SEARCHES) {
      searches = searches.slice(0, MAX_RECENT_SEARCHES);
    }
    try {
      localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(searches));
    } catch (e) {}
  }

  // Helper: Clear recent searches
  function clearRecentSearches() {
    try {
      localStorage.removeItem(RECENT_SEARCHES_KEY);
    } catch (e) {}
    renderRecentSearches();
  }

  // Matching Engine: Multi-field Partial & Synonym Search
  function performSearch(query) {
    const rawQuery = query.trim().toLowerCase();
    if (!rawQuery) return [];

    const catalog = getCatalogItems();
    
    // Find expanded synonym terms
    let expandedTerms = [rawQuery];
    Object.keys(SYNONYM_MAP).forEach(key => {
      if (key.includes(rawQuery) || rawQuery.includes(key)) {
        expandedTerms.push(key, ...SYNONYM_MAP[key]);
      } else {
        SYNONYM_MAP[key].forEach(syn => {
          if (syn.includes(rawQuery) || rawQuery.includes(syn)) {
            expandedTerms.push(key, syn);
          }
        });
      }
    });
    expandedTerms = Array.from(new Set(expandedTerms));

    const scoredResults = catalog.map(item => {
      let score = 0;
      const name = (item.name || '').toLowerCase();
      const category = (item.category || '').toLowerCase();
      const desc = (item.description || '').toLowerCase();
      const type = (item.type || '').toLowerCase();

      // Exact name match
      if (name === rawQuery) score += 100;
      // Name starts with query
      else if (name.startsWith(rawQuery)) score += 80;
      // Name contains query
      else if (name.includes(rawQuery)) score += 60;

      // Category matches
      if (category.includes(rawQuery)) score += 40;
      if (type.includes(rawQuery)) score += 30;
      if (desc.includes(rawQuery)) score += 20;

      // Synonym expansion matching
      expandedTerms.forEach(term => {
        if (name.includes(term)) score += 25;
        if (category.includes(term)) score += 15;
        if (desc.includes(term)) score += 10;
      });

      // Rating & Popularity boost
      if (item.rating) score += item.rating * 2;
      if (item.type === 'rental') score += 5; // Highlight unique rental service

      return { item, score };
    });

    // Filter non-zero scores and sort descending by score
    return scoredResults
      .filter(res => res.score > 0)
      .sort((a, b) => b.score - a.score)
      .map(res => res.item);
  }

  // Highlight query term in text
  function highlightText(text, query) {
    if (!query || !query.trim()) return text;
    const cleanQuery = query.trim().replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const regex = new RegExp(`(${cleanQuery})`, 'gi');
    return text.replace(regex, '<mark class="search-highlight">$1</mark>');
  }

  // Render Suggestions Dropdown
  function renderSuggestions(query) {
    const cleanQuery = query.trim();
    activeIndex = -1;

    if (!cleanQuery) {
      renderRecentSearches();
      return;
    }

    const matches = performSearch(cleanQuery);
    currentSuggestions = matches;

    if (matches.length === 0) {
      dropdown.innerHTML = `
        <div class="search-empty-state">
          <div class="empty-icon">🪔</div>
          <p class="empty-title">No matching products found</p>
          <p class="empty-sub">Try another keyword like <strong>"Diya"</strong>, <strong>"Kalash"</strong>, or <strong>"Bell"</strong></p>
          <a href="/products" class="btn btn-secondary btn-sm" style="margin-top: 0.75rem; display: inline-block;">Browse All Products</a>
        </div>
      `;
      dropdown.style.display = 'block';
      return;
    }

    let html = `<div class="search-dropdown-header" style="background:#fcf9f2; padding:8px 14px; font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#800000; border-bottom:1px solid #f0e6d6;">Matching Products (${matches.length})</div><ul class="search-results-list" role="listbox" style="list-style:none !important; margin:0 !important; padding:0 !important;">`;

    matches.forEach((item, index) => {
      const categoryLabel = (item.category || 'Products').replace(/-/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
      const highlightedName = highlightText(item.name, cleanQuery);
      const isOos = !!item.outOfStock;
      const isRental = item.type === 'rental';

      html += `
        <li class="search-suggestion-item" role="option" data-index="${index}" data-id="${item.id}" data-category="${item.category || ''}" data-name="${item.name.replace(/"/g, '&quot;')}" style="display:flex !important; align-items:center !important; gap:12px !important; padding:10px 14px !important; border-bottom:1px solid #f5f5f5 !important; cursor:pointer !important; list-style:none !important; text-align:left !important; background:#ffffff;">
          <div class="item-thumb-wrapper" style="width:44px !important; height:44px !important; min-width:44px !important; min-height:44px !important; max-width:44px !important; max-height:44px !important; border-radius:8px !important; overflow:hidden !important; background:#f5f5f5 !important; flex-shrink:0 !important;">
            <img src="${item.image || 'images/brass-diya.png'}" alt="${item.name}" class="item-thumb" style="width:44px !important; height:44px !important; min-width:44px !important; min-height:44px !important; max-width:44px !important; max-height:44px !important; object-fit:cover !important; border-radius:8px !important; display:block !important; margin:0 !important;">
          </div>
          <div class="item-details" style="flex:1 !important; min-width:0 !important; text-align:left !important;">
            <div class="item-name" style="font-weight:600 !important; font-size:0.9rem !important; color:#222 !important; white-space:nowrap !important; overflow:hidden !important; text-overflow:ellipsis !important; margin:0 !important; line-height:1.3 !important;">${highlightedName}</div>
            <div class="item-meta" style="display:flex !important; align-items:center !important; gap:6px !important; margin-top:3px !important;">
              <span class="item-category-tag" style="font-size:0.7rem !important; color:#666 !important; background:#f0f0f0 !important; padding:2px 8px !important; border-radius:10px !important; display:inline-block !important;">${categoryLabel}</span>
              ${isRental ? '<span class="item-rental-tag" style="font-size:0.7rem !important; color:#800000 !important; background:#fde8e8 !important; font-weight:700 !important; padding:2px 8px !important; border-radius:10px !important; display:inline-block !important;">Rental Setup</span>' : ''}
              ${isOos ? '<span class="item-oos-tag" style="font-size:0.7rem !important; color:#d32f2f !important; background:#ffebee !important; font-weight:700 !important; padding:2px 8px !important; border-radius:10px !important; display:inline-block !important;">Out of Stock</span>' : ''}
            </div>
          </div>
          <div class="item-price" style="font-weight:700 !important; font-size:0.92rem !important; color:#d4af37 !important; flex-shrink:0 !important; white-space:nowrap !important;">
            ₹${item.price}${isRental ? '<span style="font-size:0.7rem;font-weight:normal;color:#666;">/day</span>' : ''}
          </div>
        </li>
      `;
    });

    html += `</ul>`;
    dropdown.innerHTML = html;
    dropdown.style.display = 'block';

    // Bind click events to suggestion items
    const items = dropdown.querySelectorAll('.search-suggestion-item');
    items.forEach(el => {
      el.addEventListener('click', () => {
        const id = el.getAttribute('data-id');
        const name = el.getAttribute('data-name');
        const category = el.getAttribute('data-category');
        selectItem(id, name, category);
      });
    });
  }

  // Render Recent Searches dropdown view
  function renderRecentSearches() {
    const recents = getRecentSearches();
    currentSuggestions = recents;
    activeIndex = -1;

    if (recents.length === 0) {
      dropdown.style.display = 'none';
      dropdown.innerHTML = '';
      return;
    }

    let html = `
      <div class="search-dropdown-header" style="background:#fcf9f2; padding:8px 14px; font-size:0.75rem; font-weight:700; text-transform:uppercase; letter-spacing:0.5px; color:#800000; border-bottom:1px solid #f0e6d6; display: flex; justify-content: space-between; align-items: center;">
        <span>Recent Searches</span>
        <button type="button" class="clear-recent-btn" id="clearRecentBtn" style="background:none; border:none; color:#888; font-size:0.72rem; cursor:pointer; text-decoration:underline;">Clear History</button>
      </div>
      <ul class="search-results-list" role="listbox" style="list-style:none !important; margin:0 !important; padding:0 !important;">
    `;

    recents.forEach((query, index) => {
      html += `
        <li class="search-recent-item" role="option" data-index="${index}" data-query="${query.replace(/"/g, '&quot;')}" style="display:flex !important; align-items:center !important; gap:10px !important; padding:10px 14px !important; border-bottom:1px solid #f5f5f5 !important; cursor:pointer !important; font-size:0.88rem !important; color:#444 !important; list-style:none !important; text-align:left !important; background:#ffffff;">
          <span class="recent-icon" style="font-size:0.88rem; opacity:0.6;">🕒</span>
          <span class="recent-text" style="flex:1;">${query}</span>
          <span class="recent-arrow" style="font-size:0.8rem; opacity:0.4;">↗</span>
        </li>
      `;
    });

    html += `</ul>`;
    dropdown.innerHTML = html;
    dropdown.style.display = 'block';

    // Clear history handler
    const clearBtnEl = dropdown.querySelector('#clearRecentBtn');
    if (clearBtnEl) {
      clearBtnEl.addEventListener('click', (e) => {
        e.stopPropagation();
        clearRecentSearches();
      });
    }

    // Recent item click handler
    const recentItems = dropdown.querySelectorAll('.search-recent-item');
    recentItems.forEach(el => {
      el.addEventListener('click', () => {
        const q = el.getAttribute('data-query');
        if (q) {
          searchInput.value = q;
          toggleClearBtn();
          renderSuggestions(q);
        }
      });
    });
  }

  // Handle Item Selection / Navigation
  function selectItem(id, name, category) {
    if (name) saveRecentSearch(name);
    dropdown.style.display = 'none';
    
    // Navigate smoothly to products collection with category or anchor
    if (category === 'rentals' || id === 'vratam-peta-kit') {
      window.location.href = '/rental';
    } else if (category) {
      window.location.href = `/products#${category}`;
    } else {
      window.location.href = '/products';
    }
  }

  // Update Visual Keyboard Selection in Dropdown
  function updateKeyboardSelection() {
    const listItems = dropdown.querySelectorAll('.search-suggestion-item, .search-recent-item');
    listItems.forEach((item, index) => {
      if (index === activeIndex) {
        item.classList.add('active-keyboard-focus');
        item.scrollIntoView({ block: 'nearest' });
      } else {
        item.classList.remove('active-keyboard-focus');
      }
    });
  }

  // Toggle Visibility of Clear Button
  function toggleClearBtn() {
    if (clearBtn) {
      clearBtn.style.display = searchInput.value.length > 0 ? 'flex' : 'none';
    }
  }

  // Initialize Smart Search Component
  function initSmartSearch() {
    searchInput = document.getElementById('smartSearchInput');
    clearBtn = document.getElementById('smartSearchClearBtn');
    dropdown = document.getElementById('smartSearchDropdown');
    chipsContainer = document.getElementById('quickSearchChips');

    if (!searchInput || !dropdown) return;

    // 1. Input Event with Debounce
    searchInput.addEventListener('input', () => {
      toggleClearBtn();
      if (debounceTimer) clearTimeout(debounceTimer);
      debounceTimer = setTimeout(() => {
        renderSuggestions(searchInput.value);
      }, 250);
    });

    // 2. Focus Event (Show recent searches if input is empty)
    searchInput.addEventListener('focus', () => {
      if (!searchInput.value.trim()) {
        renderRecentSearches();
      } else {
        renderSuggestions(searchInput.value);
      }
    });

    // 3. Clear Button Click Handler
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        searchInput.value = '';
        toggleClearBtn();
        searchInput.focus();
        renderRecentSearches();
      });
    }

    // 4. Keyboard Navigation Handler (Up, Down, Enter, Escape)
    searchInput.addEventListener('keydown', (e) => {
      const listItems = dropdown.querySelectorAll('.search-suggestion-item, .search-recent-item');
      if (listItems.length === 0 || dropdown.style.display === 'none') return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        activeIndex = (activeIndex + 1) % listItems.length;
        updateKeyboardSelection();
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        activeIndex = (activeIndex - 1 + listItems.length) % listItems.length;
        updateKeyboardSelection();
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (activeIndex >= 0 && listItems[activeIndex]) {
          listItems[activeIndex].click();
        } else if (currentSuggestions.length > 0 && currentSuggestions[0].id) {
          selectItem(currentSuggestions[0].id, currentSuggestions[0].name, currentSuggestions[0].category);
        } else if (searchInput.value.trim()) {
          saveRecentSearch(searchInput.value);
          window.location.href = '/products';
        }
      } else if (e.key === 'Escape') {
        dropdown.style.display = 'none';
        activeIndex = -1;
      }
    });

    // 5. Quick Search Chips Tap Handler
    if (chipsContainer) {
      const chips = chipsContainer.querySelectorAll('.quick-chip');
      chips.forEach(chip => {
        chip.addEventListener('click', () => {
          const keyword = chip.getAttribute('data-keyword');
          if (keyword) {
            searchInput.value = keyword;
            toggleClearBtn();
            saveRecentSearch(keyword);
            renderSuggestions(keyword);
            searchInput.focus();
          }
        });
      });
    }

    // 6. Click Outside Handler (Close Dropdown)
    document.addEventListener('click', (e) => {
      const searchWrapper = document.querySelector('.smart-search-wrapper');
      if (searchWrapper && !searchWrapper.contains(e.target)) {
        dropdown.style.display = 'none';
        activeIndex = -1;
      }
    });
  }

  // Auto-init on DOMContentLoaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSmartSearch);
  } else {
    initSmartSearch();
  }
})();

/* MetroMart Shopping Center - product rendering, search, filtering and cart */
(() => {
  'use strict';

  const products = [
    { id: 1, name: 'Wireless Bluetooth Headphones', category: 'electronics', price: 59.99, oldPrice: 79.99, image: 'img_5.jpg', rating: 4.8, badge: 'BESTSELLER' },
    { id: 2, name: 'Smart Watch Series', category: 'electronics', price: 89.99, oldPrice: 119.99, image: 'img_6.jpg', rating: 4.7, badge: 'SAVE 25%' },
    { id: 3, name: 'Everyday Casual Sneakers', category: 'sports', price: 49.99, oldPrice: 64.99, image: 'img_7.jpg', rating: 4.6, badge: '' },
    { id: 4, name: 'Classic Everyday Backpack', category: 'clothing', price: 34.99, oldPrice: 44.99, image: 'img_8.jpg', rating: 4.5, badge: 'POPULAR' },
    { id: 5, name: 'Modern Table Lamp', category: 'home', price: 28.99, oldPrice: 39.99, image: 'img_9.jpg', rating: 4.7, badge: '' },
    { id: 6, name: 'Professional Hair Dryer', category: 'beauty', price: 32.99, oldPrice: 42.99, image: 'img_10.jpg', rating: 4.4, badge: 'SAVE 20%' },
    { id: 7, name: 'Portable Bluetooth Speaker', category: 'electronics', price: 39.99, oldPrice: 49.99, image: 'img_11.jpg', rating: 4.6, badge: '' },
    { id: 8, name: 'Stainless Steel Water Bottle', category: 'sports', price: 18.99, oldPrice: 24.99, image: 'img_12.jpg', rating: 4.8, badge: 'ECO PICK' },
    { id: 9, name: 'Minimalist Wall Clock', category: 'home', price: 24.99, oldPrice: 34.99, image: 'img_13.jpg', rating: 4.3, badge: '' },
    { id: 10, name: 'Everyday Cotton T-Shirt', category: 'clothing', price: 19.99, oldPrice: 27.99, image: 'img_14.jpg', rating: 4.5, badge: '' },
    { id: 11, name: 'Skincare Essentials Set', category: 'beauty', price: 26.99, oldPrice: 35.99, image: 'img_15.jpg', rating: 4.7, badge: 'TOP RATED' },
    { id: 12, name: 'Yoga and Fitness Mat', category: 'sports', price: 29.99, oldPrice: 39.99, image: 'img_16.jpg', rating: 4.6, badge: '' },
    { id: 13, name: 'Compact Desk Organizer', category: 'home', price: 16.99, oldPrice: 22.99, image: 'img_17.jpg', rating: 4.4, badge: 'GREAT VALUE' }
  ];

  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => Array.from(root.querySelectorAll(selector));
  const productGrid = $('#productGrid');
  const dealsGrid = $('#dealsGrid');
  const searchInput = $('#searchInput');
  const searchBtn = $('#searchBtn');
  // The supplied HTML has a leading space in this id. Support it as written.
  const searchResults = document.getElementById('searchResults') || document.querySelector('[id=" searchResults"]');
  const cartOverlay = $('#cartOverlay');
  const cartItems = $('#cartItems');
  const cartCount = $('#cartCount');
  const cartSubtotal = $('#cartSubtotal');
  const cartDiscount = $('#cartDiscount');
  const cartTotal = $('#cartTotal');
  const checkoutBtn = $('.checkout-btn');
  const menuOverlay = $('#mobileMenuOverlay');
  const menuToggle = $('#menuToggle');
  const mainNav = $('#mainNav');

  let selectedCategory = 'all';
  let searchTerm = '';
  let cart = loadCart();

  function money(value) {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(value);
  }

  function loadCart() {
    try {
      const saved = JSON.parse(localStorage.getItem('metromart-cart') || '[]');
      return Array.isArray(saved) ? saved.filter(item => products.some(product => product.id === item.id) && Number.isFinite(item.quantity) && item.quantity > 0) : [];
    } catch (_) {
      return [];
    }
  }

  function saveCart() {
    try { localStorage.setItem('metromart-cart', JSON.stringify(cart)); } catch (_) { /* Storage may be disabled. */ }
  }

  function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, char => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[char]));
  }

  function productCard(product) {
    const isSale = product.oldPrice > product.price;
    const badge = product.badge ? `<span class="product-badge ${isSale ? 'sale' : ''}">${escapeHTML(product.badge)}</span>` : '';
    return `
      <article class="product-card" data-product-id="${product.id}">
        <div class="product-image-wrap">
          ${badge}
          <img class="product-image" src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}" loading="lazy" onerror="this.onerror=null;this.src='data:image/svg+xml,%3Csvg xmlns=%22http://www.w3.org/2000/svg%22 width=%22240%22 height=%22200%22 viewBox=%220 0 240 200%22%3E%3Crect width=%22240%22 height=%22200%22 rx=%2216%22 fill=%22%23f0efff%22/%3E%3Ctext x=%22120%22 y=%22100%22 font-size=%2240%22 text-anchor=%22middle%22 dominant-baseline=%22middle%22 fill=%22%235b4bdb%22%3E◇%3C/text%3E%3C/svg%3E'">
        </div>
        <div class="product-info">
          <p class="product-category">${escapeHTML(product.category)}</p>
          <h3 class="product-name">${escapeHTML(product.name)}</h3>
          <div class="product-rating" aria-label="Rated ${product.rating} out of 5">★★★★★ <span>${product.rating.toFixed(1)}</span></div>
          <div class="product-bottom">
            <div class="price-wrap"><span class="product-price">${money(product.price)}</span>${isSale ? `<span class="old-price">${money(product.oldPrice)}</span>` : ''}</div>
            <button class="add-cart-btn" type="button" data-add-to-cart="${product.id}" aria-label="Add ${escapeHTML(product.name)} to cart" title="Add to cart">+</button>
          </div>
        </div>
      </article>`;
  }

  function matches(product) {
    const categoryMatch = selectedCategory === 'all' || product.category === selectedCategory;
    const term = searchTerm.trim().toLowerCase();
    const textMatch = !term || `${product.name} ${product.category}`.toLowerCase().includes(term);
    return categoryMatch && textMatch;
  }

  function renderProducts() {
    if (!productGrid) return;
    const visible = products.filter(matches);
    productGrid.innerHTML = visible.length
      ? visible.map(productCard).join('')
      : '<p class="empty-results">No products found. Try another search or category.</p>';

    if (dealsGrid) {
      const deals = products.filter(product => product.oldPrice > product.price).slice(0, 4);
      dealsGrid.innerHTML = deals.map(productCard).join('');
    }
  }

  function setCategory(category) {
    selectedCategory = ['all', 'electronics', 'clothing', 'home', 'sports', 'beauty'].includes(category) ? category : 'all';
    $$('.nav-link, .mobile-nav-link').forEach(link => {
      link.classList.toggle('active', link.dataset.category === selectedCategory);
    });
    searchTerm = searchInput ? searchInput.value.trim() : searchTerm;
    renderProducts();
    closeSearchResults();
    if (productGrid) productGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function showSearchResults() {
    if (!searchResults || !searchInput) return;
    const term = searchInput.value.trim().toLowerCase();
    if (!term) { closeSearchResults(); return; }
    const found = products.filter(product => `${product.name} ${product.category}`.toLowerCase().includes(term)).slice(0, 6);
    searchResults.innerHTML = found.length
      ? found.map(product => `<button class="search-result" type="button" data-search-product="${product.id}"><img src="${escapeHTML(product.image)}" alt="" onerror="this.style.visibility='hidden'"><span><strong>${escapeHTML(product.name)}</strong><small>${money(product.price)}</small></span></button>`).join('')
      : '<div class="search-result"><span>No matching products</span></div>';
    searchResults.classList.add('is-visible');
  }

  function closeSearchResults() {
    if (!searchResults) return;
    searchResults.classList.remove('is-visible');
    searchResults.innerHTML = '';
  }

  function addToCart(id) {
    const product = products.find(item => item.id === Number(id));
    if (!product) return;
    const existing = cart.find(item => item.id === product.id);
    if (existing) existing.quantity += 1;
    else cart.push({ id: product.id, quantity: 1 });
    saveCart();
    renderCart();
    const button = document.querySelector(`[data-add-to-cart="${product.id}"]`);
    if (button) {
      const oldText = button.textContent;
      button.textContent = '✓';
      button.setAttribute('aria-label', 'Added to cart');
      window.setTimeout(() => { if (button.isConnected) { button.textContent = oldText; button.setAttribute('aria-label', `Add ${product.name} to cart`); } }, 850);
    }
  }

  function renderCart() {
    const count = cart.reduce((sum, item) => sum + item.quantity, 0);
    if (cartCount) cartCount.textContent = String(count);
    const mobileCartLink = $('#mobileCartLink');
    if (mobileCartLink) mobileCartLink.textContent = `My Cart (${count})`;

    if (!cartItems) return;
    if (!cart.length) {
      cartItems.innerHTML = '<p class="empty-cart">Your cart is empty. Add something you love!</p>';
    } else {
      cartItems.innerHTML = cart.map(item => {
        const product = products.find(entry => entry.id === item.id);
        if (!product) return '';
        return `<div class="cart-item" data-cart-item="${product.id}">
          <img src="${escapeHTML(product.image)}" alt="${escapeHTML(product.name)}" onerror="this.style.visibility='hidden'">
          <div><h4>${escapeHTML(product.name)}</h4><div class="cart-item-price">${money(product.price * item.quantity)}</div>
            <div class="quantity-controls"><button type="button" data-quantity-change="-1" data-id="${product.id}" aria-label="Decrease quantity">−</button><span>${item.quantity}</span><button type="button" data-quantity-change="1" data-id="${product.id}" aria-label="Increase quantity">+</button></div>
          </div><button type="button" class="remove-item" data-remove-item="${product.id}" aria-label="Remove ${escapeHTML(product.name)}">✕</button>
        </div>`;
      }).join('');
    }

    const subtotal = cart.reduce((sum, item) => {
      const product = products.find(entry => entry.id === item.id);
      return sum + (product ? product.price * item.quantity : 0);
    }, 0);
    const original = cart.reduce((sum, item) => {
      const product = products.find(entry => entry.id === item.id);
      return sum + (product ? product.oldPrice * item.quantity : 0);
    }, 0);
    const discount = Math.max(0, original - subtotal);
    if (cartSubtotal) cartSubtotal.textContent = money(subtotal);
    if (cartDiscount) cartDiscount.textContent = `-${money(discount)}`;
    if (cartTotal) cartTotal.textContent = money(subtotal);
    if (checkoutBtn) checkoutBtn.disabled = cart.length === 0;
  }

  function openCart() {
    if (!cartOverlay) return;
    cartOverlay.classList.add('is-open');
    cartOverlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
  }

  function closeCart() {
    if (!cartOverlay) return;
    cartOverlay.classList.remove('is-open');
    cartOverlay.setAttribute('aria-hidden', 'true');
    if (!menuOverlay?.classList.contains('is-open')) document.body.classList.remove('no-scroll');
  }

  function openMenu() {
    if (!menuOverlay) return;
    menuOverlay.classList.add('is-open');
    menuOverlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('no-scroll');
  }

  function closeMenu() {
    if (!menuOverlay) return;
    menuOverlay.classList.remove('is-open');
    menuOverlay.setAttribute('aria-hidden', 'true');
    if (!cartOverlay?.classList.contains('is-open')) document.body.classList.remove('no-scroll');
  }

  // Category links and category highlight cards
  document.addEventListener('click', event => {
    const categoryLink = event.target.closest('[data-category]');
    if (categoryLink) {
      event.preventDefault();
      setCategory(categoryLink.dataset.category);
      closeMenu();
      return;
    }
    const addButton = event.target.closest('[data-add-to-cart]');
    if (addButton) { addToCart(addButton.dataset.addToCart); return; }
    const searchResult = event.target.closest('[data-search-product]');
    if (searchResult) {
      const product = products.find(item => item.id === Number(searchResult.dataset.searchProduct));
      if (product) {
        selectedCategory = 'all';
        searchTerm = product.name;
        if (searchInput) searchInput.value = product.name;
        renderProducts();
        closeSearchResults();
        if (productGrid) productGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      return;
    }
    const changeButton = event.target.closest('[data-quantity-change]');
    if (changeButton) {
      const id = Number(changeButton.dataset.id);
      const item = cart.find(entry => entry.id === id);
      if (item) {
        item.quantity += Number(changeButton.dataset.quantityChange);
        if (item.quantity <= 0) cart = cart.filter(entry => entry.id !== id);
        saveCart(); renderCart();
      }
      return;
    }
    const removeButton = event.target.closest('[data-remove-item]');
    if (removeButton) {
      cart = cart.filter(item => item.id !== Number(removeButton.dataset.removeItem));
      saveCart(); renderCart();
    }
  });

  if (searchInput) {
    searchInput.addEventListener('input', () => {
      searchTerm = searchInput.value;
      selectedCategory = 'all';
      $$('.nav-link, .mobile-nav-link').forEach(link => link.classList.toggle('active', link.dataset.category === 'all'));
      renderProducts();
      showSearchResults();
    });
    searchInput.addEventListener('keydown', event => {
      if (event.key === 'Enter') {
        event.preventDefault(); searchTerm = searchInput.value.trim(); renderProducts(); closeSearchResults();
        if (productGrid) productGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
      if (event.key === 'Escape') closeSearchResults();
    });
  }
  if (searchBtn) searchBtn.addEventListener('click', () => {
    searchTerm = searchInput ? searchInput.value.trim() : '';
    selectedCategory = 'all'; renderProducts(); closeSearchResults();
    if (productGrid) productGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });
  document.addEventListener('click', event => {
    if (searchResults && !event.target.closest('.search-wrapper')) closeSearchResults();
  });

  $('#cartBtn')?.addEventListener('click', openCart);
  $('#closeCart')?.addEventListener('click', closeCart);
  cartOverlay?.addEventListener('click', event => { if (event.target === cartOverlay) closeCart(); });
  menuToggle?.addEventListener('click', openMenu);
  $('#closeMenu')?.addEventListener('click', closeMenu);
  menuOverlay?.addEventListener('click', event => { if (event.target === menuOverlay) closeMenu(); });
  $('#mobileCartLink')?.addEventListener('click', event => { event.preventDefault(); closeMenu(); openCart(); });
  document.addEventListener('keydown', event => {
    if (event.key === 'Escape') { closeCart(); closeMenu(); closeSearchResults(); }
  });

  // Hero button: apply the all-products view and scroll to the catalogue.
  $('.hero-btn')?.addEventListener('click', event => {
    event.preventDefault();
    selectedCategory = 'all'; searchTerm = '';
    if (searchInput) searchInput.value = '';
    renderProducts();
    if (productGrid) productGrid.scrollIntoView({ behavior: 'smooth', block: 'start' });
  });

  // Demo checkout only: this static site does not process real payments or orders.
  checkoutBtn?.addEventListener('click', () => {
    if (!cart.length) return;
    alert('Thanks for shopping at MetroMart! This is a demo checkout; no payment has been processed.');
  });

  $('#newsletterForm')?.addEventListener('submit', event => {
    event.preventDefault();
    const emailInput = $('#newsletterEmail');
    if (!emailInput || !emailInput.checkValidity()) { emailInput?.reportValidity(); return; }
    alert(`Thanks for subscribing, ${emailInput.value.trim()}!`);
    event.target.reset();
  });

  // Footer links are placeholders in the supplied HTML; prevent jumps to the top.
  $$('.site-footer a[href="#"]').forEach(link => link.addEventListener('click', event => event.preventDefault()));

  renderProducts();
  renderCart();
})();

/* ─────────────────────────────────────────
   Eggcizu – Brokies  |  script.js
   ───────────────────────────────────────── */

// ── CONFIG ────────────────────────────────
const WA_NUMBER = '62881022097971'; // ← Ganti dengan nomor WhatsApp kamu

// ── VARIANT DATA ──────────────────────────
const VARIANTS = [
  { key: 'ori',    emoji: '🍪', label: 'Ori',    sub: 'Chocochips',     disabled: false },
  { key: 'almond', emoji: '🌰', label: 'Almond', sub: 'Sliced Almond',  disabled: false },
  { key: 'oreo',   emoji: '🖤', label: 'Oreo',   sub: 'Oreo Crumble',   disabled: false },
  { key: 'keju',   emoji: '🧀', label: 'Keju',   sub: 'Shredded Cheese',disabled: true  },
];

// ── CART STATE ────────────────────────────
// cart = { [variantKey]: qty }
let cart = {};

// ── MOBILE HERO STATE ─────────────────────
let heroKey = 'ori';

// ── HELPERS ───────────────────────────────
const totalItems  = () => Object.values(cart).reduce((s, q) => s + q, 0);
const cartIsEmpty = () => totalItems() === 0;

function cartSummaryText() {
  const count = totalItems();
  const types = Object.keys(cart).length;
  return `${count} item · ${types} varian`;
}


// ── RENDER ────────────────────────────────
function render() {
  renderGallery();
  renderMobileCards();
  renderCartSection();
  renderMobileFloatBar();
  renderCartDrawerItems();
  renderHeaderBadge();
}

/* Gallery items (desktop) */
function renderGallery() {
  document.querySelectorAll('[data-gallery-key]').forEach(item => {
    const key = item.dataset.galleryKey;
    const inCart = key in cart;
    item.classList.toggle('in-cart', inCart);

    const qtyOverlay = item.querySelector('.gallery-qty-overlay');
    if (qtyOverlay) qtyOverlay.querySelector('.g-qty-num').textContent = cart[key] || 0;
  });
}

/* Variant cards (mobile) */
function renderMobileCards() {
  document.querySelectorAll('[data-card-key]').forEach(card => {
    const key = card.dataset.cardKey;
    const inCart = key in cart;
    card.classList.toggle('in-cart', inCart);

    const num = card.querySelector('.c-qty-num');
    if (num) num.textContent = cart[key] || 0;
  });

  // Sync hero image with last-added or first available
  document.querySelectorAll('[data-img-key]').forEach(img => {
    img.classList.toggle('active', img.dataset.imgKey === heroKey);
  });
  document.querySelectorAll('[data-dot-key]').forEach(dot => {
    dot.classList.toggle('active', dot.dataset.dotKey === heroKey);
  });
}

/* Desktop cart section */
function renderCartSection() {
  const section   = document.getElementById('desktopCartSection');
  const emptyEl   = document.getElementById('desktopCartEmpty');
  const itemsEl   = document.getElementById('desktopCartItems');
  const totalVal  = document.getElementById('desktopCartTotal');
  const orderBtn  = document.getElementById('desktopOrderBtn');
  if (!section) return;

  const empty = cartIsEmpty();
  emptyEl.style.display  = empty ? 'block' : 'none';
  itemsEl.style.display  = empty ? 'none'  : 'flex';

  if (!empty) {
    itemsEl.innerHTML = '';
    Object.entries(cart).forEach(([key, qty]) => {
      const v = VARIANTS.find(v => v.key === key);
      if (!v) return;
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.dataset.itemKey = key;
      row.innerHTML = `
        <span class="cart-item-emoji">${v.emoji}</span>
        <div class="cart-item-info">
          <span class="cart-item-name">${v.label}</span>
          <span class="cart-item-sub">${v.sub}</span>
        </div>
        <div class="cart-item-qty">
          <button class="ci-qty-btn" data-action="dec" data-key="${key}">−</button>
          <span class="ci-qty-num">${qty}</span>
          <button class="ci-qty-btn" data-action="inc" data-key="${key}">+</button>
        </div>
        <button class="cart-item-remove" data-key="${key}" title="Hapus">×</button>
      `;
      itemsEl.appendChild(row);
    });

    // Bind cart item events
    itemsEl.querySelectorAll('.ci-qty-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const k = e.currentTarget.dataset.key;
        const action = e.currentTarget.dataset.action;
        action === 'inc' ? changeQty(k, 1) : changeQty(k, -1);
      });
    });
    itemsEl.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', e => removeFromCart(e.currentTarget.dataset.key));
    });

    const total = totalItems();
    totalVal.innerHTML = `${total} pcs <span>total pesanan</span>`;
  }

  if (orderBtn) {
    orderBtn.disabled = empty;
    orderBtn.classList.toggle('empty-cart', empty);
    orderBtn.querySelector('.btn-label').textContent =
      empty ? 'Pilih varian dulu' : `Pesan via WhatsApp`;
  }
}

/* Mobile floating bar */
function renderMobileFloatBar() {
  const bar = document.getElementById('cartFloatBar');
  if (!bar) return;
  const empty = cartIsEmpty();
  bar.classList.toggle('visible', !empty);
  if (!empty) {
    bar.querySelector('.float-bar-badge').textContent = totalItems();
    bar.querySelector('.float-bar-text').innerHTML =
      `<strong>${totalItems()} item dipilih</strong><small>${Object.keys(cart).length} varian</small>`;
  }
}

/* Cart drawer items (mobile) */
function renderCartDrawerItems() {
  const itemsEl  = document.getElementById('drawerCartItems');
  const emptyEl  = document.getElementById('drawerCartEmpty');
  const totalEl  = document.getElementById('drawerCartTotal');
  if (!itemsEl) return;

  const empty = cartIsEmpty();
  emptyEl.style.display = empty ? 'block' : 'none';
  itemsEl.style.display = empty ? 'none'  : 'flex';

  if (!empty) {
    itemsEl.innerHTML = '';
    Object.entries(cart).forEach(([key, qty]) => {
      const v = VARIANTS.find(v => v.key === key);
      if (!v) return;
      const row = document.createElement('div');
      row.className = 'cart-item';
      row.innerHTML = `
        <span class="cart-item-emoji">${v.emoji}</span>
        <div class="cart-item-info">
          <span class="cart-item-name">${v.label}</span>
          <span class="cart-item-sub">${v.sub}</span>
        </div>
        <div class="cart-item-qty">
          <button class="ci-qty-btn" data-action="dec" data-key="${key}">−</button>
          <span class="ci-qty-num">${qty}</span>
          <button class="ci-qty-btn" data-action="inc" data-key="${key}">+</button>
        </div>
        <button class="cart-item-remove" data-key="${key}" title="Hapus">×</button>
      `;
      itemsEl.appendChild(row);
    });

    itemsEl.querySelectorAll('.ci-qty-btn').forEach(btn => {
      btn.addEventListener('click', e => {
        const k = e.currentTarget.dataset.key;
        const action = e.currentTarget.dataset.action;
        action === 'inc' ? changeQty(k, 1) : changeQty(k, -1);
      });
    });
    itemsEl.querySelectorAll('.cart-item-remove').forEach(btn => {
      btn.addEventListener('click', e => removeFromCart(e.currentTarget.dataset.key));
    });

    if (totalEl) totalEl.innerHTML = `${totalItems()} pcs <span>total pesanan</span>`;
  }
}

/* Header badge */
function renderHeaderBadge() {
  document.querySelectorAll('.cart-count-badge').forEach(badge => {
    const prev = badge.textContent;
    const next = String(totalItems());
    badge.textContent = next;
    if (prev !== next && next !== '0') {
      badge.classList.remove('bump');
      void badge.offsetWidth; // force reflow
      badge.classList.add('bump');
    }
  });
}


// ── CART ACTIONS ──────────────────────────
function addToCart(key, qty = 1) {
  const v = VARIANTS.find(v => v.key === key);
  if (!v || v.disabled) return;
  cart[key] = (cart[key] || 0) + qty;
  heroKey = key; // preview this variant on mobile
  render();
  showToast(`${v.emoji} ${v.label} ditambahkan ke keranjang!`);
}

function changeQty(key, delta) {
  if (!(key in cart)) return;
  const newQty = cart[key] + delta;
  if (newQty <= 0) {
    removeFromCart(key);
  } else {
    cart[key] = Math.min(99, newQty);
    render();
  }
}

function removeFromCart(key) {
  const v = VARIANTS.find(v => v.key === key);
  delete cart[key];
  render();
  if (v) showToast(`${v.label} dihapus dari keranjang`);
}


// ── MOBILE HERO NAVIGATION ────────────────
function setHeroKey(key) {
  heroKey = key;
  document.querySelectorAll('[data-img-key]').forEach(img =>
    img.classList.toggle('active', img.dataset.imgKey === key));
  document.querySelectorAll('[data-dot-key]').forEach(dot =>
    dot.classList.toggle('active', dot.dataset.dotKey === key));
}


// ── CART DRAWER (mobile) ──────────────────
const drawerBackdrop = document.getElementById('cartDrawerBackdrop');
const cartDrawer     = document.getElementById('cartDrawer');

function openDrawer() {
  renderCartDrawerItems();
  drawerBackdrop?.classList.add('open');
  cartDrawer?.classList.add('open');
  document.body.style.overflow = 'hidden';
}
function closeDrawer() {
  drawerBackdrop?.classList.remove('open');
  cartDrawer?.classList.remove('open');
  document.body.style.overflow = '';
}

drawerBackdrop?.addEventListener('click', closeDrawer);


// ── WHATSAPP ORDER ────────────────────────
function handleOrder() {
  if (cartIsEmpty()) return;
  const lines = Object.entries(cart).map(([key, qty]) => {
    const v = VARIANTS.find(v => v.key === key);
    return `• ${v.label} x${qty}`;
  });
  const msg = `Halo kak, saya mau beli Brokies:\n${lines.join('\n')}\n\nTotal: ${totalItems()} pcs`;
  window.open(`https://wa.me/${WA_NUMBER}?text=${encodeURIComponent(msg)}`, '_blank');
  showToast('Membuka WhatsApp… 🍪');
}


// ── TOAST ─────────────────────────────────
const toastEl = document.getElementById('toast');
let toastTimer;
function showToast(msg) {
  toastEl.textContent = msg;
  toastEl.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toastEl.classList.remove('show'), 2600);
}


// ── BIND STATIC EVENTS ────────────────────

// Desktop: gallery item → add to cart on click
document.querySelectorAll('[data-gallery-key]').forEach(item => {
  if (item.classList.contains('disabled')) return;
  const key = item.dataset.galleryKey;

  // Click the add overlay button
  item.querySelector('.gallery-add-overlay')?.addEventListener('click', e => {
    e.stopPropagation();
    addToCart(key);
  });

  // Click qty overlay buttons
  item.querySelector('.g-qty-btn[data-action="inc"]')?.addEventListener('click', e => {
    e.stopPropagation(); changeQty(key, 1);
  });
  item.querySelector('.g-qty-btn[data-action="dec"]')?.addEventListener('click', e => {
    e.stopPropagation(); changeQty(key, -1);
  });

  // Click the image itself → add if not in cart, else do nothing
  item.addEventListener('click', () => {
    if (!(key in cart)) addToCart(key);
  });
});

// Mobile: variant card click → add/preview
document.querySelectorAll('[data-card-key]').forEach(card => {
  if (card.classList.contains('disabled')) return;
  const key = card.dataset.cardKey;

  card.querySelector('.c-qty-btn[data-action="inc"]')?.addEventListener('click', e => {
    e.stopPropagation(); changeQty(key, 1);
  });
  card.querySelector('.c-qty-btn[data-action="dec"]')?.addEventListener('click', e => {
    e.stopPropagation(); changeQty(key, -1);
  });

  card.addEventListener('click', e => {
    if (e.target.closest('.c-qty-btn')) return;
    if (key in cart) {
      // already in cart → just preview
      setHeroKey(key);
    } else {
      addToCart(key);
    }
  });
});

// Mobile: dots → preview hero
document.querySelectorAll('[data-dot-key]').forEach(dot => {
  dot.addEventListener('click', () => {
    const k = dot.dataset.dotKey;
    if (!VARIANTS.find(v => v.key === k)?.disabled) setHeroKey(k);
  });
});

// Mobile: floating bar → open drawer
document.getElementById('cartFloatBar')?.addEventListener('click', openDrawer);

// Mobile: drawer order button
document.getElementById('drawerOrderBtn')?.addEventListener('click', () => {
  closeDrawer();
  setTimeout(handleOrder, 200);
});

// Header cart button
document.querySelectorAll('.cart-btn-header').forEach(btn => {
  btn.addEventListener('click', () => {
    if (window.innerWidth < 900) openDrawer();
    else {
      // scroll to cart section on desktop
      document.getElementById('desktopCartSection')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  });
});

// Desktop: order button
document.getElementById('desktopOrderBtn')?.addEventListener('click', handleOrder);


// ── INIT ──────────────────────────────────
render();

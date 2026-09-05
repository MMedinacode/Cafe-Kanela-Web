/* ============================================================
   PANTALLA DE CARGA
   ============================================================ */
(function(){
  const el = document.getElementById('loadScreen');
  function hide(){ el.classList.add('hidden'); }
  window.addEventListener('load', () => setTimeout(hide, 200));
  setTimeout(hide, 700);
})();

/* ============================================================
   NAVEGACIÓN SPA POR PESTAÑAS
   ============================================================ */
const panels = document.querySelectorAll('.tab-panel');
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add('in'); revealObserver.unobserve(e.target); } });
}, { threshold: 0.15 });

function goToTab(tabId) {
  panels.forEach(p => p.classList.toggle('active', p.dataset.tabPanel === tabId));
  document.querySelectorAll('.nav-link').forEach(l => l.classList.toggle('active', l.dataset.tab === tabId));
  window.scrollTo({ top: 0, behavior: 'smooth' });
  document.getElementById('main-nav').classList.remove('open');
  const activePanel = document.querySelector('.tab-panel.active');
  if (activePanel) activePanel.querySelectorAll('.reveal').forEach(el => revealObserver.observe(el));
}
document.querySelectorAll('[data-tab]').forEach(el => {
  el.addEventListener('click', (e) => { e.preventDefault(); goToTab(el.dataset.tab); });
});
document.querySelectorAll('.tab-panel.active .reveal').forEach(el => revealObserver.observe(el));

document.getElementById('navToggle').addEventListener('click', () => {
  document.getElementById('main-nav').classList.toggle('open');
});

/* --------------------------------------------------------------
   CARTA — productos reales (mencionados en reseñas/Instagram/Maps),
   sin precios publicados en ningún canal. Todos marcados "Consultar".
-------------------------------------------------------------- */
const CATEGORIES = [
  { id: 'cafe', label: 'Café' },
  { id: 'reposteria', label: 'Repostería' },
  { id: 'emporio', label: 'Emporio' },
];

const MENU = {
  cafe: {
    items: [
      { n: 'Café de grano', d: 'Espresso, cortado o americano — café de especialidad en grano.' },
      { n: 'Mocaccino', d: 'Café, chocolate y leche texturizada.' },
    ]
  },
  reposteria: {
    photo: 'fotos/bread.jpg',
    items: [
      { n: 'Pie de Limón', d: 'El plato más destacado del local según Google Maps.' },
      { n: 'Kuchen de manzana', d: 'Receta casera, ideal para acompañar el café de la tarde.' },
      { n: 'Cheesecake', d: 'De la vitrina, cambia según la semana.' },
      { n: 'Torta amor', d: 'Torta de chocolate — "hecho con amor", como dice su lema.' },
      { n: 'Donuts', d: 'Horneados en casa.' },
    ],
    note: 'No hay una carta con precios publicada — productos reales mencionados en reseñas e Instagram, precios a confirmar con el local.'
  },
  emporio: {
    photo: 'fotos/chocolates.jpg',
    items: [
      { n: 'Caluga de frambuesa', d: 'Del "Emporio" de chocolates del local.' },
      { n: 'Chocolatería surtida', d: 'Selección de chocolates del emporio propio de Kanela.' },
    ],
    note: 'El "Emporio" es una de las historias destacadas de su Instagram — venta de chocolates aparte de la cafetería.'
  }
};

const tabsEl = document.getElementById('menuTabs');
const panelsEl = document.getElementById('menuPanels');

CATEGORIES.forEach((cat, i) => {
  const tab = document.createElement('button');
  tab.className = 'menu-tab' + (i === 0 ? ' active' : '');
  tab.textContent = cat.label;
  tab.dataset.key = cat.id;
  tab.addEventListener('click', () => showMenuTab(cat.id));
  tabsEl.appendChild(tab);

  const data = MENU[cat.id];
  const panel = document.createElement('div');
  panel.className = 'menu-panel' + (i === 0 ? ' active' : '');
  panel.id = 'panel-' + cat.id;
  if (data.photo) {
    const img = document.createElement('img');
    img.src = data.photo; img.alt = cat.label + ' (foto referencial, no del local)'; img.className = 'menu-cat-photo';
    panel.appendChild(img);
  }
  const grid = document.createElement('div');
  grid.className = 'menu-grid';
  const catBlock = document.createElement('div');
  catBlock.className = 'menu-cat';
  const h = document.createElement('h3');
  h.textContent = cat.label;
  catBlock.appendChild(h);
  data.items.forEach(item => {
    const row = document.createElement('div');
    row.className = 'menu-item';
    row.innerHTML = `<span class="name">${item.n}<span class="desc">${item.d}</span></span><span class="price">Consultar</span>`;
    row.addEventListener('click', () => openModal(cat.label, item));
    catBlock.appendChild(row);
  });
  if (data.note) {
    const note = document.createElement('p');
    note.className = 'ph-note';
    note.style.marginTop = '14px';
    note.textContent = data.note;
    catBlock.appendChild(note);
  }
  grid.appendChild(catBlock);
  panel.appendChild(grid);
  panelsEl.appendChild(panel);
});

function showMenuTab(key) {
  document.querySelectorAll('.menu-tab').forEach(t => t.classList.toggle('active', t.dataset.key === key));
  document.querySelectorAll('.menu-panel').forEach(p => p.classList.toggle('active', p.id === 'panel-' + key));
}

/* --------------------------------------------------------------
   MODAL PRODUCTO
-------------------------------------------------------------- */
const modalOverlay = document.getElementById('modalOverlay');
const modalBox = document.getElementById('modalBox');
let currentItem = null;
function openModal(cat, item) {
  currentItem = { ...item, cat };
  document.getElementById('modalCategory').textContent = cat;
  document.getElementById('modalName').textContent = item.n;
  document.getElementById('modalDesc').textContent = item.d;
  document.getElementById('modalPrice').textContent = 'Consultar';
  toggleModal(true);
}
function toggleModal(open) { modalOverlay.classList.toggle('open', open); modalBox.classList.toggle('open', open); }
document.getElementById('modalCloseBtn').addEventListener('click', () => toggleModal(false));
modalOverlay.addEventListener('click', () => toggleModal(false));
document.getElementById('modalAddBtn').addEventListener('click', () => {
  if (currentItem) { addToCart(currentItem); toggleModal(false); toggleCart(true); }
});

/* --------------------------------------------------------------
   CARRITO — WhatsApp real confirmado vía bio de Instagram.
-------------------------------------------------------------- */
let cart = [];
const WHATSAPP_NUMBER = '56963377702';

function addToCart(item) { cart.push({ ...item }); renderCart(); }
function removeFromCart(idx) { cart.splice(idx, 1); renderCart(); }

function renderCart() {
  const linesEl = document.getElementById('cartLines');
  if (cart.length === 0) {
    linesEl.innerHTML = '<p class="cart-empty">Aún no agregas productos. Explora la carta y súmalos aquí.</p>';
  } else {
    linesEl.innerHTML = cart.map((c, i) => `
      <div class="cart-line">
        <div><div class="name">${c.n}</div><div class="price">Consultar precio</div></div>
        <button class="cart-remove" onclick="removeFromCart(${i})">✕</button>
      </div>`).join('');
  }
  document.getElementById('cartTotal').textContent = cart.length ? 'A confirmar' : '$0';
  updateCheckoutLink();
}
function updateCheckoutLink() {
  let msg = 'Hola Café Kanela! Quisiera consultar por lo siguiente:%0A';
  if (cart.length === 0) {
    msg += '(Aún sin productos seleccionados)';
  } else {
    cart.forEach(c => { msg += `• ${c.n}%0A`; });
  }
  document.getElementById('checkoutBtn').href = `https://wa.me/${WHATSAPP_NUMBER}?text=${msg}`;
}
function toggleCart(open) { document.getElementById('cartOverlay').classList.toggle('open', open); document.getElementById('cartPanel').classList.toggle('open', open); }
document.getElementById('cartFab').addEventListener('click', () => toggleCart(true));
document.getElementById('cartCloseBtn').addEventListener('click', () => toggleCart(false));
document.getElementById('cartOverlay').addEventListener('click', () => toggleCart(false));
renderCart();

/* --------------------------------------------------------------
   ESTADO ABIERTO / CERRADO — según Instagram + resumen de Google
   (más reciente que Maps, ver nota en el HTML): L-V 6:30-20:00,
   Sáb-Dom 8:00-14:00.
-------------------------------------------------------------- */
function getSantiagoNow() {
  try {
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Santiago', weekday: 'short', hour: '2-digit', minute: '2-digit', hour12: false
    }).formatToParts(new Date());
    const map = {}; parts.forEach(p => map[p.type] = p.value);
    const weekdayMap = { Sun: 0, Mon: 1, Tue: 2, Wed: 3, Thu: 4, Fri: 5, Sat: 6 };
    return { day: weekdayMap[map.weekday], hour: parseInt(map.hour) + parseInt(map.minute) / 60 };
  } catch (e) {
    const now = new Date();
    return { day: now.getDay(), hour: now.getHours() + now.getMinutes() / 60 };
  }
}

const { day, hour } = getSantiagoNow();
let range;
if (day >= 1 && day <= 5) range = [6.5, 20];
else range = [8, 14];

const isOpen = hour >= range[0] && hour < range[1];
document.getElementById('statusDot').classList.toggle('closed', !isOpen);
document.getElementById('statusText').textContent = isOpen ? 'Abierto ahora' : 'Cerrado ahora';

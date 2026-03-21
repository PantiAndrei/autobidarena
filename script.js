/* ============================================================
   AUTOBID ARENA — MAIN SCRIPT
   ============================================================ */

/* ── FIREBASE CONFIG ────────────────────────────────────── */
const firebaseConfig = {
  apiKey:            "AIzaSyBb9CEf_05bMn179x97lhlr3HI7ZcriG-Q",
  authDomain:        "autobid-arena.firebaseapp.com",
  projectId:         "autobid-arena",
  storageBucket:     "autobid-arena.firebasestorage.app",
  messagingSenderId: "190958219780",
  appId:             "1:190958219780:web:9ef785aecb14722e1e3b51"
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/* ── NAVBAR ─────────────────────────────────────────────── */
const navbar    = document.getElementById('navbar');
const navToggle = document.getElementById('navToggle');
const navLinks  = document.getElementById('navLinks');

window.addEventListener('scroll', () => {
  navbar.classList.toggle('scrolled', window.scrollY > 60);
});

navToggle.addEventListener('click', () => {
  navLinks.classList.toggle('open');
  navToggle.classList.toggle('open');
});

navLinks.querySelectorAll('.nav-link').forEach(link => {
  link.addEventListener('click', () => {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
  });
});
document.addEventListener('click', e => {
  if (navLinks.classList.contains('open') && !navbar.contains(e.target)) {
    navLinks.classList.remove('open');
    navToggle.classList.remove('open');
  }
});

const sections   = document.querySelectorAll('section[id]');
const navLinkEls = document.querySelectorAll('.nav-link');

const sectionObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    navLinkEls.forEach(link => {
      link.classList.toggle('active',
        link.getAttribute('href') === `#${entry.target.id}`);
    });
  });
}, { rootMargin: '-45% 0px -45% 0px' });

sections.forEach(s => sectionObserver.observe(s));

/* ── SCROLL REVEAL ──────────────────────────────────────── */
const revealObserver = new IntersectionObserver(entries => {
  entries.forEach(entry => {
    if (!entry.isIntersecting) return;
    entry.target.classList.add('visible');
    revealObserver.unobserve(entry.target);
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

document.querySelectorAll('.reveal').forEach((el, i) => {
  if (el.classList.contains('service-card')) {
    el.style.transitionDelay = `${(i % 6) * 0.07}s`;
  }
  revealObserver.observe(el);
});

/* ── HELPERS ────────────────────────────────────────────── */
function buildWALink(car) {
  const text = encodeURIComponent(
    `Buna ziua, sunt interesat de ${car.marca} ${car.model} ${car.an || ''} pe care l-am vazut pe site.`
  );
  return `https://wa.me/40725762915?text=${text}`;
}

function calcMonthlyRate(pret, avansPercent, months) {
  if (!pret || pret <= 0) return null;
  const principal = pret * (1 - avansPercent / 100);
  const monthlyRate = 0.079 / 12;
  return Math.round(
    principal * monthlyRate * Math.pow(1 + monthlyRate, months)
    / (Math.pow(1 + monthlyRate, months) - 1)
  );
}

function formatPrice(car) {
  if (car.laComanda) return '<span class="car-price comanda">La Comanda</span>';
  if (!car.pret) return '<span class="car-price comanda">Pret la cerere</span>';
  return `<span class="car-price">&euro; ${Number(car.pret).toLocaleString('ro-RO')}</span>`;
}

/* ── LOAD CARS FROM FIREBASE ─────────────────────────────── */
const carsGrid   = document.getElementById('carsGrid');
const emptyStock = document.getElementById('emptyStock');
const statCars   = document.getElementById('statCars');

let allCars      = [];
let activeFilter = 'all';

/* SVG icons for car specs */
const ICO = {
  an:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="4" width="18" height="18" rx="3"/><path d="M16 2v4M8 2v4M3 10h18"/><circle cx="8" cy="15" r="1" fill="currentColor" stroke="none"/><circle cx="12" cy="15" r="1" fill="currentColor" stroke="none"/><circle cx="16" cy="15" r="1" fill="currentColor" stroke="none"/></svg>`,
  km:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path d="M4.5 14.5a8 8 0 1 1 15 0"/><path d="M12 14.5l-3.5-5.5"/><circle cx="12" cy="14.5" r="1.4" fill="currentColor" stroke="none"/></svg>`,
  fuel: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M4 22V7.5A1.5 1.5 0 0 1 5.5 6h9A1.5 1.5 0 0 1 16 7.5V22"/><path d="M4 12h12"/><path d="M16 7l3.5 3.5V17a1 1 0 0 0 2 0v-6l-1.5-1.5"/></svg>`,
  gear: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M12 1v3M12 20v3M4.22 4.22l2.12 2.12M17.66 17.66l2.12 2.12M1 12h3M20 12h3M4.22 19.78l2.12-2.12M17.66 6.34l2.12-2.12"/></svg>`,
  cp:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M13 2L4.5 13H12L11 22l8.5-11H12L13 2z"/></svg>`,
  pin:  `<svg viewBox="0 0 24 24" fill="currentColor"><path d="M12 2C8.13 2 5 5.13 5 9c0 5.25 7 13 7 13s7-7.75 7-13c0-3.87-3.13-7-7-7zm0 9.5c-1.38 0-2.5-1.12-2.5-2.5s1.12-2.5 2.5-2.5 2.5 1.12 2.5 2.5-1.12 2.5-2.5 2.5z"/></svg>`,
};

function renderCars(cars) {
  carsGrid.innerHTML = '';

  if (!cars.length) {
    emptyStock.style.display = 'block';
    return;
  }
  emptyStock.style.display = 'none';

  cars.forEach((car, idx) => {
    const card = document.createElement('div');
    card.className = 'car-card reveal';
    card.style.transitionDelay = `${(idx % 3) * 0.07}s`;
    card.dataset.caroserie = car.caroserie || '';

    const imgSrc = (car.imagini && car.imagini[0]) || car.imagine
      || 'https://via.placeholder.com/600x375/0d1225/2dc653?text=AutoBid+Arena';
    const imgCount = (car.imagini || []).length;
    const rate     = calcMonthlyRate(car.pret, 20, 60);

    /* Price */
    let priceHtml;
    if (car.laComanda)  priceHtml = `<div class="cc-price comanda">La Coman&#x103;</div>`;
    else if (!car.pret) priceHtml = `<div class="cc-price comanda">Pre&#x21B; la cerere</div>`;
    else                priceHtml = `<div class="cc-price">&euro;${Number(car.pret).toLocaleString('ro-RO')}</div>`;

    /* Specs rows — 2 per row, icon + label */
    const specRows = [
      car.an          && `<div class="cc-spec">${ICO.an}<span>${car.an}</span></div>`,
      car.km          && `<div class="cc-spec">${ICO.km}<span>${Number(car.km).toLocaleString('ro-RO')} km</span></div>`,
      car.combustibil && `<div class="cc-spec">${ICO.fuel}<span>${car.combustibil}</span></div>`,
      car.transmisie  && `<div class="cc-spec">${ICO.gear}<span>${car.transmisie}</span></div>`,
      car.cp          && `<div class="cc-spec">${ICO.cp}<span>${car.cp} CP</span></div>`,
    ].filter(Boolean).join('');

    card.innerHTML = `
      <div class="car-img-wrap">
        <img src="${imgSrc}" alt="${car.marca} ${car.model}" loading="lazy" />
        <span class="cc-badge ${car.laComanda ? 'cc-badge-comanda' : 'cc-badge-rec'}">
          ${car.laComanda ? 'La Coman&#x103;' : 'Recomandat'}
        </span>
        ${rate ? `<span class="cc-rate-badge">De la &euro;${rate} / lun&auml;</span>` : ''}
        ${imgCount > 1 ? `<span class="cc-img-count">&#128247; ${imgCount}</span>` : ''}
      </div>
      <div class="car-body">
        <div class="cc-location">${ICO.pin} Sibiu</div>
        <div class="cc-name">${car.marca} ${car.model}</div>
        ${car.caroserie ? `<div class="cc-trim">${car.caroserie}${car.normaPoluare ? ' &middot; ' + car.normaPoluare : ''}</div>` : ''}
        ${priceHtml}
        ${specRows ? `<div class="cc-specs-grid">${specRows}</div>` : ''}
        <div class="cc-actions">
          <a href="${buildWALink(car)}" target="_blank" class="cc-btn-wa" onclick="event.stopPropagation()" aria-label="WhatsApp">
            <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.557 4.122 1.532 5.856L.073 23.927l6.244-1.638A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.006-1.373l-.36-.213-3.706.972.988-3.61-.234-.37A9.818 9.818 0 1 1 12 21.818z"/></svg>
          </a>
          <a href="/masina/${car.id}" class="cc-btn-details" onclick="event.stopPropagation()">Vezi detalii</a>
        </div>
      </div>
    `;

    card.addEventListener('click', () => {
      window.location.href = `/masina/${car.id}`;
    });

    carsGrid.appendChild(card);
    setTimeout(() => revealObserver.observe(card), 50);
  });
}

function applyFilter(filter) {
  activeFilter = filter;
  const filtered = filter === 'all'
    ? allCars
    : allCars.filter(c => c.caroserie === filter);
  renderCars(filtered);
}

db.collection('masini').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
  allCars = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
  statCars.textContent = allCars.length;
  applyFilter(activeFilter);
}, err => {
  console.error('Firestore error:', err);
  carsGrid.innerHTML = `<p style="color:var(--muted);text-align:center;grid-column:1/-1;padding:3rem">
    Eroare la incarcarea anunturilor.
  </p>`;
});

/* ── FILTERS ────────────────────────────────────────────── */
document.querySelectorAll('.filter-btn').forEach(btn => {
  btn.addEventListener('click', () => {
    document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    applyFilter(btn.dataset.filter);
  });
});

/* ── THEME TOGGLE ───────────────────────────────────────── */
document.getElementById('themeToggle').addEventListener('click', () => {
  const isLight = document.documentElement.classList.toggle('light');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
});

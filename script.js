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

    const rate = calcMonthlyRate(car.pret, 20, 60);
    const rateHtml = rate
      ? `<div class="car-rate">De la <strong>&euro; ${rate}</strong> / luna</div>`
      : '';

    const cpCil = [
      car.cp        ? `${car.cp} CP`    : '',
      car.cilindree ? `${Number(car.cilindree).toLocaleString('ro-RO')} cm&sup3;` : '',
    ].filter(Boolean).join(' &middot; ');

    card.innerHTML = `
      <div class="car-img-wrap">
        <img src="${imgSrc}" alt="${car.marca} ${car.model}" loading="lazy" />
        <div class="car-img-overlay">
          <div class="car-img-title">${car.marca} ${car.model}${car.an ? ' &middot; ' + car.an : ''}</div>
          ${cpCil ? `<div class="car-img-engine">${cpCil}</div>` : ''}
        </div>
        ${car.laComanda ? '<span class="car-badge-comanda">La Comanda</span>' : ''}
        ${imgCount > 1 ? `<span class="car-img-count">&#128247; ${imgCount}</span>` : ''}
      </div>
      <div class="car-body">
        <div class="car-specs">
          ${car.an          ? `<span class="car-spec">${car.an}</span>` : ''}
          ${car.km          ? `<span class="car-spec">${Number(car.km).toLocaleString('ro-RO')} km</span>` : ''}
          ${car.combustibil ? `<span class="car-spec">${car.combustibil}</span>` : ''}
          ${car.transmisie  ? `<span class="car-spec">${car.transmisie}</span>` : ''}
          ${car.caroserie   ? `<span class="car-spec">${car.caroserie}</span>` : ''}
        </div>
        <div class="car-price-row">
          <div>
            ${formatPrice(car)}
            ${rateHtml}
          </div>
          <div class="car-actions">
            <a href="${buildWALink(car)}" target="_blank" class="car-btn-wa" onclick="event.stopPropagation()" aria-label="WhatsApp">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.557 4.122 1.532 5.856L.073 23.927l6.244-1.638A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.006-1.373l-.36-.213-3.706.972.988-3.61-.234-.37A9.818 9.818 0 1 1 12 21.818z"/></svg>
            </a>
            <a href="/masina/${car.id}" class="car-btn-details" onclick="event.stopPropagation()">Detalii</a>
          </div>
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

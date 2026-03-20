/* ============================================================
   AUTOBID ARENA — MAIN SCRIPT
   ============================================================ */

/* ── FIREBASE CONFIG ────────────────────────────────────── */
// TODO: Replace with your Firebase project config
// Get it from: Firebase Console → Project Settings → Your apps → Config
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

// Active nav link on scroll
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

/* ── LOAD CARS FROM FIREBASE ─────────────────────────────── */
const carsGrid   = document.getElementById('carsGrid');
const emptyStock = document.getElementById('emptyStock');
const statCars   = document.getElementById('statCars');

let allCars       = [];
let activeFilter  = 'all';

function formatPrice(car) {
  if (car.laComanda) return '<span class="car-price comanda">La Comandă</span>';
  if (!car.pret) return '<span class="car-price comanda">Preț la cerere</span>';
  return `<span class="car-price">€ ${Number(car.pret).toLocaleString('ro-RO')}</span>`;
}

function buildWALink(car) {
  const text = encodeURIComponent(
    `Bună ziua, sunt interesat de ${car.marca} ${car.model} ${car.an || ''} pe care l-am văzut pe site.`
  );
  return `https://wa.me/40725762915?text=${text}`;
}

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

    const imgSrc = (car.imagini && car.imagini[0]) || car.imagine || 'https://via.placeholder.com/600x375/0d1225/2dc653?text=AutoBid+Arena';
    const imgCount = (car.imagini || []).length;

    card.innerHTML = `
      <div class="car-img-wrap">
        <img src="${imgSrc}" alt="${car.marca} ${car.model}" loading="lazy" />
        ${car.laComanda ? '<span class="car-badge-comanda">La Comandă</span>' : ''}
        ${imgCount > 1 ? `<span class="car-img-count">📷 ${imgCount}</span>` : ''}
      </div>
      <div class="car-body">
        <h3 class="car-title">${car.marca} ${car.model}${car.an ? ' ' + car.an : ''}</h3>
        <div class="car-specs">
          ${car.an          ? `<span class="car-spec">${car.an}</span>` : ''}
          ${car.km          ? `<span class="car-spec">${Number(car.km).toLocaleString('ro-RO')} km</span>` : ''}
          ${car.combustibil ? `<span class="car-spec">${car.combustibil}</span>` : ''}
          ${car.transmisie  ? `<span class="car-spec">${car.transmisie}</span>` : ''}
          ${car.caroserie   ? `<span class="car-spec">${car.caroserie}</span>` : ''}
        </div>
        <div class="car-price-row">
          ${formatPrice(car)}
          <div class="car-actions">
            <a href="${buildWALink(car)}" target="_blank" class="car-btn-wa" onclick="event.stopPropagation()">
              <svg viewBox="0 0 24 24" fill="currentColor"><path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347z"/><path d="M12 0C5.373 0 0 5.373 0 12c0 2.125.557 4.122 1.532 5.856L.073 23.927l6.244-1.638A11.945 11.945 0 0 0 12 24c6.627 0 12-5.373 12-12S18.627 0 12 0zm0 21.818a9.818 9.818 0 0 1-5.006-1.373l-.36-.213-3.706.972.988-3.61-.234-.37A9.818 9.818 0 1 1 12 21.818z"/></svg>
              WA
            </a>
            <button class="car-btn-details" data-id="${car.id}">Detalii</button>
          </div>
        </div>
      </div>
    `;

    card.addEventListener('click', () => openModal(car));
    card.querySelector('.car-btn-details').addEventListener('click', (e) => {
      e.stopPropagation();
      openModal(car);
    });

    carsGrid.appendChild(card);
    // trigger reveal
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
    Eroare la încărcarea anunțurilor. Verificați configurarea Firebase.
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

/* ── MODAL ──────────────────────────────────────────────── */
const modal      = document.getElementById('carModal');
const modalClose = document.getElementById('modalClose');
const modalBackd = modal.querySelector('.modal-backdrop');

let sliderImages = [];
let sliderIdx    = 0;

function openModal(car) {
  // Build images array
  sliderImages = (car.imagini && car.imagini.length)
    ? car.imagini
    : (car.imagine ? [car.imagine] : ['https://via.placeholder.com/700x394/0d1225/2dc653?text=AutoBid+Arena']);
  sliderIdx = 0;

  renderSlider();

  document.getElementById('modalTitle').textContent = `${car.marca} ${car.model}${car.an ? ' · ' + car.an : ''}`;

  const specs = [
    car.an          && `An: ${car.an}`,
    car.km          && `${Number(car.km).toLocaleString('ro-RO')} km`,
    car.combustibil && car.combustibil,
    car.transmisie  && car.transmisie,
    car.caroserie   && car.caroserie,
    car.culoare     && `Culoare: ${car.culoare}`,
  ].filter(Boolean);

  document.getElementById('modalSpecs').innerHTML = specs
    .map(s => `<span class="modal-spec-item">${s}</span>`).join('');

  document.getElementById('modalDesc').textContent = car.descriere || '';

  const priceEl = document.getElementById('modalPrice');
  priceEl.textContent = car.laComanda ? 'La Comandă' : (car.pret ? `€ ${Number(car.pret).toLocaleString('ro-RO')}` : 'Preț la cerere');
  priceEl.style.color = car.laComanda ? 'var(--green)' : 'var(--accent)';

  document.getElementById('modalWA').href = buildWALink(car);

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
}

function renderSlider() {
  const wrap = document.getElementById('modalImgWrap');
  const total = sliderImages.length;

  wrap.innerHTML = `
    <img id="modalImg" src="${sliderImages[sliderIdx]}" alt="Imagine ${sliderIdx + 1}" />
    ${total > 1 ? `
      <button class="slider-btn slider-prev" id="sliderPrev">&#8249;</button>
      <button class="slider-btn slider-next" id="sliderNext">&#8250;</button>
      <div class="slider-dots">
        ${sliderImages.map((_, i) => `<span class="slider-dot ${i === sliderIdx ? 'active' : ''}" data-i="${i}"></span>`).join('')}
      </div>
      <span class="slider-count">${sliderIdx + 1} / ${total}</span>
    ` : ''}
  `;

  if (total > 1) {
    document.getElementById('sliderPrev').addEventListener('click', e => { e.stopPropagation(); sliderMove(-1); });
    document.getElementById('sliderNext').addEventListener('click', e => { e.stopPropagation(); sliderMove(1); });
    wrap.querySelectorAll('.slider-dot').forEach(dot => {
      dot.addEventListener('click', e => { e.stopPropagation(); sliderIdx = parseInt(dot.dataset.i); renderSlider(); });
    });
  }
}

function sliderMove(dir) {
  sliderIdx = (sliderIdx + dir + sliderImages.length) % sliderImages.length;
  renderSlider();
}

function closeModal() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modalBackd.addEventListener('click', closeModal);
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
  if (e.key === 'ArrowLeft'  && modal.classList.contains('open')) sliderMove(-1);
  if (e.key === 'ArrowRight' && modal.classList.contains('open')) sliderMove(1);
});

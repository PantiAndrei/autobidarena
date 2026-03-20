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

/* ── MODAL ──────────────────────────────────────────────── */
const modal      = document.getElementById('carModal');
const modalClose = document.getElementById('modalClose');
const modalBackd = modal.querySelector('.modal-backdrop');

let sliderImages = [];
let sliderIdx    = 0;

function openModal(car) {
  sliderImages = (car.imagini && car.imagini.length)
    ? car.imagini
    : (car.imagine ? [car.imagine]
      : ['https://via.placeholder.com/700x394/0d1225/2dc653?text=AutoBid+Arena']);
  sliderIdx = 0;

  renderSlider();
  renderThumbs();

  // Title
  document.getElementById('modalTitle').textContent =
    `${car.marca} ${car.model}${car.an ? ' \u00B7 ' + car.an : ''}`;

  const subtitleParts = [
    car.caroserie, car.combustibil, car.transmisie,
    car.cp ? car.cp + ' CP' : '',
    car.normaPoluare,
  ].filter(Boolean);
  document.getElementById('modalSubtitle').textContent = subtitleParts.join(' \u00B7 ');

  // Price
  const priceEl = document.getElementById('modalPrice');
  if (car.laComanda) {
    priceEl.textContent = 'La Comanda';
    priceEl.className = 'modal-price comanda';
  } else if (car.pret) {
    priceEl.textContent = '\u20AC ' + Number(car.pret).toLocaleString('ro-RO');
    priceEl.className = 'modal-price';
  } else {
    priceEl.textContent = 'Pret la cerere';
    priceEl.className = 'modal-price comanda';
  }

  const rate = calcMonthlyRate(car.pret, 20, 60);
  document.getElementById('modalRate').textContent =
    rate ? `De la \u20AC ${rate} / luna (avans 20%, 60 luni)` : '';

  // WA
  document.getElementById('modalWA').href = buildWALink(car);

  // Specs table
  const specsData = [
    ['An fabricatie', car.an],
    ['Kilometraj', car.km ? Number(car.km).toLocaleString('ro-RO') + ' km' : null],
    ['Combustibil', car.combustibil],
    ['Transmisie', car.transmisie],
    ['Caroserie', car.caroserie],
    ['Putere', car.cp ? car.cp + ' CP' : null],
    ['Cilindree', car.cilindree ? Number(car.cilindree).toLocaleString('ro-RO') + ' cm\u00B3' : null],
    ['Nr. usi', car.numarUsi],
    ['Locuri', car.locuri],
    ['Culoare exterior', car.culoare],
    ['Culoare interior', car.culoareInterior],
    ['Material interior', car.material],
    ['Norma poluare', car.normaPoluare],
  ].filter(([, v]) => v);

  document.getElementById('modalSpecsTable').innerHTML = specsData
    .map(([label, value]) => `
      <div class="spec-row">
        <span class="spec-label">${label}</span>
        <span class="spec-value">${value}</span>
      </div>
    `).join('');

  // Dotari
  const dotari = car.dotari || [];
  const dotariList  = document.getElementById('modalDotariList');
  const dotariEmpty = document.getElementById('modalDotariEmpty');
  if (dotari.length) {
    dotariList.style.display  = '';
    dotariEmpty.style.display = 'none';
    dotariList.innerHTML = dotari.map(d => `<div class="dotare-tag">${d}</div>`).join('');
  } else {
    dotariList.style.display  = 'none';
    dotariEmpty.style.display = '';
  }

  // Description
  document.getElementById('modalDesc').textContent =
    car.descriere || 'Nu exista descriere disponibila.';

  // Financing calculator
  initCalc(car.pret || 0);

  // Reset to first tab
  document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
  document.querySelectorAll('.modal-tab-panel').forEach(p => p.classList.remove('active'));
  document.querySelector('.modal-tab[data-tab="specs"]').classList.add('active');
  document.getElementById('tabSpecs').classList.add('active');

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';
  modal.scrollTop = 0;
}

/* ── GALLERY ─────────────────────────────────────────────── */
function renderSlider() {
  const wrap  = document.getElementById('modalImgWrap');
  const total = sliderImages.length;

  wrap.innerHTML = `
    <img src="${sliderImages[sliderIdx]}" alt="Imagine ${sliderIdx + 1}" />
    ${total > 1 ? `
      <button class="slider-btn slider-prev" id="sliderPrev">&#8249;</button>
      <button class="slider-btn slider-next" id="sliderNext">&#8250;</button>
      <span class="slider-count">${sliderIdx + 1} / ${total}</span>
    ` : ''}
  `;

  if (total > 1) {
    document.getElementById('sliderPrev')
      .addEventListener('click', e => { e.stopPropagation(); sliderMove(-1); });
    document.getElementById('sliderNext')
      .addEventListener('click', e => { e.stopPropagation(); sliderMove(1); });
  }
}

function renderThumbs() {
  const thumbsEl = document.getElementById('modalThumbs');
  if (sliderImages.length <= 1) { thumbsEl.style.display = 'none'; return; }
  thumbsEl.style.display = 'flex';
  thumbsEl.innerHTML = sliderImages.map((src, i) => `
    <div class="modal-thumb ${i === sliderIdx ? 'active' : ''}" data-i="${i}">
      <img src="${src}" alt="Thumbnail ${i + 1}" loading="lazy" />
    </div>
  `).join('');

  thumbsEl.querySelectorAll('.modal-thumb').forEach(thumb => {
    thumb.addEventListener('click', () => {
      sliderIdx = parseInt(thumb.dataset.i);
      renderSlider();
      renderThumbs();
    });
  });
}

function sliderMove(dir) {
  sliderIdx = (sliderIdx + dir + sliderImages.length) % sliderImages.length;
  renderSlider();
  renderThumbs();
}

/* ── FINANCING CALCULATOR ───────────────────────────────── */
function initCalc(pret) {
  const avansInput  = document.getElementById('calcAvans');
  const periodInput = document.getElementById('calcPeriod');

  function updateCalc() {
    const avans  = parseInt(avansInput.value);
    const months = parseInt(periodInput.value);
    const finantat = Math.round(pret * (1 - avans / 100));
    const rate = calcMonthlyRate(pret, avans, months);

    document.getElementById('calcAvansVal').innerHTML =
      `${avans}% &mdash; &euro; ${Math.round(pret * avans / 100).toLocaleString('ro-RO')}`;
    document.getElementById('calcPeriodVal').textContent = `${months} luni`;
    document.getElementById('calcRate').textContent =
      pret > 0 && rate ? `\u20AC ${rate.toLocaleString('ro-RO')} / lun\u0103` : '&mdash; / lun\u0103';
    document.getElementById('calcFinantat').textContent =
      pret > 0 ? `\u20AC ${finantat.toLocaleString('ro-RO')}` : '\u2014';
  }

  avansInput.removeEventListener('input', avansInput._handler);
  periodInput.removeEventListener('input', periodInput._handler);
  avansInput._handler  = updateCalc;
  periodInput._handler = updateCalc;
  avansInput.addEventListener('input', updateCalc);
  periodInput.addEventListener('input', updateCalc);
  avansInput.value  = 20;
  periodInput.value = 60;
  updateCalc();
}

/* ── TABS ───────────────────────────────────────────────── */
document.querySelectorAll('.modal-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.modal-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.modal-tab-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const panelId = 'tab' + tab.dataset.tab.charAt(0).toUpperCase() + tab.dataset.tab.slice(1);
    document.getElementById(panelId).classList.add('active');
  });
});

/* ── CLOSE MODAL ─────────────────────────────────────────── */
function closeModal() {
  modal.classList.remove('open');
  document.body.style.overflow = '';
}

modalClose.addEventListener('click', closeModal);
modalBackd.addEventListener('click', e => {
  if (e.target === modalBackd) closeModal();
});
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') closeModal();
  if (modal.classList.contains('open')) {
    if (e.key === 'ArrowLeft')  sliderMove(-1);
    if (e.key === 'ArrowRight') sliderMove(1);
  }
});

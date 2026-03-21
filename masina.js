/* ============================================================
   MASINA.JS — Car detail page
   ============================================================ */

/* ── FIREBASE CONFIG ── */
const firebaseConfig = {
  apiKey:            'AIzaSyBb9CEf_05bMn179x97lhlr3HI7ZcriG-Q',
  authDomain:        'autobid-arena.firebaseapp.com',
  projectId:         'autobid-arena',
  storageBucket:     'autobid-arena.firebasestorage.app',
  messagingSenderId: '190958219780',
  appId:             '1:190958219780:web:9ef785aecb14722e1e3b51'
};

firebase.initializeApp(firebaseConfig);
const db = firebase.firestore();

/* ── NAVBAR ── */
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

/* ── GET CAR ID FROM URL: /masina/[carId] ── */
const carId = window.location.pathname.split('/').filter(Boolean).pop();

/* ── HELPERS ── */
function calcMonthlyRate(pret, avansPercent, months) {
  if (!pret || pret <= 0) return null;
  const principal = pret * (1 - avansPercent / 100);
  const r = 0.079 / 12;
  return Math.round(principal * r * Math.pow(1 + r, months) / (Math.pow(1 + r, months) - 1));
}

function buildWALink(car) {
  const text = encodeURIComponent(
    `Buna ziua, sunt interesat de ${car.marca} ${car.model} ${car.an || ''} pe care l-am vazut pe site.`
  );
  return `https://wa.me/40725762915?text=${text}`;
}

/* ── GALLERY ── */
let sliderImages = [];
let sliderIdx    = 0;

function renderMainImg() {
  const wrap  = document.getElementById('cpMainImg');
  const total = sliderImages.length;
  wrap.innerHTML = `
    <img src="${sliderImages[sliderIdx]}" alt="Imagine ${sliderIdx + 1}" />
    ${total > 1 ? `
      <button class="slider-btn slider-prev" id="cpSliderPrev">&#8249;</button>
      <button class="slider-btn slider-next" id="cpSliderNext">&#8250;</button>
      <span class="slider-count">${sliderIdx + 1} / ${total}</span>
    ` : ''}
  `;
  /* Fade-in when image loads */
  const img = wrap.querySelector('img');
  const show = () => img.classList.add('gallery-img--loaded');
  if (img.complete && img.naturalWidth > 0) {
    requestAnimationFrame(() => requestAnimationFrame(show));
  } else {
    img.addEventListener('load', show, { once: true });
  }
  if (total > 1) {
    document.getElementById('cpSliderPrev').addEventListener('click', () => sliderMove(-1));
    document.getElementById('cpSliderNext').addEventListener('click', () => sliderMove(1));
  }
}

function renderThumbs() {
  const el = document.getElementById('cpThumbs');
  if (sliderImages.length <= 1) { el.style.display = 'none'; return; }
  el.style.display = 'flex';
  el.innerHTML = sliderImages.map((src, i) => `
    <div class="modal-thumb ${i === sliderIdx ? 'active' : ''}" data-i="${i}">
      <img src="${src}" alt="Thumbnail ${i + 1}" loading="lazy" />
    </div>
  `).join('');
  el.querySelectorAll('.modal-thumb').forEach(t => {
    t.addEventListener('click', () => {
      sliderIdx = parseInt(t.dataset.i);
      renderMainImg();
      renderThumbs();
    });
  });
  /* Scroll active thumb into view */
  const active = el.querySelector('.modal-thumb.active');
  if (active) active.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
}

/* ── GALLERY TOUCH SWIPE ── */
(function initGallerySwipe() {
  const wrap = document.getElementById('cpMainImg');
  let sx = 0, sy = 0;
  wrap.addEventListener('touchstart', e => {
    sx = e.touches[0].clientX;
    sy = e.touches[0].clientY;
  }, { passive: true });
  wrap.addEventListener('touchend', e => {
    const dx = sx - e.changedTouches[0].clientX;
    const dy = sy - e.changedTouches[0].clientY;
    if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40 && sliderImages.length > 1) {
      sliderMove(dx > 0 ? 1 : -1);
    }
  }, { passive: true });
}());

function sliderMove(dir) {
  sliderIdx = (sliderIdx + dir + sliderImages.length) % sliderImages.length;
  renderMainImg();
  renderThumbs();
}

document.addEventListener('keydown', e => {
  if (e.key === 'ArrowLeft')  sliderMove(-1);
  if (e.key === 'ArrowRight') sliderMove(1);
});

/* ── FINANCING CALCULATOR ── */
function initCalc(pret) {
  const avans  = document.getElementById('cpCalcAvans');
  const period = document.getElementById('cpCalcPeriod');

  function update() {
    const a = parseInt(avans.value);
    const m = parseInt(period.value);
    const finantat = Math.round(pret * (1 - a / 100));
    const rate = calcMonthlyRate(pret, a, m);

    document.getElementById('cpCalcAvansVal').innerHTML =
      `${a}% &mdash; &euro; ${Math.round(pret * a / 100).toLocaleString('ro-RO')}`;
    document.getElementById('cpCalcPeriodVal').textContent = `${m} luni`;
    document.getElementById('cpCalcRate').textContent =
      pret > 0 && rate ? `\u20AC ${rate.toLocaleString('ro-RO')} / lun\u0103` : '\u2014 / lun\u0103';
    document.getElementById('cpCalcFinantat').textContent =
      pret > 0 ? `\u20AC ${finantat.toLocaleString('ro-RO')}` : '\u2014';
  }

  avans.addEventListener('input', update);
  period.addEventListener('input', update);
  avans.value = 20;
  period.value = 60;
  update();
}

/* ── TABS ── */
document.querySelectorAll('.cp-tab').forEach(tab => {
  tab.addEventListener('click', () => {
    document.querySelectorAll('.cp-tab').forEach(t => t.classList.remove('active'));
    document.querySelectorAll('.cp-tab-panel').forEach(p => p.classList.remove('active'));
    tab.classList.add('active');
    const panelId = 'cpTab' + tab.dataset.tab.charAt(0).toUpperCase() + tab.dataset.tab.slice(1);
    document.getElementById(panelId).classList.add('active');
  });
});

/* ── RENDER PAGE ── */
function renderPage(car) {
  const waLink = buildWALink(car);

  /* Meta tags */
  const title = `${car.marca} ${car.model}${car.an ? ' ' + car.an : ''} \u2013 AutoBid Arena Sibiu`;
  const descParts = [
    car.marca, car.model, car.an ? String(car.an) : null,
    car.km ? Number(car.km).toLocaleString('ro-RO') + ' km' : null,
    car.combustibil, car.transmisie,
    'disponibil la AutoBid Arena Sibiu'
  ].filter(Boolean);
  const desc = descParts.join(', ');

  document.getElementById('pageTitle').textContent = title;
  document.getElementById('metaDesc').setAttribute('content', desc);
  document.getElementById('ogTitle').setAttribute('content', title);
  document.getElementById('ogDesc').setAttribute('content', desc);
  if (car.imagini && car.imagini[0]) {
    document.getElementById('ogImage').setAttribute('content', car.imagini[0]);
  }

  /* Breadcrumb */
  document.getElementById('bcCar').textContent =
    `${car.marca} ${car.model}${car.an ? ' ' + car.an : ''}`;

  /* Gallery */
  sliderImages = (car.imagini && car.imagini.length)
    ? car.imagini
    : (car.imagine ? [car.imagine]
      : ['https://via.placeholder.com/900x600/0d1225/2dc653?text=AutoBid+Arena']);
  sliderIdx = 0;
  renderMainImg();
  renderThumbs();

  /* Badge */
  const badgeRow = document.getElementById('cpBadgeRow');
  if (car.laComanda) {
    badgeRow.innerHTML = '<span class="car-badge-comanda">La Coman\u0103</span>';
  } else if (car.caroserie) {
    badgeRow.innerHTML = `<span class="cp-badge-type">${car.caroserie}</span>`;
  }

  /* Title / subtitle */
  document.getElementById('cpTitle').textContent = `${car.marca} ${car.model}`;
  document.getElementById('cpSubtitle').textContent = [
    car.an, car.combustibil, car.transmisie,
    car.cp ? car.cp + ' CP' : null,
    car.normaPoluare
  ].filter(Boolean).join(' \u00B7 ');

  /* Price */
  const priceEl = document.getElementById('cpPrice');
  if (car.laComanda) {
    priceEl.textContent = 'La Coman\u0103';
    priceEl.className = 'cp-price comanda';
  } else if (car.pret) {
    priceEl.innerHTML =
      `<span class="cp-price-cur">\u20AC</span> ${Number(car.pret).toLocaleString('ro-RO')}`;
    priceEl.className = 'cp-price';
  } else {
    priceEl.textContent = 'Pre\u021B la cerere';
    priceEl.className = 'cp-price comanda';
  }

  const rate = calcMonthlyRate(car.pret, 20, 60);
  document.getElementById('cpRate').textContent = rate
    ? `De la \u20AC ${rate.toLocaleString('ro-RO')} / lun\u0103 (avans 20%, 60 luni)` : '';

  /* Quick specs */
  const qSpecs = [
    car.an          && { label: 'An fab.',      val: car.an },
    car.km          && { label: 'Kilometraj',   val: Number(car.km).toLocaleString('ro-RO') + ' km' },
    car.combustibil && { label: 'Combustibil',  val: car.combustibil },
    car.transmisie  && { label: 'Transmisie',   val: car.transmisie },
  ].filter(Boolean);
  document.getElementById('cpQuickSpecs').innerHTML = qSpecs.map(s => `
    <div class="cp-qspec">
      <div class="cp-qspec-label">${s.label}</div>
      <div class="cp-qspec-val">${s.val}</div>
    </div>
  `).join('');

  /* WA links */
  document.getElementById('cpWA').href       = waLink;
  document.getElementById('cpWA2').href      = waLink;
  document.getElementById('cpMobileWA').href = waLink;

  /* Specs table */
  const specsData = [
    ['An fabrica\u021Bie', car.an],
    ['Kilometraj', car.km ? Number(car.km).toLocaleString('ro-RO') + ' km' : null],
    ['Combustibil', car.combustibil],
    ['Transmisie', car.transmisie],
    ['Caroserie', car.caroserie],
    ['Putere', car.cp ? car.cp + ' CP' : null],
    ['Cilindree', car.cilindree ? Number(car.cilindree).toLocaleString('ro-RO') + ' cm\u00B3' : null],
    ['Nr. u\u015Fi', car.numarUsi],
    ['Locuri', car.locuri],
    ['Culoare exterior', car.culoare],
    ['Culoare interior', car.culoareInterior],
    ['Material interior', car.material],
    ['Norm\u0103 poluare', car.normaPoluare],
  ].filter(([, v]) => v);

  document.getElementById('cpSpecsGrid').innerHTML = specsData.map(([label, value]) => `
    <div class="spec-row">
      <span class="spec-label">${label}</span>
      <span class="spec-value">${value}</span>
    </div>
  `).join('');

  /* Dotari */
  const dotari     = car.dotari || [];
  const dotariList  = document.getElementById('cpDotariList');
  const dotariEmpty = document.getElementById('cpDotariEmpty');
  if (dotari.length) {
    dotariList.style.display  = '';
    dotariEmpty.style.display = 'none';
    dotariList.innerHTML = dotari.map(d => `<div class="dotare-tag">${d}</div>`).join('');
  } else {
    dotariList.style.display  = 'none';
    dotariEmpty.style.display = '';
  }

  /* Description */
  document.getElementById('cpDesc').textContent =
    car.descriere || 'Nu exist\u0103 descriere disponibil\u0103.';

  /* Financing calc */
  initCalc(car.pret || 0);

  /* JSON-LD structured data */
  const ld = {
    '@context': 'https://schema.org',
    '@type': 'Car',
    'name': `${car.marca} ${car.model}`,
    'brand': { '@type': 'Brand', 'name': car.marca },
    'model': car.model,
    'vehicleModelDate': car.an ? String(car.an) : undefined,
    'mileageFromOdometer': car.km
      ? { '@type': 'QuantitativeValue', 'value': Number(car.km), 'unitCode': 'KMT' }
      : undefined,
    'fuelType': car.combustibil,
    'vehicleTransmission': car.transmisie,
    'bodyType': car.caroserie,
    'image': sliderImages[0],
    'offers': car.pret ? {
      '@type': 'Offer',
      'price': Number(car.pret),
      'priceCurrency': 'EUR',
      'availability': 'https://schema.org/InStock',
      'seller': {
        '@type': 'AutoDealer',
        'name': 'AutoBid Arena',
        'telephone': '+40725762915',
        'address': {
          '@type': 'PostalAddress',
          'streetAddress': 'Strada Rahovei nr 59',
          'addressLocality': 'Sibiu',
          'addressCountry': 'RO'
        }
      }
    } : undefined
  };
  document.getElementById('jsonLd').textContent =
    JSON.stringify(ld, (_k, v) => v === undefined ? undefined : v);

  /* Show content */
  document.getElementById('cpLoading').style.display = 'none';
  document.getElementById('cpContent').style.display = '';
}

/* ── NOT FOUND ── */
function showNotFound() {
  document.getElementById('cpLoading').style.display = 'none';
  document.getElementById('cpNotFound').style.display = '';
}

/* ── LOAD CAR ── */
async function loadCar() {
  if (!carId) { showNotFound(); return; }
  try {
    const doc = await db.collection('masini').doc(carId).get();
    if (!doc.exists) { showNotFound(); return; }
    renderPage({ id: doc.id, ...doc.data() });
  } catch (e) {
    console.error('Error loading car:', e);
    showNotFound();
  }
}

loadCar();

/* ── THEME TOGGLE ───────────────────────────────────────── */
document.getElementById('themeToggle').addEventListener('click', () => {
  const isLight = document.documentElement.classList.toggle('light');
  localStorage.setItem('theme', isLight ? 'light' : 'dark');
});

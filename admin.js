/* ============================================================
   AUTOBID ARENA — ADMIN SCRIPT
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
const db      = firebase.firestore();
const auth    = firebase.auth();
const storage = firebase.storage();

/* ── CAR DATA ───────────────────────────────────────────── */
const carData = {
  'Alfa Romeo':    ['Giulia','Giulietta','Mito','Stelvio','Tonale','159','156','147'],
  'Audi':          ['A1','A3','A4','A5','A6','A7','A8','Q2','Q3','Q5','Q7','Q8','TT','R8','e-tron'],
  'BMW':           ['Seria 1','Seria 2','Seria 3','Seria 4','Seria 5','Seria 6','Seria 7','X1','X2','X3','X4','X5','X6','X7','Z4','M2','M3','M4','M5','iX','i4','i5'],
  'Chevrolet':     ['Aveo','Cruze','Malibu','Captiva','Orlando','Spark','Trax'],
  'Citroën':       ['C1','C3','C3 Aircross','C4','C4 Cactus','C5','C5 Aircross','C8','Berlingo','Jumper'],
  'Dacia':         ['Logan','Logan MCV','Sandero','Sandero Stepway','Duster','Jogger','Spring','Dokker','Lodgy'],
  'Fiat':          ['500','500L','500X','Bravo','Doblo','Ducato','Grande Punto','Panda','Punto','Tipo'],
  'Ford':          ['EcoSport','Edge','Explorer','Fiesta','Focus','Galaxy','Ka','Kuga','Mondeo','Mustang','Puma','Ranger','S-Max','Transit'],
  'Honda':         ['Accord','Civic','CR-V','FR-V','HR-V','Jazz','Legend'],
  'Hyundai':       ['Elantra','i10','i20','i30','i40','Ioniq','Ioniq 5','Ioniq 6','Kona','Santa Fe','Tucson','ix35'],
  'Jeep':          ['Cherokee','Compass','Grand Cherokee','Renegade','Wrangler'],
  'Kia':           ['Ceed','EV6','Niro','Optima','Picanto','ProCeed','Rio','Sorento','Sportage','Stinger','Stonic','XCeed'],
  'Land Rover':    ['Defender','Discovery','Discovery Sport','Freelander','Range Rover','Range Rover Evoque','Range Rover Sport','Range Rover Velar'],
  'Lexus':         ['CT','ES','GS','IS','LC','LS','NX','RX','UX'],
  'Mazda':         ['CX-3','CX-5','CX-7','CX-9','CX-30','CX-60','Mazda2','Mazda3','Mazda6','MX-5'],
  'Mercedes-Benz': ['Clasa A','Clasa B','Clasa C','Clasa CLA','Clasa CLS','Clasa E','Clasa G','Clasa GL','Clasa GLA','Clasa GLB','Clasa GLC','Clasa GLE','Clasa GLS','Clasa ML','Clasa S','Clasa SL','Clasa SLK','Clasa V','EQA','EQB','EQC','EQE','EQS','Sprinter','Vito'],
  'Mitsubishi':    ['ASX','Colt','Eclipse Cross','Galant','L200','Lancer','Outlander','Pajero','Space Star'],
  'Nissan':        ['370Z','GT-R','Juke','Leaf','Micra','Murano','Navara','Pathfinder','Pulsar','Qashqai','X-Trail'],
  'Opel':          ['Adam','Agila','Ampera','Antara','Astra','Cascada','Corsa','Crossland','Frontera','Grandland','Insignia','Meriva','Mokka','Signum','Vectra','Vivaro','Zafira'],
  'Peugeot':       ['108','2008','207','208','3008','301','308','408','5008','508','Expert','Partner','Rifter'],
  'Porsche':       ['718 Boxster','718 Cayman','911','Cayenne','Macan','Panamera','Taycan'],
  'Renault':       ['Arkana','Captur','Clio','Duster','Espace','Fluence','Kadjar','Koleos','Laguna','Logan','Megane','Modus','Sandero','Scenic','Symbol','Talisman','Twingo','Zoe'],
  'SEAT':          ['Arona','Ateca','Ibiza','Leon','Mii','Tarraco','Toledo'],
  'Škoda':         ['Citigo','Enyaq','Fabia','Kamiq','Karoq','Kodiaq','Octavia','Rapid','Scala','Superb','Yeti'],
  'Subaru':        ['BRZ','Forester','Impreza','Legacy','Outback','XV'],
  'Suzuki':        ['Alto','Baleno','Grand Vitara','Ignis','Jimny','S-Cross','Swift','SX4','Vitara'],
  'Tesla':         ['Model 3','Model S','Model X','Model Y','Cybertruck'],
  'Toyota':        ['Auris','Avensis','Aygo','C-HR','Camry','Corolla','GR Yaris','Hilux','Land Cruiser','Prius','ProAce','RAV4','Supra','Verso','Yaris','Yaris Cross'],
  'Volkswagen':    ['Amarok','Arteon','Caddy','California','Caravelle','Golf','ID.3','ID.4','ID.5','Jetta','Multivan','Passat','Phaeton','Polo','Scirocco','Sharan','T-Cross','T-Roc','Tiguan','Touareg','Touran','Transporter','Up'],
  'Volvo':         ['C30','C40','C70','S40','S60','S80','S90','V40','V50','V60','V70','V90','XC40','XC60','XC70','XC90'],
};

// Populate marca datalist
const marcaListEl = document.getElementById('marcaList');
Object.keys(carData).sort().forEach(marca => {
  const opt = document.createElement('option');
  opt.value = marca;
  marcaListEl.appendChild(opt);
});

// Populate years select (2026 → 1990)
const fAnEl = document.getElementById('fAn');
for (let y = 2026; y >= 1990; y--) {
  const opt = document.createElement('option');
  opt.value = y;
  opt.textContent = y;
  fAnEl.appendChild(opt);
}

/* ── ELEMENTS ───────────────────────────────────────────── */
const loginScreen  = document.getElementById('loginScreen');
const adminScreen  = document.getElementById('adminScreen');
const loginEmail   = document.getElementById('loginEmail');
const loginPass    = document.getElementById('loginPass');
const loginBtn     = document.getElementById('loginBtn');
const loginError   = document.getElementById('loginError');
const logoutBtn    = document.getElementById('logoutBtn');
const adminEmailEl = document.getElementById('adminEmail');

const saveBtn   = document.getElementById('saveBtn');
const cancelBtn = document.getElementById('cancelBtn');
const formTitle = document.getElementById('formTitle');
const formMsg   = document.getElementById('formMsg');
const editIdEl  = document.getElementById('editId');
const tbody     = document.getElementById('carsTableBody');

const fMarca           = document.getElementById('fMarca');
const fModel           = document.getElementById('fModel');
const fAn              = document.getElementById('fAn');
const fKm              = document.getElementById('fKm');
const fPret            = document.getElementById('fPret');
const fCombustibil     = document.getElementById('fCombustibil');
const fTransmisie      = document.getElementById('fTransmisie');
const fCaroserie       = document.getElementById('fCaroserie');
const fCuloare         = document.getElementById('fCuloare');
const fCp              = document.getElementById('fCp');
const fCilindree       = document.getElementById('fCilindree');
const fNrUsi           = document.getElementById('fNrUsi');
const fLocuri          = document.getElementById('fLocuri');
const fCuloareInterior = document.getElementById('fCuloareInterior');
const fMaterialInterior= document.getElementById('fMaterialInterior');
const fNormaPoluare    = document.getElementById('fNormaPoluare');
const fDescriere       = document.getElementById('fDescriere');
const fLaComanda       = document.getElementById('fLaComanda');

function getDotariChecked() {
  return Array.from(document.querySelectorAll('#dotariGrid input[type=checkbox]:checked'))
    .map(cb => cb.value);
}

function setDotariChecked(dotari = []) {
  document.querySelectorAll('#dotariGrid input[type=checkbox]').forEach(cb => {
    cb.checked = dotari.includes(cb.value);
  });
}
const fImaginiInput  = document.getElementById('fImagini');
const addImgBtn      = document.getElementById('addImgBtn');
const imgDropZone    = document.getElementById('imgDropZone');
const imgPreviewGrid = document.getElementById('imgPreviewGrid');

// Image state — unified ordered list for drag-to-reorder
// Each item: {type:'existing', url} or {type:'pending', file}
let imageItems = [];
let dragSrcIdx = null;

/* ── AUTH ───────────────────────────────────────────────── */
auth.onAuthStateChanged(user => {
  if (user) {
    loginScreen.style.display  = 'none';
    adminScreen.style.display  = 'block';
    adminEmailEl.textContent   = user.email;
    loadCars();
  } else {
    loginScreen.style.display  = 'flex';
    adminScreen.style.display  = 'none';
  }
});

loginBtn.addEventListener('click', async () => {
  loginError.textContent = '';
  const email = loginEmail.value.trim();
  const pass  = loginPass.value;
  if (!email || !pass) { loginError.textContent = 'Completează email și parolă.'; return; }
  loginBtn.disabled = true;
  loginBtn.textContent = 'Se autentifică...';
  try {
    await auth.signInWithEmailAndPassword(email, pass);
  } catch (e) {
    loginError.textContent = 'Email sau parolă greșită.';
    loginBtn.disabled = false;
    loginBtn.textContent = 'Intră în cont';
  }
});

loginPass.addEventListener('keydown', e => { if (e.key === 'Enter') loginBtn.click(); });

logoutBtn.addEventListener('click', () => auth.signOut());

/* ── LOAD CARS ──────────────────────────────────────────── */
let allCars = [];

function loadCars() {
  db.collection('masini').orderBy('createdAt', 'desc').onSnapshot(snapshot => {
    allCars = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    renderTable(allCars);
    updateSummary(allCars);
  });
}

function updateSummary(cars) {
  document.getElementById('sumTotal').textContent   = cars.length;
  document.getElementById('sumActive').textContent  = cars.filter(c => !c.laComanda).length;
  document.getElementById('sumComanda').textContent = cars.filter(c => c.laComanda).length;
}

function getFirstImage(car) {
  if (car.imagini && car.imagini.length) return car.imagini[0];
  return car.imagine || '';
}

function renderTable(cars) {
  if (!cars.length) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="7">Niciun anunț. Adaugă prima mașină.</td></tr>';
    return;
  }

  tbody.innerHTML = cars.map(car => {
    const img = getFirstImage(car);
    const imgCount = (car.imagini || []).length || (car.imagine ? 1 : 0);
    return `
    <tr>
      <td class="td-img">
        <img src="${img}" alt="${car.marca} ${car.model}"
          onerror="this.style.display='none'"
          style="${img ? '' : 'display:none'}" />
        ${imgCount > 1 ? `<span style="font-size:0.7rem;color:var(--muted);display:block;text-align:center">${imgCount} foto</span>` : ''}
      </td>
      <td><strong>${car.marca} ${car.model}</strong></td>
      <td>${car.an || '—'}</td>
      <td>${car.km ? Number(car.km).toLocaleString('ro-RO') + ' km' : '—'}</td>
      <td>${car.combustibil || '—'}</td>
      <td class="${car.laComanda ? 'td-comanda' : 'td-price'}">
        ${car.laComanda ? 'La Comandă' : (car.pret ? '€ ' + Number(car.pret).toLocaleString('ro-RO') : '—')}
      </td>
      <td>
        <div class="td-actions">
          <button class="btn btn-edit btn-sm" onclick="editCar('${car.id}')">Editează</button>
          <button class="btn btn-red btn-sm" onclick="deleteCar('${car.id}', '${car.marca} ${car.model}')">Șterge</button>
        </div>
      </td>
    </tr>
  `;
  }).join('');
}

/* ── SAVE CAR ───────────────────────────────────────────── */
saveBtn.addEventListener('click', async () => {
  const marca = fMarca.value.trim();
  const model = fModel.value.trim();
  if (!marca || !model) {
    showMsg('Marca și modelul sunt obligatorii.', 'error');
    return;
  }

  saveBtn.disabled = true;
  saveBtn.textContent = 'Se încarcă imaginile...';

  try {
    // Upload pending files to Firebase Storage
    const uploadedUrls = await uploadPendingFiles();
    // Build final ordered array respecting drag order
    let pendingIdx = 0;
    const allImages = imageItems.map(item =>
      item.type === 'existing' ? item.url : uploadedUrls[pendingIdx++]
    ).filter(Boolean);

    const data = {
      marca,
      model,
      an:              fAn.value          ? parseInt(fAn.value)       : null,
      km:              fKm.value          ? parseInt(fKm.value)       : null,
      pret:            fPret.value        ? parseInt(fPret.value)     : null,
      combustibil:     fCombustibil.value     || null,
      transmisie:      fTransmisie.value      || null,
      caroserie:       fCaroserie.value       || null,
      culoare:         fCuloare.value.trim()  || null,
      cp:              fCp.value          ? parseInt(fCp.value)       : null,
      cilindree:       fCilindree.value   ? parseInt(fCilindree.value): null,
      numarUsi:        fNrUsi.value           || null,
      locuri:          fLocuri.value          || null,
      culoareInterior: fCuloareInterior.value.trim() || null,
      material:        fMaterialInterior.value || null,
      normaPoluare:    fNormaPoluare.value     || null,
      dotari:          getDotariChecked(),
      descriere:       fDescriere.value.trim() || null,
      laComanda:       fLaComanda.checked,
      imagini:         allImages,
      imagine:         allImages[0] || null,
    };

    saveBtn.textContent = 'Se salvează...';
    const id = editIdEl.value;
    if (id) {
      await db.collection('masini').doc(id).update(data);
      showMsg('Anunț actualizat cu succes!', 'success');
    } else {
      data.createdAt = firebase.firestore.FieldValue.serverTimestamp();
      await db.collection('masini').add(data);
      showMsg('Anunț adăugat cu succes!', 'success');
    }
    resetForm();
  } catch (e) {
    showMsg('Eroare: ' + e.message, 'error');
  }

  saveBtn.disabled = false;
  saveBtn.textContent = 'Salvează';
});

async function uploadPendingFiles() {
  const urls = [];
  for (const item of imageItems.filter(i => i.type === 'pending')) {
    const path = `masini/${Date.now()}_${item.file.name.replace(/[^a-zA-Z0-9._-]/g, '_')}`;
    const ref  = storage.ref(path);
    await ref.put(item.file);
    const url = await ref.getDownloadURL();
    urls.push(url);
  }
  return urls;
}

/* ── EDIT CAR ───────────────────────────────────────────── */
window.editCar = function(id) {
  const car = allCars.find(c => c.id === id);
  if (!car) return;

  editIdEl.value          = id;
  fMarca.value            = car.marca           || '';
  updateModelList(car.marca || '');
  fModel.value            = car.model           || '';
  fAn.value               = car.an              || '';
  fKm.value               = car.km              || '';
  fPret.value             = car.pret            || '';
  fCombustibil.value      = car.combustibil     || '';
  fTransmisie.value       = car.transmisie      || '';
  fCaroserie.value        = car.caroserie       || '';
  fCuloare.value          = car.culoare         || '';
  fCp.value               = car.cp             || '';
  fCilindree.value        = car.cilindree       || '';
  fNrUsi.value            = car.numarUsi        || '';
  fLocuri.value           = car.locuri          || '';
  fCuloareInterior.value  = car.culoareInterior || '';
  fMaterialInterior.value = car.material        || '';
  fNormaPoluare.value     = car.normaPoluare    || '';
  setDotariChecked(car.dotari || []);
  fDescriere.value        = car.descriere       || '';
  fLaComanda.checked      = car.laComanda       || false;

  // Load existing images
  const urls = car.imagini && car.imagini.length
    ? [...car.imagini]
    : (car.imagine ? [car.imagine] : []);
  imageItems = urls.map(url => ({ type: 'existing', url }));
  renderImgGrid();

  formTitle.textContent = `Editează: ${car.marca} ${car.model}`;
  cancelBtn.style.display = '';
  formMsg.textContent = '';

  window.scrollTo({ top: 0, behavior: 'smooth' });
  fMarca.focus();
};

/* ── DELETE CAR ─────────────────────────────────────────── */
window.deleteCar = async function(id, name) {
  if (!confirm(`Ești sigur că vrei să ștergi "${name}"?`)) return;
  try {
    await db.collection('masini').doc(id).delete();
  } catch (e) {
    alert('Eroare la ștergere: ' + e.message);
  }
};

/* ── CANCEL EDIT ─────────────────────────────────────────── */
cancelBtn.addEventListener('click', resetForm);

function resetForm() {
  editIdEl.value          = '';
  fMarca.value            = '';
  fModel.value            = '';
  fAn.value               = '';
  fKm.value               = '';
  fPret.value             = '';
  fCombustibil.value      = '';
  fTransmisie.value       = '';
  fCaroserie.value        = '';
  fCuloare.value          = '';
  fCp.value               = '';
  fCilindree.value        = '';
  fNrUsi.value            = '';
  fLocuri.value           = '';
  fCuloareInterior.value  = '';
  fMaterialInterior.value = '';
  fNormaPoluare.value     = '';
  setDotariChecked([]);
  fDescriere.value        = '';
  fLaComanda.checked      = false;
  imageItems          = [];
  fImaginiInput.value = '';
  renderImgGrid();
  formTitle.textContent   = 'Adaugă Mașină Nouă';
  cancelBtn.style.display = 'none';
  formMsg.textContent     = '';
}

/* ── MODEL AUTOCOMPLETE ─────────────────────────────────── */
const modelListEl = document.getElementById('modelList');

function updateModelList(marca) {
  modelListEl.innerHTML = '';
  const models = carData[marca] || [];
  models.forEach(model => {
    const opt = document.createElement('option');
    opt.value = model;
    modelListEl.appendChild(opt);
  });
}

fMarca.addEventListener('input', () => updateModelList(fMarca.value.trim()));
fMarca.addEventListener('change', () => updateModelList(fMarca.value.trim()));

/* ── IMAGE UPLOAD ───────────────────────────────────────── */
addImgBtn.addEventListener('click', () => fImaginiInput.click());
imgDropZone.addEventListener('click', e => { if (e.target === imgDropZone) fImaginiInput.click(); });

fImaginiInput.addEventListener('change', () => {
  Array.from(fImaginiInput.files).forEach(file => imageItems.push({ type: 'pending', file }));
  fImaginiInput.value = '';
  renderImgGrid();
});

// Drag & drop files onto zone
imgDropZone.addEventListener('dragover', e => { e.preventDefault(); imgDropZone.classList.add('drag-over'); });
imgDropZone.addEventListener('dragleave', () => imgDropZone.classList.remove('drag-over'));
imgDropZone.addEventListener('drop', e => {
  e.preventDefault();
  imgDropZone.classList.remove('drag-over');
  Array.from(e.dataTransfer.files)
    .filter(f => f.type.startsWith('image/'))
    .forEach(f => imageItems.push({ type: 'pending', file: f }));
  renderImgGrid();
});

function renderImgGrid() {
  imgPreviewGrid.innerHTML = '';

  imageItems.forEach((item, idx) => {
    const thumb = document.createElement('div');
    thumb.className = 'img-thumb';
    thumb.draggable = true;
    if (idx === 0) thumb.classList.add('img-thumb-first');

    const src = item.type === 'existing' ? item.url : URL.createObjectURL(item.file);
    thumb.innerHTML = `
      ${idx === 0 ? '<span class="img-thumb-label">Coperta</span>' : ''}
      <img src="${src}" alt="Imagine ${idx + 1}" />
      <button class="remove-img" title="Șterge" type="button">&times;</button>
    `;
    thumb.querySelector('.remove-img').addEventListener('click', () => {
      imageItems.splice(idx, 1);
      renderImgGrid();
    });

    // Drag-to-reorder events
    thumb.addEventListener('dragstart', () => { dragSrcIdx = idx; thumb.classList.add('dragging'); });
    thumb.addEventListener('dragend',   () => { dragSrcIdx = null; thumb.classList.remove('dragging'); renderImgGrid(); });
    thumb.addEventListener('dragover',  e => { e.preventDefault(); thumb.classList.add('drag-over-thumb'); });
    thumb.addEventListener('dragleave', () => thumb.classList.remove('drag-over-thumb'));
    thumb.addEventListener('drop', e => {
      e.preventDefault();
      e.stopPropagation();
      thumb.classList.remove('drag-over-thumb');
      if (dragSrcIdx === null || dragSrcIdx === idx) return;
      const moved = imageItems.splice(dragSrcIdx, 1)[0];
      imageItems.splice(idx, 0, moved);
      dragSrcIdx = null;
      renderImgGrid();
    });

    imgPreviewGrid.appendChild(thumb);
  });
}

/* ── HELPERS ────────────────────────────────────────────── */
function showMsg(text, type) {
  formMsg.textContent = text;
  formMsg.style.color = type === 'error' ? 'var(--red)' : 'var(--green)';
  setTimeout(() => { formMsg.textContent = ''; }, 4000);
}

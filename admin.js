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
const db   = firebase.firestore();
const auth = firebase.auth();

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

const fMarca       = document.getElementById('fMarca');
const fModel       = document.getElementById('fModel');
const fAn          = document.getElementById('fAn');
const fKm          = document.getElementById('fKm');
const fPret        = document.getElementById('fPret');
const fCombustibil = document.getElementById('fCombustibil');
const fTransmisie  = document.getElementById('fTransmisie');
const fCaroserie   = document.getElementById('fCaroserie');
const fCuloare     = document.getElementById('fCuloare');
const fImagine     = document.getElementById('fImagine');
const fDescriere   = document.getElementById('fDescriere');
const fLaComanda   = document.getElementById('fLaComanda');
const imgPreview   = document.getElementById('imgPreview');

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

function renderTable(cars) {
  if (!cars.length) {
    tbody.innerHTML = '<tr class="empty-row"><td colspan="7">Niciun anunț. Adaugă prima mașină.</td></tr>';
    return;
  }

  tbody.innerHTML = cars.map(car => `
    <tr>
      <td class="td-img">
        <img src="${car.imagine || ''}" alt="${car.marca} ${car.model}"
          onerror="this.style.display='none'"
          style="${car.imagine ? '' : 'display:none'}" />
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
  `).join('');
}

/* ── SAVE CAR ───────────────────────────────────────────── */
saveBtn.addEventListener('click', async () => {
  const marca = fMarca.value.trim();
  const model = fModel.value.trim();
  if (!marca || !model) {
    showMsg('Marca și modelul sunt obligatorii.', 'error');
    return;
  }

  const data = {
    marca,
    model,
    an:          fAn.value          ? parseInt(fAn.value)    : null,
    km:          fKm.value          ? parseInt(fKm.value)    : null,
    pret:        fPret.value        ? parseInt(fPret.value)  : null,
    combustibil: fCombustibil.value || null,
    transmisie:  fTransmisie.value  || null,
    caroserie:   fCaroserie.value   || null,
    culoare:     fCuloare.value.trim()    || null,
    imagine:     fImagine.value.trim()    || null,
    descriere:   fDescriere.value.trim()  || null,
    laComanda:   fLaComanda.checked,
  };

  saveBtn.disabled = true;
  saveBtn.textContent = 'Se salvează...';

  try {
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

/* ── EDIT CAR ───────────────────────────────────────────── */
window.editCar = function(id) {
  const car = allCars.find(c => c.id === id);
  if (!car) return;

  editIdEl.value      = id;
  fMarca.value        = car.marca        || '';
  updateModelList(car.marca || '');
  fModel.value        = car.model        || '';
  fAn.value           = car.an           || '';
  fKm.value           = car.km           || '';
  fPret.value         = car.pret         || '';
  fCombustibil.value  = car.combustibil  || '';
  fTransmisie.value   = car.transmisie   || '';
  fCaroserie.value    = car.caroserie    || '';
  fCuloare.value      = car.culoare      || '';
  fImagine.value      = car.imagine      || '';
  fDescriere.value    = car.descriere    || '';
  fLaComanda.checked  = car.laComanda    || false;

  updateImgPreview(car.imagine);

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
  editIdEl.value      = '';
  fMarca.value        = '';
  fModel.value        = '';
  fAn.value           = '';
  fKm.value           = '';
  fPret.value         = '';
  fCombustibil.value  = '';
  fTransmisie.value   = '';
  fCaroserie.value    = '';
  fCuloare.value      = '';
  fImagine.value      = '';
  fDescriere.value    = '';
  fLaComanda.checked  = false;
  imgPreview.style.display = 'none';
  imgPreview.src      = '';
  formTitle.textContent = 'Adaugă Mașină Nouă';
  cancelBtn.style.display = 'none';
  formMsg.textContent = '';
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

/* ── IMAGE PREVIEW ──────────────────────────────────────── */
fImagine.addEventListener('input', () => updateImgPreview(fImagine.value.trim()));

function updateImgPreview(url) {
  if (url) {
    imgPreview.src = url;
    imgPreview.style.display = 'block';
    imgPreview.onerror = () => { imgPreview.style.display = 'none'; };
  } else {
    imgPreview.style.display = 'none';
    imgPreview.src = '';
  }
}

/* ── HELPERS ────────────────────────────────────────────── */
function showMsg(text, type) {
  formMsg.textContent = text;
  formMsg.style.color = type === 'error' ? 'var(--red)' : 'var(--green)';
  setTimeout(() => { formMsg.textContent = ''; }, 4000);
}

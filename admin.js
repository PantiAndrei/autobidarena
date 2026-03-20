/* ============================================================
   AUTOBID ARENA — ADMIN SCRIPT
   ============================================================ */

/* ── FIREBASE CONFIG ────────────────────────────────────── */
// TODO: Replace with your Firebase project config
// Get it from: Firebase Console → Project Settings → Your apps → Config
const firebaseConfig = {
  apiKey:            "YOUR_API_KEY",
  authDomain:        "YOUR_PROJECT_ID.firebaseapp.com",
  projectId:         "YOUR_PROJECT_ID",
  storageBucket:     "YOUR_PROJECT_ID.appspot.com",
  messagingSenderId: "YOUR_SENDER_ID",
  appId:             "YOUR_APP_ID"
};

firebase.initializeApp(firebaseConfig);
const db   = firebase.firestore();
const auth = firebase.auth();

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

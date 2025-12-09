// js/app.js
const auth = firebase.auth();
const db = firebase.firestore();

const unauthEl = document.getElementById('unauth');
const mainApp = document.getElementById('main-app');
const authArea = document.getElementById('auth-area');

const btnGoogle = document.getElementById('btn-google');
const btnEmail = document.getElementById('btn-email');

const datePicker = document.getElementById('date-picker');
const remainingEl = document.getElementById('remaining');
const totalLoggedEl = document.getElementById('total-logged');
const btnAnalyse = document.getElementById('btn-analyse');

const btnNewActivity = document.getElementById('btn-new-activity');
const form = document.getElementById('activity-form');
const titleInput = document.getElementById('activity-title');
const catInput = document.getElementById('activity-category');
const durationInput = document.getElementById('activity-duration');
const btnSave = document.getElementById('btn-save-activity');
const btnCancel = document.getElementById('btn-cancel-activity');
const activitiesList = document.getElementById('activities-list');
const activityMsg = document.getElementById('activity-msg');

const btnAddSample = document.getElementById('btn-add-sample');

let currentUser = null;
let currentDate = null;
let activities = []; // local cache

function renderAuthArea(user) {
  authArea.innerHTML = '';
  if (!user) {
    const loginLink = document.createElement('a');
    loginLink.href = '#';
    loginLink.className = 'px-3 py-2 rounded border';
    loginLink.textContent = 'Login';
    authArea.appendChild(loginLink);
  } else {
    const signout = document.createElement('button');
    signout.className = 'px-3 py-2 rounded border';
    signout.textContent = 'Sign out';
    signout.onclick = ()=> auth.signOut();
    authArea.appendChild(signout);
  }
}

auth.onAuthStateChanged(user => {
  currentUser = user;
  renderAuthArea(user);
  if (!user) {
    unauthEl.classList.remove('hidden');
    mainApp.classList.add('hidden');
  } else {
    unauthEl.classList.add('hidden');
    mainApp.classList.remove('hidden');
    // default date
    datePicker.value = new Date().toISOString().slice(0,10);
    loadForDate(datePicker.value);
  }
});

btnGoogle.addEventListener('click', async () => {
  const provider = new firebase.auth.GoogleAuthProvider();
  try {
    await auth.signInWithPopup(provider);
  } catch (e) { alert(e.message); }
});

btnEmail.addEventListener('click', async () => {
  const email = prompt('Enter email');
  const pw = prompt('Enter password (min 6 chars)');
  if (!email || !pw) return;
  try {
    await auth.createUserWithEmailAndPassword(email,pw);
  } catch (e) {
    if (e.code === 'auth/email-already-in-use') {
      // try sign in
      try { await auth.signInWithEmailAndPassword(email,pw); } catch (err) { alert(err.message); }
    } else alert(e.message);
  }
});

datePicker.addEventListener('change', ()=> {
  if (!datePicker.value) return;
  loadForDate(datePicker.value);
});

async function loadForDate(dateStr) {
  currentDate = dateStr;
  activitiesList.innerHTML = '';
  activities = [];

  remainingEl.textContent = '...';
  totalLoggedEl.textContent = '...';
  btnAnalyse.disabled = true;

  if (!currentUser) return;

  const col = db.collection('users').doc(currentUser.uid).collection('days').doc(dateStr).collection('activities');
  const snap = await col.get();
  if (snap.empty) {
    activitiesList.innerHTML = `<div class="text-slate-500 p-4 rounded border">No activities for ${dateStr}. Start adding!</div>`;
    updateTotals();
    return;
  }
  snap.forEach(doc => {
    const data = doc.data();
    activities.push({ id: doc.id, ...data });
  });
  renderActivities();
  updateTotals();
}

function renderActivities() {
  activitiesList.innerHTML = '';
  activities.forEach(a => {
    const el = document.createElement('div');
    el.className = 'p-3 rounded-md border flex justify-between items-center';
    el.innerHTML = `<div>
                      <div class="font-medium">${escapeHtml(a.title)}</div>
                      <div class="text-sm text-slate-500">${escapeHtml(a.category || '—')}</div>
                    </div>
                    <div class="flex items-center gap-2">
                      <div class="text-sm text-slate-600">${a.duration}m</div>
                      <button class="px-2 py-1 text-sm border edit-btn">Edit</button>
                      <button class="px-2 py-1 text-sm border del-btn">Delete</button>
                    </div>`;
    const editBtn = el.querySelector('.edit-btn');
    const delBtn = el.querySelector('.del-btn');
    editBtn.onclick = ()=> openEdit(a);
    delBtn.onclick = ()=> deleteActivity(a.id);
    activitiesList.appendChild(el);
  });
}

function escapeHtml(text) {
  if (!text) return '';
  return text.replace(/[&<>"']/g, (m)=> ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
}

btnNewActivity.addEventListener('click', ()=> {
  form.classList.remove('hidden');
});

btnCancel.addEventListener('click', ()=> {
  form.classList.add('hidden');
  clearForm();
});

btnSave.addEventListener('click', async (e)=> {
  e.preventDefault();
  activityMsg.textContent = '';
  const title = titleInput.value.trim();
  const category = catInput.value.trim();
  const duration = parseInt(durationInput.value,10);
  if (!title || !duration || duration <= 0) {
    activityMsg.textContent = 'Please enter valid title and duration.';
    return;
  }

  // validate remaining
  const total = activities.reduce((s, a)=> s + (a.duration||0), 0);
  if (total + duration > 1440) {
    activityMsg.textContent = `Exceeds daily limit: you have ${1440 - total} minutes left.`;
    return;
  }

  const dayDoc = db.collection('users').doc(currentUser.uid).collection('days').doc(currentDate);
  const col = dayDoc.collection('activities');

  // create
  const data = { title, category, duration, createdAt: firebase.firestore.FieldValue.serverTimestamp() };
  try {
    const docRef = await col.add(data);
    activities.push({ id: docRef.id, ...data, createdAt: { seconds: Date.now()/1000 }});
    renderActivities();
    updateTotals();
    clearForm();
    form.classList.add('hidden');
  } catch (err) { activityMsg.textContent = err.message; }
});

function clearForm() {
  titleInput.value = '';
  catInput.value = '';
  durationInput.value = '';
  activityMsg.textContent = '';
}

function openEdit(a) {
  form.classList.remove('hidden');
  titleInput.value = a.title;
  catInput.value = a.category || '';
  durationInput.value = a.duration;
  // override save to perform update (temporary)
  btnSave.onclick = async (e)=> {
    e.preventDefault();
    const newTitle = titleInput.value.trim();
    const newCat = catInput.value.trim();
    const newDur = parseInt(durationInput.value,10);
    if (!newTitle || !newDur || newDur <= 0) { activityMsg.textContent = 'Invalid input'; return; }

    const totalOther = activities.filter(x=> x.id !== a.id).reduce((s,x)=> s + x.duration, 0);
    if (totalOther + newDur > 1440) {
      activityMsg.textContent = `Exceeds daily limit: you have ${1440 - totalOther} minutes left.`;
      return;
    }

    const docRef = db.collection('users').doc(currentUser.uid).collection('days').doc(currentDate).collection('activities').doc(a.id);
    await docRef.update({ title: newTitle, category: newCat, duration: newDur });
    // update local cache
    const idx = activities.findIndex(x=> x.id===a.id);
    activities[idx] = { ...activities[idx], title: newTitle, category: newCat, duration: newDur };
    renderActivities();
    updateTotals();
    clearForm();
    form.classList.add('hidden');
    
    btnSave.onclick = defaultSaveHandler;
  };
}

const defaultSaveHandler = async (e) => {};

async function deleteActivity(id) {
  if (!confirm('Delete this activity?')) return;
  await db.collection('users').doc(currentUser.uid).collection('days').doc(currentDate).collection('activities').doc(id).delete();
  activities = activities.filter(a=> a.id !== id);
  renderActivities();
  updateTotals();
}

function updateTotals() {
  const total = activities.reduce((s,a)=> s + (a.duration||0), 0);
  const remaining = Math.max(0, 1440 - total);
  remainingEl.textContent = remaining;
  totalLoggedEl.textContent = total;
  btnAnalyse.disabled = total < 1; // allow analyse if there's >0 minutes; per spec you can enable only when 1440 reached, adjust below.

  // enable Analyse only when total === 1440 (or up to — we'll enable if >= 1440)
  btnAnalyse.disabled = !(total >= 1440);
}

btnAnalyse.addEventListener('click', ()=> {
  // navigate to dashboard for that date
  const url = `dashboard.html?date=${encodeURIComponent(currentDate)}`;
  location.href = url;
});

btnAddSample.addEventListener('click', async ()=> {
  if (!confirm('Fill this date with sample activities (will create multiple activities totaling 1440 minutes)?')) return;
  const col = db.collection('users').doc(currentUser.uid).collection('days').doc(datePicker.value).collection('activities');
  // sample list
  const sample = [
    { title: 'Sleep', category: 'Sleep', duration: 480 },
    { title: 'Work', category: 'Work', duration: 540 },
    { title: 'Commute', category: 'Transport', duration: 60 },
    { title: 'Meals', category: 'Personal', duration: 120 },
    { title: 'Exercise', category: 'Health', duration: 60 },
    { title: 'Leisure', category: 'Entertainment', duration: 80 },
    { title: 'Misc', category: 'Other', duration: 100 }
  ];
  // total check
  const total = sample.reduce((s,a)=> s + a.duration, 0);
  if (total !== 1440) {

    sample[sample.length-1].duration += (1440 - total);
  }

  for (const s of sample) {
    await col.add({ ...s, createdAt: firebase.firestore.FieldValue.serverTimestamp() });
  }
  await loadForDate(datePicker.value);
});

(function initFromQuery(){
  const params = new URLSearchParams(location.search);
  const qd = params.get('date');
  if (qd && document.getElementById('date-picker')) {
    datePicker.value = qd;
  }
})();

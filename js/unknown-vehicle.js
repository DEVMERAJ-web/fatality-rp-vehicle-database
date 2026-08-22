/* Fatality RP 2.0 - Unidentified Vehicle Center
   Static-site safe workflow: submissions are stored locally on the user's device.
   No existing catalogue logic is modified. */
(() => {
  'use strict';

  const SUBMISSIONS_KEY = 'fatality_unknown_vehicle_submissions_v1';
  const panel = document.getElementById('unknown-vehicles-panel');
  const listEl = document.getElementById('unknown-vehicle-list');
  const countEl = document.getElementById('unknown-count');
  const emptyEl = document.getElementById('unknown-empty');
  if (!panel || !listEl) return;

  let vehicles = [];
  let submissions = loadSubmissions();
  let selectedCode = '';
  let screenshotData = '';

  function esc(v) {
    return String(v ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  }

  function loadSubmissions() {
    try {
      const parsed = JSON.parse(localStorage.getItem(SUBMISSIONS_KEY) || '{}');
      return parsed && typeof parsed === 'object' ? parsed : {};
    } catch (_) {
      return {};
    }
  }

  function saveSubmissions() {
    try {
      localStorage.setItem(SUBMISSIONS_KEY, JSON.stringify(submissions));
    } catch (_) {
      toast('Screenshot may be too large for browser storage. Try a smaller image.');
    }
  }

  function getUnknownVehicles(data) {
    return data.filter(v => {
      const status = String(v.status || '').toLowerCase();
      const name = String(v.name || '').toLowerCase();
      const brand = String(v.brand || '').toLowerCase();
      return status === 'unknown' || status === 'unverified' || name.includes('identification pending') || brand === 'custom';
    });
  }

  function render() {
    const unknown = getUnknownVehicles(vehicles);
    countEl.textContent = unknown.length;
    emptyEl.hidden = unknown.length !== 0;

    listEl.innerHTML = unknown.map(v => {
      const submitted = submissions[v.code];
      const label = submitted ? 'Submitted locally' : 'Needs identification';
      return `<article class="unknown-item">
        <div class="unknown-item-code">${esc(v.code)}</div>
        <div class="unknown-item-title">❓ ${esc(v.name || 'Identification pending')}</div>
        <div class="unknown-item-meta">${esc(v.vehicleType || 'Vehicle')} · ${esc(v.department || 'CIVILIAN')} · ${esc(label)}</div>
        <div class="unknown-item-actions">
          <button class="unknown-btn copy-unknown" data-code="${esc(v.code)}">Copy Code</button>
          <button class="unknown-btn primary identify-unknown" data-code="${esc(v.code)}">Identify</button>
        </div>
      </article>`;
    }).join('');
  }

  function copy(text) {
    const done = () => toast(`Copied: ${text}`);
    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(text).then(done).catch(() => fallbackCopy(text, done));
    } else fallbackCopy(text, done);
  }

  function fallbackCopy(text, done) {
    const area = document.createElement('textarea');
    area.value = text;
    area.style.position = 'fixed';
    area.style.opacity = '0';
    document.body.appendChild(area);
    area.select();
    try { document.execCommand('copy'); done(); } catch (_) { toast('Copy failed. Copy the code manually.'); }
    area.remove();
  }

  function toast(message) {
    let el = document.getElementById('unknown-toast');
    if (!el) {
      el = document.createElement('div');
      el.id = 'unknown-toast';
      el.className = 'unknown-toast';
      document.body.appendChild(el);
    }
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(el._timer);
    el._timer = setTimeout(() => el.classList.remove('show'), 2200);
  }

  function openForm(code) {
    selectedCode = code;
    screenshotData = submissions[code]?.screenshot || '';
    const existing = submissions[code] || {};
    const v = vehicles.find(x => x.code === code) || {};

    const modal = document.createElement('div');
    modal.className = 'unknown-modal open';
    modal.id = 'unknown-identify-modal';
    modal.innerHTML = `<div class="unknown-form" role="dialog" aria-modal="true" aria-labelledby="unknown-form-title">
      <div class="unknown-form-head">
        <div><h3 id="unknown-form-title">🔎 Identify Vehicle</h3><p>Spawn the code in Fatality RP 2.0 first, then enter what you see in-game.</p></div>
        <button class="unknown-close" type="button" aria-label="Close">&times;</button>
      </div>

      <div class="unknown-code-box">Spawn Code: <strong>${esc(code)}</strong></div>

      <form id="unknown-identify-form">
        <div class="unknown-form-grid">
          <div class="unknown-field"><label for="uv-name">Vehicle Name *</label><input id="uv-name" required placeholder="e.g. BMW M5 F90" value="${esc(existing.name || '')}"></div>
          <div class="unknown-field"><label for="uv-brand">Brand *</label><input id="uv-brand" required placeholder="e.g. BMW" value="${esc(existing.brand || '')}"></div>
          <div class="unknown-field"><label for="uv-model">Model / Trim</label><input id="uv-model" placeholder="e.g. M5 Competition" value="${esc(existing.model || '')}"></div>
          <div class="unknown-field"><label for="uv-year">Model Year</label><input id="uv-year" placeholder="e.g. 2019" value="${esc(existing.year || '')}"></div>
          <div class="unknown-field"><label for="uv-type">Vehicle Type</label><select id="uv-type"><option>Car</option><option>Motorcycle</option><option>Boat</option><option>Helicopter</option><option>Plane</option><option>Utility</option></select></div>
          <div class="unknown-field"><label for="uv-category">Category</label><input id="uv-category" placeholder="Sedan / SUV / Supercar..." value="${esc(existing.category || '')}"></div>
          <div class="unknown-field"><label for="uv-dept">Department</label><select id="uv-dept"><option>CIVILIAN</option><option>EMS</option><option>POLICE</option><option>GOVERNMENT</option><option>ADMIN</option><option>SPECIAL</option></select></div>
          <div class="unknown-field"><label for="uv-access">Access</label><select id="uv-access"><option>CIVILIAN</option><option>EMS</option><option>POLICE</option><option>GOVERNMENT</option><option>ADMIN</option></select></div>
          <div class="unknown-field"><label for="uv-subtype">Subtype</label><input id="uv-subtype" placeholder="e.g. Sports Sedan" value="${esc(existing.subtype || '')}"></div>
          <div class="unknown-field"><label for="uv-speed">Max Speed (km/h) *</label><input id="uv-speed" type="number" min="0" step="0.1" required placeholder="e.g. 310" value="${esc(existing.maxSpeed || '')}"></div>
          <div class="unknown-field full"><label for="uv-notes">Extra Information</label><textarea id="uv-notes" placeholder="Color, body kit, livery, unusual details, where you found it, etc.">${esc(existing.notes || '')}</textarea></div>
          <div class="unknown-field full">
            <label>Vehicle Screenshot *</label>
            <label class="drop-zone" id="uv-drop-zone" for="uv-screenshot"><strong>📸 Drag & Drop Screenshot Here</strong><span>or click to choose an image (JPG, PNG, WEBP)</span><input id="uv-screenshot" type="file" accept="image/*"></label>
            <img id="uv-preview" class="screenshot-preview${screenshotData ? ' show' : ''}" src="${screenshotData || ''}" alt="Vehicle screenshot preview">
          </div>
        </div>
        <div class="unknown-form-actions">
          <button type="button" class="unknown-btn" id="uv-cancel">Cancel</button>
          <button type="submit" class="unknown-btn primary">Submit Identification</button>
        </div>
      </form>
    </div>`;

    document.body.appendChild(modal);

    const typeEl = modal.querySelector('#uv-type');
    const deptEl = modal.querySelector('#uv-dept');
    const accessEl = modal.querySelector('#uv-access');
    typeEl.value = existing.vehicleType || v.vehicleType || 'Car';
    deptEl.value = existing.department || v.department || 'CIVILIAN';
    accessEl.value = existing.access || v.access || 'CIVILIAN';

    const fileInput = modal.querySelector('#uv-screenshot');
    const dropZone = modal.querySelector('#uv-drop-zone');
    const preview = modal.querySelector('#uv-preview');

    const processFile = file => {
      if (!file || !file.type.startsWith('image/')) return toast('Please choose an image file.');
      if (file.size > 4 * 1024 * 1024) return toast('Please use an image smaller than 4 MB.');
      const reader = new FileReader();
      reader.onload = e => { screenshotData = e.target.result; preview.src = screenshotData; preview.classList.add('show'); };
      reader.readAsDataURL(file);
    };

    fileInput.addEventListener('change', e => processFile(e.target.files[0]));
    ['dragenter','dragover'].forEach(event => dropZone.addEventListener(event, e => { e.preventDefault(); dropZone.classList.add('dragover'); }));
    ['dragleave','drop'].forEach(event => dropZone.addEventListener(event, e => { e.preventDefault(); dropZone.classList.remove('dragover'); }));
    dropZone.addEventListener('drop', e => processFile(e.dataTransfer.files[0]));

    const close = () => modal.remove();
    modal.querySelector('.unknown-close').addEventListener('click', close);
    modal.querySelector('#uv-cancel').addEventListener('click', close);
    modal.addEventListener('click', e => { if (e.target === modal) close(); });
    document.addEventListener('keydown', function escHandler(e) { if (e.key === 'Escape' && document.getElementById('unknown-identify-modal')) { close(); document.removeEventListener('keydown', escHandler); } });

    modal.querySelector('#unknown-identify-form').addEventListener('submit', e => {
      e.preventDefault();
      if (!screenshotData) return toast('Please add a vehicle screenshot before submitting.');

      submissions[selectedCode] = {
        code: selectedCode,
        name: modal.querySelector('#uv-name').value.trim(),
        brand: modal.querySelector('#uv-brand').value.trim(),
        model: modal.querySelector('#uv-model').value.trim(),
        year: modal.querySelector('#uv-year').value.trim(),
        vehicleType: typeEl.value,
        category: modal.querySelector('#uv-category').value.trim(),
        subtype: modal.querySelector('#uv-subtype').value.trim(),
        department: deptEl.value,
        access: accessEl.value,
        maxSpeed: modal.querySelector('#uv-speed').value,
        notes: modal.querySelector('#uv-notes').value.trim(),
        screenshot: screenshotData,
        status: 'pending_review',
        submittedAt: new Date().toISOString()
      };
      saveSubmissions();
      close();
      render();
      toast('Identification saved as Pending Review.');
    });
  }

  listEl.addEventListener('click', e => {
    const copyBtn = e.target.closest('.copy-unknown');
    const identifyBtn = e.target.closest('.identify-unknown');
    if (copyBtn) copy(copyBtn.dataset.code);
    if (identifyBtn) openForm(identifyBtn.dataset.code);
  });

  fetch('./data/vehicles.json', { cache: 'no-store' })
    .then(r => { if (!r.ok) throw new Error('Vehicle data could not be loaded'); return r.json(); })
    .then(data => { vehicles = Array.isArray(data) ? data : []; render(); })
    .catch(() => { listEl.innerHTML = '<div class="unknown-empty">Unable to load unidentified vehicle list.</div>'; });
})();

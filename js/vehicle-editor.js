(() => {
  const OVERRIDE_KEY = 'fatality_vehicle_overrides_v1';
  const getOverrides = () => {
    try { const x = JSON.parse(localStorage.getItem(OVERRIDE_KEY) || '{}'); return x && typeof x === 'object' ? x : {}; }
    catch { return {}; }
  };
  const saveOverrides = o => localStorage.setItem(OVERRIDE_KEY, JSON.stringify(o));

  // Patch fetch BEFORE app.js loads so edits participate in search/filter/rendering.
  const nativeFetch = window.fetch.bind(window);
  window.fetch = async (input, init) => {
    const response = await nativeFetch(input, init);
    const url = typeof input === 'string' ? input : input?.url || '';
    if (!/vehicles\.json(?:\?|$)/.test(url) && !/vehicle-speeds\.json(?:\?|$)/.test(url)) return response;
    const cloned = response.clone();
    try {
      const data = await cloned.json();
      const overrides = getOverrides();
      if (/vehicles\.json/.test(url) && Array.isArray(data)) {
        const merged = data.map(v => ({ ...v, ...(overrides[v.code] || {}) }));
        return new Response(JSON.stringify(merged), { status: response.status, statusText: response.statusText, headers: {'Content-Type':'application/json'} });
      }
      if (/vehicle-speeds\.json/.test(url) && data && typeof data === 'object') {
        const merged = { ...data };
        Object.entries(overrides).forEach(([code, patch]) => {
          if (patch && Object.prototype.hasOwnProperty.call(patch, 'maxSpeed')) {
            const n = Number(patch.maxSpeed);
            merged[code] = { ...(merged[code] || {}), kmh: Number.isFinite(n) && n >= 0 ? n : null, source: 'Local edit', verified: false };
          }
        });
        return new Response(JSON.stringify(merged), { status: response.status, statusText: response.statusText, headers: {'Content-Type':'application/json'} });
      }
    } catch { /* original response */ }
    return response;
  };

  const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[m]));

  function installButton(card) {
    if (card.querySelector('.vehicle-edit-btn')) return;
    const code = card.querySelector('.spawn-code-text')?.textContent?.trim();
    if (!code) return;
    const actions = card.querySelector('.card-actions');
    if (!actions) return;
    const btn = document.createElement('button');
    btn.className = 'btn-outline vehicle-edit-btn';
    btn.dataset.code = code;
    btn.textContent = '✏ Edit Vehicle';
    actions.appendChild(btn);
  }

  function renderEditor(code) {
    const baseList = window.__fatalityVehicles || [];
    const source = baseList.find(v => v.code === code) || {};
    const o = getOverrides()[code] || {};
    const v = { ...source, ...o };
    let modal = document.getElementById('vehicle-editor-modal');
    if (!modal) { modal = document.createElement('div'); modal.id = 'vehicle-editor-modal'; modal.className = 'vehicle-editor-modal'; document.body.appendChild(modal); }
    modal.innerHTML = `<div class="vehicle-editor-card" role="dialog" aria-modal="true">
      <button class="vehicle-editor-close" aria-label="Close">×</button>
      <div class="vehicle-editor-kicker">✏ VEHICLE EDITOR</div>
      <h2>${esc(v.name || 'Vehicle')}</h2>
      <p class="vehicle-editor-code">Spawn Code: <strong>${esc(code)}</strong></p>
      <div class="vehicle-editor-grid">
        <label>Name<input id="ve-name" value="${esc(v.name)}"></label>
        <label>Brand<input id="ve-brand" value="${esc(v.brand)}"></label>
        <label>Year<input id="ve-year" value="${esc(v.year)}"></label>
        <label>Max Speed (km/h)<input id="ve-speed" type="number" min="0" step="1" value="${v.maxSpeed ?? ''}"></label>
        <label>Vehicle Type<select id="ve-type"><option>Car</option><option>Motorcycle</option><option>Boat</option><option>Helicopter</option><option>Plane</option><option>Utility</option></select></label>
        <label>Department<input id="ve-dept" value="${esc(v.department)}"></label>
        <label>Access<input id="ve-access" value="${esc(v.access)}"></label>
        <label>Category<input id="ve-category" value="${esc(v.category || '')}"></label>
        <label class="full">Subtype<input id="ve-subtype" value="${esc(v.subtype || '')}"></label>
        <label class="full">Image URL<input id="ve-image" placeholder="https://..." value="${esc(v.image || '')}"></label>
        <label class="full image-upload-label">Or upload image<input id="ve-file" type="file" accept="image/*"><small>The selected image is resized and saved locally to this browser.</small></label>
      </div>
      <div id="ve-preview" class="vehicle-editor-preview">${v.image ? `<img src="${esc(v.image)}" alt="Preview">` : '<span>No image</span>'}</div>
      <div class="vehicle-editor-actions"><button id="ve-save" class="btn-primary">💾 Save Edit</button><button id="ve-reset" class="btn-outline">Reset This Edit</button><button id="ve-cancel" class="btn-secondary">Cancel</button></div>
      <p class="vehicle-editor-note">Edits are stored in this browser and immediately affect search, filters, images and speed. Export your edits to make the master database permanent later.</p>
    </div>`;
    modal.classList.add('open');
    const type = document.getElementById('ve-type'); if (type) type.value = v.vehicleType || 'Car';
    const file = document.getElementById('ve-file');
    file?.addEventListener('change', () => resizeImage(file.files?.[0]).then(data => { if (data) { document.getElementById('ve-image').value = data; setPreview(data); } }));
    document.getElementById('ve-image')?.addEventListener('input', e => setPreview(e.target.value));
    document.getElementById('ve-cancel').onclick = () => modal.remove();
    document.querySelector('.vehicle-editor-close').onclick = () => modal.remove();
    document.getElementById('ve-reset').onclick = () => { const all = getOverrides(); delete all[code]; saveOverrides(all); modal.remove(); location.reload(); };
    document.getElementById('ve-save').onclick = () => {
      const all = getOverrides();
      all[code] = {
        name: document.getElementById('ve-name').value.trim(), brand: document.getElementById('ve-brand').value.trim(), year: document.getElementById('ve-year').value.trim(),
        maxSpeed: document.getElementById('ve-speed').value === '' ? null : Number(document.getElementById('ve-speed').value), vehicleType: document.getElementById('ve-type').value,
        department: document.getElementById('ve-dept').value.trim().toUpperCase(), access: document.getElementById('ve-access').value.trim().toUpperCase(), category: document.getElementById('ve-category').value.trim(), subtype: document.getElementById('ve-subtype').value.trim(), image: document.getElementById('ve-image').value.trim()
      };
      saveOverrides(all); modal.remove(); location.reload();
    };
  }

  function setPreview(src) { const p = document.getElementById('ve-preview'); if (!p) return; p.innerHTML = src ? `<img src="${esc(src)}" alt="Preview">` : '<span>No image</span>'; }
  function resizeImage(file) {
    return new Promise(resolve => {
      if (!file) return resolve('');
      const reader = new FileReader();
      reader.onload = () => {
        const img = new Image();
        img.onload = () => { const max=1200, scale=Math.min(1,max/Math.max(img.width,img.height)); const c=document.createElement('canvas'); c.width=Math.round(img.width*scale); c.height=Math.round(img.height*scale); c.getContext('2d').drawImage(img,0,0,c.width,c.height); resolve(c.toDataURL('image/webp',0.82)); };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }

  function installToolbar() {
    if (document.getElementById('vehicle-editor-toolbar')) return;
    const nav = document.querySelector('.nav-container'); if (!nav) return;
    const bar = document.createElement('div'); bar.id='vehicle-editor-toolbar'; bar.className='vehicle-editor-toolbar';
    bar.innerHTML='<button id="open-editor-help" class="btn-secondary">✏ Edit Mode</button><button id="export-overrides" class="btn-secondary">⬇ Export Edits</button><label class="import-label">⬆ Import Edits<input id="import-overrides" type="file" accept="application/json"></label>';
    nav.appendChild(bar);
    document.getElementById('open-editor-help').onclick=()=>alert('Click ✏ Edit Vehicle on any card. Edits are saved locally in this browser and affect the catalogue immediately. Export Edits when you want to make the changes permanent.');
    document.getElementById('export-overrides').onclick=()=>{ const blob=new Blob([JSON.stringify(getOverrides(),null,2)],{type:'application/json'}); const a=document.createElement('a'); a.href=URL.createObjectURL(blob); a.download='fatality-vehicle-edits.json'; a.click(); URL.revokeObjectURL(a.href); };
    document.getElementById('import-overrides').onchange=e=>{ const f=e.target.files?.[0]; if(!f) return; const r=new FileReader(); r.onload=()=>{ try { const incoming=JSON.parse(r.result); if(!incoming || typeof incoming!=='object') throw new Error(); saveOverrides({...getOverrides(),...incoming}); location.reload(); } catch { alert('Invalid edit JSON file.'); } }; r.readAsText(f); };
  }

  document.addEventListener('DOMContentLoaded', () => {
    installToolbar();
    const grid=document.getElementById('vehicle-grid'); if(!grid) return;
    new MutationObserver(()=>grid.querySelectorAll('.vehicle-card').forEach(installButton)).observe(grid,{childList:true});
    grid.querySelectorAll('.vehicle-card').forEach(installButton);
    grid.addEventListener('click',e=>{const btn=e.target.closest('.vehicle-edit-btn'); if(btn) renderEditor(btn.dataset.code);});
  });
})();

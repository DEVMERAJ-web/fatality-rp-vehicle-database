document.addEventListener('DOMContentLoaded', () => {
  let vehiclesData = [];
  let favorites = [];

  const container = document.getElementById('vehicle-grid');
  const resultsCount = document.getElementById('results-count');
  const searchInput = document.getElementById('search-input');
  const accessFilter = document.getElementById('access-filter');
  const typeFilter = document.getElementById('type-filter');
  const subtypeFilter = document.getElementById('subtype-filter');
  const categoryFilter = document.getElementById('category-filter');
  const departmentFilter = document.getElementById('department-filter');
  const statusFilter = document.getElementById('status-filter');
  const favoritesToggle = document.getElementById('favorites-toggle');
  const resetBtn = document.getElementById('reset-filters-btn');
  const modal = document.getElementById('vehicle-modal');
  const modalBody = document.getElementById('modal-body');
  const modalCloseBtn = document.getElementById('modal-close');

  const FALLBACK_IMAGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="360" viewBox="0 0 600 360"><rect width="600" height="360" fill="%2316181C"/><text x="300" y="180" text-anchor="middle" dominant-baseline="middle" fill="%2300C2FF" font-family="Arial" font-size="24" font-weight="700">FATALITY 2.0 - NO IMAGE</text></svg>';

  try {
    const stored = localStorage.getItem('fatality_vehicle_favorites');
    favorites = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(favorites)) favorites = [];
  } catch (_) {
    favorites = [];
  }

  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({ '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;', "'":'&#039;' }[ch]));
  const norm = value => String(value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const upper = value => String(value ?? '').trim().toUpperCase();

  const categoryAliases = {
    sedan: ['sedan','saloon','limousine','luxury sedan','sports sedan','electric sedan','maybach','s class','s500','s63','m3','m5','m7','e55','e63','giulia','passat','w140','w222','model 3','model s'],
    suv: ['suv','urus','cayenne','gv80','x5','x6','x7','g63','g65','g900','velar','range rover','bentayga','defender','trackhawk','tundra','amarok','q8','rsq8','xc90'],
    coupe: ['coupe','911','gt2','gt3','m4','m6','brz','370z','240sx','supra','rx7','silvia','skyline'],
    hatchback: ['hatchback','hot hatch','golf','civic','polo','veloster','fk8','a45'],
    wagon: ['wagon','avant','touring','estate','rs6'],
    supercar: ['supercar','ferrari','lamborghini','mclaren','r8','nsx','f40','812','performante','huracan','aventador','ford gt'],
    hypercar: ['hypercar','chiron','jesko','senna','fenyr','gemera','fxx','sf90','sian','zentenario','amg one','terzo','p1 gtr'],
    electric: ['electric','tesla','taycan','polestar','e tron','model 3','model s','model x','roadster','mach e'],
    muscle: ['muscle','mustang','camaro','challenger','charger','boss429','mach 1','hellcat','zl1','gto'],
    pickup: ['pickup','tundra','ram','f150','silverado','trx','6x6'],
    van: ['van','sprinter','prison van'],
    motorcycle: ['motorcycle','bike','ninja','yamaha','zx6','zx10','r1','r6','r7','s1000','cb650','aerox','ducati','harley'],
    police: ['police','pd','sw ','bearcat','sheriff'],
    ems: ['ems','ambulance','medical','rescue'],
    government: ['government','gov','prison'],
    drag: ['drag','racing','race','track'],
    classic: ['classic','vintage','old','e39','e36','e46','e92','w140','1965','1966','monte'],
    luxury: ['luxury','maybach','rolls royce','bentley','phantom','ghost','wraith'],
    modified: ['modified','custom','mod'],
    emergency: ['ems','ambulance','medical','rescue','police','pd','bearcat','sheriff']
  };

  const categoryLabels = [
    'Sedan','SUV','Coupe','Hatchback','Wagon','Supercar','Hypercar','Electric','Muscle','Pickup','Van',
    'Motorcycle','Police','EMS','Government','Drag Racing','Classic / Vintage','Luxury','Sports Car','Modified','Emergency','Special / Custom'
  ];

  function searchable(v) {
    return norm([
      v.code, v.name, v.brand, v.year, v.vehicleType, v.subtype,
      v.department, v.access, v.status, v.category
    ].join(' '));
  }

  function aliasMatch(v, key) {
    const text = searchable(v);
    return (categoryAliases[key] || []).some(item => text.includes(norm(item)));
  }

  function categoryMatch(v, selected) {
    if (!selected || selected === 'ALL') return true;
    const key = norm(selected);
    const exactCategory = norm(v.category);
    const subtype = norm(v.subtype);

    if (key === 'sedan') return aliasMatch(v, 'sedan');
    if (key === 'suv') return aliasMatch(v, 'suv');
    if (key === 'coupe') return aliasMatch(v, 'coupe');
    if (key === 'hatchback') return aliasMatch(v, 'hatchback');
    if (key === 'wagon') return aliasMatch(v, 'wagon');
    if (key === 'supercar') return aliasMatch(v, 'supercar');
    if (key === 'hypercar') return aliasMatch(v, 'hypercar');
    if (key === 'electric') return aliasMatch(v, 'electric');
    if (key === 'muscle') return aliasMatch(v, 'muscle');
    if (key === 'pickup') return aliasMatch(v, 'pickup');
    if (key === 'van') return aliasMatch(v, 'van');
    if (key === 'motorcycle') return v.vehicleType === 'Motorcycle' || aliasMatch(v, 'motorcycle');
    if (key === 'police') return upper(v.department) === 'POLICE' || upper(v.access) === 'POLICE' || aliasMatch(v, 'police');
    if (key === 'ems') return upper(v.department) === 'EMS' || upper(v.access) === 'EMS' || aliasMatch(v, 'ems');
    if (key === 'government') return upper(v.department) === 'GOVERNMENT' || upper(v.access) === 'GOVERNMENT' || aliasMatch(v, 'government');
    if (key === 'drag racing') return aliasMatch(v, 'drag');
    if (key === 'classic vintage') return aliasMatch(v, 'classic');
    if (key === 'luxury') return aliasMatch(v, 'luxury');
    if (key === 'sports car') return exactCategory.includes('sports car') || aliasMatch(v, 'supercar') || aliasMatch(v, 'coupe');
    if (key === 'modified') return exactCategory.includes('modified') || subtype.includes('modified') || aliasMatch(v, 'modified');
    if (key === 'emergency') return aliasMatch(v, 'emergency');
    if (key === 'special custom') return subtype.includes('special') || upper(v.department) === 'SPECIAL' || exactCategory.includes('special');

    return searchable(v).includes(key);
  }

  function subtypeMatch(v, selected) {
    if (!selected || selected === 'ALL') return true;
    const q = norm(selected);
    return norm(v.subtype).includes(q) || norm(v.category).includes(q) || norm(v.name).includes(q) || norm(v.brand).includes(q);
  }

  function score(v, q) {
    if (!q) return 0;
    const code = norm(v.code), name = norm(v.name), brand = norm(v.brand), text = searchable(v);
    let n = 0;
    if (code === q) n += 1000;
    if (name === q) n += 950;
    if (brand === q) n += 900;
    if (code.startsWith(q)) n += 500;
    if (name.startsWith(q)) n += 450;
    if (brand.startsWith(q)) n += 400;
    if (name.includes(q)) n += 250;
    if (brand.includes(q)) n += 220;
    if (text.includes(q)) n += 100;
    return n;
  }

  function populateDynamicFilters() {
    const selectedType = typeFilter?.value || 'ALL';
    const pool = selectedType === 'ALL' ? vehiclesData : vehiclesData.filter(v => upper(v.vehicleType) === upper(selectedType));

    const subtypes = [...new Set(pool.map(v => v.subtype).filter(Boolean))].sort((a,b) => String(a).localeCompare(String(b)));
    if (subtypeFilter) {
      const old = subtypeFilter.value;
      subtypeFilter.innerHTML = '<option value="ALL">All Subtypes</option>' + subtypes.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join('');
      subtypeFilter.value = subtypes.includes(old) ? old : 'ALL';
    }

    const departments = [...new Set(vehiclesData.map(v => upper(v.department)).filter(Boolean))].sort();
    if (departmentFilter) {
      const old = departmentFilter.value;
      departmentFilter.innerHTML = '<option value="ALL">All Departments</option>' + departments.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join('');
      departmentFilter.value = departments.includes(old) ? old : 'ALL';
    }

    const statuses = [...new Set(vehiclesData.map(v => String(v.status || '').toLowerCase()).filter(Boolean))].sort();
    if (statusFilter) {
      const old = statusFilter.value;
      statusFilter.innerHTML = '<option value="ALL">All Statuses</option>' + statuses.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join('');
      statusFilter.value = statuses.includes(old) ? old : 'ALL';
    }

    if (categoryFilter) {
      const old = categoryFilter.value;
      categoryFilter.innerHTML = '<option value="ALL">All Categories</option>' + categoryLabels.map(v => `<option value="${esc(v)}">${esc(v)}</option>`).join('');
      categoryFilter.value = categoryLabels.includes(old) ? old : 'ALL';
    }
  }

  function getFilteredVehicles() {
    const q = norm(searchInput?.value || '');
    const access = upper(accessFilter?.value || 'ALL');
    const type = upper(typeFilter?.value || 'ALL');
    const subtype = subtypeFilter?.value || 'ALL';
    const category = categoryFilter?.value || 'ALL';
    const department = upper(departmentFilter?.value || 'ALL');
    const status = String(statusFilter?.value || 'ALL').toLowerCase();
    const favOnly = Boolean(favoritesToggle?.checked);

    return vehiclesData
      .filter(v => {
        const text = searchable(v);
        const matchesSearch = !q || text.includes(q);
        const matchesAccess = access === 'ALL' || upper(v.access) === access || (access === 'POLICE' && aliasMatch(v,'police')) || (access === 'EMS' && aliasMatch(v,'ems')) || (access === 'GOVERNMENT' && aliasMatch(v,'government'));
        const matchesType = type === 'ALL' || upper(v.vehicleType) === type;
        const matchesSubtype = subtypeMatch(v, subtype);
        const matchesCategory = categoryMatch(v, category);
        const matchesDepartment = department === 'ALL' || upper(v.department) === department || (department === 'POLICE' && aliasMatch(v,'police')) || (department === 'EMS' && aliasMatch(v,'ems')) || (department === 'GOVERNMENT' && aliasMatch(v,'government'));
        const matchesStatus = status === 'all' || String(v.status || '').toLowerCase() === status;
        const matchesFavorite = !favOnly || favorites.includes(v.code);
        return matchesSearch && matchesAccess && matchesType && matchesSubtype && matchesCategory && matchesDepartment && matchesStatus && matchesFavorite;
      })
      .sort((a,b) => score(b,q) - score(a,q));
  }

  function renderLoading() {
    if (container) container.innerHTML = '<div class="loading-state"><div class="spinner"></div><p>Connecting to Fatality 2.0 Database...</p></div>';
  }

  function renderError(message) {
    if (container) container.innerHTML = `<div class="error-state"><p>${esc(message)}</p></div>`;
  }

  function renderVehicles(list) {
    if (!container) return;
    currentResults = list;
    container.innerHTML = '';
    if (resultsCount) resultsCount.textContent = `Showing ${list.length} vehicle${list.length === 1 ? '' : 's'}`;

    if (!list.length) {
      container.innerHTML = '<div class="no-results"><h3>No vehicles found</h3><p>No records match your current filters or search.</p><button class="btn-secondary" id="inline-reset">Reset Filters</button></div>';
      document.getElementById('inline-reset')?.addEventListener('click', resetAllFilters);
      return;
    }

    const fragment = document.createDocumentFragment();
    list.forEach(v => {
      const isFav = favorites.includes(v.code);
      const isAdmin = upper(v.access) === 'ADMIN';
      const card = document.createElement('div');
      card.className = `vehicle-card ${isAdmin ? 'admin-card' : ''}`;
      card.innerHTML = `
        <div class="card-image-wrapper">
          <img src="${esc(v.image || '')}" alt="${esc(v.name)}" class="vehicle-img" loading="lazy" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'">
          <div class="card-badges"><span class="badge ${isAdmin ? 'badge-access-admin' : 'badge-access'}">${esc(v.access || 'CIVILIAN')}</span><span class="badge badge-status">${esc(v.status || 'unknown')}</span></div>
          <button class="fav-btn ${isFav ? 'active' : ''}" data-code="${esc(v.code)}" title="Toggle Favorite" aria-label="Toggle favorite">${isFav ? '★' : '☆'}</button>
        </div>
        <div class="card-body">
          <h3 class="vehicle-title">${esc(v.name || 'Identification pending')}</h3>
          <div class="spawn-code-wrapper"><span class="spawn-code-text">${esc(v.code)}</span></div>
          <div class="details-grid">
            <p><strong>Brand:</strong> ${esc(v.brand)}</p><p><strong>Year:</strong> ${esc(v.year)}</p>
            <p><strong>Type:</strong> ${esc(v.vehicleType)}</p><p><strong>Subtype:</strong> ${esc(v.subtype)}</p>
            <p><strong>Dept:</strong> ${esc(v.department)}</p><p><strong>Category:</strong> ${esc(v.category)}</p>
          </div>
          <div class="card-actions"><button class="btn-primary copy-btn" data-code="${esc(v.code)}">Copy Code</button><button class="btn-outline details-btn" data-code="${esc(v.code)}">Details</button></div>
        </div>`;
      fragment.appendChild(card);
    });
    container.appendChild(fragment);
  }

  function copySpawnCode(code, btn) {
    if (!code || !btn) return;
    const done = () => { const old = btn.textContent; btn.textContent='Copied!'; btn.classList.add('copied'); setTimeout(()=>{btn.textContent=old;btn.classList.remove('copied');},1500); };
    if (navigator.clipboard && window.isSecureContext) navigator.clipboard.writeText(code).then(done).catch(()=>fallbackCopy(code,done));
    else fallbackCopy(code,done);
  }

  function fallbackCopy(text, done) {
    const ta=document.createElement('textarea'); ta.value=text; ta.style.position='fixed'; ta.style.opacity='0'; document.body.appendChild(ta); ta.focus(); ta.select();
    try { document.execCommand('copy'); done(); } finally { ta.remove(); }
  }

  function toggleFavorite(code) {
    const i=favorites.indexOf(code); if(i>=0) favorites.splice(i,1); else favorites.push(code);
    try { localStorage.setItem('fatality_vehicle_favorites',JSON.stringify(favorites)); } catch(_){ }
    renderVehicles(getFilteredVehicles());
  }

  function openModal(code) {
    const v=vehiclesData.find(x=>x.code===code); if(!v||!modal||!modalBody) return;
    const fav=favorites.includes(v.code); const admin=upper(v.access)==='ADMIN';
    modalBody.innerHTML=`<div class="modal-layout"><div class="modal-img-wrapper"><img class="modal-img" src="${esc(v.image||'')}" alt="${esc(v.name)}" onerror="this.onerror=null;this.src='${FALLBACK_IMAGE}'"></div><div class="modal-content"><div class="modal-header-info"><h2 id="modal-title">${esc(v.name)}</h2><span class="badge ${admin?'badge-access-admin':'badge-access'}">${esc(v.access)} ACCESS</span></div><table class="modal-table"><tr><td>Spawn Code</td><td><strong class="accent-text">${esc(v.code)}</strong></td></tr><tr><td>Brand</td><td>${esc(v.brand)}</td></tr><tr><td>Model Year</td><td>${esc(v.year)}</td></tr><tr><td>Vehicle Type</td><td>${esc(v.vehicleType)}</td></tr><tr><td>Subtype</td><td>${esc(v.subtype)}</td></tr><tr><td>Category</td><td>${esc(v.category)}</td></tr><tr><td>Department</td><td>${esc(v.department)}</td></tr><tr><td>Status</td><td>${esc(v.status)}</td></tr></table><div class="card-actions"><button class="btn-primary copy-btn" data-code="${esc(v.code)}">Copy Spawn Code</button><button class="btn-outline modal-fav-btn" data-code="${esc(v.code)}">${fav?'★ Favorited':'☆ Add to Favorites'}</button></div></div></div>`;
    modal.classList.add('open'); modal.setAttribute('aria-hidden','false'); document.body.style.overflow='hidden';
  }

  function closeModal(){ if(!modal)return; modal.classList.remove('open'); modal.setAttribute('aria-hidden','true'); document.body.style.overflow=''; }

  function resetAllFilters(){
    if(searchInput) searchInput.value='';
    if(accessFilter) accessFilter.value='ALL';
    if(typeFilter) typeFilter.value='ALL';
    if(subtypeFilter) subtypeFilter.value='ALL';
    if(categoryFilter) categoryFilter.value='ALL';
    if(departmentFilter) departmentFilter.value='ALL';
    if(statusFilter) statusFilter.value='ALL';
    if(favoritesToggle) favoritesToggle.checked=false;
    populateDynamicFilters(); renderVehicles(getFilteredVehicles());
  }

  function bindEvents(){
    searchInput?.addEventListener('input',()=>renderVehicles(getFilteredVehicles()));
    accessFilter?.addEventListener('change',()=>renderVehicles(getFilteredVehicles()));
    typeFilter?.addEventListener('change',()=>{populateDynamicFilters();renderVehicles(getFilteredVehicles());});
    subtypeFilter?.addEventListener('change',()=>renderVehicles(getFilteredVehicles()));
    categoryFilter?.addEventListener('change',()=>renderVehicles(getFilteredVehicles()));
    departmentFilter?.addEventListener('change',()=>renderVehicles(getFilteredVehicles()));
    statusFilter?.addEventListener('change',()=>renderVehicles(getFilteredVehicles()));
    favoritesToggle?.addEventListener('change',()=>renderVehicles(getFilteredVehicles()));
    resetBtn?.addEventListener('click',resetAllFilters);

    document.addEventListener('click',e=>{
      const target=e.target.closest('button'); if(!target) return;
      if(target.classList.contains('copy-btn')) copySpawnCode(target.dataset.code,target);
      else if(target.classList.contains('details-btn')) openModal(target.dataset.code);
      else if(target.classList.contains('fav-btn')||target.classList.contains('modal-fav-btn')){toggleFavorite(target.dataset.code);if(target.classList.contains('modal-fav-btn'))openModal(target.dataset.code);}
      else if(target===modalCloseBtn) closeModal();
      else if(target.classList.contains('modal-overlay')) closeModal();
    });
    document.addEventListener('keydown',e=>{if(e.key==='Escape'&&modal?.classList.contains('open'))closeModal();});
  }

  function init(){
    renderLoading();
    fetch('./data/vehicles.json',{cache:'no-store'})
      .then(r=>{if(!r.ok)throw new Error(`HTTP ${r.status}`);return r.json();})
      .then(data=>{vehiclesData=Array.isArray(data)?data:[];populateDynamicFilters();renderVehicles(getFilteredVehicles());bindEvents();})
      .catch(err=>{console.error(err);renderError('Unable to load vehicle database. Please check data/vehicles.json.');});
  }

  init();
});

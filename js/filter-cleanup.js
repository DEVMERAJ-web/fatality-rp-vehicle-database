(() => {
  'use strict';

  const DATA_URL = './data/vehicles.json';
  let records = [];
  let raf = 0;
  let applying = false;
  let ready = false;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const norm = value => String(value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const upper = value => String(value ?? '').trim().toUpperCase();

  const bodyMatchers = {
    'Sedan': ['sedan','saloon','limousine'],
    'SUV': ['suv','urus','cayenne','gv80','xb7','x5','x6','x7','g63','g65','g900','velar','range rover','bentayga','defender','trackhawk','q8','rsq8','xc90'],
    'Coupe': ['coupe','911','gt2','gt3','m4','m6','brz','370z','240sx','supra','rx7','silvia','skyline','m8'],
    'Hatchback': ['hatchback','hot hatch','golf','civic type r','polo','veloster','a45'],
    'Wagon': ['wagon','avant','touring','estate','rs6'],
    'Pickup': ['pickup','tundra','ram','f150','silverado','trx','6x6','amarok'],
    'Van': ['van','sprinter','prison van','ambulance'],
    'Convertible / Roadster': ['convertible','roadster','spyder','spider','wraith','dawn'],
    'Motorcycle': ['motorcycle','bike','ninja','yamaha','zx6','zx10','r1','r6','r7','s1000','cb650','aerox','ducati','harley']
  };

  const performanceMatchers = {
    'Hypercar': ['hypercar','chiron','jesko','senna','fenyr','gemera','fxx','sf90','sian','zentenario','amg one','terzo','p1 gtr'],
    'Supercar': ['supercar','ferrari','lamborghini','mclaren','r8','nsx','f40','812','performante','huracan','aventador','ford gt'],
    'Sports': ['sports car','sports coupe','sports sedan','gt3','gt2','m4','m5','m3','m6','rs6','rs7','rsq8','gtr','supra','370z'],
    'Luxury': ['luxury','maybach','rolls royce','bentley','phantom','ghost','wraith','s class','s500','s63','s650'],
    'Electric': ['electric','tesla','taycan','polestar','e tron','model 3','model s','model x','roadster','mach e'],
    'Muscle': ['muscle','mustang','camaro','challenger','charger','boss429','mach 1','hellcat','zl1','gto'],
    'Classic / Vintage': ['classic','vintage','old','e39','e36','e46','e92','w140','1965','1966','monte'],
    'Racing / Drag': ['drag','racing','race','track','gts','gtr'],
    'Modified / Custom': ['modified','custom','mansory','brabus','hycade','rmod','prior','black edition','speedhunter'],
    'Emergency': ['ems','ambulance','medical','rescue','police','pd','bearcat','sheriff']
  };

  function includesAny(text, terms) {
    return terms.some(term => text.includes(norm(term)));
  }

  function classifyBody(v) {
    if (v.vehicleType === 'Motorcycle') return 'Motorcycle';
    const text = norm([v.name, v.brand, v.subtype, v.category, v.code].join(' '));
    for (const [label, terms] of Object.entries(bodyMatchers)) if (includesAny(text, terms)) return label;
    if (v.vehicleType === 'Boat') return 'Boat';
    if (v.vehicleType === 'Helicopter') return 'Helicopter';
    if (v.vehicleType === 'Plane') return 'Plane';
    if (v.vehicleType === 'Utility') return 'Utility';
    return 'Other';
  }

  function classifyPerformance(v) {
    const text = norm([v.name, v.brand, v.subtype, v.category, v.code].join(' '));
    for (const [label, terms] of Object.entries(performanceMatchers)) if (includesAny(text, terms)) return label;
    return v.vehicleType === 'Car' ? 'Standard' : 'Utility / Specialty';
  }

  function accessGroup(v) {
    const access = upper(v.access);
    if (access === 'ADMIN') return 'STAFF / ADMIN';
    if (['EMS','POLICE','GOVERNMENT'].includes(access)) return 'DEPARTMENT';
    return 'PUBLIC / CIVILIAN';
  }

  function findByCode(code) {
    return records.find(v => v.code === code);
  }

  function cardCode(card) {
    return card.querySelector('.spawn-code-text')?.textContent.trim() || '';
  }

  function selected(id) { return document.getElementById(id)?.value || 'ALL'; }

  function installFilters() {
    const panel = document.querySelector('.filter-panel');
    if (!panel || document.getElementById('brand-filter')) return false;

    // Remove confusing legacy filters from the visible sidebar. Their underlying
    // controls remain hidden so the existing catalogue renderer stays compatible.
    ['access-filter','subtype-filter','category-filter'].forEach(id => {
      const el = document.getElementById(id);
      const group = el?.closest('.filter-group');
      if (group) group.classList.add('legacy-hidden-filter');
    });

    const typeGroup = document.getElementById('type-filter')?.closest('.filter-group');
    const deptGroup = document.getElementById('department-filter')?.closest('.filter-group');
    const statusGroup = document.getElementById('status-filter')?.closest('.filter-group');

    if (typeGroup) typeGroup.querySelector('label').textContent = 'Vehicle Type';
    if (deptGroup) deptGroup.querySelector('label').textContent = 'Department';
    if (statusGroup) statusGroup.querySelector('label').textContent = 'Verification';

    const searchGroup = document.getElementById('search-input')?.closest('.filter-group');
    const speedGroup = document.getElementById('speed-filter')?.closest('.filter-group');
    const idGroup = document.getElementById('identification-filter')?.closest('.filter-group');

    const createGroup = (id, label, inner, className='filter-group clean-filter-group') => {
      const group = document.createElement('div');
      group.className = className;
      group.innerHTML = `<label for="${id}">${label}</label>${inner}`;
      return group;
    };

    const brandGroup = createGroup('brand-filter','Brand / Manufacturer','<select id="brand-filter"><option value="ALL">All Brands</option></select>');
    const modelGroup = createGroup('model-filter','Model / Vehicle','<input id="model-filter" type="text" placeholder="Filter model or vehicle name..." autocomplete="off">');
    const bodyGroup = createGroup('body-filter','Body Style','<select id="body-filter"><option value="ALL">All Body Styles</option></select>');
    const performanceGroup = createGroup('performance-filter','Performance Class','<select id="performance-filter"><option value="ALL">All Performance Classes</option></select>');
    const accessGroupEl = createGroup('spawn-access-filter','Spawn Access','<select id="spawn-access-filter"><option value="ALL">All Access Levels</option><option value="PUBLIC / CIVILIAN">🌐 Public / Civilian</option><option value="DEPARTMENT">🏢 Department</option><option value="STAFF / ADMIN">🔐 Staff / Admin</option></select>');

    // Insert in a clear order after Search.
    if (searchGroup) {
      searchGroup.after(brandGroup, modelGroup, typeGroup || document.createTextNode(''), bodyGroup, performanceGroup, deptGroup || document.createTextNode(''), accessGroupEl, statusGroup || document.createTextNode(''), speedGroup || document.createTextNode(''), idGroup || document.createTextNode(''));
    } else {
      panel.append(brandGroup, modelGroup, bodyGroup, performanceGroup, accessGroupEl);
    }

    populateOptions();
    const bind = id => document.getElementById(id)?.addEventListener(id === 'model-filter' ? 'input' : 'change', scheduleApply);
    ['brand-filter','model-filter','body-filter','performance-filter','spawn-access-filter','type-filter','department-filter','status-filter','speed-filter','identification-filter','favorites-toggle'].forEach(bind);

    document.getElementById('reset-filters-btn')?.addEventListener('click', () => {
      ['brand-filter','body-filter','performance-filter','spawn-access-filter'].forEach(id => { const e=document.getElementById(id); if(e) e.value='ALL'; });
      const model = document.getElementById('model-filter'); if(model) model.value='';
      setTimeout(apply, 60);
    });
    return true;
  }

  function populateOptions() {
    const brandSelect = document.getElementById('brand-filter');
    const brands = [...new Set(records.map(v => String(v.brand || '').trim()).filter(v => v && v.toLowerCase() !== 'custom' && v.toLowerCase() !== 'identification pending'))].sort((a,b)=>a.localeCompare(b));
    if (brandSelect) brandSelect.innerHTML = '<option value="ALL">All Brands</option>' + brands.map(b=>`<option value="${esc(b)}">${esc(b)}</option>`).join('');

    const bodySelect = document.getElementById('body-filter');
    const bodyOptions = [...new Set(records.map(classifyBody))].sort();
    if (bodySelect) bodySelect.innerHTML = '<option value="ALL">All Body Styles</option>' + bodyOptions.map(b=>`<option value="${esc(b)}">${esc(b)}</option>`).join('');

    const performanceSelect = document.getElementById('performance-filter');
    const perfOptions = [...new Set(records.map(classifyPerformance))].sort();
    if (performanceSelect) performanceSelect.innerHTML = '<option value="ALL">All Performance Classes</option>' + perfOptions.map(p=>`<option value="${esc(p)}">${esc(p)}</option>`).join('');

    const department = document.getElementById('department-filter');
    if (department) {
      const old = department.value;
      const values = [...new Set(records.map(v=>upper(v.department)).filter(Boolean))].sort();
      department.innerHTML = '<option value="ALL">All Departments</option>' + values.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');
      department.value = values.includes(old) ? old : 'ALL';
    }

    const status = document.getElementById('status-filter');
    if (status) {
      const old = status.value;
      status.innerHTML = '<option value="ALL">All Verification Levels</option><option value="confirmed">✓ Confirmed</option><option value="likely">◐ Likely / Custom</option><option value="unknown">? Unverified</option>';
      status.value = ['ALL','confirmed','likely','unknown'].includes(old) ? old : 'ALL';
    }
  }

  function matches(v) {
    const brand = selected('brand-filter');
    const model = norm(document.getElementById('model-filter')?.value || '');
    const body = selected('body-filter');
    const perf = selected('performance-filter');
    const access = selected('spawn-access-filter');

    if (brand !== 'ALL' && String(v.brand || '').trim() !== brand) return false;
    if (model && !norm([v.name, v.code, v.brand].join(' ')).includes(model)) return false;
    if (body !== 'ALL' && classifyBody(v) !== body) return false;
    if (perf !== 'ALL' && classifyPerformance(v) !== perf) return false;
    if (access !== 'ALL' && accessGroup(v) !== access) return false;
    return true;
  }

  function scheduleApply() {
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(apply);
  }

  function apply() {
    if (!ready || applying) return;
    applying = true;
    const grid = document.getElementById('vehicle-grid');
    if (!grid) { applying=false; return; }
    const cards = [...grid.querySelectorAll('.vehicle-card')];
    let visible = 0;
    for (const card of cards) {
      const record = findByCode(cardCode(card));
      const show = record ? matches(record) : true;
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    }
    const count = document.getElementById('results-count');
    if (count) count.textContent = `Showing ${visible} vehicle${visible === 1 ? '' : 's'}`;
    applying = false;
  }

  function bootObserver() {
    const grid = document.getElementById('vehicle-grid');
    if (!grid || grid.__cleanFilterObserver) return;
    const observer = new MutationObserver(mutations => {
      if (mutations.some(m => m.addedNodes.length || m.removedNodes.length)) scheduleApply();
    });
    observer.observe(grid, { childList: true });
    grid.__cleanFilterObserver = observer;
  }

  fetch(DATA_URL, { cache: 'no-store' })
    .then(r => r.json())
    .then(data => {
      records = Array.isArray(data) ? data : [];
      installFilters();
      ready = true;
      bootObserver();
      scheduleApply();
    })
    .catch(() => {});
})();

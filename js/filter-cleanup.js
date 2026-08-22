(() => {
  'use strict';

  const DATA_URL = './data/vehicles.json';
  let records = [];
  let raf = 0;
  let ready = false;
  let applying = false;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[ch]));
  const norm = value => String(value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const upper = value => String(value ?? '').trim().toUpperCase();

  const bodyStyles = [
    'Sedan','SUV','Coupe','Hatchback','Wagon','Convertible','Roadster','Pickup','Van','Limousine',
    'Off-Road / 4x4','Supercar Body','Hypercar Body','Motorcycle','Scooter','Boat','Helicopter','Aircraft / Plane','Utility','Emergency','Other'
  ];
  const performanceClasses = [
    'Standard','Luxury','Sports','Supercar','Hypercar','Muscle','Electric','Hybrid','Race / Track',
    'Drag Racing','Off-Road','Modified / Custom','Classic / Vintage','Emergency / Fleet','Special / Event','Other'
  ];

  function textOf(v) { return norm([v.code,v.name,v.brand,v.subtype,v.category,v.vehicleType].join(' ')); }
  function has(text, list) { return list.some(x => text.includes(norm(x))); }

  function classifyBody(v) {
    const t = textOf(v);
    if (['Boat','Helicopter','Plane'].includes(v.vehicleType)) return v.vehicleType === 'Plane' ? 'Aircraft / Plane' : v.vehicleType;
    if (v.vehicleType === 'Motorcycle') return /scooter|aerox/.test(t) ? 'Scooter' : 'Motorcycle';
    if (has(t,['ambulance','ems','police vehicle','bearcat','sheriff','prison van','fire rescue'])) return 'Emergency';
    if (has(t,['limousine','limo','s650','s class limousine'])) return 'Limousine';
    if (has(t,['pickup','tundra','ram ','ramtrx','trx','f150','silverado','amarok','6x6'])) return 'Pickup';
    if (has(t,['van','sprinter','transit','bus'])) return 'Van';
    if (has(t,['convertible','dawn','cabriolet','cabrio','spyder','spider'])) return 'Convertible';
    if (has(t,['roadster','z8'])) return 'Roadster';
    if (has(t,['wagon','avant','touring','estate','rs6'])) return 'Wagon';
    if (has(t,['hatchback','hot hatch','golf','civic type r','polo','veloster','fk8','a45'])) return 'Hatchback';
    if (has(t,['off road','offroad','4x4','jeep','g wagon','g class','trackhawk'])) return 'Off-Road / 4x4';
    if (has(t,['hypercar','chiron','jesko','senna','fenyr','gemera','fxx','amg one','terzo','p1 gtr'])) return 'Hypercar Body';
    if (has(t,['supercar','ferrari','lamborghini','mclaren','r8','nsx','f40','812','performante','huracan','aventador','svj','ford gt'])) return 'Supercar Body';
    if (has(t,['suv','urus','cayenne','gv80','xb7','x5','x6','x7','g63','g65','g900','velar','range rover','bentayga','defender','q8','rsq8','xc90','gle','gl63'])) return 'SUV';
    if (has(t,['coupe','911','gt2','gt3','m4','m6','m8','brz','370z','240sx','supra','rx7','silvia','skyline'])) return 'Coupe';
    if (has(t,['sedan','saloon','m3','m5','m7','s500','s63','e55','e63','giulia','passat','w140','w222','maybach','model 3','model s'])) return 'Sedan';
    if (v.vehicleType === 'Utility') return 'Utility';
    return 'Other';
  }

  function classifyPerformance(v) {
    const t = textOf(v);
    const dept = upper(v.department);
    if (['EMS','POLICE','GOVERNMENT'].includes(dept) || has(t,['ambulance','emergency','bearcat','sheriff','police','ems'])) return 'Emergency / Fleet';
    if (has(t,['drag','drag racing','dragster'])) return 'Drag Racing';
    if (has(t,['race','racing','track','gt3','gt2','gts','p1 gtr'])) return 'Race / Track';
    if (has(t,['hypercar','chiron','jesko','senna','fenyr','gemera','fxx','amg one','terzo','p1 gtr'])) return 'Hypercar';
    if (has(t,['supercar','ferrari','lamborghini','mclaren','r8','nsx','f40','812','performante','huracan','aventador','svj','ford gt'])) return 'Supercar';
    if (has(t,['electric','tesla','taycan','polestar','e tron','model 3','model s','model x','mach e'])) return 'Electric';
    if (has(t,['hybrid','sf90','sian','polestar 1'])) return 'Hybrid';
    if (has(t,['muscle','mustang','camaro','charger','hellcat','boss429','mach 1','gto'])) return 'Muscle';
    if (has(t,['off road','offroad','trackhawk','trx','tundra','jeep','4x4'])) return 'Off-Road';
    if (has(t,['classic','vintage','old','e39','e36','e46','e92','w140','1965','1966','monte'])) return 'Classic / Vintage';
    if (has(t,['modified','custom','mansory','brabus','hycade','rmod','prior','black edition','speedhunter','varis'])) return 'Modified / Custom';
    if (has(t,['luxury','maybach','rolls royce','bentley','phantom','ghost','wraith','s class','s500','s63','s650'])) return 'Luxury';
    if (has(t,['sports','sport','m4','m5','m3','m6','m8','911','supra','rx7','silvia','skyline','rs6','rs7','rsq8','amg','civic type r','evo','370z'])) return 'Sports';
    if (v.vehicleType === 'Car' && !/unknown|identification pending/.test(t)) return 'Standard';
    return 'Other';
  }

  function accessGroup(v) {
    const a = upper(v.access);
    if (a === 'ADMIN') return 'STAFF / ADMIN';
    if (['EMS','POLICE','GOVERNMENT'].includes(a)) return 'DEPARTMENT';
    return 'PUBLIC / CIVILIAN';
  }

  function findByCode(code) { return records.find(v => v.code === code); }
  function cardCode(card) { return card.querySelector('.spawn-code-text')?.textContent.trim() || ''; }
  function selected(id) { return document.getElementById(id)?.value || 'ALL'; }

  function makeGroup(id, label, html, hint='') {
    const group = document.createElement('div');
    group.className = 'filter-group clean-filter-group';
    group.dataset.filterRole = id;
    group.innerHTML = `<label for="${id}">${label}</label>${html}${hint ? `<small class="professional-filter-hint">${hint}</small>` : ''}`;
    return group;
  }

  function addSection(panel, title) {
    const el = document.createElement('div');
    el.className = 'filter-section-title';
    el.textContent = title;
    panel.appendChild(el);
    return el;
  }

  function installFilters() {
    const panel = document.querySelector('.filter-panel');
    if (!panel || document.getElementById('brand-filter')) return;

    ['access-filter','subtype-filter','category-filter'].forEach(id => document.getElementById(id)?.closest('.filter-group')?.classList.add('legacy-hidden-filter'));

    const typeGroup = document.getElementById('type-filter')?.closest('.filter-group');
    const deptGroup = document.getElementById('department-filter')?.closest('.filter-group');
    const statusGroup = document.getElementById('status-filter')?.closest('.filter-group');
    const speedGroup = document.getElementById('speed-filter')?.closest('.filter-group');
    const idGroup = document.getElementById('identification-filter')?.closest('.filter-group');
    const favGroup = document.getElementById('favorites-toggle')?.closest('.filter-group');
    const searchGroup = document.getElementById('search-input')?.closest('.filter-group');

    if (typeGroup) typeGroup.querySelector('label').textContent = 'Vehicle Class';
    if (deptGroup) deptGroup.querySelector('label').textContent = 'Department';
    if (statusGroup) statusGroup.querySelector('label').textContent = 'Verification';

    const oldGroups = [...panel.querySelectorAll('.clean-filter-group,.filter-section-title')];
    oldGroups.forEach(g => g.remove());

    const brandGroup = makeGroup('brand-filter','Manufacturer',`<select id="brand-filter"><option value="ALL">All Manufacturers</option></select>`,'Company / manufacturer of the vehicle.');
    const modelGroup = makeGroup('model-filter','Model / Vehicle',`<input id="model-filter" type="text" placeholder="e.g. M5, RS7, G-Wagon..." autocomplete="off">`,'Searches model name and spawn code.');
    const bodyGroup = makeGroup('body-filter','Body Style',`<select id="body-filter"><option value="ALL">All Body Styles</option></select>`);
    const performanceGroup = makeGroup('performance-filter','Performance Class',`<select id="performance-filter"><option value="ALL">All Performance Classes</option></select>`,'Separates standard, luxury, sports, supercars, hypercars, racing, etc.');
    const accessGroup = makeGroup('spawn-access-filter','Spawn Access',`<select id="spawn-access-filter"><option value="ALL">All Access Levels</option><option value="PUBLIC / CIVILIAN">🌐 Public / Civilian</option><option value="DEPARTMENT">🏢 Department</option><option value="STAFF / ADMIN">🔐 Staff / Admin</option></select>`,'Who can normally use the vehicle in Fatality RP.');

    // Clear and rebuild the sidebar order while retaining the existing functional controls.
    panel.innerHTML = '';
    const header = document.createElement('div');
    header.className = 'filter-header';
    header.innerHTML = '<h2>Vehicle Filters</h2><button id="reset-filters-btn" class="btn-secondary" title="Reset all active filters">Reset All</button>';
    panel.appendChild(header);
    if (searchGroup) panel.appendChild(searchGroup);

    addSection(panel,'IDENTITY');
    panel.append(brandGroup,modelGroup);
    addSection(panel,'CLASSIFICATION');
    if (typeGroup) panel.appendChild(typeGroup);
    panel.append(bodyGroup,performanceGroup);
    addSection(panel,'SERVER ACCESS');
    panel.append(accessGroup);
    if (deptGroup) panel.appendChild(deptGroup);
    addSection(panel,'STATUS & PERFORMANCE');
    if (statusGroup) panel.appendChild(statusGroup);
    if (speedGroup) panel.appendChild(speedGroup);
    addSection(panel,'SPECIAL TOOLS');
    if (idGroup) panel.appendChild(idGroup);
    if (favGroup) panel.appendChild(favGroup);

    populateOptions();

    const bind = id => document.getElementById(id)?.addEventListener(id === 'model-filter' ? 'input' : 'change', scheduleApply);
    ['brand-filter','model-filter','body-filter','performance-filter','spawn-access-filter','type-filter','department-filter','status-filter','speed-filter','identification-filter','favorites-toggle'].forEach(bind);
    document.getElementById('reset-filters-btn')?.addEventListener('click', () => {
      ['brand-filter','body-filter','performance-filter','spawn-access-filter'].forEach(id=>{const e=document.getElementById(id);if(e)e.value='ALL';});
      const model=document.getElementById('model-filter');if(model)model.value='';
      setTimeout(scheduleApply,80);
    });
  }

  function populateOptions() {
    const brandSelect = document.getElementById('brand-filter');
    const brands = [...new Set(records.map(v=>String(v.brand||'').trim()).filter(v=>v && !/^custom$/i.test(v) && !/identification pending/i.test(v)))].sort((a,b)=>a.localeCompare(b));
    if (brandSelect) brandSelect.innerHTML = '<option value="ALL">All Manufacturers</option>' + brands.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');

    const bodySelect = document.getElementById('body-filter');
    if (bodySelect) bodySelect.innerHTML = '<option value="ALL">All Body Styles</option>' + bodyStyles.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');

    const perfSelect = document.getElementById('performance-filter');
    if (perfSelect) perfSelect.innerHTML = '<option value="ALL">All Performance Classes</option>' + performanceClasses.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');

    const dept = document.getElementById('department-filter');
    if (dept) {
      const vals = [...new Set(records.map(v=>upper(v.department)).filter(Boolean))].sort();
      dept.innerHTML = '<option value="ALL">All Departments</option>' + vals.map(v=>`<option value="${esc(v)}">${esc(v)}</option>`).join('');
    }

    const status = document.getElementById('status-filter');
    if (status) status.innerHTML = '<option value="ALL">All Verification Levels</option><option value="confirmed">✓ Confirmed</option><option value="likely">◐ Likely / Custom</option><option value="unknown">? Unverified</option>';
  }

  function matches(v) {
    const brand=selected('brand-filter');
    const model=norm(document.getElementById('model-filter')?.value||'');
    const body=selected('body-filter');
    const performance=selected('performance-filter');
    const access=selected('spawn-access-filter');
    if (brand!=='ALL' && String(v.brand||'').trim()!==brand) return false;
    if (model && !norm([v.name,v.code,v.brand].join(' ')).includes(model)) return false;
    if (body!=='ALL' && classifyBody(v)!==body) return false;
    if (performance!=='ALL' && classifyPerformance(v)!==performance) return false;
    if (access!=='ALL' && accessGroup(v)!==access) return false;
    return true;
  }

  function updateCardClassification(card,v) {
    const details=card.querySelector('.details-grid');
    if (!details || !v) return;
    const ps=[...details.querySelectorAll('p')];
    ps.forEach(p=>{
      const txt=p.textContent||'';
      if (/Subtype:/i.test(txt)) p.innerHTML=`<strong>Body Style:</strong> ${esc(classifyBody(v))}`;
      if (/Category:/i.test(txt)) p.innerHTML=`<strong>Performance:</strong> ${esc(classifyPerformance(v))}`;
    });
  }

  function scheduleApply(){cancelAnimationFrame(raf);raf=requestAnimationFrame(apply);}

  function apply(){
    if(!ready||applying)return;
    applying=true;
    const grid=document.getElementById('vehicle-grid');
    if(!grid){applying=false;return;}
    const cards=[...grid.querySelectorAll('.vehicle-card')];
    let visible=0;
    cards.forEach(card=>{
      const v=findByCode(cardCode(card));
      if(!v)return;
      updateCardClassification(card,v);
      const show=matches(v);
      card.classList.toggle('pro-filter-hidden',!show);
      if(show)visible++;
    });
    const results=document.getElementById('results-count');
    if(results)results.textContent=`Showing ${visible} vehicle${visible===1?'':'s'}`;
    applying=false;
  }

  function bootObserver(){
    const grid=document.getElementById('vehicle-grid');
    if(!grid||grid.__professionalFilterObserver)return;
    const observer=new MutationObserver(m=>{if(m.some(x=>x.addedNodes.length||x.removedNodes.length))scheduleApply();});
    observer.observe(grid,{childList:true});
    grid.__professionalFilterObserver=observer;
  }

  fetch(DATA_URL,{cache:'no-store'}).then(r=>r.ok?r.json():[]).then(data=>{
    records=Array.isArray(data)?data:[];
    installFilters();
    ready=true;
    bootObserver();
    scheduleApply();
  }).catch(()=>{});
})();

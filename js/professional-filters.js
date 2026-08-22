(() => {
  'use strict';

  const FILTERS = {
    brand: 'pf-brand', model: 'pf-model', body: 'pf-body', performance: 'pf-performance'
  };

  let records = [];
  let timer = 0;

  const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#039;'}[c]));
  const norm = value => String(value ?? '').toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();
  const upper = value => String(value ?? '').trim().toUpperCase();

  const bodyStyles = ['Sedan','SUV','Coupe','Hatchback','Wagon','Convertible','Roadster','Supercar','Hypercar','Muscle Car','Pickup','Van','Limousine','Motorcycle','Scooter','Off-Road / 4x4','Emergency','Utility','Boat','Helicopter','Aircraft / Plane','Unknown'];
  const performanceClasses = ['Economy / Standard','Luxury','Sports','Supercar','Hypercar','Muscle','Electric','Hybrid','Race / Track','Drag Racing','Off-Road','Modified / Custom','Emergency / Fleet','Classic / Vintage','Unknown'];

  function classifyBody(v) {
    const t = norm([v.name,v.category,v.subtype,v.vehicleType,v.brand].join(' '));
    if (v.vehicleType === 'Motorcycle') return /scooter|aerox/.test(t) ? 'Scooter' : 'Motorcycle';
    if (v.vehicleType === 'Boat') return 'Boat';
    if (v.vehicleType === 'Helicopter') return 'Helicopter';
    if (v.vehicleType === 'Plane') return 'Aircraft / Plane';
    if (/ambulance|ems|police|sheriff|bearcat|prison|fire|rescue|police vehicle/.test(t)) return 'Emergency';
    if (/limousine|limousine/.test(t)) return 'Limousine';
    if (/pickup|truck|tundra|ram |trx|silverado|amarok|f150/.test(t)) return 'Pickup';
    if (/van|sprinter|transit/.test(t)) return 'Van';
    if (/convertible|dawn|wraith|wraith|roadster|z8|spider|spyder/.test(t)) return /roadster|z8/.test(t) ? 'Roadster' : 'Convertible';
    if (/wagon|avant|touring|estate|rs6/.test(t)) return 'Wagon';
    if (/hatchback|hot hatch|golf|civic|polo|veloster|fk8|a45/.test(t)) return 'Hatchback';
    if (/muscle|mustang|camaro|charger|hellcat|boss429|mach 1|gto/.test(t)) return 'Muscle Car';
    if (/hypercar|chiron|jesko|senna|fenyr|gemera|fxx|amg one|terzo|p1 gtr/.test(t)) return 'Hypercar';
    if (/supercar|ferrari|lamborghini|mclaren|r8|nsx|f40|812|performante|huracan|aventador|ford gt|svj/.test(t)) return 'Supercar';
    if (/suv|urus|cayenne|gv80|x5|x6|x7|g63|g65|velar|range rover|bentayga|defender|trackhawk|q8|rsq8|xc90|gle|gl63/.test(t)) return 'SUV';
    if (/coupe|911|gt2|gt3|m4|m6|brz|370z|240sx|supra|rx7|silvia|skyline/.test(t)) return 'Coupe';
    if (/sedan|saloon|limousine|m3|m5|m7|s500|s63|e55|e63|giulia|passat|w140|w222|model 3|model s|maybach/.test(t)) return 'Sedan';
    if (/off.?road|4x4|jeep|g.class|g wagon/.test(t)) return 'Off-Road / 4x4';
    if (v.vehicleType === 'Utility') return 'Utility';
    return 'Unknown';
  }

  function classifyPerformance(v) {
    const t = norm([v.name,v.category,v.subtype,v.brand,v.vehicleType].join(' '));
    if (/ambulance|ems|police|sheriff|bearcat|prison|fire|rescue|emergency/.test(t) || ['EMS','POLICE','GOVERNMENT'].includes(upper(v.department))) return 'Emergency / Fleet';
    if (/drag|drag racing|dragster/.test(t)) return 'Drag Racing';
    if (/race|racing|track|gtr|gt3|gt2|gt4/.test(t)) return 'Race / Track';
    if (/hypercar|chiron|jesko|senna|fenyr|gemera|fxx|amg one|p1 gtr/.test(t)) return 'Hypercar';
    if (/supercar|ferrari|lamborghini|mclaren|r8|nsx|f40|812|performante|huracan|aventador|svj/.test(t)) return 'Supercar';
    if (/electric|tesla|taycan|polestar|e tron|model 3|model s|model x|mach e|roadster/.test(t)) return 'Electric';
    if (/hybrid|sf90|sian|polestar/.test(t)) return 'Hybrid';
    if (/muscle|mustang|camaro|charger|hellcat|boss429|mach 1|gto/.test(t)) return 'Muscle';
    if (/off.?road|trackhawk|trx|tundra|jeep|4x4/.test(t)) return 'Off-Road';
    if (/classic|vintage|old|e39|e36|e46|w140|1965|1966|monte/.test(t)) return 'Classic / Vintage';
    if (/modified|custom|mansory|rmod|hycade|prior|brabus|widebody|varis/.test(t)) return 'Modified / Custom';
    if (/luxury|maybach|rolls royce|bentley|phantom|ghost|wraith|s.class|continental gt/.test(t)) return 'Luxury';
    if (/sports|sport|m4|m5|m3|911|supra|rx7|silvia|skyline|rs6|rs7|rsq8|amg|civic type r|evo|370z/.test(t)) return 'Sports';
    if (v.vehicleType === 'Car' && !/unknown|identification pending/.test(t)) return 'Economy / Standard';
    return 'Unknown';
  }

  function ensureGroup(id, label, controlHTML, hint='') {
    const panel = document.querySelector('.filter-panel');
    if (!panel || document.getElementById(id)) return null;
    const group = document.createElement('div');
    group.className = 'filter-group pro-filter-group';
    group.dataset.proFilter = id;
    group.innerHTML = `<label for="${id}">${label}</label>${controlHTML}${hint ? `<small class="pro-filter-hint">${hint}</small>` : ''}`;
    const resetGroup = document.getElementById('reset-filters-btn')?.closest('.filter-header');
    const anchor = document.getElementById('access-filter')?.closest('.filter-group');
    if (anchor) panel.insertBefore(group, anchor);
    else if (resetGroup?.nextElementSibling) panel.insertBefore(group, resetGroup.nextElementSibling);
    else panel.appendChild(group);
    return group;
  }

  function buildBrandModelOptions() {
    const brands = [...new Set(records.map(v => String(v.brand || '').trim()).filter(b => b && !/^custom$/i.test(b)))].sort((a,b)=>a.localeCompare(b));
    const models = [...new Set(records.map(v => String(v.name || '').trim()).filter(n => n && !/identification pending/i.test(n)))].sort((a,b)=>a.localeCompare(b));
    const brand = document.getElementById(FILTERS.brand);
    const model = document.getElementById(FILTERS.model);
    if (brand) brand.innerHTML = `<option value="ALL">All Manufacturers</option>${brands.map(b=>`<option value="${esc(b)}">${esc(b)}</option>`).join('')}`;
    if (model) model.innerHTML = `<option value="ALL">All Models</option>${models.map(m=>`<option value="${esc(m)}">${esc(m)}</option>`).join('')}`;
  }

  function buildUI() {
    const panel = document.querySelector('.filter-panel');
    if (!panel) return;

    // Remove the old overlapping taxonomy controls. Their underlying IDs stay hidden for compatibility with app.js.
    ['subtype-filter','category-filter'].forEach(id => document.getElementById(id)?.closest('.filter-group')?.classList.add('pro-legacy-hidden'));

    const accessLabel = document.querySelector('label[for="access-filter"]');
    if (accessLabel) accessLabel.textContent = 'Spawn Access';
    const typeLabel = document.querySelector('label[for="type-filter"]');
    if (typeLabel) typeLabel.textContent = 'Vehicle Class';
    const deptLabel = document.querySelector('label[for="department-filter"]');
    if (deptLabel) deptLabel.textContent = 'Department';
    const statusLabel = document.querySelector('label[for="status-filter"]');
    if (statusLabel) statusLabel.textContent = 'Verification';

    ensureGroup(FILTERS.brand,'Manufacturer',`<select id="${FILTERS.brand}"><option>Loading…</option></select>`,`Filter by the vehicle manufacturer, not its department.`);
    ensureGroup(FILTERS.model,'Model',`<select id="${FILTERS.model}"><option>Loading…</option></select>`,`Exact model / vehicle name.`);
    ensureGroup(FILTERS.body,'Body Style',`<select id="${FILTERS.body}"><option value="ALL">All Body Styles</option>${bodyStyles.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('')}</select>`);
    ensureGroup(FILTERS.performance,'Performance / Use',`<select id="${FILTERS.performance}"><option value="ALL">All Classes</option>${performanceClasses.map(x=>`<option value="${esc(x)}">${esc(x)}</option>`).join('')}</select>`);

    buildBrandModelOptions();
  }

  function selected(id) { return document.getElementById(id)?.value || 'ALL'; }

  function apply() {
    const brand = norm(selected(FILTERS.brand));
    const model = norm(selected(FILTERS.model));
    const body = norm(selected(FILTERS.body));
    const performance = norm(selected(FILTERS.performance));
    const grid = document.getElementById('vehicle-grid');
    if (!grid) return;

    const cards = [...grid.querySelectorAll('.vehicle-card')];
    cards.forEach(card => {
      const code = card.querySelector('.spawn-code-text')?.textContent.trim();
      const v = records.find(x => x.code === code);
      if (!v) return;
      const matchesBrand = brand === 'all' || norm(v.brand) === brand;
      const matchesModel = model === 'all' || norm(v.name) === model;
      const matchesBody = body === 'all' || norm(classifyBody(v)) === body;
      const matchesPerformance = performance === 'all' || norm(classifyPerformance(v)) === performance;
      const visible = matchesBrand && matchesModel && matchesBody && matchesPerformance;
      card.style.display = visible ? '' : 'none';
    });

    const count = cards.filter(c => c.style.display !== 'none').length;
    const results = document.getElementById('results-count');
    if (results && (brand !== 'all' || model !== 'all' || body !== 'all' || performance !== 'all')) results.textContent = `Showing ${count} matching vehicle${count === 1 ? '' : 's'}`;
  }

  function scheduleApply() {
    clearTimeout(timer);
    timer = setTimeout(apply, 20);
  }

  function install() {
    fetch('./data/vehicles.json', {cache:'no-store'})
      .then(r => r.ok ? r.json() : [])
      .then(data => {
        records = Array.isArray(data) ? data : [];
        buildUI();
        [FILTERS.brand,FILTERS.model,FILTERS.body,FILTERS.performance].forEach(id => document.getElementById(id)?.addEventListener('change', scheduleApply));
        document.getElementById('reset-filters-btn')?.addEventListener('click', () => setTimeout(() => {
          [FILTERS.brand,FILTERS.model,FILTERS.body,FILTERS.performance].forEach(id => { const el=document.getElementById(id); if(el) el.value='ALL'; });
          scheduleApply();
        }, 0));

        const grid = document.getElementById('vehicle-grid');
        if (grid) {
          const observer = new MutationObserver(scheduleApply);
          observer.observe(grid, {childList:true});
        }
        scheduleApply();
      })
      .catch(() => buildUI());
  }

  document.addEventListener('DOMContentLoaded', install);
})();

(() => {
  'use strict';

  const VERIFIED = {
    '1016rwdevo': { name: 'Lamborghini Huracan EVO', brand: 'Lamborghini', year: '2018', source: 'FiveMRides', sourceUrl: 'https://fivemrides.com/product/lamborghini-huracan-2018-blackedout/' },
    '2019m5': { name: 'BMW M5 F90 Competition', brand: 'BMW', year: '2019', source: 'GTA5-Mods', sourceUrl: 'https://www.gta5-mods.com/vehicles/2019-bmw-m5-f90-competition-add-on' },
    'DLM5EMS': { name: 'BMW M5 EMS', brand: 'BMW', year: '—', source: 'FiveMRides', sourceUrl: 'https://fivemrides.com/product/ems-debadged-car-pack-11-vehicles/' },
    'DLM7EMS': { name: 'BMW M7 EMS', brand: 'BMW', year: '—', source: 'FiveMRides', sourceUrl: 'https://fivemrides.com/product/ems-debadged-car-pack-11-vehicles/' },
    'DLX5EMS': { name: 'BMW X5 EMS', brand: 'BMW', year: '—', source: 'GTA5-Mods', sourceUrl: 'https://no.gta5-mods.com/paintjobs/bmw-x5-ambulance-rapid-response-vehicle-skin' },
    'DLRS6EMS': { name: 'Audi RS6 EMS', brand: 'Audi', year: '—', source: 'Goodara', sourceUrl: 'https://goodara.com/products/audi-rs6-ems-medic' },
    'DLRS7EMS': { name: 'Audi RS7 EMS', brand: 'Audi', year: '—', source: 'RoyalCustom', sourceUrl: 'https://www.royalcustom.shop/product-page/audi-rs7-ambulance-animated' },
    'DLRSQ8EMS': { name: 'Audi RS Q8 EMS', brand: 'Audi', year: '2021', source: 'LibertyCity', sourceUrl: 'https://libertycity.net/files/gta-5/227089-2021-audi-rsq8-ems.html' },
    'DLRAMEMS': { name: 'Dodge RAM EMS', brand: 'RAM', year: '2024', source: 'Othrin', sourceUrl: 'https://othrin.com/products/2024-generic-5500-bls-ambulance' },
    'DLAmbulance': { name: 'Dodge Ambulance', brand: 'Dodge', year: '—', source: 'FiveMRides', sourceUrl: 'https://fivemrides.com/product/ems-debadged-car-pack-11-vehicles/' },
    'DLAmbulance2': { name: 'Mercedes Ambulance', brand: 'Mercedes-Benz', year: '—', source: 'FiveMRides', sourceUrl: 'https://fivemrides.com/product/ems-debadged-car-pack-11-vehicles/' },
    'DLAmbulance3': { name: 'Transit Ambulance', brand: 'Ford', year: '—', source: 'FiveMRides', sourceUrl: 'https://fivemrides.com/product/ems-debadged-car-pack-11-vehicles/' },
    'DLYAMAHAEMS': { name: 'Yamaha EMS Bike', brand: 'Yamaha', year: '—', source: 'FiveMRides', sourceUrl: 'https://fivemrides.com/product/ems-debadged-car-pack-11-vehicles/' },
    'DLRS6': { name: 'Audi RS6 Avant', brand: 'Audi', year: '—', source: 'FiveMotive', sourceUrl: 'https://fivemotive.com/shop/vehicle-package' },
    'DL_RS7': { name: 'Audi RS7', brand: 'Audi', year: '—', source: 'FiveMotive', sourceUrl: 'https://fivemotive.com/shop/vehicle-package' },
    '21rsq8': { name: 'Audi RS Q8', brand: 'Audi', year: '2021', source: 'FiveMotive', sourceUrl: 'https://fivemotive.com/shop/vehicle-package' },
    'audirs8': { name: 'Audi R8', brand: 'Audi', year: '—', source: 'Server mapping', sourceUrl: 'https://fivemotive.com/shop/vehicle-package' },
    'c8': { name: 'Chevrolet Corvette C8', brand: 'Chevrolet', year: '2020–', source: 'Vehicle mapping', sourceUrl: 'https://www.gtabase.com/grand-theft-auto-v/vehicles/' },
    'c8p1': { name: 'Chevrolet Corvette C8 Widebody', brand: 'Chevrolet', year: '2020–', source: 'Vehicle mapping', sourceUrl: 'https://www.gtabase.com/grand-theft-auto-v/vehicles/' },
    'cb650r': { name: 'Honda CB650R', brand: 'Honda', year: '2019–', source: 'Vehicle mapping', sourceUrl: 'https://www.gtacars.net/' },
    'BOSS429': { name: 'Ford Mustang Boss 429', brand: 'Ford', year: '1969–1970', source: 'GTA5-Mods', sourceUrl: 'https://www.gta5-mods.com/' },
    '18performante': { name: 'Lamborghini Huracan Performante', brand: 'Lamborghini', year: '2018', source: 'GTA5-Mods', sourceUrl: 'https://www.gta5-mods.com/' },
    '600ltwb': { name: 'McLaren 720S / Zacoe', brand: 'McLaren', year: '—', source: 'FiveMGG', sourceUrl: 'https://fivem.gg/' }
  };

  const CATEGORY_HINTS = ['sedan','SUV','coupe','hatchback','wagon','supercar','hypercar','electric','muscle','pickup','van','motorcycle','police','EMS','government','drag','classic','luxury','sports car','modified','emergency'];

  const style = document.createElement('style');
  style.textContent = `
    .fatality-pro-bar{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:0 0 14px;padding:12px;border:1px solid rgba(0,194,255,.18);background:rgba(22,24,28,.86);border-radius:12px;backdrop-filter:blur(8px)}
    .fatality-pro-stat{padding:8px 11px;border-radius:9px;border:1px solid rgba(255,255,255,.08);color:#aeb8c6;font-size:12px}.fatality-pro-stat b{color:#fff}
    .fatality-pro-actions{margin-left:auto;display:flex;gap:7px;flex-wrap:wrap}.fatality-pro-select,.fatality-pro-btn{background:#11151c;color:#fff;border:1px solid #28313d;border-radius:8px;padding:8px 10px;font-size:12px;cursor:pointer}.fatality-pro-btn:hover{border-color:#00c2ff;box-shadow:0 0 14px rgba(0,194,255,.15)}
    .pro-verified{background:rgba(53,208,127,.12)!important;color:#35d07f!important;border-color:rgba(53,208,127,.25)!important}.pro-review{background:rgba(244,185,66,.11)!important;color:#f4b942!important;border-color:rgba(244,185,66,.24)!important}
    .pro-source{display:inline-flex;align-items:center;gap:5px;margin-left:6px;font-size:10px;color:#00c2ff;text-decoration:none}.pro-source:hover{text-decoration:underline}
    .pro-research-banner{display:none;margin:0 0 12px;padding:12px;border-radius:10px;border:1px dashed rgba(244,185,66,.35);background:rgba(244,185,66,.06);color:#d8dee8;font-size:12px}.pro-research-banner.show{display:block}
    .vehicle-grid.pro-list .vehicle-card{display:grid;grid-template-columns:220px 1fr}.vehicle-grid.pro-list .card-image-wrapper{height:100%;min-height:180px}.vehicle-grid.pro-list .card-body{display:flex;flex-direction:column;justify-content:center}.vehicle-grid.pro-list .details-grid{grid-template-columns:repeat(3,minmax(0,1fr))}
    @media(max-width:800px){.vehicle-grid.pro-list .vehicle-card{display:block}.fatality-pro-actions{margin-left:0}.vehicle-grid.pro-list .details-grid{grid-template-columns:1fr 1fr}}
  `;
  document.head.appendChild(style);

  function norm(s){return String(s||'').toLowerCase().trim()}
  function findCode(card){return String(card.querySelector('.spawn-code-text')?.textContent||'').trim()}
  function ensureBar(){
    const area=document.querySelector('.content-area');
    const grid=document.getElementById('vehicle-grid');
    if(!area||!grid||document.querySelector('.fatality-pro-bar')) return;
    const bar=document.createElement('div');
    bar.className='fatality-pro-bar';
    bar.innerHTML=`
      <div class="fatality-pro-stat">Database <b>461+</b></div>
      <div class="fatality-pro-stat">Verified <b id="pro-verified-count">0</b></div>
      <div class="fatality-pro-stat">Images <b id="pro-image-count">0</b></div>
      <div class="fatality-pro-stat">Favorites <b id="pro-fav-count">0</b></div>
      <div class="fatality-pro-actions">
        <select id="pro-sort" class="fatality-pro-select"><option value="relevance">Best Match</option><option value="az">A–Z</option><option value="za">Z–A</option><option value="brand">Brand</option><option value="year">Year</option></select>
        <button id="pro-view" class="fatality-pro-btn">☷ List View</button>
        <button id="pro-random" class="fatality-pro-btn">🎲 Random</button>
        <button id="pro-research" class="fatality-pro-btn">🔎 Research Mode</button>
      </div>`;
    area.insertBefore(bar,grid);
    const banner=document.createElement('div');
    banner.className='pro-research-banner';
    banner.id='pro-research-banner';
    banner.textContent='Research Mode: unverified/custom records are highlighted. Do not treat them as confirmed until a matching source or in-game reference is found.';
    area.insertBefore(banner,grid);

    document.getElementById('pro-view').onclick=()=>{grid.classList.toggle('pro-list');document.getElementById('pro-view').textContent=grid.classList.contains('pro-list')?'▦ Grid View':'☷ List View'};
    document.getElementById('pro-research').onclick=()=>{document.getElementById('pro-research-banner').classList.toggle('show');document.querySelectorAll('.vehicle-card').forEach(c=>{const verified=!!VERIFIED[findCode(c)];c.style.display=!document.getElementById('pro-research-banner').classList.contains('show')||!verified?'':'none'})};
    document.getElementById('pro-random').onclick=()=>{const cards=[...document.querySelectorAll('.vehicle-card')];if(!cards.length)return;const target=cards[Math.floor(Math.random()*cards.length)];target.scrollIntoView({behavior:'smooth',block:'center'});target.classList.add('pro-random-highlight');setTimeout(()=>target.classList.remove('pro-random-highlight'),1400)};
    document.getElementById('pro-sort').onchange=()=>sortCards(document.getElementById('pro-sort').value);
  }

  function sortCards(mode){
    const grid=document.getElementById('vehicle-grid'); if(!grid)return;
    const cards=[...grid.querySelectorAll('.vehicle-card')];
    const val=c=>{const v=VERIFIED[findCode(c)];return {name:norm(c.querySelector('.vehicle-title')?.textContent),brand:norm(c.querySelector('.details-grid p:nth-child(1)')?.textContent),year:norm(v?.year||c.textContent)}[mode]||''};
    cards.sort((a,b)=>mode==='za'?val(b).localeCompare(val(a)):val(a).localeCompare(val(b),undefined,{numeric:true}));
    cards.forEach(c=>grid.appendChild(c));
  }

  function decorate(){
    ensureBar();
    let verified=0,images=0;
    document.querySelectorAll('.vehicle-card').forEach(card=>{
      const code=findCode(card); const v=VERIFIED[code]; const img=card.querySelector('.vehicle-img');
      if(v){verified++;const title=card.querySelector('.vehicle-title');if(title&&(!title.textContent||/identification pending/i.test(title.textContent)))title.textContent=v.name; card.dataset.verified='1';let badge=card.querySelector('.pro-verified,.pro-review');if(!badge){badge=document.createElement('span');badge.className='badge pro-verified';badge.textContent='✓ VERIFIED';card.querySelector('.card-badges')?.appendChild(badge)} if(!card.querySelector('.pro-source')){const a=document.createElement('a');a.className='pro-source';a.href=v.sourceUrl;a.target='_blank';a.rel='noopener noreferrer';a.textContent='↗ '+v.source;card.querySelector('.card-body')?.appendChild(a)}}else{card.dataset.verified='0';if(!card.querySelector('.pro-review')){const b=document.createElement('span');b.className='badge pro-review';b.textContent='◌ NEEDS VERIFICATION';card.querySelector('.card-badges')?.appendChild(b)}}
      if(img&&!/^data:image/.test(img.currentSrc||img.src||''))images++;
    });
    const vc=document.getElementById('pro-verified-count');if(vc)vc.textContent=verified;
    const ic=document.getElementById('pro-image-count');if(ic)ic.textContent=images;
    const fc=document.getElementById('pro-fav-count');if(fc)fc.textContent=document.querySelectorAll('.fav-btn.active').length;
  }

  function observe(){const root=document.getElementById('vehicle-grid');if(!root)return;new MutationObserver(()=>setTimeout(decorate,50)).observe(root,{childList:true,subtree:true});setTimeout(decorate,100)}

  document.addEventListener('DOMContentLoaded',()=>{observe();document.addEventListener('keydown',e=>{if(e.key==='/'&&document.activeElement?.tagName!=='INPUT'){e.preventDefault();document.getElementById('search-input')?.focus()}if(e.key==='Escape'){document.getElementById('pro-research-banner')?.classList.remove('show')}})});
})();

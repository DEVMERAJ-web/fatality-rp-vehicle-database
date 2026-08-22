/*
 * Fatality Roleplay 2.0 - Online Vehicle Image Resolver
 * Finds an online reference image when a local vehicle image is missing.
 * The catalogue UI/data/filter logic remains untouched.
 */
(() => {
  'use strict';

  const CACHE_KEY = 'fatality_online_image_cache_v1';
  const QUERY_CACHE_KEY = 'fatality_online_query_cache_v1';

  const IMAGE_OVERRIDES = {
    // FiveM / GTA EMS references found online for matching spawn-code names.
    DLM5EMS: 'https://fivemgg.nyc3.digitaloceanspaces.com/fivem/2024/05/10084149/BMW-M5-Emergency-Services-FiveM-3.webp',
    DLRS7EMS: 'https://static.wixstatic.com/media/433ec0_d8e54d3364654f52a33392b77c6eebe8~mv2.png/v1/fill/w_980%2Ch_495%2Cal_c%2Cq_90%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/433ec0_d8e54d3364654f52a33392b77c6eebe8~mv2.png',
    DLX5EMS: 'https://img.gta5-mods.com/q75/images/bmw-x5-ambulance-rapid-response-vehicle-skin/788d8b-1.png',
    DLYAMAHAEMS: 'https://digitiallatvia.com/cdn/shop/files/2_13a81cf3-e870-4609-aa31-9aae2a4129d5.jpg?v=1704638952&width=3840',
    DLRS6EMS: 'https://digitiallatvia.com/cdn/shop/files/police-unmarked-car-pack-10-vehicles-564918.jpg?v=1715292153',
    DLRSQ8EMS: 'https://img.gta5-mods.com/q95/images/mansory-audi-rsq8/8c15af-GTA5_2021-06-11_13-29-06.png',
    DLAmbulance: 'https://img.gta5-mods.com/q95/images/sams-speedo-express-ambulance-minipack-vehicles-eup-lore-friendly-add-on/ce59e0-20200416000956_1.jpg',
    DLAmbulance2: 'https://digitiallatvia.com/cdn/shop/files/ems-pack-v2-5-vehicles-469678.jpg?v=1715292151',
    DLAmbulance3: 'https://i.etsystatic.com/31572011/r/il/a9f827/5000406406/il_fullxfull.5000406406_8axe.jpg',
    dlambulance: 'https://img.gta5-mods.com/q95/images/sams-speedo-express-ambulance-minipack-vehicles-eup-lore-friendly-add-on/ce59e0-20200416000956_1.jpg',
    dlambulance2: 'https://digitiallatvia.com/cdn/shop/files/ems-pack-v2-5-vehicles-469678.jpg?v=1715292151',
    dlambuance3: 'https://i.etsystatic.com/31572011/r/il/a9f827/5000406406/il_fullxfull.5000406406_8axe.jpg'
  };

  let imageCache = {};
  let queryCache = {};

  try {
    imageCache = JSON.parse(localStorage.getItem(CACHE_KEY) || '{}');
    if (!imageCache || typeof imageCache !== 'object') imageCache = {};
  } catch (_) {
    imageCache = {};
  }

  try {
    queryCache = JSON.parse(localStorage.getItem(QUERY_CACHE_KEY) || '{}');
    if (!queryCache || typeof queryCache !== 'object') queryCache = {};
  } catch (_) {
    queryCache = {};
  }

  const saveCache = () => {
    try {
      localStorage.setItem(CACHE_KEY, JSON.stringify(imageCache));
      localStorage.setItem(QUERY_CACHE_KEY, JSON.stringify(queryCache));
    } catch (_) {}
  };

  const clean = value => String(value || '').replace(/\s+/g, ' ').trim();

  function getVehicleInfo(img) {
    const card = img.closest('.vehicle-card');
    if (card) {
      const code = clean(card.querySelector('.spawn-code-text')?.textContent);
      const name = clean(card.querySelector('.vehicle-title')?.textContent);
      const details = [...card.querySelectorAll('.details-grid p')].map(p => clean(p.textContent));
      const brand = clean(details.find(x => /^Brand:/i.test(x))?.replace(/^Brand:\s*/i, ''));
      const subtype = clean(details.find(x => /^Subtype:/i.test(x))?.replace(/^Subtype:\s*/i, ''));
      return { code, name, brand, subtype };
    }

    const modal = document.getElementById('modal-body');
    if (modal && img.closest('.modal-img-wrapper')) {
      const code = clean(modal.querySelector('.modal-table tr:first-child td:nth-child(2)')?.textContent);
      const name = clean(modal.querySelector('.modal-header-info h2')?.textContent || img.alt);
      const rows = [...modal.querySelectorAll('.modal-table tr')];
      const getRow = label => {
        const row = rows.find(r => clean(r.children[0]?.textContent).toLowerCase() === label.toLowerCase());
        return clean(row?.children[1]?.textContent);
      };
      return { code, name, brand: getRow('Brand'), subtype: getRow('Subtype') };
    }

    return { code: '', name: clean(img.alt), brand: '', subtype: '' };
  }

  function overrideFor(code) {
    if (!code) return '';
    return IMAGE_OVERRIDES[code] || IMAGE_OVERRIDES[code.toUpperCase()] || '';
  }

  function useful(value) {
    const v = clean(value).toLowerCase();
    return v && !['custom', 'identification pending', '—', '-'].includes(v);
  }

  async function searchCommons(query) {
    const cacheKey = query.toLowerCase();
    if (queryCache[cacheKey]) return queryCache[cacheKey];

    const url = 'https://commons.wikimedia.org/w/api.php?action=query&generator=search&gsrnamespace=6&gsrlimit=8&gsrsearch=' +
      encodeURIComponent(query) +
      '&prop=imageinfo&iiprop=url|mime&iiurlwidth=1000&format=json&origin=*';

    try {
      const response = await fetch(url, { mode: 'cors' });
      if (!response.ok) return '';
      const data = await response.json();
      const pages = Object.values(data?.query?.pages || {});

      const usable = pages.find(page => {
        const title = String(page.title || '').toLowerCase();
        const mime = String(page.imageinfo?.[0]?.mime || '').toLowerCase();
        return mime.startsWith('image/') && !/logo|icon|flag|map|diagram|screenshot/.test(title);
      });

      const image = usable?.imageinfo?.[0]?.thumburl || usable?.imageinfo?.[0]?.url || '';
      if (image) {
        queryCache[cacheKey] = image;
        saveCache();
      }
      return image;
    } catch (_) {
      return '';
    }
  }

  async function resolveImage(info) {
    const code = clean(info.code);
    const forced = overrideFor(code);
    if (forced) return forced;
    if (imageCache[code]) return imageCache[code];

    if (!useful(info.name) && !useful(info.brand)) return '';

    const parts = [];
    if (useful(info.brand)) parts.push(info.brand);
    if (useful(info.name)) parts.push(info.name);
    if (useful(info.subtype) && /ems|police|ambulance|emergency/i.test(info.subtype)) parts.push('emergency vehicle');
    parts.push('vehicle');

    const query = parts.join(' ');
    const image = await searchCommons(query);
    if (image && code) {
      imageCache[code] = image;
      saveCache();
    }
    return image;
  }

  const resolving = new WeakSet();

  async function rescue(img) {
    if (!(img instanceof HTMLImageElement)) return;
    if (img.dataset.onlineResolved === '1' || resolving.has(img)) return;
    resolving.add(img);

    const info = getVehicleInfo(img);
    const url = await resolveImage(info);

    if (url) {
      img.dataset.onlineResolved = '1';
      img.onerror = null;
      img.src = url;
    }

    resolving.delete(img);
  }

  // Intercept local-image failures before the inline fallback handler.
  document.addEventListener('error', event => {
    const target = event.target;
    if (!(target instanceof HTMLImageElement)) return;
    if (!target.classList.contains('vehicle-img') && !target.closest('.modal-img-wrapper')) return;
    if (target.dataset.onlineResolved === '1') return;
    event.stopImmediatePropagation();
    rescue(target);
  }, true);

  // Cards and modal contents are rendered dynamically by app.js.
  const observer = new MutationObserver(mutations => {
    for (const mutation of mutations) {
      for (const node of mutation.addedNodes) {
        if (!(node instanceof Element)) continue;
        const images = node.matches?.('img') ? [node] : [...node.querySelectorAll?.('img') || []];
        images.forEach(img => {
          if (img.classList.contains('vehicle-img') || img.closest('.modal-img-wrapper')) {
            // Give local files priority. The online lookup only happens when the local image errors.
            img.dataset.onlineLoader = '1';
          }
        });
      }
    }
  });

  observer.observe(document.documentElement, { childList: true, subtree: true });
})();

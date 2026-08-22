/* Fatality RP 2.0 - Vehicle image resolver
   UI/CSS/filter logic stays untouched.
   EMS vehicles use FiveM/GTA V references first when available.
*/
(() => {
  const PREFERRED_IMAGES = {
    // EMS cars / bikes
    DLM5EMS: 'https://fivemgg.nyc3.digitaloceanspaces.com/fivem/2024/05/10084128/BMW-M5-Emergency-Services-FiveM-2.webp',
    DLRS7EMS: 'https://lunardev.co.uk/cdn/shop/files/Desktop_Screenshot_2023.04.23_-_12.39.59.28_65adac75-cb62-4e59-84da-563d3cb9e3d1.png?v=1690562448',
    DLRSQ8EMS: 'https://fivemdealership.net/cdn/shop/files/GTA5_2024-03-17_06-32-16.png?v=1711560941&width=1100',
    DLX5EMS: 'https://img.gta5-mods.com/q75/images/bmw-x5-ambulance-rapid-response-vehicle-skin/788d8b-1.png',
    DLRAMEMS: 'https://othrin.com/cdn/shop/files/Screenshot_27.png?v=1748310788&width=1646',
    DLYAMAHAEMS: 'https://digitiallatvia.com/cdn/shop/files/2_13a81cf3-e870-4609-aa31-9aae2a4129d5.jpg?v=1704638952&width=3840',

    // EMS ambulances — mapped separately so an ambulance can NEVER inherit
    // the Yamaha EMS image.
    // DLAmbulance = Dodge/RAM-style ambulance reference
    DLAmbulance: 'https://ultimate-mods.com/uploads/monthly_2025_12/Screenshot_4.png.2cd7abe86fcec1125a2db9785998473b.png',

    // DLAmbulance2 = Mercedes-Benz Sprinter ambulance reference
    DLAmbulance2: 'https://img.gta5-mods.com/q95/images/mercedes-benz-sprinter-otaris-mount-zonah-medical-center/dbb8ad-GTA5%202016-09-16%2017-05-08-25.jpg',

    // DLAmbulance3 = Ford Transit ambulance reference
    DLAmbulance3: 'https://img.gta5-mods.com/q95/images/2016-ford-transit-ukraine-kiev-ambulance-ambulancia-kiev-ucrania-els-replace/9989e7-11_06_20200_38_01.jpg'
  };

  // Exact FiveM-focused searches for EMS codes without a stable direct image.
  const EMS_SEARCHES = {
    DLM7EMS: 'BMW M7 EMS ambulance FiveM GTA V',
    DLRS6EMS: 'Audi RS6 EMS ambulance FiveM GTA V'
  };

  const MARK = 'data-fatality-image-resolved';

  function clean(v) {
    return String(v || '').replace(/\s+/g, ' ').trim();
  }

  function bingImage(query) {
    return `https://tse1.mm.bing.net/th?q=${encodeURIComponent(query)}&w=1000&h=650&c=7&rs=1`;
  }

  function getCode(img) {
    const card = img.closest('.vehicle-card');
    if (card) return clean(card.querySelector('.spawn-code-text')?.textContent);

    const modal = img.closest('.modal-layout');
    if (modal) {
      const row = [...modal.querySelectorAll('.modal-table tr')]
        .find(r => clean(r.querySelector('td')?.textContent).toLowerCase() === 'spawn code');
      return clean(row?.querySelectorAll('td')[1]?.textContent);
    }

    return '';
  }

  function getSearchQuery(code, img) {
    if (EMS_SEARCHES[code]) return EMS_SEARCHES[code];

    const card = img.closest('.vehicle-card');
    if (!card) return `${code} FiveM GTA V vehicle`;

    const title = clean(card.querySelector('.vehicle-title')?.textContent);
    const details = [...card.querySelectorAll('.details-grid p')]
      .map(p => clean(p.textContent))
      .join(' ');

    return `${title} ${details} FiveM GTA V vehicle`;
  }

  function install() {
    document.querySelectorAll('img').forEach(img => {
      const code = getCode(img);
      if (!code || img.hasAttribute(MARK)) return;

      img.setAttribute(MARK, '1');

      const direct = PREFERRED_IMAGES[code];
      const online = direct || bingImage(getSearchQuery(code, img));
      if (!online) return;

      img.dataset.fatalityOriginalSrc = img.getAttribute('src') || '';
      img.src = `${online}${online.includes('?') ? '&' : '?'}fatality_v=20260822b`;

      img.addEventListener('error', () => {
        const original = img.dataset.fatalityOriginalSrc;
        if (original && !img.dataset.fatalityRestored) {
          img.dataset.fatalityRestored = '1';
          img.src = original;
        }
      }, { once: true });
    });
  }

  install();
  new MutationObserver(install).observe(document.body, { childList: true, subtree: true });
})();

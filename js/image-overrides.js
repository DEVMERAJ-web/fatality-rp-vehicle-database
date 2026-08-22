/* Fatality RP 2.0 - Vehicle image resolver
   UI/CSS/filter logic stays untouched.
   EMS vehicles use FiveM-specific references first when available.
*/
(() => {
  const PREFERRED_IMAGES = {
    // Exact/strong FiveM EMS references found online
    DLM5EMS: 'https://fivemgg.nyc3.digitaloceanspaces.com/fivem/2024/05/10084128/BMW-M5-Emergency-Services-FiveM-2.webp',
    DLRS7EMS: 'https://lunardev.co.uk/cdn/shop/files/Desktop_Screenshot_2023.04.23_-_12.39.59.28_65adac75-cb62-4e59-84da-563d3cb9e3d1.png?v=1690562448',
    DLRSQ8EMS: 'https://fivemdealership.net/cdn/shop/files/GTA5_2024-03-17_06-32-16.png?v=1711560941&width=1100',
    DLX5EMS: 'https://img.gta5-mods.com/q75/images/bmw-x5-ambulance-rapid-response-vehicle-skin/788d8b-1.png',
    DLRAMEMS: 'https://othrin.com/cdn/shop/files/Screenshot_27.png?v=1748310788&width=1646',
    DLYAMAHAEMS: 'https://digitiallatvia.com/cdn/shop/files/2_13a81cf3-e870-4609-aa31-9aae2a4129d5.jpg?v=1704638952&width=3840',

    // Van-style EMS references; exact server variants are not publicly indexed,
    // so all three server van codes use a confirmed FiveM EMS van image.
    DLAmbulance: 'https://dunb17ur4ymx4.cloudfront.net/wysiwyg/1198718/d1227951ef46f35cf4250a60228747e020c296ac.png',
    DLAmbulance2: 'https://dunb17ur4ymx4.cloudfront.net/wysiwyg/1198718/d1227951ef46f35cf4250a60228747e020c296ac.png',
    DLAmbulance3: 'https://dunb17ur4ymx4.cloudfront.net/wysiwyg/1198718/d1227951ef46f35cf4250a60228747e020c296ac.png'
  };

  // Exact FiveM-focused search terms for EMS entries where a stable direct image
  // was not available from the indexed results.
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
      img.src = online;

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

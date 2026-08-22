/* Fatality RP 2.0 - Online vehicle image layer
   Keeps the existing HTML/CSS/filter UI untouched.
   1) Use a specific known FiveM/reference image when available.
   2) Otherwise, if the catalogue image is missing, request a Bing image thumbnail
      using the vehicle's real name/brand/code + FiveM/GTA V context.
   3) If the remote thumbnail also fails, the existing Fatality fallback remains.
*/
(() => {
  const IMAGE_OVERRIDES = {
    '2019m5': 'https://www.larevueautomobile.com/images/fiche-technique/2019/Bmw/Serie-5/M5/Bmw_Serie-5_M5_HD_1.jpg',
    'DLM5EMS': 'https://fivemgg.nyc3.digitaloceanspaces.com/fivem/2024/05/10084149/BMW-M5-Emergency-Services-FiveM-3.webp',
    'DL_rs6': 'https://autos.yahoo.com.tw/p/r/w1200/car-trim/October2020/b68a54b740dd393c302da9869ffb1c42.jpeg',
    'DLRS6EMS': 'https://autos.yahoo.com.tw/p/r/w1200/car-trim/October2020/b68a54b740dd393c302da9869ffb1c42.jpeg',
    'DL_RS7': 'https://mediacloud.carbuyer.co.uk/image/private/s--X-WVjvBW--/f_auto%2Ct_content-image-full-desktop%401/v1584466339/carbuyer/car_images/audirs7cutout2019.jpg',
    'DLRS7EMS': 'https://static.wixstatic.com/media/433ec0_d8e54d3364654f52a33392b77c6eebe8~mv2.png/v1/fill/w_980%2Ch_495%2Cal_c%2Cq_90%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/433ec0_d8e54d3364654f52a33392b77c6eebe8~mv2.png',
    'c8': 'https://images.ctfassets.net/uaddx06iwzdz/wnjcr2N1BgqnTxdh3L1zB/2fb554be41523ac249e8897edd7dc948/chevrolet_corvette_stingray_831.jpeg',
    'c8p1': 'https://images.ctfassets.net/uaddx06iwzdz/wnjcr2N1BgqnTxdh3L1zB/2fb554be41523ac249e8897edd7dc948/chevrolet_corvette_stingray_831.jpeg',
    'cb650r': 'https://www.motochecker.at/beitrag/1288-honda-cb-650-r?fullsize=1&image=9932',
    'DLX5EMS': 'https://www.24auto.de/bilder/2020/04/29/90001697/6330-fahraufnahme-eines-bmw-x5-weiss-der-generation-g05-2CzcX7ssFYMH.jpg',
    'DLYAMAHAEMS': 'https://img.goodfon.com/original/5184x3456/1/37/yamaha-yzf-r1-red-white.jpg',
    'DLAmbulance': 'https://i.etsystatic.com/31572011/r/il/a9f827/5000406406/il_fullxfull.5000406406_8axe.jpg',
    'DLAmbulance2': 'https://i.etsystatic.com/31572011/r/il/a9f827/5000406406/il_fullxfull.5000406406_8axe.jpg',
    'DLAmbulance3': 'https://i.etsystatic.com/31572011/r/il/a9f827/5000406406/il_fullxfull.5000406406_8axe.jpg'
  };

  const FALLBACK_MARK = 'data-fatality-online-bound';
  const CODE_MARK = 'data-fatality-code';

  function clean(value) {
    return String(value || '').replace(/\s+/g, ' ').trim();
  }

  function getCardVehicle(img) {
    const card = img.closest('.vehicle-card');
    if (!card) return null;

    const code = clean(card.querySelector('.spawn-code-text')?.textContent);
    const name = clean(card.querySelector('.vehicle-title')?.textContent);
    const details = [...card.querySelectorAll('.details-grid p')].map(p => clean(p.textContent));
    const detailText = details.join(' ');
    const access = clean(card.querySelector('.badge-access, .badge-access-admin')?.textContent);

    return { code, name, detailText, access };
  }

  function getModalVehicle(img) {
    const modal = img.closest('.modal-layout');
    if (!modal) return null;

    const rows = [...modal.querySelectorAll('.modal-table tr')];
    const map = {};
    rows.forEach(row => {
      const cells = row.querySelectorAll('td');
      if (cells.length >= 2) map[clean(cells[0].textContent)] = clean(cells[1].textContent);
    });

    return {
      code: map['Spawn Code'] || '',
      name: clean(modal.querySelector('.modal-header-info h2')?.textContent),
      detailText: Object.values(map).join(' '),
      access: map['Access'] || ''
    };
  }

  function buildQuery(vehicle) {
    const text = `${vehicle.name} ${vehicle.detailText}`.toLowerCase();
    const unknown = !vehicle.name || /identification pending/i.test(vehicle.name);

    let query;
    if (unknown) {
      query = `${vehicle.code} FiveM GTA V vehicle`;
    } else {
      query = `${vehicle.name} ${vehicle.detailText} FiveM GTA V`;
    }

    if (/ems|ambulance|medical|rescue/.test(text)) query += ' EMS emergency vehicle';
    else if (/police|sheriff|pd/.test(text)) query += ' police vehicle';
    else if (/motorcycle|bike|ninja|yamaha|honda|kawasaki|bmw motorrad/.test(text)) query += ' motorcycle';
    else if (/boat|marine|yacht/.test(text)) query += ' boat';
    else if (/helicopter|heli/.test(text)) query += ' helicopter';
    else if (/plane|aircraft|jet/.test(text)) query += ' aircraft';
    else query += ' car';

    return clean(query);
  }

  function bingThumbnail(query) {
    return `https://tse1.mm.bing.net/th?q=${encodeURIComponent(query)}&w=900&h=600&c=7&rs=1`;
  }

  function isFallback(src) {
    return !src || src.startsWith('data:image/svg+xml');
  }

  function attachRemoteFallback(img, vehicle) {
    if (!vehicle?.code || img.hasAttribute(FALLBACK_MARK)) return;

    img.setAttribute(FALLBACK_MARK, '1');
    img.setAttribute(CODE_MARK, vehicle.code);

    const remote = bingThumbnail(buildQuery(vehicle));
    const originalError = img.onerror;

    img.addEventListener('error', () => {
      if (img.dataset.fatalityRemoteFailed === '1') return;
      img.dataset.fatalityRemoteFailed = '1';
      img.src = `data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="600" height="360" viewBox="0 0 600 360"><rect width="600" height="360" fill="%2316181C"/><text x="300" y="180" text-anchor="middle" dominant-baseline="middle" fill="%2300C2FF" font-family="Arial" font-size="24" font-weight="700">FATALITY 2.0 - NO IMAGE</text></svg>`;
    }, { once: true });

    if (isFallback(img.getAttribute('src'))) {
      img.src = remote;
    } else {
      img.addEventListener('error', () => {
        if (!img.dataset.fatalityRemoteAttempted) {
          img.dataset.fatalityRemoteAttempted = '1';
          img.src = remote;
        }
      }, { once: true });
    }

    if (originalError && img.onerror) {
      // Keep the existing inline fallback behavior; our listener handles the remote retry.
    }
  }

  function applyKnownOverride(img, code) {
    const replacement = IMAGE_OVERRIDES[code];
    if (!replacement) return false;

    if (img.dataset.fatalityImageOverride !== replacement) {
      img.dataset.fatalityImageOverride = replacement;
      img.src = replacement;
    }
    return true;
  }

  function install() {
    document.querySelectorAll('img').forEach(img => {
      const vehicle = getCardVehicle(img) || getModalVehicle(img);
      if (!vehicle?.code) return;

      if (applyKnownOverride(img, vehicle.code)) return;
      attachRemoteFallback(img, vehicle);
    });
  }

  install();

  const observer = new MutationObserver(() => install());
  observer.observe(document.body, { childList: true, subtree: true });
})();

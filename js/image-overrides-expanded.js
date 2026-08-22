/* Fatality RP 2.0 - expanded online vehicle image references. */
(() => {
  const MORE = {
    '22g63': 'https://fivem-mods.com/cdn/shop/products/0lRjfgt.png?v=1646607908',
    'DL_G900': 'https://fivem-mods.com/cdn/shop/products/0lRjfgt.png?v=1646607908',
    'g63c': 'https://fivem-mods.com/cdn/shop/products/0lRjfgt.png?v=1646607908',
    'G63Sam': 'https://fivem-mods.com/cdn/shop/products/0lRjfgt.png?v=1646607908',
    'bentaygam': 'https://digitiallatvia.com/cdn/shop/files/bentley-bentayga-debadged-845333.jpg?v=1715291783',
    'contgt2011': 'https://thegaragefivem.com/cdn/shop/files/1_29fd3ab3-2f76-4f9b-99f9-98ea32ee8c80.png?v=1762515730',
    'cayen19': 'https://digitiallatvia.com/cdn/shop/files/1_4_0e587606-cb36-4a27-8502-a1111af37a01.jpg?v=1717955930&width=1946',
    'cayennemecqq': 'https://digitiallatvia.com/cdn/shop/files/1_4_0e587606-cb36-4a27-8502-a1111af37a01.jpg?v=1717955930&width=1946',
    '2f2fgtr34': 'https://img.gta5-mods.com/q75/images/2017-nissan-gtr-r35-add-on-fivem-template-lods/145cd1-20210227230701_1.jpg',
    'rmodgtr': 'https://img.gta5-mods.com/q75/images/2017-nissan-gtr-r35-add-on-fivem-template-lods/145cd1-20210227230701_1.jpg',
    'ncsbmwm8': 'https://img.gta5-mods.com/q95/images/bmw-m850i-add-on-no-interior-a3813b80-5386-4c93-a703-d9c78edd33a9/1bb401-5.jpg',
    'bmw8mm': 'https://img.gta5-mods.com/q95/images/bmw-m850i-add-on-no-interior-a3813b80-5386-4c93-a703-d9c78edd33a9/1bb401-5.jpg',
    'rmodm4': 'https://digitiallatvia.com/cdn/shop/files/bmw-m4-2018-718349.jpg?v=1715291710',
    'ckbmwm4offwhite': 'https://digitiallatvia.com/cdn/shop/files/bmw-m4-2018-718349.jpg?v=1715291710',
    'rmodm4gts': 'https://digitiallatvia.com/cdn/shop/files/bmw-m4-2018-718349.jpg?v=1715291710',
    'c63hr': 'https://img.gta5-mods.com/q95/images/2012-mercedes-benz-c63-amg-coupe-black-series-handling/8b1dc4-mbc63amg3.png',
    'c63scpd': 'https://img.gta5-mods.com/q95/images/2012-mercedes-benz-c63-amg-coupe-black-series-handling/8b1dc4-mbc63amg3.png',
    'carrera19': 'https://digitiallatvia.com/cdn/shop/files/porsche-911-992-gt3-766808.jpg?v=1717928151&width=1946',
    'por911gt3': 'https://digitiallatvia.com/cdn/shop/files/porsche-911-992-gt3-766808.jpg?v=1717928151&width=1946',
    'BOSS429': 'https://img.gta5-mods.com/q95/images/1969-ford-mustang-boss-426/f44e25-13%20-%20qswKSBh.jpg',
    '18performante': 'https://img.gta5-mods.com/q95/images/lamborghini-huracan-performante/39f58c-18920495_1236996833075994_5100943503061498597_n.jpg',
    '1016rwdevo': 'https://img.gta5-mods.com/q95/images/lamborghini-huracan-performante/39f58c-18920495_1236996833075994_5100943503061498597_n.jpg',
    '600ltwb': 'https://fivemgg.nyc3.digitaloceanspaces.com/fivem/2024/05/31051402/Mclaren-720s-Zacoe-Car-FiveM-2.webp',
    'rmodsvj': 'https://img.gta5-mods.com/q95/images/lamborghini-huracan-performante/39f58c-18920495_1236996833075994_5100943503061498597_n.jpg',
    'c8': 'https://fivemdealership.net/cdn/shop/files/image_2023-05-01_160735043.png?v=1682975264&width=1445',
    'c8p1': 'https://fivemdealership.net/cdn/shop/files/image_2023-05-01_160735043.png?v=1682975264&width=1445',
    'DLM5EMS': 'https://fivemgg.nyc3.digitaloceanspaces.com/fivem/2024/05/10084149/BMW-M5-Emergency-Services-FiveM-3.webp',
    'DLRS6EMS': 'https://dunb17ur4ymx4.cloudfront.net/packages/images/c52ef023eacb2bf8ad027d17501698e0f3fac553.png',
    'DLRS7EMS': 'https://static.wixstatic.com/media/433ec0_d8e54d3364654f52a33392b77c6eebe8~mv2.png/v1/fill/w_980%2Ch_495%2Cal_c%2Cq_90%2Cusm_0.66_1.00_0.01%2Cenc_avif%2Cquality_auto/433ec0_d8e54d3364654f52a33392b77c6eebe8~mv2.png',
    'DLX5EMS': 'https://img.gta5-mods.com/q75/images/bmw-x5-ambulance-rapid-response-vehicle-skin/788d8b-1.png',
    'DLYAMAHAEMS': 'https://digitiallatvia.com/cdn/shop/files/2_13a81cf3-e870-4609-aa31-9aae2a4129d5.jpg?v=1704638952&width=3840',
    'DLAmbulance': 'https://digitiallatvia.com/cdn/shop/files/2_13a81cf3-e870-4609-aa31-9aae2a4129d5.jpg?v=1704638952&width=3840',
    'DLAmbulance2': 'https://digitiallatvia.com/cdn/shop/files/2_13a81cf3-e870-4609-aa31-9aae2a4129d5.jpg?v=1704638952&width=3840',
    'DLAmbulance3': 'https://digitiallatvia.com/cdn/shop/files/2_13a81cf3-e870-4609-aa31-9aae2a4129d5.jpg?v=1704638952&width=3840'
  };

  const FALLBACK_MARK = 'data-fatality-expanded-image-bound';

  function codeFromCard(img) {
    const card = img.closest('.vehicle-card');
    return card?.querySelector('.spawn-code-text')?.textContent.trim() || '';
  }

  function apply() {
    document.querySelectorAll('.vehicle-card img.vehicle-img').forEach(img => {
      const code = codeFromCard(img);
      const src = MORE[code];
      if (!code || !src || img.dataset.fatalityExpanded === '1') return;
      img.dataset.fatalityExpanded = '1';
      img.src = src;
    });
  }

  apply();
  new MutationObserver(apply).observe(document.body, { childList: true, subtree: true });
})();

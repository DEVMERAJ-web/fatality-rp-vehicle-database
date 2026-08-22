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
    'DLM7EMS': 'https://digitiallatvia.com/cdn/shop/files/3_98cd40f6-80e3-448b-b2a8-a0845ae46a38.jpg?v=1704638953&width=2048',
    'M7EMS': 'https://digitiallatvia.com/cdn/shop/files/3_98cd40f6-80e3-448b-b2a8-a0845ae46a38.jpg?v=1704638953&width=2048',

    /* Exact Goodara RS6 EMS Medic image supplied by the user */
    'DLRS6EMS': 'https://cdn.goodara.com/img/audi-rs6-ems-medic.webp',
    'RS6EMS': 'https://cdn.goodara.com/img/audi-rs6-ems-medic.webp',
    'DLAudiRS6EMS': 'https://cdn.goodara.com/img/audi-rs6-ems-medic.webp',

    'DLRS7EMS': 'https://lunardev.co.uk/cdn/shop/files/Desktop_Screenshot_2023.04.23_-_12.40.24.61_a72c3d27-510e-4ee2-8f3f-6b43512b5124.png?v=1690562448&width=1445',
    'RS7EMS': 'https://lunardev.co.uk/cdn/shop/files/Desktop_Screenshot_2023.04.23_-_12.40.24.61_a72c3d27-510e-4ee2-8f3f-6b43512b5124.png?v=1690562448&width=1445',
    'DLAudiRS7EMS': 'https://lunardev.co.uk/cdn/shop/files/Desktop_Screenshot_2023.04.23_-_12.40.24.61_a72c3d27-510e-4ee2-8f3f-6b43512b5124.png?v=1690562448&width=1445',

    'DLRSQ8EMS': 'https://fivemdealership.net/cdn/shop/files/GTA5_2024-03-17_06-32-16.png?v=1711560941&width=1100',
    'DLX5EMS': 'https://img.gta5-mods.com/q75/images/bmw-x5-ambulance-rapid-response-vehicle-skin/788d8b-1.png',
    'DLRAMEMS': 'https://othrin.com/cdn/shop/files/Screenshot_27.png?v=1748310788&width=1646',
    'DLYAMAHAEMS': 'https://digitiallatvia.com/cdn/shop/files/2_13a81cf3-e870-4609-aa31-9aae2a4129d5.jpg?v=1704638952&width=3840',

    /* Correct EMS van mappings. These must NEVER point to the Yamaha image. */
    'DLAmbulance': 'https://img.gta5-mods.com/q95/images/sams-speedo-express-ambulance-minipack-vehicles-eup-lore-friendly-add-on/ce59e0-20200416000956_1.jpg?fatality=ambulance1',
    'DLAmbulance2': 'https://digitiallatvia.com/cdn/shop/files/ems-pack-v2-5-vehicles-469678.jpg?v=1715292151&fatality=ambulance2',
    'DLAmbulance3': 'https://i.etsystatic.com/31572011/r/il/a9f827/5000406406/il_fullxfull.5000406406_8axe.jpg?fatality=ambulance3',
    'dlambulance': 'https://img.gta5-mods.com/q95/images/sams-speedo-express-ambulance-minipack-vehicles-eup-lore-friendly-add-on/ce59e0-20200416000956_1.jpg?fatality=ambulance1',
    'dlambulance2': 'https://digitiallatvia.com/cdn/shop/files/ems-pack-v2-5-vehicles-469678.jpg?v=1715292151&fatality=ambulance2',
    'dlambuance3': 'https://i.etsystatic.com/31572011/r/il/a9f827/5000406406/il_fullxfull.5000406406_8axe.jpg?fatality=ambulance3'
  };

  function codeFromCard(img) {
    const card = img.closest('.vehicle-card');
    return card?.querySelector('.spawn-code-text')?.textContent.trim() || '';
  }

  function apply() {
    document.querySelectorAll('.vehicle-card img.vehicle-img').forEach(img => {
      const code = codeFromCard(img);
      const src = MORE[code];
      if (!code || !src) return;
      if (img.dataset.fatalityExpandedSrc === src) return;
      img.dataset.fatalityExpandedSrc = src;
      img.src = src;
    });
  }

  apply();
  new MutationObserver(apply).observe(document.body, { childList: true, subtree: true });
})();

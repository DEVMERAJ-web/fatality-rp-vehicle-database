/* Fatality RP 2.0 - Online reference image layer
   Keeps the existing HTML/CSS/vehicle database untouched.
   Server-specific EMS/modded variants use the closest real-vehicle reference.
*/
(() => {
  const IMAGE_OVERRIDES = {
    '2019m5': 'https://www.larevueautomobile.com/images/fiche-technique/2019/Bmw/Serie-5/M5/Bmw_Serie-5_M5_HD_1.jpg',
    'DLM5EMS': 'https://www.larevueautomobile.com/images/fiche-technique/2019/Bmw/Serie-5/M5/Bmw_Serie-5_M5_HD_1.jpg',
    'DL_rs6': 'https://autos.yahoo.com.tw/p/r/w1200/car-trim/October2020/b68a54b740dd393c302da9869ffb1c42.jpeg',
    'DLRS6EMS': 'https://autos.yahoo.com.tw/p/r/w1200/car-trim/October2020/b68a54b740dd393c302da9869ffb1c42.jpeg',
    'DL_RS7': 'https://mediacloud.carbuyer.co.uk/image/private/s--X-WVjvBW--/f_auto%2Ct_content-image-full-desktop%401/v1584466339/carbuyer/car_images/audirs7cutout2019.jpg',
    'c8': 'https://images.ctfassets.net/uaddx06iwzdz/wnjcr2N1BgqnTxdh3L1zB/2fb554be41523ac249e8897edd7dc948/chevrolet_corvette_stingray_831.jpeg',
    'c8p1': 'https://images.ctfassets.net/uaddx06iwzdz/wnjcr2N1BgqnTxdh3L1zB/2fb554be41523ac249e8897edd7dc948/chevrolet_corvette_stingray_831.jpeg',
    'cb650r': 'https://www.motochecker.at/beitrag/1288-honda-cb-650-r?fullsize=1&image=9932',
    'DLX5EMS': 'https://www.24auto.de/bilder/2020/04/29/90001697/6330-fahraufnahme-eines-bmw-x5-weiss-der-generation-g05-2CzcX7ssFYMH.jpg',
    'DLYAMAHAEMS': 'https://img.goodfon.com/original/5184x3456/1/37/yamaha-yzf-r1-red-white.jpg'
  };

  function install() {
    const images = document.querySelectorAll('img');

    images.forEach(img => {
      let code = '';
      const card = img.closest('.vehicle-card');
      if (card) {
        code = (card.querySelector('.spawn-code-text')?.textContent || '').trim();
      }

      if (!code) {
        const modal = img.closest('.modal-layout');
        if (modal) {
          code = (modal.querySelector('.modal-table tr:first-child td:nth-child(2)')?.textContent || '').trim();
        }
      }

      const replacement = IMAGE_OVERRIDES[code];
      if (replacement && img.dataset.fatalityImageOverride !== replacement) {
        img.dataset.fatalityImageOverride = replacement;
        img.src = replacement;
      }
    });
  }

  install();
  new MutationObserver(install).observe(document.body, { childList: true, subtree: true });
})();

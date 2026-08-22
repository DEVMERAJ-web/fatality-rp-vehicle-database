(() => {
  'use strict';

  const PANEL_ID = 'unknown-vehicles-panel';
  const FILTER_ID = 'identification-filter';
  let mode = 'NORMAL';
  let observer = null;
  let raf = 0;
  let applying = false;

  const isUnknown = (card) => {
    const status = (card.querySelector('.badge-status')?.textContent || '').trim().toLowerCase();
    const title = (card.querySelector('.vehicle-title')?.textContent || '').trim().toLowerCase();
    const brandText = [...card.querySelectorAll('.details-grid p')].find(p => /brand:/i.test(p.textContent))?.textContent.toLowerCase() || '';
    return status === 'unknown' || status === 'unverified' || title.includes('identification pending') || brandText.includes('custom');
  };

  const score = (card) => {
    const status = (card.querySelector('.badge-status')?.textContent || '').toLowerCase();
    if (status.includes('confirmed')) return 3;
    if (status.includes('likely')) return 2;
    if (status.includes('unknown') || status.includes('unverified')) return 0;
    return 1;
  };

  function ensureFilter() {
    const panel = document.querySelector('.filter-panel');
    if (!panel || document.getElementById(FILTER_ID)) return;
    const group = document.createElement('div');
    group.className = 'filter-group identification-filter-group';
    group.innerHTML = `<label for="${FILTER_ID}">Identification</label>
      <select id="${FILTER_ID}" aria-label="Choose normal vehicles or identification pending vehicles">
        <option value="NORMAL">✅ Normal Catalogue</option>
        <option value="PENDING">🔎 Show Identification Pending</option>
      </select>
      <small class="identification-filter-help">Pending vehicles stay hidden until this is enabled.</small>`;
    const speedGroup = document.getElementById('speed-filter')?.closest('.filter-group');
    if (speedGroup) panel.insertBefore(group, speedGroup);
    else panel.appendChild(group);
    document.getElementById(FILTER_ID).addEventListener('change', (e) => {
      mode = e.target.value;
      apply();
    });
  }

  function hideOrShowPanel() {
    const panel = document.getElementById(PANEL_ID);
    if (!panel) return;
    panel.hidden = mode !== 'PENDING';
    panel.setAttribute('aria-hidden', mode !== 'PENDING' ? 'true' : 'false');
  }

  function apply() {
    if (applying) return;
    hideOrShowPanel();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      if (applying) return;
      const grid = document.getElementById('vehicle-grid');
      if (!grid) return;
      applying = true;
      const cards = [...grid.querySelectorAll('.vehicle-card')];
      cards.forEach(card => {
        const unknown = isUnknown(card);
        card.style.display = (mode === 'PENDING' || !unknown) ? '' : 'none';
        card.dataset.identificationPending = unknown ? 'true' : 'false';
      });

      if (mode === 'NORMAL' && cards.length > 1) {
        const sorted = [...cards].sort((a, b) => score(b) - score(a));
        const sameOrder = sorted.every((card, i) => card === cards[i]);
        if (!sameOrder) {
          const fragment = document.createDocumentFragment();
          sorted.forEach(card => fragment.appendChild(card));
          grid.appendChild(fragment);
        }
      }
      applying = false;
    });
  }

  function install() {
    ensureFilter();
    hideOrShowPanel();
    apply();
    const grid = document.getElementById('vehicle-grid');
    if (grid && !observer) {
      observer = new MutationObserver((mutations) => {
        if (applying) return;
        if (mutations.some(m => m.addedNodes.length || m.removedNodes.length)) apply();
      });
      observer.observe(grid, { childList: true });
    }
  }

  document.addEventListener('DOMContentLoaded', install);
  window.addEventListener('load', install);
})();

(() => {
  'use strict';

  const PANEL_ID = 'unknown-vehicles-panel';
  const FILTER_ID = 'identification-filter';
  let mode = 'NORMAL';
  let observer = null;
  let raf = 0;

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
    group.innerHTML = `
      <label for="${FILTER_ID}">Identification</label>
      <select id="${FILTER_ID}" aria-label="Choose normal catalogue or identification queue">
        <option value="NORMAL">✅ Normal Catalogue</option>
        <option value="PENDING">🔎 Show Identification Pending</option>
      </select>
      <small class="identification-filter-help">Pending vehicles stay hidden until you enable this.</small>`;

    const speedGroup = document.getElementById('speed-filter')?.closest('.filter-group');
    if (speedGroup) panel.insertBefore(group, speedGroup);
    else panel.appendChild(group);

    document.getElementById(FILTER_ID).addEventListener('change', (e) => {
      mode = e.target.value === 'PENDING' ? 'PENDING' : 'NORMAL';
      window.dispatchEvent(new CustomEvent('fatality:identification-mode', { detail: { mode } }));
      apply();
    });
  }

  function togglePendingPanel() {
    const panel = document.getElementById(PANEL_ID);
    if (!panel) return;
    const pending = mode === 'PENDING';
    panel.hidden = !pending;
    panel.setAttribute('aria-hidden', pending ? 'false' : 'true');
    panel.style.display = pending ? '' : 'none';
  }

  function apply() {
    togglePendingPanel();
    cancelAnimationFrame(raf);
    raf = requestAnimationFrame(() => {
      const grid = document.getElementById('vehicle-grid');
      if (!grid) return;
      const cards = [...grid.querySelectorAll('.vehicle-card')];
      cards.forEach(card => {
        const unknown = isUnknown(card);
        // Normal mode: clean catalogue only. Pending mode: show ALL catalogue cards as-is;
        // the dedicated Unidentified Vehicles panel above contains the pending queue.
        card.style.display = mode === 'NORMAL' && unknown ? 'none' : '';
        card.dataset.identificationPending = unknown ? 'true' : 'false';
      });

      if (mode === 'NORMAL') {
        cards.sort((a, b) => score(b) - score(a));
        const fragment = document.createDocumentFragment();
        cards.forEach(card => fragment.appendChild(card));
        grid.appendChild(fragment);
      }
    });
  }

  function install() {
    ensureFilter();
    togglePendingPanel();
    apply();
    const grid = document.getElementById('vehicle-grid');
    if (grid && !observer) {
      observer = new MutationObserver(() => apply());
      observer.observe(grid, { childList: true });
    }
  }

  document.addEventListener('DOMContentLoaded', install);
  window.addEventListener('load', install);
})();

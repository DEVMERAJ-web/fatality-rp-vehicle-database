(() => {
  'use strict';

  const PANEL_ID = 'unknown-vehicles-panel';
  const FILTER_ID = 'identification-filter';
  let mode = 'NORMAL';
  let observer = null;
  let scheduled = false;
  let sorting = false;

  const isUnknown = (card) => {
    const status = (card.querySelector('.badge-status')?.textContent || '').trim().toLowerCase();
    const title = (card.querySelector('.vehicle-title')?.textContent || '').trim().toLowerCase();
    const brandText = [...card.querySelectorAll('.details-grid p')]
      .find(p => /brand:/i.test(p.textContent))?.textContent.toLowerCase() || '';
    return status === 'unknown' || status === 'unverified' || title.includes('identification pending') || brandText.includes('custom');
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
      scheduleApply();
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

  function sortPendingFirst(cards) {
    return [...cards].sort((a, b) => {
      const au = isUnknown(a) ? 1 : 0;
      const bu = isUnknown(b) ? 1 : 0;
      if (au !== bu) return bu - au; // unidentified first
      return 0; // preserve app's existing order within each group
    });
  }

  function sortNormalFirst(cards) {
    return [...cards].sort((a, b) => {
      const score = card => {
        const status = (card.querySelector('.badge-status')?.textContent || '').toLowerCase();
        if (status.includes('confirmed')) return 3;
        if (status.includes('likely')) return 2;
        if (status.includes('unknown') || status.includes('unverified') || isUnknown(card)) return 0;
        return 1;
      };
      return score(b) - score(a);
    });
  }

  function reorderCards(cards, grid) {
    if (sorting || cards.length < 2) return;
    const ordered = mode === 'PENDING' ? sortPendingFirst(cards) : sortNormalFirst(cards);
    const alreadyOrdered = ordered.every((card, i) => card === cards[i]);
    if (alreadyOrdered) return;

    sorting = true;
    if (observer) observer.disconnect();
    const fragment = document.createDocumentFragment();
    ordered.forEach(card => fragment.appendChild(card));
    grid.appendChild(fragment);
    if (observer) observer.observe(grid, { childList: true });
    sorting = false;
  }

  function applyNow() {
    scheduled = false;
    togglePendingPanel();

    const grid = document.getElementById('vehicle-grid');
    if (!grid) return;

    const cards = [...grid.querySelectorAll('.vehicle-card')];
    cards.forEach(card => {
      const unknown = isUnknown(card);
      // Normal catalogue hides unidentified vehicles.
      // Pending mode shows all current filter results, but puts unidentified vehicles first.
      card.style.display = mode === 'NORMAL' && unknown ? 'none' : '';
      card.dataset.identificationPending = unknown ? 'true' : 'false';
    });

    reorderCards(cards, grid);
  }

  function scheduleApply() {
    if (scheduled) return;
    scheduled = true;
    requestAnimationFrame(applyNow);
  }

  function install() {
    ensureFilter();
    applyNow();

    const grid = document.getElementById('vehicle-grid');
    if (grid && !observer) {
      observer = new MutationObserver(() => {
        if (!sorting) scheduleApply();
      });
      observer.observe(grid, { childList: true });
    }
  }

  document.addEventListener('DOMContentLoaded', install);
  window.addEventListener('load', install);
})();

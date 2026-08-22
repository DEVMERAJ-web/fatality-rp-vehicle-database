(() => {
  'use strict';

  const PANEL_ID = 'unknown-vehicles-panel';
  const FILTER_ID = 'identification-filter';
  let mode = 'NORMAL';
  let observer = null;
  let scheduled = false;

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

  function applyNow() {
    scheduled = false;
    togglePendingPanel();

    const grid = document.getElementById('vehicle-grid');
    if (!grid) return;

    grid.querySelectorAll('.vehicle-card').forEach(card => {
      const unknown = isUnknown(card);
      card.style.display = mode === 'NORMAL' && unknown ? 'none' : '';
      card.dataset.identificationPending = unknown ? 'true' : 'false';
    });
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
      observer = new MutationObserver(() => scheduleApply());
      observer.observe(grid, { childList: true });
    }
  }

  document.addEventListener('DOMContentLoaded', install);
  window.addEventListener('load', install);
})();

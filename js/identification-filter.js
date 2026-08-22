(() => {
  'use strict';

  const PANEL_ID = 'unknown-vehicles-panel';
  const FILTER_ID = 'identification-filter';
  let mode = 'NORMAL';
  let observer = null;
  let scheduled = false;

  const text = (el, selector) => (el.querySelector(selector)?.textContent || '').trim();
  const clean = value => String(value ?? '').trim().toLowerCase();

  const isUnknown = (card) => {
    const status = clean(text(card, '.badge-status'));
    const title = clean(text(card, '.vehicle-title'));
    const brandText = [...card.querySelectorAll('.details-grid p')]
      .find(p => /brand:/i.test(p.textContent))?.textContent.toLowerCase() || '';
    return status === 'unknown' || status === 'unverified' || title.includes('identification pending') || brandText.includes('custom');
  };

  // Lower score = less information = higher priority in Identification mode.
  function identificationScore(card) {
    const title = clean(text(card, '.vehicle-title'));
    const spawn = clean(text(card, '.spawn-code-text'));
    const details = [...card.querySelectorAll('.details-grid p')].map(p => p.textContent.trim());
    const valueAfter = label => {
      const row = details.find(x => new RegExp(label, 'i').test(x));
      if (!row) return '';
      return row.replace(new RegExp(`^.*?${label}\\s*:?\\s*`, 'i'), '').trim();
    };

    const brand = clean(valueAfter('brand'));
    const year = clean(valueAfter('year'));
    const type = clean(valueAfter('type'));
    const subtype = clean(valueAfter('subtype'));
    const dept = clean(valueAfter('dept'));
    const category = clean(valueAfter('category'));
    const speed = clean(card.querySelector('.speed-value')?.textContent || '');

    let score = 0;

    // Every vehicle has a spawn code, so it is intentionally not counted.
    // A pending/unknown name gives no identification credit.
    if (title && !title.includes('identification pending') && title !== 'unknown vehicle') score += 3;
    if (brand && brand !== 'custom' && !brand.includes('identification pending') && brand !== 'unknown') score += 2;
    if (year && year !== '—' && year !== '-' && year !== 'unknown') score += 1;
    if (type && !['vehicle','utility'].includes(type)) score += 1;
    if (subtype && !subtype.includes('special / custom') && !subtype.includes('identification pending')) score += 1;
    if (dept && !['civilian','unknown'].includes(dept)) score += 1;
    if (category && !['unknown','unclassified'].includes(category)) score += 1;
    if (speed && !speed.includes('not verified') && !speed.includes('unknown')) score += 2;
    if (card.querySelector('.vehicle-img')?.getAttribute('src') && !card.querySelector('.vehicle-img')?.getAttribute('src').startsWith('data:image')) score += 1;

    // Stable tie-breaker by spawn code.
    return { score, code: spawn };
  }

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
      <small class="identification-filter-help">Pending mode starts with the least-identified vehicles.</small>`;

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

    const cards = [...grid.querySelectorAll('.vehicle-card')];
    cards.forEach(card => {
      const unknown = isUnknown(card);
      card.style.display = mode === 'NORMAL' && unknown ? 'none' : '';
      card.dataset.identificationPending = unknown ? 'true' : 'false';
    });

    if (mode === 'PENDING') {
      const ordered = cards
        .map((card, index) => ({ card, index, info: identificationScore(card) }))
        .sort((a, b) => a.info.score - b.info.score || a.info.code.localeCompare(b.info.code) || a.index - b.index);
      const fragment = document.createDocumentFragment();
      ordered.forEach(item => fragment.appendChild(item.card));
      grid.appendChild(fragment);
    }
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

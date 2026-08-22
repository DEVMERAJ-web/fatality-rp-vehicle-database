(() => {
  'use strict';

  const PANEL_ID = 'unknown-vehicles-panel';
  const FILTER_ID = 'identification-filter';
  let mode = 'NORMAL';
  let observer = null;
  let scheduled = false;
  let sorting = false;

  const text = (el, selector) => (el.querySelector(selector)?.textContent || '').trim();
  const clean = value => String(value ?? '').trim().toLowerCase();

  const isUnknown = (card) => {
    const status = clean(text(card, '.badge-status'));
    const title = clean(text(card, '.vehicle-title'));
    const details = [...card.querySelectorAll('.details-grid p')].map(p => p.textContent.toLowerCase());
    const brand = details.find(x => x.includes('brand:')) || '';
    return status === 'unknown' || status === 'unverified' || title.includes('identification pending') || brand.includes('custom');
  };

  // Lower score = less information = higher priority in Identification mode.
  function identificationScore(card) {
    const title = clean(text(card, '.vehicle-title'));
    const spawn = clean(text(card, '.spawn-code-text'));
    const details = [...card.querySelectorAll('.details-grid p')].map(p => p.textContent.trim());

    const valueAfter = label => {
      const row = details.find(x => new RegExp(`^${label}\\s*:`, 'i').test(x));
      if (!row) return '';
      return row.replace(new RegExp(`^${label}\\s*:\\s*`, 'i'), '').trim();
    };

    const brand = clean(valueAfter('brand'));
    const year = clean(valueAfter('year'));
    const type = clean(valueAfter('type'));
    const subtype = clean(valueAfter('subtype'));
    const dept = clean(valueAfter('dept'));
    const category = clean(valueAfter('category'));
    const speed = clean(card.querySelector('.speed-value')?.textContent || '');
    const image = card.querySelector('.vehicle-img')?.getAttribute('src') || '';

    let score = 0;

    // Spawn code is present for every record, so it gives no score.
    if (title && !title.includes('identification pending') && title !== 'unknown vehicle') score += 3;
    if (brand && !['custom', 'unknown'].includes(brand) && !brand.includes('identification pending')) score += 2;
    if (year && !['—', '-', 'unknown', ''].includes(year)) score += 1;
    if (type && !['vehicle', 'utility', ''].includes(type)) score += 1;
    if (subtype && !subtype.includes('special / custom') && !subtype.includes('identification pending')) score += 1;
    if (dept && !['civilian', 'unknown', ''].includes(dept)) score += 1;
    if (category && !['unknown', 'unclassified', ''].includes(category)) score += 1;
    if (speed && !speed.includes('not verified') && !speed.includes('unknown')) score += 2;
    if (image && !image.startsWith('data:image') && !image.includes('NO IMAGE')) score += 1;

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
      <small class="identification-filter-help">Pending mode puts the least-identified vehicles first.</small>`;

    const speedGroup = document.getElementById('speed-filter')?.closest('.filter-group');
    if (speedGroup) panel.insertBefore(group, speedGroup);
    else panel.appendChild(group);

    document.getElementById(FILTER_ID).addEventListener('change', (e) => {
      mode = e.target.value === 'PENDING' ? 'PENDING' : 'NORMAL';
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

  function sortPendingCards(grid) {
    if (sorting) return;
    const cards = [...grid.querySelectorAll('.vehicle-card')];
    if (cards.length < 2) return;

    const ordered = cards
      .map((card, index) => ({ card, index, info: identificationScore(card) }))
      .sort((a, b) => a.info.score - b.info.score || a.info.code.localeCompare(b.info.code) || a.index - b.index)
      .map(item => item.card);

    const unchanged = ordered.every((card, index) => card === cards[index]);
    if (unchanged) return;

    sorting = true;
    if (observer) observer.disconnect();
    const fragment = document.createDocumentFragment();
    ordered.forEach(card => fragment.appendChild(card));
    grid.appendChild(fragment);
    sorting = false;
    if (observer) observer.observe(grid, { childList: true });
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

    if (mode === 'PENDING') sortPendingCards(grid);
  }

  function scheduleApply() {
    if (scheduled || sorting) return;
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

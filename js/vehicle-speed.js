document.addEventListener('DOMContentLoaded', () => {
  const speedUrl = './data/vehicle-speeds.json';
  let speedData = {};
  let speedFilter = 'ALL';

  const ranges = [
    ['ALL', '🏁 All Speeds'], ['0-50', '0–50 km/h'], ['51-100', '51–100 km/h'],
    ['101-150', '101–150 km/h'], ['151-200', '151–200 km/h'], ['201-250', '201–250 km/h'],
    ['251-300', '251–300 km/h'], ['301-350', '301–350 km/h'], ['351-400', '351–400 km/h'],
    ['401+', '401+ km/h'], ['UNKNOWN', '❓ Speed Not Verified']
  ];

  function getSpeed(code) {
    const item = speedData[code];
    return item && Number.isFinite(Number(item.kmh)) ? Number(item.kmh) : null;
  }

  function inRange(speed, range) {
    if (range === 'ALL') return true;
    if (range === 'UNKNOWN') return speed === null;
    if (speed === null) return false;
    if (range === '401+') return speed >= 401;
    const [min, max] = range.split('-').map(Number);
    return speed >= min && speed <= max;
  }

  function addSpeedFilter() {
    const panel = document.querySelector('.filter-panel');
    if (!panel || document.getElementById('speed-filter')) return;
    const group = document.createElement('div');
    group.className = 'filter-group speed-filter-group';
    group.innerHTML = `
      <label for="speed-filter">Max Speed</label>
      <select id="speed-filter" aria-label="Filter vehicles by maximum reference speed">
        ${ranges.map(([value, label]) => `<option value="${value}">${label}</option>`).join('')}
      </select>
      <small class="speed-help">Reference top speed. Custom FiveM handling may differ.</small>`;
    const favGroup = document.getElementById('favorites-toggle')?.closest('.filter-group');
    if (favGroup) panel.insertBefore(group, favGroup); else panel.appendChild(group);
    document.getElementById('speed-filter')?.addEventListener('change', e => {
      speedFilter = e.target.value;
      applySpeedFilter();
    });
  }

  function decorateCards() {
    document.querySelectorAll('.vehicle-card').forEach(card => {
      const codeEl = card.querySelector('.spawn-code-text');
      const details = card.querySelector('.details-grid');
      if (!codeEl || !details) return;
      const code = codeEl.textContent.trim();
      const speed = getSpeed(code);
      const html = speed === null
        ? '<p class="max-speed-field"><strong>Max Speed:</strong> <span class="speed-unknown">Not verified</span></p>'
        : `<p class="max-speed-field"><strong>Max Speed:</strong> <span class="speed-value">${speed} km/h</span></p>`;
      const existing = details.querySelector('.max-speed-field');
      if (existing) existing.outerHTML = html; else details.insertAdjacentHTML('beforeend', html);
      card.dataset.maxSpeed = speed === null ? '' : String(speed);
    });
  }

  function applySpeedFilter() {
    decorateCards();
    const cards = [...document.querySelectorAll('.vehicle-card')];
    let visible = 0;
    cards.forEach(card => {
      const raw = card.dataset.maxSpeed;
      const speed = raw === '' ? null : Number(raw);
      const show = inRange(speed, speedFilter);
      card.style.display = show ? '' : 'none';
      if (show) visible++;
    });
    const results = document.getElementById('results-count');
    if (results && speedFilter !== 'ALL') {
      const label = ranges.find(r => r[0] === speedFilter)?.[1] || speedFilter;
      results.textContent = `Showing ${visible} vehicle${visible === 1 ? '' : 's'} • ${label}`;
    }
  }

  fetch(speedUrl)
    .then(r => { if (!r.ok) throw new Error(`Speed database HTTP ${r.status}`); return r.json(); })
    .then(data => {
      speedData = data && typeof data === 'object' ? data : {};
      addSpeedFilter();
      decorateCards();
      applySpeedFilter();
      const grid = document.getElementById('vehicle-grid');
      if (grid) new MutationObserver(() => { decorateCards(); applySpeedFilter(); }).observe(grid, { childList: true, subtree: true });
    })
    .catch(error => { console.error('Fatality speed database failed to load:', error); addSpeedFilter(); });
});

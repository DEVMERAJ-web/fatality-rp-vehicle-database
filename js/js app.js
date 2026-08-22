/**
 * Fatality Roleplay 2.0 - Vehicle Database Engine
 * Author: MADE BY MERAJ
 * File: js/app.js
 */

document.addEventListener('DOMContentLoaded', () => {
  // Global Application State
  let vehiclesData = [];
  let favorites = [];

  // Safely initialize localStorage for favorites
  try {
    const stored = localStorage.getItem('fatality_vehicle_favorites');
    favorites = stored ? JSON.parse(stored) : [];
    if (!Array.isArray(favorites)) favorites = [];
  } catch (err) {
    console.warn('LocalStorage is corrupted or disabled. Resetting favorites state.', err);
    favorites = [];
  }

  // DOM Elements
  const container = document.getElementById('vehicle-grid');
  const resultsCount = document.getElementById('results-count');
  const searchInput = document.getElementById('search-input');
  const accessFilter = document.getElementById('access-filter');
  const typeFilter = document.getElementById('type-filter');
  const subtypeFilter = document.getElementById('subtype-filter');
  const departmentFilter = document.getElementById('department-filter');
  const statusFilter = document.getElementById('status-filter');
  const favoritesToggle = document.getElementById('favorites-toggle');
  const resetBtn = document.getElementById('reset-filters-btn');

  // Modal DOM Elements
  const modal = document.getElementById('vehicle-modal');
  const modalBody = document.getElementById('modal-body');
  const modalCloseBtn = document.getElementById('modal-close');

  // SVG Fallback Data URL for Missing Vehicle Images
  const FALLBACK_IMAGE = 'data:image/svg+xml;utf8,<svg xmlns="http://www.w3.org/2000/svg" width="300" height="180" viewBox="0 0 300 180" fill="%2316181C"><rect width="300" height="180"/><text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" fill="%2300C2FF" font-family="sans-serif" font-size="14" font-weight="bold">FATALITY 2.0 - NO IMAGE</text></svg>';

  // Utility: Sanitize Strings to Prevent XSS
  const escapeHTML = (str) => {
    if (str === null || str === undefined) return '';
    return String(str).replace(/[&<>"']/g, (m) => {
      return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#039;' }[m];
    });
  };

  // Application Entry Point
  init();

  function init() {
    renderLoading();
    fetch('./data/vehicles.json')
      .then(res => {
        if (!res.ok) throw new Error(`HTTP Error Status: ${res.status}`);
        return res.json();
      })
      .then(data => {
        vehiclesData = Array.isArray(data) ? data : [];
        populateDynamicFilters();
        renderVehicles(getFilteredVehicles());
        bindEvents();
      })
      .catch(err => {
        console.error('Failed to load vehicle database:', err);
        renderError('Unable to connect to vehicle database. Please check ./data/vehicles.json.');
      });
  }

  // Render UI States
  function renderLoading() {
    container.innerHTML = `
      <div class="loading-state">
        <div class="spinner"></div>
        <p>Connecting to Fatality 2.0 Database...</p>
      </div>
    `;
  }

  function renderError(message) {
    container.innerHTML = `
      <div class="error-state">
        <p>${escapeHTML(message)}</p>
      </div>
    `;
  }

  // Populate Dynamic Dropdowns (Subtype, Department, Status)
  function populateDynamicFilters() {
    const selectedType = typeFilter ? typeFilter.value : 'ALL';
    
    // Subtypes depend on selected Vehicle Type
    const subtypes = new Set();
    const departments = new Set();
    const statuses = new Set();

    vehiclesData.forEach(v => {
      if (selectedType === 'ALL' || (v.vehicleType && v.vehicleType.toLowerCase() === selectedType.toLowerCase())) {
        if (v.subtype) subtypes.add(v.subtype);
      }
      if (v.department) departments.add(v.department);
      if (v.status) statuses.add(v.status);
    });

    // Subtypes Populate
    subtypeFilter.innerHTML = '<option value="ALL">All Subtypes</option>';
    Array.from(subtypes).sort().forEach(sub => {
      const opt = document.createElement('option');
      opt.value = sub;
      opt.textContent = sub;
      subtypeFilter.appendChild(opt);
    });

    // Departments Populate
    departmentFilter.innerHTML = '<option value="ALL">All Departments</option>';
    Array.from(departments).sort().forEach(dept => {
      const opt = document.createElement('option');
      opt.value = dept;
      opt.textContent = dept;
      departmentFilter.appendChild(opt);
    });

    // Statuses Populate
    statusFilter.innerHTML = '<option value="ALL">All Statuses</option>';
    Array.from(statuses).sort().forEach(st => {
      const opt = document.createElement('option');
      opt.value = st;
      opt.textContent = st;
      statusFilter.appendChild(opt);
    });
  }

  // Combined Filtering Core Algorithm
  function getFilteredVehicles() {
    const query = searchInput ? searchInput.value.trim().toLowerCase() : '';
    const selectedAccess = accessFilter ? accessFilter.value.toUpperCase() : 'ALL';
    const selectedType = typeFilter ? typeFilter.value.toUpperCase() : 'ALL';
    const selectedSubtype = subtypeFilter ? subtypeFilter.value : 'ALL';
    const selectedDept = departmentFilter ? departmentFilter.value.toUpperCase() : 'ALL';
    const selectedStatus = statusFilter ? statusFilter.value.toLowerCase() : 'ALL';
    const showFavsOnly = favoritesToggle ? favoritesToggle.checked : false;

    return vehiclesData.filter(v => {
      // 1. Search Query
      const matchesSearch = !query || [
        v.code, v.name, v.brand, v.year, v.vehicleType, v.subtype, v.department, v.access
      ].some(field => field && String(field).toLowerCase().includes(query));

      // 2. Access Filter
      const matchesAccess = selectedAccess === 'ALL' || (v.access && v.access.toUpperCase() === selectedAccess);

      // 3. Vehicle Type Filter
      const matchesType = selectedType === 'ALL' || (v.vehicleType && v.vehicleType.toUpperCase() === selectedType);

      // 4. Subtype Filter
      const matchesSubtype = selectedSubtype === 'ALL' || v.subtype === selectedSubtype;

      // 5. Department Filter
      const matchesDept = selectedDept === 'ALL' || (v.department && v.department.toUpperCase() === selectedDept);

      // 6. Status Filter
      const matchesStatus = selectedStatus === 'ALL' || (v.status && v.status.toLowerCase() === selectedStatus);

      // 7. Favorites Filter
      const matchesFav = !showFavsOnly || favorites.includes(v.code);

      return matchesSearch && matchesAccess && matchesType && matchesSubtype && matchesDept && matchesStatus && matchesFav;
    });
  }

  // Render Vehicle Cards
  function renderVehicles(list) {
    container.innerHTML = '';
    resultsCount.textContent = `Showing ${list.length} vehicle${list.length === 1 ? '' : 's'}`;

    if (list.length === 0) {
      container.innerHTML = `
        <div class="no-results">
          <h3>No vehicles found</h3>
          <p>No records in Fatality 2.0 match your search or filter parameters.</p>
        </div>
      `;
      return;
    }

    const fragment = document.createDocumentFragment();

    list.forEach(v => {
      const isFav = favorites.includes(v.code);
      const isAdmin = v.access && v.access.toUpperCase() === 'ADMIN';

      const card = document.createElement('div');
      card.className = `vehicle-card ${isAdmin ? 'admin-card' : ''}`;

      card.innerHTML = `
        <div class="card-image-wrapper">
          <img 
            src="${escapeHTML(v.image)}" 
            alt="${escapeHTML(v.name)}" 
            class="vehicle-img"
            loading="lazy"
            onerror="this.onerror=null; this.src='${FALLBACK_IMAGE}';"
          />
          <div class="card-badges">
            <span class="badge ${isAdmin ? 'badge-access-admin' : 'badge-access'}">${escapeHTML(v.access)}</span>
            <span class="badge badge-status">${escapeHTML(v.status)}</span>
          </div>
          <button class="fav-btn" data-code="${escapeHTML(v.code)}" title="Toggle Favorite">
            ${isFav ? '★' : '☆'}
          </button>
        </div>
        <div class="card-body">
          <h3 class="vehicle-title">${escapeHTML(v.name)}</h3>
          <div class="spawn-code-wrapper">
            <span class="spawn-code-text">${escapeHTML(v.code)}</span>
          </div>
          <div class="details-grid">
            <p><strong>Brand:</strong> ${escapeHTML(v.brand)}</p>
            <p><strong>Year:</strong> ${escapeHTML(v.year)}</p>
            <p><strong>Type:</strong> ${escapeHTML(v.vehicleType)}</p>
            <p><strong>Subtype:</strong> ${escapeHTML(v.subtype)}</p>
            <p><strong>Dept:</strong> ${escapeHTML(v.department)}</p>
          </div>
          <div class="card-actions">
            <button class="btn-primary copy-btn" data-code="${escapeHTML(v.code)}">Copy Code</button>
            <button class="btn-outline details-btn" data-code="${escapeHTML(v.code)}">Details</button>
          </div>
        </div>
      `;

      fragment.appendChild(card);
    });

    container.appendChild(fragment);
  }

  // Copy Spawn Code with Clipboard & Fallback
  function copySpawnCode(code, btnElement) {
    if (!code) return;

    const onSuccess = () => {
      const prevText = btnElement.textContent;
      btnElement.textContent = 'Copied!';
      btnElement.classList.add('copied');
      setTimeout(() => {
        btnElement.textContent = prevText;
        btnElement.classList.remove('copied');
      }, 1500);
    };

    if (navigator.clipboard && window.isSecureContext) {
      navigator.clipboard.writeText(code).then(onSuccess).catch(() => fallbackCopy(code, onSuccess));
    } else {
      fallbackCopy(code, onSuccess);
    }
  }

  function fallbackCopy(text, callback) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.position = 'fixed';
    textArea.style.opacity = '0';
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    try {
      document.execCommand('copy');
      callback();
    } catch (err) {
      console.error('Fallback copy failed:', err);
    }
    document.body.removeChild(textArea);
  }

  // Toggle Favorites
  function toggleFavorite(code) {
    const idx = favorites.indexOf(code);
    if (idx > -1) {
      favorites.splice(idx, 1);
    } else {
      favorites.push(code);
    }

    try {
      localStorage.setItem('fatality_vehicle_favorites', JSON.stringify(favorites));
    } catch (err) {
      console.error('Failed to save favorites to localStorage:', err);
    }

    renderVehicles(getFilteredVehicles());
  }

  // Open Vehicle Details Modal
  function openModal(code) {
    const vehicle = vehiclesData.find(v => v.code === code);
    if (!vehicle || !modal || !modalBody) return;

    const isFav = favorites.includes(vehicle.code);
    const isAdmin = vehicle.access && vehicle.access.toUpperCase() === 'ADMIN';

    modalBody.innerHTML = `
      <div class="modal-layout">
        <div class="modal-img-wrapper">
          <img 
            src="${escapeHTML(vehicle.image)}" 
            alt="${escapeHTML(vehicle.name)}" 
            onerror="this.onerror=null; this.src='${FALLBACK_IMAGE}';"
          />
        </div>
        <div class="modal-content">
          <div class="modal-header-info">
            <h2>${escapeHTML(vehicle.name)}</h2>
            <span class="badge ${isAdmin ? 'badge-access-admin' : 'badge-access'}">${escapeHTML(vehicle.access)} ACCESS</span>
          </div>
          <table class="modal-table">
            <tr><td>Spawn Code</td><td><strong class="accent-text">${escapeHTML(vehicle.code)}</strong></td></tr>
            <tr><td>Brand</td><td>${escapeHTML(vehicle.brand)}</td></tr>
            <tr><td>Model Year</td><td>${escapeHTML(vehicle.year)}</td></tr>
            <tr><td>Vehicle Type</td><td>${escapeHTML(vehicle.vehicleType)}</td></tr>
            <tr><td>Subtype</td><td>${escapeHTML(vehicle.subtype)}</td></tr>
            <tr><td>Department</td><td>${escapeHTML(vehicle.department)}</td></tr>
            <tr><td>Status</td><td>${escapeHTML(vehicle.status)}</td></tr>
          </table>
          <div class="card-actions">
            <button class="btn-primary copy-btn" data-code="${escapeHTML(vehicle.code)}">Copy Spawn Code</button>
            <button class="btn-outline modal-fav-btn" data-code="${escapeHTML(vehicle.code)}">
              ${isFav ? '★ Favorited' : '☆ Add to Favorites'}
            </button>
          </div>
        </div>
      </div>
    `;

    modal.classList.add('open');
    modal.setAttribute('aria-hidden', 'false');
  }

  function closeModal() {
    if (!modal) return;
    modal.classList.remove('open');
    modal.setAttribute('aria-hidden', 'true');
  }

  // Reset Filters Action
  function resetAllFilters() {
    if (searchInput) searchInput.value = '';
    if (accessFilter) accessFilter.value = 'ALL';
    if (typeFilter) typeFilter.value = 'ALL';
    if (favoritesToggle) favoritesToggle.checked = false;
    
    populateDynamicFilters();
    renderVehicles(getFilteredVehicles());
  }

  // Bind Event Listeners
  function bindEvents() {
    // Inputs & Filter Controls
    if (searchInput) searchInput.addEventListener('input', () => renderVehicles(getFilteredVehicles()));
    if (accessFilter) accessFilter.addEventListener('change', () => renderVehicles(getFilteredVehicles()));
    if (typeFilter) typeFilter.addEventListener('change', () => {
      populateDynamicFilters();
      renderVehicles(getFilteredVehicles());
    });
    if (subtypeFilter) subtypeFilter.addEventListener('change', () => renderVehicles(getFilteredVehicles()));
    if (departmentFilter) departmentFilter.addEventListener('change', () => renderVehicles(getFilteredVehicles()));
    if (statusFilter) statusFilter.addEventListener('change', () => renderVehicles(getFilteredVehicles()));
    if (favoritesToggle) favoritesToggle.addEventListener('change', () => renderVehicles(getFilteredVehicles()));
    if (resetBtn) resetBtn.addEventListener('click', resetAllFilters);

    // Global Click Event Delegation
    document.addEventListener('click', (e) => {
      const target = e.target;

      // Copy Spawn Code
      if (target.classList.contains('copy-btn')) {
        copySpawnCode(target.dataset.code, target);
      }

      // View Details
      if (target.classList.contains('details-btn')) {
        openModal(target.dataset.code);
      }

      // Favorite Card Star
      if (target.classList.contains('fav-btn') || target.classList.contains('modal-fav-btn')) {
        toggleFavorite(target.dataset.code);
        if (target.classList.contains('modal-fav-btn')) {
          openModal(target.dataset.code); // refresh modal state
        }
      }

      // Modal Close Elements
      if (target === modalCloseBtn || target.classList.contains('modal-overlay')) {
        closeModal();
      }
    });

    // Close Modal on Escape
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && modal && modal.classList.contains('open')) {
        closeModal();
      }
    });
  }
});
// Константы для иконок
const ICONS = {
  no_smoking: 'https://paulbrsv.github.io/goodplaces/image/nosmoking.svg',
  pets_allowed: 'https://paulbrsv.github.io/goodplaces/image/dog.svg',
  smoke: 'https://paulbrsv.github.io/goodplaces/image/smoke.svg',
  terrace: 'https://paulbrsv.github.io/goodplaces/image/terrece.svg',
  coffee_shop: 'https://paulbrsv.github.io/goodplaces/image/coffee.svg',
  specialty: 'https://paulbrsv.github.io/goodplaces/image/coffee-pot.svg',
  food: 'https://paulbrsv.github.io/goodplaces/image/food.svg',
  snacks: 'https://paulbrsv.github.io/goodplaces/image/sandwich.svg',
  desserts: 'https://paulbrsv.github.io/goodplaces/image/cake.svg',
  beer: 'https://paulbrsv.github.io/goodplaces/image/beer.svg',
  wine: 'https://paulbrsv.github.io/goodplaces/image/wine.svg',
  instagram: 'https://paulbrsv.github.io/goodplaces/image/instagram.svg',
  google: 'https://paulbrsv.github.io/goodplaces/image/google.svg'
};

// Локализация
const translations = {
  ru: { title: "Карта кофеен", nearby: "В этом районе", more: "📍 Ещё рядом", search: "Поиск по названию" },
  en: { title: "Coffee Shop Map", nearby: "In this area", more: "📍 More nearby", search: "Search by name" },
  rs: { title: "Mapa kafića", nearby: "U ovom području", more: "📍 Još u blizini", search: "Pretraga po imenu" }
};

// Кэширование DOM-элементов
const mapElement = document.getElementById('map');
const visiblePlaces = document.getElementById('visible-places');
const outsidePlaces = document.getElementById('outside-places');
const filters = document.querySelectorAll('.mdc-chip');
const filterReset = document.getElementById('filter-reset');
const searchInput = document.querySelector('.mdc-text-field__input');
const geolocateBtn = document.getElementById('geolocate');
const toggleSidebarBtn = document.getElementById('toggle-sidebar');
const sidebar = document.getElementById('sidebar');
const closeSidebarBtn = document.getElementById('close-sidebar');
const title = document.querySelector('.mdc-top-app-bar__title');
const nearbyTitle = document.querySelector('.place-list h3:first-child');
const moreTitle = document.querySelector('.place-list h3:last-child');
const loadingElement = document.getElementById('loading');

// Глобальные переменные
let map = L.map(mapElement).setView([45.25, 19.85], 14);
let markerCluster = L.markerClusterGroup();
let placesData = [];
let activeFilters = [];
let markers = {};
let currentLang = 'ru';

// Инициализация карты
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '© OpenStreetMap contributors & Carto'
}).addTo(map);
map.addLayer(markerCluster);

// Add legend for map markers
const legend = L.control({ position: 'bottomleft' });
legend.onAdd = function () {
  const div = L.DomUtil.create('div', 'info legend');
  div.id = 'map-legend';
  div.innerHTML = '<p>Зеленые круги: кафе/рестораны, Желтые круги: кластеры мест</p>';
  return div;
};
legend.addTo(map);

// Debounce для оптимизации событий
function debounce(func, wait) {
  let timeout;
  return function (...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => func.apply(this, args), wait);
  };
}

// Обновление карты
function updateMap(filteredPlaces = placesData) {
  markerCluster.clearLayers();

  const placesToShow = filteredPlaces.filter(place => {
    if (activeFilters.length === 0) return true;
    return activeFilters.every(filter => place.attributes.includes(filter));
  }).filter(place => {
    const query = searchInput.value.toLowerCase().trim();
    return query ? place.name.toLowerCase().includes(query) : true;
  });

  placesToShow.forEach(place => {
    if (!markers[place.name]) {
      const popupContent = `
        <div class="popup-content">
          <img src="${place.image}" alt="${place.name}">
          <div class="popup-text">
            <h3>${place.name}</h3>
            <p>${place.description}</p>
            <div class="popup-attributes">${place.attributes.map(attr => `<img src="${ICONS[attr]}" alt="${attr}" class="atr-icon">`).join('')}</div>
            <div class="popup-links">
              <a href="${place.instagram}" target="_blank" aria-label="Instagram ${place.name}">
                <img src="${ICONS.instagram}" alt="Instagram">
              </a>
              <a href="https://www.google.com/maps/search/?api=1&query=${place.lat},${place.lng}" target="_blank" aria-label="Google Maps ${place.name}">
                <img src="${ICONS.google}" alt="Google Maps">
              </a>
            </div>
          </div>
        </div>
      `;

      const marker = L.marker([place.lat, place.lng]).bindPopup(popupContent, {
        autoPan: true,
        autoPanPaddingTopLeft: L.point(0, 80),
        autoPanPaddingBottomRight: L.point(0, 40)
      });
      markerCluster.addLayer(marker);
      markers[place.name] = marker;
    }
  });

  updateSidebar(placesToShow);
  updateFilterCounts(placesToShow);
  console.log('Updated map with', placesToShow.length, 'places');
}

// Обновление фильтров
function updateFilterCounts(filteredPlaces) {
  filters.forEach(filter => {
    if (filter) {
      const filterId = filter.dataset.filter;
      const count = filteredPlaces.filter(place => place.attributes.includes(filterId)).length;
      const countElement = filter.querySelector('.filter-count');
      if (countElement) {
        countElement.textContent = count > 0 ? count : '';
        filter.setAttribute('aria-checked', count > 0 ? 'true' : 'false');
      }
    }
  });
}

// Обновление боковой панели
function updateSidebar(filteredPlaces) {
  visiblePlaces.innerHTML = '';
  outsidePlaces.innerHTML = '';
  const bounds = map.getBounds();

  filteredPlaces.forEach(place => {
    const placeElement = document.createElement('div');
    placeElement.className = 'place';
    placeElement.setAttribute('role', 'listitem');
    placeElement.tabIndex = 0; // Make it focusable for keyboard navigation
    placeElement.innerHTML = `
      <img src="${place.image}" alt="${place.name}">
      <div class="place-info">
        <h3>${place.name}</h3>
        <p>${place.description}</p>
        <div class="attributes">${place.attributes.map(attr => `<img src="${ICONS[attr]}" alt="${attr}" class="atr-icon">`).join('')}</div>
      </div>
    `;

    placeElement.addEventListener('click', () => {
      document.querySelectorAll('.place').forEach(el => el.classList.remove('active-place'));
      placeElement.classList.add('active-place');
      map.setView([place.lat, place.lng], 18, { animate: true });
      if (markers[place.name]) {
        markers[place.name].openPopup();
      }
    });

    placeElement.addEventListener('keypress', (e) => {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        placeElement.click();
      }
    });

    if (bounds.contains([place.lat, place.lng])) {
      visiblePlaces.appendChild(placeElement);
    } else {
      outsidePlaces.appendChild(placeElement);
    }
  });
  console.log('Updated sidebar with', filteredPlaces.length, 'places');
}

// События фильтров
function setupFilterEvents() {
  filters.forEach(filter => {
    if (filter) {
      filter.addEventListener('click', (e) => {
        e.preventDefault();
        const filterId = filter.dataset.filter;
        if (activeFilters.includes(filterId)) {
          activeFilters = activeFilters.filter(f => f !== filterId);
          filter.classList.remove('active');
          filter.setAttribute('aria-checked', 'false');
        } else {
          activeFilters.push(filterId);
          filter.classList.add('active');
          filter.setAttribute('aria-checked', 'true');
        }
        updateMap();
      });

      filter.addEventListener('keypress', (e) => {
        if (e.key === 'Enter' || e.key === ' ') {
          e.preventDefault();
          filter.click();
        }
      });
    }
  });
}

if (filterReset) {
  filterReset.addEventListener('click', (e) => {
    e.preventDefault();
    activeFilters = [];
    filters.forEach(filter => {
      if (filter) {
        filter.classList.remove('active');
        filter.setAttribute('aria-checked', 'false');
      }
    });
    searchInput.value = ''; // Clear search input
    map.setView([45.25, 19.85], 14); // Reset map to initial view
    updateMap();
  });

  filterReset.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      filterReset.click();
    }
  });
}

// Поиск
if (searchInput) {
  searchInput.addEventListener('input', debounce(() => updateMap(), 300));
}

// Геолокация
if (geolocateBtn) {
  geolocateBtn.addEventListener('click', (e) => {
    e.preventDefault();
    navigator.geolocation.getCurrentPosition(
      pos => {
        map.setView([pos.coords.latitude, pos.coords.longitude], 14);
      },
      () => alert('Геолокация недоступна')
    );
  });

  geolocateBtn.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      geolocateBtn.click();
    }
  });
}

// Переключение боковой панели
if (toggleSidebarBtn) {
  toggleSidebarBtn.addEventListener('click', (e) => {
    e.preventDefault();
    sidebar.classList.toggle('active');
    if (sidebar.classList.contains('active')) {
      document.body.classList.add('mdc-drawer-open');
    } else {
      document.body.classList.remove('mdc-drawer-open');
    }
  });

  toggleSidebarBtn.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      toggleSidebarBtn.click();
    }
  });
}

if (closeSidebarBtn) {
  closeSidebarBtn.addEventListener('click', (e) => {
    e.preventDefault();
    sidebar.classList.remove('active');
    document.body.classList.remove('mdc-drawer-open');
  });

  closeSidebarBtn.addEventListener('keypress', (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      closeSidebarBtn.click();
    }
  });
}

// Переключение языка
function switchLanguage(lang) {
  currentLang = lang;
  document.title = translations[lang].title;
  nearbyTitle.textContent = translations[lang].nearby;
  moreTitle.textContent = translations[lang].more;
  searchInput.placeholder = translations[lang].search;
  title.textContent = 'DOBRO MESTO';
  updateMap();
  const languageButtons = document.querySelectorAll('.language-switcher .mdc-button');
  languageButtons.forEach(btn => btn.classList.remove('active'));
  document.querySelector(`.language-switcher button[onclick="switchLanguage('${lang}')"]`).classList.add('active');
}

// Загрузка данных
function showLoading() {
  if (loadingElement) loadingElement.style.display = 'block';
}

function hideLoading() {
  if (loadingElement) loadingElement.style.display = 'none';
}

fetch('places.json')
  .then(response => {
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    showLoading();
    return response.json();
  })
  .then(data => {
    if (!Array.isArray(data) || data.length === 0) {
      throw new Error('Invalid or empty data format in places.json');
    }
    placesData = data;
    console.log('Loaded places data:', placesData);
    updateMap();
    hideLoading();
  })
  .catch(error => {
    console.error('Ошибка загрузки данных:', error);
    alert('Не удалось загрузить данные о местах. Пожалуйста, проверьте файл places.json или попробуйте позже.');
    hideLoading();
  });

// Обновление боковой панели при перемещении карты
map.on('moveend', debounce(() => updateSidebar(placesData.filter(place => {
  if (activeFilters.length === 0) return true;
  return place.attributes.some(attr => activeFilters.includes(attr));
})), 200));

// Initialize Material Components
document.addEventListener('DOMContentLoaded', () => {
  const ripple = new mdc.ripple.MDCRipple(document.querySelector('.mdc-icon-button'));
  const textField = new mdc.textField.MDCTextField(document.querySelector('.mdc-text-field'));
  const chips = Array.from(document.querySelectorAll('.mdc-chip')).map(chip => new mdc.chips.MDCChip(chip));
  setupFilterEvents(); // Call after DOM is ready
});

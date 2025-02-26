var map = L.map('map').setView([45.25, 19.85], 14);
L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
  attribution: '© OpenStreetMap contributors & Carto'
}).addTo(map);

var markerCluster = L.markerClusterGroup();
map.addLayer(markerCluster);

var placesData = [];
let activeFilters = [];
let markers = {};
let highlightedMarker = null; // Переменная для отслеживания подсвеченной метки

const attributeNames = {
  "specialty": '<img src="https://paulbrsv.github.io/goodplaces/image/coffee-pot.svg" alt="Specialty coffee" class="atr-icon">',
  "desserts": '<img src="https://paulbrsv.github.io/goodplaces/image/cake.svg" alt="Desserts" class="atr-icon">',
  "no_smoking": '<img src="https://paulbrsv.github.io/goodplaces/image/nosmoking.svg" alt="No smoking" class="atr-icon">',
  "pets_allowed": '<img src="https://paulbrsv.github.io/goodplaces/image/dog.svg" alt="Pet friendly" class="atr-icon">',
  "wine": '<img src="https://paulbrsv.github.io/goodplaces/image/wine.svg" alt="Wine" class="atr-icon">',
  "beer": '<img src="https://paulbrsv.github.io/goodplaces/image/beer.svg" alt="Beer" class="atr-icon">',
  "pet_friendly": '<img src="https://paulbrsv.github.io/goodplaces/image/dog.svg" alt="Pet friendly" class="atr-icon">',
  "coffee_shop": '<img src="https://paulbrsv.github.io/goodplaces/image/coffee.svg" alt="Cafe" class="atr-icon">',
  "snacks": '<img src="https://paulbrsv.github.io/goodplaces/image/sandwich.svg" alt="Snacks" class="atr-icon">',
  "food": '<img src="https://paulbrsv.github.io/goodplaces/image/food.svg" alt="Snacks" class="atr-icon">',
  "terrace": '<img src="https://paulbrsv.github.io/goodplaces/image/terrece.svg" alt="Terrace" class="atr-icon">'
};

const filterTooltips = {
  "no_smoking": "Место, где курение полностью запрещено",
  "pets_allowed": "Разрешено приводить домашних животных",
  "smoke": "Есть отдельная зона для некурящих",
  "terrace": "Открытая терраса для отдыха на свежем воздухе",
  "coffee_shop": "Обычная кофейня с базовым выбором напитков",
  "specialty": "Кофейня с уникальными сортами кофе и авторскими напитками",
  "food": "Полноценное меню с горячими блюдами",
  "snacks": "Лёгкие закуски к напиткам",
  "desserts": "Широкий выбор сладостей и выпечки",
  "beer": "Предлагают пиво в ассортименте",
  "wine": "Есть выбор вин"
};

// Восстанавливаем обработчики для фильтров и кнопки сброса
document.querySelectorAll('.filter').forEach(filter => {
  filter.addEventListener('click', () => {
    const filterId = filter.dataset.filter;
    if (activeFilters.includes(filterId)) {
      activeFilters = activeFilters.filter(f => f !== filterId);
      filter.classList.remove('active');
    } else {
      activeFilters.push(filterId);
      filter.classList.add('active');
    }
    resetHighlight(); // Сбрасываем подсветку при изменении фильтров
    updateMap();
  });
});

document.querySelectorAll('.filter-reset').forEach(resetButton => {
  resetButton.addEventListener('click', () => {
    activeFilters = [];
    document.querySelectorAll('.filter').forEach(filter => filter.classList.remove('active'));
    resetHighlight(); // Сбрасываем подсветку при сбросе фильтров
    map.setView([45.25, 19.85], 14); // Возвращаем исходный масштаб и центровку
    updateMap();
  });
});

document.querySelector('.more-filters-btn').addEventListener('click', () => {
  document.getElementById('more-filters-modal').classList.remove('hidden');
});

document.querySelector('.close-modal').addEventListener('click', () => {
  document.getElementById('more-filters-modal').classList.add('hidden');
});

function updateMap() {
  markerCluster.clearLayers();

  const filteredPlaces = placesData.filter(place => {
    if (activeFilters.length === 0) return true;
    return activeFilters.every(filter => place.attributes.includes(filter));
  });

  filteredPlaces.forEach(place => {
    const popupContent = `
      <div class="popup-content">
        <img src="${place.image}" alt="${place.name}">
        <div class="popup-text">
          <div class="popup-text-content">
            <h3>${place.name}</h3>
            <p>${place.description}</p>
            <div class="popup-attributes">${place.attributes.map(attr => attributeNames[attr] || attr).join('')}</div>
          </div>
          <div class="popup-links">
            <a href="${place.instagram}" target="_blank">
              <img src="https://paulbrsv.github.io/goodplaces/image/instagram.svg" alt="Instagram" class="icon">
            </a>
            <a href="${place.maps_url}" target="_blank">
              <img src="https://paulbrsv.github.io/goodplaces/image/google.svg" alt="Google Maps" class="icon">
            </a>
          </div>
        </div>
      </div>
    `;

    const marker = L.marker([place.lat, place.lng], {
      icon: L.divIcon({
        className: 'default-marker',
        html: '<div style="background-color: #3388ff; width: 10px; height: 10px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 0 2px #3388ff;"></div>',
        iconSize: [16, 16],
        iconAnchor: [8, 8]
      })
    });

    if (window.innerWidth > 768) {
      marker.bindPopup(popupContent, {
        autoPan: true,
        autoPanPaddingTopLeft: L.point(0, 100),
        autoPanPaddingBottomRight: L.point(0, 50)
      });
      marker.on('popupopen', () => highlightMarker(place.name));
      marker.on('popupclose', () => resetHighlight());
    } else {
      marker.on('click', () => {
        showMobilePlaceCard(place);
        highlightMarker(place.name);
      });
    }
    markerCluster.addLayer(marker);
    markers[place.name] = marker;
  });

  map.addLayer(markerCluster);

  updateSidebar(filteredPlaces);
  updateFilterCounts(filteredPlaces);
}

function updateFilterCounts(filteredPlaces) {
  document.querySelectorAll('.filter').forEach(filter => {
    const filterId = filter.dataset.filter;
    const count = filteredPlaces.filter(place => place.attributes.includes(filterId)).length;

    let countElement = filter.querySelector('.filter-count');
    if (!countElement) {
      countElement = document.createElement('div');
      countElement.classList.add('filter-count');
      filter.appendChild(countElement);
    }
    countElement.textContent = count;
  });
}

function updateSidebar(filteredPlaces) {
  const visibleList = document.getElementById("visible-places");
  const outsideList = document.getElementById("outside-places");
  visibleList.innerHTML = "";
  outsideList.innerHTML = "";

  const bounds = map.getBounds();
  const mapCenter = map.getCenter();

  const sortedPlaces = filteredPlaces
    .map(place => {
      const placeLatLng = L.latLng(place.lat, place.lng);
      const distance = mapCenter.distanceTo(placeLatLng);
      return { ...place, distance };
    })
    .sort((a, b) => a.distance - b.distance);

  let tempMarker = null;

  sortedPlaces.forEach(place => {
    const placeElement = document.createElement("div");
    placeElement.className = "place";
    placeElement.innerHTML = `
      <img src="${place.image}" alt="${place.name}">
      <div class="place-info">
        <h3>${place.name}</h3>
        <p>${place.shirt_description || place.description}</p>
        <p>${place.attributes.map(attr => attributeNames[attr] || attr).join('')}</p>
      </div>
    `;

    placeElement.onclick = () => {
      if (window.innerWidth <= 768) {
        // Мобильная версия
        map.setView([place.lat, place.lng], 18, { animate: true });
        showMobilePlaceCard(place);
        closeSidebar();
        highlightMarker(place.name);
      } else {
        // Десктопная версия
        if (tempMarker) {
          if (tempMarker.isPopupOpen()) {
            tempMarker.closePopup();
          }
          map.removeLayer(tempMarker);
          tempMarker = null;
        }

        if (!map.hasLayer(markerCluster)) {
          map.addLayer(markerCluster);
        }

        const popupContent = `
          <div class="popup-content">
            <img src="${place.image}" alt="${place.name}">
            <div class="popup-text">
              <div class="popup-text-content">
                <h3>${place.name}</h3>
                <p>${place.description}</p>
                <div class="popup-attributes">${place.attributes.map(attr => attributeNames[attr] || attr).join('')}</div>
              </div>
              <div class="popup-links">
                <a href="${place.instagram}" target="_blank">
                  <img src="https://paulbrsv.github.io/goodplaces/image/instagram.svg" alt="Instagram" class="icon">
                </a>
                <a href="${place.maps_url}" target="_blank">
                  <img src="https://paulbrsv.github.io/goodplaces/image/google.svg" alt="Google Maps" class="icon">
                </a>
              </div>
            </div>
          </div>
        `;

        // Создаём временный маркер с подсвеченной иконкой
        tempMarker = L.marker([place.lat, place.lng], {
          icon: L.divIcon({
            className: 'highlighted-marker',
            html: '<img src="https://paulbrsv.github.io/goodplaces/image/mark.svg" style="width: 48px; height: 48px;">',
            iconSize: [48, 48],
            iconAnchor: [24, 12] // Центр иконки
          })
        });

        tempMarker.bindPopup(popupContent, {
          autoPan: true,
          autoPanPaddingTopLeft: L.point(0, 100),
          autoPanPaddingBottomRight: L.point(0, 50)
        });

        tempMarker.addTo(map).openPopup();
        map.setView([place.lat, place.lng], 18, { animate: true });

        // При открытии попапа подсвечиваем оригинальный маркер в кластере
        highlightMarker(place.name);

        // Обработчик закрытия попапа
        tempMarker.on('popupclose', () => {
          map.removeLayer(tempMarker);
          tempMarker = null;
          resetHighlight(); // Сбрасываем подсветку оригинального маркера
        });
      }
    };

    if (bounds.contains([place.lat, place.lng])) {
      visibleList.appendChild(placeElement);
    } else {
      outsideList.appendChild(placeElement);
    }
  });
}

function showMobilePlaceCard(place) {
  const card = document.getElementById('mobile-place-card');
  const header = card.querySelector('.mobile-place-card-header');
  const content = card.querySelector('.mobile-place-card-content');

  const attributesHtml = place.attributes.map(attr => attributeNames[attr] || attr).join('');
  header.innerHTML = `
    <div class="mobile-place-card-attributes">${attributesHtml}</div>
    <span class="close-card">✕</span>
  `;

  content.innerHTML = `
    <img src="${place.image}" alt="${place.name}">
    <div class="popup-text">
      <div class="popup-text-content">
        <h3>${place.name}</h3>
        <p>${place.description}</p>
      </div>
      <div class="popup-links">
        <a href="${place.instagram}" target="_blank"><img src="https://paulbrsv.github.io/goodplaces/image/instagram.svg" alt="Instagram" class="icon"></a>
        <a href="${place.maps_url}" target="_blank"><img src="https://paulbrsv.github.io/goodplaces/image/google.svg" alt="Google Maps" class="icon"></a>
      </div>
    </div>
  `;
  card.classList.remove('hidden');
  card.classList.add('active');
}

function closeSidebar() {
  const sidebar = document.getElementById('sidebar');
  const closeButton = document.querySelector('.mobile-sidebar-close');
  const toggleButton = document.querySelector('.mobile-list-toggle');

  sidebar.style.transform = 'translateX(-100%)';
  closeButton.style.display = 'none';
  if (window.innerWidth <= 768) {
    toggleButton.style.display = 'block';
  }
  resetHighlight();
}

function highlightMarker(placeName) {
  if (highlightedMarker) {
    resetHighlight();
  }
  if (markers[placeName]) {
    const marker = markers[placeName];
    const highlightedIcon = L.divIcon({
      className: 'highlighted-marker',
      html: '<img src="https://paulbrsv.github.io/goodplaces/image/mark.svg" style="width: 48px; height: 48px;">',
      iconSize: [48, 48],
      iconAnchor: [24, 12] // Центр иконки
    });
    marker.setIcon(highlightedIcon);
    highlightedMarker = marker;
    map.setView(marker.getLatLng(), map.getZoom(), { animate: true });
  }
}

function resetHighlight() {
  if (highlightedMarker) {
    const defaultIcon = L.divIcon({
      className: 'default-marker',
      html: '<div style="background-color: #3388ff; width: 10px; height: 10px; border-radius: 50%; border: 3px solid #ffffff; box-shadow: 0 0 0 2px #3388ff;"></div>',
      iconSize: [16, 16],
      iconAnchor: [8, 8]
    });
    highlightedMarker.setIcon(defaultIcon);
    highlightedMarker = null;
  }
}

document.querySelector('.mobile-list-toggle').addEventListener('click', () => {
  const sidebar = document.getElementById('sidebar');
  const closeButton = document.querySelector('.mobile-sidebar-close');
  const isHidden = sidebar.style.transform === 'translateX(-100%)' || sidebar.classList.contains('hidden-mobile');

  if (isHidden) {
    sidebar.style.transform = 'translateX(0)';
    sidebar.classList.remove('hidden-mobile');
    // Добавляем сброс прокрутки
    sidebar.scrollTop = 0; // Сбрасываем прокрутку в начало
    if (window.innerWidth <= 768) {
      closeButton.style.display = 'flex';
      document.querySelector('.mobile-list-toggle').style.display = 'none';
    }
  } else {
    closeSidebar();
  }
});

document.addEventListener('DOMContentLoaded', () => {
  const toggleButton = document.querySelector('.mobile-list-toggle');
  const updateToggleVisibility = () => {
    if (window.innerWidth > 768) {
      toggleButton.style.display = 'none';
    } else {
      toggleButton.style.display = 'block';
    }
  };

  updateToggleVisibility();

  window.addEventListener('resize', updateToggleVisibility);

  document.getElementById('mobile-place-card').addEventListener('click', (e) => {
    if (e.target.classList.contains('close-card')) {
      const card = document.getElementById('mobile-place-card');
      card.classList.remove('active');
      setTimeout(() => {
        card.classList.add('hidden');
        resetHighlight();
      }, 300);
    }
  });

  function showTooltip(element, text) {
    let tooltip = element.querySelector('.custom-tooltip');
    if (!tooltip) {
      tooltip = document.createElement('div');
      tooltip.className = 'custom-tooltip';
      tooltip.textContent = text;
      element.appendChild(tooltip);
    }

    const rect = element.getBoundingClientRect();
    const tooltipWidth = tooltip.offsetWidth;
    const windowWidth = window.innerWidth;

    tooltip.style.top = `-${tooltip.offsetHeight + 5}px`;

    let leftPos = (element.offsetWidth - tooltipWidth) / 2;
    const elementLeft = rect.left;

    if (elementLeft + leftPos < 0) {
      leftPos = -elementLeft + 5;
    } else if (elementLeft + leftPos + tooltipWidth > windowWidth) {
      leftPos = windowWidth - elementLeft - tooltipWidth - 5;
    }

    tooltip.style.left = `${leftPos}px`;
    tooltip.style.visibility = 'visible';
  }

  function hideTooltip(element) {
    const tooltip = element.querySelector('.custom-tooltip');
    if (tooltip) {
      tooltip.style.visibility = 'hidden';
    }
  }

  const filters = document.querySelectorAll('.filter');
  filters.forEach(filter => {
    const filterId = filter.dataset.filter;
    if (!filterId) return;
    const tooltipText = filterTooltips[filterId] || "Описание отсутствует";
    filter.addEventListener('mouseenter', () => showTooltip(filter, tooltipText));
    filter.addEventListener('mouseleave', () => hideTooltip(filter));
  });

  fetch('places.json')
    .then(response => response.json())
    .then(data => {
      placesData = data;
      updateMap();
    })
    .catch(error => console.error('Ошибка загрузки данных:', error));

    map.on('moveend', () => {
    updateSidebar(placesData.filter(place => {
      if (activeFilters.length === 0) return true;
      return place.attributes.some(attr => activeFilters.includes(attr));
    }));
  });
});

document.querySelector('.mobile-sidebar-close').addEventListener('click', () => {
  closeSidebar();
});

console.log('MAIN.JS CARGADO');

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
  
  // ===============================
  // 1. VERIFICAR QUE EL CONTENEDOR EXISTA
  // ===============================
  const mapContainer = document.getElementById('map');
  if (!mapContainer) {
    console.error('ERROR: No se encontró el elemento con id="map"');
    return;
  }
  
  // ===============================
  // 2. MAPA BASE
  // ===============================
  const map = L.map('map').setView([-1.8, -78.5], 7);
  console.log('Mapa inicializado en:', map.getCenter());

  // OpenStreetMap
  const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19
  }).addTo(map);

  // ===============================
  // 3. VARIABLE CAPA
  // ===============================
  let capaNSE;

  // ===============================
  // 4. FUNCIÓN COLORES NSE
  // ===============================
  function getColorNSE(nse) {
    return nse === 'A (Alto)'         ? '#01ff05' :
           nse === 'B (Medio Alto)'  ? '#59c72d' :
           nse === 'C+ (Medio)'      ? '#d2c09c' :
           nse === 'C- (Medio Bajo)' ? '#ff8801' :
           nse === 'D (Bajo)'        ? '#ff012b' :
                                      '#cccccc';
  }

  // ===============================
  // 5. POPUPS
  // ===============================
  function onEachFeature(feature, layer) {
    if (feature.properties) {
      let popup = '<div class="popup-content"><b>Información</b><br>';
      for (const key in feature.properties) {
        popup += `<b>${key}:</b> ${feature.properties[key]}<br>`;
      }
      popup += '</div>';
      layer.bindPopup(popup);
    }
  }

  // ===============================
  // 6. CARGAR GEOJSON
  // ===============================
  fetch('./data/nse_valle.geojson')
    .then(response => {
      console.log('STATUS:', response.status);
      if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
      }
      return response.json();
    })
    .then(data => {
      console.log('GeoJSON cargado, features:', data.features ? data.features.length : 'no features');
      
      // Verificar que el GeoJSON tenga features
      if (!data.features || data.features.length === 0) {
        console.error('ERROR: El GeoJSON no contiene features');
        return;
      }
      
      capaNSE = L.geoJSON(data, {
        style: function (feature) {
          const nse = feature.properties ? feature.properties["NSE Predominante"] : null;
          return {
            fillColor: getColorNSE(nse),
            weight: 0.6,
            color: '#333',
            fillOpacity: 0.8
          };
        },
        onEachFeature: onEachFeature
      }).addTo(map);
      
      console.log('Capa agregada al mapa, bounds:', capaNSE.getBounds());
      
      // Ajustar vista al GeoJSON
      if (capaNSE.getBounds().isValid()) {
        map.fitBounds(capaNSE.getBounds());
      } else {
        console.warn('Bounds no válidos, manteniendo vista por defecto');
      }

      // ===============================
      // 7. CONTROL DE CAPAS
      // ===============================
      const baseMaps = {
        "OpenStreetMap": osm
      };
      const overlayMaps = {
        "NSE Valle": capaNSE
      };

      L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
      }).addTo(map);
      
    })
    .catch(error => {
      console.error('ERROR cargando GeoJSON:', error);
      // Mostrar mensaje de error en el mapa
      L.popup()
        .setLatLng([-1.8, -78.5])
        .setContent(`<b>Error:</b> No se pudo cargar el GeoJSON<br>${error.message}`)
        .openOn(map);
    });
  
});

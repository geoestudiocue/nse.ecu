console.log('MAIN.JS CARGADO');

// ===============================
// 1. MAPA BASE
// ===============================
const map = L.map('map').setView([-1.8, -78.5], 7);

// OpenStreetMap
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// ===============================
// 2. VARIABLE CAPA
// ===============================
let capaNSE;

// ===============================
// 3. FUNCIÓN COLORES NSE
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
// 4. POPUPS
// ===============================
function onEachFeature(feature, layer) {
  if (feature.properties) {
    let popup = '<b>Información</b><br>';
    for (const key in feature.properties) {
      popup += `<b>${key}:</b> ${feature.properties[key]}<br>`;
    }
    layer.bindPopup(popup);
  }
}

// ===============================
// 5. CARGAR GEOJSON
// ===============================
fetch('./data/nse_valle.geojson')
  .then(response => {
    console.log('STATUS:', response.status);
    return response.json();
  })
  .then(data => {
    console.log('GeoJSON cargado');

    capaNSE = L.geoJSON(data, {
      style: function (feature) {
        return {
          fillColor: getColorNSE(feature.properties["NSE Predominante"]),
          weight: 0.6,
          color: '#333',
          fillOpacity: 0.8
        };
      },
      onEachFeature: onEachFeature
    }).addTo(map);

    map.fitBounds(capaNSE.getBounds());

    // ===============================
    // 6. CONTROL DE CAPAS
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
  .catch(error => console.error('ERROR:', error));

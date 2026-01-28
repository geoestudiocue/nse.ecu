// ===============================
// 1. MAPA BASE
// ===============================
const map = L.map('map').setView([-1.8, -78.5], 7);

// OpenStreetMap
const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// ===============================
// 2. VARIABLES PARA CAPAS
// ===============================
let capaNSE;
let capaValle;

// ===============================
// 3. FUNCION PARA POPUPS
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
// 4. CARGAR NSE
// ===============================
fetch('data/nse.geojson')
  .then(res => res.json())
  .then(data => {
    capaNSE = L.geoJSON(data, {
      style: {
        color: 'red',
        weight: 2
      },
      onEachFeature: onEachFeature
    });

    capaNSE.addTo(map);
    map.fitBounds(capaNSE.getBounds());
  });

// ===============================
// 5. CARGAR VALLE
// ===============================
fetch('data/nse_valle.geojson')
  .then(res => res.json())
  .then(data => {
    capaValle = L.geoJSON(data, {
      style: {
        color: 'blue',
        weight: 2
      },
      onEachFeature: onEachFeature
    });
  });

// ===============================
// 6. CONTROL DE CAPAS
// ===============================
const baseMaps = {
  "OpenStreetMap": osm
};

const overlayMaps = {
  "NSE": capaNSE,
  "NSE Valle": capaValle
};

// ⚠️ Esperar a que carguen
setTimeout(() => {
  L.control.layers(baseMaps, overlayMaps, {
    collapsed: false
  }).addTo(map);
}, 1000);

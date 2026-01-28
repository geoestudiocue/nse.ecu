// Crear el mapa
const map = L.map('map').setView([-1.83, -78.18], 7);

// Capa base OpenStreetMap
L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: '&copy; OpenStreetMap contributors'
}).addTo(map);

// Cargar GeoJSON
fetch('data/nse.geojson')
  .then(response => response.json())
  .then(data => {
    L.geoJSON(data, {
      style: {
        color: 'red',
        weight: 2
      }
    }).addTo(map);
  })
  .catch(error => console.error('Error cargando GeoJSON:', error));

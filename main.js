console.log('MAIN.JS CARGADO');

// Esperar a que el DOM esté completamente cargado
document.addEventListener('DOMContentLoaded', function() {
  
  // ===============================
  // 1. MAPA BASE - Inicializar sin vista fija
  // ===============================
  const map = L.map('map').setView([-1.8, -78.5], 7);
  
  // Capa base con mejor control de errores
  const osm = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '&copy; OpenStreetMap contributors',
    maxZoom: 19,
    minZoom: 3,
    noWrap: true,
    errorTileUrl: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg=='
  }).addTo(map);

  // ===============================
  // 2. FUNCIÓN COLORES NSE
  // ===============================
  function getColorNSE(nse) {
    if (!nse) return '#cccccc';
    
    return nse === 'A (Alto)'         ? '#01ff05' :
           nse === 'B (Medio Alto)'  ? '#59c72d' :
           nse === 'C+ (Medio)'      ? '#d2c09c' :
           nse === 'C- (Medio Bajo)' ? '#ff8801' :
           nse === 'D (Bajo)'        ? '#ff012b' :
                                      '#cccccc';
  }

  // ===============================
  // 3. CARGAR GEOJSON
  // ===============================
  console.log('Intentando cargar GeoJSON...');
  
  // IMPORTANTE: Verifica la ruta exacta en GitHub
  fetch('data/nse_valle.geojson')
    .then(response => {
      console.log('Response status:', response.status, response.statusText);
      
      if (!response.ok) {
        throw new Error(`Error HTTP: ${response.status} ${response.statusText}`);
      }
      
      return response.text(); // Primero como texto para debug
    })
    .then(text => {
      console.log('GeoJSON recibido (primeros 500 chars):', text.substring(0, 500));
      
      // Intentar parsear como JSON
      let data;
      try {
        data = JSON.parse(text);
      } catch (e) {
        console.error('Error parseando JSON:', e);
        throw new Error('GeoJSON inválido');
      }
      
      console.log('GeoJSON parseado correctamente');
      console.log('Número de features:', data.features ? data.features.length : 0);
      
      // Verificar que sea un GeoJSON válido
      if (!data.type || data.type !== 'FeatureCollection') {
        console.error('No es un FeatureCollection:', data.type);
        throw new Error('No es un GeoJSON válido (FeatureCollection)');
      }
      
      if (!data.features || data.features.length === 0) {
        console.warn('GeoJSON sin features');
        // Mostrar mensaje pero continuar
        L.popup()
          .setLatLng([-1.8, -78.5])
          .setContent('<b>Advertencia:</b> El GeoJSON no contiene features')
          .openOn(map);
        return;
      }
      
      // Mostrar info del primer feature para debug
      const firstFeature = data.features[0];
      console.log('Primer feature:', {
        type: firstFeature.type,
        geometryType: firstFeature.geometry ? firstFeature.geometry.type : 'sin geometría',
        properties: firstFeature.properties
      });

      // ===============================
      // 4. CREAR CAPA
      // ===============================
      const capaNSE = L.geoJSON(data, {
        style: function (feature) {
          const nse = feature.properties ? feature.properties["NSE Predominante"] : null;
          return {
            fillColor: getColorNSE(nse),
            weight: 1.5, // Línea más gruesa para mejor visibilidad
            color: '#000000',
            opacity: 0.8,
            fillOpacity: 0.7
          };
        },
        onEachFeature: function(feature, layer) {
          if (feature.properties) {
            let popupContent = '<div style="max-height: 300px; overflow-y: auto;">';
            popupContent += '<h4>Información</h4>';
            
            for (const [key, value] of Object.entries(feature.properties)) {
              popupContent += `<p><strong>${key}:</strong> ${value || 'N/A'}</p>`;
            }
            
            popupContent += '</div>';
            layer.bindPopup(popupContent);
          }
        }
      }).addTo(map);
      
      console.log('Capa creada y añadida al mapa');
      
      // ===============================
      // 5. AJUSTAR VISTA
      // ===============================
      if (capaNSE.getBounds().isValid()) {
        const bounds = capaNSE.getBounds();
        console.log('Bounds válidos:', bounds);
        
        // Ajustar con padding
        map.fitBounds(bounds, {
          padding: [50, 50],
          maxZoom: 12
        });
        
        // También centrar el mapa
        const center = bounds.getCenter();
        console.log('Centro del GeoJSON:', center);
        map.setView(center, 9, { animate: true });
      } else {
        console.warn('Bounds no válidos, usando vista por defecto');
        map.setView([-1.8, -78.5], 9);
      }

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
        collapsed: false,
        position: 'topright'
      }).addTo(map);
      
      // ===============================
      // 7. ESCALA
      // ===============================
      L.control.scale({
        position: 'bottomleft',
        metric: true,
        imperial: false
      }).addTo(map);
      
    })
    .catch(error => {
      console.error('ERROR completo:', error);
      
      // Mensaje de error más detallado
      const errorMsg = `
        <div style="padding: 10px;">
          <h4 style="color: red;">Error cargando datos</h4>
          <p><strong>Mensaje:</strong> ${error.message}</p>
          <p><strong>Posibles causas:</strong></p>
          <ul>
            <li>El archivo GeoJSON no existe en la ruta: <code>data/nse_valle.geojson</code></li>
            <li>El archivo tiene formato incorrecto</li>
            <li>Problema de permisos en GitHub Pages</li>
          </ul>
          <p>Verifica la consola para más detalles.</p>
        </div>
      `;
      
      L.popup()
        .setLatLng([-1.8, -78.5])
        .setContent(errorMsg)
        .openOn(map);
    });

  // ===============================
  // 8. CONTROL DE LOCALIZACIÓN (opcional)
  // ===============================
  setTimeout(() => {
    console.log('Vista actual del mapa:', {
      center: map.getCenter(),
      zoom: map.getZoom(),
      bounds: map.getBounds()
    });
  }, 1000);
  
});

import { colors } from '../theme/colors';

export interface RegionalMapCoordinate {
  latitude: number;
  longitude: number;
}

export interface RegionalMapPoint extends RegionalMapCoordinate {
  key: string;
  city: string;
  state: string;
  professionalCount: number;
}

export interface RegionalMapRegion extends RegionalMapCoordinate {
  latitudeDelta: number;
  longitudeDelta: number;
}

export function buildRegionalMapHtml(region: RegionalMapRegion, points: RegionalMapPoint[], showZoomControls = true, compactMarkers = false) {
  const payload = JSON.stringify({ region, points }).replaceAll('<', '\\u003c');
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
      html, body, #map { width: 100%; height: 100%; margin: 0; background: ${colors.background}; }
      body { font-family: Arial, sans-serif; }
      .leaflet-container { background: ${colors.background}; }
      .leaflet-popup-content { color: ${colors.text}; font-size: 13px; line-height: 1.4; }
      .professional-marker { width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; border: 3px solid ${colors.white}; border-radius: 50%; color: ${colors.white}; background: ${colors.primary}; box-shadow: 0 3px 10px rgba(16, 45, 45, 0.28); font-size: 16px; font-weight: 800; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      const payload = ${payload};
      const delta = Math.max(payload.region.latitudeDelta, payload.region.longitudeDelta);
      const zoom = delta > 20 ? 4 : delta > 8 ? 5 : delta > 3 ? 7 : delta > 1 ? 9 : delta > 0.3 ? 11 : 13;
      const map = L.map('map', { zoomControl: ${showZoomControls} }).setView([payload.region.latitude, payload.region.longitude], zoom);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        maxZoom: 19,
        attribution: '&copy; OpenStreetMap contributors'
      }).addTo(map);
      L.circleMarker([payload.region.latitude, payload.region.longitude], {
        radius: 7,
        color: '${colors.primary}',
        fillColor: '${colors.accent}',
        fillOpacity: 1,
        weight: 3
      }).addTo(map).bindPopup('Centro da busca');
      payload.points.forEach(point => {
        const popup = document.createElement('div');
        const title = document.createElement('strong');
        title.textContent = point.city + ', ' + point.state;
        popup.appendChild(title);
        popup.appendChild(document.createElement('br'));
        popup.appendChild(document.createTextNode(point.professionalCount + ' profissional(is)'));
        const markerOptions = ${compactMarkers}
          ? { icon: L.divIcon({ className: '', html: '<div class="professional-marker">' + point.professionalCount + '</div>', iconSize: [42, 42], iconAnchor: [21, 21] }) }
          : {};
        L.marker([point.latitude, point.longitude], markerOptions)
          .addTo(map)
          .bindPopup(popup);
      });
    </script>
  </body>
</html>`;
}

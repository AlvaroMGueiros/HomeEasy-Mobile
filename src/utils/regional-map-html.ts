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

export function buildRegionalMapHtml(
  region: RegionalMapRegion,
  points: RegionalMapPoint[],
  showZoomControls = true,
  compactMarkers = false
) {
  const payload = JSON.stringify({ region, points }).replaceAll('<', '\\u003c');
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
    <link rel="stylesheet" href="https://unpkg.com/leaflet@1.9.4/dist/leaflet.css" />
    <style>
      html, body, #map { width: 100%; height: 100%; margin: 0; background: ${colors.background}; }
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
      .leaflet-container { background: ${colors.background}; }
      .leaflet-popup-content-wrapper { border-radius: 16px; box-shadow: 0 4px 18px rgba(0,0,0,0.18); }
      .leaflet-popup-content { color: ${colors.text}; font-size: 13px; line-height: 1.4; margin: 12px 14px; }
      .popup-box { cursor: pointer; text-align: center; }
      .popup-title { font-size: 14px; font-weight: 800; color: ${colors.text}; margin-bottom: 2px; }
      .popup-count { font-size: 12px; color: ${colors.textMuted}; margin-bottom: 6px; }
      .popup-btn { display: inline-block; background: ${colors.primary}; color: ${colors.white}; font-weight: 700; font-size: 11px; padding: 5px 12px; border-radius: 20px; text-decoration: none; }
      .professional-marker { cursor: pointer; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; border: 3px solid ${colors.white}; border-radius: 50%; color: ${colors.white}; background: ${colors.primary}; box-shadow: 0 3px 10px rgba(16, 45, 45, 0.28); font-size: 16px; font-weight: 800; }
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script src="https://unpkg.com/leaflet@1.9.4/dist/leaflet.js"></script>
    <script>
      function notifyCity(city, state) {
        if (window.ReactNativeWebView && window.ReactNativeWebView.postMessage) {
          window.ReactNativeWebView.postMessage(JSON.stringify({ type: 'SELECT_CITY', city: city, state: state }));
        }
      }

      const payload = ${payload};
      const delta = Math.max(payload.region.latitudeDelta, payload.region.longitudeDelta);
      const zoom = delta > 20 ? 4 : delta > 8 ? 5 : delta > 3 ? 7 : delta > 1 ? 9 : delta > 0.3 ? 11 : 13;
      const map = L.map('map', {
        zoomControl: ${showZoomControls},
        dragging: true,
        touchZoom: true,
        doubleClickZoom: true,
        boxZoom: true,
        keyboard: true,
        scrollWheelZoom: true
      }).setView([payload.region.latitude, payload.region.longitude], zoom);
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
      }).addTo(map).bindPopup('Sua localização');

      payload.points.forEach(point => {
        const popupHtml = '<div class="popup-box" onclick="notifyCity(\\'' + point.city.replace(/'/g, "\\\\'") + '\\', \\'' + point.state + '\\')">' +
          '<div class="popup-title">' + point.city + ', ' + point.state + '</div>' +
          '<div class="popup-count">' + point.professionalCount + ' profissional(is)</div>' +
          '<span class="popup-btn">Ver profissionais &rarr;</span>' +
        '</div>';

        const markerOptions = ${compactMarkers}
          ? { icon: L.divIcon({ className: '', html: '<div class="professional-marker">' + point.professionalCount + '</div>', iconSize: [42, 42], iconAnchor: [21, 21] }) }
          : {};

        const marker = L.marker([point.latitude, point.longitude], markerOptions)
          .addTo(map)
          .bindPopup(popupHtml);
      });
    </script>
  </body>
</html>`;
}

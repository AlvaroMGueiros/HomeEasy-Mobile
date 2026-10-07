import { colors } from '../theme/colors';
import { leafletCss, leafletJavascript } from '../vendor/leaflet';
import { RegionalMapMessageType } from './regional-map-message';

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

function resolveMapZoom(region: RegionalMapRegion) {
  const delta = Math.max(region.latitudeDelta, region.longitudeDelta);
  if (delta <= 0.01) return 16;
  if (delta > 20) return 4;
  if (delta > 8) return 5;
  if (delta > 3) return 7;
  if (delta > 1) return 9;
  if (delta > 0.3) return 11;
  return 13;
}

export function buildRegionalMapHtml(region: RegionalMapRegion, points: RegionalMapPoint[], showZoomControls = true, compactMarkers = false, centerLabel = 'Sua localização') {
  const payload = JSON.stringify({ region, points, centerLabel }).replaceAll('<', '\\u003c');
  return `<!doctype html>
<html lang="pt-BR">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no" />
    <style>${leafletCss}</style>
    <style>
      html, body, #map { width: 100%; height: 100%; margin: 0; background: ${colors.background}; }
      body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif; }
      .leaflet-container { background: ${colors.background}; }
      .leaflet-popup-content-wrapper { border-radius: 16px; }
      .leaflet-popup-content { color: ${colors.text}; font-size: 13px; line-height: 1.4; margin: 12px 14px; }
      .popup-box { text-align: center; }
      .popup-title { font-size: 14px; font-weight: 800; margin-bottom: 2px; }
      .popup-count { font-size: 12px; color: ${colors.textMuted}; margin-bottom: 6px; }
      .popup-button { border: none; background: ${colors.primary}; color: ${colors.white}; font-weight: 700; font-size: 12px; padding: 10px 16px; border-radius: 20px; cursor: pointer; }
      .professional-marker { box-sizing: border-box; width: 42px; height: 42px; display: flex; align-items: center; justify-content: center; border: 3px solid ${colors.white}; border-radius: 50%; color: ${colors.white}; background: ${colors.primary}; box-shadow: 0 3px 10px ${colors.mapShadow}; font-size: 16px; font-weight: 800; }
      .professional-pin { border-radius: 50% 50% 50% 4px; transform: rotate(-45deg); }
      .professional-pin span { transform: rotate(45deg); }
      ${compactMarkers ? '.leaflet-bottom.leaflet-left .leaflet-control-attribution { margin: 0 0 26px 12px; border-radius: 4px; }' : ''}
    </style>
  </head>
  <body>
    <div id="map"></div>
    <script>
      function notifyMap(message) {
        if (window.ReactNativeWebView) window.ReactNativeWebView.postMessage(JSON.stringify(message));
      }
      window.addEventListener('error', function () { notifyMap({ type: '${RegionalMapMessageType.Error}' }); });
    </script>
    <script>${leafletJavascript.replaceAll('</script', '<\\/script')}</script>
    <script>
      try {
        var payload = ${payload};
        var map = L.map('map', { zoomControl: ${showZoomControls}, dragging: true, touchZoom: true, doubleClickZoom: true, scrollWheelZoom: true })
          .setView([payload.region.latitude, payload.region.longitude], ${resolveMapZoom(region)});
        if (${compactMarkers}) map.attributionControl.setPosition('bottomleft');
        var loadedTileCount = 0;
        var tileDeadline;
        var tiles = L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        });
        tiles.on('loading', function () {
          loadedTileCount = 0;
          clearTimeout(tileDeadline);
          tileDeadline = setTimeout(function () {
            if (!loadedTileCount) notifyMap({ type: '${RegionalMapMessageType.Error}' });
          }, 15000);
        });
        tiles.on('tileload', function () {
          loadedTileCount += 1;
          clearTimeout(tileDeadline);
          if (loadedTileCount === 1) notifyMap({ type: '${RegionalMapMessageType.Ready}' });
        });
        tiles.on('load', function () {
          if (!loadedTileCount) notifyMap({ type: '${RegionalMapMessageType.Error}' });
        });
        tiles.addTo(map);
        var centerPopup = document.createElement('div');
        centerPopup.textContent = payload.centerLabel;
        L.circleMarker([payload.region.latitude, payload.region.longitude], {
          radius: 7, color: '${colors.primary}', fillColor: '${colors.accent}', fillOpacity: 1, weight: 3
        }).addTo(map).bindPopup(centerPopup);
        payload.points.forEach(function (point) {
          var popup = document.createElement('div');
          popup.className = 'popup-box';
          var title = document.createElement('div');
          title.className = 'popup-title';
          title.textContent = point.city + ', ' + point.state;
          var count = document.createElement('div');
          count.className = 'popup-count';
          count.textContent = point.professionalCount + ' profissional(is)';
          var button = document.createElement('button');
          button.className = 'popup-button';
          button.textContent = 'Ver profissionais →';
          button.addEventListener('click', function () {
            notifyMap({ type: '${RegionalMapMessageType.SelectCity}', city: point.city, state: point.state });
          });
          popup.appendChild(title);
          popup.appendChild(count);
          popup.appendChild(button);
          var markerClass = 'professional-marker';
          if (!${compactMarkers}) markerClass += ' professional-pin';
          var markerLabel = document.createElement('div');
          markerLabel.className = markerClass;
          var markerCount = document.createElement('span');
          markerCount.textContent = String(point.professionalCount);
          markerLabel.appendChild(markerCount);
          L.marker([point.latitude, point.longitude], {
            icon: L.divIcon({ className: '', html: markerLabel, iconSize: [42, 42], iconAnchor: [21, 21] })
          }).addTo(map).bindPopup(popup);
        });
        window.addEventListener('resize', function () { map.invalidateSize(); });
      } catch (error) {
        notifyMap({ type: '${RegionalMapMessageType.Error}' });
      }
    </script>
  </body>
</html>`;
}

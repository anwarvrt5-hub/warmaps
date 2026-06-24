/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useEffect, useRef } from 'react';
import * as L from 'leaflet';
import { TrackerResult } from '../types';

interface TrackerMapProps {
  results: TrackerResult[];
  activeResult: TrackerResult | null;
  mapStyle: 'dark' | 'street' | 'satellite';
  accentColor: string;
}

const TILE_LAYERS = {
  dark: {
    url: 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors &copy; <a href="https://carto.com/attributions">CARTO</a>'
  },
  street: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: 'Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community'
  }
};

export default function TrackerMap({ results, activeResult, mapStyle, accentColor }: TrackerMapProps) {
  const mapContainerRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersRef = useRef<L.Marker[]>([]);

  // 1. Initialize Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;

    // Create map instance
    const initialLat = activeResult?.lat ?? -6.914744;
    const initialLon = activeResult?.lon ?? 107.609810;
    const initialZoom = activeResult ? 12 : 3;

    const map = L.map(mapContainerRef.current, {
      center: [initialLat, initialLon],
      zoom: initialZoom,
      zoomControl: false, // will place it custom or keep it default hidden
      attributionControl: true
    });

    mapRef.current = map;

    // Add zoom control to bottom right
    L.control.zoom({ position: 'bottomright' }).addTo(map);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
  }, []);

  // 2. Update Tile Layer on mapStyle change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove existing layer if it exists
    if (tileLayerRef.current) {
      tileLayerRef.current.remove();
    }

    const layerConfig = TILE_LAYERS[mapStyle] || TILE_LAYERS.dark;
    const newLayer = L.tileLayer(layerConfig.url, {
      attribution: layerConfig.attribution,
      maxZoom: 18
    });

    newLayer.addTo(map);
    tileLayerRef.current = newLayer;
  }, [mapStyle]);

  // 3. Render Markers based on results list
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    // Clear previous markers
    markersRef.current.forEach(m => m.remove());
    markersRef.current = [];

    // Custom Glowing Pulse Marker DivIcon
    const createPulseIcon = (color: string, label: string) => {
      return L.divIcon({
        className: 'custom-pulse-marker',
        html: `
          <div class="relative flex items-center justify-center">
            <div class="absolute w-8 h-8 rounded-full animate-ping opacity-50" style="background-color: ${color}"></div>
            <div class="relative w-4 h-4 rounded-full border border-white shadow-md flex items-center justify-center" style="background-color: ${color}">
              <div class="w-1.5 h-1.5 rounded-full bg-white"></div>
            </div>
            <div class="absolute top-5 left-1/2 -translate-x-1/2 bg-[#0a0c14] border border-[#1e2433] text-[10px] text-white px-1.5 py-0.5 rounded font-mono whitespace-nowrap shadow-md pointer-events-none">
              ${label}
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });
    };

    // Plot all markers
    results.forEach(item => {
      const isCurrentlyActive = activeResult?.id === item.id;
      const markerColor = isCurrentlyActive ? accentColor : '#8892a8';
      const labelText = item.phone || item.ip;

      const marker = L.marker([item.lat, item.lon], {
        icon: createPulseIcon(markerColor, labelText)
      });

      // Bind simple popup
      marker.bindPopup(`
        <div class="p-2 font-mono text-[11px] bg-[#0a0c14] text-[#e8edf5] rounded border border-[#1e2433]">
          <div class="font-bold border-b border-[#1e2433] pb-1 mb-1" style="color: ${accentColor}">${labelText}</div>
          <div>Lokasi: ${item.city}, ${item.country}</div>
          <div>ISP: ${item.isp}</div>
          <div>IP: ${item.ip}</div>
          <div>Lat/Lon: ${item.lat.toFixed(4)}, ${item.lon.toFixed(4)}</div>
        </div>
      `, {
        className: 'custom-leaflet-popup'
      });

      marker.addTo(map);
      markersRef.current.push(marker);
    });

    // If multiple results and no specific active, fit bounds
    if (results.length > 1 && !activeResult) {
      const bounds = L.latLngBounds(results.map(r => [r.lat, r.lon]));
      map.fitBounds(bounds, { padding: [50, 50] });
    }
  }, [results, activeResult, accentColor]);

  // 4. Smooth FlyTo Active Target Location
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !activeResult) return;

    map.flyTo([activeResult.lat, activeResult.lon], 12, {
      animate: true,
      duration: 1.8
    });
  }, [activeResult]);

  return (
    <div className="relative w-full h-full min-h-[350px] md:min-h-[450px] bg-[#0c0e18]/80 border border-white/10 rounded-2xl overflow-hidden shadow-2xl backdrop-blur-xl">
      {/* Map Element */}
      <div ref={mapContainerRef} className="w-full h-full z-10" />

      {/* Embedded Compass Overlay */}
      <div className="absolute top-4 left-4 z-20 pointer-events-none bg-[#121624]/70 border border-white/10 rounded-xl p-3 font-mono text-[9px] text-[#8892a8] backdrop-blur-xl flex flex-col space-y-1 shadow-xl">
        <div className="flex items-center space-x-1">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-white font-bold">MAP SATELIT ONLINE</span>
        </div>
        {activeResult ? (
          <>
            <div>TARGET LAT: <span className="text-white">{activeResult.lat.toFixed(6)}</span></div>
            <div>TARGET LON: <span className="text-white">{activeResult.lon.toFixed(6)}</span></div>
            <div>PROV: <span className="text-white">{activeResult.province.toUpperCase()}</span></div>
            <div>KOTA: <span className="text-white">{activeResult.city.toUpperCase()}</span></div>
          </>
        ) : (
          <div>MENUNGGU LOKALISASI TARGET...</div>
        )}
      </div>
    </div>
  );
}

"use client";

import { useEffect, useRef } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMapEvents,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

// ─── Fix Leaflet's broken default icon in bundlers ───────────────────────────
const MARKER_ICON = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
});

// ─── Props ───────────────────────────────────────────────────────────────────

export interface LocationPickerMapProps {
  latitude: number | null | undefined;
  longitude: number | null | undefined;
  onLocationChange: (lat: number, lng: number) => void;
}

// ─── Click handler sub-component ─────────────────────────────────────────────

function ClickHandler({
  onLocationChange,
}: {
  onLocationChange: (lat: number, lng: number) => void;
}) {
  useMapEvents({
    click(e) {
      onLocationChange(e.latlng.lat, e.latlng.lng);
    },
  });
  return null;
}

// ─── Fly-to sub-component ─────────────────────────────────────────────────────
// Flies the map when coords change significantly (geocoding), but ignores
// small drags so the user's zoom level isn't reset.

function FlyToLocation({ lat, lng }: { lat: number; lng: number }) {
  const map = useMap();
  const prevRef = useRef<{ lat: number; lng: number } | null>(null);

  useEffect(() => {
    const prev = prevRef.current;
    prevRef.current = { lat, lng };

    if (prev !== null) {
      const dist = Math.hypot(lat - prev.lat, lng - prev.lng);
      // Ignore small adjustments (dragging) — threshold ≈ 200 m
      if (dist < 0.002) return;
    }

    map.flyTo([lat, lng], 15, { animate: true, duration: 0.8 });
  }, [lat, lng, map]);

  return null;
}

// ─── Main component ───────────────────────────────────────────────────────────

export function LocationPickerMap({
  latitude,
  longitude,
  onLocationChange,
}: LocationPickerMapProps) {
  const hasLocation =
    latitude != null &&
    longitude != null &&
    !isNaN(latitude) &&
    !isNaN(longitude);

  // Default to UK centre
  const center: [number, number] = hasLocation
    ? [latitude as number, longitude as number]
    : [52.5, -1.5];

  return (
    <MapContainer
      center={center}
      zoom={hasLocation ? 15 : 5}
      className="h-full w-full"
      scrollWheelZoom
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />

      <ClickHandler onLocationChange={onLocationChange} />

      {hasLocation && (
        <>
          <Marker
            position={[latitude as number, longitude as number]}
            icon={MARKER_ICON}
            draggable
            eventHandlers={{
              dragend(e) {
                const pos = (e.target as L.Marker).getLatLng();
                onLocationChange(pos.lat, pos.lng);
              },
            }}
          />
          <FlyToLocation lat={latitude as number} lng={longitude as number} />
        </>
      )}
    </MapContainer>
  );
}

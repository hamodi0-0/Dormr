"use client";

import { useEffect, useRef } from "react";
import "leaflet/dist/leaflet.css";

interface ListingDetailMapProps {
  latitude: number;
  longitude: number;
  title: string;
  address?: string;
}

export function ListingDetailMap({
  latitude,
  longitude,
  title,
  address,
}: ListingDetailMapProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<import("leaflet").Map | null>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    let map: import("leaflet").Map | null = null;

    const init = async () => {
      const L = (await import("leaflet")).default;

      // Guard: if the container already has a map instance attached, skip
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }

      // Guard: leaflet stamps the container — clear it if stale
      const container = containerRef.current;
      if (!container) return;

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if ((container as any)._leaflet_id) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        delete (container as any)._leaflet_id;
      }

      map = L.map(container, {
        zoomControl: true,
        scrollWheelZoom: true,
      }).setView([latitude, longitude], 15);

      mapRef.current = map;

      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution:
          '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
      }).addTo(map);

      const icon = L.icon({
        iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
        iconRetinaUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
        shadowUrl:
          "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
        iconSize: [25, 41],
        iconAnchor: [12, 41],
        popupAnchor: [1, -34],
        shadowSize: [41, 41],
      });

      const marker = L.marker([latitude, longitude], { icon }).addTo(map);

      const popupContent = [
        `<strong>${title}</strong>`,
        address
          ? `<span style="font-size:12px;color:#666">${address}</span>`
          : null,
      ]
        .filter(Boolean)
        .join("<br/>");

      marker.bindPopup(popupContent).openPopup();
    };

    init().catch(console.error);

    return () => {
      if (mapRef.current) {
        mapRef.current.remove();
        mapRef.current = null;
      }
    };
    // Re-init if coordinates change
  }, [latitude, longitude, title, address]);

  return (
    <div
      ref={containerRef}
      className="h-full w-full"
      style={{ minHeight: "300px" }}
    />
  );
}

"use client";

import { useEffect, useState } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import "leaflet/dist/leaflet.css";
import L from "leaflet";

// Fix Leaflet marker icon issue
const icon = L.icon({
  iconUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png",
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
  popupAnchor: [1, -34],
  shadowSize: [41, 41],
});

// Component to recenter map when coordinates change
function ChangeView({ center }: { center: [number, number] }) {
  const map = useMap();
  map.setView(center);
  return null;
}

interface MapProps {
  location: string;
}

export default function Map({ location }: MapProps) {
  const [coordinates, setCoordinates] = useState<[number, number] | null>(null);
  const [loading, setLoading] = useState(true);

  // Addis Ababa coordinates as fallback
  const fallbackPosition: [number, number] = [9.0305, 38.7469];
  const displayPosition = coordinates || fallbackPosition;

  useEffect(() => {
    const fetchCoordinates = async () => {
      try {
        setLoading(true);
        // Use Nominatim OpenStreetMap API for geocoding
        const response = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(
            location
          )}`
        );
        const data = await response.json();

        if (data && data.length > 0) {
          const lat = Number.parseFloat(data[0].lat);
          const lon = Number.parseFloat(data[0].lon);
          setCoordinates([lat, lon]);
        }
      } catch (error) {
        console.error("Error fetching coordinates:", error);
      } finally {
        setLoading(false);
      }
    };

    if (location) {
      fetchCoordinates();
    }
  }, [location]);

  return (
    <div className="h-full w-full relative z-0">
      <MapContainer
        center={displayPosition}
        zoom={13}
        scrollWheelZoom={false}
        className="h-full w-full rounded-lg"
        style={{ height: "100%", width: "100%" }}
      >
        <TileLayer
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
        />
        <Marker position={displayPosition} icon={icon}>
          <Popup>
            {location}
          </Popup>
        </Marker>
        <ChangeView center={displayPosition} />
      </MapContainer>
      
      {/* Loading overlay */}
      {loading && (
        <div className="absolute inset-0 bg-white/50 flex items-center justify-center z-[1000] rounded-lg">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
        </div>
      )}
    </div>
  );
}

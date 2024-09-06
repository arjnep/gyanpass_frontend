"use client";

import { SVGProps, useEffect, useState } from "react";
import {
  MapContainer,
  TileLayer,
  Marker,
  useMap,
  useMapEvents,
} from "react-leaflet";
import "leaflet/dist/leaflet.css";
import { Icon, LatLng } from "leaflet";
import { OpenStreetMapProvider } from "leaflet-geosearch";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

// Custom icon for the marker
export const customIcon = new Icon({
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  iconSize: [25, 41],
  iconAnchor: [12, 41],
});

type MapProps = {
  onLocationSelect: (lat: number, lng: number) => void; // Callback to pass location to parent
};

export default function MapWithSearchBar({ onLocationSelect }: MapProps) {
  const [clickedPosition, setClickedPosition] = useState<LatLng | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [searchTrigger, setSearchTrigger] = useState<boolean>(false);

  // Update map view to the searched location when search button is clicked
  useEffect(() => {
    const provider = new OpenStreetMapProvider();

    if (searchTrigger) {
      provider
        .search({ query: searchQuery })
        .then((results: any) => {
          if (results && results.length > 0) {
            const { x, y } = results[0]; // Get longitude (x) and latitude (y)
            const position = new LatLng(y, x); // Set marker position based on search result
            setClickedPosition(position);
            onLocationSelect(y, x); // Pass lat and lng to parent
          }
        })
        .catch((err: any) => console.error("Error searching location", err))
        .finally(() => setSearchTrigger(false)); // Reset the search trigger
    }
  }, [searchTrigger, onLocationSelect, searchQuery]);

  const LocationMarker = () => {
    const map = useMapEvents({
      click(e) {
        const latLng = e.latlng;
        setClickedPosition(latLng);
        onLocationSelect(latLng.lat, latLng.lng); // Pass lat and lng to parent
        map.flyTo(latLng, map.getZoom()); // Fly to the clicked location
      },
    });

    useEffect(() => {
      if (clickedPosition) {
        map.flyTo(clickedPosition, map.getZoom()); // Fly to the marker location
      }
    }, [clickedPosition, map]);

    return clickedPosition === null ? null : (
      <Marker position={clickedPosition} icon={customIcon} />
    );
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setSearchTrigger(true); // Trigger search when the button is clicked
  };

  return (
    <div>
      <div className="relative flex-grow mb-4 mx-auto w-full sm:w-[50%]">
        <Input
          type="text"
          value={searchQuery}
          placeholder="Search for a location"
          onChange={(e) => setSearchQuery(e.target.value)}
        />
        <Button onClick={handleSearch} className="absolute right-2.5 top-2 h-6 w-fit">
          Search
        </Button>
      </div>

      {/* Map */}
      <div className="relative w-full h-[400px] rounded-lg overflow-hidden">
        <MapContainer className="-z-0"
          center={[27.700769, 85.30014]} // Default center location (Kathmandu, Nepal)
          zoom={13}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />
          <LocationMarker />
        </MapContainer>
      </div>
    </div>
  );
}
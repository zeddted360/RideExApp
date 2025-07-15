import { useEffect, useRef } from "react";
import { Loader } from "@googlemaps/js-api-loader";

interface Branch {
  id: number;
  name: string;
  lat: number;
  lng: number;
  address: string;
}

export function useBranchMap(branches: Branch[], selectedBranch: number, googleMapsApiKey: string) {
  const mapRef = useRef<google.maps.Map | null>(null);
  const markerRef = useRef<google.maps.Marker | null>(null);

  useEffect(() => {
    if (!googleMapsApiKey) return;
    const loader = new Loader({
      apiKey: googleMapsApiKey,
      version: "weekly",
      libraries: ["places"],
    });
    loader.load().then(() => {
      const branch = branches.find((b) => b.id === selectedBranch);
      if (!branch) return;
      const mapDiv = document.getElementById("branch-map");
      if (!mapDiv) return;
      mapRef.current = new window.google.maps.Map(mapDiv, {
        center: { lat: branch.lat, lng: branch.lng },
        zoom: 14,
        mapTypeControl: false,
        streetViewControl: false,
      });
      markerRef.current = new window.google.maps.Marker({
        position: { lat: branch.lat, lng: branch.lng },
        map: mapRef.current,
        title: branch.name,
      });
    });
  }, [branches, selectedBranch, googleMapsApiKey]);

  return { mapRef, markerRef };
} 
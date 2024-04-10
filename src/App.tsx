import "./App.css";
import mapboxgl from "mapbox-gl";
import { useRef, useEffect, useState } from "react";

function App() {
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    const [lng, setLng] = useState(-70.9);
    const [lat, setLat] = useState(42.35);
    const [zoom, setZoom] = useState(9);

    mapboxgl.accessToken = import.meta.env
        .VITE_APP_MAPBOX_ACCESS_TOKEN as string;
    useEffect(() => {
        map.current = new mapboxgl.Map({
            container: mapContainer.current as HTMLElement,
            style: "mapbox://styles/mapbox/streets-v11",
            center: [lng, lat],
            zoom: zoom,
        });

        map.current.on("move", () => {
            setLng(parseFloat(map.current?.getCenter().lng.toFixed(4) || "0"));
            setLat(parseFloat(map.current?.getCenter().lat.toFixed(4) || "0"));
            setZoom(parseFloat(map.current?.getZoom().toFixed(2) || "0"));
        });
        return () => map.current?.remove();
    }, []);
    return <div className='' id='map' ref={mapContainer}></div>;
}

export default App;

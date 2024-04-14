import { useEffect, useRef } from "react";

const MapComponent = () => {
    const mapContainer = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        if (mapContainer.current) {
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: "mapbox://styles/mapbox/streets-v11",
                center: [lng.current, lat.current],
                zoom: zoom.current,
            });

            map.current.on("move", () => {
                const center = map.current?.getCenter();
                const zoomLevel = map.current?.getZoom();
                lng.current = parseFloat(center?.lng.toFixed(4) || "0");
                lat.current = parseFloat(center?.lat.toFixed(4) || "0");
                zoom.current = parseFloat(zoomLevel?.toFixed(2) || "0");
            });
        }

        // testing the cleanup function
        setRenderCount((prevRenderCount) => prevRenderCount + 1);

        return () => map.current?.remove();
    }, []);

    return <div className='h-[600px] w-[1284px]' ref={mapContainer}></div>;
};
export default MapComponent;

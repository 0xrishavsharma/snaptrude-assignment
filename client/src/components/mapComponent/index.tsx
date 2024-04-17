import mapboxgl from "mapbox-gl";
import Search from "../search";

type MapComponentProps = {
    map: React.MutableRefObject<mapboxgl.Map | null>;
    mapContainer: React.MutableRefObject<HTMLDivElement | null>;
    lng: number;
    lat: number;
    zoom: number;
    setLng: (lng: number) => void;
    setLat: (lat: number) => void;
    setZoom: (zoom: number) => void;
};

const MapComponent = ({
    lng,
    lat,
    zoom,
    setLng,
    setLat,
    setZoom,
    mapContainer,
}: MapComponentProps) => {
    return (
        <div className='h-[600px] w-[1284px]' ref={mapContainer}>
            <div className='relative'>
                <div className='absolute top-0 left-0 flex items-center justify-between px-2 py-3 m-3 w-[calc(100%_-_24px)] rounded-sm min-w-[560px]'>
                    <div className='whitespace-nowrap flex items-center justify-center h-12 gap-2 px-4 py-2 font-mono bg-gray-700 rounded'>
                        <span className='flex-1'>Longitude: {lng} | </span>
                        <span className='flex-1'> Latitude: {lat} | </span>
                        <span className='flex-1'> Zoom: {zoom}</span>
                    </div>
                    <Search setLng={setLng} setLat={setLat} setZoom={setZoom} />
                </div>
            </div>
        </div>
    );
};
export default MapComponent;

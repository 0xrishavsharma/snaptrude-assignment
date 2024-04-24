import mapboxgl from "mapbox-gl"
import Search from "../search"

type MapComponentProps = {
  map: React.MutableRefObject<mapboxgl.Map | null>
  mapContainer: React.MutableRefObject<HTMLDivElement | null>
  setLng: (lng: number) => void
  setLat: (lat: number) => void
  setZoom: (zoom: number) => void
  displayLng: number
  displayLat: number
  displayZoom: number
  setDisplayLng: (lng: number) => void
  setDisplayLat: (lat: number) => void
  setDisplayZoom: (zoom: number) => void
}

const MapComponent = ({
  setLng,
  setLat,
  setZoom,
  mapContainer,
  displayLng,
  displayLat,
  displayZoom,
  setDisplayLng,
  setDisplayLat,
  setDisplayZoom,
}: MapComponentProps) => {
  return (
    <div className="h-[800px] w-full" ref={mapContainer}>
      <div className="relative w-[100%_-_3rem] mx-8">
        <div className="absolute top-0 left-0 flex items-center justify-between px-2 py-3 m-3 w-[calc(100%_-_24px)] rounded-sm min-w-[560px]">
          <div className="whitespace-nowrap flex items-center justify-center h-12 gap-2 px-4 py-2 font-mono bg-gray-700 rounded">
            <span className="flex-1">Longitude: {displayLng} | </span>
            <span className="flex-1">Latitude: {displayLat} | </span>
            <span className="flex-1">Zoom: {displayZoom}</span>
          </div>
          <Search
            setLng={setLng}
            setLat={setLat}
            setZoom={setZoom}
            setDisplayLng={setDisplayLng}
            setDisplayLat={setDisplayLat}
            setDisplayZoom={setDisplayZoom}
          />
        </div>
      </div>
    </div>
  )
}
export default MapComponent

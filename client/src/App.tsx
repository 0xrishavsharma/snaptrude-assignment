import "./App.css";
import { useEffect, useRef, useState } from "react";
import mapboxgl from "mapbox-gl";
import { baseUrl, mapStyle, mapboxPublicToken } from "./utils/config";
import SceneComponent from "./components/sceneComponent";
import MapComponent from "./components/mapComponent";
import { ImSpinner8 } from "react-icons/im";
import {
    FreeCamera,
    Vector3,
    HemisphericLight,
    MeshBuilder,
    Scene,
    Mesh,
    StandardMaterial,
    Texture,
} from "@babylonjs/core";

function App() {
    const [lng, setLng] = useState(-70.9);
    const [lat, setLat] = useState(42.35);
    const [zoom, setZoom] = useState(9);

    // Coordinates state to display coordinates on the map
    const [displayLng, setDisplayLng] = useState(-70.9);
    const [displayLat, setDisplayLat] = useState(42.35);
    const [displayZoom, setDisplayZoom] = useState(10);

    const [mapImage, setMapImage] = useState<string | null>(null);
    const [isStaticImageLoaded, setStaticImageLoaded] = useState<boolean>(true);

    const [error, setError] = useState<string | null>(null);

    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<mapboxgl.Map | null>(null);

    let box: Mesh | null = null;

    const onSceneReady = (scene: Scene) => {
        // Creates and positions a free camera (non-mesh)
        const camera = new FreeCamera("camera1", new Vector3(5, 5, -10), scene);

        // Targets the camera to scene origin
        camera.setTarget(Vector3.Zero());

        const canvas = scene.getEngine().getRenderingCanvas();

        // Attaches the camera to the canvas
        camera.attachControl(canvas, true);

        // Creates a light, aiming 0,1,0 - to the sky (non-mesh)
        const light = new HemisphericLight(
            "light",
            new Vector3(0, 1, 0),
            scene
        );

        // Default intensity is 1. Dimming the light by a small amount
        light.intensity = 0.8;

        box = MeshBuilder.CreateBox("box", { size: 5 }, scene);

        // Moves the box upward 1/2 its height
        box.position.y = 1;

        const material = new StandardMaterial("material", scene);
        material.diffuseTexture = new Texture(mapImage, scene);
        box.material = material;
    };

    /**
     * Will run on every frame render.  We are spinning the box on y-axis.
     */
    const onRender = (scene: Scene) => {
        if (box !== undefined) {
            const deltaTimeInMillis = scene.getEngine().getDeltaTime();
            const rpm = 3;
            if (box) {
                box.rotation.y +=
                    (rpm / 60) * Math.PI * 2 * (deltaTimeInMillis / 1000);
                box.rotation.x +=
                    (rpm / 60) * Math.PI * 2 * (deltaTimeInMillis / 1000);
            }
        }
    };

    const captureMap = async () => {
        setStaticImageLoaded(false);
        setError(null);

        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 seconds timeout
        try {
            const res = await fetch(
                `${baseUrl}/api/static-map?lng=${lng}&lat=${lat}&zoom=${zoom}`,
                { signal: controller.signal }
            );

            if (!res.ok) {
                throw new Error(`HTTP error! status: ${res.status}`);
            }
            console.log("res", res);
            const blob = await res.blob();
            const url = URL.createObjectURL(blob);
            setMapImage(url);

            setStaticImageLoaded(true);
        } catch (error: unknown) {
            if (error instanceof Error) {
                if (error.name === "AbortError") {
                    setError("The request took too long, please try again.");
                    setStaticImageLoaded(true);
                } else {
                    setError("An error occurred while fetching the map.");
                    console.log("error", error);
                    setStaticImageLoaded(true);
                }
            }
        } finally {
            clearTimeout(timeoutId);
        }
    };

    mapboxgl.accessToken = mapboxPublicToken;

    const onDragStart = () => {
        // setIsMapDrag(true);
    };

    const onDragEnd = () => {
        // setIsMapDrag(false);
        const center = map.current?.getCenter();
        const zoomLevel = map.current?.getZoom();

        setLng(parseFloat(center?.lng.toFixed(4) || "0"));
        setLat(parseFloat(center?.lat.toFixed(4) || "0"));
        setZoom(parseFloat(zoomLevel?.toFixed(2) || "0"));
    };

    const onMove = () => {
        const center = map.current?.getCenter();
        const zoomLevel = map.current?.getZoom();

        setDisplayLng(parseFloat(center?.lng.toFixed(4) || "0"));
        setDisplayLat(parseFloat(center?.lat.toFixed(4) || "0"));
        setDisplayZoom(parseFloat(zoomLevel?.toFixed(2) || "0"));
    };

    useEffect(() => {
        if (mapContainer.current) {
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: mapStyle,
                center: [lng, lat],
                zoom: zoom,
            });

            // Register the event handlers
            map.current.on("dragstart", onDragStart);
            map.current.on("dragend", onDragEnd);
            map.current.on("move", onMove);
        }

        // Clean up the event handlers when the component unmounts
        return () => {
            map.current?.off("dragstart", onDragStart);
            map.current?.off("dragend", onDragEnd);
            map.current?.off("move", onMove);
            map.current?.remove();
        };
    }, []);

    useEffect(() => {
        if (map.current) {
            map.current.setCenter([lng, lat]);
            map.current.setZoom(zoom);
        }
    }, [lng, lat, zoom]);

    return (
        <div className='flex flex-col items-center justify-center gap-12'>
            <MapComponent
                map={map}
                mapContainer={mapContainer}
                setLng={setLng}
                setLat={setLat}
                setZoom={setZoom}
                displayLng={displayLng}
                displayLat={displayLat}
                displayZoom={displayZoom}
                setDisplayLng={setDisplayLng}
                setDisplayLat={setDisplayLat}
                setDisplayZoom={setDisplayZoom}
            />
            <button
                className='text-white bg-black border border-white rounded-md'
                onClick={captureMap}
            >
                {isStaticImageLoaded ? (
                    "Capture Map"
                ) : (
                    <ImSpinner8 className='animate-spin text-xl font-bold duration-500' />
                )}
            </button>
            {error && <p className='text-red-600'>{error}</p>}
            <SceneComponent
                box={box}
                mapImage={mapImage}
                antialias={true}
                onSceneReady={onSceneReady}
                engineOptions={{}}
                adaptToDeviceRatio={false}
                sceneOptions={{}}
                onRender={onRender}
                // id='my-canvas'
            />
        </div>
    );
}

export default App;

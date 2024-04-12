import "./App.css";
import mapboxgl from "mapbox-gl";
import { useRef, useEffect, useState } from "react";
import SceneComponent from "./components/sceneComponent";
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
    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<mapboxgl.Map | null>(null);
    // const [lng, setLng] = useState(-70.9);
    // const [lat, setLat] = useState(42.35);
    // const [zoom, setZoom] = useState(9);
    const lng = useRef(-70.9);
    const lat = useRef(42.35);
    const zoom = useRef(9);
    const [renderCount, setRenderCount] = useState(0);

    const [mapWidth, setMapWidth] = useState(300);
    const [mapHeight, setMapHeight] = useState(200);

    const [mapImage, setMapImage] = useState<string | null>(null);

    mapboxgl.accessToken = import.meta.env
        .VITE_APP_MAPBOX_ACCESS_TOKEN as string;

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

    const captureMap = async () => {
        const res = await fetch(
            `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${
                lng.current
            },${lat.current},${
                zoom.current
            },0/${mapWidth}x${mapHeight}?access_token=${
                import.meta.env.VITE_APP_MAPBOX_ACCESS_TOKEN_WITH_STATIC_IMAGE
            }`
        );
        const blob = await res.blob();
        setMapImage(URL.createObjectURL(blob));
    };

    let box: Mesh;

    const onSceneReady = (scene: Scene) => {
        // This creates and positions a free camera (non-mesh)
        const camera = new FreeCamera("camera1", new Vector3(5, 5, -10), scene);

        // This targets the camera to scene origin
        camera.setTarget(Vector3.Zero());

        const canvas = scene.getEngine().getRenderingCanvas();

        // This attaches the camera to the canvas
        camera.attachControl(canvas, true);

        // This creates a light, aiming 0,1,0 - to the sky (non-mesh)
        const light = new HemisphericLight(
            "light",
            new Vector3(0, 1, 0),
            scene
        );

        // Default intensity is 1. Let's dim the light a small amount
        light.intensity = 0.7;

        // Our built-in 'box' shape.
        box = MeshBuilder.CreateBox("box", { size: 5 }, scene);

        // Move the box upward 1/2 its height
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

            const rpm = 10;
            box.rotation.y +=
                (rpm / 60) * Math.PI * 2 * (deltaTimeInMillis / 1000);
        }
    };

    return (
        <div className='flex  items-center justify-center w-full gap-12'>
            <div className='absolute top-0 left-0 px-2 py-3  m-3 font-mono rounded-sm text-white bg-gray-700'>
                Longitude: {lng.current} | Latitude: {lat.current} | Zoom:{" "}
                {zoom.current}
            </div>
            <div className='h-[600px] w-[1284px]' ref={mapContainer}></div>
            <button onClick={captureMap}> Capture Map as an Image</button>
            {mapImage && (
                <div>
                    <img src={mapImage} alt='map' />
                </div>
            )}
            <SceneComponent
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

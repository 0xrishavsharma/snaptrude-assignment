import "./App.css";
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
import MapComponent from "./components/mapComponent";
import Navbar from "./components/navbar";
import mapboxgl from "mapbox-gl";

function App() {
    const accessToken = import.meta.env.VITE_APP_MAPBOX_ACCESS_TOKEN;
    const mapStyle = "mapbox://styles/mapbox/streets-v11";

    const [lng, setLng] = useState(-70.9);
    const [lat, setLat] = useState(42.35);
    const [zoom, setZoom] = useState(9);
    const [mapWidth, setMapWidth] = useState(300);
    const [mapHeight, setMapHeight] = useState(200);
    const [mapImage, setMapImage] = useState<string | null>(null);

    const mapContainer = useRef<HTMLDivElement | null>(null);
    const map = useRef<mapboxgl.Map | null>(null);

    let box: Mesh;

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
            const rpm = 10;
            box.rotation.y +=
                (rpm / 60) * Math.PI * 2 * (deltaTimeInMillis / 1000);
        }
    };

    const captureMap = async () => {
        const res = await fetch(
            `https://api.mapbox.com/styles/v1/mapbox/streets-v12/static/${lng},${lat},${zoom},0/${mapWidth}x${mapHeight}?access_token=${
                import.meta.env.VITE_APP_MAPBOX_ACCESS_TOKEN_WITH_STATIC_IMAGE
            }`
        );
        const blob = await res.blob();
        setMapImage(URL.createObjectURL(blob));
    };

    mapboxgl.accessToken = accessToken;

    useEffect(() => {
        if (mapContainer.current) {
            map.current = new mapboxgl.Map({
                container: mapContainer.current,
                style: mapStyle,
                center: [lng, lat],
                zoom: zoom,
            });

            map.current.on("move", () => {
                const center = map.current?.getCenter();
                const zoomLevel = map.current?.getZoom();

                setLng(parseFloat(center?.lng.toFixed(4) || "0"));
                setLat(parseFloat(center?.lat.toFixed(4) || "0"));
                setZoom(parseFloat(zoomLevel?.toFixed(2) || "0"));
            });
        }

        return () => map.current?.remove();
    }, []);

    return (
        <div className='flex flex-col items-center justify-center gap-12'>
            <Navbar />
            <MapComponent
                map={map}
                mapContainer={mapContainer}
                lng={lng}
                lat={lat}
                zoom={zoom}
                setLng={setLng}
                setLat={setLat}
                setZoom={setZoom}
            />
            <button onClick={captureMap}> Capture Map as an Image</button>
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

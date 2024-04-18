import { useEffect, useRef, useState } from "react";
import {
    Engine,
    Scene,
    EngineOptions,
    SceneOptions,
    StandardMaterial,
    Texture,
    Mesh,
} from "@babylonjs/core";

const SceneComponent = ({
    box,
    mapImage,
    antialias,
    engineOptions,
    adaptToDeviceRatio,
    sceneOptions,
    onRender,
    onSceneReady,
    ...rest
}: {
    box: Mesh | null;
    mapImage: string | null;
    antialias: boolean;
    engineOptions: EngineOptions;
    adaptToDeviceRatio: boolean;
    sceneOptions: SceneOptions;
    onRender?: (scene: Scene) => void;
    onSceneReady: (scene: Scene) => void;
    // [key: string]: any;
}) => {
    const reactCanvas = useRef(null);
    const [scene, setScene] = useState<Scene | null>(null);

    // set up basic engine and scene
    useEffect(() => {
        const { current: canvas } = reactCanvas;

        if (!canvas) return;

        const engine = new Engine(
            canvas,
            antialias,
            engineOptions,
            adaptToDeviceRatio
        );
        const localScene = new Scene(engine, sceneOptions);
        setScene(localScene);
        if (localScene) {
            if (localScene.isReady()) {
                onSceneReady(localScene);
            } else {
                localScene.onReadyObservable.addOnce((scene) =>
                    onSceneReady(scene)
                );
            }

            engine.runRenderLoop(() => {
                if (typeof onRender === "function") onRender(localScene);
                localScene.render();
            });

            const resize = () => {
                localScene.getEngine().resize();
            };

            if (window) {
                window.addEventListener("resize", resize);
            }

            return () => {
                localScene.getEngine().dispose();

                if (window) {
                    window.removeEventListener("resize", resize);
                }
            };
        }
    }, [
        antialias,
        engineOptions,
        adaptToDeviceRatio,
        sceneOptions,
        onRender,
        onSceneReady,
    ]);

    useEffect(() => {
        if (box && mapImage && scene) {
            const material = new StandardMaterial("material", scene);
            material.diffuseTexture = new Texture(mapImage, scene);
            box.material = material;
        }
    }, [mapImage, scene]);

    return (
        <canvas
            ref={reactCanvas}
            {...rest}
            className='flex items-center justify-center w-full m-auto'
        />
    );
};

export default SceneComponent;

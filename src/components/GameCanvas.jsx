import { useEffect, useRef } from 'react';
import { Engine, Scene } from '@babylonjs/core';

const GameCanvas = ({ onSceneReady }) => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const engine = new Engine(canvasRef.current, true);
    const scene = new Scene(engine);

    let isSceneReady = false;

    const prepareScene = async () => {
      if (onSceneReady) {
        await onSceneReady(scene);
        isSceneReady = true;
      }
    };

    prepareScene().then(() => {
      engine.runRenderLoop(() => {
        if (isSceneReady && scene.activeCamera) {
          scene.render();
        }
      });
    });

    window.addEventListener('resize', () => {
      engine.resize();
    });

    return () => {
      engine.stopRenderLoop();
      engine.dispose();
    };
  }, [onSceneReady]);

  return <canvas ref={canvasRef} style={{ width: '100%', height: '100%' }} />;
};

export default GameCanvas;

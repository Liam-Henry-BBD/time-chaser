import React, { useState, useRef, useCallback } from "react";
import GameCanvas from "../components/GameCanvas";
import {
  Vector3,
  HemisphericLight,
  MeshBuilder,
  Color3,
  Mesh,
} from "@babylonjs/core";
import { createPlayer } from "../game/Player";
import { setupControls, setupSwipeControls } from "../game/Controls";
import { createObstacle, updateObstacles } from "../game/Obstacles";
import { createCamera, updateCamera } from "../game/CameraFollow";
import StartScreen from "./StartScreen";
import GameOverScreen from "./GameOverScreen";
import "./score.css";

const MainScene = () => {
  const [gameOver, setGameOver] = useState(false);
  const [gameStarted, setGameStarted] = useState(false);
  const [score, setScore] = useState(0);

  const playerRef = useRef(null);
  const animationsRef = useRef([]);
  const cameraRef = useRef(null);
  const sceneRef = useRef(null);
  const stateRef = useRef(null);

  const onSceneReady = useCallback(
    async (scene) => {
      sceneRef.current = scene;

      const state = {
        isJumping: false,
        currentLane: 0,
        laneOffset: 2,
        gameOver: false,
      };
      stateRef.current = state;

      // Light
      const light = new HemisphericLight("light", new Vector3(0, 1, 0), scene);
      light.intensity = 0.8;

      // Player
      const { player, playAnimation } = await createPlayer(scene);
      playerRef.current = player;
      animationsRef.current = playAnimation; // Store playAnimation function
      playerRef.current.setEnabled(true);

      // Camera
      const camera = createCamera(scene, player);
      scene.activeCamera = camera;
      cameraRef.current = camera;

      // Ground
      const ground = MeshBuilder.CreateGround(
        "ground",
        { width: 10, height: 1000 },
        scene
      );
      ground.position.z = 500;

      // Controls
      setupControls(player, state, playAnimation);
      setupSwipeControls(player, state, playAnimation);

      // Game loop
      scene.onBeforeRenderObservable.add(() => {
        if (!gameStarted || !playerRef.current || !cameraRef.current) return;

        if (state.gameOver) return;

        // Player moves forward
        player.parent.position.z += .75;
        updateCamera(cameraRef.current, player);

        // Obstacle spawning
        const now = performance.now();
        if (!scene._lastObstacleTime) scene._lastObstacleTime = now;

        if (now - scene._lastObstacleTime > 1300) {
          createObstacle(scene, player.parent.position.z + 60);
          scene._lastObstacleTime = now;
        }

        // Collision detection
        const hit = updateObstacles(player, scene);
        if (hit) {
          state.gameOver = true;
          setGameOver(true);
          setGameStarted(false);

          setTimeout(() => {
            console.log("Trying to switch to Knock_out...");
            if (animationsRef.current) {
              animationsRef.current("rig|Fall", false);
            }
          }, 500);
        }

        setScore((prev) => prev + 1);
      });

      scene.clearColor = new Color3(0.9, 0.9, 0.9);
    },
    [gameStarted]
  );

  const startGame = () => {
    setGameOver(false);
    setScore(0);
    setTimeout(() => {
      console.log("Trying to switch to Sprint...");
      if (animationsRef.current) {
        animationsRef.current("rig|Sprint");
      }
    }, 500);

    setGameStarted(true);

    if (playerRef.current) {
      playerRef.current.position = new Vector3(0, 0, 0);
    }

    if (cameraRef.current) {
      cameraRef.current.setTarget(playerRef.current.position);
    }

    if (stateRef.current) {
      stateRef.current.gameOver = false;
    }

    // Remove old obstacles
    if (sceneRef.current) {
      sceneRef.current.meshes
        .filter((mesh) => mesh.name.startsWith("obstacle"))
        .forEach((mesh) => mesh.dispose());
    }
  };

  const restartGame = () => {
    startGame();
  };

  return (
    <div
      style={{
        position: "relative",
        width: "100vw",
        height: "100vh",
        overflow: "hidden",
        color: "black",
      }}
    >
      {/* Canvas behind */}
      <GameCanvas onSceneReady={onSceneReady} />

      <p className="score">Your Score: {score}</p>

      {/* UI on top */}
      <p>game</p>
      {!gameStarted && !gameOver && <StartScreen onStart={startGame} />}
      {gameOver && <GameOverScreen score={score} onRestart={restartGame} />}
    </div>
  );
};

export default MainScene;

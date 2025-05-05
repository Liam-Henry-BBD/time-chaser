import { SceneLoader, TransformNode, Vector3 } from "@babylonjs/core";
import "@babylonjs/loaders/glTF"; // Must import to support .glb

// game/Player.js
export async function createPlayer(scene) {
  try {
    const result = await SceneLoader.ImportMeshAsync(
      "",
      "models/",
      "player2.glb",
      scene
    );
    const player =
      result.meshes.find((m) => m.name === "__root__") || result.meshes[0];
    const parent = new TransformNode("playerParent", scene);
    player.parent = parent;

    player.parent.scaling = new Vector3(0.01, 0.01, 0.01);

    const animations = result.animationGroups;

    // Create a map of animations by name
    const animationMap = {};
    animations.forEach((anim) => {
      console.log("Animation loaded:", anim.name); // Log the animation name
      animationMap[anim.name] = anim;
      anim.stop(); // stop all initially
    });
    function createFunction() {
      let currentAnim = null;

      return (name, loop = true, speedRatio = 1.0) => {
        if (currentAnim === name) return; // prevent unnecessary restarts
        currentAnim = name;

        Object.values(animationMap).forEach((anim) => anim.stop());

        const anim = animationMap[name];
        if (anim) {
          anim.start(loop, speedRatio, anim.from, anim.to, false);
        } else {
          console.warn(`Animation "${name}" not found.`, animationMap);
        }
      };
    }

    const playAnimation = createFunction(); // Create the function to play animations
    // Utility function to play a specific animation and stop others

    // Optionally start with "Idle" or "Run"
    playAnimation("rig|Idle");

    return {
      player,
      playAnimation, // method to switch animations
      animationMap, // raw access if needed
    };
  } catch (err) {
    console.error("Failed to load player model:", err);
    return null;
  }
}

import {
  MeshBuilder,
  StandardMaterial,
  Color3,
  Vector3,
  SceneLoader,
} from "@babylonjs/core";
import "@babylonjs/loaders/glTF"; // Needed to load .glb files

const obstacles = [];
const laneOffset = 2;

export async function createObstacle(scene, zPos) {
  const isSmall = Math.random() < 0.4; // 40% chance of being a small obstacle
  const lane = Math.floor(Math.random() * 3) - 1;
  const xPos = lane * laneOffset;

  if (isSmall) {
    // 🔷 Small box obstacle
    const height = 1;
    const yPos = 0.5;

    const obstacle = MeshBuilder.CreateBox(
      "obstacle",
      {
        width: 1,
        height,
        depth: 1,
      },
      scene
    );

    const mat = new StandardMaterial("obstacleMat", scene);
    mat.diffuseColor = new Color3(0, 0.5, 1); // Blue for small
    obstacle.material = mat;

    obstacle.position = new Vector3(xPos, yPos, zPos);
    obstacle.metadata = { isSmall: true };

    obstacles.push(obstacle);
  } else {
    // 🔶 Tall barrel obstacle with collider
    const result = await SceneLoader.ImportMeshAsync(
      "",
      "models/",
      "barrel.glb",
      scene
    );
    const visualMesh = result.meshes.find((m) => m.name !== "__root__");

    // Create invisible hitbox (collider)
    const collider = MeshBuilder.CreateBox(
      "obstacleCollider",
      {
        width: 1,
        height: 2,
        depth: 1,
      },
      scene
    );
    collider.isVisible = false;
    collider.position = new Vector3(xPos, 1, zPos);
    collider.metadata = { isSmall: false };

    // Attach visual to collider
    visualMesh.parent = collider;
    visualMesh.scaling = new Vector3(0.06, 0.1, 0.1); // Adjust to match collider
    visualMesh.position = new Vector3(0.55, 1, 0); // Align visually on top of collider
    visualMesh.rotation = new Vector3(Math.PI / 2, 0, 0); // Rotate 90° around Y

    obstacles.push(collider);
  }
}

export const clearObstacles = (obstacles) => {
  obstacles.forEach((obstacle) => {
    obstacle.dispose(); // Dispose of each obstacle
  });
  obstacles.length = 0; // Clear the array of obstacles
};

export function updateObstacles(player, scene) {
  for (let i = obstacles.length - 1; i >= 0; i--) {
    const o = obstacles[i];

    // If the obstacle is null (disposed of) or undefined, skip it
    if (!o || !o.metadata) {
      obstacles.splice(i, 1); // Remove the invalid obstacle
      continue;
    }

    // Remove obstacles that are too far behind the player
    if (o.position.z < player.parent.position.z - 5) {
      o.dispose();
      obstacles.splice(i, 1); // Remove from array after disposing
      continue;
    }

    const dx = Math.abs(o.position.x - player.parent.position.x); // X-axis distance (left/right)
    const dy = Math.abs(o.position.y - player.parent.position.y); // Y-axis distance (height)
    const dz = Math.abs(o.position.z - player.parent.position.z); // Z-axis distance (forward)

    // Collision detection for side/front (only front/sides, not top or back)
    const collided = dx < 1 && dz < 1 && dy < 2; // Side/front collision check

    // Handle small obstacles (jump over logic)
    if (o.metadata.isSmall) {
      // Only check collisions with small obstacles when the player is on the ground
      if (player.parent.position.y <= 1) {
        // Check if player is on the ground (not jumping)
        if (collided) {
          console.log("💥 Collision detected with small obstacle!");
          return true; // Collision detected with small obstacle
        }
      }
      // Skip collision check for small obstacles when jumping
      continue;
    }

    // Handle tall obstacles (side/front collision)
    if (!o.metadata.isSmall && collided) {
      // Strict collision detection only with front or sides (not top or back)
      if (dz < 1 && dx < 1 && player.position.y < 2) {
        // Front or side collision
        console.log("💥 Collision detected with tall obstacle!");
        return true; // Collision detected with tall obstacle
      }
    }
  }

  return false; // No collision detected
}

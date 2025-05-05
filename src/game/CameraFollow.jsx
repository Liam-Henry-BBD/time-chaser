import { UniversalCamera, Vector3 } from "@babylonjs/core";

export function createCamera(scene) {
  const camera = new UniversalCamera("camera", new Vector3(0, 3, -10), scene);
  camera.setTarget(new Vector3(0, 0, 0));
  camera.attachControl(true);
  camera.inputs.removeByType("FreeCameraKeyboardMoveInput");
  return camera;
}

export function updateCamera(camera, player) {
  camera.position.z = player.parent.position.z-10;
  camera.position.y = 3;
  camera.setTarget(new Vector3(player.position.x, player.position.y, player.parent.position.z));
}

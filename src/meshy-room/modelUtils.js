import * as THREE from 'three';

/** Center model, scale to max height, put feet on y=0 (local). */
export function normalizeModelToFloor(obj, maxHeight) {
  obj.position.set(0, 0, 0);
  obj.rotation.set(0, 0, 0);
  obj.scale.set(1, 1, 1);
  obj.updateWorldMatrix(true, true);
  const box = new THREE.Box3().setFromObject(obj);
  const center = box.getCenter(new THREE.Vector3());
  const size = box.getSize(new THREE.Vector3());
  obj.position.x -= center.x;
  obj.position.y -= center.y;
  obj.position.z -= center.z;
  const sy = size.y || 1;
  const s = maxHeight / sy;
  obj.scale.setScalar(s);
  obj.updateWorldMatrix(true, true);
  const b2 = new THREE.Box3().setFromObject(obj);
  obj.position.y -= b2.min.y;
}

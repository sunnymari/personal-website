import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function initPageant3D() {
  try { window.__threeModuleStarted = true; } catch (_) {}

  const canvas = document.getElementById('character-canvas');
  if (!canvas) return;

  // Optional UI hook from the boot banner
  const setStatus = typeof window.__setBoot3dStatus === 'function' ? window.__setBoot3dStatus : null;
  if (setStatus) setStatus('Loading 3D…');

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);

  const PS1_SCALE = 0.45;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
  renderer.setClearColor(0x000000, 0);
  renderer.setSize(
    Math.floor(canvas.clientWidth * PS1_SCALE),
    Math.floor(canvas.clientHeight * PS1_SCALE),
    false
  );
  renderer.setPixelRatio(1);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.3;

  // Lighting
  scene.add(new THREE.AmbientLight(0xccccdd, 0.8));
  const keyLight = new THREE.DirectionalLight(0xffeedd, 1.2);
  keyLight.position.set(3, 5, 4);
  scene.add(keyLight);
  const rimLight = new THREE.DirectionalLight(0x8ec8ff, 0.4);
  rimLight.position.set(-3, 3, -2);
  scene.add(rimLight);
  const fillLight = new THREE.DirectionalLight(0xffffff, 0.3);
  fillLight.position.set(-2, 1, 3);
  scene.add(fillLight);

  // Plumbob
  const plumbob = new THREE.Mesh(
    new THREE.OctahedronGeometry(0.06, 0),
    new THREE.MeshLambertMaterial({ color: 0x4cd964, flatShading: true, emissive: 0x2a8a3a, emissiveIntensity: 0.4 })
  );
  plumbob.scale.set(1, 1.5, 1);
  scene.add(plumbob);

  // Ground shadow
  const shadow = new THREE.Mesh(
    new THREE.CircleGeometry(0.94, 16),
    new THREE.MeshBasicMaterial({ color: 0x000000, transparent: true, opacity: 0.1, depthWrite: false })
  );
  shadow.renderOrder = -1;
  shadow.rotation.x = -Math.PI / 2;
  shadow.position.set(0, 0.25, 0);
  scene.add(shadow);

  let model = null;
  let mixer = null;
  let idleAction = null;
  let actionClip = null;
  let modelTop = 2.0;
  let modelCenter = new THREE.Vector3(0, 1, 0);
  let modelSize = new THREE.Vector3(1, 2, 1);
  const clock = new THREE.Clock();

  const loader = new GLTFLoader();
  const IDLE_URL = '/Meshy_AI_Animation_Idle_11_withSkin.glb';
  const ACTION_URL = '/Meshy_AI_Animation_air_squat_withSkin.glb';

  loader.load(
    IDLE_URL,
    (gltf) => {
      model = gltf.scene;
      model.visible = true;

      // Hide boot status banner on success
      const bootEl = document.getElementById('threeBootStatus');
      if (bootEl) bootEl.remove();

      // Normalize model to a predictable size and frame camera to it.
      const preBox = new THREE.Box3().setFromObject(model);
      const preSize = preBox.getSize(new THREE.Vector3());
      const preMaxDim = Math.max(preSize.x, preSize.y, preSize.z) || 1;
      const targetHeight = 2.15; // larger so it reads clearly on mobile
      const safeY = (preSize.y && preSize.y > 1e-6) ? preSize.y : preMaxDim;
      const scale = targetHeight / safeY;
      model.scale.setScalar(scale);

      // Recompute bounds after scaling, then center at origin and place feet on y=0
      const box = new THREE.Box3().setFromObject(model);
      const center = box.getCenter(new THREE.Vector3());
      model.position.sub(center);
      model.position.y -= box.min.y;

      // Final bounds used for camera fit
      const finalBox = new THREE.Box3().setFromObject(model);
      modelSize = finalBox.getSize(new THREE.Vector3());
      modelCenter = finalBox.getCenter(new THREE.Vector3());
      modelTop = modelSize.y;

      // Ensure meshes are visible and not frustum-culled
      model.traverse((obj) => {
        if (!obj.isMesh) return;
        obj.visible = true;
        obj.frustumCulled = false;
      });

      // Plumbob above head
      plumbob.position.set(modelCenter.x, modelTop + 0.25, modelCenter.z);

      // Fit camera to model bounds (with margin)
      const fov = (camera.fov * Math.PI) / 180;
      const margin = 1.55;
      const fitHeight = (modelSize.y * margin) / 2;
      const fitWidth = (modelSize.x * margin) / 2;
      const distanceForHeight = fitHeight / Math.tan(fov / 2);
      const distanceForWidth = fitWidth / (Math.tan(fov / 2) * camera.aspect);
      const distance = Math.max(distanceForHeight, distanceForWidth) + (modelSize.z * 0.5);

      // Slightly above center feels nicer for full-body framing
      const lookAt = new THREE.Vector3(modelCenter.x, modelCenter.y + modelSize.y * 0.1, modelCenter.z);
      camera.position.set(lookAt.x, lookAt.y, lookAt.z + distance);
      camera.near = Math.max(0.01, distance / 100);
      camera.far = Math.max(1000, distance * 10);
      camera.updateProjectionMatrix();
      camera.lookAt(lookAt);

      scene.add(model);

      if (gltf.animations && gltf.animations.length > 0) {
        mixer = new THREE.AnimationMixer(model);
        idleAction = mixer.clipAction(gltf.animations[0]);
        idleAction.play();
      }

      loader.load(ACTION_URL, (actionGltf) => {
        if (actionGltf.animations && actionGltf.animations.length > 0) {
          actionClip = actionGltf.animations[0];
        }
      });
    },
    undefined,
    (error) => {
      console.error('Error loading model:', error);
      if (setStatus) setStatus('3D failed to load: ' + (error && error.message ? error.message : 'model error'));
    }
  );

  // Expose the existing hook
  window.playActionAnim = function () {
    if (!mixer || !model || !actionClip || !idleAction) return;
    const action = mixer.clipAction(actionClip);
    action.reset();
    action.setLoop(THREE.LoopRepeat, 2);
    action.clampWhenFinished = true;
    idleAction.enabled = true;
    idleAction.setEffectiveWeight(1);
    action.enabled = true;
    action.setEffectiveWeight(1);
    action.setEffectiveTimeScale(1);
    action.play();
    idleAction.crossFadeTo(action, 0.6, true);

    mixer.addEventListener('finished', function onFinished(e) {
      if (e.action === action) {
        mixer.removeEventListener('finished', onFinished);
        action.crossFadeTo(idleAction, 0.8, true);
        idleAction.enabled = true;
        idleAction.setEffectiveWeight(1);
        idleAction.play();
      }
    });
  };

  function animate() {
    requestAnimationFrame(animate);
    const delta = clock.getDelta();
    if (mixer) mixer.update(delta);
    // Float plumbob
    plumbob.position.y = (modelTop + 0.25) + Math.sin(Date.now() * 0.004) * 0.03;
    renderer.render(scene, camera);
  }
  animate();

  function handleResize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(Math.floor(w * PS1_SCALE), Math.floor(h * PS1_SCALE), false);
    camera.aspect = w / h;
    // Re-fit distance on resize if model is loaded
    if (model) {
      const fov = (camera.fov * Math.PI) / 180;
      const margin = 1.25;
      const fitHeight = (modelSize.y * margin) / 2;
      const fitWidth = (modelSize.x * margin) / 2;
      const distanceForHeight = fitHeight / Math.tan(fov / 2);
      const distanceForWidth = fitWidth / (Math.tan(fov / 2) * camera.aspect);
      const distance = Math.max(distanceForHeight, distanceForWidth) + (modelSize.z * 0.5);
      const lookAt = new THREE.Vector3(modelCenter.x, modelCenter.y + modelSize.y * 0.15, modelCenter.z);
      camera.position.set(lookAt.x, lookAt.y, lookAt.z + distance);
      camera.near = Math.max(0.01, distance / 100);
      camera.far = Math.max(1000, distance * 10);
    }
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', handleResize);
}

// Auto-init
try { initPageant3D(); } catch (e) { console.error(e); if (window.__setBoot3dStatus) window.__setBoot3dStatus('3D failed: ' + (e.message || e)); }

import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

export function initPageant3D() {
  try { window.__threeModuleStarted = true; } catch (_) {}

  const canvas = document.getElementById('character-canvas');
  if (!canvas) return;

  // Optional UI hook from the boot banner
  const setStatus = typeof window.__setBoot3dStatus === 'function' ? window.__setBoot3dStatus : null;
  if (setStatus) setStatus('Loading 3D…');

  // WebGL sanity check
  const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
  if (!gl) {
    if (setStatus) setStatus('3D disabled: WebGL not available in this browser.');
    return;
  }

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(30, canvas.clientWidth / canvas.clientHeight, 0.1, 1000);

  const PS1_SCALE = 0.45;
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: false });
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
  const clock = new THREE.Clock();

  const loader = new GLTFLoader();
  const IDLE_URL = '/Meshy_AI_Animation_Idle_11_withSkin.glb';
  const ACTION_URL = '/Meshy_AI_Animation_air_squat_withSkin.glb';

  loader.load(
    IDLE_URL,
    (gltf) => {
      model = gltf.scene;
      if (setStatus) setStatus('3D loaded.');

      const box = new THREE.Box3().setFromObject(model);
      const size = box.getSize(new THREE.Vector3());

      const maxDim = Math.max(size.x, size.y, size.z);
      const scale = 0.78 / maxDim;
      model.scale.setScalar(scale);

      const scaledBox = new THREE.Box3().setFromObject(model);
      const scaledSize = scaledBox.getSize(new THREE.Vector3());

      model.position.x = -scaledBox.getCenter(new THREE.Vector3()).x;
      model.position.z = -scaledBox.getCenter(new THREE.Vector3()).z;
      model.position.y = -scaledBox.min.y;

      modelTop = scaledSize.y;

      plumbob.position.set(0, modelTop * 0.6 + 2.047, 0);

      const midY = modelTop * 2.2;
      camera.position.set(0, midY, 5.0);
      camera.lookAt(0, midY, 0);

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
    plumbob.position.y += Math.sin(Date.now() * 0.004) * 0.00035;
    renderer.render(scene, camera);
  }
  animate();

  function handleResize() {
    const w = canvas.clientWidth;
    const h = canvas.clientHeight;
    if (!w || !h) return;
    renderer.setSize(Math.floor(w * PS1_SCALE), Math.floor(h * PS1_SCALE), false);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
  }
  window.addEventListener('resize', handleResize);
}

// Auto-init
try { initPageant3D(); } catch (e) { console.error(e); if (window.__setBoot3dStatus) window.__setBoot3dStatus('3D failed: ' + (e.message || e)); }

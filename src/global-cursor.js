import * as THREE from "three";
import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";

const SPARKLE_COLORS = ["#FF2D78", "#FFB3CC", "#FF6FA8", "#ffffff", "#FFD6E7", "#FF90BB"];
const CURSOR_SIZE = 72;

function createSparkle(container, x, y) {
  const sparkle = document.createElement("div");
  const size = 4 + Math.random() * 8;
  const isHeart = Math.random() > 0.5;
  const color = SPARKLE_COLORS[Math.floor(Math.random() * SPARKLE_COLORS.length)];
  const angle = Math.random() * 360;
  const dist = 20 + Math.random() * 40;
  const dx = Math.cos((angle * Math.PI) / 180) * dist;
  const dy = Math.sin((angle * Math.PI) / 180) * dist;
  const duration = 520 + Math.random() * 380;

  sparkle.style.cssText = `
    position: fixed;
    left: ${x}px;
    top: ${y}px;
    width: ${size}px;
    height: ${size}px;
    pointer-events: none;
    z-index: 2147483646;
    font-size: ${size}px;
    line-height: 1;
    transform: translate(-50%, -50%);
    color: ${color};
  `;
  sparkle.textContent = isHeart ? "♥" : "✦";
  container.appendChild(sparkle);

  const start = performance.now();
  const animate = (now) => {
    const progress = (now - start) / duration;
    if (progress >= 1) {
      sparkle.remove();
      return;
    }
    const eased = 1 - Math.pow(progress, 2);
    sparkle.style.transform = `translate(calc(-50% + ${dx * progress}px), calc(-50% + ${dy * progress}px)) scale(${eased}) rotate(${progress * 180}deg)`;
    sparkle.style.opacity = `${eased}`;
    requestAnimationFrame(animate);
  };
  requestAnimationFrame(animate);
}

function initGlobalCursor() {
  if (typeof window === "undefined") return;
  if (window.matchMedia("(hover: none), (pointer: coarse)").matches) return;
  if (document.documentElement.dataset.kawaiiCursorInit === "true") return;
  document.documentElement.dataset.kawaiiCursorInit = "true";

  const sparkleLayer = document.createElement("div");
  sparkleLayer.style.cssText = `
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 2147483645;
    overflow: hidden;
  `;
  document.body.appendChild(sparkleLayer);

  const cursor = document.createElement("div");
  cursor.style.cssText = `
    position: fixed;
    left: -100px;
    top: -100px;
    width: ${CURSOR_SIZE}px;
    height: ${CURSOR_SIZE}px;
    background: transparent;
    overflow: visible;
    pointer-events: none;
    z-index: 2147483647;
    transform: translate(-20%, -14%) scale(1);
    transition: transform 0.2s cubic-bezier(0.34,1.56,0.64,1);
  `;
  document.body.appendChild(cursor);

  const scene = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(38, 1, 0.01, 20);
  camera.position.set(0, 0.1, 2.2);
  camera.lookAt(0, 0, 0);

  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.setSize(CURSOR_SIZE, CURSOR_SIZE);
  renderer.outputColorSpace = THREE.SRGBColorSpace;
  renderer.domElement.style.width = "100%";
  renderer.domElement.style.height = "100%";
  renderer.domElement.style.display = "block";
  cursor.appendChild(renderer.domElement);

  scene.add(new THREE.AmbientLight(0xffffff, 0.95));
  const keyLight = new THREE.DirectionalLight(0xffffff, 1.1);
  keyLight.position.set(2, 2, 3);
  scene.add(keyLight);

  const modelPivot = new THREE.Group();
  scene.add(modelPivot);

  const loader = new GLTFLoader();
  loader.load("/Meshy_AI_Kawaii_Neon_Sword_0422192103_texture.glb", (gltf) => {
    const sword = gltf.scene;
    const box = new THREE.Box3().setFromObject(sword);
    const size = box.getSize(new THREE.Vector3());
    const maxAxis = Math.max(size.x, size.y, size.z) || 1;
    const scale = 1.2 / maxAxis;
    sword.scale.setScalar(scale);
    box.setFromObject(sword);
    const center = box.getCenter(new THREE.Vector3());
    sword.position.sub(center);
    sword.rotation.set(-0.45, 0.65, 0.2);
    modelPivot.add(sword);
  });

  document.documentElement.style.cursor = "none";
  document.body.style.cursor = "none";

  const clock = new THREE.Clock();
  let lastSparkle = 0;
  const onMove = (e) => {
    cursor.style.left = `${e.clientX}px`;
    cursor.style.top = `${e.clientY}px`;

    const now = performance.now();
    if (now - lastSparkle > 35) {
      createSparkle(sparkleLayer, e.clientX, e.clientY);
      lastSparkle = now;
    }
  };

  const animateCursor = () => {
    const t = clock.getElapsedTime();
    modelPivot.rotation.y = t * 1.6;
    modelPivot.rotation.z = Math.sin(t * 2.2) * 0.12;
    renderer.render(scene, camera);
    requestAnimationFrame(animateCursor);
  };
  requestAnimationFrame(animateCursor);

  const onDown = (e) => {
    for (let i = 0; i < 7; i += 1) {
      window.setTimeout(() => createSparkle(sparkleLayer, e.clientX, e.clientY), i * 12);
    }
  };

  const onOver = (e) => {
    if (e.target.closest("a, button, [role='button'], input, textarea, select, label[for]")) {
      cursor.style.transform = "translate(-20%, -14%) scale(1.16)";
    }
  };

  const onOut = (e) => {
    if (e.target.closest("a, button, [role='button'], input, textarea, select, label[for]")) {
      cursor.style.transform = "translate(-20%, -14%) scale(1)";
    }
  };

  document.addEventListener("pointermove", onMove);
  document.addEventListener("pointerdown", onDown);
  document.addEventListener("pointerover", onOver);
  document.addEventListener("pointerout", onOut);
}

if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", initGlobalCursor, { once: true });
} else {
  initGlobalCursor();
}

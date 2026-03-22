import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei';
import { PinkRoom } from '../components/PinkRoom.jsx';
import { normalizeModelToFloor } from './modelUtils.js';

const LAPTOP_URL = '/Meshy_AI_Happy_Laptop_0322192107_texture.glb';
const CHIBI_URL = '/Meshy_AI_Chibi_Coder_with_Gala_biped_Animation_Walking_withSkin.glb';

function ChibiMesh({ position }) {
  const pivot = useRef();
  const animRoot = useRef();
  const { scene, animations } = useGLTF(CHIBI_URL);
  const clone = useMemo(() => scene.clone(true), [scene]);

  useLayoutEffect(() => {
    normalizeModelToFloor(clone, 1.85);
  }, [clone]);

  const { actions } = useAnimations(animations, animRoot);

  useEffect(() => {
    if (!actions) return;
    Object.values(actions).forEach((a) => a?.stop?.());
    const list = Object.values(actions).filter(Boolean);
    const a0 = list[0];
    if (a0) {
      a0.reset();
      a0.fadeIn(0.25);
      a0.play();
    }
    return () => {
      Object.values(actions).forEach((a) => a?.fadeOut?.(0.2));
    };
  }, [actions]);

  return (
    <group ref={pivot} position={position}>
      <primitive ref={animRoot} object={clone} />
    </group>
  );
}

function LaptopMesh({ position }) {
  const pivot = useRef();
  const { scene } = useGLTF(LAPTOP_URL);
  const clone = useMemo(() => scene.clone(true), [scene]);

  useLayoutEffect(() => {
    normalizeModelToFloor(clone, 1.05);
  }, [clone]);

  useFrame((_, d) => {
    if (pivot.current) pivot.current.rotation.y += d * 0.2;
  });

  return (
    <group ref={pivot} position={position}>
      <primitive object={clone} />
    </group>
  );
}

function Scene() {
  return (
    <>
      <ambientLight intensity={0.78} color="#ffeef4" />
      <directionalLight
        castShadow
        position={[3.2, 5.2, 3.2]}
        intensity={0.95}
        color="#ffffff"
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[0.8, 2.1, 0.6]} intensity={0.4} color="#ffb7c5" distance={9} />
      <pointLight position={[-2, 1.2, -0.5]} intensity={0.32} color="#ffc9d9" distance={8} />

      <PinkRoom />

      <Suspense fallback={null}>
        <ChibiMesh position={[-1.25, 0, 0.35]} />
        <LaptopMesh position={[1.12, 0, -0.42]} />
      </Suspense>

      <OrbitControls
        enablePan={false}
        minPolarAngle={0.28}
        maxPolarAngle={Math.PI / 2.12}
        minDistance={2.9}
        maxDistance={8.5}
        target={[0, 0.72, 0]}
      />
    </>
  );
}

export default function MeshyRoomCanvas() {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 1.38, 4.85], fov: 42 }}
      gl={{ alpha: false }}
      dpr={[1, 2]}
    >
      <color attach="background" args={['#fff5f7']} />
      <Scene />
    </Canvas>
  );
}

useGLTF.preload(LAPTOP_URL);
useGLTF.preload(CHIBI_URL);

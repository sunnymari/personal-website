import { Suspense, useEffect, useLayoutEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls, useGLTF, useAnimations } from '@react-three/drei';
import { CoderRoom } from '../components/CoderRoom.jsx';
import { normalizeModelToFloor } from './modelUtils.js';

const LAPTOP_URL = '/Meshy_AI_Happy_Laptop_0322192107_texture.glb';

function ChibiMesh({ url, position, playClip }) {
  const pivot = useRef();
  const animRoot = useRef();
  const { scene, animations } = useGLTF(url);
  const clone = useMemo(() => scene.clone(true), [scene, url]);

  useLayoutEffect(() => {
    normalizeModelToFloor(clone, 1.85);
  }, [clone]);

  const { actions } = useAnimations(animations, animRoot);

  useEffect(() => {
    if (!actions) return;
    Object.values(actions).forEach((a) => a?.stop?.());
    if (playClip) {
      const list = Object.values(actions).filter(Boolean);
      const a0 = list[0];
      if (a0) {
        a0.reset();
        a0.fadeIn(0.25);
        a0.play();
      }
    }
    return () => {
      Object.values(actions).forEach((a) => a?.fadeOut?.(0.2));
    };
  }, [actions, playClip, url]);

  useFrame((_, d) => {
    if (!playClip && pivot.current) pivot.current.rotation.y += d * 0.42;
  });

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

function Scene({ chibiUrl }) {
  const portrait = chibiUrl.includes('0322190228_texture');

  return (
    <>
      <ambientLight intensity={0.48} color="#c084fc" />
      <directionalLight
        castShadow
        position={[3.2, 5.2, 3.2]}
        intensity={1.25}
        color="#e9d5ff"
        shadow-mapSize={[1024, 1024]}
      />
      <pointLight position={[0.8, 2.1, 0.6]} intensity={0.55} color="#a855f7" distance={9} />
      <pointLight position={[-2, 1.2, -0.5]} intensity={0.35} color="#ec4899" distance={8} />

      <CoderRoom />

      <Suspense fallback={null}>
        <ChibiMesh
          key={chibiUrl}
          url={chibiUrl}
          position={[-1.25, 0, 0.35]}
          playClip={!portrait}
        />
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

export default function MeshyRoomCanvas({ chibiUrl }) {
  return (
    <Canvas
      shadows
      camera={{ position: [0, 1.38, 4.85], fov: 42 }}
      gl={{ alpha: false }}
      dpr={[1, 2]}
    >
      <color attach="background" args={['#1a0f28']} />
      <Scene chibiUrl={chibiUrl} />
    </Canvas>
  );
}

useGLTF.preload(LAPTOP_URL);

import { useEffect, useMemo, useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Float, Sparkles, useAnimations, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

const PALETTE = {
  blush: '#f7b7d5',
  sakura: '#ee94c8',
  peach: '#f6cda4',
  cream: '#f6e4ca',
  mint: '#96dbbb',
  blue: '#8cc9eb',
  lavender: '#c8afea',
  moss: '#78cb98',
  trunk: '#a97d6d',
};

function SkyLayer() {
  return (
    <>
      <fog attach="fog" args={['#98d0ef', 18, 40]} />
      <Float speed={0.9} rotationIntensity={0.04} floatIntensity={0.12}>
        <mesh position={[-7.5, 7.2, -8]}>
          <sphereGeometry args={[1.5, 20, 20]} />
          <meshStandardMaterial color="#d9b6ee" transparent opacity={0.45} />
        </mesh>
      </Float>
      <Float speed={1.1} rotationIntensity={0.05} floatIntensity={0.16}>
        <mesh position={[8, 7.8, -7]}>
          <sphereGeometry args={[1.7, 20, 20]} />
          <meshStandardMaterial color="#f2bfd9" transparent opacity={0.48} />
        </mesh>
      </Float>
      <Sparkles count={110} size={2.4} speed={0.12} opacity={0.52} color="#ffd5ea" scale={[26, 10, 26]} />
    </>
  );
}

function Tree({ position, scale = 1 }) {
  return (
    <group position={position} scale={scale}>
      <mesh castShadow position={[0, 0.85, 0]}>
        <cylinderGeometry args={[0.12, 0.16, 1.26, 10]} />
        <meshStandardMaterial color={PALETTE.trunk} />
      </mesh>
      <mesh castShadow position={[0, 1.86, 0]}>
        <sphereGeometry args={[0.62, 18, 18]} />
        <meshStandardMaterial color={PALETTE.mint} />
      </mesh>
      <mesh castShadow position={[-0.24, 1.63, 0.18]}>
        <sphereGeometry args={[0.34, 14, 14]} />
        <meshStandardMaterial color={PALETTE.moss} />
      </mesh>
      <mesh castShadow position={[0.24, 1.57, -0.15]}>
        <sphereGeometry args={[0.32, 14, 14]} />
        <meshStandardMaterial color="#8bd5a8" />
      </mesh>
    </group>
  );
}

function FruitTree({ position, fruitColor = '#f7b7d5' }) {
  return (
    <group position={position}>
      <Tree position={[0, 0, 0]} scale={1.05} />
      {[-0.22, -0.05, 0.18].map((x, i) => (
        <mesh key={i} castShadow position={[x, 1.74 + i * 0.03, i % 2 ? 0.16 : -0.12]}>
          <sphereGeometry args={[0.07, 10, 10]} />
          <meshStandardMaterial color={fruitColor} />
        </mesh>
      ))}
    </group>
  );
}

function FlowerPatch({ position }) {
  const blooms = [
    [-0.24, -0.12, '#ff86bf'],
    [-0.08, 0.05, '#ffc58a'],
    [0.08, -0.04, '#c6a0ff'],
    [0.21, 0.14, '#ff9ad2'],
  ];
  return (
    <group position={position}>
      <mesh receiveShadow>
        <cylinderGeometry args={[0.52, 0.52, 0.1, 16]} />
        <meshStandardMaterial color="#99e0b7" />
      </mesh>
      {blooms.map(([x, z, color], i) => (
        <group key={i} position={[x, 0.1, z]}>
          <mesh castShadow>
            <sphereGeometry args={[0.08, 10, 10]} />
            <meshStandardMaterial color={color} />
          </mesh>
          <mesh position={[0, -0.08, 0]} castShadow>
            <cylinderGeometry args={[0.01, 0.01, 0.12, 8]} />
            <meshStandardMaterial color="#5fb88a" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function Cottage() {
  const gltf = useGLTF('/Meshy_AI_Sweetheart_Cottage_0423083144_texture.glb');

  const cottageModel = useMemo(() => {
    const cloned = SkeletonUtils.clone(gltf.scene);
    const box = new THREE.Box3().setFromObject(cloned);
    const size = box.getSize(new THREE.Vector3());
    const center = box.getCenter(new THREE.Vector3());
    const min = box.min.clone();
    const boundsAreValid =
      Number.isFinite(size.x) &&
      Number.isFinite(size.y) &&
      Number.isFinite(size.z) &&
      Number.isFinite(center.x) &&
      Number.isFinite(center.y) &&
      Number.isFinite(center.z) &&
      Number.isFinite(min.y) &&
      Math.max(size.x, size.y, size.z) > 0;

    if (boundsAreValid) {
      const maxAxis = Math.max(size.x, size.y, size.z);
      const targetSpan = 6.4;
      const scale = targetSpan / maxAxis;
      cloned.scale.setScalar(scale);
      cloned.position.x -= center.x * scale;
      cloned.position.z -= center.z * scale;
      cloned.position.y -= min.y * scale;
    } else {
      // Fallback keeps the cottage visible even when GLB bounds are malformed.
      cloned.scale.setScalar(0.85);
      cloned.position.set(0, 0, 0);
    }
    cloned.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    return cloned;
  }, [gltf.scene]);

  return (
    <group position={[0.1, 0.06, -0.15]} rotation={[0, -Math.PI / 12, 0]}>
      <primitive object={cottageModel} />
      <mesh receiveShadow position={[0, 0.02, 0]}>
        <cylinderGeometry args={[3.3, 3.8, 0.05, 24]} />
        <meshStandardMaterial color="#f7d5e9" transparent opacity={0.42} />
      </mesh>
      <mesh position={[0, 0.95, 0]}>
        <boxGeometry args={[7.8, 1.9, 7.2]} />
        <meshBasicMaterial color="#ff9cd4" wireframe transparent opacity={0.08} />
      </mesh>
    </group>
  );
}

function DecorCluster({ position, variant = 'bench' }) {
  if (variant === 'mailbox') {
    return (
      <group position={position}>
        <mesh castShadow position={[0, 0.45, 0]}>
          <boxGeometry args={[0.16, 0.8, 0.16]} />
          <meshStandardMaterial color="#e29cc4" />
        </mesh>
        <mesh castShadow position={[0, 0.9, 0.04]}>
          <boxGeometry args={[0.42, 0.32, 0.26]} />
          <meshStandardMaterial color="#f2aad0" />
        </mesh>
      </group>
    );
  }

  if (variant === 'mushrooms') {
    return (
      <group position={position}>
        {[-0.18, 0, 0.18].map((x, i) => (
          <group key={i} position={[x, 0, i * 0.12]}>
            <mesh castShadow position={[0, 0.12, 0]}>
              <cylinderGeometry args={[0.03, 0.03, 0.24, 8]} />
              <meshStandardMaterial color="#f0d8b8" />
            </mesh>
            <mesh castShadow position={[0, 0.27, 0]}>
              <sphereGeometry args={[0.12, 12, 12]} />
              <meshStandardMaterial color={i % 2 ? '#ec8fc6' : '#c5a5f1'} />
            </mesh>
          </group>
        ))}
      </group>
    );
  }

  if (variant === 'signpost') {
    return (
      <group position={position}>
        <mesh castShadow position={[0, 0.55, 0]}>
          <cylinderGeometry args={[0.08, 0.1, 1.1, 8]} />
          <meshStandardMaterial color={PALETTE.trunk} />
        </mesh>
        <mesh castShadow position={[0.26, 0.9, 0]}>
          <boxGeometry args={[0.62, 0.22, 0.1]} />
          <meshStandardMaterial color="#f3dfc4" />
        </mesh>
        <mesh castShadow position={[0.26, 0.6, 0]}>
          <boxGeometry args={[0.62, 0.22, 0.1]} />
          <meshStandardMaterial color="#f7b7d5" />
        </mesh>
      </group>
    );
  }

  return (
    <group position={position}>
      <mesh castShadow receiveShadow position={[0, 0.3, 0]}>
        <boxGeometry args={[1.05, 0.3, 0.4]} />
        <meshStandardMaterial color="#eda9cd" />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 0.58, 0]}>
        <boxGeometry args={[1.1, 0.08, 0.48]} />
        <meshStandardMaterial color="#d96da8" />
      </mesh>
    </group>
  );
}

function PrincessChibi() {
  const group = useRef();
  const pathIndexRef = useRef(0);
  const modeRef = useRef('walk');
  const modeTimerRef = useRef(0);
  const targetRef = useRef(new THREE.Vector3(-1.9, 0.08, 1.5));
  const lastFacingRef = useRef(0);

  const waveGltf = useGLTF('/Meshy_AI_Pink_Princess_in_a_St_biped_Animation_Wave_One_Hand_withSkin.glb');
  const walkGltf = useGLTF('/Meshy_AI_Pink_Princess_in_a_St_biped_Animation_Walking_withSkin.glb');
  const runGltf = useGLTF('/Meshy_AI_Pink_Princess_in_a_St_biped_Animation_Running_withSkin.glb');

  const princessModel = useMemo(() => {
    const cloned = SkeletonUtils.clone(waveGltf.scene);
    cloned.scale.setScalar(1.2);
    const box = new THREE.Box3().setFromObject(cloned);
    const center = box.getCenter(new THREE.Vector3());
    const min = box.min.clone();
    cloned.position.x -= center.x;
    cloned.position.z -= center.z;
    cloned.position.y -= min.y;
    cloned.traverse((node) => {
      if (node.isMesh) {
        node.castShadow = true;
        node.receiveShadow = true;
      }
    });
    return cloned;
  }, [waveGltf.scene]);

  const animationClips = useMemo(
    () => [...waveGltf.animations, ...walkGltf.animations, ...runGltf.animations],
    [waveGltf.animations, walkGltf.animations, runGltf.animations]
  );

  const { actions, mixer } = useAnimations(animationClips, princessModel);

  const actionNames = useMemo(() => Object.keys(actions ?? {}), [actions]);
  const waveName = useMemo(
    () => actionNames.find((name) => /wave|idle/i.test(name)) || actionNames[0],
    [actionNames]
  );
  const walkName = useMemo(
    () => actionNames.find((name) => /walk/i.test(name)) || actionNames.find((name) => /run/i.test(name)) || waveName,
    [actionNames, waveName]
  );

  useEffect(() => {
    if (!actions || !walkName) return;
    actions[walkName]?.reset().fadeIn(0.25).play();
    modeRef.current = 'walk';
    modeTimerRef.current = 0;
  }, [actions, walkName]);

  useFrame((_, delta) => {
    if (!group.current) return;
    if (mixer) mixer.update(delta);

    const route = [
      new THREE.Vector3(-2.1, 0.08, 1.8),  // Front-left
      new THREE.Vector3(0.0, 0.08, 2.6),   // Front-center
      new THREE.Vector3(2.1, 0.08, 1.8),   // Front-right (avoid mailbox at 2.9)
      new THREE.Vector3(2.5, 0.08, -0.5),  // Right (avoid house at center)
      new THREE.Vector3(1.0, 0.08, -2.5),  // Back-right
      new THREE.Vector3(-1.0, 0.08, -2.5), // Back-left
      new THREE.Vector3(-2.5, 0.08, -0.5), // Left (avoid bench at -2.7)
    ];

    modeTimerRef.current += delta;

    if (modeRef.current === 'walk') {
      const current = group.current.position;
      const target = targetRef.current;
      current.lerp(target, Math.min(0.03 + delta * 1.4, 0.12));

      const dx = target.x - current.x;
      const dz = target.z - current.z;
      const dist = Math.hypot(dx, dz);

      if (dist > 0.02) {
        const desiredRot = Math.atan2(dx, dz);
        lastFacingRef.current = desiredRot;
        group.current.rotation.y = THREE.MathUtils.lerp(group.current.rotation.y, desiredRot, 0.16);
      }

      if (dist <= 0.24 && modeTimerRef.current > 2.2) {
        modeRef.current = 'wave';
        modeTimerRef.current = 0;
        if (actions?.[walkName] && actions?.[waveName]) {
          actions[walkName].fadeOut(0.25);
          actions[waveName].reset().fadeIn(0.25).play();
        }
      }
    } else {
      group.current.rotation.y = lastFacingRef.current;
      if (modeTimerRef.current > 2.8) {
        modeRef.current = 'walk';
        modeTimerRef.current = 0;
        pathIndexRef.current = (pathIndexRef.current + 1) % route.length;
        targetRef.current.copy(route[pathIndexRef.current]);
        if (actions?.[walkName] && actions?.[waveName]) {
          actions[waveName].fadeOut(0.2);
          actions[walkName].reset().fadeIn(0.25).play();
        }
      }
    }
  });

  return (
    <group ref={group} position={[-2.1, 0.08, 1.8]}>
      <primitive object={princessModel} />
      <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.01, 0]}>
        <ringGeometry args={[0.22, 0.3, 24]} />
        <meshStandardMaterial color="#f3a5ce" transparent opacity={0.5} />
      </mesh>
    </group>
  );
}

function IslandWorld() {
  const treeData = [
    [-5.2, 0, -1.8, 1.1], [4.9, 0, -2.2, 1], [-5.8, 0, 2.1, 1.15], [5.7, 0, 2.25, 1.05], [3.2, 0, 4.2, 0.95],
  ];
  const flowerData = [
    [-2.4, 0.03, 2.4], [2.6, 0.03, 2.7], [-3.5, 0.03, -0.7], [3.9, 0.03, -0.2], [0.6, 0.03, 4.1],
  ];

  return (
    <>
      <ambientLight intensity={0.58} color="#ffd5ea" />
      <hemisphereLight args={['#b7e0ff', '#f6d5b2', 0.75]} />
      <directionalLight castShadow position={[8, 10, 6]} intensity={1.05} color="#ffe6c8" />
      <pointLight position={[-4, 4, 3]} intensity={0.45} color="#f49fd1" />
      <pointLight position={[0, 3.6, 0.8]} intensity={0.22} color="#ffd8f0" />

      <mesh receiveShadow position={[0, -0.26, 0]}>
        <cylinderGeometry args={[15, 15, 0.34, 48]} />
        <meshStandardMaterial color="#78bbe5" />
      </mesh>
      <mesh receiveShadow position={[0, -0.2, 0]}>
        <cylinderGeometry args={[11.4, 12.2, 0.16, 46]} />
        <meshStandardMaterial color="#f5ddb9" />
      </mesh>
      <mesh receiveShadow position={[0, -0.12, 0]}>
        <cylinderGeometry args={[10, 11, 1.0, 42]} />
        <meshStandardMaterial color="#99deb9" />
      </mesh>
      <mesh receiveShadow position={[0.8, -0.2, 5.1]}>
        <cylinderGeometry args={[4.8, 6.2, 0.72, 32]} />
        <meshStandardMaterial color={PALETTE.blue} />
      </mesh>
      <mesh receiveShadow position={[-5.3, -0.16, 4.4]}>
        <cylinderGeometry args={[2.2, 2.8, 0.6, 20]} />
        <meshStandardMaterial color="#89c9ec" />
      </mesh>

      <mesh receiveShadow position={[0.7, -0.04, 3.75]}>
        <boxGeometry args={[1.2, 0.16, 3.9]} />
        <meshStandardMaterial color={PALETTE.peach} />
      </mesh>
      {[-0.2, 0.8, 1.8, 2.8, 3.8, 4.8].map((z) => (
        <mesh key={`step-${z}`} receiveShadow position={[0.72, 0.03, z]}>
          <boxGeometry args={[0.72, 0.08, 0.54]} />
          <meshStandardMaterial color="#edc799" />
        </mesh>
      ))}

      <Cottage />
      {treeData.map(([x, y, z, s]) => (
        <Tree key={`tree-${x}-${z}`} position={[x, y, z]} scale={s} />
      ))}
      <FruitTree position={[-4.1, 0, 3.9]} fruitColor="#ffc173" />
      <FruitTree position={[4.8, 0, 3.2]} fruitColor="#f29bcf" />
      {flowerData.map(([x, y, z]) => (
        <FlowerPatch key={`flowers-${x}-${z}`} position={[x, y, z]} />
      ))}

      <DecorCluster position={[-2.7, 0, 1.85]} variant="bench" />
      <DecorCluster position={[2.9, 0, 1.2]} variant="mailbox" />
      <DecorCluster position={[-1.2, 0, 4.1]} variant="mushrooms" />
      <DecorCluster position={[-4.6, 0, 1.15]} variant="signpost" />
      <PrincessChibi />

      <mesh castShadow receiveShadow position={[3.25, 0.6, 0.5]}>
        <cylinderGeometry args={[0.08, 0.08, 0.9, 8]} />
        <meshStandardMaterial color="#da8abc" />
      </mesh>
      <mesh castShadow position={[3.25, 1.11, 0.5]}>
        <sphereGeometry args={[0.24, 12, 12]} />
        <meshStandardMaterial color="#f4cc8f" emissive="#f4cc8f" emissiveIntensity={0.16} />
      </mesh>
    </>
  );
}

function ResponsiveCamera() {
  const { camera, size } = useThree();
  useEffect(() => {
    if (size.width < 640) {
      camera.zoom = 48;
    } else if (size.width < 1024) {
      camera.zoom = 65;
    } else {
      camera.zoom = 88;
    }
    camera.updateProjectionMatrix();
  }, [size, camera]);
  return null;
}

export default function IslandHomepageScene() {
  return (
    <Canvas
      shadows
      orthographic
      gl={{ alpha: true, antialias: true }}
      onCreated={({ gl }) => gl.setClearColor('#000000', 0)}
      camera={{ position: [11, 10, 11], zoom: 88, near: 0.1, far: 200 }}
      style={{ width: '100%', height: '100%' }}
    >
      <ResponsiveCamera />
      <SkyLayer />
      <IslandWorld />
    </Canvas>
  );
}

useGLTF.preload('/Meshy_AI_Pink_Princess_in_a_St_biped_Animation_Wave_One_Hand_withSkin.glb');
useGLTF.preload('/Meshy_AI_Pink_Princess_in_a_St_biped_Animation_Walking_withSkin.glb');
useGLTF.preload('/Meshy_AI_Pink_Princess_in_a_St_biped_Animation_Running_withSkin.glb');
useGLTF.preload('/Meshy_AI_Sweetheart_Cottage_0423083144_texture.glb');

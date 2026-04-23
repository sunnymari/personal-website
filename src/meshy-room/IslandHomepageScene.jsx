import { Canvas } from '@react-three/fiber';
import { Float, Sparkles } from '@react-three/drei';

const PALETTE = {
  blush: '#f4b6d8',
  sakura: '#ec8fc6',
  peach: '#f6cda1',
  cream: '#f3dfc4',
  mint: '#97dcb7',
  blue: '#90cfef',
  lavender: '#c7a9ef',
  moss: '#74c994',
  trunk: '#a6796a',
};

function SkyLayer() {
  return (
    <>
      <color attach="background" args={['#8ec8ec']} />
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
  return (
    <group position={[0.15, 0.24, -0.25]}>
      <mesh castShadow receiveShadow position={[0, 1.18, 0]}>
        <boxGeometry args={[2.3, 1.95, 2.15]} />
        <meshStandardMaterial color="#eeb6d3" />
      </mesh>
      <mesh castShadow receiveShadow position={[0, 2.48, 0]} rotation={[0, 0, Math.PI / 4]}>
        <cylinderGeometry args={[1.25, 1.25, 1.9, 4]} />
        <meshStandardMaterial color={PALETTE.sakura} />
      </mesh>
      <mesh castShadow receiveShadow position={[0.02, 1.03, 1.12]}>
        <boxGeometry args={[0.75, 1.08, 0.14]} />
        <meshStandardMaterial color="#f0a6cc" />
      </mesh>
      <mesh castShadow position={[0.26, 0.95, 1.18]}>
        <sphereGeometry args={[0.07, 10, 10]} />
        <meshStandardMaterial color="#eac071" />
      </mesh>
      <mesh castShadow receiveShadow position={[-0.74, 1.36, 1.13]}>
        <boxGeometry args={[0.54, 0.54, 0.1]} />
        <meshStandardMaterial color="#f4b8d8" />
      </mesh>
      <mesh castShadow receiveShadow position={[0.78, 1.36, 1.13]}>
        <boxGeometry args={[0.54, 0.54, 0.1]} />
        <meshStandardMaterial color="#f4b8d8" />
      </mesh>
      <mesh castShadow position={[0.02, 3.16, 0.75]}>
        <torusGeometry args={[0.2, 0.05, 12, 24]} />
        <meshStandardMaterial color="#ef6eaf" />
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

function IslandWorld() {
  const treeData = [
    [-5.2, 0, -1.8, 1.1], [4.9, 0, -2.2, 1], [-5.8, 0, 2.1, 1.15], [5.7, 0, 2.25, 1.05], [3.2, 0, 4.2, 0.95],
  ];
  const flowerData = [
    [-2.4, 0.03, 2.4], [2.6, 0.03, 2.7], [-3.5, 0.03, -0.7], [3.9, 0.03, -0.2], [0.6, 0.03, 4.1],
  ];

  return (
    <>
      <ambientLight intensity={0.8} color="#ffd5ea" />
      <directionalLight castShadow position={[8, 10, 6]} intensity={1.05} color="#ffe6c8" />
      <pointLight position={[-4, 4, 3]} intensity={0.45} color="#f49fd1" />

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
      {flowerData.map(([x, y, z]) => (
        <FlowerPatch key={`flowers-${x}-${z}`} position={[x, y, z]} />
      ))}

      <DecorCluster position={[-2.7, 0, 1.85]} variant="bench" />
      <DecorCluster position={[2.9, 0, 1.2]} variant="mailbox" />
      <DecorCluster position={[-1.2, 0, 4.1]} variant="mushrooms" />

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

export default function IslandHomepageScene() {
  return (
    <Canvas
      shadows
      camera={{ position: [12, 12, 12], fov: 34 }}
      style={{ width: '100%', height: '100%' }}
    >
      <SkyLayer />
      <IslandWorld />
    </Canvas>
  );
}

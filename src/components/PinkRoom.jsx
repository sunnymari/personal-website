import * as THREE from 'three';

/** Light pink kawaii interior — shared by home Meshy canvas and /chibi. */
export function PinkRoom() {
  const floor = '#ffc9d9';
  const rug = '#ffe8ef';
  const wall = '#fff0f5';
  const wallSide = '#ffe4ec';
  const ceiling = '#fffafc';
  const trim = '#ffb3c6';

  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[8, 5]} />
        <meshStandardMaterial color={floor} roughness={0.88} />
      </mesh>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0.2]}>
        <planeGeometry args={[6.5, 3.2]} />
        <meshStandardMaterial color={rug} roughness={0.95} />
      </mesh>

      <mesh receiveShadow position={[0, 1.65, -2.48]}>
        <planeGeometry args={[8, 3.4]} />
        <meshStandardMaterial color={wall} roughness={0.82} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 2.15, -2.38]}>
        <planeGeometry args={[2.2, 1.1]} />
        <meshStandardMaterial
          color="#f0f9ff"
          emissive="#ffffff"
          emissiveIntensity={0.15}
          roughness={0.35}
          metalness={0.05}
          transparent
          opacity={0.92}
        />
      </mesh>

      <mesh receiveShadow position={[-3.45, 1.65, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[5, 3.4]} />
        <meshStandardMaterial color={wallSide} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>
      <mesh receiveShadow position={[3.45, 1.65, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[5, 3.4]} />
        <meshStandardMaterial color={wallSide} roughness={0.85} side={THREE.DoubleSide} />
      </mesh>

      <mesh receiveShadow position={[0, 3.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 5]} />
        <meshStandardMaterial color={ceiling} roughness={0.92} side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[-3.42, 0.04, 0]}>
        <boxGeometry args={[0.06, 0.06, 4.8]} />
        <meshStandardMaterial color={trim} roughness={0.55} />
      </mesh>
      <mesh position={[3.42, 0.04, 0]}>
        <boxGeometry args={[0.06, 0.06, 4.8]} />
        <meshStandardMaterial color={trim} roughness={0.55} />
      </mesh>
    </group>
  );
}

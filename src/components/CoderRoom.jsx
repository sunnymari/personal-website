import * as THREE from 'three';

/** Cozy dev room: shared by /chibi and home Meshy canvas. */
export function CoderRoom() {
  const wall = '#251835';
  const wallAccent = '#2f1f45';
  const floor = '#1a0f28';
  const rug = '#32204a';

  return (
    <group>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0, 0]}>
        <planeGeometry args={[8, 5]} />
        <meshStandardMaterial color={floor} roughness={0.95} />
      </mesh>
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, 0.002, 0.2]}>
        <planeGeometry args={[6.5, 3.2]} />
        <meshStandardMaterial color={rug} roughness={1} />
      </mesh>

      <mesh receiveShadow position={[0, 1.65, -2.48]}>
        <planeGeometry args={[8, 3.4]} />
        <meshStandardMaterial color={wall} roughness={0.92} side={THREE.DoubleSide} />
      </mesh>
      <mesh position={[0, 2.15, -2.4]}>
        <planeGeometry args={[2.2, 1.1]} />
        <meshStandardMaterial
          color="#4c1d95"
          emissive="#7c3aed"
          emissiveIntensity={0.35}
          roughness={0.6}
          transparent
          opacity={0.92}
        />
      </mesh>

      <mesh receiveShadow position={[-3.45, 1.65, 0]} rotation={[0, Math.PI / 2, 0]}>
        <planeGeometry args={[5, 3.4]} />
        <meshStandardMaterial color={wallAccent} roughness={0.92} side={THREE.DoubleSide} />
      </mesh>
      <mesh receiveShadow position={[3.45, 1.65, 0]} rotation={[0, -Math.PI / 2, 0]}>
        <planeGeometry args={[5, 3.4]} />
        <meshStandardMaterial color={wallAccent} roughness={0.92} side={THREE.DoubleSide} />
      </mesh>

      <mesh receiveShadow position={[0, 3.35, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <planeGeometry args={[8, 5]} />
        <meshStandardMaterial color="#140a1f" roughness={1} side={THREE.DoubleSide} />
      </mesh>

      <mesh position={[-3.42, 0.04, 0]}>
        <boxGeometry args={[0.06, 0.06, 4.8]} />
        <meshStandardMaterial color="#f472b6" roughness={0.5} metalness={0.2} />
      </mesh>
      <mesh position={[3.42, 0.04, 0]}>
        <boxGeometry args={[0.06, 0.06, 4.8]} />
        <meshStandardMaterial color="#f472b6" roughness={0.5} metalness={0.2} />
      </mesh>
    </group>
  );
}

import { useRef, useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text } from '@react-three/drei';
import * as THREE from 'three';

const ROOMS = {
  bedroom: { pos: [-1.85, 2.15, -0.35], label: '🛏️ Bedroom', emoji: '🛏️', floor: '#ffd6e0' },
  closet: { pos: [1.85, 2.15, -0.35], label: '🎀 Closet', emoji: '🎀', floor: '#fce7f3' },
  living: { pos: [-1.85, -0.05, -0.3], label: '🛋️ Living Room', emoji: '🛋️', floor: '#ffe4ec' },
  office: { pos: [1.85, -0.05, -0.3], label: '💻 Office', emoji: '💻', floor: '#f3e8ff' },
  library: { pos: [0, -2.1, -0.35], label: '📚 Library', emoji: '📚', floor: '#fef3c7' },
};

function ClickableFurniture({ position, rotation = [0, 0, 0], onClick, children }) {
  const ref = useRef();
  const [hovered, setHovered] = useState(false);
  const [hoverSize, setHoverSize] = useState([1.2, 1.2, 1.2]);

  useEffect(() => {
    if (!ref.current) return;
    const box = new THREE.Box3().setFromObject(ref.current);
    const size = box.getSize(new THREE.Vector3());
    setHoverSize([
      Math.max(size.x * 1.1, 0.5),
      Math.max(size.y * 1.1, 0.5),
      Math.max(size.z * 1.1, 0.5),
    ]);
  }, []);

  return (
    <group
      ref={ref}
      position={position}
      rotation={rotation}
      scale={hovered ? 1.05 : 1}
      onPointerOver={(e) => {
        e.stopPropagation();
        document.body.style.cursor = 'pointer';
        setHovered(true);
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
        setHovered(false);
      }}
      onClick={(e) => {
        e.stopPropagation();
        if (onClick) onClick();
      }}
    >
      {hovered && (
        <mesh>
          <boxGeometry args={hoverSize} />
          <meshStandardMaterial color="#ff69b4" transparent opacity={0.18} emissive="#ff69b4" emissiveIntensity={0.35} />
        </mesh>
      )}
      {children}
    </group>
  );
}

function RoomShell({ roomKey, onRoomClick }) {
  const room = ROOMS[roomKey];
  const [x, y, z] = room.pos;

  return (
    <group position={[x, y, z]}>
      <mesh receiveShadow onClick={() => onRoomClick(roomKey)}>
        <boxGeometry args={[3.6, 0.1, 3.2]} />
        <meshStandardMaterial color={room.floor} />
      </mesh>
      <Text
        position={[0, 1.62, 0.5]}
        fontSize={0.32}
        color="#9d174d"
        anchorX="center"
        anchorY="middle"
      >
        {room.label}
      </Text>
    </group>
  );
}

function DividerWalls() {
  return (
    <>
      <mesh position={[0, 5.05, -0.4]} castShadow receiveShadow>
        <boxGeometry args={[8.55, 0.18, 3.55]} />
        <meshStandardMaterial color="#f0b4d0" />
      </mesh>
      <mesh position={[0, 2.95, -0.4]} castShadow receiveShadow>
        <boxGeometry args={[8.55, 0.14, 3.55]} />
        <meshStandardMaterial color="#f8d8e8" />
      </mesh>
      <mesh position={[0, 0.75, -0.4]} castShadow receiveShadow>
        <boxGeometry args={[8.55, 0.14, 3.55]} />
        <meshStandardMaterial color="#f8d8e8" />
      </mesh>

      <mesh position={[0, 1.85, -0.4]} castShadow receiveShadow>
        <boxGeometry args={[0.1, 6.35, 3.55]} />
        <meshStandardMaterial color="#ffd2e5" />
      </mesh>

      <mesh position={[-4.27, 1.85, -0.4]} castShadow receiveShadow>
        <boxGeometry args={[0.16, 6.45, 3.55]} />
        <meshStandardMaterial color="#f2dce8" />
      </mesh>
      <mesh position={[4.27, 1.85, -0.4]} castShadow receiveShadow>
        <boxGeometry args={[0.16, 6.45, 3.55]} />
        <meshStandardMaterial color="#f2dce8" />
      </mesh>

      <mesh position={[0, 1.85, -2.15]} castShadow receiveShadow>
        <boxGeometry args={[8.55, 6.45, 0.16]} />
        <meshStandardMaterial color="#ffd2e5" />
      </mesh>

      <mesh position={[-2.15, 6.15, -0.4]} rotation={[0, 0, -0.53]} castShadow receiveShadow>
        <boxGeometry args={[4.55, 0.18, 3.55]} />
        <meshStandardMaterial color="#f2a8cc" />
      </mesh>
      <mesh position={[2.15, 6.15, -0.4]} rotation={[0, 0, 0.53]} castShadow receiveShadow>
        <boxGeometry args={[4.55, 0.18, 3.55]} />
        <meshStandardMaterial color="#f2a8cc" />
      </mesh>

      <mesh position={[0, -1.45, -0.4]} castShadow receiveShadow>
        <boxGeometry args={[8.55, 0.2, 3.55]} />
        <meshStandardMaterial color="#f7e4ee" />
      </mesh>
    </>
  );
}

function BedroomFurniture({ showPopup }) {
  const [x, y, z] = ROOMS.bedroom.pos;
  return (
    <group position={[x, y, z]}>
      <ClickableFurniture position={[-1.0, 0, -1.2]} onClick={() => showPopup("✨ shh i'm dreaming of shipping features 🌙")}>
        <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.3, 0.2, 0.7]} />
          <meshStandardMaterial color="#ff69b4" />
        </mesh>
        <mesh position={[0, 0.34, 0]} castShadow>
          <boxGeometry args={[1.18, 0.12, 0.58]} />
          <meshStandardMaterial color="#ffb6c1" />
        </mesh>
        <mesh position={[0, 0.62, -0.31]} castShadow>
          <boxGeometry args={[1.3, 0.6, 0.1]} />
          <meshStandardMaterial color="#ff69b4" />
        </mesh>
        <mesh position={[-0.3, 0.43, -0.14]} castShadow>
          <boxGeometry args={[0.26, 0.08, 0.18]} />
          <meshStandardMaterial color="#fff0f5" />
        </mesh>
        <mesh position={[0.3, 0.43, -0.14]} castShadow>
          <boxGeometry args={[0.26, 0.08, 0.18]} />
          <meshStandardMaterial color="#fff0f5" />
        </mesh>
      </ClickableFurniture>

      <ClickableFurniture
        position={[1.1, 0, -1.2]}
        onClick={() => {
          window.location.href = '/about';
        }}
      >
        <mesh position={[0, 0.42, 0]} castShadow>
          <boxGeometry args={[0.92, 0.1, 0.42]} />
          <meshStandardMaterial color="#fff0f5" />
        </mesh>
        <mesh position={[-0.3, 0.2, 0]} castShadow>
          <boxGeometry args={[0.08, 0.4, 0.08]} />
          <meshStandardMaterial color="#fff0f5" />
        </mesh>
        <mesh position={[0.3, 0.2, 0]} castShadow>
          <boxGeometry args={[0.08, 0.4, 0.08]} />
          <meshStandardMaterial color="#fff0f5" />
        </mesh>
        <mesh position={[0, 1.0, -0.14]} castShadow>
          <boxGeometry args={[0.7, 0.85, 0.08]} />
          <meshStandardMaterial color="#ff69b4" />
        </mesh>
        <mesh position={[0, 1.0, -0.08]}>
          <boxGeometry args={[0.56, 0.7, 0.02]} />
          <meshStandardMaterial color="#e8d5f5" transparent opacity={0.6} emissive="#ffffff" emissiveIntensity={0.2} />
        </mesh>
      </ClickableFurniture>

      <ClickableFurniture position={[-1.65, 0, 0.3]} onClick={() => showPopup('💕 my comfort items')}>
        <mesh position={[0, 1.0, 0]} castShadow>
          <boxGeometry args={[0.16, 1.6, 1.0]} />
          <meshStandardMaterial color="#f8c8d4" />
        </mesh>
        <mesh position={[0.12, 1.25, 0]} castShadow>
          <boxGeometry args={[0.32, 0.08, 0.92]} />
          <meshStandardMaterial color="#f8c8d4" />
        </mesh>
        <mesh position={[0.22, 1.42, -0.24]} castShadow>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshStandardMaterial color="#a78bfa" />
        </mesh>
        <mesh position={[0.22, 1.42, 0]} castShadow>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshStandardMaterial color="#f472b6" />
        </mesh>
        <mesh position={[0.22, 1.42, 0.24]} castShadow>
          <boxGeometry args={[0.2, 0.2, 0.2]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>
      </ClickableFurniture>
    </group>
  );
}

function LivingFurniture({ showPopup }) {
  const [x, y, z] = ROOMS.living.pos;
  return (
    <group position={[x, y, z]}>
      <ClickableFurniture position={[0, 0, -1.2]} onClick={() => showPopup('🌸 come hang out with me')}>
        <mesh position={[0, 0.25, 0]} castShadow>
          <boxGeometry args={[1.3, 0.28, 0.62]} />
          <meshStandardMaterial color="#ff69b4" />
        </mesh>
        <mesh position={[0, 0.62, -0.24]} castShadow>
          <boxGeometry args={[1.3, 0.38, 0.14]} />
          <meshStandardMaterial color="#ff85c2" />
        </mesh>
        <mesh position={[-0.58, 0.43, 0]} castShadow>
          <boxGeometry args={[0.14, 0.35, 0.62]} />
          <meshStandardMaterial color="#ff69b4" />
        </mesh>
        <mesh position={[0.58, 0.43, 0]} castShadow>
          <boxGeometry args={[0.14, 0.35, 0.62]} />
          <meshStandardMaterial color="#ff69b4" />
        </mesh>
      </ClickableFurniture>

      <ClickableFurniture
        position={[1.2, 0, -1.45]}
        onClick={() => {
          window.location.href = '/projects';
        }}
      >
        <mesh position={[0, 0.24, 0]} castShadow>
          <boxGeometry args={[0.9, 0.26, 0.4]} />
          <meshStandardMaterial color="#f8c8d4" />
        </mesh>
        <mesh position={[0, 0.72, -0.02]} castShadow>
          <boxGeometry args={[0.78, 0.42, 0.04]} />
          <meshStandardMaterial color="#1a1a2e" emissive="#7c3aed" emissiveIntensity={0.25} />
        </mesh>
      </ClickableFurniture>

      <mesh position={[0, 0.06, 0]} receiveShadow>
        <boxGeometry args={[1.4, 0.02, 1.0]} />
        <meshStandardMaterial color="#ffffff" transparent opacity={0.82} />
      </mesh>
    </group>
  );
}

function OfficeFurniture({ showPopup }) {
  const [x, y, z] = ROOMS.office.pos;
  return (
    <group position={[x, y, z]}>
      <ClickableFurniture
        position={[0, 0, -1.2]}
        onClick={() => {
          window.location.href = '/work-with-me';
        }}
      >
        <mesh position={[0, 0.42, 0]} castShadow>
          <boxGeometry args={[1.4, 0.12, 0.62]} />
          <meshStandardMaterial color="#f3e8ff" />
        </mesh>
        <mesh position={[0, 0.8, -0.2]} castShadow>
          <boxGeometry args={[0.58, 0.34, 0.04]} />
          <meshStandardMaterial color="#1a1a2e" emissive="#7c3aed" emissiveIntensity={0.24} />
        </mesh>
      </ClickableFurniture>

      <group position={[0, 0, -0.45]}>
        <mesh position={[0, 0.26, 0]} castShadow>
          <boxGeometry args={[0.52, 0.12, 0.52]} />
          <meshStandardMaterial color="#a78bfa" />
        </mesh>
        <mesh position={[0, 0.56, -0.2]} castShadow>
          <boxGeometry args={[0.52, 0.5, 0.1]} />
          <meshStandardMaterial color="#a78bfa" />
        </mesh>
        <mesh position={[-0.18, 0.12, -0.16]} castShadow>
          <boxGeometry args={[0.08, 0.22, 0.08]} />
          <meshStandardMaterial color="#7c3aed" />
        </mesh>
        <mesh position={[0.18, 0.12, -0.16]} castShadow>
          <boxGeometry args={[0.08, 0.22, 0.08]} />
          <meshStandardMaterial color="#7c3aed" />
        </mesh>
        <mesh position={[-0.18, 0.12, 0.16]} castShadow>
          <boxGeometry args={[0.08, 0.22, 0.08]} />
          <meshStandardMaterial color="#7c3aed" />
        </mesh>
        <mesh position={[0.18, 0.12, 0.16]} castShadow>
          <boxGeometry args={[0.08, 0.22, 0.08]} />
          <meshStandardMaterial color="#7c3aed" />
        </mesh>
      </group>

      <ClickableFurniture position={[-1.2, 0, -1.95]} onClick={() => showPopup('💻 currently building something fun ✨')}>
        <mesh position={[-0.22, 1.7, 0.07]}>
          <boxGeometry args={[0.2, 0.2, 0.02]} />
          <meshStandardMaterial color="#fef08a" />
        </mesh>
        <mesh position={[0, 1.64, 0.07]}>
          <boxGeometry args={[0.2, 0.2, 0.02]} />
          <meshStandardMaterial color="#bbf7d0" />
        </mesh>
        <mesh position={[0.22, 1.72, 0.07]}>
          <boxGeometry args={[0.2, 0.2, 0.02]} />
          <meshStandardMaterial color="#fbcfe8" />
        </mesh>
      </ClickableFurniture>
    </group>
  );
}

function LibraryFurniture({ showPopup }) {
  const [x, y, z] = ROOMS.library.pos;
  const bookColors = ['#a78bfa', '#f472b6', '#ffffff', '#fbbf24', '#34d399', '#fb923c', '#f472b6', '#a78bfa'];

  return (
    <group position={[x, y, z]}>
      <ClickableFurniture
        position={[-1.6, 0, 0]}
        onClick={() => {
          window.location.href = '/reading';
        }}
      >
        <mesh position={[0, 1.0, 0]} castShadow>
          <boxGeometry args={[0.2, 1.9, 1.2]} />
          <meshStandardMaterial color="#f8c8d4" />
        </mesh>
        <mesh position={[0.1, 0.45, 0]} castShadow>
          <boxGeometry args={[0.3, 0.05, 1.05]} />
          <meshStandardMaterial color="#f8c8d4" />
        </mesh>
        <mesh position={[0.1, 0.95, 0]} castShadow>
          <boxGeometry args={[0.3, 0.05, 1.05]} />
          <meshStandardMaterial color="#f8c8d4" />
        </mesh>
        <mesh position={[0.1, 1.45, 0]} castShadow>
          <boxGeometry args={[0.3, 0.05, 1.05]} />
          <meshStandardMaterial color="#f8c8d4" />
        </mesh>
        {bookColors.map((color, i) => (
          <mesh key={color + i} position={[0.2, 0.63 + Math.floor(i / 4) * 0.56, -0.36 + (i % 4) * 0.24]} castShadow>
            <boxGeometry args={[0.12, 0.24, 0.18]} />
            <meshStandardMaterial color={color} />
          </mesh>
        ))}
      </ClickableFurniture>

      <ClickableFurniture position={[0, 0, -0.2]} onClick={() => showPopup('📖 currently reading...')}>
        <mesh position={[0, 0.24, 0]} castShadow>
          <boxGeometry args={[0.85, 0.32, 0.8]} />
          <meshStandardMaterial color="#fcd34d" />
        </mesh>
        <mesh position={[0, 0.64, -0.28]} castShadow>
          <boxGeometry args={[0.85, 0.52, 0.14]} />
          <meshStandardMaterial color="#fcd34d" />
        </mesh>
      </ClickableFurniture>

      <group position={[1.2, 0, 1.2]}>
        <mesh position={[0, 0.18, 0]} castShadow>
          <boxGeometry args={[0.34, 0.36, 0.34]} />
          <meshStandardMaterial color="#f97316" />
        </mesh>
        <mesh position={[0, 0.55, 0]} castShadow>
          <boxGeometry args={[0.08, 0.42, 0.08]} />
          <meshStandardMaterial color="#22c55e" />
        </mesh>
        <mesh position={[0.12, 0.76, 0]} castShadow>
          <boxGeometry args={[0.24, 0.08, 0.12]} />
          <meshStandardMaterial color="#22c55e" />
        </mesh>
        <mesh position={[-0.1, 0.7, 0.09]} castShadow>
          <boxGeometry args={[0.22, 0.08, 0.1]} />
          <meshStandardMaterial color="#22c55e" />
        </mesh>
        <mesh position={[-0.04, 0.82, -0.12]} castShadow>
          <boxGeometry args={[0.2, 0.08, 0.1]} />
          <meshStandardMaterial color="#22c55e" />
        </mesh>
      </group>
    </group>
  );
}

function ClosetFurniture({ showPopup }) {
  const [x, y, z] = ROOMS.closet.pos;
  const clothingColors = ['#f472b6', '#a78bfa', '#fbbf24', '#ffffff', '#fb7185'];

  return (
    <group position={[x, y, z]}>
      <ClickableFurniture position={[0, 0, -1.45]} onClick={() => showPopup('🎀 outfit of the day')}>
        <mesh position={[0, 1.78, 0]} castShadow>
          <boxGeometry args={[1.3, 0.06, 0.06]} />
          <meshStandardMaterial color="#ff69b4" />
        </mesh>
        <mesh position={[-0.62, 1.05, 0]} castShadow>
          <boxGeometry args={[0.08, 1.46, 0.08]} />
          <meshStandardMaterial color="#ff69b4" />
        </mesh>
        <mesh position={[0.62, 1.05, 0]} castShadow>
          <boxGeometry args={[0.08, 1.46, 0.08]} />
          <meshStandardMaterial color="#ff69b4" />
        </mesh>
        {clothingColors.map((color, i) => (
          <mesh key={color + i} position={[-0.45 + i * 0.23, 1.35, 0]} castShadow>
            <boxGeometry args={[0.16, 0.5, 0.04]} />
            <meshStandardMaterial color={color} />
          </mesh>
        ))}
      </ClickableFurniture>

      <ClickableFurniture
        position={[1.55, 0, 0]}
        rotation={[0, -Math.PI / 2, 0]}
        onClick={() => {
          window.location.href = '/about';
        }}
      >
        <mesh position={[0, 1.1, 0]} castShadow>
          <boxGeometry args={[0.1, 2.0, 0.95]} />
          <meshStandardMaterial color="#ff69b4" />
        </mesh>
        <mesh position={[0.06, 1.1, 0]} castShadow>
          <boxGeometry args={[0.02, 1.8, 0.78]} />
          <meshStandardMaterial color="#e8d5f5" transparent opacity={0.6} emissive="#ffffff" emissiveIntensity={0.18} />
        </mesh>
      </ClickableFurniture>

      <ClickableFurniture position={[-1.55, 0, 0]} rotation={[0, Math.PI / 2, 0]} onClick={() => showPopup('✨ a girl and her shoes')}>
        <mesh position={[0, 0.68, 0]} castShadow>
          <boxGeometry args={[0.16, 1.22, 0.9]} />
          <meshStandardMaterial color="#f8c8d4" />
        </mesh>
        <mesh position={[0.08, 0.43, 0]} castShadow>
          <boxGeometry args={[0.3, 0.05, 0.82]} />
          <meshStandardMaterial color="#f8c8d4" />
        </mesh>
        <mesh position={[0.08, 0.88, 0]} castShadow>
          <boxGeometry args={[0.3, 0.05, 0.82]} />
          <meshStandardMaterial color="#f8c8d4" />
        </mesh>
        <mesh position={[0.15, 0.55, -0.24]} castShadow>
          <boxGeometry args={[0.16, 0.08, 0.18]} />
          <meshStandardMaterial color="#f472b6" />
        </mesh>
        <mesh position={[0.15, 0.55, 0.24]} castShadow>
          <boxGeometry args={[0.16, 0.08, 0.18]} />
          <meshStandardMaterial color="#a78bfa" />
        </mesh>
        <mesh position={[0.15, 1.0, -0.2]} castShadow>
          <boxGeometry args={[0.16, 0.08, 0.18]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>
        <mesh position={[0.15, 1.0, 0.2]} castShadow>
          <boxGeometry args={[0.16, 0.08, 0.18]} />
          <meshStandardMaterial color="#fb7185" />
        </mesh>
      </ClickableFurniture>
    </group>
  );
}

function Chibi({
  chibiPos,
  setChibiPos,
  chibiTarget,
  setChibiTarget,
  chibiSelected,
  setChibiSelected,
  setSelectedRoom,
}) {
  const group = useRef();
  const bodyRef = useRef();
  const headRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const movingRef = useRef(false);

  useFrame(({ clock }, delta) => {
    if (!group.current) return;
    const t = clock.elapsedTime;
    let moving = false;

    if (chibiTarget) {
      const current = new THREE.Vector3(...chibiPos);
      const target = new THREE.Vector3(...chibiTarget);
      const dir = target.clone().sub(current);
      const dist = dir.length();
      if (dist > 0.07) {
        moving = true;
        dir.normalize();
        const speed = 2.25;
        const next = current.add(dir.multiplyScalar(speed * delta));
        setChibiPos([next.x, next.y, next.z]);
        const yaw = Math.atan2(next.x - chibiPos[0], next.z - chibiPos[2]);
        group.current.rotation.y = yaw;
      } else {
        setChibiPos([chibiTarget[0], chibiTarget[1], chibiTarget[2]]);
        setChibiTarget(null);
      }
    }

    movingRef.current = moving;
    group.current.position.set(chibiPos[0], chibiPos[1], chibiPos[2]);

    const swing = Math.sin(t * 9) * 0.55;
    if (movingRef.current) {
      if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;
      if (leftArmRef.current) leftArmRef.current.rotation.x = -swing * 0.6;
      if (rightArmRef.current) rightArmRef.current.rotation.x = swing * 0.6;
      if (bodyRef.current) bodyRef.current.position.y = Math.abs(Math.sin(t * 8)) * 0.03;
      if (headRef.current) headRef.current.rotation.z = Math.sin(t * 4) * 0.04;
    } else {
      if (leftLegRef.current) leftLegRef.current.rotation.x = THREE.MathUtils.lerp(leftLegRef.current.rotation.x, 0, 0.15);
      if (rightLegRef.current) rightLegRef.current.rotation.x = THREE.MathUtils.lerp(rightLegRef.current.rotation.x, 0, 0.15);
      if (leftArmRef.current) leftArmRef.current.rotation.x = THREE.MathUtils.lerp(leftArmRef.current.rotation.x, 0, 0.15);
      if (rightArmRef.current) rightArmRef.current.rotation.x = THREE.MathUtils.lerp(rightArmRef.current.rotation.x, 0, 0.15);
      if (bodyRef.current) bodyRef.current.position.y = Math.sin(t * 1.5) * 0.02;
      if (headRef.current) headRef.current.rotation.z = Math.sin(t * 0.8) * 0.04;
    }
  });

  const skinColor = '#ffcba4';
  const outfitColor = '#e879f9';
  const hairColor = '#1a0533';
  const eyeColor = '#7c3aed';

  return (
    <group
      ref={group}
      position={chibiPos}
      onClick={(e) => {
        e.stopPropagation();
        setChibiSelected((s) => !s);
        setSelectedRoom(null);
      }}
      castShadow
    >
      {chibiSelected && (
        <mesh position={[0, 0.03, 0]} rotation={[-Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.42, 0.42, 0.03, 24]} />
          <meshStandardMaterial color="#ff69b4" emissive="#ff69b4" emissiveIntensity={0.35} transparent opacity={0.65} />
        </mesh>
      )}
      <mesh ref={bodyRef} position={[0, 0.35, 0]} castShadow>
        <boxGeometry args={[0.32, 0.38, 0.22]} />
        <meshStandardMaterial color={outfitColor} roughness={0.7} />

        <group ref={headRef} position={[0, 0.38, 0]}>
          <mesh castShadow>
            <boxGeometry args={[0.38, 0.38, 0.34]} />
            <meshStandardMaterial color={skinColor} roughness={0.8} />
          </mesh>
          <mesh position={[0, 0.18, 0]}>
            <boxGeometry args={[0.4, 0.1, 0.36]} />
            <meshStandardMaterial color={hairColor} roughness={0.9} />
          </mesh>
          <mesh position={[0, 0.06, -0.2]}>
            <boxGeometry args={[0.36, 0.28, 0.06]} />
            <meshStandardMaterial color={hairColor} roughness={0.9} />
          </mesh>
          <mesh position={[-0.22, -0.02, 0]}>
            <boxGeometry args={[0.06, 0.22, 0.3]} />
            <meshStandardMaterial color={hairColor} roughness={0.9} />
          </mesh>
          <mesh position={[0.22, -0.02, 0]}>
            <boxGeometry args={[0.06, 0.22, 0.3]} />
            <meshStandardMaterial color={hairColor} roughness={0.9} />
          </mesh>
          <mesh position={[-0.1, 0.04, 0.18]}>
            <boxGeometry args={[0.08, 0.1, 0.01]} />
            <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={0.4} />
          </mesh>
          <mesh position={[0.1, 0.04, 0.18]}>
            <boxGeometry args={[0.08, 0.1, 0.01]} />
            <meshStandardMaterial color={eyeColor} emissive={eyeColor} emissiveIntensity={0.4} />
          </mesh>
          <mesh position={[-0.08, 0.07, 0.185]}>
            <boxGeometry args={[0.025, 0.025, 0.001]} />
            <meshStandardMaterial color="white" emissive="white" emissiveIntensity={1} />
          </mesh>
          <mesh position={[0.12, 0.07, 0.185]}>
            <boxGeometry args={[0.025, 0.025, 0.001]} />
            <meshStandardMaterial color="white" emissive="white" emissiveIntensity={1} />
          </mesh>
          <mesh position={[-0.16, -0.02, 0.175]}>
            <boxGeometry args={[0.07, 0.04, 0.001]} />
            <meshStandardMaterial color="#ff9fb3" transparent opacity={0.6} />
          </mesh>
          <mesh position={[0.16, -0.02, 0.175]}>
            <boxGeometry args={[0.07, 0.04, 0.001]} />
            <meshStandardMaterial color="#ff9fb3" transparent opacity={0.6} />
          </mesh>
          <mesh position={[0, -0.07, 0.175]}>
            <boxGeometry args={[0.07, 0.025, 0.001]} />
            <meshStandardMaterial color="#c0506e" />
          </mesh>
          <mesh position={[-0.18, 0.2, 0]} rotation={[0, 0, 0.3]}>
            <boxGeometry args={[0.12, 0.07, 0.04]} />
            <meshStandardMaterial color="#f472b6" />
          </mesh>
        </group>

        <group ref={leftArmRef} position={[-0.22, 0.1, 0]}>
          <mesh position={[0, -0.14, 0]} castShadow>
            <boxGeometry args={[0.1, 0.28, 0.1]} />
            <meshStandardMaterial color={outfitColor} roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.3, 0]}>
            <boxGeometry args={[0.11, 0.11, 0.11]} />
            <meshStandardMaterial color={skinColor} roughness={0.8} />
          </mesh>
        </group>

        <group ref={rightArmRef} position={[0.22, 0.1, 0]}>
          <mesh position={[0, -0.14, 0]} castShadow>
            <boxGeometry args={[0.1, 0.28, 0.1]} />
            <meshStandardMaterial color={outfitColor} roughness={0.7} />
          </mesh>
          <mesh position={[0, -0.3, 0]}>
            <boxGeometry args={[0.11, 0.11, 0.11]} />
            <meshStandardMaterial color={skinColor} roughness={0.8} />
          </mesh>
        </group>
      </mesh>

      <mesh position={[0, 0.16, 0]}>
        <boxGeometry args={[0.36, 0.12, 0.26]} />
        <meshStandardMaterial color="#f9a8d4" roughness={0.8} />
      </mesh>

      <group ref={leftLegRef} position={[-0.1, 0.1, 0]}>
        <mesh position={[0, -0.14, 0]} castShadow>
          <boxGeometry args={[0.12, 0.28, 0.12]} />
          <meshStandardMaterial color={skinColor} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.3, 0.02]}>
          <boxGeometry args={[0.13, 0.09, 0.16]} />
          <meshStandardMaterial color="#581c87" roughness={0.6} />
        </mesh>
      </group>

      <group ref={rightLegRef} position={[0.1, 0.1, 0]}>
        <mesh position={[0, -0.14, 0]} castShadow>
          <boxGeometry args={[0.12, 0.28, 0.12]} />
          <meshStandardMaterial color={skinColor} roughness={0.8} />
        </mesh>
        <mesh position={[0, -0.3, 0.02]}>
          <boxGeometry args={[0.13, 0.09, 0.16]} />
          <meshStandardMaterial color="#581c87" roughness={0.6} />
        </mesh>
      </group>
    </group>
  );
}

function FloatParticle({ index }) {
  const mesh = useRef();
  const speed = 0.4 + (index % 5) * 0.2;
  const xPos = -6 + (index % 10) * 1.35;
  const zBase = -3.5 + (index % 5) * 1.4;
  const phase = index * 0.9;

  useFrame(({ clock }) => {
    if (!mesh.current) return;
    const t = clock.elapsedTime * speed + phase;
    mesh.current.position.y = 0.45 + Math.sin(t) * 0.35 + (index % 3) * 0.25;
    mesh.current.rotation.y = t;
    mesh.current.rotation.z = t * 0.5;
  });

  return (
    <mesh ref={mesh} position={[xPos, 0.5, zBase]}>
      <octahedronGeometry args={[0.04, 0]} />
      <meshStandardMaterial
        color={index % 2 === 0 ? '#f0abfc' : '#f9a8d4'}
        emissive={index % 2 === 0 ? '#a855f7' : '#ec4899'}
        emissiveIntensity={1.5}
      />
    </mesh>
  );
}

function FurnitureItem({ position, rotation = [0, 0, 0], onClick, children }) {
  const groupRef = useRef();

  const handleClick = (e) => {
    e.stopPropagation();
    if (!onClick || !groupRef.current) return;
    const hits = e.ray.intersectObject(groupRef.current, true);
    if (hits.length > 0) onClick();
  };

  return (
    <group
      ref={groupRef}
      position={position}
      rotation={rotation}
      onClick={handleClick}
      onPointerOver={() => {
        document.body.style.cursor = 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'auto';
      }}
    >
      {children}
    </group>
  );
}

function RoomFurniture({ onBedClick }) {
  return (
    <>
      <FurnitureItem position={[-2.05, 0, -1.55]} onClick={onBedClick}>
        <mesh position={[0, 0.2, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.4, 0.22, 0.72]} />
          <meshStandardMaterial color="#ff69b4" />
        </mesh>
        <mesh position={[0, 0.33, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.26, 0.14, 0.6]} />
          <meshStandardMaterial color="#ffb6c1" />
        </mesh>
        <mesh position={[0, 0.62, -0.31]} castShadow receiveShadow>
          <boxGeometry args={[1.4, 0.62, 0.12]} />
          <meshStandardMaterial color="#ff69b4" />
        </mesh>
        <mesh position={[-0.34, 0.42, -0.15]} castShadow>
          <boxGeometry args={[0.32, 0.08, 0.2]} />
          <meshStandardMaterial color="#fff0f5" />
        </mesh>
        <mesh position={[0.34, 0.42, -0.15]} castShadow>
          <boxGeometry args={[0.32, 0.08, 0.2]} />
          <meshStandardMaterial color="#fff0f5" />
        </mesh>
      </FurnitureItem>

      <FurnitureItem
        position={[2.05, 0, -1.55]}
        onClick={() => {
          window.location.href = '/about';
        }}
      >
        <mesh position={[0, 0.4, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.0, 0.12, 0.44]} />
          <meshStandardMaterial color="#fff0f5" />
        </mesh>
        <mesh position={[-0.36, 0.2, 0]} castShadow>
          <boxGeometry args={[0.1, 0.4, 0.1]} />
          <meshStandardMaterial color="#fff0f5" />
        </mesh>
        <mesh position={[0.36, 0.2, 0]} castShadow>
          <boxGeometry args={[0.1, 0.4, 0.1]} />
          <meshStandardMaterial color="#fff0f5" />
        </mesh>
        <mesh position={[0, 0.95, -0.14]} castShadow>
          <boxGeometry args={[0.76, 0.92, 0.08]} />
          <meshStandardMaterial color="#ff69b4" />
        </mesh>
        <mesh position={[0, 0.95, -0.09]} castShadow>
          <boxGeometry args={[0.62, 0.78, 0.02]} />
          <meshStandardMaterial
            color="#e8d5f5"
            transparent
            opacity={0.6}
            emissive="#ffffff"
            emissiveIntensity={0.2}
          />
        </mesh>
      </FurnitureItem>

      <group position={[2.15, 0, 0.95]} rotation={[0, -Math.PI / 2, 0]}>
        <mesh position={[0, 0.26, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.18, 0.3, 0.62]} />
          <meshStandardMaterial color="#ff69b4" />
        </mesh>
        <mesh position={[-0.32, 0.6, 0]} castShadow receiveShadow>
          <boxGeometry args={[0.56, 0.4, 0.62]} />
          <meshStandardMaterial color="#ff85c2" />
        </mesh>
        <mesh position={[0, 0.43, -0.32]} castShadow receiveShadow>
          <boxGeometry args={[1.18, 0.36, 0.14]} />
          <meshStandardMaterial color="#ff69b4" />
        </mesh>
        <mesh position={[0, 0.43, 0.32]} castShadow receiveShadow>
          <boxGeometry args={[1.18, 0.36, 0.14]} />
          <meshStandardMaterial color="#ff69b4" />
        </mesh>
      </group>

      <FurnitureItem
        position={[-2.62, 0, 0.9]}
        rotation={[0, Math.PI / 2, 0]}
        onClick={() => {
          window.location.href = '/reading';
        }}
      >
        <mesh position={[0, 0.95, 0]} castShadow receiveShadow>
          <boxGeometry args={[1.05, 1.9, 0.26]} />
          <meshStandardMaterial color="#f8c8d4" />
        </mesh>
        <mesh position={[0, 0.35, 0.01]} castShadow>
          <boxGeometry args={[0.9, 0.06, 0.2]} />
          <meshStandardMaterial color="#ffe3ee" />
        </mesh>
        <mesh position={[0, 0.9, 0.01]} castShadow>
          <boxGeometry args={[0.9, 0.06, 0.2]} />
          <meshStandardMaterial color="#ffe3ee" />
        </mesh>
        <mesh position={[0, 1.45, 0.01]} castShadow>
          <boxGeometry args={[0.9, 0.06, 0.2]} />
          <meshStandardMaterial color="#ffe3ee" />
        </mesh>

        <mesh position={[-0.3, 0.62, 0.04]} castShadow>
          <boxGeometry args={[0.08, 0.3, 0.14]} />
          <meshStandardMaterial color="#a78bfa" />
        </mesh>
        <mesh position={[-0.18, 0.63, 0.04]} castShadow>
          <boxGeometry args={[0.08, 0.32, 0.14]} />
          <meshStandardMaterial color="#f472b6" />
        </mesh>
        <mesh position={[-0.06, 0.6, 0.04]} castShadow>
          <boxGeometry args={[0.08, 0.26, 0.14]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.08, 0.62, 0.04]} castShadow>
          <boxGeometry args={[0.08, 0.3, 0.14]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>
        <mesh position={[0.22, 0.61, 0.04]} castShadow>
          <boxGeometry args={[0.08, 0.28, 0.14]} />
          <meshStandardMaterial color="#34d399" />
        </mesh>
        <mesh position={[0.34, 0.59, 0.04]} castShadow>
          <boxGeometry args={[0.08, 0.24, 0.14]} />
          <meshStandardMaterial color="#fb923c" />
        </mesh>
        <mesh position={[-0.26, 1.17, 0.04]} castShadow>
          <boxGeometry args={[0.08, 0.25, 0.14]} />
          <meshStandardMaterial color="#f472b6" />
        </mesh>
        <mesh position={[-0.13, 1.17, 0.04]} castShadow>
          <boxGeometry args={[0.08, 0.25, 0.14]} />
          <meshStandardMaterial color="#a78bfa" />
        </mesh>
      </FurnitureItem>
    </>
  );
}

function CameraRig({ focusRoom, controlsRef }) {
  const { camera } = useThree();
  const rigRef = useRef({
    active: false,
    desiredCam: new THREE.Vector3(),
    desiredTarget: new THREE.Vector3(),
  });

  useEffect(() => {
    const roomPos = ROOMS[focusRoom]?.pos ?? [0, 0, 0];
    rigRef.current.desiredTarget.set(roomPos[0], roomPos[1] + 0.3, roomPos[2] - 0.62);
    rigRef.current.desiredCam.set(roomPos[0], roomPos[1] + 2.6, roomPos[2] + 8.85);
    rigRef.current.active = true;
  }, [focusRoom]);

  useFrame(() => {
    if (!rigRef.current.active || !controlsRef.current) return;

    camera.position.lerp(rigRef.current.desiredCam, 0.12);
    controlsRef.current.target.lerp(rigRef.current.desiredTarget, 0.12);
    controlsRef.current.update();

    const camClose = camera.position.distanceTo(rigRef.current.desiredCam) < 0.05;
    const targetClose = controlsRef.current.target.distanceTo(rigRef.current.desiredTarget) < 0.05;
    if (camClose && targetClose) rigRef.current.active = false;
  });

  return null;
}

export default function ChibiScene({ embedded = false }) {
  const [chibiPos, setChibiPos] = useState(ROOMS.bedroom.pos);
  const [chibiSelected, setChibiSelected] = useState(false);
  const [chibiTarget, setChibiTarget] = useState(null);
  const [popup, setPopup] = useState({ visible: false, message: '' });
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [focusRoom, setFocusRoom] = useState('bedroom');
  const controlsRef = useRef();

  const roomKeys = useMemo(() => Object.keys(ROOMS), []);

  const showPopup = (message) => {
    setPopup({ visible: true, message });
  };

  const onRoomClick = (roomKey) => {
    setSelectedRoom(roomKey);
    if (chibiSelected) {
      setChibiTarget(ROOMS[roomKey].pos);
      setChibiSelected(false);
    }
  };

  return (
    <div
      style={{
        width: embedded ? '100%' : '100vw',
        height: embedded ? '100%' : '100vh',
        background: 'linear-gradient(180deg, #fff5f7 0%, #ffe4ec 45%, #ffd6e0 100%)',
        fontFamily: "'Nunito', system-ui, sans-serif",
        position: 'relative',
        overflow: 'hidden',
        margin: 0,
      }}
    >
      {!embedded && (
        <a
          href="/"
          style={{
            position: 'absolute',
            top: 20,
            left: 20,
            zIndex: 20,
            color: '#c2185b',
            textDecoration: 'none',
            fontSize: 14,
            fontWeight: 800,
            letterSpacing: '0.04em',
          }}
        >
          ← marissa codes
        </a>
      )}
      <div
        style={{
          position: 'absolute',
          top: 28,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(255,255,255,0.72)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(255,182,193,0.65)',
          borderRadius: 999,
          padding: '10px 24px',
          color: '#9d174d',
          fontSize: 15,
          fontWeight: 700,
          letterSpacing: '0.04em',
          zIndex: 10,
          display: embedded ? 'none' : 'block',
        }}
      >
        {chibiSelected ? '✨ Select a room for Chibi' : `📍 ${selectedRoom ? ROOMS[selectedRoom].label : 'Click Chibi to move her'}`}
      </div>

      <Canvas
        shadows
        camera={{ position: [0, 2.6, 8.85], fov: 36 }}
        style={{ width: '100%', height: '100%' }}
      >
        <ambientLight intensity={0.72} color="#ffe4ec" />
        <directionalLight
          castShadow
          position={[4, 6, 4]}
          intensity={1.05}
          color="#fff8f8"
          shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[1.2, 1.5, 0.8]} intensity={0.45} color="#ffb7c5" distance={8} />
        <pointLight position={[-2.2, 1.2, -1]} intensity={0.35} color="#ffc2d4" distance={7} />
        <pointLight position={[0, 2.5, -1]} intensity={0.28} color="#ffffff" distance={6} />
        {roomKeys.map((k) => (
          <pointLight key={`room-light-${k}`} position={[ROOMS[k].pos[0], ROOMS[k].pos[1] + 2, ROOMS[k].pos[2] + 0.2]} intensity={0.3} color="#ffb7c5" distance={6} />
        ))}

        {roomKeys.map((k) => (
          <RoomShell key={k} roomKey={k} onRoomClick={onRoomClick} />
        ))}
        <DividerWalls />

        <BedroomFurniture showPopup={showPopup} />
        <LivingFurniture showPopup={showPopup} />
        <OfficeFurniture showPopup={showPopup} />
        <LibraryFurniture showPopup={showPopup} />
        <ClosetFurniture showPopup={showPopup} />

        <Chibi
          chibiPos={chibiPos}
          setChibiPos={setChibiPos}
          chibiTarget={chibiTarget}
          setChibiTarget={setChibiTarget}
          chibiSelected={chibiSelected}
          setChibiSelected={setChibiSelected}
          setSelectedRoom={setSelectedRoom}
        />

        {[...Array(12)].map((_, i) => (
          <FloatParticle key={i} index={i} />
        ))}

        <CameraRig focusRoom={focusRoom} controlsRef={controlsRef} />
        <OrbitControls
          ref={controlsRef}
          enablePan
          enableRotate
          enableZoom
          minDistance={6}
          maxDistance={16.5}
          minPolarAngle={0.35}
          maxPolarAngle={Math.PI / 2.02}
          target={[0, 0.3, -0.62]}
        />
      </Canvas>

      {!embedded && (
        <div
          style={{
            position: 'absolute',
            bottom: 24,
            left: '50%',
            transform: 'translateX(-50%)',
            zIndex: 20,
            display: 'flex',
            gap: 8,
            background: 'rgba(255,255,255,0.8)',
            padding: '8px 12px',
            borderRadius: 999,
            border: '1px solid rgba(255, 105, 180, 0.3)',
            backdropFilter: 'blur(10px)',
          }}
        >
          {roomKeys.map((roomKey) => (
            <button
              key={roomKey}
              type="button"
              onClick={() => setFocusRoom(roomKey)}
              style={{
                width: 34,
                height: 34,
                borderRadius: 10,
                border: 'none',
                cursor: 'pointer',
                background: focusRoom === roomKey ? '#ff69b4' : '#fbcfe8',
                color: focusRoom === roomKey ? '#fff' : '#9d174d',
                fontSize: 16,
                fontWeight: 700,
                boxShadow: focusRoom === roomKey ? '0 0 16px rgba(255, 105, 180, 0.45)' : 'none',
              }}
              aria-label={`Focus ${ROOMS[roomKey].label}`}
            >
              {ROOMS[roomKey].emoji}
            </button>
          ))}
        </div>
      )}

      {popup.visible && (
        <div
          onClick={() => setPopup({ visible: false, message: '' })}
          style={{
            position: 'absolute',
            inset: 0,
            zIndex: 100,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'rgba(255, 182, 193, 0.14)',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              position: 'relative',
              background: 'rgba(255,255,255,0.92)',
              backdropFilter: 'blur(16px)',
              border: '2px solid #ff69b4',
              borderRadius: 24,
              padding: '24px 36px',
              fontSize: 18,
              fontWeight: 700,
              color: '#9d174d',
              boxShadow: '0 8px 32px rgba(255,105,180,0.3)',
              textAlign: 'center',
              maxWidth: 520,
            }}
          >
            <button
              type="button"
              onClick={() => setPopup({ visible: false, message: '' })}
              style={{
                position: 'absolute',
                top: 8,
                right: 12,
                border: 'none',
                background: 'transparent',
                color: '#ff69b4',
                fontSize: 18,
                fontWeight: 800,
                cursor: 'pointer',
              }}
            >
              ✕
            </button>
            {popup.message}
          </div>
        </div>
      )}
    </div>
  );
}

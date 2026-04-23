import { useRef, useEffect, useMemo, useState } from 'react';
import { Canvas, useFrame, useThree } from '@react-three/fiber';
import { OrbitControls, Text, useAnimations, useGLTF } from '@react-three/drei';
import * as THREE from 'three';
import * as SkeletonUtils from 'three/examples/jsm/utils/SkeletonUtils.js';

const ROOMS = {
  bedroom: { pos: [-3.9, 0.55, -0.25], label: '🛏️ Bedroom', emoji: '🛏️', floor: '#ffd6e0' },
  closet: { pos: [0, 0.55, -0.25], label: '🎀 Closet', emoji: '🎀', floor: '#fce7f3' },
  library: { pos: [3.9, 0.55, -0.25], label: '📚 Library', emoji: '📚', floor: '#fef3c7' },
  living: { pos: [-3.9, -2.55, -0.25], label: '🛋️ Living Room', emoji: '🛋️', floor: '#ffe4ec' },
  office: { pos: [0, -2.55, -0.25], label: '💻 Office', emoji: '💻', floor: '#f3e8ff' },
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
  const wallpaper = {
    bedroom: '#ffe0ec',
    library: '#fef9c3',
    office: '#ede9fe',
    living: '#fff0f5',
    closet: '#f3e8ff',
  }[roomKey];
  const ceilingTint = new THREE.Color(room.floor).multiplyScalar(0.92).getStyle();

  return (
    <group position={[x, y, z]}>
      <mesh receiveShadow onClick={() => onRoomClick(roomKey)}>
        <boxGeometry args={[3.8, 0.1, 3.5]} />
        <meshStandardMaterial color={room.floor} />
      </mesh>
      <mesh position={[0, 1.4, -0.06]} receiveShadow>
        <boxGeometry args={[3.8, 0.08, 3.5]} />
        <meshStandardMaterial color={ceilingTint} />
      </mesh>
      <mesh position={[0, 0.72, -1.75]} castShadow receiveShadow>
        <boxGeometry args={[3.8, 1.45, 0.1]} />
        <meshStandardMaterial color={wallpaper} />
      </mesh>
      {roomKey === 'bedroom' &&
        Array.from({ length: 20 }).map((_, i) => (
          <mesh key={`bed-dot-${i}`} position={[-1.5 + (i % 5) * 0.75, 0.25 + Math.floor(i / 5) * 0.32, -1.69]}>
            <boxGeometry args={[0.05, 0.05, 0.02]} />
            <meshStandardMaterial color="#ff9bc8" emissive="#ff9bc8" emissiveIntensity={0.12} />
          </mesh>
        ))}
      {roomKey === 'library' &&
        Array.from({ length: 10 }).map((_, i) => (
          <mesh key={`lib-stripe-${i}`} position={[-1.65 + i * 0.37, 0.72, -1.69]}>
            <boxGeometry args={[0.05, 1.2, 0.02]} />
            <meshStandardMaterial color="#facc15" emissive="#fef08a" emissiveIntensity={0.08} />
          </mesh>
        ))}
      {roomKey === 'office' &&
        Array.from({ length: 15 }).map((_, i) => (
          <mesh key={`off-grid-${i}`} position={[-1.3 + (i % 5) * 0.65, 0.35 + Math.floor(i / 5) * 0.35, -1.69]}>
            <boxGeometry args={[0.2, 0.04, 0.02]} />
            <meshStandardMaterial color="#a78bfa" emissive="#c4b5fd" emissiveIntensity={0.1} />
          </mesh>
        ))}
      {roomKey === 'living' &&
        Array.from({ length: 9 }).map((_, i) => (
          <mesh key={`liv-stripe-${i}`} position={[-1.52 + i * 0.38, 0.72, -1.69]}>
            <boxGeometry args={[0.08, 1.22, 0.02]} />
            <meshStandardMaterial color="#f9a8d4" emissive="#fbcfe8" emissiveIntensity={0.09} />
          </mesh>
        ))}
      <Text
        position={[0, 1.52, 0.55]}
        fontSize={0.28}
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
  const houseWidth = 11.6;
  const houseDepth = 3.2;
  const houseHeight = 5.85;

  return (
    <group position={[0, -1, 0]}>
      <mesh position={[0, 1.38, -1.86]} castShadow receiveShadow>
        <boxGeometry args={[houseWidth, houseHeight, 0.14]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-5.75, 1.38, -0.26]} castShadow receiveShadow>
        <boxGeometry args={[0.14, houseHeight, houseDepth]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[5.75, 1.38, -0.26]} castShadow receiveShadow>
        <boxGeometry args={[0.14, houseHeight, houseDepth]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      <mesh position={[-1.95, 0.0, -0.26]} castShadow receiveShadow>
        <boxGeometry args={[0.1, 5.35, 3.0]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[1.95, 0.0, -0.26]} castShadow receiveShadow>
        <boxGeometry args={[0.1, 5.35, 3.0]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      <mesh position={[-1.95, 2.66, -0.26]} castShadow receiveShadow>
        <boxGeometry args={[0.16, 0.1, 3.0]} />
        <meshStandardMaterial color="#ff9bc8" />
      </mesh>
      <mesh position={[1.95, 2.66, -0.26]} castShadow receiveShadow>
        <boxGeometry args={[0.16, 0.1, 3.0]} />
        <meshStandardMaterial color="#ff9bc8" />
      </mesh>

      <mesh position={[0, 0, -0.26]} castShadow receiveShadow>
        <boxGeometry args={[houseWidth, 0.2, 3.7]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 0.0, 1.25]} castShadow receiveShadow>
        <boxGeometry args={[houseWidth, 0.08, 0.1]} />
        <meshStandardMaterial color="#ff9bc8" />
      </mesh>

      <mesh position={[0, 2.82, -0.26]} castShadow receiveShadow>
        <boxGeometry args={[houseWidth, 0.2, 3.7]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[0, 2.82, 1.25]} castShadow receiveShadow>
        <boxGeometry args={[houseWidth, 0.08, 0.1]} />
        <meshStandardMaterial color="#ff69b4" />
      </mesh>

      <mesh position={[0, 4.8, -0.26]} castShadow receiveShadow>
        <boxGeometry args={[12.2, 0.14, 3.7]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>

      <mesh position={[0, 5.2, -0.26]} rotation={[0, 0, Math.PI / 5.14]} castShadow receiveShadow>
        <boxGeometry args={[5.4, 0.18, 3.78]} />
        <meshStandardMaterial color="#ff85c2" />
      </mesh>
      <mesh position={[0, 5.2, -0.26]} rotation={[0, 0, -Math.PI / 5.14]} castShadow receiveShadow>
        <boxGeometry args={[5.4, 0.18, 3.78]} />
        <meshStandardMaterial color="#ff85c2" />
      </mesh>
      <mesh position={[0, 6.0, -0.26]} castShadow receiveShadow>
        <boxGeometry args={[0.2, 0.2, 3.7]} />
        <meshStandardMaterial color="#e75480" />
      </mesh>
      <mesh position={[2.8, 5.95, -1.02]} castShadow receiveShadow>
        <boxGeometry args={[0.52, 0.9, 0.52]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[2.8, 6.45, -1.02]} castShadow receiveShadow>
        <boxGeometry args={[0.42, 0.24, 0.42]} />
        <meshStandardMaterial color="#f9a3ca" />
      </mesh>

      <mesh position={[0, -2.98, -0.26]} castShadow receiveShadow>
        <boxGeometry args={[houseWidth, 0.2, houseDepth]} />
        <meshStandardMaterial color="#f7e4ee" />
      </mesh>

      <mesh position={[-5.7, 0.12, 1.08]} castShadow receiveShadow>
        <boxGeometry args={[0.15, 6.0, 0.15]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[5.7, 0.12, 1.08]} castShadow receiveShadow>
        <boxGeometry args={[0.15, 6.0, 0.15]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[-5.7, 3.0, 1.08]} castShadow receiveShadow>
        <boxGeometry args={[0.28, 0.14, 0.18]} />
        <meshStandardMaterial color="#ff69b4" />
      </mesh>
      <mesh position={[-5.7, -2.7, 1.08]} castShadow receiveShadow>
        <boxGeometry args={[0.28, 0.14, 0.18]} />
        <meshStandardMaterial color="#ff69b4" />
      </mesh>
      <mesh position={[5.7, 3.0, 1.08]} castShadow receiveShadow>
        <boxGeometry args={[0.28, 0.14, 0.18]} />
        <meshStandardMaterial color="#ff69b4" />
      </mesh>
      <mesh position={[5.7, -2.7, 1.08]} castShadow receiveShadow>
        <boxGeometry args={[0.28, 0.14, 0.18]} />
        <meshStandardMaterial color="#ff69b4" />
      </mesh>

      {Array.from({ length: 32 }).map((_, i) => (
        <mesh key={`cornice-${i}`} position={[-4.65 + i * 0.3, 4.82, 1.08]} castShadow receiveShadow>
          <boxGeometry args={[0.15, 0.15, 0.15]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}
      {[-2.6, -1.8, -1.0, -0.2, 0.6, 1.4, 2.2].map((x) => (
        <mesh key={`lace-upper-${x}`} position={[x, 0.12, 1.1]} castShadow receiveShadow>
          <boxGeometry args={[0.34, 0.08, 0.08]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
      ))}

      {[[-5.24, 3.3], [5.24, 3.3]].map(([x, y], idx) => (
        <group key={`bow-${idx}`} position={[x, y, 1.14]}>
          <mesh position={[-0.12, 0, 0]} castShadow>
            <boxGeometry args={[0.18, 0.1, 0.06]} />
            <meshStandardMaterial color="#ff69b4" />
          </mesh>
          <mesh position={[0.12, 0, 0]} castShadow>
            <boxGeometry args={[0.18, 0.1, 0.06]} />
            <meshStandardMaterial color="#ff69b4" />
          </mesh>
          <mesh castShadow>
            <boxGeometry args={[0.09, 0.13, 0.07]} />
            <meshStandardMaterial color="#e75480" />
          </mesh>
        </group>
      ))}

      {[[-5.75, 2.2], [5.75, 2.2], [-5.75, -0.8], [5.75, -0.8]].map(([x, y], idx) => (
        <group key={`side-window-${idx}`} position={[x + (x < 0 ? 0.05 : -0.05), y, -1.18]}>
          <mesh castShadow receiveShadow>
            <boxGeometry args={[0.08, 1.05, 0.95]} />
            <meshStandardMaterial color="#ff69b4" />
          </mesh>
          <mesh position={[x < 0 ? 0.03 : -0.03, 0, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.03, 0.84, 0.68]} />
            <meshStandardMaterial color="#fffde7" emissive="#fffde7" emissiveIntensity={0.16} />
          </mesh>
          <mesh position={[x < 0 ? 0.03 : -0.03, -0.6, 0]} castShadow receiveShadow>
            <boxGeometry args={[0.26, 0.08, 0.78]} />
            <meshStandardMaterial color="#ff69b4" />
          </mesh>
          {[-0.08, 0, 0.08].map((fx) => (
            <mesh key={`flower-${fx}`} position={[x < 0 ? 0.03 : -0.03, -0.54, fx]} castShadow>
              <boxGeometry args={[0.08, 0.08, 0.08]} />
              <meshStandardMaterial color="#f472b6" />
            </mesh>
          ))}
        </group>
      ))}
      <group position={[3.9, -1.5, 1.08]}>
        <mesh castShadow receiveShadow>
          <boxGeometry args={[0.6, 1.0, 0.05]} />
          <meshStandardMaterial color="#ff69b4" />
        </mesh>
        <mesh position={[0, 0, 0.01]} castShadow receiveShadow>
          <boxGeometry args={[0.5, 0.9, 0.04]} />
          <meshStandardMaterial color="#ffffff" />
        </mesh>
        <mesh position={[0.18, -0.04, 0.04]} castShadow>
          <boxGeometry args={[0.04, 0.04, 0.06]} />
          <meshStandardMaterial color="#fbbf24" />
        </mesh>
        {[-0.18, 0, 0.18].map((dx, i) => (
          <mesh key={`door-arch-${i}`} position={[dx, 0.56 + Math.abs(dx) * 0.3, 0]} castShadow>
            <boxGeometry args={[0.14, 0.08, 0.05]} />
            <meshStandardMaterial color="#ff69b4" />
          </mesh>
        ))}
      </group>
    </group>
  );
}

function DollhouseBackdrop() {
  const fenceXs = [-7.2, -6.4, -5.6, -4.8, -4.0, -3.2, -2.4, -1.6, -0.8, 0, 0.8, 1.6, 2.4, 3.2, 4.0, 4.8, 5.6, 6.4, 7.2];
  const sideTrees = [
    [-8, -1], [-9, 0], [-10, 1],
    [8, -1], [9, 0], [10, 1],
  ];

  return (
    <group>
      <mesh position={[0, 2.5, -7.1]} receiveShadow>
        <boxGeometry args={[28, 12.6, 0.2]} />
        <meshStandardMaterial color="#c8e7ff" />
      </mesh>
      <mesh position={[0, 0.55, -7.0]} receiveShadow>
        <boxGeometry args={[28, 5.2, 0.1]} />
        <meshStandardMaterial color="#f8d8ea" transparent opacity={0.48} />
      </mesh>

      <mesh position={[0, -3.08, -0.9]} receiveShadow>
        <boxGeometry args={[20, 0.1, 14]} />
        <meshStandardMaterial color="#c8e6c9" />
      </mesh>

      <mesh position={[0, -0.18, -5.95]} receiveShadow>
        <boxGeometry args={[16.2, 0.55, 0.35]} />
        <meshStandardMaterial color="#fffafc" />
      </mesh>
      {fenceXs.map((x) => (
        <mesh key={`fence-post-front-${x}`} position={[x, 0.05, -5.85]} receiveShadow>
          <boxGeometry args={[0.1, 0.56, 0.16]} />
          <meshStandardMaterial color="#fff6fb" />
        </mesh>
      ))}
      {[-6, -3, 0, 3, 6].map((x) => (
        <mesh key={`fence-rail-front-${x}`} position={[x, 0.0, -5.86]} receiveShadow>
          <boxGeometry args={[2.35, 0.07, 0.08]} />
          <meshStandardMaterial color="#fff6fb" />
        </mesh>
      ))}
      {[-5.85, -4.65, -3.45].map((z) => (
        <mesh key={`fence-left-${z}`} position={[-7.3, 0.05, z]} receiveShadow>
          <boxGeometry args={[0.12, 0.56, 0.16]} />
          <meshStandardMaterial color="#fff6fb" />
        </mesh>
      ))}
      {[-5.85, -4.65, -3.45].map((z) => (
        <mesh key={`fence-right-${z}`} position={[7.3, 0.05, z]} receiveShadow>
          <boxGeometry args={[0.12, 0.56, 0.16]} />
          <meshStandardMaterial color="#fff6fb" />
        </mesh>
      ))}

      {[-0.4, 0.35, 1.1, 1.85, 2.6, 3.35].map((z, i) => (
        <mesh key={`path-slab-${i}`} position={[3.9, -3.0, z]} receiveShadow>
          <boxGeometry args={[0.5, 0.05, 0.4]} />
          <meshStandardMaterial color="#f5deb3" />
        </mesh>
      ))}

      <mesh position={[9.2, -0.5, -5.0]} receiveShadow castShadow>
        <boxGeometry args={[1.5, 2.8, 0.2]} />
        <meshStandardMaterial color="#ffffff" />
      </mesh>
      <mesh position={[9.2, 0.35, -4.88]} receiveShadow>
        <boxGeometry args={[0.7, 0.7, 0.05]} />
        <meshStandardMaterial color="#adeca8" />
      </mesh>

      {sideTrees.map(([x, z]) => (
        <group key={`tree-${x}-${z}`} position={[x, -1.6, z]}>
          <mesh position={[0, 0.32, 0]} castShadow>
            <boxGeometry args={[0.24, 1.2, 0.24]} />
            <meshStandardMaterial color="#9a7254" />
          </mesh>
          <mesh position={[0, 1.35, 0]} castShadow>
            <boxGeometry args={[0.9, 1.5, 0.9]} />
            <meshStandardMaterial color="#8dcd8a" />
          </mesh>
          <mesh position={[0, 2.1, 0]} castShadow>
            <boxGeometry args={[0.6, 0.6, 0.6]} />
            <meshStandardMaterial color="#9ad892" />
          </mesh>
        </group>
      ))}

      {[-10.5, -7.0, -3.5, 0, 3.5, 7.0, 10.5].map((x) => (
        <group key={`cloud-${x}`} position={[x, 5.15, -7.0]}>
          <mesh>
            <boxGeometry args={[1.15, 0.45, 0.12]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[0.42, -0.02, 0]}>
            <boxGeometry args={[0.68, 0.32, 0.11]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
          <mesh position={[-0.42, -0.02, 0]}>
            <boxGeometry args={[0.68, 0.32, 0.11]} />
            <meshStandardMaterial color="#ffffff" />
          </mesh>
        </group>
      ))}
    </group>
  );
}

function BedroomFurniture({ showPopup }) {
  const [x, y, z] = ROOMS.bedroom.pos;
  return (
    <group position={[x, y, z]} scale={[1.3, 1.3, 1.3]}>
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
    <group position={[x, y, z]} scale={[1.3, 1.3, 1.3]}>
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
    <group position={[x, y, z]} scale={[1.3, 1.3, 1.3]}>
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
    <group position={[x, y, z]} scale={[1.3, 1.3, 1.3]}>
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
    <group position={[x, y, z]} scale={[1.3, 1.3, 1.3]}>
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
  const movingRef = useRef(false);
  const animRef = useRef('idle');

  const idleGltf = useGLTF('/Meshy_AI_Chibi_Coder_with_Gala_biped_Animation_Idle_4_withSkin.glb');
  const walkGltf = useGLTF('/Meshy_AI_Chibi_Coder_with_Gala_biped_Animation_Walking_withSkin.glb');
  const runGltf = useGLTF('/Meshy_AI_Chibi_Coder_with_Gala_biped_Animation_Running_withSkin.glb');

  const chibiModel = useMemo(() => {
    const cloned = SkeletonUtils.clone(idleGltf.scene);
    // Use a fixed miniature scale for this rig to avoid oversized normalization.
    cloned.scale.setScalar(0.14);
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
  }, [idleGltf.scene]);

  const clips = useMemo(
    () => [...idleGltf.animations, ...walkGltf.animations, ...runGltf.animations],
    [idleGltf.animations, walkGltf.animations, runGltf.animations]
  );
  const { actions, mixer } = useAnimations(clips, chibiModel);

  const actionNames = useMemo(() => Object.keys(actions || {}), [actions]);
  const idleActionName = useMemo(
    () => actionNames.find((name) => /idle/i.test(name)) || actionNames[0],
    [actionNames]
  );
  const walkActionName = useMemo(
    () => actionNames.find((name) => /walk/i.test(name)) || actionNames.find((name) => /run/i.test(name)) || idleActionName,
    [actionNames, idleActionName]
  );

  useEffect(() => {
    if (!actions || !idleActionName) return;
    const idleAction = actions[idleActionName];
    if (!idleAction) return;
    idleAction.reset().fadeIn(0.2).play();
    animRef.current = 'idle';
    return () => {
      Object.values(actions).forEach((action) => action?.fadeOut(0.15));
    };
  }, [actions, idleActionName]);

  useFrame(({ clock }, delta) => {
    if (!group.current) return;
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

    if (actions) {
      const desiredAnim = movingRef.current ? 'walk' : 'idle';
      if (animRef.current !== desiredAnim) {
        const nextName = desiredAnim === 'walk' ? walkActionName : idleActionName;
        const prevName = animRef.current === 'walk' ? walkActionName : idleActionName;
        const nextAction = actions[nextName];
        const prevAction = actions[prevName];
        if (nextAction) {
          prevAction?.fadeOut(0.2);
          nextAction.reset().fadeIn(0.2).play();
          animRef.current = desiredAnim;
        }
      }
      mixer?.update(delta);
    }
  });

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
      <primitive object={chibiModel} />
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
    rigRef.current.desiredTarget.set(roomPos[0], 1.5, roomPos[2]);
    rigRef.current.desiredCam.set(roomPos[0], 6, roomPos[2] + 18);
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
        camera={{ position: [0, 6, 18], fov: 38 }}
        style={{ width: '100%', height: '100%' }}
      >
        <DollhouseBackdrop />
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
          enablePan={false}
          enableRotate
          enableZoom
          minAzimuthAngle={-0.4}
          maxAzimuthAngle={0.4}
          minDistance={10}
          maxDistance={24}
          minPolarAngle={0.6}
          maxPolarAngle={1.2}
          target={[0, 1.5, 0]}
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

useGLTF.preload('/Meshy_AI_Chibi_Coder_with_Gala_biped_Animation_Idle_4_withSkin.glb');
useGLTF.preload('/Meshy_AI_Chibi_Coder_with_Gala_biped_Animation_Walking_withSkin.glb');
useGLTF.preload('/Meshy_AI_Chibi_Coder_with_Gala_biped_Animation_Running_withSkin.glb');

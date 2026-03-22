import { useRef, useEffect, useState } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { OrbitControls } from '@react-three/drei';
import * as THREE from 'three';
import { CoderRoom } from '../components/CoderRoom.jsx';

// ─── PHASE CONSTANTS ───────────────────────────────────────────────────────────
const CHIBI_START = [-2.5, 0, 0];
const LAPTOP_POS = [1.2, 0, 0];
const PICKUP_DIST = 0.9;

function Laptop({ phase }) {
  const pivot = useRef();
  const screenRef = useRef();

  useFrame(({ clock }) => {
    if (!pivot.current) return;
    const t = clock.elapsedTime;

    if (phase === 'holding') {
      pivot.current.rotation.z = Math.sin(t * 4) * 0.4;
      pivot.current.rotation.y = Math.sin(t * 2) * 0.3;
      pivot.current.position.y = THREE.MathUtils.lerp(
        pivot.current.position.y,
        1.1,
        0.05
      );
    } else if (phase === 'pickup') {
      pivot.current.position.y = THREE.MathUtils.lerp(
        pivot.current.position.y,
        0.3,
        0.04
      );
    } else {
      pivot.current.position.y = THREE.MathUtils.lerp(
        pivot.current.position.y,
        0.12,
        0.08
      );
    }

    if (screenRef.current) {
      screenRef.current.material.emissiveIntensity =
        0.6 + Math.sin(t * 2.5) * 0.3;
    }
  });

  return (
    <group ref={pivot} position={LAPTOP_POS}>
      <mesh castShadow receiveShadow>
        <boxGeometry args={[0.7, 0.05, 0.5]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh position={[0, 0.028, 0]}>
        <boxGeometry args={[0.62, 0.002, 0.42]} />
        <meshStandardMaterial color="#16213e" />
      </mesh>
      <mesh position={[0, 0.07, -0.22]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[0.7, 0.45, 0.04]} />
        <meshStandardMaterial color="#1a1a2e" metalness={0.8} roughness={0.2} />
      </mesh>
      <mesh ref={screenRef} position={[0, 0.07, -0.2]} rotation={[0.4, 0, 0]}>
        <boxGeometry args={[0.62, 0.38, 0.001]} />
        <meshStandardMaterial
          color="#a78bfa"
          emissive="#7c3aed"
          emissiveIntensity={0.8}
        />
      </mesh>
      <mesh position={[0, 0.029, 0.12]}>
        <boxGeometry args={[0.2, 0.002, 0.14]} />
        <meshStandardMaterial color="#0f3460" metalness={0.6} roughness={0.3} />
      </mesh>
    </group>
  );
}

function Chibi({ phase, onPhaseChange }) {
  const group = useRef();
  const bodyRef = useRef();
  const headRef = useRef();
  const leftArmRef = useRef();
  const rightArmRef = useRef();
  const leftLegRef = useRef();
  const rightLegRef = useRef();
  const posX = useRef(CHIBI_START[0]);

  useFrame(({ clock }, delta) => {
    if (!group.current) return;
    const t = clock.elapsedTime;

    if (phase === 'walking') {
      const speed = 1.4;
      posX.current += delta * speed;
      group.current.position.x = posX.current;
      group.current.rotation.y = 0;

      const swing = Math.sin(t * 8) * 0.5;
      if (leftLegRef.current) leftLegRef.current.rotation.x = swing;
      if (rightLegRef.current) rightLegRef.current.rotation.x = -swing;

      if (leftArmRef.current) leftArmRef.current.rotation.x = -swing * 0.6;
      if (rightArmRef.current) rightArmRef.current.rotation.x = swing * 0.6;

      if (bodyRef.current)
        bodyRef.current.position.y = Math.abs(Math.sin(t * 8)) * 0.03;

      if (headRef.current) headRef.current.rotation.z = Math.sin(t * 4) * 0.05;

      if (posX.current >= LAPTOP_POS[0] - PICKUP_DIST) {
        onPhaseChange('pickup');
      }
    }

    if (phase === 'pickup') {
      if (bodyRef.current)
        bodyRef.current.rotation.x = THREE.MathUtils.lerp(
          bodyRef.current.rotation.x,
          0.5,
          0.05
        );
      if (rightArmRef.current)
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(
          rightArmRef.current.rotation.x,
          1.4,
          0.05
        );
      if (leftLegRef.current)
        leftLegRef.current.rotation.x = THREE.MathUtils.lerp(
          leftLegRef.current.rotation.x,
          0,
          0.1
        );
      if (rightLegRef.current)
        rightLegRef.current.rotation.x = THREE.MathUtils.lerp(
          rightLegRef.current.rotation.x,
          0,
          0.1
        );
    }

    if (phase === 'holding') {
      if (bodyRef.current)
        bodyRef.current.rotation.x = THREE.MathUtils.lerp(
          bodyRef.current.rotation.x,
          0,
          0.05
        );
      if (rightArmRef.current) {
        rightArmRef.current.rotation.x = THREE.MathUtils.lerp(
          rightArmRef.current.rotation.x,
          -1.2 + Math.sin(t * 4) * 0.3,
          0.08
        );
        rightArmRef.current.rotation.z = THREE.MathUtils.lerp(
          rightArmRef.current.rotation.z,
          -0.4 + Math.sin(t * 4) * 0.2,
          0.08
        );
      }
      if (leftArmRef.current) {
        leftArmRef.current.rotation.x = THREE.MathUtils.lerp(
          leftArmRef.current.rotation.x,
          -0.8 + Math.sin(t * 3 + 1) * 0.5,
          0.08
        );
        leftArmRef.current.rotation.z = THREE.MathUtils.lerp(
          leftArmRef.current.rotation.z,
          0.6 + Math.sin(t * 3) * 0.3,
          0.08
        );
      }
      if (headRef.current) {
        headRef.current.rotation.z = Math.sin(t * 3) * 0.1;
        headRef.current.rotation.x = Math.sin(t * 2) * 0.05 - 0.1;
      }
      if (bodyRef.current)
        bodyRef.current.position.y = Math.abs(Math.sin(t * 4)) * 0.04;
    }

    if (phase === 'idle') {
      if (bodyRef.current)
        bodyRef.current.position.y = Math.sin(t * 1.5) * 0.02;
      if (headRef.current) headRef.current.rotation.z = Math.sin(t * 0.8) * 0.04;
    }
  });

  const skinColor = '#ffcba4';
  const outfitColor = '#e879f9';
  const hairColor = '#1a0533';
  const eyeColor = '#7c3aed';

  return (
    <group ref={group} position={CHIBI_START} castShadow>
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

function SceneController({ phase, setPhase }) {
  useEffect(() => {
    if (phase === 'idle') {
      const t = setTimeout(() => setPhase('walking'), 1800);
      return () => clearTimeout(t);
    }
    if (phase === 'pickup') {
      const t = setTimeout(() => setPhase('holding'), 1600);
      return () => clearTimeout(t);
    }
  }, [phase, setPhase]);

  return null;
}

const PHASE_LABELS = {
  idle: '✨ In the coder room...',
  walking: '🚶‍♀️ Walking across the room...',
  pickup: '🤏 Picking up the laptop...',
  holding: '💻 Waving the laptop!',
};

function FloatParticle({ index }) {
  const mesh = useRef();
  const speed = 0.4 + (index % 5) * 0.2;
  const xPos = -2.2 + (index % 6) * 0.75;
  const zBase = -1.85 + (index % 3) * 0.35;
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

export default function ChibiScene() {
  const [phase, setPhase] = useState('idle');
  const [runId, setRunId] = useState(0);

  const handleReplay = () => {
    setRunId((k) => k + 1);
    setPhase('idle');
  };

  return (
    <div
      style={{
        width: '100vw',
        height: '100vh',
        background: 'linear-gradient(135deg, #0d0015 0%, #1a0533 50%, #0d0015 100%)',
        fontFamily: "'Nunito', system-ui, sans-serif",
        position: 'relative',
        overflow: 'hidden',
        margin: 0,
      }}
    >
      <a
        href="/"
        style={{
          position: 'absolute',
          top: 20,
          left: 20,
          zIndex: 20,
          color: '#e9d5ff',
          textDecoration: 'none',
          fontSize: 14,
          fontWeight: 800,
          letterSpacing: '0.04em',
          textShadow: '0 0 12px rgba(168,85,247,0.6)',
        }}
      >
        ← marissa codes
      </a>

      <div
        style={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          background:
            'radial-gradient(ellipse at 20% 30%, rgba(168,85,247,0.08) 0%, transparent 60%), radial-gradient(ellipse at 80% 70%, rgba(236,72,153,0.06) 0%, transparent 50%)',
        }}
      />

      <div
        style={{
          position: 'absolute',
          top: 28,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(168,85,247,0.18)',
          backdropFilter: 'blur(12px)',
          border: '1px solid rgba(168,85,247,0.4)',
          borderRadius: 999,
          padding: '10px 28px',
          color: '#e9d5ff',
          fontSize: 16,
          fontWeight: 600,
          letterSpacing: '0.04em',
          zIndex: 10,
          transition: 'all 0.4s ease',
        }}
      >
        {PHASE_LABELS[phase]}
      </div>

      {phase === 'holding' && (
        <button
          type="button"
          onClick={handleReplay}
          style={{
            position: 'absolute',
            bottom: 36,
            left: '50%',
            transform: 'translateX(-50%)',
            background: 'linear-gradient(135deg, #a855f7, #ec4899)',
            border: 'none',
            borderRadius: 999,
            padding: '14px 40px',
            color: 'white',
            fontSize: 15,
            fontWeight: 700,
            cursor: 'pointer',
            letterSpacing: '0.06em',
            zIndex: 10,
            boxShadow: '0 0 30px rgba(168,85,247,0.5)',
            transition: 'transform 0.2s, box-shadow 0.2s',
            fontFamily: 'inherit',
          }}
          onMouseEnter={(e) => {
            e.target.style.transform = 'translateX(-50%) scale(1.07)';
            e.target.style.boxShadow = '0 0 50px rgba(168,85,247,0.8)';
          }}
          onMouseLeave={(e) => {
            e.target.style.transform = 'translateX(-50%) scale(1)';
            e.target.style.boxShadow = '0 0 30px rgba(168,85,247,0.5)';
          }}
        >
          ↺ Replay
        </button>
      )}

      <Canvas
        shadows
        camera={{ position: [0, 1.8, 5.5], fov: 45 }}
        style={{ width: '100%', height: '100%' }}
      >
        <SceneController phase={phase} setPhase={setPhase} />

        <ambientLight intensity={0.4} color="#c084fc" />
        <directionalLight
          castShadow
          position={[4, 6, 4]}
          intensity={1.5}
          color="#e9d5ff"
          shadow-mapSize={[2048, 2048]}
        />
        <pointLight position={[1.2, 1.5, 0.8]} intensity={1.6} color="#a855f7" distance={8} />
        <pointLight position={[-2.2, 1.2, -1]} intensity={0.55} color="#ec4899" distance={7} />
        <pointLight position={[0, 2.5, -1]} intensity={0.35} color="#c4b5fd" distance={6} />

        <CoderRoom />

        <Chibi
          key={runId}
          phase={phase}
          onPhaseChange={(next) => setPhase(next)}
        />

        <Laptop phase={phase} />

        {[...Array(12)].map((_, i) => (
          <FloatParticle key={i} index={i} />
        ))}

        <OrbitControls
          enablePan={false}
          minDistance={3.2}
          maxDistance={8}
          minPolarAngle={0.35}
          maxPolarAngle={Math.PI / 2.15}
          target={[0, 0.6, 0]}
        />
      </Canvas>
    </div>
  );
}

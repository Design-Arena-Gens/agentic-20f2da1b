"use client";

import { Canvas, useFrame } from "@react-three/fiber";
import { OrbitControls, Stage } from "@react-three/drei";
import { memo, useRef } from "react";
import type { Group, Mesh } from "three";

type CompanionCharacterProps = {
  speaking: boolean;
};

function CompanionCharacter({ speaking }: CompanionCharacterProps) {
  const groupRef = useRef<Group>(null);
  const headRef = useRef<Mesh>(null);
  const mouthRef = useRef<Mesh>(null);
  const leftArmRef = useRef<Mesh>(null);
  const rightArmRef = useRef<Mesh>(null);

  const idleOffset = useRef(Math.PI / 3);

  useFrame(({ clock }) => {
    const t = clock.elapsedTime + idleOffset.current;
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(t / 3) * 0.18;
      groupRef.current.position.y = Math.sin(t * 0.8) * 0.05;
    }
    if (headRef.current) {
      headRef.current.position.y = 1.35 + Math.sin(t * 1.3) * 0.04;
    }
    if (mouthRef.current) {
      const base = speaking ? 0.2 : 0.08;
      mouthRef.current.scale.y = base + Math.abs(Math.sin(t * (speaking ? 8 : 3))) * 0.3;
    }
    if (leftArmRef.current && rightArmRef.current) {
      const wave = Math.sin(t * (speaking ? 2.8 : 1.2)) * (speaking ? 0.6 : 0.25);
      leftArmRef.current.rotation.z = -0.6 + wave;
      rightArmRef.current.rotation.z = 0.6 - wave / 2;
    }
  });

  return (
    <group ref={groupRef}>
      <mesh position={[0, 0.8, 0]}>
        <cylinderGeometry args={[0.48, 0.58, 1.2, 32]} />
        <meshStandardMaterial color="#7c3aed" roughness={0.3} metalness={0.2} />
      </mesh>
      <mesh ref={headRef} position={[0, 1.35, 0]}>
        <sphereGeometry args={[0.43, 32, 32]} />
        <meshStandardMaterial color="#ede9fe" roughness={0.2} metalness={0.4} />
      </mesh>
      <mesh position={[0, 1.3, 0.35]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#facc15" emissive="#fbbf24" emissiveIntensity={0.5} />
      </mesh>
      <mesh position={[0, 1.3, -0.35]}>
        <sphereGeometry args={[0.12, 16, 16]} />
        <meshStandardMaterial color="#facc15" emissive="#fbbf24" emissiveIntensity={0.5} />
      </mesh>
      <mesh ref={mouthRef} position={[0, 1.1, 0.37]}>
        <cylinderGeometry args={[0.08, 0.08, 0.04, 24]} />
        <meshStandardMaterial color="#fb7185" metalness={0.3} />
      </mesh>
      <mesh rotation={[0, 0, Math.PI / 2]} position={[0, 0.25, 0]}>
        <cylinderGeometry args={[0.4, 0.45, 1.05, 24]} />
        <meshStandardMaterial color="#6d28d9" roughness={0.35} />
      </mesh>
      <mesh ref={leftArmRef} position={[0.8, 0.65, 0]} rotation={[0, 0, -0.6]}>
        <cylinderGeometry args={[0.12, 0.12, 0.8, 20]} />
        <meshStandardMaterial color="#a855f7" roughness={0.4} />
      </mesh>
      <mesh ref={rightArmRef} position={[-0.8, 0.65, 0]} rotation={[0, 0, 0.6]}>
        <cylinderGeometry args={[0.12, 0.12, 0.8, 20]} />
        <meshStandardMaterial color="#a855f7" roughness={0.4} />
      </mesh>
      <mesh position={[0.45, 0.1, 0]}>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshStandardMaterial color="#fde68a" emissive="#facc15" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[-0.45, 0.1, 0]}>
        <sphereGeometry args={[0.18, 24, 24]} />
        <meshStandardMaterial color="#fde68a" emissive="#facc15" emissiveIntensity={0.6} />
      </mesh>
      <mesh position={[0, -0.65, 0]}>
        <cylinderGeometry args={[0.9, 0.9, 0.2, 32]} />
        <meshStandardMaterial color="#4c1d95" roughness={0.3} />
      </mesh>
    </group>
  );
}

type CharacterSceneProps = {
  speaking: boolean;
  visible: boolean;
};

function CharacterScene({ speaking, visible }: CharacterSceneProps) {
  return (
    <div
      className={`relative h-80 w-full overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br from-violet-900/80 via-slate-900/90 to-indigo-900/80 shadow-2xl transition-all duration-700 ${
        visible ? "pointer-events-auto opacity-100 scale-100" : "pointer-events-none opacity-0 scale-95"
      }`}
    >
      <Canvas camera={{ position: [0, 1.6, 3.5], fov: 45 }}>
        <color attach="background" args={["#0f172a"]} />
        <hemisphereLight args={["#c4b5fd", "#312e81", 0.6]} />
        <pointLight position={[2, 4, 2]} intensity={1.4} color="#fcd34d" />
        <pointLight position={[-3, 2, -2]} intensity={0.8} color="#93c5fd" />
        <Stage environment="night" intensity={0.6} adjustCamera={false} shadows={false}>
          <CompanionCharacter speaking={speaking} />
        </Stage>
        <OrbitControls enablePan={false} enableZoom={false} maxPolarAngle={Math.PI / 2.1} minPolarAngle={Math.PI / 3} />
      </Canvas>
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-slate-900/90 to-transparent" />
    </div>
  );
}

export default memo(CharacterScene);

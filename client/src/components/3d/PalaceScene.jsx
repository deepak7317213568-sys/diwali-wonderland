import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

export const PalaceScene = ({ isEntering = false, onEntryComplete }) => {
  const palaceGroup = useRef();
  const particlesRef = useRef();
  const fireworksRef = useRef();
  const cameraTarget = useRef({ z: 12, y: 3 });

  // Floating golden magical particles
  const particleCount = 200;
  const { particlePositions, particleVelocities } = useMemo(() => {
    const pos = new Float32Array(particleCount * 3);
    const vel = [];
    for (let i = 0; i < particleCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 24;
      pos[i * 3 + 1] = Math.random() * 12;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 16;
      vel.push({
        y: 0.2 + Math.random() * 0.4,
        x: (Math.random() - 0.5) * 0.1,
        phase: Math.random() * Math.PI * 2,
      });
    }
    return { particlePositions: pos, particleVelocities: vel };
  }, []);

  // Night Stars
  const starCount = 300;
  const starPositions = useMemo(() => {
    const pos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 60;
      pos[i * 3 + 1] = 5 + Math.random() * 30;
      pos[i * 3 + 2] = -20 - Math.random() * 30;
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Gentle royal ambient sway
    if (palaceGroup.current && !isEntering) {
      palaceGroup.current.position.y = Math.sin(time * 0.4) * 0.1;
      palaceGroup.current.rotation.y = Math.sin(time * 0.2) * 0.02;
    }

    // Camera fly-in towards palace entrance if entering
    if (isEntering) {
      state.camera.position.z = THREE.MathUtils.lerp(state.camera.position.z, 2, delta * 2.2);
      state.camera.position.y = THREE.MathUtils.lerp(state.camera.position.y, 1.2, delta * 2);

      if (state.camera.position.z < 2.5 && onEntryComplete) {
        onEntryComplete();
      }
    } else {
      // Subtle natural breathing camera drift
      state.camera.position.x = Math.sin(time * 0.3) * 0.4;
      state.camera.position.y = 2.5 + Math.cos(time * 0.4) * 0.2;
    }

    // Animate golden particles
    if (particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array;
      for (let i = 0; i < particleCount; i++) {
        const v = particleVelocities[i];
        positions[i * 3 + 1] += v.y * delta;
        positions[i * 3] += Math.sin(time + v.phase) * delta * 0.2;

        if (positions[i * 3 + 1] > 14) {
          positions[i * 3 + 1] = 0;
          positions[i * 3] = (Math.random() - 0.5) * 24;
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  return (
    <>
      {/* Lighting: Royal midnight with warm golden glows */}
      <ambientLight intensity={0.35} color="#21103D" />
      <directionalLight
        position={[6, 12, 10]}
        intensity={0.8}
        color="#FFF0C2"
        castShadow
      />
      {/* Golden ground illumination */}
      <pointLight position={[0, 1.5, 3]} intensity={2.5} color="#FF9A24" distance={12} />
      <pointLight position={[-4, 2, -2]} intensity={2.0} color="#FFD36A" distance={8} />
      <pointLight position={[4, 2, -2]} intensity={2.0} color="#FFD36A" distance={8} />

      {/* Atmospheric Fog */}
      <fog attach="fog" args={['#090719', 8, 38]} />

      {/* Royal Indian Palace Architectural Structure */}
      <group ref={palaceGroup} position={[0, 0, -4]}>
        {/* Palace Grand Base / Courtyard Floor */}
        <mesh position={[0, -0.2, 2]} rotation={[-Math.PI / 2, 0, 0]} receiveShadow>
          <planeGeometry args={[40, 24]} />
          <meshStandardMaterial
            color="#140827"
            roughness={0.7}
            metalness={0.25}
          />
        </mesh>

        {/* Central Palace Facade */}
        <mesh position={[0, 3, -1]} castShadow receiveShadow>
          <boxGeometry args={[10, 6, 2.5]} />
          <meshStandardMaterial color="#21103D" roughness={0.4} metalness={0.3} />
        </mesh>

        {/* Central Indian Chhatri Dome (Royal Mughal/Rajput Architecture) */}
        <group position={[0, 6.2, -1]}>
          {/* Drum base */}
          <mesh position={[0, 0.4, 0]}>
            <cylinderGeometry args={[2.0, 2.2, 0.8, 32]} />
            <meshStandardMaterial color="#38153F" roughness={0.3} metalness={0.6} />
          </mesh>
          {/* Onion/Bell Dome */}
          <mesh position={[0, 1.8, 0]}>
            <sphereGeometry args={[2.0, 32, 32, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
            <meshStandardMaterial
              color="#FFD36A"
              roughness={0.25}
              metalness={0.8}
            />
          </mesh>
          {/* Royal Golden Spire (Kalash) */}
          <mesh position={[0, 3.4, 0]}>
            <coneGeometry args={[0.3, 1.4, 16]} />
            <meshStandardMaterial color="#FFF0C2" metalness={0.9} roughness={0.15} />
          </mesh>
        </group>

        {/* Flanking Minarets (Left & Right) */}
        {[-5.8, 5.8].map((xPos, idx) => (
          <group key={idx} position={[xPos, 0, -0.5]}>
            {/* Minaret Column */}
            <mesh position={[0, 3.5, 0]}>
              <cylinderGeometry args={[0.9, 1.1, 7, 16]} />
              <meshStandardMaterial color="#2A1448" roughness={0.5} metalness={0.25} />
            </mesh>
            {/* Minaret Balcony Jharokha */}
            <mesh position={[0, 7.2, 0]}>
              <cylinderGeometry args={[1.3, 1.0, 0.5, 16]} />
              <meshStandardMaterial color="#FFD36A" roughness={0.3} metalness={0.7} />
            </mesh>
            {/* Minaret Dome */}
            <mesh position={[0, 8.2, 0]}>
              <sphereGeometry args={[0.95, 16, 16, 0, Math.PI * 2, 0, Math.PI * 0.58]} />
              <meshStandardMaterial color="#FFD36A" roughness={0.2} metalness={0.8} />
            </mesh>
            {/* Finial */}
            <mesh position={[0, 9.2, 0]}>
              <coneGeometry args={[0.15, 0.8, 8]} />
              <meshStandardMaterial color="#FFF0C2" metalness={0.9} roughness={0.1} />
            </mesh>
          </group>
        ))}

        {/* Grand Archways (Jharokhas) with glowing golden interiors */}
        {[-3, 0, 3].map((xArch, i) => (
          <group key={i} position={[xArch, 1.8, 0.4]}>
            {/* Arch opening */}
            <mesh position={[0, 0, -0.05]}>
              <boxGeometry args={[1.8, 3.2, 0.3]} />
              <meshBasicMaterial color="#FFB03A" />
            </mesh>
            {/* Inner Window Glow */}
            <pointLight position={[0, 0.5, 0.5]} intensity={1.8} color="#FF9A24" distance={4} />
          </group>
        ))}

        {/* Front Palace Gates */}
        <group position={[0, 1.2, 0.5]}>
          <mesh position={[-0.8, 0, 0]}>
            <boxGeometry args={[1.2, 2.5, 0.15]} />
            <meshStandardMaterial color="#4A1028" metalness={0.7} roughness={0.3} />
          </mesh>
          <mesh position={[0.8, 0, 0]}>
            <boxGeometry args={[1.2, 2.5, 0.15]} />
            <meshStandardMaterial color="#4A1028" metalness={0.7} roughness={0.3} />
          </mesh>
        </group>
      </group>

      {/* Night Sky Stars */}
      <points>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={starCount}
            array={starPositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.14}
          color="#FFF9ED"
          transparent
          opacity={0.8}
        />
      </points>

      {/* Floating Golden Sparks / Light Orbs */}
      <points ref={particlesRef}>
        <bufferGeometry>
          <bufferAttribute
            attach="attributes-position"
            count={particleCount}
            array={particlePositions}
            itemSize={3}
          />
        </bufferGeometry>
        <pointsMaterial
          size={0.12}
          color="#FFD36A"
          transparent
          opacity={0.75}
          blending={THREE.AdditiveBlending}
        />
      </points>
    </>
  );
};

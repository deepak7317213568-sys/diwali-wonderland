import React, { useRef, useMemo } from 'react';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';
import { audioEngine } from '../../utils/audioSystem.js';

export const DiyaModel = ({
  position = [0, 0, 0],
  scale = 1,
  isLit = false,
  onLight,
  index = 0,
}) => {
  const flameRef = useRef();
  const flameLightRef = useRef();
  const particlesRef = useRef();
  const groupRef = useRef();

  // Create bowl profile using Vector2 for LatheGeometry
  const bowlGeo = useMemo(() => {
    const points = [];
    points.push(new THREE.Vector2(0, 0));
    points.push(new THREE.Vector2(0.5, 0.02));
    points.push(new THREE.Vector2(0.85, 0.15));
    points.push(new THREE.Vector2(1.0, 0.35));
    points.push(new THREE.Vector2(0.95, 0.45));
    points.push(new THREE.Vector2(0.85, 0.42));
    points.push(new THREE.Vector2(0.65, 0.25));
    points.push(new THREE.Vector2(0.2, 0.15));
    points.push(new THREE.Vector2(0, 0.15));
    return new THREE.LatheGeometry(points, 32);
  }, []);

  // Golden sparkles around the lit flame
  const sparklesCount = 20;
  const sparklePositions = useMemo(() => {
    const pos = new Float32Array(sparklesCount * 3);
    for (let i = 0; i < sparklesCount; i++) {
      pos[i * 3] = (Math.random() - 0.5) * 0.6;
      pos[i * 3 + 1] = 0.5 + Math.random() * 0.8;
      pos[i * 3 + 2] = (Math.random() - 0.5) * 0.6;
    }
    return pos;
  }, []);

  useFrame((state, delta) => {
    const time = state.clock.getElapsedTime();

    // Diya gentle floating or bobbing
    if (groupRef.current) {
      groupRef.current.rotation.y = Math.sin(time * 0.5 + index) * 0.05;
    }

    if (isLit && flameRef.current) {
      // Natural flame organic flicker
      const flicker1 = Math.sin(time * 16 + index * 2) * 0.08;
      const flicker2 = Math.cos(time * 22 + index * 3) * 0.05;
      flameRef.current.scale.set(
        1 + flicker2 * 0.5,
        1 + flicker1,
        1 + flicker2 * 0.5
      );
      flameRef.current.rotation.z = Math.sin(time * 8 + index) * 0.06;

      if (flameLightRef.current) {
        flameLightRef.current.intensity = 2.4 + Math.sin(time * 18 + index) * 0.4;
      }
    }

    // Sparkle particle drift
    if (isLit && particlesRef.current) {
      const positions = particlesRef.current.geometry.attributes.position.array;
      for (let i = 0; i < sparklesCount; i++) {
        positions[i * 3 + 1] += delta * 0.3;
        if (positions[i * 3 + 1] > 1.4) {
          positions[i * 3 + 1] = 0.5;
        }
      }
      particlesRef.current.geometry.attributes.position.needsUpdate = true;
    }
  });

  const handleClick = (e) => {
    e.stopPropagation();
    if (!isLit && onLight) {
      audioEngine.playDiyaIgnite();
      onLight(index);
    }
  };

  return (
    <group
      ref={groupRef}
      position={position}
      scale={scale}
      onClick={handleClick}
      onPointerOver={() => {
        document.body.style.cursor = isLit ? 'default' : 'pointer';
      }}
      onPointerOut={() => {
        document.body.style.cursor = 'default';
      }}
    >
      {/* Terracotta Clay Bowl */}
      <mesh geometry={bowlGeo} castShadow receiveShadow>
        <meshStandardMaterial
          color="#8A3319"
          roughness={0.6}
          metalness={0.15}
        />
      </mesh>

      {/* Decorative Golden Rim */}
      <mesh position={[0, 0.44, 0]} rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[0.96, 0.04, 16, 32]} />
        <meshStandardMaterial
          color="#FFD36A"
          roughness={0.2}
          metalness={0.85}
        />
      </mesh>

      {/* Sacred Mustard / Sesame Oil Surface */}
      <mesh position={[0, 0.28, 0]} rotation={[-Math.PI / 2, 0, 0]}>
        <circleGeometry args={[0.72, 32]} />
        <meshStandardMaterial
          color="#7A5210"
          roughness={0.1}
          metalness={0.6}
          transparent
          opacity={0.9}
        />
      </mesh>

      {/* Cotton Baati (Wick) */}
      <mesh position={[0.2, 0.32, 0]} rotation={[0, 0, -Math.PI / 6]}>
        <cylinderGeometry args={[0.03, 0.04, 0.25, 8]} />
        <meshStandardMaterial color={isLit ? '#FF8A24' : '#221510'} roughness={0.9} />
      </mesh>

      {/* Interactive Lit Flame & Glow */}
      {isLit && (
        <group position={[0.28, 0.48, 0]}>
          {/* Inner Golden Flame */}
          <group ref={flameRef}>
            <mesh position={[0, 0.2, 0]}>
              <coneGeometry args={[0.12, 0.45, 16]} />
              <meshBasicMaterial color="#FFF0C2" />
            </mesh>

            {/* Outer Translucent Orange Fire Shield */}
            <mesh position={[0, 0.2, 0]}>
              <coneGeometry args={[0.22, 0.55, 16]} />
              <meshBasicMaterial
                color="#FF8A24"
                transparent
                opacity={0.75}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          </group>

          {/* Warm Point Light illuminating the scene */}
          <pointLight
            ref={flameLightRef}
            color="#FF9E3B"
            intensity={2.8}
            distance={5.5}
            decay={2}
          />

          {/* Floating Sparkles */}
          <points ref={particlesRef}>
            <bufferGeometry>
              <bufferAttribute
                attach="attributes-position"
                count={sparklesCount}
                array={sparklePositions}
                itemSize={3}
              />
            </bufferGeometry>
            <pointsMaterial
              size={0.07}
              color="#FFD36A"
              transparent
              opacity={0.85}
              blending={THREE.AdditiveBlending}
            />
          </points>
        </group>
      )}

      {/* Subtle dormant indicator if unlit */}
      {!isLit && (
        <mesh position={[0.25, 0.35, 0]}>
          <sphereGeometry args={[0.05, 8, 8]} />
          <meshBasicMaterial
            color="#FFD36A"
            transparent
            opacity={0.4}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      )}
    </group>
  );
};

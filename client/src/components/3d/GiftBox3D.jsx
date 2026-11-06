import React, { useRef, useEffect } from 'react';
import { useFrame } from '@react-three/fiber';
import gsap from 'gsap';
import * as THREE from 'three';
import { audioEngine } from '../../utils/audioSystem.js';

export const GiftBox3D = ({ isOpen, onOpened }) => {
  const boxGroupRef = useRef();
  const lidGroupRef = useRef();
  const ribbonGroupRef = useRef();
  const cardGroupRef = useRef();
  const interiorLightRef = useRef();
  const particlesRef = useRef();

  // Burst particles
  const particleCount = 80;
  const particlePositions = useRef(
    new Float32Array(particleCount * 3).map(() => (Math.random() - 0.5) * 1.5)
  );

  // Animate opening with GSAP
  useEffect(() => {
    if (isOpen) {
      audioEngine.playGiftOpen();

      const tl = gsap.timeline({
        onComplete: () => {
          if (onOpened) onOpened();
        },
      });

      // 1. Ribbon unties and dissolves
      if (ribbonGroupRef.current) {
        tl.to(ribbonGroupRef.current.scale, {
          x: 1.2,
          y: 0.1,
          z: 1.2,
          duration: 0.6,
          ease: 'power2.out',
        });
        tl.to(
          ribbonGroupRef.current.position,
          {
            y: -0.8,
            duration: 0.5,
            ease: 'power2.in',
          },
          '<'
        );
      }

      // 2. Lid lifts and opens back gracefully
      if (lidGroupRef.current) {
        tl.to(
          lidGroupRef.current.position,
          {
            y: 2.2,
            z: -1.2,
            duration: 1.1,
            ease: 'back.out(1.4)',
          },
          '-=0.3'
        );
        tl.to(
          lidGroupRef.current.rotation,
          {
            x: -Math.PI * 0.45,
            duration: 1.1,
            ease: 'power2.out',
          },
          '<'
        );
      }

      // 3. Interior bright golden light flares
      if (interiorLightRef.current) {
        tl.to(
          interiorLightRef.current,
          {
            intensity: 8,
            distance: 8,
            duration: 0.8,
            ease: 'power2.out',
          },
          '-=0.7'
        );
      }

      // 4. Floating surprise card emerges and ascends
      if (cardGroupRef.current) {
        tl.to(
          cardGroupRef.current.position,
          {
            y: 2.2,
            z: 0.5,
            duration: 1.3,
            ease: 'expo.out',
          },
          '-=0.6'
        );
        tl.to(
          cardGroupRef.current.rotation,
          {
            y: Math.PI * 2,
            duration: 1.5,
            ease: 'power1.out',
          },
          '<'
        );
      }
    } else {
      // Reset position if replaying
      if (ribbonGroupRef.current) {
        gsap.set(ribbonGroupRef.current.scale, { x: 1, y: 1, z: 1 });
        gsap.set(ribbonGroupRef.current.position, { y: 0 });
      }
      if (lidGroupRef.current) {
        gsap.set(lidGroupRef.current.position, { y: 0.95, z: 0 });
        gsap.set(lidGroupRef.current.rotation, { x: 0 });
      }
      if (cardGroupRef.current) {
        gsap.set(cardGroupRef.current.position, { y: 0.2, z: 0 });
        gsap.set(cardGroupRef.current.rotation, { y: 0 });
      }
      if (interiorLightRef.current) {
        gsap.set(interiorLightRef.current, { intensity: 0 });
      }
    }
  }, [isOpen, onOpened]);

  // Gentle floating idle animation
  useFrame((state) => {
    const time = state.clock.getElapsedTime();
    if (boxGroupRef.current && !isOpen) {
      boxGroupRef.current.position.y = Math.sin(time * 1.5) * 0.08;
      boxGroupRef.current.rotation.y = Math.sin(time * 0.8) * 0.1;
    }
    if (cardGroupRef.current && isOpen) {
      cardGroupRef.current.position.y = 2.2 + Math.sin(time * 2) * 0.08;
    }
  });

  return (
    <group position={[0, -0.6, 0]}>
      {/* Lighting for the gift box */}
      <ambientLight intensity={0.6} color="#FFF0C2" />
      <directionalLight position={[4, 8, 5]} intensity={1.5} color="#FFD36A" castShadow />
      <directionalLight position={[-4, 3, -3]} intensity={0.8} color="#FF8A24" />
      <spotLight
        position={[0, 6, 2]}
        intensity={2.5}
        color="#FFF9ED"
        angle={0.6}
        penumbra={0.5}
        castShadow
      />

      <group ref={boxGroupRef}>
        {/* ================= GOLD BOX BASE ================= */}
        <mesh position={[0, 0, 0]} castShadow receiveShadow>
          <boxGeometry args={[2.2, 1.8, 2.2]} />
          <meshStandardMaterial
            color="#FFD36A"
            metalness={0.88}
            roughness={0.22}
          />
        </mesh>

        {/* Ornate Gold Trim on Base */}
        <mesh position={[0, -0.85, 0]}>
          <boxGeometry args={[2.28, 0.12, 2.28]} />
          <meshStandardMaterial color="#FFF0C2" metalness={0.9} roughness={0.15} />
        </mesh>

        {/* ================= INTERIOR LIGHT ================= */}
        <pointLight
          ref={interiorLightRef}
          color="#FFF0C2"
          intensity={0}
          distance={6}
          position={[0, 0.4, 0]}
        />

        {/* ================= RED VELVET RIBBON ================= */}
        <group ref={ribbonGroupRef}>
          {/* Vertical Ribbon 1 (X) */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[0.38, 1.82, 2.24]} />
            <meshStandardMaterial
              color="#A3112E"
              roughness={0.35}
              metalness={0.2}
            />
          </mesh>
          {/* Vertical Ribbon 2 (Z) */}
          <mesh position={[0, 0, 0]}>
            <boxGeometry args={[2.24, 1.82, 0.38]} />
            <meshStandardMaterial
              color="#A3112E"
              roughness={0.35}
              metalness={0.2}
            />
          </mesh>
        </group>

        {/* ================= 3D GOLD LID ================= */}
        <group ref={lidGroupRef} position={[0, 0.95, 0]}>
          {/* Box Lid Mesh */}
          <mesh castShadow receiveShadow>
            <boxGeometry args={[2.34, 0.35, 2.34]} />
            <meshStandardMaterial
              color="#FFD36A"
              metalness={0.88}
              roughness={0.2}
            />
          </mesh>

          {/* Lid Ribbon Cross */}
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[0.38, 0.37, 2.36]} />
            <meshStandardMaterial color="#A3112E" roughness={0.35} metalness={0.2} />
          </mesh>
          <mesh position={[0, 0.02, 0]}>
            <boxGeometry args={[2.36, 0.37, 0.38]} />
            <meshStandardMaterial color="#A3112E" roughness={0.35} metalness={0.2} />
          </mesh>

          {/* Royal Golden Bow on top */}
          <group position={[0, 0.3, 0]}>
            <mesh rotation={[0, 0, Math.PI / 4]} position={[-0.2, 0.15, 0]}>
              <torusGeometry args={[0.26, 0.08, 16, 32]} />
              <meshStandardMaterial color="#FFD36A" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh rotation={[0, 0, -Math.PI / 4]} position={[0.2, 0.15, 0]}>
              <torusGeometry args={[0.26, 0.08, 16, 32]} />
              <meshStandardMaterial color="#FFD36A" metalness={0.9} roughness={0.2} />
            </mesh>
            <mesh position={[0, 0.1, 0]}>
              <sphereGeometry args={[0.15, 16, 16]} />
              <meshStandardMaterial color="#FFF0C2" metalness={0.92} roughness={0.1} />
            </mesh>
          </group>
        </group>

        {/* ================= 3D SURPRISE GREETING CARD ================= */}
        <group ref={cardGroupRef} position={[0, 0.2, 0]}>
          {/* Golden Floating Card Mesh */}
          <mesh castShadow>
            <boxGeometry args={[1.6, 2.2, 0.05]} />
            <meshStandardMaterial
              color="#21103D"
              roughness={0.25}
              metalness={0.65}
            />
          </mesh>

          {/* Golden Card Border */}
          <mesh position={[0, 0, 0.03]}>
            <planeGeometry args={[1.5, 2.1]} />
            <meshBasicMaterial color="#FFD36A" wireframe={false} />
          </mesh>

          {/* Card Diya Emblem in 3D */}
          <mesh position={[0, 0.45, 0.05]}>
            <circleGeometry args={[0.28, 32]} />
            <meshBasicMaterial color="#FF8A24" />
          </mesh>
        </group>
      </group>
    </group>
  );
};

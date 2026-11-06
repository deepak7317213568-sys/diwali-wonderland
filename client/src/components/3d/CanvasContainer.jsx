import React, { Suspense, useState, useEffect } from 'react';
import { Canvas } from '@react-three/fiber';

export const CanvasContainer = ({
  children,
  camera = { position: [0, 2, 7], fov: 50 },
  className = '',
  fallback = null,
}) => {
  const [hasWebGL, setHasWebGL] = useState(true);

  useEffect(() => {
    try {
      const canvas = document.createElement('canvas');
      const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
      if (!gl) {
        setHasWebGL(false);
      }
    } catch (e) {
      setHasWebGL(false);
    }
  }, []);

  if (!hasWebGL) {
    return (
      <div className={`w-full h-full flex items-center justify-center bg-[#090719] p-6 text-center ${className}`}>
        {fallback || (
          <div className="glass-panel p-6 max-w-md">
            <span className="text-4xl mb-3 block">🪔</span>
            <h3 className="font-cinzel text-lg font-bold text-[#FFD36A] mb-2">
              Royal Diwali Experience
            </h3>
            <p className="text-sm font-outfit text-[#FFF9ED]/80">
              Interactive 3D acceleration is enjoying a restful pause on your device, but all Diwali magic, tasks, surprises, and cards remain fully available!
            </p>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`relative w-full h-full ${className}`}>
      <Canvas
        camera={camera}
        dpr={[1, 2]} // adaptive pixel ratio for performance
        gl={{
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
        }}
        onCreated={({ gl }) => {
          gl.setClearColor('#090719', 0);
        }}
      >
        <Suspense fallback={null}>
          {children}
        </Suspense>
      </Canvas>
    </div>
  );
};

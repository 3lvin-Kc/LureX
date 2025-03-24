
import React, { useRef } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { useGLTF, OrbitControls, Environment, Float, Sparkles } from '@react-three/drei';
import * as THREE from 'three';

// Animated cube component
const AnimatedCube = ({ position, color, speed = 1, size = 0.5 }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * speed * 0.2) * 0.2;
      meshRef.current.rotation.y = Math.sin(state.clock.getElapsedTime() * speed * 0.3) * 0.3;
      meshRef.current.position.y = Math.sin(state.clock.getElapsedTime() * speed * 0.5) * 0.1 + position[1];
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <boxGeometry args={[size, size, size]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.8} />
    </mesh>
  );
};

// Animated sphere component
const AnimatedSphere = ({ position, color, speed = 1, size = 0.3 }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.position.y = Math.sin(state.clock.getElapsedTime() * speed * 0.5) * 0.2 + position[1];
      meshRef.current.rotation.x = state.clock.getElapsedTime() * speed * 0.2;
      meshRef.current.rotation.z = state.clock.getElapsedTime() * speed * 0.2;
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <sphereGeometry args={[size, 32, 32]} />
      <meshStandardMaterial color={color} roughness={0.2} metalness={0.8} />
    </mesh>
  );
};

// Animated torus component
const AnimatedTorus = ({ position, color, speed = 1, size = 0.2 }) => {
  const meshRef = useRef<THREE.Mesh>(null!);
  
  useFrame((state) => {
    if (meshRef.current) {
      meshRef.current.rotation.x = state.clock.getElapsedTime() * speed * 0.3;
      meshRef.current.rotation.y = state.clock.getElapsedTime() * speed * 0.2;
      meshRef.current.position.y = Math.sin(state.clock.getElapsedTime() * speed * 0.5) * 0.1 + position[1];
    }
  });

  return (
    <mesh ref={meshRef} position={position}>
      <torusGeometry args={[size, size/3, 16, 100]} />
      <meshStandardMaterial color={color} roughness={0.3} metalness={0.7} />
    </mesh>
  );
};

// Background scene with floating objects
const BackgroundScene = () => {
  const colors = [
    '#4285F4', // blue
    '#0F9D58', // green
    '#F4B400', // yellow
    '#DB4437', // red
    '#4285F4', // blue
    '#0F9D58', // green
  ];

  return (
    <>
      <ambientLight intensity={0.5} />
      <directionalLight position={[10, 10, 5]} intensity={1} />
      <directionalLight position={[-10, -10, -5]} intensity={0.5} color="#ffffff" />
      
      <Sparkles 
        count={100}
        scale={10}
        size={2}
        speed={0.3}
        opacity={0.5}
        color="#8B5CF6"
      />
      
      {/* Create multiple floating objects with different colors and positions */}
      {colors.map((color, i) => (
        <React.Fragment key={i}>
          <Float speed={i % 2 === 0 ? 2 : 3} rotationIntensity={0.5} floatIntensity={0.5}>
            <AnimatedCube 
              position={[
                (Math.random() - 0.5) * 8, 
                (Math.random() - 0.5) * 5, 
                (Math.random() - 5) * 2
              ]} 
              color={color} 
              speed={0.5 + Math.random() * 0.5}
              size={0.2 + Math.random() * 0.4}
            />
          </Float>
          
          <Float speed={i % 2 === 0 ? 3 : 2} rotationIntensity={0.6} floatIntensity={0.4}>
            <AnimatedSphere 
              position={[
                (Math.random() - 0.5) * 8, 
                (Math.random() - 0.5) * 5, 
                (Math.random() - 5) * 2
              ]} 
              color={color} 
              speed={0.5 + Math.random() * 0.5}
              size={0.15 + Math.random() * 0.2}
            />
          </Float>
          
          <Float speed={i % 2 === 0 ? 4 : 2} rotationIntensity={0.7} floatIntensity={0.6}>
            <AnimatedTorus 
              position={[
                (Math.random() - 0.5) * 8, 
                (Math.random() - 0.5) * 5, 
                (Math.random() - 5) * 2
              ]} 
              color={color} 
              speed={0.5 + Math.random() * 0.5}
              size={0.2 + Math.random() * 0.3}
            />
          </Float>
        </React.Fragment>
      ))}
    </>
  );
};

interface AnimatedBackgroundProps {
  className?: string;
}

const AnimatedBackground: React.FC<AnimatedBackgroundProps> = ({ className }) => {
  return (
    <div className={`fixed top-0 left-0 w-full h-full -z-10 ${className}`}>
      <Canvas 
        camera={{ position: [0, 0, 5], fov: 75 }}
        dpr={[1, 2]} // Optimize for performance by limiting pixel ratio
        gl={{ 
          antialias: true,
          alpha: true,
          powerPreference: 'high-performance',
          stencil: false,
          depth: false,
        }}
      >
        <color attach="background" args={['#030014']} />
        <fog attach="fog" args={['#030014', 5, 20]} />
        <BackgroundScene />
        <Environment preset="city" />
      </Canvas>
    </div>
  );
};

export default AnimatedBackground;

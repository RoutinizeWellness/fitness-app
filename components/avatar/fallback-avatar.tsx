"use client"

import React, { useRef } from 'react'
import { useFrame } from '@react-three/fiber'
import * as THREE from 'three'

interface FallbackAvatarProps {
  scale?: number;
  color?: string;
  animation?: string;
  onAnimationComplete?: () => void;
}

export function FallbackAvatar({
  scale = 1.5,
  color = '#1B237E',
  animation = 'idle',
  onAnimationComplete
}: FallbackAvatarProps) {
  const meshRef = useRef<THREE.Mesh>(null)
  
  // Simple animation based on the animation prop
  useFrame((_, delta) => {
    if (!meshRef.current) return
    
    if (animation === 'idle') {
      // Gentle floating animation
      meshRef.current.position.y = Math.sin(Date.now() * 0.001) * 0.1
      meshRef.current.rotation.y += delta * 0.2
    } else if (animation === 'greeting') {
      // Greeting animation - rotate and bounce
      meshRef.current.rotation.y += delta * 0.5
      meshRef.current.position.y = Math.sin(Date.now() * 0.003) * 0.2
      
      // Call animation complete after 3 seconds
      if (onAnimationComplete && Date.now() % 3000 < 16) {
        onAnimationComplete()
      }
    } else if (animation === 'demonstrating') {
      // Demonstrating animation - more active movement
      meshRef.current.rotation.x = Math.sin(Date.now() * 0.002) * 0.2
      meshRef.current.rotation.y += delta * 0.3
      meshRef.current.rotation.z = Math.cos(Date.now() * 0.002) * 0.1
      
      // Call animation complete after 5 seconds
      if (onAnimationComplete && Date.now() % 5000 < 16) {
        onAnimationComplete()
      }
    } else if (animation === 'celebrating') {
      // Celebrating animation - spin and jump
      meshRef.current.rotation.y += delta * 1.5
      meshRef.current.position.y = Math.abs(Math.sin(Date.now() * 0.004)) * 0.3
      
      // Call animation complete after 4 seconds
      if (onAnimationComplete && Date.now() % 4000 < 16) {
        onAnimationComplete()
      }
    } else if (animation === 'guiding') {
      // Guiding animation - gentle movement
      meshRef.current.rotation.y += delta * 0.3
      meshRef.current.rotation.z = Math.sin(Date.now() * 0.001) * 0.1
      
      // Call animation complete after 4 seconds
      if (onAnimationComplete && Date.now() % 4000 < 16) {
        onAnimationComplete()
      }
    }
  })
  
  return (
    <group scale={[scale, scale, scale]}>
      {/* Body */}
      <mesh ref={meshRef} position={[0, 0, 0]}>
        <boxGeometry args={[0.5, 1, 0.3]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Head */}
      <mesh position={[0, 0.7, 0]}>
        <sphereGeometry args={[0.25, 16, 16]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Arms */}
      <mesh position={[-0.4, 0, 0]}>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.4, 0, 0]}>
        <boxGeometry args={[0.2, 0.8, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      
      {/* Legs */}
      <mesh position={[-0.2, -0.7, 0]}>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
      <mesh position={[0.2, -0.7, 0]}>
        <boxGeometry args={[0.2, 0.6, 0.2]} />
        <meshStandardMaterial color={color} />
      </mesh>
    </group>
  )
}

import React, { useCallback } from 'react';
import Particles from 'react-tsparticles';
import { loadSlim } from '@tsparticles/slim';
import type { Engine } from '@tsparticles/engine';
interface ParticleBackgroundProps {
  className?: string;
}
export function ParticleBackground({
  className
}: ParticleBackgroundProps) {
  const particlesInit = useCallback(async (engine: Engine) => {
    await loadSlim(engine);
  }, []);
  return <Particles className={`absolute inset-0 ${className || ''}`} init={particlesInit} options={{
    background: {
      color: {
        value: 'transparent'
      }
    },
    fpsLimit: 60,
    particles: {
      color: {
        value: '#00BFFF'
      },
      links: {
        color: '#00BFFF',
        distance: 150,
        enable: true,
        opacity: 0.3,
        width: 1
      },
      move: {
        direction: 'none',
        enable: true,
        outModes: {
          default: 'bounce'
        },
        random: false,
        speed: 0.8,
        straight: false
      },
      number: {
        density: {
          enable: true,
          area: 800
        },
        value: 60
      },
      opacity: {
        value: 0.5
      },
      shape: {
        type: 'circle'
      },
      size: {
        value: {
          min: 1,
          max: 3
        }
      }
    },
    detectRetina: true
  }} />;
}
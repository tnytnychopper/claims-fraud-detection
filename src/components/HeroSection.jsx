import React, { useCallback } from 'react';
import Particles from 'react-tsparticles';
import { loadSlim } from 'tsparticles-slim';
import { FiArrowDown } from "react-icons/fi"; 

const HeroSection = () => {
  const particlesInit = useCallback(async (engine) => {
    await loadSlim(engine);
  }, []);

  const particleOptions = {
    background: {
      color: {
        value: '#0F112B',
      },
    },
    fpsLimit: 120,
    interactivity: {
      events: {
        onHover: {
          enable: true,
          mode: 'repulse',
        },
      },
      modes: {
        repulse: {
          distance: 100,
          duration: 0.4,
        },
      },
    },
    particles: {
      color: {
        value: '#ffffffff',
        opacity: 0.7,
       // Blue color for particles
      },
      links: {
        color: '#4e4c4c',
        distance: 150,
        enable: true,
        opacity: 0.4,
        width: 2,
      },
      move: {
        direction: 'none',
        enable: true,
        outModes: {
          default: 'bounce',
        },
        random: false,
        speed: 1,
        straight: false,
      },
      number: {
        density: {
          enable: true,
        },
        value: 80,
      },
      opacity: {
        value: 0.2,
      },
      shape: {
        type: 'circle',
      },
      size: {
        value: { min: 1, max: 5 },
      },
    },
    detectRetina: true,
  };

  return (
    <section className="relative h-screen flex flex-col items-center justify-center text-center">
      <Particles
        id="tsparticles"
        init={particlesInit}
        options={particleOptions}
        className="absolute top-0 left-0 w-full h-full z-0"
      />
      
    </section>
  );
};

export default HeroSection;
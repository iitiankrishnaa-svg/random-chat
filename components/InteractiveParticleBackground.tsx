'use client';

import { useEffect, useRef } from 'react';

interface Particle {
  x: number;
  y: number;
  baseX: number;
  baseY: number;
  vx: number;
  vy: number;
  size: number;
  colorR: number;
  colorG: number;
  colorB: number;
}

export default function InteractiveParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d', { alpha: true });
    if (!ctx) return;

    let animationFrameId: number;
    let width = 0;
    let height = 0;

    const mouse = {
      x: -9999,
      y: -9999,
      speed: 0,
    };

    let particles: Particle[] = [];

    const initParticles = () => {
      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      width = window.innerWidth;
      height = window.innerHeight;

      canvas.width = width * dpr;
      canvas.height = height * dpr;
      canvas.style.width = width + 'px';
      canvas.style.height = height + 'px';

      ctx.scale(dpr, dpr);

      particles = [];

      // Grid spacing adjusted for screen density (responsive)
      const spacing = width < 768 ? 34 : 26;
      const cols = Math.ceil(width / spacing) + 1;
      const rows = Math.ceil(height / spacing) + 1;

      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * spacing + (j % 2 === 0 ? 0 : spacing * 0.5);
          const y = j * spacing;

          // Subtle theme palette variation (indigo / cyan / soft white)
          const isCyan = (i + j) % 6 === 0;
          const isIndigo = (i * 2 + j) % 7 === 0;

          particles.push({
            x,
            y,
            baseX: x,
            baseY: y,
            vx: 0,
            vy: 0,
            size: Math.random() * 0.5 + 1.2,
            colorR: isCyan ? 6 : isIndigo ? 99 : 240,
            colorG: isCyan ? 182 : isIndigo ? 102 : 245,
            colorB: isCyan ? 212 : isIndigo ? 241 : 255,
          });
        }
      }
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      let clientX = 0;
      let clientY = 0;

      if ('touches' in e && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ('clientX' in e) {
        clientX = e.clientX;
        clientY = e.clientY;
      }

      if (mouse.x !== -9999) {
        const dx = clientX - mouse.x;
        const dy = clientY - mouse.y;
        mouse.speed = Math.min(Math.hypot(dx, dy), 40);
      }

      mouse.x = clientX;
      mouse.y = clientY;
    };

    const handlePointerLeave = () => {
      mouse.x = -9999;
      mouse.y = -9999;
      mouse.speed = 0;
    };

    window.addEventListener('mousemove', handlePointerMove, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('mouseleave', handlePointerLeave, { passive: true });
    window.addEventListener('touchend', handlePointerLeave, { passive: true });

    let resizeTimer: any;
    const handleResize = () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(initParticles, 150);
    };
    window.addEventListener('resize', handleResize);

    initParticles();

    // Realistic physics parameters
    const SPRING = 0.055; // Natural elastic pull toward home anchor
    const FRICTION = 0.86; // Fluid air damping
    const BASE_RADIUS = 135; // Hover influence radius in pixels

    let lastTime = performance.now();

    const animate = (time: number) => {
      animationFrameId = requestAnimationFrame(animate);

      // Delta time normalization
      const dt = Math.min((time - lastTime) / 16.66, 2);
      lastTime = time;

      ctx.clearRect(0, 0, width, height);

      const dynamicRadius = BASE_RADIUS + Math.min(mouse.speed * 1.5, 45);
      mouse.speed *= 0.92;

      for (let i = 0; i < particles.length; i++) {
        const p = particles[i];

        // 1. Mouse hover scattering physics
        if (mouse.x !== -9999) {
          const dx = p.x - mouse.x;
          const dy = p.y - mouse.y;
          const dist = Math.hypot(dx, dy);

          if (dist < dynamicRadius && dist > 0.001) {
            // Repulsive force quadratic falloff
            const normalDist = dist / dynamicRadius;
            const force = (1 - normalDist) * (1 - normalDist) * 16 * dt;
            const angle = Math.atan2(dy, dx);

            p.vx += Math.cos(angle) * force;
            p.vy += Math.sin(angle) * force;
          }
        }

        // 2. Harmonic spring restoring force returning to home position
        const returnDx = p.baseX - p.x;
        const returnDy = p.baseY - p.y;

        p.vx += returnDx * SPRING * dt;
        p.vy += returnDy * SPRING * dt;

        // 3. Fluid friction damping
        p.vx *= Math.pow(FRICTION, dt);
        p.vy *= Math.pow(FRICTION, dt);

        p.x += p.vx * dt;
        p.y += p.vy * dt;

        // 4. Kinetic displacement for dynamic glow
        const displacement = Math.hypot(p.x - p.baseX, p.y - p.baseY);
        const activity = Math.min(displacement / 24, 1);

        // Alpha calculation: ambient resting dots vs excited glowing dots
        const baseAlpha = 0.18;
        const alpha = baseAlpha + activity * 0.72;
        const renderSize = p.size + activity * 1.4;

        ctx.beginPath();
        ctx.arc(p.x, p.y, renderSize, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(${p.colorR}, ${p.colorG}, ${p.colorB}, ${alpha.toFixed(3)})`;
        ctx.fill();

        // Subtle glowing halo on scattered dots
        if (activity > 0.2) {
          ctx.beginPath();
          ctx.arc(p.x, p.y, renderSize * 2.8, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(${p.colorR}, ${p.colorG}, ${p.colorB}, ${(activity * 0.16).toFixed(3)})`;
          ctx.fill();
        }
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('mouseleave', handlePointerLeave);
      window.removeEventListener('touchend', handlePointerLeave);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="pointer-events-none fixed inset-0 z-0 h-full w-full select-none"
      aria-hidden="true"
    />
  );
}

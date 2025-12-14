
import React, { useEffect, useRef } from 'react';
import { AppSettings } from '../types';

interface BackgroundEffectsProps {
  settings: AppSettings;
  isDarkMode: boolean;
}

const BackgroundEffects: React.FC<BackgroundEffectsProps> = ({ settings, isDarkMode }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let particles: any[] = [];
    let time = 0;

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resizeCanvas);
    resizeCanvas();

    // Initialization logic based on effect type
    const init = () => {
      particles = [];
      const w = canvas.width;
      const h = canvas.height;
      const count = settings.effectDensity || 60;

      // Common Particle Init
      for (let i = 0; i < count; i++) {
        particles.push({
          x: Math.random() * w,
          y: Math.random() * h,
          z: Math.random() * w,
          vx: (Math.random() - 0.5) * settings.effectSpeed,
          vy: (Math.random() - 0.5) * settings.effectSpeed,
          size: Math.random() * 2 + 1,
          color: 'white' // Placeholder, set in draw
        });
      }
    };

    init();

    const draw = () => {
      time += 0.01 * settings.effectSpeed;
      
      // Clear
      if (settings.effectType === 'ai_matrix' || settings.effectType === 'matrix') {
          ctx.fillStyle = 'rgba(0, 0, 0, 0.05)';
      } else {
          ctx.clearRect(0, 0, canvas.width, canvas.height);
          ctx.fillStyle = 'transparent';
      }
      if (settings.effectType.includes('matrix')) ctx.fillRect(0, 0, canvas.width, canvas.height);

      const w = canvas.width;
      const h = canvas.height;

      // --- LOGIC SWITCH ---
      
      if (settings.effectType === 'stars' || settings.effectType === 'galactic_core') {
          ctx.fillStyle = 'white';
          particles.forEach(p => {
              p.z -= 2 * settings.effectSpeed;
              if (p.z <= 0) { p.z = w; p.x = Math.random() * w; p.y = Math.random() * h; }
              const k = 128.0 / p.z;
              const px = (p.x - w/2) * k + w/2;
              const py = (p.y - h/2) * k + h/2;
              if (px >= 0 && px <= w && py >= 0 && py <= h) {
                  const size = (1 - p.z / w) * (settings.effectType === 'galactic_core' ? 4 : 2);
                  const alpha = 1 - p.z / w;
                  ctx.globalAlpha = alpha;
                  ctx.fillStyle = settings.effectType === 'galactic_core' ? `hsl(${260 + p.z/10}, 80%, 60%)` : 'white';
                  ctx.beginPath();
                  ctx.arc(px, py, size, 0, Math.PI * 2);
                  ctx.fill();
              }
          });
      }
      else if (settings.effectType === 'cosmic_ocean') {
          ctx.globalAlpha = 0.3;
          for(let i=0; i<w; i+=20) {
              for(let j=0; j<h; j+=50) {
                  const y = j + Math.sin(i * 0.01 + time) * 20 + Math.cos(j * 0.02 + time) * 20;
                  ctx.fillStyle = `hsl(${200 + j/10}, 70%, 50%)`;
                  ctx.beginPath();
                  ctx.arc(i, y, 2, 0, Math.PI*2);
                  ctx.fill();
              }
          }
      }
      else if (settings.effectType === 'digital_forest') {
          ctx.lineWidth = 2;
          for(let i=0; i<particles.length; i++) {
              const p = particles[i];
              p.y -= p.size * 0.5;
              if (p.y < 0) p.y = h;
              const color = `hsl(${120 + p.x/w * 60}, 80%, ${50 + Math.sin(time)*20}%)`;
              ctx.strokeStyle = color;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y);
              ctx.lineTo(p.x, p.y + 20);
              ctx.stroke();
          }
      }
      else if (settings.effectType === 'neon_city') {
          // Perspective Grid
          ctx.strokeStyle = '#ff0080';
          ctx.lineWidth = 1;
          ctx.beginPath();
          // Horizontal moving lines
          const offset = (time * 100) % 100;
          for(let y=h/2; y<h; y+=20 + (y-h/2)) {
              const yPos = y + offset;
              if (yPos > h) continue;
              ctx.moveTo(0, yPos);
              ctx.lineTo(w, yPos);
          }
          // Vertical perspective lines
          for(let x=-w; x<w*2; x+=100) {
              ctx.moveTo(x + (x-w/2)*(h/2)/100, h);
              ctx.lineTo(w/2, h/2);
          }
          ctx.stroke();
      }
      else if (settings.effectType === 'ai_matrix') {
          ctx.fillStyle = '#0F0';
          ctx.font = '15px monospace';
          particles.forEach((p, i) => {
              const char = String.fromCharCode(0x30A0 + Math.random() * 96);
              const x = (i * 20) % w;
              const y = (p.y + 10) % h;
              p.y = y;
              ctx.fillText(char, x, y);
              if(Math.random() > 0.98) p.y = 0;
          });
      }
      else if (settings.effectType === 'sunset_dunes') {
          for(let i=0; i<5; i++) {
              ctx.fillStyle = `rgba(255, ${100 + i*30}, 100, 0.2)`;
              ctx.beginPath();
              ctx.moveTo(0, h);
              for(let x=0; x<=w; x+=10) {
                  const y = h/2 + i*50 + Math.sin(x*0.005 + time + i) * 50;
                  ctx.lineTo(x, y);
              }
              ctx.lineTo(w, h);
              ctx.fill();
          }
      }
      else if (settings.effectType === 'crystal_cave') {
          particles.forEach(p => {
              p.x += Math.sin(time + p.y) * 0.5;
              p.y += Math.cos(time + p.x) * 0.5;
              ctx.fillStyle = `rgba(150, 255, 255, ${Math.random()})`;
              ctx.beginPath();
              ctx.moveTo(p.x, p.y - p.size*2);
              ctx.lineTo(p.x + p.size, p.y);
              ctx.lineTo(p.x, p.y + p.size*2);
              ctx.lineTo(p.x - p.size, p.y);
              ctx.fill();
          });
      }
      else {
          // Default gentle particles (Clouds, Leaves, etc.)
          particles.forEach(p => {
              p.y += p.vy;
              p.x += p.vx;
              if (p.y > h) p.y = 0;
              if (p.x > w) p.x = 0;
              if (p.x < 0) p.x = w;
              
              ctx.fillStyle = settings.effectType === 'leaves' ? '#4ade80' : 'white';
              ctx.globalAlpha = 0.5;
              ctx.beginPath();
              ctx.arc(p.x, p.y, p.size, 0, Math.PI*2);
              ctx.fill();
          });
      }

      ctx.globalAlpha = 1;
      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', resizeCanvas);
      cancelAnimationFrame(animationFrameId);
    };
  }, [settings, isDarkMode]);

  return (
    <canvas 
      ref={canvasRef} 
      className="fixed inset-0 pointer-events-none z-0 bg-transparent transition-opacity duration-1000"
    />
  );
};

export default BackgroundEffects;

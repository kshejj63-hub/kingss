
import React, { useEffect, useRef } from 'react';
import { ClickStyle } from '../types';

interface ClickEffectsProps {
  style: ClickStyle;
}

const ClickEffects: React.FC<ClickEffectsProps> = ({ style }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const effectsRef = useRef<any[]>([]);

  useEffect(() => {
    if (style === 'none') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    window.addEventListener('resize', resize);
    resize();

    const handleClick = (e: MouseEvent) => {
        const x = e.clientX;
        const y = e.clientY;
        
        if (style === 'ripple') {
            effectsRef.current.push({ x, y, r: 0, alpha: 1, type: 'ripple', color: '#007AFF' });
        } else if (style === 'particles') {
            for(let i=0; i<12; i++) {
                const angle = Math.random() * Math.PI * 2;
                const speed = Math.random() * 3 + 2;
                effectsRef.current.push({ 
                    x, y, 
                    vx: Math.cos(angle)*speed, 
                    vy: Math.sin(angle)*speed, 
                    alpha: 1, type: 'particle', color: '#FF2D55' 
                });
            }
        } else if (style === 'glow') {
            effectsRef.current.push({ x, y, r: 0, alpha: 1, type: 'glow', color: '#34C759' });
        } else if (style === 'splash') {
            const colors = ["#FF9500", "#5856D6", "#FF2D55"];
            for(let i=0; i<8; i++) {
                effectsRef.current.push({ 
                    x, y, 
                    vx: (Math.random()-0.5)*10, 
                    vy: (Math.random()-0.5)*10, 
                    alpha: 1, type: 'particle', color: colors[i % colors.length], size: Math.random()*4+2
                });
            }
        } else if (style === 'hologram') {
             effectsRef.current.push({ x, y, r: 0, alpha: 1, type: 'hologram', color: '#5AC8FA' });
        }
    };

    window.addEventListener('click', handleClick);

    const animate = () => {
        if (!ctx) return;
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (let i = effectsRef.current.length - 1; i >= 0; i--) {
            const effect = effectsRef.current[i];
            
            if (effect.type === 'ripple') {
                effect.r += 4;
                effect.alpha -= 0.02;
                ctx.beginPath();
                ctx.arc(effect.x, effect.y, effect.r, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(0, 122, 255, ${effect.alpha})`;
                ctx.lineWidth = 2;
                ctx.stroke();
            } else if (effect.type === 'particle') {
                effect.x += effect.vx;
                effect.y += effect.vy;
                effect.alpha -= 0.03;
                effect.vy += 0.1; // gravity
                ctx.fillStyle = effect.color;
                ctx.globalAlpha = Math.max(0, effect.alpha);
                ctx.beginPath();
                ctx.arc(effect.x, effect.y, effect.size || 3, 0, Math.PI * 2);
                ctx.fill();
                ctx.globalAlpha = 1;
            } else if (effect.type === 'glow') {
                effect.r += 2;
                effect.alpha -= 0.03;
                const grad = ctx.createRadialGradient(effect.x, effect.y, 0, effect.x, effect.y, effect.r);
                grad.addColorStop(0, `rgba(52, 199, 89, ${effect.alpha})`);
                grad.addColorStop(1, 'rgba(52, 199, 89, 0)');
                ctx.fillStyle = grad;
                ctx.beginPath();
                ctx.arc(effect.x, effect.y, effect.r, 0, Math.PI*2);
                ctx.fill();
            } else if (effect.type === 'hologram') {
                effect.r += 5;
                effect.alpha -= 0.02;
                ctx.strokeStyle = `rgba(90, 200, 250, ${effect.alpha})`;
                ctx.lineWidth = 1;
                ctx.beginPath();
                ctx.arc(effect.x, effect.y, effect.r, 0, Math.PI * 2);
                ctx.stroke();
                ctx.beginPath();
                ctx.arc(effect.x, effect.y, effect.r * 0.8, 0, Math.PI * 2);
                ctx.stroke();
            }

            if (effect.alpha <= 0) {
                effectsRef.current.splice(i, 1);
            }
        }

        requestAnimationFrame(animate);
    };

    const animId = requestAnimationFrame(animate);

    return () => {
        window.removeEventListener('resize', resize);
        window.removeEventListener('click', handleClick);
        cancelAnimationFrame(animId);
    };
  }, [style]);

  if (style === 'none') return null;

  return (
    <canvas 
        ref={canvasRef} 
        className="fixed inset-0 pointer-events-none z-[9999]" 
    />
  );
};

export default ClickEffects;

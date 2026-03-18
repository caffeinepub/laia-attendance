import { useEffect, useRef } from "react";

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  opacity: number;
  radius: number;
  life: number;
  maxLife: number;
  colorIdx: number;
}

const COLORS = [
  "rgba(147, 197, 253, ", // blue-300
  "rgba(186, 230, 253, ", // sky-200
  "rgba(165, 180, 252, ", // indigo-300
  "rgba(199, 210, 254, ", // indigo-200
];

function createParticle(canvasWidth: number, canvasHeight: number): Particle {
  const maxLife = 180 + Math.random() * 180;
  return {
    x: Math.random() * canvasWidth,
    y: canvasHeight + Math.random() * 40,
    vx: (Math.random() - 0.5) * 0.6,
    vy: -(0.4 + Math.random() * 0.8),
    opacity: 0,
    radius: 1 + Math.random() * 3,
    life: 0,
    maxLife,
    colorIdx: Math.floor(Math.random() * COLORS.length),
  };
}

export default function FountainBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const rafRef = useRef<number>(0);
  const particlesRef = useRef<Particle[]>([]);
  const pausedRef = useRef(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    // Initialise 60 particles spread across heights
    particlesRef.current = Array.from({ length: 60 }, () => {
      const p = createParticle(canvas.width, canvas.height);
      // stagger initial positions
      p.y = Math.random() * canvas.height;
      p.life = Math.random() * p.maxLife;
      return p;
    });

    const handleVisibility = () => {
      pausedRef.current = document.hidden;
    };
    document.addEventListener("visibilitychange", handleVisibility);

    const draw = () => {
      if (!pausedRef.current) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);

        for (const p of particlesRef.current) {
          p.life++;
          p.x += p.vx;
          p.y += p.vy;

          // fade in/out based on life
          const progress = p.life / p.maxLife;
          if (progress < 0.15) {
            p.opacity = (progress / 0.15) * 0.12;
          } else if (progress > 0.75) {
            p.opacity = ((1 - progress) / 0.25) * 0.12;
          } else {
            p.opacity = 0.07 + Math.random() * 0.05;
          }

          // reset when dead
          if (p.life >= p.maxLife || p.y < -20) {
            const fresh = createParticle(canvas.width, canvas.height);
            Object.assign(p, fresh);
          }

          // draw circle
          ctx.beginPath();
          ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
          ctx.fillStyle = `${COLORS[p.colorIdx]}${p.opacity})`;
          ctx.fill();
        }
      }

      rafRef.current = requestAnimationFrame(draw);
    };

    rafRef.current = requestAnimationFrame(draw);

    return () => {
      cancelAnimationFrame(rafRef.current);
      window.removeEventListener("resize", resize);
      document.removeEventListener("visibilitychange", handleVisibility);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 0,
        pointerEvents: "none",
        width: "100vw",
        height: "100vh",
      }}
    />
  );
}

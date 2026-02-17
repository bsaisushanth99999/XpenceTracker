import { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    baseX: number;
    baseY: number;
    angle: number;
    speed: number;
}

const PARTICLE_COLORS = [
    'rgba(167, 139, 250, 0.6)',  // lavender
    'rgba(147, 197, 253, 0.6)',  // light blue
    'rgba(252, 165, 165, 0.6)',  // soft pink
    'rgba(253, 186, 116, 0.6)',  // muted orange
    'rgba(134, 239, 172, 0.55)', // mint green
    'rgba(196, 181, 253, 0.55)', // purple
    'rgba(165, 243, 252, 0.55)', // cyan
    'rgba(254, 202, 202, 0.5)',  // blush
];

const PARTICLE_COUNT = 800;
const MOUSE_RADIUS = 200;
const ATTRACTION_STRENGTH = 0.02;
const RETURN_STRENGTH = 0.005;
const FRICTION = 0.96;
const DRIFT_SPEED = 0.3;

export default function ParticleSwarm() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const particlesRef = useRef<Particle[]>([]);
    const mouseRef = useRef({ x: -999, y: -999, active: false });
    const rafRef = useRef<number>(0);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            initParticles();
        };

        const initParticles = () => {
            const particles: Particle[] = [];
            for (let i = 0; i < PARTICLE_COUNT; i++) {
                const x = Math.random() * canvas.width;
                const y = Math.random() * canvas.height;
                particles.push({
                    x,
                    y,
                    vx: (Math.random() - 0.5) * 0.5,
                    vy: (Math.random() - 0.5) * 0.5,
                    size: Math.random() * 2.5 + 0.5,
                    color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
                    baseX: x,
                    baseY: y,
                    angle: Math.random() * Math.PI * 2,
                    speed: Math.random() * DRIFT_SPEED + 0.1,
                });
            }
            particlesRef.current = particles;
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const particles = particlesRef.current;
            const mouse = mouseRef.current;
            const time = Date.now() * 0.001;

            for (let i = 0; i < particles.length; i++) {
                const p = particles[i];

                // Ambient drift (gentle circular motion around base position)
                p.angle += p.speed * 0.01;
                const driftX = Math.cos(p.angle + time * 0.3) * DRIFT_SPEED;
                const driftY = Math.sin(p.angle + time * 0.2) * DRIFT_SPEED;
                p.vx += driftX * 0.01;
                p.vy += driftY * 0.01;

                // Mouse attraction
                if (mouse.active) {
                    const dx = mouse.x - p.x;
                    const dy = mouse.y - p.y;
                    const dist = Math.sqrt(dx * dx + dy * dy);

                    if (dist < MOUSE_RADIUS) {
                        const force = (1 - dist / MOUSE_RADIUS) * ATTRACTION_STRENGTH;
                        p.vx += dx * force;
                        p.vy += dy * force;
                    }
                }

                // Gentle return to base position (very weak, just keeps them from drifting too far)
                const homeX = p.baseX - p.x;
                const homeY = p.baseY - p.y;
                p.vx += homeX * RETURN_STRENGTH;
                p.vy += homeY * RETURN_STRENGTH;

                // Apply friction
                p.vx *= FRICTION;
                p.vy *= FRICTION;

                // Update position
                p.x += p.vx;
                p.y += p.vy;

                // Wrap around edges
                if (p.x < -10) p.x = canvas.width + 10;
                if (p.x > canvas.width + 10) p.x = -10;
                if (p.y < -10) p.y = canvas.height + 10;
                if (p.y > canvas.height + 10) p.y = -10;

                // Draw particle
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color;
                ctx.fill();
            }

            rafRef.current = requestAnimationFrame(animate);
        };

        const handleMouseMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
        };

        const handleMouseLeave = () => {
            mouseRef.current = { ...mouseRef.current, active: false };
        };

        resize();
        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);
        rafRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
            cancelAnimationFrame(rafRef.current);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'fixed',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0,
            }}
        />
    );
}

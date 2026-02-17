import { useEffect, useRef } from 'react';

interface Particle {
    x: number;
    y: number;
    vx: number;
    vy: number;
    size: number;
    color: string;
    life: number;
    maxLife: number;
    angle: number;
    orbitRadius: number;
    orbitSpeed: number;
}

const PARTICLE_COLORS = [
    'rgba(167, 139, 250, 0.7)',  // lavender
    'rgba(147, 197, 253, 0.7)',  // light blue
    'rgba(252, 165, 165, 0.65)', // soft pink
    'rgba(253, 186, 116, 0.65)', // muted orange
    'rgba(134, 239, 172, 0.6)',  // mint green
    'rgba(196, 181, 253, 0.6)',  // purple
    'rgba(165, 243, 252, 0.6)',  // cyan
    'rgba(254, 202, 202, 0.55)', // blush
];

const MAX_PARTICLES = 120;
const SPAWN_RATE = 3; // particles per frame
const ORBIT_RADIUS_MIN = 20;
const ORBIT_RADIUS_MAX = 80;
const PARTICLE_LIFE_MIN = 40;
const PARTICLE_LIFE_MAX = 90;

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
        };

        const spawnParticle = (mx: number, my: number): Particle => {
            const angle = Math.random() * Math.PI * 2;
            const orbitRadius = ORBIT_RADIUS_MIN + Math.random() * (ORBIT_RADIUS_MAX - ORBIT_RADIUS_MIN);
            const maxLife = PARTICLE_LIFE_MIN + Math.random() * (PARTICLE_LIFE_MAX - PARTICLE_LIFE_MIN);
            return {
                x: mx + Math.cos(angle) * orbitRadius * 0.3,
                y: my + Math.sin(angle) * orbitRadius * 0.3,
                vx: (Math.random() - 0.5) * 1.5,
                vy: (Math.random() - 0.5) * 1.5,
                size: Math.random() * 2.5 + 0.8,
                color: PARTICLE_COLORS[Math.floor(Math.random() * PARTICLE_COLORS.length)],
                life: maxLife,
                maxLife,
                angle,
                orbitRadius,
                orbitSpeed: (Math.random() - 0.5) * 0.08,
            };
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const particles = particlesRef.current;
            const mouse = mouseRef.current;

            // Spawn new particles near cursor
            if (mouse.active && particles.length < MAX_PARTICLES) {
                for (let i = 0; i < SPAWN_RATE; i++) {
                    if (particles.length < MAX_PARTICLES) {
                        particles.push(spawnParticle(mouse.x, mouse.y));
                    }
                }
            }

            // Update and draw particles
            for (let i = particles.length - 1; i >= 0; i--) {
                const p = particles[i];

                // Orbit around cursor when active
                if (mouse.active) {
                    p.angle += p.orbitSpeed;
                    const targetX = mouse.x + Math.cos(p.angle) * p.orbitRadius;
                    const targetY = mouse.y + Math.sin(p.angle) * p.orbitRadius;
                    p.vx += (targetX - p.x) * 0.04;
                    p.vy += (targetY - p.y) * 0.04;
                }

                // Friction
                p.vx *= 0.92;
                p.vy *= 0.92;

                // Update position
                p.x += p.vx;
                p.y += p.vy;

                // Decrease life
                p.life -= 1;

                // Remove dead particles
                if (p.life <= 0) {
                    particles.splice(i, 1);
                    continue;
                }

                // Fade based on life
                const alpha = Math.min(1, p.life / 20) * Math.min(1, (p.maxLife - (p.maxLife - p.life)) / 10);
                const fadeAlpha = p.life < 15 ? p.life / 15 : 1;

                // Draw
                ctx.beginPath();
                ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
                ctx.fillStyle = p.color.replace(/[\d.]+\)$/, `${fadeAlpha * 0.7})`);
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

        const handleTouchMove = (e: TouchEvent) => {
            if (e.touches.length > 0) {
                mouseRef.current = { x: e.touches[0].clientX, y: e.touches[0].clientY, active: true };
            }
        };

        const handleTouchEnd = () => {
            mouseRef.current = { ...mouseRef.current, active: false };
        };

        resize();
        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', handleMouseMove);
        document.addEventListener('mouseleave', handleMouseLeave);
        window.addEventListener('touchmove', handleTouchMove, { passive: true });
        window.addEventListener('touchend', handleTouchEnd);
        rafRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', handleMouseMove);
            document.removeEventListener('mouseleave', handleMouseLeave);
            window.removeEventListener('touchmove', handleTouchMove);
            window.removeEventListener('touchend', handleTouchEnd);
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
                zIndex: 9999,
            }}
        />
    );
}

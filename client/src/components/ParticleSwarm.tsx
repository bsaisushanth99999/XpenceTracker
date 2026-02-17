import { useEffect, useRef } from 'react';

// Minimal, subtle particle effect — just a few tiny dots near cursor
export default function ParticleSwarm() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const mouseRef = useRef({ x: -999, y: -999, active: false });
    const rafRef = useRef<number>(0);
    const dotsRef = useRef<{ x: number; y: number; opacity: number; angle: number; radius: number }[]>([]);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            const mouse = mouseRef.current;

            if (mouse.active) {
                const dots = dotsRef.current;
                // Keep exactly 5 gentle dots orbiting cursor
                while (dots.length < 5) {
                    dots.push({
                        x: mouse.x,
                        y: mouse.y,
                        opacity: 0.3 + Math.random() * 0.3,
                        angle: Math.random() * Math.PI * 2,
                        radius: 12 + Math.random() * 18,
                    });
                }

                for (const d of dots) {
                    d.angle += 0.015;
                    const tx = mouse.x + Math.cos(d.angle) * d.radius;
                    const ty = mouse.y + Math.sin(d.angle) * d.radius;
                    d.x += (tx - d.x) * 0.12;
                    d.y += (ty - d.y) * 0.12;

                    ctx.beginPath();
                    ctx.arc(d.x, d.y, 2, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(99, 102, 241, ${d.opacity})`;
                    ctx.fill();
                }
            } else {
                // Fade out
                const dots = dotsRef.current;
                for (let i = dots.length - 1; i >= 0; i--) {
                    dots[i].opacity -= 0.02;
                    if (dots[i].opacity <= 0) {
                        dots.splice(i, 1);
                        continue;
                    }
                    ctx.beginPath();
                    ctx.arc(dots[i].x, dots[i].y, 2, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(99, 102, 241, ${dots[i].opacity})`;
                    ctx.fill();
                }
            }

            rafRef.current = requestAnimationFrame(animate);
        };

        const onMove = (e: MouseEvent) => {
            mouseRef.current = { x: e.clientX, y: e.clientY, active: true };
        };
        const onLeave = () => {
            mouseRef.current = { ...mouseRef.current, active: false };
        };

        resize();
        window.addEventListener('resize', resize);
        window.addEventListener('mousemove', onMove);
        document.addEventListener('mouseleave', onLeave);
        rafRef.current = requestAnimationFrame(animate);

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', onMove);
            document.removeEventListener('mouseleave', onLeave);
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

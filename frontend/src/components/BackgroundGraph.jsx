import React, { useEffect, useRef } from 'react';

// Animation logic intentionally mirrors the existing effect.
const HUB_CONNECTIONS = 8;
const DOT_COUNT = 280;
const SPEED = 0.15;
const MAX_LINE_DISTANCE = 120;

const BackgroundGraph = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const mouse = { x: null, y: null, radius: 120 };

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const handleMouseMove = (e) => {
      mouse.x = e.clientX;
      mouse.y = e.clientY;
    };

    const handleMouseLeave = () => {
      mouse.x = null;
      mouse.y = null;
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseleave', handleMouseLeave);

    const dots = [];
    for (let i = 0; i < DOT_COUNT; i++) {
      dots.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * SPEED,
        vy: (Math.random() - 0.5) * SPEED,
        r: 1.6
      });
    }

    const getLineStyle = (distance, maxDistance, baseOpacity) => {
      const t = Math.max(0, 1 - distance / maxDistance);
      return {
        opacity: baseOpacity * t,
        width: 0.3 + t * 0.7
      };
    };

    let frameId;

    const animate = () => {
      frameId = requestAnimationFrame(animate);
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      for (let dot of dots) {
        dot.x += dot.vx;
        dot.y += dot.vy;

        if (dot.x < 0 || dot.x > canvas.width) dot.vx *= -1;
        if (dot.y < 0 || dot.y > canvas.height) dot.vy *= -1;

        let isNear = false;
        let intensity = 0;

        if (mouse.x !== null) {
          const dx = mouse.x - dot.x;
          const dy = mouse.y - dot.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius) {
            isNear = true;
            intensity = 1 - dist / mouse.radius;
          }
        }

        if (isNear) {
          ctx.beginPath();
          ctx.arc(dot.x, dot.y, dot.r + 6 * intensity, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(120,200,255,${0.15 + intensity * 0.35})`;
          ctx.fill();
        }

        ctx.beginPath();
        ctx.arc(dot.x, dot.y, dot.r, 0, Math.PI * 2);
        ctx.fillStyle = isNear ? 'rgba(180,230,255,1)' : 'rgba(86,240,255,0.6)';
        ctx.fill();
      }

      if (mouse.x !== null) {
        const hubDots = [];

        for (let dot of dots) {
          const dx = mouse.x - dot.x;
          const dy = mouse.y - dot.y;
          const dist = Math.sqrt(dx * dx + dy * dy);

          if (dist < mouse.radius) {
            hubDots.push({ dot, dist });
          }
        }

        hubDots.sort((a, b) => a.dist - b.dist);
        hubDots.length = Math.min(HUB_CONNECTIONS, hubDots.length);

        for (let { dot, dist } of hubDots) {
          const style = getLineStyle(dist, mouse.radius, 0.6);

          ctx.beginPath();
          ctx.moveTo(mouse.x, mouse.y);
          ctx.lineTo(dot.x, dot.y);
          ctx.strokeStyle = `rgba(86,240,255,${style.opacity})`;
          ctx.lineWidth = style.width;
          ctx.stroke();
        }

        for (let i = 0; i < hubDots.length; i++) {
          for (let j = i + 1; j < hubDots.length; j++) {
            const d1 = hubDots[i].dot;
            const d2 = hubDots[j].dot;

            const dx = d1.x - d2.x;
            const dy = d1.y - d2.y;
            const dist = Math.sqrt(dx * dx + dy * dy);

            if (dist < MAX_LINE_DISTANCE) {
              const style = getLineStyle(dist, MAX_LINE_DISTANCE, 0.35);

              ctx.beginPath();
              ctx.moveTo(d1.x, d1.y);
              ctx.lineTo(d2.x, d2.y);
              ctx.strokeStyle = `rgba(86,240,255,${style.opacity})`;
              ctx.lineWidth = style.width;
              ctx.stroke();
            }
          }
        }
      }
    };

    animate();

    return () => {
      cancelAnimationFrame(frameId);
      window.removeEventListener('resize', resizeCanvas);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, []);

  return <canvas id="graph" ref={canvasRef} aria-hidden="true" />;
};

export default BackgroundGraph;


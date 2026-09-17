import React, { useEffect, useRef } from 'react';

export default function Globe3D() {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    let animationFrameId;
    let rotation = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      const centerX = width / 2;
      const centerY = height / 2;
      const radius = Math.min(width, height) * 0.38;

      ctx.clearRect(0, 0, width, height);

      // Globe Base (Deep Cyan/Navy sphere matching Figma screenshot 2)
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fillStyle = '#0E2A38';
      ctx.fill();

      // Radial Cyan Glow on upper right sphere (matching screenshot 2)
      const glow = ctx.createRadialGradient(
        centerX + radius * 0.4,
        centerY - radius * 0.2,
        0,
        centerX + radius * 0.4,
        centerY - radius * 0.2,
        radius * 0.9
      );
      glow.addColorStop(0, '#00E5FF');
      glow.addColorStop(0.4, '#00A3A6');
      glow.addColorStop(1, 'transparent');

      ctx.fillStyle = glow;
      ctx.beginPath();
      ctx.arc(centerX, centerY, radius, 0, Math.PI * 2);
      ctx.fill();

      // Grid Wireframe overlay (latitude/longitude lines in cyan)
      ctx.lineWidth = 1;
      ctx.strokeStyle = 'rgba(255, 255, 255, 0.15)';

      for (let i = -3; i <= 3; i++) {
        const yOffset = (i / 4) * radius;
        const rLat = Math.sqrt(Math.max(0, radius * radius - yOffset * yOffset));
        ctx.beginPath();
        ctx.ellipse(centerX, centerY + yOffset, rLat, rLat * 0.25, 0, 0, Math.PI * 2);
        ctx.stroke();
      }

      for (let i = 0; i < 8; i++) {
        const angle = rotation + (i * Math.PI) / 4;
        const xOffset = Math.sin(angle) * radius;
        if (Math.cos(angle) > -0.2) {
          ctx.beginPath();
          ctx.ellipse(centerX, centerY, Math.abs(xOffset), radius, 0, 0, Math.PI * 2);
          ctx.stroke();
        }
      }

      // Outer golden orbital ring (matching screenshot 2)
      ctx.beginPath();
      ctx.ellipse(centerX, centerY - radius * 0.3, radius * 1.2, radius * 0.4, -Math.PI / 12, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(217, 119, 6, 0.8)';
      ctx.lineWidth = 1.5;
      ctx.stroke();

      rotation += 0.005;
      animationFrameId = requestAnimationFrame(render);
    };

    render();
    return () => cancelAnimationFrame(animationFrameId);
  }, []);

  return (
    <div className="w-full h-full min-h-[300px] flex items-center justify-center relative overflow-hidden bg-blueprint">
      <canvas ref={canvasRef} width={460} height={360} className="max-w-full max-h-full" />
    </div>
  );
}

// effects/BubbleEffect.js
import React, { useEffect, useRef } from "react";

const BubbleEffect = () => {
  const canvasRef = useRef(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");

    let bubbles = [];
    for (let i = 0; i < 20; i++) {
      bubbles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        radius: Math.random() * 10 + 5,
        speed: Math.random() * 2 + 1,
      });
    }

    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      bubbles.forEach((bubble) => {
        ctx.beginPath();
        ctx.arc(bubble.x, bubble.y, bubble.radius, 0, 2 * Math.PI);
        ctx.fillStyle = "rgba(255, 255, 255, 0.5)";
        ctx.fill();
        bubble.y -= bubble.speed;
        if (bubble.y < 0) bubble.y = canvas.height;
      });
      requestAnimationFrame(animate);
    };

    animate();
  }, []);

  return <canvas ref={canvasRef} className="bubble-canvas" />;
};

export default BubbleEffect;

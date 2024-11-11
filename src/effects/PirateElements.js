// PirateEffects.js
import React from 'react';


// Pirate Flag Animation Function
export function animatePirateFlag(ctx, canvas) {
  function animate() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Set fillStyle based on dark mode
    ctx.fillStyle = isDarkMode ? 'rgba(74, 0, 0, 0.2)' : 'rgba(65, 1, 1, 0.2)';
    ctx.beginPath();
    for (let i = 0; i < canvas.width; i += 20) {
      const waveHeight = 20 * Math.sin((i / canvas.width) * Math.PI * 2 + performance.now() / 1000);
      ctx.lineTo(i, canvas.height / 2 + waveHeight);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fill();

    requestAnimationFrame(animate);
  }

  animate();
}

export function animateSeaSurface(ctx, canvas) {
  function animate() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Adjust fill style based on dark mode
    ctx.fillStyle = isDarkMode ? 'rgba(0, 123, 255, 0.3)' : 'rgba(0, 60, 200, 0.2)';
    ctx.beginPath();
    for (let i = 0; i < canvas.width; i += 15) {
      const waveHeight = 15 * Math.sin((i / canvas.width) * Math.PI * 2 + performance.now() / 800);
      ctx.lineTo(i, canvas.height / 2 + waveHeight);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fill();

    requestAnimationFrame(animate);
  }

  animate();
}

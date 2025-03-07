// PirateEffects.js

export function animateSeaSurface(ctx, canvas) {
  function animate() {
    const isDarkMode = document.body.classList.contains('dark-mode');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Adjust fill style based on dark mode
    ctx.fillStyle = isDarkMode ? 'rgba(74, 0, 0, 0.7)' : 'rgba(65, 1, 1, 0.6)';
    ctx.beginPath();
    for (let i = 0; i < canvas.width; i += 15) {
      const waveHeight = 7 * Math.sin((i / canvas.width) * Math.PI * 2 + performance.now() / 700);
      ctx.lineTo(i, canvas.height / 1.5 + waveHeight);
    }
    ctx.lineTo(canvas.width, canvas.height);
    ctx.lineTo(0, canvas.height);
    ctx.closePath();
    ctx.fill();

    requestAnimationFrame(animate);
  }

  animate();
}

import confetti from 'canvas-confetti';

/** Fire a burst of confetti from the center of the screen. */
export function fireConfetti() {
  const defaults = { startVelocity: 28, spread: 70, ticks: 55, zIndex: 9999 };

  function fire(particleRatio: number, opts: confetti.Options) {
    confetti({ ...defaults, ...opts, particleCount: Math.floor(120 * particleRatio) });
  }

  fire(0.25, { angle: 60,  spread: 55, origin: { x: 0,    y: 0.65 } });
  fire(0.2,  { angle: 90,  spread: 70, origin: { x: 0.5,  y: 0.65 } });
  fire(0.35, { angle: 120, spread: 55, origin: { x: 1,    y: 0.65 } });
  fire(0.1,  { angle: 90,  spread: 100, origin: { x: 0.5, y: 0.5  } });
}

/** Small celebration — single burst from element position. */
export function fireSmallConfetti(x: number, y: number) {
  confetti({
    particleCount: 40,
    spread: 50,
    origin: {
      x: x / window.innerWidth,
      y: y / window.innerHeight,
    },
    startVelocity: 20,
    ticks: 40,
    zIndex: 9999,
    colors: ['#4f46e5', '#06b6d4', '#10b981', '#f59e0b'],
  });
}

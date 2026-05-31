import confetti from "canvas-confetti";

/**
 * A celebratory burst fired at conversation milestones (every 25 questions).
 * Uses a couple of angled cannons plus a centered pop for a full-screen feel.
 */
export function celebrate() {
  const colors = ["#3b82f6", "#8b5cf6", "#22c55e", "#f97316", "#ef4444"];

  confetti({
    particleCount: 90,
    spread: 70,
    origin: { y: 0.6 },
    colors,
    scalar: 1.1,
  });

  // Side cannons for a wider sweep.
  setTimeout(() => {
    confetti({ particleCount: 50, angle: 60, spread: 55, origin: { x: 0 }, colors });
    confetti({ particleCount: 50, angle: 120, spread: 55, origin: { x: 1 }, colors });
  }, 150);
}

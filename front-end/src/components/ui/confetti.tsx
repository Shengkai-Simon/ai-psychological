import { useEffect } from "react";
import confetti from "canvas-confetti";

export function ConfettiBurst({ fire }: { fire: boolean }) {
  useEffect(() => {
    if (!fire) return;
    const end = Date.now() + 800;
    const colors = ["#FFD166", "#06D6A0", "#EF476F", "#118AB2", "#8338EC"];

    const frame = () => {
      confetti({
        particleCount: 6,
        angle: 60,
        spread: 55,
        origin: { x: 0 },
        colors,
      });
      confetti({
        particleCount: 6,
        angle: 120,
        spread: 55,
        origin: { x: 1 },
        colors,
      });
      if (Date.now() < end) requestAnimationFrame(frame);
    };
    frame();
  }, [fire]);

  return null;
}



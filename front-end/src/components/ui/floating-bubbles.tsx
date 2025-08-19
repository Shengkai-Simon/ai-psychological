export function FloatingBubbles() {
  const bubbles = [
    { left: "8%", top: "12%", size: 80, delay: "0s" },
    { left: "85%", top: "18%", size: 50, delay: "0.6s" },
    { left: "12%", top: "65%", size: 64, delay: "0.9s" },
    { left: "88%", top: "78%", size: 72, delay: "1.3s" },
  ];
  return (
    <div aria-hidden>
      {bubbles.map((b, i) => (
        <span
          key={i}
          className="pointer-events-none absolute rounded-full bg-white/25 blur-xl animate-float-slower"
          style={{ left: b.left, top: b.top, width: b.size, height: b.size, animationDelay: b.delay as any }}
        />
      ))}
    </div>
  );
}



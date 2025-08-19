const stickers = [
  "🦄",
  "🐯",
  "🐳",
  "🚀",
  "🌈",
  "🛝",
  "🎈",
  "🍭",
];

export function KidStickers({ className = "" }: { className?: string }) {
  return (
    <div className={`flex flex-wrap gap-2 justify-center ${className}`} aria-hidden>
      {stickers.map((s, i) => (
        <span
          key={`${s}-${i}`}
          className="text-2xl sm:text-3xl select-none animate-in fade-in zoom-in-95"
          style={{ animationDelay: `${i * 50}ms` }}
        >
          {s}
        </span>
      ))}
    </div>
  );
}



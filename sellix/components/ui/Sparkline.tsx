/** Мини-график (спарклайн) из ряда чисел — лёгкий SVG без библиотек. */
export function Sparkline({
  data,
  className = "h-8 w-24",
  color = "#C7F503",
}: {
  data: number[];
  className?: string;
  color?: string;
}) {
  const pts = data.filter((n) => Number.isFinite(n));
  if (pts.length < 2) {
    return <div className={className} />;
  }
  const w = 100;
  const h = 32;
  const min = Math.min(...pts);
  const max = Math.max(...pts);
  const span = max - min || 1;
  const step = w / (pts.length - 1);
  const coords = pts.map((v, i) => [i * step, h - ((v - min) / span) * (h - 4) - 2]);
  const d = coords.map(([x, y], i) => `${i === 0 ? "M" : "L"}${x.toFixed(1)},${y.toFixed(1)}`).join(" ");
  const area = `${d} L${w},${h} L0,${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} className={className} preserveAspectRatio="none">
      <path d={area} fill={color} opacity="0.12" />
      <path d={d} fill="none" stroke={color} strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

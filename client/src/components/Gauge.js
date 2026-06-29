'use client';

export default function Gauge({ value = 0, size = 120, strokeWidth = 10 }) {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (Math.min(Math.max(value, 0), 100) / 100) * circumference;

  // Determine indicator color based on value
  let strokeColor = 'stroke-emerald-500'; // high (>75)
  if (value < 40) {
    strokeColor = 'stroke-rose-500'; // low (<40)
  } else if (value < 75) {
    strokeColor = 'stroke-amber-500'; // medium (40-75)
  }

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="transform -rotate-90" width={size} height={size}>
        {/* Track circle */}
        <circle
          className="stroke-white/10"
          fill="transparent"
          strokeWidth={strokeWidth}
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
        {/* Value circle */}
        <circle
          className={`${strokeColor} transition-all duration-1000 ease-out`}
          fill="transparent"
          strokeWidth={strokeWidth}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          r={radius}
          cx={size / 2}
          cy={size / 2}
        />
      </svg>
      {/* Percentage Center Text */}
      <div className="absolute flex flex-col items-center justify-center">
        <span className="text-2xl font-black tracking-tight text-white">{value}%</span>
        <span className="text-[10px] uppercase tracking-wider text-slate-400 font-semibold">Confidence</span>
      </div>
    </div>
  );
}

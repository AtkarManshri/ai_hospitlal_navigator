export default function ConfidenceBadge({ score }) {
  const percentage = Math.round(score * 100);
  const radius = 28;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score * circumference);

  let color = '#f43f5e'; // red
  let label = 'Low';
  if (score >= 0.8) {
    color = '#10b981';
    label = 'High';
  } else if (score >= 0.5) {
    color = '#f59e0b';
    label = 'Medium';
  }

  return (
    <div className="flex items-center gap-3">
      <div className="relative" style={{ width: 68, height: 68 }}>
        <svg width="68" height="68" viewBox="0 0 68 68" className="confidence-ring">
          {/* Background circle */}
          <circle cx="34" cy="34" r={radius} stroke="#1e293b" strokeWidth="6" />
          {/* Progress circle */}
          <circle
            cx="34" cy="34" r={radius}
            stroke={color}
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
          />
        </svg>
        <div className="absolute inset-0 flex items-center justify-center" style={{ transform: 'none' }}>
          <span className="text-sm font-bold text-white">{percentage}%</span>
        </div>
      </div>
      <div>
        <div className="text-xs uppercase tracking-wider" style={{ color: '#64748b' }}>Confidence</div>
        <div className="text-sm font-semibold" style={{ color }}>{label}</div>
      </div>
    </div>
  );
}

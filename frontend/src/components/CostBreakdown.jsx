export default function CostBreakdown({ costEstimate }) {
  if (!costEstimate) return null;

  const { breakdown, formatted_total, city_multiplier, age_adjustment, comorbidity_adjustment, disclaimer } = costEstimate;

  const items = [
    { label: 'Procedure Cost', data: breakdown.procedure_cost, color: '#14b8a6', icon: '🏥' },
    { label: 'Doctor Fee', data: breakdown.doctor_fee, color: '#8b5cf6', icon: '👨‍⚕️' },
    { label: 'Hospital Stay', data: breakdown.hospital_stay, color: '#0ea5e9', icon: '🛏️' },
    { label: 'Diagnostics', data: breakdown.diagnostics, color: '#f59e0b', icon: '🔬' },
    { label: 'Medicines', data: breakdown.medicines, color: '#10b981', icon: '💊' },
    { label: 'Contingency', data: breakdown.contingency, color: '#f43f5e', icon: '⚡' },
  ];

  const totalMax = breakdown.total.max;

  const formatINR = (val) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
    return `₹${val}`;
  };

  return (
    <div className="glass-card p-5" id="cost-breakdown">
      <h3 className="text-base font-semibold text-white mb-1 flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2">
          <path d="M12 1v22M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"/>
        </svg>
        Cost Breakdown
      </h3>
      <p className="text-2xl font-bold mb-4" style={{ color: '#2dd4bf', fontFamily: 'Outfit, sans-serif' }}>
        {formatted_total}
      </p>

      {/* Bar breakdown */}
      <div className="space-y-3 mb-4">
        {items.map(item => {
          const avgCost = (item.data.min + item.data.max) / 2;
          const pct = totalMax > 0 ? (avgCost / totalMax) * 100 : 0;

          return (
            <div key={item.label}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-sm flex items-center gap-1.5" style={{ color: '#cbd5e1' }}>
                  {item.icon} {item.label}
                </span>
                <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>
                  {formatINR(item.data.min)} – {formatINR(item.data.max)}
                </span>
              </div>
              <div className="w-full h-2 rounded-full" style={{ background: '#1e293b' }}>
                <div
                  className="h-2 rounded-full transition-all duration-700"
                  style={{ width: `${Math.min(pct, 100)}%`, background: item.color, opacity: 0.8 }}
                />
              </div>
            </div>
          );
        })}
      </div>

      {/* Adjustment Factors */}
      <div className="flex flex-wrap gap-3 mb-3 pt-3" style={{ borderTop: '1px solid rgba(148,163,184,0.1)' }}>
        <span className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(30,41,59,0.8)', color: '#94a3b8' }}>
          📍 City: ×{city_multiplier.toFixed(2)}
        </span>
        {age_adjustment !== 1.0 && (
          <span className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(30,41,59,0.8)', color: '#94a3b8' }}>
            🎂 Age: ×{age_adjustment.toFixed(2)}
          </span>
        )}
        {comorbidity_adjustment !== 1.0 && (
          <span className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(30,41,59,0.8)', color: '#94a3b8' }}>
            ⚕️ Comorbidity: ×{comorbidity_adjustment.toFixed(2)}
          </span>
        )}
      </div>

      {/* Disclaimer */}
      <p className="text-xs leading-relaxed" style={{ color: '#475569' }}>
        ⚠️ {disclaimer}
      </p>
    </div>
  );
}

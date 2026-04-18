export default function CompareModal({ hospitals, costEstimates, procedure, onClose }) {
  if (!hospitals || hospitals.length < 2) return null;

  const getCostForHospital = (hospitalId) => {
    return costEstimates?.find(c => c.hospital_id === hospitalId);
  };

  const formatINR = (val) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    if (val >= 1000) return `₹${(val / 1000).toFixed(0)}K`;
    return `₹${val}`;
  };

  const getBestValue = (values, higherIsBetter = true) => {
    if (higherIsBetter) return Math.max(...values);
    return Math.min(...values);
  };

  const rows = [
    { label: '📍 City', getValue: (h) => h.hospital.city },
    { label: '🏥 Type', getValue: (h) => h.hospital.hospital_type },
    { label: '⭐ Rating', getValue: (h) => h.hospital.rating, compare: true, higherBetter: true },
    { label: '📏 Distance', getValue: (h) => `${h.hospital.distance} km`, getNum: (h) => h.hospital.distance, compare: true, higherBetter: false },
    { label: '💰 Cost Range', getValue: (h) => {
      const ce = getCostForHospital(h.hospital.hospital_id);
      return ce ? ce.formatted_total : `${formatINR(h.hospital.avg_cost_range.min)} – ${formatINR(h.hospital.avg_cost_range.max)}`;
    }},
    { label: '📊 Overall Score', getValue: (h) => `${(h.scores.total_score * 100).toFixed(0)}%`, getNum: (h) => h.scores.total_score, compare: true, higherBetter: true },
    { label: '🎯 Specialization', getValue: (h) => `${(h.scores.specialization_match * 100).toFixed(0)}%`, getNum: (h) => h.scores.specialization_match, compare: true, higherBetter: true },
    { label: '🏅 Accreditation', getValue: (h) => h.hospital.accreditation || 'N/A' },
    { label: '🛡️ Scheme', getValue: (h) => h.hospital.scheme_supported ? '✅ Supported' : '❌ No' },
    { label: '🛏️ Beds', getValue: (h) => h.hospital.bed_count || 'N/A' },
    { label: '📅 Established', getValue: (h) => h.hospital.established_year || 'N/A' },
  ];

  return (
    <div className="modal-overlay" onClick={onClose} id="compare-modal">
      <div
        className="modal-content glass w-full max-w-4xl max-h-[85vh] overflow-auto mx-4"
        onClick={(e) => e.stopPropagation()}
        style={{ borderRadius: '20px' }}
      >
        {/* Header */}
        <div className="flex items-center justify-between p-5 sticky top-0 z-10"
             style={{ background: 'rgba(15,23,42,0.95)', borderBottom: '1px solid rgba(148,163,184,0.1)', borderRadius: '20px 20px 0 0' }}>
          <div>
            <h2 className="text-lg font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Compare Hospitals
            </h2>
            <p className="text-xs" style={{ color: '#64748b' }}>
              {procedure} • {hospitals.length} hospitals selected
            </p>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors cursor-pointer"
            style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(148,163,184,0.2)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
              <path d="M18 6L6 18M6 6l12 12"/>
            </svg>
          </button>
        </div>

        {/* Comparison Table */}
        <div className="p-5 overflow-x-auto">
          <table className="w-full" style={{ borderCollapse: 'separate', borderSpacing: '0 4px' }}>
            <thead>
              <tr>
                <th className="text-left text-xs font-medium p-3" style={{ color: '#64748b', width: '160px' }}>Parameter</th>
                {hospitals.map(h => (
                  <th key={h.hospital.hospital_id} className="text-left text-sm font-semibold text-white p-3" style={{ fontFamily: 'Outfit, sans-serif' }}>
                    <div className="flex items-center gap-2">
                      <span className="w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold"
                            style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)', color: '#fff' }}>
                        {h.rank}
                      </span>
                      {h.hospital.hospital_name}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => {
                let bestVal = null;
                if (row.compare && row.getNum) {
                  const nums = hospitals.map(h => row.getNum(h));
                  bestVal = getBestValue(nums, row.higherBetter);
                } else if (row.compare) {
                  const nums = hospitals.map(h => row.getValue(h));
                  bestVal = getBestValue(nums.map(Number).filter(n => !isNaN(n)), row.higherBetter);
                }

                return (
                  <tr key={row.label} style={{ background: i % 2 === 0 ? 'rgba(30,41,59,0.3)' : 'transparent' }}>
                    <td className="text-sm p-3" style={{ color: '#94a3b8' }}>{row.label}</td>
                    {hospitals.map(h => {
                      const val = row.getValue(h);
                      const numVal = row.getNum ? row.getNum(h) : parseFloat(val);
                      const isBest = row.compare && bestVal !== null && numVal === bestVal;

                      return (
                        <td key={h.hospital.hospital_id} className="text-sm p-3 font-medium"
                            style={{ color: isBest ? '#2dd4bf' : '#e2e8f0' }}>
                          {val} {isBest && <span className="text-xs">🏆</span>}
                        </td>
                      );
                    })}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Disclaimer */}
        <div className="px-5 pb-5">
          <p className="text-xs p-3 rounded-lg" style={{ background: 'rgba(245,158,11,0.08)', color: '#fbbf24', border: '1px solid rgba(245,158,11,0.2)' }}>
            ⚠️ Cost comparisons are approximate and for informational purposes only. Actual costs may vary.
          </p>
        </div>
      </div>
    </div>
  );
}

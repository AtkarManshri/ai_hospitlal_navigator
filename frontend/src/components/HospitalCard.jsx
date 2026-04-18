const TAG_STYLES = {
  'Best Value': 'tag-best-value',
  'Top Rated': 'tag-top-rated',
  'Scheme Supported': 'tag-scheme',
  'JCI Accredited': 'tag-jci',
  'Nearby': 'tag-nearby',
};

function StarRating({ rating }) {
  const full = Math.floor(rating);
  const hasHalf = rating - full >= 0.3;
  const stars = [];

  for (let i = 0; i < 5; i++) {
    if (i < full) {
      stars.push(<span key={i} className="star-filled">★</span>);
    } else if (i === full && hasHalf) {
      stars.push(<span key={i} className="star-filled" style={{ opacity: 0.5 }}>★</span>);
    } else {
      stars.push(<span key={i} className="star-empty">★</span>);
    }
  }

  return <div className="flex items-center gap-0.5 text-sm">{stars}</div>;
}

export default function HospitalCard({ hospital, rank, scores, tags = [], explanation, costEstimate, isSelected, onToggleCompare }) {
  const h = hospital;

  return (
    <div className="glass-card p-5 relative" id={`hospital-card-${h.hospital_id}`}>
      {/* Rank Badge */}
      <div className="absolute -top-3 -left-3 w-9 h-9 rounded-full flex items-center justify-center text-sm font-bold text-white"
           style={{ background: rank <= 3 ? 'linear-gradient(135deg, #14b8a6, #0d9488)' : '#334155' }}>
        #{rank}
      </div>

      {/* Compare Checkbox */}
      <div className="absolute top-4 right-4 flex items-center gap-2 cursor-pointer" onClick={onToggleCompare}>
        <div className={`custom-checkbox ${isSelected ? 'checked' : ''}`}>
          {isSelected && (
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
              <path d="M20 6L9 17l-5-5"/>
            </svg>
          )}
        </div>
        <span className="text-xs" style={{ color: '#64748b' }}>Compare</span>
      </div>

      {/* Hospital Info */}
      <div className="mt-3">
        <h3 className="text-lg font-semibold text-white mb-1" style={{ fontFamily: 'Outfit, sans-serif' }}>
          {h.hospital_name}
        </h3>

        <div className="flex items-center gap-4 text-sm mb-3" style={{ color: '#94a3b8' }}>
          <span className="flex items-center gap-1">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
              <circle cx="12" cy="10" r="3"/>
            </svg>
            {h.city}
          </span>
          <span>{h.distance} km</span>
          <span className="px-2 py-0.5 rounded text-xs" style={{
            background: h.hospital_type === 'Government' ? 'rgba(14,165,233,0.15)' : h.hospital_type === 'Trust' ? 'rgba(139,92,246,0.15)' : 'rgba(148,163,184,0.1)',
            color: h.hospital_type === 'Government' ? '#38bdf8' : h.hospital_type === 'Trust' ? '#a78bfa' : '#94a3b8',
          }}>
            {h.hospital_type}
          </span>
        </div>

        {/* Rating + Cost */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <StarRating rating={h.rating} />
            <span className="text-sm font-semibold text-white">{h.rating}</span>
          </div>
          <div className="text-right">
            <div className="text-xs" style={{ color: '#64748b' }}>Est. Cost Range</div>
            <div className="text-sm font-semibold" style={{ color: '#2dd4bf' }}>
              {costEstimate ? costEstimate.formatted_total : `₹${(h.avg_cost_range.min / 1000).toFixed(0)}K – ₹${(h.avg_cost_range.max / 1000).toFixed(0)}K`}
            </div>
          </div>
        </div>

        {/* Tags */}
        {tags.length > 0 && (
          <div className="flex flex-wrap gap-2 mb-3">
            {tags.map(tag => (
              <span key={tag} className={`tag ${TAG_STYLES[tag] || 'tag-best-value'}`}>{tag}</span>
            ))}
          </div>
        )}

        {/* Score Breakdown */}
        {scores && (
          <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(148,163,184,0.1)' }}>
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs" style={{ color: '#64748b' }}>Overall Score</span>
              <span className="text-sm font-bold" style={{ color: '#14b8a6' }}>{(scores.total_score * 100).toFixed(0)}%</span>
            </div>
            <div className="w-full h-2 rounded-full" style={{ background: '#1e293b' }}>
              <div className="h-2 rounded-full transition-all duration-700"
                   style={{ width: `${scores.total_score * 100}%`, background: 'linear-gradient(90deg, #14b8a6, #2dd4bf)' }} />
            </div>

            {/* Mini score bars */}
            <div className="grid grid-cols-5 gap-1 mt-2">
              {[
                { label: 'Spec', val: scores.specialization_match },
                { label: 'Rating', val: scores.rating_score },
                { label: 'Dist', val: scores.distance_score },
                { label: 'Cost', val: scores.affordability_score },
                { label: 'Reviews', val: scores.reviews_score },
              ].map(s => (
                <div key={s.label} className="text-center">
                  <div className="h-1 rounded-full mx-auto mb-1" style={{ background: '#1e293b' }}>
                    <div className="h-1 rounded-full" style={{ width: `${s.val * 100}%`, background: '#14b8a6', opacity: 0.6 }} />
                  </div>
                  <span className="text-[10px]" style={{ color: '#475569' }}>{s.label}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Explanation */}
        {explanation && (
          <p className="text-xs mt-3 leading-relaxed" style={{ color: '#64748b' }}>
            💡 {explanation}
          </p>
        )}

        {/* Accreditation */}
        {h.accreditation && (
          <div className="mt-2 text-xs" style={{ color: '#475569' }}>
            🏅 {h.accreditation} • Est. {h.established_year} • {h.bed_count} beds
          </div>
        )}
      </div>
    </div>
  );
}

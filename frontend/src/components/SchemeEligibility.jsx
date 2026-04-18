export default function SchemeEligibility({ scheme }) {
  if (!scheme) return null;

  return (
    <div className="glass-card p-5" id="scheme-eligibility">
      <h3 className="text-base font-semibold text-white mb-3 flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2">
          <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
        </svg>
        Government Schemes
      </h3>

      <div className="rounded-xl p-4" style={{
        background: scheme.eligible ? 'rgba(16,185,129,0.08)' : 'rgba(244,63,94,0.08)',
        border: `1px solid ${scheme.eligible ? 'rgba(16,185,129,0.2)' : 'rgba(244,63,94,0.2)'}`,
      }}>
        {/* Scheme Header */}
        <div className="flex items-center gap-3 mb-3">
          <div className="text-2xl">{scheme.eligible ? '✅' : '❌'}</div>
          <div>
            <h4 className="text-sm font-semibold text-white">{scheme.scheme_name}</h4>
            <span className="text-xs" style={{ color: scheme.eligible ? '#34d399' : '#fb7185' }}>
              {scheme.eligible ? 'Eligible' : 'Not Eligible'}
            </span>
          </div>
        </div>

        {/* Coverage */}
        {scheme.eligible && scheme.coverage_amount && (
          <div className="mb-3 p-3 rounded-lg" style={{ background: 'rgba(16,185,129,0.1)' }}>
            <span className="text-xs block" style={{ color: '#64748b' }}>Coverage Up To</span>
            <span className="text-lg font-bold" style={{ color: '#34d399', fontFamily: 'Outfit, sans-serif' }}>
              ₹{scheme.coverage_amount.toLocaleString('en-IN')}
            </span>
          </div>
        )}

        {/* Supported Hospitals */}
        {scheme.eligible && scheme.supported_hospitals && scheme.supported_hospitals.length > 0 && (
          <div className="mb-3">
            <span className="text-xs font-medium block mb-2" style={{ color: '#94a3b8' }}>
              Supported Hospitals ({scheme.supported_hospitals.length})
            </span>
            <div className="flex flex-wrap gap-1.5">
              {scheme.supported_hospitals.slice(0, 6).map(name => (
                <span key={name} className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(30,41,59,0.8)', color: '#cbd5e1' }}>
                  {name}
                </span>
              ))}
              {scheme.supported_hospitals.length > 6 && (
                <span className="text-xs px-2 py-1 rounded" style={{ background: 'rgba(30,41,59,0.8)', color: '#64748b' }}>
                  +{scheme.supported_hospitals.length - 6} more
                </span>
              )}
            </div>
          </div>
        )}

        {/* Details */}
        {scheme.details && (
          <p className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>
            ℹ️ {scheme.details}
          </p>
        )}
      </div>
    </div>
  );
}

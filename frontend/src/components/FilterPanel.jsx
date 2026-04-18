export default function FilterPanel({ filters, onFilterChange, maxBudget = 2000000 }) {
  const formatBudget = (val) => {
    if (val >= 100000) return `₹${(val / 100000).toFixed(1)}L`;
    return `₹${(val / 1000).toFixed(0)}K`;
  };

  return (
    <div className="glass-card p-5 space-y-6" id="filter-panel">
      <h3 className="text-base font-semibold text-white flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2">
          <path d="M22 3H2l8 9.46V19l4 2v-8.54L22 3z"/>
        </svg>
        Filters
      </h3>

      {/* Budget Range */}
      <div>
        <label className="text-sm font-medium text-slate-300 block mb-2">
          Budget Range
        </label>
        <input
          type="range"
          min={50000}
          max={maxBudget}
          step={50000}
          value={filters.budget || maxBudget}
          onChange={(e) => onFilterChange({ ...filters, budget: parseInt(e.target.value) })}
          className="w-full"
        />
        <div className="flex justify-between text-xs mt-1" style={{ color: '#64748b' }}>
          <span>₹50K</span>
          <span className="font-semibold" style={{ color: '#2dd4bf' }}>
            Up to {formatBudget(filters.budget || maxBudget)}
          </span>
        </div>
      </div>

      {/* Distance */}
      <div>
        <label className="text-sm font-medium text-slate-300 block mb-2">
          Max Distance
        </label>
        <select
          value={filters.maxDistance || 30}
          onChange={(e) => onFilterChange({ ...filters, maxDistance: parseInt(e.target.value) })}
          className="w-full px-3 py-2 rounded-lg text-sm text-white"
          style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(148,163,184,0.2)', outline: 'none' }}
        >
          <option value={5}>Within 5 km</option>
          <option value={10}>Within 10 km</option>
          <option value={15}>Within 15 km</option>
          <option value={20}>Within 20 km</option>
          <option value={30}>Within 30 km</option>
          <option value={100}>Any Distance</option>
        </select>
      </div>

      {/* Hospital Type */}
      <div>
        <label className="text-sm font-medium text-slate-300 block mb-2">
          Hospital Type
        </label>
        <div className="space-y-2">
          {['All', 'Private', 'Government', 'Trust'].map(type => (
            <label key={type} className="flex items-center gap-2 cursor-pointer group">
              <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center transition-colors ${
                (filters.hospitalType || 'All') === type
                  ? 'border-teal-500'
                  : 'border-slate-600 group-hover:border-slate-400'
              }`}>
                {(filters.hospitalType || 'All') === type && (
                  <div className="w-2 h-2 rounded-full" style={{ background: '#14b8a6' }} />
                )}
              </div>
              <span className="text-sm" style={{ color: (filters.hospitalType || 'All') === type ? '#e2e8f0' : '#94a3b8' }}>
                {type}
              </span>
              <input
                type="radio"
                name="hospitalType"
                value={type}
                checked={(filters.hospitalType || 'All') === type}
                onChange={(e) => onFilterChange({ ...filters, hospitalType: e.target.value === 'All' ? null : e.target.value })}
                className="hidden"
              />
            </label>
          ))}
        </div>
      </div>

      {/* Scheme Supported */}
      <div>
        <label className="flex items-center gap-2 cursor-pointer">
          <div
            className={`custom-checkbox ${filters.schemeOnly ? 'checked' : ''}`}
            onClick={() => onFilterChange({ ...filters, schemeOnly: !filters.schemeOnly })}
          >
            {filters.schemeOnly && (
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3">
                <path d="M20 6L9 17l-5-5"/>
              </svg>
            )}
          </div>
          <span className="text-sm" style={{ color: '#94a3b8' }}>Scheme Supported Only</span>
        </label>
      </div>

      {/* Reset */}
      <button
        onClick={() => onFilterChange({ budget: maxBudget, maxDistance: 30, hospitalType: null, schemeOnly: false })}
        className="w-full text-center text-sm py-2 rounded-lg transition-colors cursor-pointer"
        style={{ color: '#64748b', background: 'rgba(30,41,59,0.4)', border: '1px solid rgba(148,163,184,0.1)' }}
        onMouseEnter={(e) => { e.target.style.color = '#f43f5e'; e.target.style.borderColor = 'rgba(244,63,94,0.3)'; }}
        onMouseLeave={(e) => { e.target.style.color = '#64748b'; e.target.style.borderColor = 'rgba(148,163,184,0.1)'; }}
      >
        Reset Filters
      </button>
    </div>
  );
}

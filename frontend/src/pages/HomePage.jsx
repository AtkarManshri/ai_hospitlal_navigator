import SearchBar from '../components/SearchBar';

export default function HomePage({ onSearch, loading }) {
  return (
    <div className="min-h-screen bg-hero-gradient flex flex-col">
      {/* Hero Section */}
      <div className="flex-1 flex flex-col items-center justify-center px-4 pt-20 pb-12 relative">
        {/* Animated Background Dots */}
        <div className="pulse-dot" style={{ width: 300, height: 300, top: '10%', left: '5%' }} />
        <div className="pulse-dot" style={{ width: 200, height: 200, top: '60%', right: '10%', animationDelay: '1s' }} />
        <div className="pulse-dot" style={{ width: 150, height: 150, bottom: '15%', left: '20%', animationDelay: '2s' }} />
        <div className="pulse-dot" style={{ width: 100, height: 100, top: '25%', right: '25%', animationDelay: '0.5s', background: '#8b5cf6' }} />

        {/* Badge */}
        <div className="mb-6 px-4 py-2 rounded-full text-sm font-medium relative z-10"
             style={{ background: 'rgba(20,184,166,0.1)', border: '1px solid rgba(20,184,166,0.2)', color: '#2dd4bf' }}>
          🤖 AI-Powered Healthcare Decisions
        </div>

        {/* Title */}
        <h1 className="text-4xl sm:text-5xl md:text-6xl font-bold text-center mb-4 relative z-10 leading-tight"
            style={{ fontFamily: 'Outfit, sans-serif' }}>
          Find the{' '}
          <span style={{ background: 'linear-gradient(135deg, #14b8a6, #2dd4bf, #0ea5e9)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            Right Hospital
          </span>
          <br />
          at the Right Price
        </h1>

        <p className="text-base sm:text-lg text-center mb-10 max-w-2xl relative z-10" style={{ color: '#94a3b8' }}>
          Search treatments, compare hospitals, and get transparent cost estimates — 
          all powered by AI. Just type what you need.
        </p>

        {/* Search Bar */}
        <div className="w-full max-w-3xl relative z-10">
          <SearchBar onSearch={onSearch} loading={loading} />
        </div>
      </div>

      {/* How It Works */}
      <div className="pb-16 px-4 relative z-10">
        <h2 className="text-2xl font-bold text-center mb-10" style={{ fontFamily: 'Outfit, sans-serif', color: '#e2e8f0' }}>
          How It Works
        </h2>

        <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            {
              icon: '🔍',
              title: 'Search Naturally',
              desc: 'Type your symptoms, condition, city, and budget in plain language. Our AI understands you.',
              gradient: 'linear-gradient(135deg, rgba(20,184,166,0.15), rgba(20,184,166,0.05))',
              border: 'rgba(20,184,166,0.2)',
            },
            {
              icon: '📊',
              title: 'Compare Smartly',
              desc: 'See ranked hospitals with transparent scores, cost breakdowns, and side-by-side comparisons.',
              gradient: 'linear-gradient(135deg, rgba(139,92,246,0.15), rgba(139,92,246,0.05))',
              border: 'rgba(139,92,246,0.2)',
            },
            {
              icon: '✅',
              title: 'Decide Confidently',
              desc: 'Understand treatment pathways, check scheme eligibility, and make informed healthcare decisions.',
              gradient: 'linear-gradient(135deg, rgba(14,165,233,0.15), rgba(14,165,233,0.05))',
              border: 'rgba(14,165,233,0.2)',
            },
          ].map((step, i) => (
            <div key={i} className="glass-card p-6 text-center" style={{ background: step.gradient, borderColor: step.border }}>
              <div className="text-4xl mb-4">{step.icon}</div>
              <h3 className="text-lg font-semibold text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>{step.title}</h3>
              <p className="text-sm" style={{ color: '#94a3b8' }}>{step.desc}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Trust Bar */}
      <div className="py-8 px-4 relative z-10" style={{ borderTop: '1px solid rgba(148,163,184,0.08)' }}>
        <div className="max-w-5xl mx-auto flex flex-wrap items-center justify-center gap-8 md:gap-16">
          {[
            { num: '15+', label: 'Hospitals' },
            { num: '5', label: 'Cities' },
            { num: '6+', label: 'Specializations' },
            { num: 'AI', label: 'Powered Rankings' },
          ].map((stat, i) => (
            <div key={i} className="text-center">
              <div className="text-2xl font-bold" style={{ color: '#2dd4bf', fontFamily: 'Outfit, sans-serif' }}>{stat.num}</div>
              <div className="text-xs" style={{ color: '#64748b' }}>{stat.label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Footer Disclaimer */}
      <div className="py-6 px-4 text-center relative z-10" style={{ borderTop: '1px solid rgba(148,163,184,0.08)' }}>
        <p className="text-xs max-w-2xl mx-auto" style={{ color: '#475569' }}>
          ⚕️ MedCompare provides estimated costs for informational purposes only. We are not a healthcare provider. 
          Always consult qualified healthcare professionals before making medical decisions. Cost estimates are approximate 
          and may vary based on individual conditions.
        </p>
      </div>
    </div>
  );
}

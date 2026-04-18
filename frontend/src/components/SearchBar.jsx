import { useState } from 'react';

const EXAMPLE_QUERIES = [
  "knee pain Pune under 2 lakh",
  "heart surgery Mumbai budget 5 lakh",
  "cataract surgery Chennai",
  "back pain Delhi under 3 lakh",
  "cancer treatment Bangalore",
];

export default function SearchBar({ onSearch, loading = false }) {
  const [query, setQuery] = useState('');
  const [placeholderIdx, setPlaceholderIdx] = useState(0);

  // Rotate placeholder
  useState(() => {
    const interval = setInterval(() => {
      setPlaceholderIdx(prev => (prev + 1) % EXAMPLE_QUERIES.length);
    }, 3000);
    return () => clearInterval(interval);
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (query.trim() && onSearch) {
      onSearch(query.trim());
    }
  };

  const handleChipClick = (text) => {
    setQuery(text);
    if (onSearch) onSearch(text);
  };

  return (
    <div className="w-full max-w-3xl mx-auto">
      {/* Search Form */}
      <form onSubmit={handleSubmit} className="relative glow-border" style={{ borderRadius: '16px' }}>
        <div className="flex items-center gap-3 search-input px-5 py-4" style={{ borderRadius: '16px' }}>
          {/* Search Icon */}
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2" strokeLinecap="round" className="flex-shrink-0">
            <circle cx="11" cy="11" r="8"/>
            <path d="M21 21l-4.35-4.35"/>
          </svg>

          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder={`Try "${EXAMPLE_QUERIES[placeholderIdx]}"`}
            className="flex-1 bg-transparent border-none outline-none text-white text-lg"
            style={{ fontFamily: 'Inter, sans-serif' }}
            disabled={loading}
            id="main-search-input"
          />

          <button
            type="submit"
            className="btn-primary flex items-center gap-2 text-base"
            disabled={loading || !query.trim()}
            style={{ opacity: (!query.trim() || loading) ? 0.5 : 1 }}
            id="search-button"
          >
            {loading ? (
              <>
                <svg className="animate-spin" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
                </svg>
                Searching...
              </>
            ) : (
              <>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                  <circle cx="11" cy="11" r="8"/>
                  <path d="M21 21l-4.35-4.35"/>
                </svg>
                Search
              </>
            )}
          </button>
        </div>
      </form>

      {/* Quick Category Chips */}
      <div className="flex flex-wrap justify-center gap-2 mt-5">
        {[
          { label: '🦴 Orthopedics', query: 'knee replacement Pune' },
          { label: '❤️ Cardiology', query: 'heart surgery Mumbai' },
          { label: '👁️ Eye Care', query: 'cataract surgery Chennai' },
          { label: '🧠 Neurology', query: 'brain treatment Delhi' },
          { label: '🎗️ Oncology', query: 'cancer treatment Bangalore' },
        ].map((chip) => (
          <button
            key={chip.label}
            onClick={() => handleChipClick(chip.query)}
            className="px-4 py-2 rounded-full text-sm font-medium transition-all cursor-pointer"
            style={{
              background: 'rgba(30, 41, 59, 0.6)',
              border: '1px solid rgba(148, 163, 184, 0.15)',
              color: '#94a3b8',
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = 'rgba(20, 184, 166, 0.4)';
              e.target.style.color = '#2dd4bf';
              e.target.style.background = 'rgba(20, 184, 166, 0.08)';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = 'rgba(148, 163, 184, 0.15)';
              e.target.style.color = '#94a3b8';
              e.target.style.background = 'rgba(30, 41, 59, 0.6)';
            }}
            disabled={loading}
          >
            {chip.label}
          </button>
        ))}
      </div>
    </div>
  );
}

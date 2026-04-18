import { useState } from 'react';
import Navbar from './components/Navbar';
import HomePage from './pages/HomePage';
import ResultsPage from './pages/ResultsPage';
import { searchTreatments } from './utils/api';

export default function App() {
  const [page, setPage] = useState('home'); // 'home' | 'results'
  const [searchResults, setSearchResults] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleSearch = async (query) => {
    setLoading(true);
    setError(null);

    try {
      const data = await searchTreatments(query);
      setSearchResults(data);
      setPage('results');
    } catch (err) {
      console.error('Search failed:', err);
      setError(err.message || 'Search failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleGoHome = () => {
    setPage('home');
    setSearchResults(null);
    setError(null);
  };

  return (
    <div className="min-h-screen" style={{ background: '#020617' }}>
      <Navbar onGoHome={handleGoHome} />

      {/* Error Toast */}
      {error && (
        <div className="fixed top-20 left-1/2 -translate-x-1/2 z-50 max-w-md w-full mx-4 animate-[slideUp_0.3s_ease]">
          <div className="glass-card p-4 flex items-center gap-3"
               style={{ background: 'rgba(244,63,94,0.15)', border: '1px solid rgba(244,63,94,0.3)' }}>
            <span className="text-xl">⚠️</span>
            <div className="flex-1">
              <p className="text-sm font-medium text-white">Search Error</p>
              <p className="text-xs" style={{ color: '#fb7185' }}>{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-slate-400 hover:text-white transition-colors cursor-pointer"
              style={{ background: 'none', border: 'none' }}
            >
              ✕
            </button>
          </div>
        </div>
      )}

      {/* Loading Overlay */}
      {loading && page === 'home' && (
        <div className="fixed inset-0 z-40 flex items-center justify-center" style={{ background: 'rgba(2,6,23,0.8)', backdropFilter: 'blur(4px)' }}>
          <div className="glass-card p-8 text-center" style={{ animation: 'slideUp 0.3s ease' }}>
            <div className="mb-4">
              <svg className="mx-auto" width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2" style={{ animation: 'spin 2s linear infinite' }}>
                <path d="M12 2v4M12 18v4M4.93 4.93l2.83 2.83M16.24 16.24l2.83 2.83M2 12h4M18 12h4M4.93 19.07l2.83-2.83M16.24 7.76l2.83-2.83"/>
              </svg>
            </div>
            <h3 className="text-lg font-semibold text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Finding the best hospitals...
            </h3>
            <div className="space-y-2 text-sm" style={{ color: '#94a3b8' }}>
              <p className="flex items-center gap-2 justify-center">
                <span style={{ color: '#14b8a6' }}>✓</span> Understanding your query
              </p>
              <p className="flex items-center gap-2 justify-center" style={{ animation: 'pulse 1.5s ease infinite' }}>
                <span>🔄</span> Searching hospitals & ranking
              </p>
              <p className="flex items-center gap-2 justify-center" style={{ opacity: 0.5 }}>
                <span>⏳</span> Calculating costs
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Pages */}
      {page === 'home' && (
        <HomePage onSearch={handleSearch} loading={loading} />
      )}

      {page === 'results' && searchResults && (
        <ResultsPage data={searchResults} onSearch={handleSearch} loading={loading} />
      )}
    </div>
  );
}

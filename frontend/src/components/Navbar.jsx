import { useState } from 'react';

export default function Navbar() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50 glass" style={{ borderRadius: 0, borderTop: 'none', borderLeft: 'none', borderRight: 'none' }}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <a href="/" className="flex items-center gap-3 no-underline">
            <div className="w-10 h-10 rounded-xl flex items-center justify-center"
                 style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
              </svg>
            </div>
            <span className="text-xl font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
              Med<span style={{ color: '#14b8a6' }}>Compare</span>
            </span>
          </a>

          {/* Desktop Links */}
          <div className="hidden md:flex items-center gap-8">
            <a href="/" className="text-sm text-slate-400 hover:text-teal-400 transition-colors no-underline">Home</a>
            <a href="#" className="text-sm text-slate-400 hover:text-teal-400 transition-colors no-underline">How it Works</a>
            <a href="#" className="text-sm text-slate-400 hover:text-teal-400 transition-colors no-underline">About</a>
            <span className="text-xs px-3 py-1 rounded-full" style={{ background: 'rgba(20,184,166,0.15)', color: '#2dd4bf', border: '1px solid rgba(20,184,166,0.3)' }}>
              AI-Powered
            </span>
          </div>

          {/* Mobile menu button */}
          <button
            className="md:hidden text-slate-400 hover:text-white transition-colors"
            onClick={() => setMenuOpen(!menuOpen)}
            style={{ background: 'none', border: 'none', cursor: 'pointer' }}
          >
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              {menuOpen ? (
                <path d="M18 6L6 18M6 6l12 12"/>
              ) : (
                <path d="M4 6h16M4 12h16M4 18h16"/>
              )}
            </svg>
          </button>
        </div>

        {/* Mobile menu */}
        {menuOpen && (
          <div className="md:hidden pb-4 flex flex-col gap-3">
            <a href="/" className="text-sm text-slate-400 hover:text-teal-400 transition-colors no-underline py-2">Home</a>
            <a href="#" className="text-sm text-slate-400 hover:text-teal-400 transition-colors no-underline py-2">How it Works</a>
            <a href="#" className="text-sm text-slate-400 hover:text-teal-400 transition-colors no-underline py-2">About</a>
          </div>
        )}
      </div>
    </nav>
  );
}

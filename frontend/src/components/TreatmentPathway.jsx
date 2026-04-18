const STAGE_CONFIG = {
  symptoms: { color: '#f43f5e', icon: '🩺', bg: 'rgba(244,63,94,0.1)' },
  diagnosis: { color: '#f59e0b', icon: '🔍', bg: 'rgba(245,158,11,0.1)' },
  treatment: { color: '#14b8a6', icon: '💉', bg: 'rgba(20,184,166,0.1)' },
  recovery: { color: '#10b981', icon: '🌱', bg: 'rgba(16,185,129,0.1)' },
};

export default function TreatmentPathway({ pathway }) {
  if (!pathway || !pathway.steps || pathway.steps.length === 0) return null;

  return (
    <div className="glass-card p-5" id="treatment-pathway">
      <h3 className="text-base font-semibold text-white mb-4 flex items-center gap-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#14b8a6" strokeWidth="2">
          <path d="M22 12h-4l-3 9L9 3l-3 9H2"/>
        </svg>
        Treatment Pathway
      </h3>
      <p className="text-sm mb-4" style={{ color: '#94a3b8' }}>
        {pathway.condition} → {pathway.procedure}
      </p>

      {/* Steps */}
      <div className="relative">
        {/* Connector line */}
        <div className="absolute left-5 top-8 bottom-8 w-0.5" style={{ background: 'linear-gradient(180deg, #f43f5e, #f59e0b, #14b8a6, #10b981)' }} />

        <div className="space-y-4">
          {pathway.steps.map((step, i) => {
            const config = STAGE_CONFIG[step.stage] || STAGE_CONFIG.treatment;

            return (
              <div key={i} className="flex items-start gap-4 relative">
                {/* Stage indicator */}
                <div className="w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 z-10 text-lg"
                     style={{ background: config.bg, border: `1px solid ${config.color}30` }}>
                  {config.icon}
                </div>

                {/* Content */}
                <div className="flex-1 pb-2">
                  <div className="flex items-center gap-2 mb-1">
                    <h4 className="text-sm font-semibold text-white">{step.title}</h4>
                    {step.duration && (
                      <span className="text-xs px-2 py-0.5 rounded" style={{ background: config.bg, color: config.color }}>
                        {step.duration}
                      </span>
                    )}
                  </div>
                  <p className="text-xs leading-relaxed" style={{ color: '#94a3b8' }}>
                    {step.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

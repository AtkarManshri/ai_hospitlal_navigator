import { useState, useMemo } from 'react';
import SearchBar from '../components/SearchBar';
import HospitalCard from '../components/HospitalCard';
import FilterPanel from '../components/FilterPanel';
import CompareModal from '../components/CompareModal';
import CostBreakdown from '../components/CostBreakdown';
import TreatmentPathway from '../components/TreatmentPathway';
import ConfidenceBadge from '../components/ConfidenceBadge';
import SchemeEligibility from '../components/SchemeEligibility';

export default function ResultsPage({ data, onSearch, loading }) {
  const [filters, setFilters] = useState({
    budget: 2000000,
    maxDistance: 100,
    hospitalType: null,
    schemeOnly: false,
  });
  const [selectedForCompare, setSelectedForCompare] = useState([]);
  const [showCompare, setShowCompare] = useState(false);
  const [selectedCostHospital, setSelectedCostHospital] = useState(0);

  const { intent, hospitals, cost_estimates, treatment_pathway, schemes, disclaimer } = data;

  // Apply client-side filters
  const filteredHospitals = useMemo(() => {
    return hospitals.filter(h => {
      const hosp = h.hospital;

      // Budget filter
      if (hosp.avg_cost_range.min > filters.budget) return false;

      // Distance filter
      if (hosp.distance > filters.maxDistance) return false;

      // Hospital type
      if (filters.hospitalType && hosp.hospital_type !== filters.hospitalType) return false;

      // Scheme only
      if (filters.schemeOnly && !hosp.scheme_supported) return false;

      return true;
    });
  }, [hospitals, filters]);

  const getCostForHospital = (hospitalId) => {
    return cost_estimates?.find(c => c.hospital_id === hospitalId);
  };

  const toggleCompare = (hospitalId) => {
    setSelectedForCompare(prev => {
      if (prev.includes(hospitalId)) {
        return prev.filter(id => id !== hospitalId);
      }
      if (prev.length >= 4) return prev;
      return [...prev, hospitalId];
    });
  };

  const compareHospitals = filteredHospitals.filter(h =>
    selectedForCompare.includes(h.hospital.hospital_id)
  );

  return (
    <div className="min-h-screen pt-20 pb-12 px-4" style={{ background: 'linear-gradient(180deg, #020617, #0f172a)' }}>
      <div className="max-w-7xl mx-auto">
        {/* Top Search Bar */}
        <div className="mb-8">
          <SearchBar onSearch={onSearch} loading={loading} />
        </div>

        {/* Results Header */}
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-bold text-white" style={{ fontFamily: 'Outfit, sans-serif' }}>
                {intent.procedure}
              </h1>
              <ConfidenceBadge score={intent.confidence} />
            </div>
            <p className="text-sm" style={{ color: '#94a3b8' }}>
              <span style={{ color: '#2dd4bf' }}>{intent.condition}</span> • {intent.location}
              {intent.budget && <> • Budget: <span style={{ color: '#2dd4bf' }}>₹{(intent.budget / 100000).toFixed(1)}L</span></>}
            </p>
          </div>
          <div className="text-sm" style={{ color: '#64748b' }}>
            {filteredHospitals.length} hospital{filteredHospitals.length !== 1 ? 's' : ''} found
          </div>
        </div>

        {/* Main Layout */}
        <div className="flex flex-col lg:flex-row gap-6">
          {/* Left Sidebar — Filters */}
          <div className="w-full lg:w-64 flex-shrink-0">
            <div className="lg:sticky lg:top-20">
              <FilterPanel filters={filters} onFilterChange={setFilters} />
            </div>
          </div>

          {/* Center — Hospital Cards */}
          <div className="flex-1 min-w-0">
            {filteredHospitals.length === 0 ? (
              <div className="glass-card p-12 text-center">
                <div className="text-5xl mb-4">🏥</div>
                <h3 className="text-lg font-semibold text-white mb-2" style={{ fontFamily: 'Outfit, sans-serif' }}>
                  No Hospitals Found
                </h3>
                <p className="text-sm" style={{ color: '#94a3b8' }}>
                  Try adjusting your filters or search for a different location.
                </p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredHospitals.map((h) => (
                  <HospitalCard
                    key={h.hospital.hospital_id}
                    hospital={h.hospital}
                    rank={h.rank}
                    scores={h.scores}
                    tags={h.tags}
                    explanation={h.ranking_explanation}
                    costEstimate={getCostForHospital(h.hospital.hospital_id)}
                    isSelected={selectedForCompare.includes(h.hospital.hospital_id)}
                    onToggleCompare={() => toggleCompare(h.hospital.hospital_id)}
                  />
                ))}
              </div>
            )}
          </div>

          {/* Right Sidebar — Cost, Pathway, Schemes */}
          <div className="w-full lg:w-80 flex-shrink-0 space-y-6">
            {/* Cost Breakdown */}
            {cost_estimates && cost_estimates.length > 0 && (
              <div>
                {/* Hospital selector for cost view */}
                {cost_estimates.length > 1 && (
                  <div className="mb-2">
                    <select
                      value={selectedCostHospital}
                      onChange={(e) => setSelectedCostHospital(parseInt(e.target.value))}
                      className="w-full px-3 py-2 rounded-lg text-sm text-white"
                      style={{ background: 'rgba(30,41,59,0.8)', border: '1px solid rgba(148,163,184,0.2)', outline: 'none' }}
                    >
                      {cost_estimates.map((ce, i) => (
                        <option key={ce.hospital_id} value={i}>
                          {ce.hospital_name}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <CostBreakdown costEstimate={cost_estimates[selectedCostHospital]} />
              </div>
            )}

            {/* Treatment Pathway */}
            <TreatmentPathway pathway={treatment_pathway} />

            {/* Scheme Eligibility */}
            {schemes && schemes.length > 0 && (
              <SchemeEligibility scheme={schemes[0]} />
            )}

            {/* Disclaimer */}
            <div className="p-4 rounded-xl" style={{ background: 'rgba(245,158,11,0.06)', border: '1px solid rgba(245,158,11,0.15)' }}>
              <p className="text-xs leading-relaxed" style={{ color: '#fbbf24' }}>
                ⚠️ {disclaimer}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Compare Floating Bar */}
      {selectedForCompare.length >= 2 && (
        <div className="fixed bottom-0 left-0 right-0 z-50 glass py-4 px-6"
             style={{ borderRadius: '20px 20px 0 0', borderBottom: 'none' }}>
          <div className="max-w-7xl mx-auto flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-sm font-medium text-white">
                {selectedForCompare.length} hospitals selected
              </span>
              <div className="flex -space-x-2">
                {compareHospitals.slice(0, 4).map(h => (
                  <div key={h.hospital.hospital_id}
                       className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white"
                       style={{ background: 'linear-gradient(135deg, #14b8a6, #0d9488)', border: '2px solid #0f172a' }}>
                    {h.rank}
                  </div>
                ))}
              </div>
            </div>
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSelectedForCompare([])}
                className="btn-secondary text-sm"
              >
                Clear
              </button>
              <button
                onClick={() => setShowCompare(true)}
                className="btn-primary text-sm flex items-center gap-2"
              >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M16 3h5v5M8 3H3v5M3 16v5h5M21 16v5h-5"/>
                </svg>
                Compare Now
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Compare Modal */}
      {showCompare && (
        <CompareModal
          hospitals={compareHospitals}
          costEstimates={cost_estimates}
          procedure={intent.procedure}
          onClose={() => setShowCompare(false)}
        />
      )}
    </div>
  );
}

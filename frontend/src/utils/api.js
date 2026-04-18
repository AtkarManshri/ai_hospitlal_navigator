/**
 * API utility for MedCompare frontend.
 * All backend communication goes through these functions.
 */

const API_BASE = '/api';

async function request(endpoint, options = {}) {
  const url = `${API_BASE}${endpoint}`;
  const config = {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  };

  const response = await fetch(url, config);

  if (!response.ok) {
    const error = await response.json().catch(() => ({ detail: 'Request failed' }));
    throw new Error(error.detail || `HTTP ${response.status}`);
  }

  return response.json();
}

/**
 * Main search — sends natural language query, returns ranked hospitals + costs + pathway
 */
export async function searchTreatments(query, age = null, comorbidities = []) {
  return request('/search', {
    method: 'POST',
    body: JSON.stringify({ query, age, comorbidities }),
  });
}

/**
 * Get detailed cost breakdown for a specific hospital + procedure
 */
export async function getCostBreakdown(hospitalId, procedure, city, age = null, comorbidities = []) {
  return request('/cost', {
    method: 'POST',
    body: JSON.stringify({
      hospital_id: hospitalId,
      procedure,
      city,
      age,
      comorbidities,
    }),
  });
}

/**
 * Compare multiple hospitals side by side
 */
export async function compareHospitals(hospitalIds, procedure) {
  return request('/compare', {
    method: 'POST',
    body: JSON.stringify({
      hospital_ids: hospitalIds,
      procedure,
    }),
  });
}

/**
 * List/filter hospitals
 */
export async function listHospitals(city = null, specialization = null, hospitalType = null) {
  const params = new URLSearchParams();
  if (city) params.append('city', city);
  if (specialization) params.append('specialization', specialization);
  if (hospitalType) params.append('hospital_type', hospitalType);

  const qs = params.toString();
  return request(`/hospitals${qs ? `?${qs}` : ''}`);
}

/**
 * Check scheme eligibility
 */
export async function checkSchemes(procedure, city = null) {
  const params = new URLSearchParams({ procedure });
  if (city) params.append('city', city);
  return request(`/schemes?${params.toString()}`);
}

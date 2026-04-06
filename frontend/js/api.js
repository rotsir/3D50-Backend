/**
 * API Client — centralized fetch wrapper
 * Automatically attaches JWT, handles errors, and returns parsed JSON.
 */

const API_BASE = window.location.hostname === "localhost" || window.location.hostname === "127.0.0.1"
  ? "http://localhost:5000/api"
  : "https://RENDER_API_URL/api";

/**
 * Core fetch wrapper.
 * @param {string} endpoint  - e.g. '/products'
 * @param {object} options   - fetch options
 * @returns {Promise<any>}   - parsed JSON response
 * @throws {Error}           - with a user-friendly message
 */
async function apiFetch(endpoint, options = {}) {
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...options.headers,
  };

  // Don't set Content-Type for FormData (browser sets multipart boundary)
  if (options.body instanceof FormData) {
    delete headers['Content-Type'];
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  let data;
  try {
    data = await response.json();
  } catch {
    throw new Error('Invalid server response');
  }

  if (!response.ok) {
    const message = data?.error || data?.message || `Request failed (${response.status})`;
    const err = new Error(message);
    err.status = response.status;
    err.data   = data;
    throw err;
  }

  return data;
}

// ── Convenience wrappers ────────────────────────
export const api = {
  get:    (endpoint, params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return apiFetch(`${endpoint}${qs ? '?' + qs : ''}`);
  },
  post:   (endpoint, body) =>
    apiFetch(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put:    (endpoint, body) =>
    apiFetch(endpoint, { method: 'PUT',  body: JSON.stringify(body) }),
  delete: (endpoint) =>
    apiFetch(endpoint, { method: 'DELETE' }),
  postForm: (endpoint, formData) =>
    apiFetch(endpoint, { method: 'POST', body: formData }),
  putForm: (endpoint, formData) =>
    apiFetch(endpoint, { method: 'PUT', body: formData }),
};

export default api;

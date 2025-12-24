export const DEFAULT_API_BASE = process.env.REACT_APP_STRAPI_API || 'http://localhost:1337/api';

export const getApiBase = () => {
  if (typeof window === 'undefined') return DEFAULT_API_BASE;
  return window.localStorage.getItem('tv_api_base') || DEFAULT_API_BASE;
};

export const setApiBase = (value) => {
  if (typeof window === 'undefined') return;
  window.localStorage.setItem('tv_api_base', value);
};

export const getStrapiOrigin = () => {
  const apiBase = getApiBase();
  return apiBase.endsWith('/api') ? apiBase.slice(0, -4) : apiBase;
};

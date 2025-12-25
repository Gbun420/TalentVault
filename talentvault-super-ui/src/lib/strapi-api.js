import { getAuthToken } from '@/lib/auth-server';

const API_BASE = process.env.STRAPI_API_URL || process.env.NEXT_PUBLIC_STRAPI_API || 'http://localhost:1337/api';

export const strapiFetch = async (path, options = {}) => {
  const token = getAuthToken();
  if (!token) {
    throw new Error('unauthorized');
  }

  const response = await fetch(`${API_BASE}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
      ...(options.headers || {}),
    },
  });

  const payload = await response.json().catch(() => ({}));
  if (!response.ok) {
    const message = payload?.error?.message || `Request failed: ${response.status}`;
    throw new Error(message);
  }

  return payload;
};

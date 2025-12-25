import { cookies } from 'next/headers';

const API_BASE = process.env.STRAPI_API_URL || process.env.NEXT_PUBLIC_STRAPI_API || 'http://localhost:1337/api';

const fetchJson = async (path, options = {}) => {
  const token = cookies().get('tv_jwt')?.value;
  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
    ...(options.headers || {}),
  };

  const response = await fetch(`${API_BASE}${path}`, {
    cache: 'no-store',
    ...options,
    headers,
  });

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status}`);
  }

  return response.json();
};

export const getStats = async () => {
  const [jobs, candidates, companies, articles] = await Promise.all([
    fetchJson('/jobs?pagination[pageSize]=1'),
    fetchJson('/candidate-profiles?pagination[pageSize]=1'),
    fetchJson('/companies?pagination[pageSize]=1'),
    fetchJson('/articles?pagination[pageSize]=1'),
  ]);

  return {
    jobs: jobs?.meta?.pagination?.total || 0,
    candidates: candidates?.meta?.pagination?.total || 0,
    companies: companies?.meta?.pagination?.total || 0,
    insights: articles?.meta?.pagination?.total || 0,
  };
};

export const getJobs = () =>
  fetchJson('/jobs?populate=company,skills,location&sort[0]=postedAt:desc&pagination[pageSize]=50');

export const getCandidates = () =>
  fetchJson(
    '/candidate-profiles?populate=skills,location,profilePhoto&sort[0]=createdAt:desc&pagination[pageSize]=50'
  );

export const getCompanies = () =>
  fetchJson('/companies?populate=industry,location&sort[0]=name:asc&pagination[pageSize]=50');

export const getSkills = () => fetchJson('/skills?sort[0]=name:asc&pagination[pageSize]=200');

export { API_BASE };

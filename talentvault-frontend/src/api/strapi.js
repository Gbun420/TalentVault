import { getApiBase } from '../config/api';

const buildUrl = (path, query) => (query ? `${path}?${query}` : path);

export const fetchCollection = async (path, query) => {
  const apiBase = getApiBase();
  const response = await fetch(`${apiBase}${buildUrl(path, query)}`);
  if (!response.ok) {
    throw new Error(`Failed to fetch ${path}: ${response.status}`);
  }
  return response.json();
};

export const fetchStats = async () => {
  const [jobs, candidates, companies, articles] = await Promise.all([
    fetchCollection('/jobs', 'pagination[pageSize]=1'),
    fetchCollection('/candidate-profiles', 'pagination[pageSize]=1'),
    fetchCollection('/companies', 'pagination[pageSize]=1'),
    fetchCollection('/articles', 'pagination[pageSize]=1'),
  ]);

  return {
    jobs: jobs?.meta?.pagination?.total || 0,
    candidates: candidates?.meta?.pagination?.total || 0,
    companies: companies?.meta?.pagination?.total || 0,
    insights: articles?.meta?.pagination?.total || 0,
  };
};

export const fetchJobs = () =>
  fetchCollection(
    '/jobs',
    'populate=company,skills,location&sort[0]=postedAt:desc&pagination[pageSize]=50'
  );

export const fetchCandidates = () =>
  fetchCollection(
    '/candidate-profiles',
    'populate=skills,location,profilePhoto&sort[0]=createdAt:desc&pagination[pageSize]=50'
  );

export const fetchCompanies = () =>
  fetchCollection(
    '/companies',
    'populate=industry,location&sort[0]=name:asc&pagination[pageSize]=50'
  );

export const fetchSkills = () =>
  fetchCollection('/skills', 'sort[0]=name:asc&pagination[pageSize]=200');

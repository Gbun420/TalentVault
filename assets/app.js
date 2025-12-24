const DEFAULT_API_BASE = 'http://localhost:1337/api';
const runtimeConfig =
  typeof window !== 'undefined' && window.TALENTVAULT_CONFIG ? window.TALENTVAULT_CONFIG : {};
const API_BASE = runtimeConfig.API_BASE || DEFAULT_API_BASE;
const API_ORIGIN = API_BASE.endsWith('/api') ? API_BASE.slice(0, -4) : API_BASE;

const htmlEscapeMap = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

function escapeHtml(value) {
  return String(value || '').replace(/[&<>"']/g, (char) => htmlEscapeMap[char]);
}

async function fetchData(endpoint) {
  try {
    const response = await fetch(`${API_BASE}${endpoint}`);
    if (!response.ok) throw new Error(`HTTP ${response.status}`);
    return await response.json();
  } catch (error) {
    console.error(`Error fetching ${endpoint}:`, error);
    return null;
  }
}

function formatLocation(location) {
  if (!location) return 'Remote';
  const parts = [location.city, location.region, location.country].filter(Boolean);
  return parts.length ? parts.join(', ') : 'Remote';
}

function formatSalary(range) {
  if (!range || (!range.min && !range.max)) return 'Salary TBD';
  const min = range.min ? `$${Number(range.min).toLocaleString()}` : '';
  const max = range.max ? `$${Number(range.max).toLocaleString()}` : '';
  const spacer = min && max ? ' - ' : '';
  const period = range.period ? ` / ${range.period}` : '';
  return `${min}${spacer}${max}${period}`.trim();
}

function formatEnum(value) {
  if (!value) return '';
  return value
    .split('_')
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(' ');
}

function formatDate(value) {
  if (!value) return '';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

function getMediaUrl(media) {
  if (!media) return '';
  const candidate = Array.isArray(media) ? media[0] : media;
  if (!candidate || !candidate.url) return '';
  if (candidate.url.startsWith('http')) return candidate.url;
  return `${API_ORIGIN}${candidate.url}`;
}

function renderList(container, items, renderItem, emptyMessage) {
  if (!container) return;
  if (!items || items.length === 0) {
    container.innerHTML = `<div class="empty">${escapeHtml(emptyMessage)}</div>`;
    return;
  }
  container.innerHTML = items.map(renderItem).join('');
}

function buildJobCard(job, options = {}) {
  const companyName = escapeHtml(job.company?.name || 'Confidential');
  const location = escapeHtml(formatLocation(job.location));
  const salary = escapeHtml(formatSalary(job.salaryRange));
  const employment = escapeHtml(formatEnum(job.employmentType) || 'Role');
  const remote = escapeHtml(formatEnum(job.remoteType) || '');
  const experience = escapeHtml(formatEnum(job.experienceLevel) || '');
  const posted = escapeHtml(formatDate(job.postedAt));
  const tags = (job.skills || [])
    .slice(0, 4)
    .map((skill) => `<span class="tag">${escapeHtml(skill.name)}</span>`)
    .join('');
  const status = escapeHtml(formatEnum(job.status) || 'Open');
  const applyLink = job.applyUrl
    ? { url: job.applyUrl, label: 'Apply' }
    : job.applyEmail
      ? { url: `mailto:${job.applyEmail}`, label: 'Email' }
      : null;
  const actions = options.showActions && applyLink
    ? `<div class="card-actions"><a class="btn secondary" href="${applyLink.url}" target="_blank" rel="noreferrer">${applyLink.label}</a></div>`
    : '';

  return `
    <article class="card">
      <div class="card-head">
        <div class="logo-badge">TV</div>
        <div>
          <h3>${escapeHtml(job.title || 'Untitled role')}</h3>
          <p>${companyName} - ${location}</p>
        </div>
      </div>
      <div class="meta">
        <span>${employment}</span>
        ${remote ? `<span>${remote}</span>` : ''}
        ${experience ? `<span>${experience}</span>` : ''}
        <span>${salary}</span>
      </div>
      <div class="tag-row">${tags || '<span class="tag">Curated</span>'}</div>
      <div class="meta">
        <span class="badge">${status}</span>
        ${posted ? `<span>Posted ${posted}</span>` : ''}
      </div>
      ${actions}
    </article>
  `;
}

function buildTalentCard(profile) {
  const location = escapeHtml(formatLocation(profile.location));
  const availability = escapeHtml(formatEnum(profile.availability) || 'Open');
  const years = profile.yearsExperience ? `${profile.yearsExperience}+ yrs` : 'Experience';
  const salary = escapeHtml(formatSalary(profile.desiredSalary));
  const skills = (profile.skills || [])
    .slice(0, 4)
    .map((skill) => `<span class="tag">${escapeHtml(skill.name)}</span>`)
    .join('');
  const photoUrl = getMediaUrl(profile.profilePhoto);
  const avatar = photoUrl
    ? `<img class="avatar" src="${photoUrl}" alt="${escapeHtml(profile.fullName)}" />`
    : `<div class="avatar placeholder">TV</div>`;

  return `
    <article class="card">
      <div class="card-head">
        ${avatar}
        <div>
          <h3>${escapeHtml(profile.fullName || 'Talent')}</h3>
          <p>${escapeHtml(profile.headline || 'Talent profile')}</p>
        </div>
      </div>
      <div class="meta">
        <span>${location}</span>
        <span>${availability}</span>
        <span>${escapeHtml(years)}</span>
      </div>
      <div class="meta">
        <span>${salary}</span>
      </div>
      <div class="tag-row">${skills || '<span class="tag">Verified</span>'}</div>
    </article>
  `;
}

function buildCompanyCard(company) {
  const location = escapeHtml(formatLocation(company.location));
  const industry = escapeHtml(company.industry?.name || 'Company');
  const size = escapeHtml(formatEnum(company.size) || 'Team');
  const logoUrl = getMediaUrl(company.logo);
  const logo = logoUrl
    ? `<img class="avatar" src="${logoUrl}" alt="${escapeHtml(company.name)}" />`
    : `<div class="avatar placeholder">${escapeHtml(company.name?.slice(0, 2) || 'CO')}</div>`;

  return `
    <article class="card">
      <div class="card-head">
        ${logo}
        <div>
          <h3>${escapeHtml(company.name || 'Company')}</h3>
          <p>${industry}</p>
        </div>
      </div>
      <div class="meta">
        <span>${location}</span>
        <span>${size}</span>
        <span>${company.verified ? 'Verified' : 'Private'}</span>
      </div>
    </article>
  `;
}

function buildArticleCard(article) {
  const author = escapeHtml(article.author?.name || 'TalentVault');
  const published = escapeHtml(formatDate(article.publishDate || article.publishedAt));
  const excerpt = escapeHtml(article.excerpt || 'Insight from the TalentVault network.');

  return `
    <article class="card">
      <h3>${escapeHtml(article.title || 'Insight')}</h3>
      <p>${excerpt}</p>
      <div class="meta">
        <span>${author}</span>
        ${published ? `<span>${published}</span>` : ''}
      </div>
    </article>
  `;
}

async function loadStats() {
  const [jobsData, talentData, companiesData, insightsData] = await Promise.all([
    fetchData('/jobs'),
    fetchData('/candidate-profiles'),
    fetchData('/companies'),
    fetchData('/articles'),
  ]);

  const jobsCount = jobsData?.meta?.pagination?.total || 0;
  const talentCount = talentData?.meta?.pagination?.total || 0;
  const companiesCount = companiesData?.meta?.pagination?.total || 0;
  const insightsCount = insightsData?.meta?.pagination?.total || 0;

  const jobsCountEl = document.getElementById('jobs-count');
  const talentCountEl = document.getElementById('talent-count');
  const companiesCountEl = document.getElementById('companies-count');
  const insightsCountEl = document.getElementById('insights-count');

  if (jobsCountEl) jobsCountEl.textContent = jobsCount;
  if (talentCountEl) talentCountEl.textContent = talentCount;
  if (companiesCountEl) companiesCountEl.textContent = companiesCount;
  if (insightsCountEl) insightsCountEl.textContent = insightsCount;
}

async function loadSkills() {
  const container = document.getElementById('skills-container');
  const data = await fetchData('/skills?pagination[pageSize]=12&sort[0]=name:asc');
  if (!container) return;
  if (!data || data.data.length === 0) {
    container.innerHTML = '<div class="empty">No skills yet</div>';
    return;
  }
  container.innerHTML = data.data
    .map((skill) => `<span class="chip">${escapeHtml(skill.name)}</span>`)
    .join('');
}

async function loadFeaturedJobs() {
  const container = document.getElementById('home-jobs');
  if (!container) return;

  let data = await fetchData(
    '/jobs?populate=company,skills,location,salaryRange&filters[featured][$eq]=true&sort[0]=postedAt:desc&pagination[pageSize]=3'
  );
  if (!data || data.data.length === 0) {
    data = await fetchData('/jobs?populate=company,skills,location,salaryRange&sort[0]=postedAt:desc&pagination[pageSize]=3');
  }

  renderList(container, data?.data, (job) => buildJobCard(job), 'No jobs published yet');
}

async function loadFeaturedTalent() {
  const container = document.getElementById('home-talent');
  if (!container) return;

  let data = await fetchData(
    '/candidate-profiles?populate=skills,location,profilePhoto,desiredSalary&filters[featured][$eq]=true&sort[0]=createdAt:desc&pagination[pageSize]=3'
  );
  if (!data || data.data.length === 0) {
    data = await fetchData('/candidate-profiles?populate=skills,location,profilePhoto,desiredSalary&sort[0]=createdAt:desc&pagination[pageSize]=3');
  }

  renderList(container, data?.data, (profile) => buildTalentCard(profile), 'No talent profiles yet');
}

async function loadFeaturedCompanies() {
  const container = document.getElementById('home-companies');
  if (!container) return;

  let data = await fetchData(
    '/companies?populate=industry,location,logo&filters[verified][$eq]=true&sort[0]=name:asc&pagination[pageSize]=4'
  );
  if (!data || data.data.length === 0) {
    data = await fetchData('/companies?populate=industry,location,logo&sort[0]=name:asc&pagination[pageSize]=4');
  }

  renderList(container, data?.data, (company) => buildCompanyCard(company), 'No companies yet');
}

async function loadInsights() {
  const container = document.getElementById('home-articles') || document.getElementById('articles-grid');
  if (!container) return;

  const data = await fetchData('/articles?populate=author&sort[0]=publishDate:desc&pagination[pageSize]=6');
  renderList(container, data?.data, (article) => buildArticleCard(article), 'No insights yet');
}

async function loadHome() {
  await Promise.all([
    loadStats(),
    loadSkills(),
    loadFeaturedJobs(),
    loadFeaturedTalent(),
    loadFeaturedCompanies(),
    loadInsights(),
  ]);
}

async function loadJobsPage() {
  const container = document.getElementById('jobs-grid');
  const resultCount = document.getElementById('jobs-results');
  const searchInput = document.getElementById('job-search');
  const typeSelect = document.getElementById('job-type');
  const remoteSelect = document.getElementById('job-remote');

  if (!container) return;

  const data = await fetchData(
    '/jobs?populate=company,skills,location,salaryRange&sort[0]=postedAt:desc&pagination[pageSize]=50'
  );
  const jobs = data?.data || [];

  const render = () => {
    const search = (searchInput?.value || '').trim().toLowerCase();
    const type = typeSelect?.value || '';
    const remote = remoteSelect?.value || '';

    const filtered = jobs.filter((job) => {
      const haystack = [
        job.title,
        job.company?.name,
        job.location?.city,
        job.location?.country,
        ...(job.skills || []).map((skill) => skill.name),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchSearch = !search || haystack.includes(search);
      const matchType = !type || job.employmentType === type;
      const matchRemote = !remote || job.remoteType === remote;

      return matchSearch && matchType && matchRemote;
    });

    if (resultCount) {
      resultCount.textContent = `${filtered.length} roles`;
    }

    renderList(
      container,
      filtered,
      (job) => buildJobCard(job, { showActions: true }),
      'No roles match your filters'
    );
  };

  if (searchInput) searchInput.addEventListener('input', render);
  if (typeSelect) typeSelect.addEventListener('change', render);
  if (remoteSelect) remoteSelect.addEventListener('change', render);

  render();
}

async function loadTalentPage() {
  const container = document.getElementById('talent-grid');
  const resultCount = document.getElementById('talent-results');
  const searchInput = document.getElementById('talent-search');
  const availabilitySelect = document.getElementById('talent-availability');

  if (!container) return;

  const data = await fetchData(
    '/candidate-profiles?populate=skills,location,profilePhoto,desiredSalary&sort[0]=createdAt:desc&pagination[pageSize]=50'
  );
  const profiles = data?.data || [];

  const render = () => {
    const search = (searchInput?.value || '').trim().toLowerCase();
    const availability = availabilitySelect?.value || '';

    const filtered = profiles.filter((profile) => {
      const haystack = [
        profile.fullName,
        profile.headline,
        profile.location?.city,
        profile.location?.country,
        ...(profile.skills || []).map((skill) => skill.name),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchSearch = !search || haystack.includes(search);
      const matchAvailability = !availability || profile.availability === availability;

      return matchSearch && matchAvailability;
    });

    if (resultCount) {
      resultCount.textContent = `${filtered.length} profiles`;
    }

    renderList(container, filtered, (profile) => buildTalentCard(profile), 'No profiles match your filters');
  };

  if (searchInput) searchInput.addEventListener('input', render);
  if (availabilitySelect) availabilitySelect.addEventListener('change', render);

  render();
}

async function loadCompaniesPage() {
  const container = document.getElementById('companies-grid');
  const resultCount = document.getElementById('companies-results');
  const searchInput = document.getElementById('company-search');
  const sizeSelect = document.getElementById('company-size');

  if (!container) return;

  const data = await fetchData('/companies?populate=industry,location,logo&sort[0]=name:asc&pagination[pageSize]=50');
  const companies = data?.data || [];

  const render = () => {
    const search = (searchInput?.value || '').trim().toLowerCase();
    const size = sizeSelect?.value || '';

    const filtered = companies.filter((company) => {
      const haystack = [company.name, company.industry?.name, company.location?.city, company.location?.country]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const matchSearch = !search || haystack.includes(search);
      const matchSize = !size || company.size === size;

      return matchSearch && matchSize;
    });

    if (resultCount) {
      resultCount.textContent = `${filtered.length} companies`;
    }

    renderList(container, filtered, (company) => buildCompanyCard(company), 'No companies match your filters');
  };

  if (searchInput) searchInput.addEventListener('input', render);
  if (sizeSelect) sizeSelect.addEventListener('change', render);

  render();
}

async function loadInsightsPage() {
  const container = document.getElementById('articles-grid');
  const resultCount = document.getElementById('insights-results');
  const searchInput = document.getElementById('insights-search');

  if (!container) return;

  const data = await fetchData('/articles?populate=author&sort[0]=publishDate:desc&pagination[pageSize]=50');
  const articles = data?.data || [];

  const render = () => {
    const search = (searchInput?.value || '').trim().toLowerCase();
    const filtered = articles.filter((article) => {
      if (!search) return true;
      const haystack = [article.title, article.excerpt, article.author?.name].filter(Boolean).join(' ').toLowerCase();
      return haystack.includes(search);
    });

    if (resultCount) {
      resultCount.textContent = `${filtered.length} insights`;
    }

    renderList(container, filtered, (article) => buildArticleCard(article), 'No insights match your search');
  };

  if (searchInput) searchInput.addEventListener('input', render);

  render();
}

document.addEventListener('DOMContentLoaded', () => {
  const page = document.body.dataset.page;
  if (page === 'home') loadHome();
  if (page === 'jobs') loadJobsPage();
  if (page === 'talent') loadTalentPage();
  if (page === 'companies') loadCompaniesPage();
  if (page === 'insights') loadInsightsPage();
});

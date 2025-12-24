import React, { useEffect, useState } from 'react';
import { Badge, Table } from '@themesberg/react-bootstrap';
import SectionCard from '../components/SectionCard';
import StatCard from '../components/StatCard';
import { fetchCollection, fetchStats } from '../api/strapi';
import { formatDate, formatEnum, formatLocation } from '../utils/formatters';

const Dashboard = () => {
  const [stats, setStats] = useState({ jobs: 0, candidates: 0, companies: 0, insights: 0 });
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [statsData, jobsData, candidatesData, companiesData] = await Promise.all([
          fetchStats(),
          fetchCollection(
            '/jobs',
            'populate=company,location&sort[0]=postedAt:desc&pagination[pageSize]=5'
          ),
          fetchCollection(
            '/candidate-profiles',
            'populate=skills,location&sort[0]=createdAt:desc&pagination[pageSize]=5'
          ),
          fetchCollection('/companies', 'populate=industry,location&sort[0]=name:asc&pagination[pageSize]=5'),
        ]);

        setStats(statsData);
        setJobs(jobsData?.data || []);
        setCandidates(candidatesData?.data || []);
        setCompanies(companiesData?.data || []);
      } catch (err) {
        setError(err.message || 'Unable to load dashboard data.');
      }
    };

    load();
  }, []);

  return (
    <div className="tv-grid">
      <div className="tv-grid-span">
        <div className="tv-stats">
          <StatCard title="Open roles" value={stats.jobs} subtitle="Live marketplace" />
          <StatCard title="Candidates" value={stats.candidates} subtitle="Verified profiles" />
          <StatCard title="Companies" value={stats.companies} subtitle="Active partners" />
          <StatCard title="Insights" value={stats.insights} subtitle="Published updates" />
        </div>
      </div>

      {error ? <div className="tv-alert">{error}</div> : null}

      <SectionCard
        title="Latest roles"
        subtitle="Most recent roles added to the vault"
      >
        <Table responsive className="tv-table">
          <thead>
            <tr>
              <th>Role</th>
              <th>Company</th>
              <th>Location</th>
              <th>Status</th>
              <th>Posted</th>
            </tr>
          </thead>
          <tbody>
            {jobs.map((job) => (
              <tr key={job.id}>
                <td>{job.title || 'Untitled role'}</td>
                <td>{job.company?.name || 'Confidential'}</td>
                <td>{formatLocation(job.location)}</td>
                <td>
                  <Badge bg="light" className="tv-badge">
                    {formatEnum(job.status)}
                  </Badge>
                </td>
                <td>{formatDate(job.postedAt)}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </SectionCard>

      <SectionCard
        title="New talent"
        subtitle="Recent candidates added to the network"
      >
        <Table responsive className="tv-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Headline</th>
              <th>Location</th>
              <th>Availability</th>
            </tr>
          </thead>
          <tbody>
            {candidates.map((candidate) => (
              <tr key={candidate.id}>
                <td>{candidate.fullName}</td>
                <td>{candidate.headline || 'Talent profile'}</td>
                <td>{formatLocation(candidate.location)}</td>
                <td>
                  <Badge bg="light" className="tv-badge">
                    {formatEnum(candidate.availability)}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </SectionCard>

      <SectionCard
        title="Partner companies"
        subtitle="Companies actively hiring"
      >
        <Table responsive className="tv-table">
          <thead>
            <tr>
              <th>Company</th>
              <th>Industry</th>
              <th>Location</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {companies.map((company) => (
              <tr key={company.id}>
                <td>{company.name}</td>
                <td>{company.industry?.name || 'Company'}</td>
                <td>{formatLocation(company.location)}</td>
                <td>
                  <Badge bg="light" className="tv-badge">
                    {company.verified ? 'Verified' : 'Private'}
                  </Badge>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </SectionCard>
    </div>
  );
};

export default Dashboard;

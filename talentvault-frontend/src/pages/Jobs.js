import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Button, Form, InputGroup, Table } from '@themesberg/react-bootstrap';
import SectionCard from '../components/SectionCard';
import { fetchJobs } from '../api/strapi';
import { formatDate, formatEnum, formatLocation, formatSalary } from '../utils/formatters';

const Jobs = () => {
  const [jobs, setJobs] = useState([]);
  const [query, setQuery] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [remoteFilter, setRemoteFilter] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchJobs()
      .then((data) => setJobs(data?.data || []))
      .catch((err) => setError(err.message || 'Unable to load jobs.'));
  }, []);

  const filteredJobs = useMemo(() => {
    return jobs.filter((job) => {
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

      const searchMatch = !query || haystack.includes(query.toLowerCase());
      const typeMatch = !typeFilter || job.employmentType === typeFilter;
      const remoteMatch = !remoteFilter || job.remoteType === remoteFilter;

      return searchMatch && typeMatch && remoteMatch;
    });
  }, [jobs, query, typeFilter, remoteFilter]);

  return (
    <div className="tv-grid">
      <SectionCard
        title="Roles in the vault"
        subtitle="Filter and triage active hiring pipelines"
        action={<Button variant="dark">Create role</Button>}
      >
        <div className="tv-filters">
          <InputGroup>
            <Form.Control
              placeholder="Search roles or companies"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </InputGroup>
          <Form.Select value={typeFilter} onChange={(event) => setTypeFilter(event.target.value)}>
            <option value="">All types</option>
            <option value="full_time">Full time</option>
            <option value="part_time">Part time</option>
            <option value="contract">Contract</option>
            <option value="internship">Internship</option>
            <option value="temporary">Temporary</option>
          </Form.Select>
          <Form.Select value={remoteFilter} onChange={(event) => setRemoteFilter(event.target.value)}>
            <option value="">All locations</option>
            <option value="remote">Remote</option>
            <option value="hybrid">Hybrid</option>
            <option value="onsite">Onsite</option>
          </Form.Select>
        </div>

        <div className="tv-table-meta">{filteredJobs.length} roles</div>
        {error ? <div className="tv-alert">{error}</div> : null}
        <Table responsive className="tv-table">
          <thead>
            <tr>
              <th>Role</th>
              <th>Company</th>
              <th>Location</th>
              <th>Type</th>
              <th>Comp</th>
              <th>Status</th>
              <th>Posted</th>
            </tr>
          </thead>
          <tbody>
            {filteredJobs.map((job) => (
              <tr key={job.id}>
                <td>{job.title || 'Untitled role'}</td>
                <td>{job.company?.name || 'Confidential'}</td>
                <td>{formatLocation(job.location)}</td>
                <td>{formatEnum(job.employmentType)}</td>
                <td>{formatSalary(job.salaryRange)}</td>
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
    </div>
  );
};

export default Jobs;

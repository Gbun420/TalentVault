import React, { useEffect, useMemo, useState } from 'react';
import { Badge, Form, InputGroup, Table } from '@themesberg/react-bootstrap';
import SectionCard from '../components/SectionCard';
import { fetchCandidates } from '../api/strapi';
import { formatEnum, formatLocation } from '../utils/formatters';

const Candidates = () => {
  const [candidates, setCandidates] = useState([]);
  const [query, setQuery] = useState('');
  const [availability, setAvailability] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCandidates()
      .then((data) => setCandidates(data?.data || []))
      .catch((err) => setError(err.message || 'Unable to load candidates.'));
  }, []);

  const filteredCandidates = useMemo(() => {
    return candidates.filter((candidate) => {
      const haystack = [
        candidate.fullName,
        candidate.headline,
        candidate.location?.city,
        candidate.location?.country,
        ...(candidate.skills || []).map((skill) => skill.name),
      ]
        .filter(Boolean)
        .join(' ')
        .toLowerCase();

      const searchMatch = !query || haystack.includes(query.toLowerCase());
      const availabilityMatch = !availability || candidate.availability === availability;

      return searchMatch && availabilityMatch;
    });
  }, [candidates, query, availability]);

  return (
    <div className="tv-grid">
      <SectionCard title="Candidate pipeline" subtitle="Monitor talent in the vault">
        <div className="tv-filters">
          <InputGroup>
            <Form.Control
              placeholder="Search name, skills, or headline"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
            />
          </InputGroup>
          <Form.Select value={availability} onChange={(event) => setAvailability(event.target.value)}>
            <option value="">All availability</option>
            <option value="immediate">Immediate</option>
            <option value="two_weeks">Two weeks</option>
            <option value="one_month">One month</option>
            <option value="three_months">Three months</option>
            <option value="open">Open</option>
          </Form.Select>
        </div>
        <div className="tv-table-meta">{filteredCandidates.length} profiles</div>
        {error ? <div className="tv-alert">{error}</div> : null}
        <Table responsive className="tv-table">
          <thead>
            <tr>
              <th>Candidate</th>
              <th>Headline</th>
              <th>Location</th>
              <th>Availability</th>
              <th>Resume score</th>
            </tr>
          </thead>
          <tbody>
            {filteredCandidates.map((candidate) => (
              <tr key={candidate.id}>
                <td>{candidate.fullName}</td>
                <td>{candidate.headline || 'Talent profile'}</td>
                <td>{formatLocation(candidate.location)}</td>
                <td>
                  <Badge bg="light" className="tv-badge">
                    {formatEnum(candidate.availability)}
                  </Badge>
                </td>
                <td>{candidate.resumeScore ?? 0}</td>
              </tr>
            ))}
          </tbody>
        </Table>
      </SectionCard>
    </div>
  );
};

export default Candidates;

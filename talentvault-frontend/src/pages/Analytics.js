import React, { useEffect, useMemo, useState } from 'react';
import { ProgressBar } from '@themesberg/react-bootstrap';
import SectionCard from '../components/SectionCard';
import StatCard from '../components/StatCard';
import { fetchCandidates, fetchJobs } from '../api/strapi';
import { formatEnum } from '../utils/formatters';

const Analytics = () => {
  const [jobs, setJobs] = useState([]);
  const [candidates, setCandidates] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    const load = async () => {
      try {
        const [jobsData, candidatesData] = await Promise.all([fetchJobs(), fetchCandidates()]);
        setJobs(jobsData?.data || []);
        setCandidates(candidatesData?.data || []);
      } catch (err) {
        setError(err.message || 'Unable to load analytics data.');
      }
    };

    load();
  }, []);

  const analytics = useMemo(() => {
    const totalJobs = jobs.length;
    const openJobs = jobs.filter((job) => job.status === 'open').length;
    const totalCandidates = candidates.length;
    const averageScore = totalCandidates
      ? candidates.reduce((sum, candidate) => sum + (Number(candidate.resumeScore) || 0), 0) /
        totalCandidates
      : 0;

    const skillCounts = new Map();
    jobs.forEach((job) => {
      (job.skills || []).forEach((skill) => {
        skillCounts.set(skill.name, (skillCounts.get(skill.name) || 0) + 1);
      });
    });
    candidates.forEach((candidate) => {
      (candidate.skills || []).forEach((skill) => {
        skillCounts.set(skill.name, (skillCounts.get(skill.name) || 0) + 1);
      });
    });

    const topSkills = Array.from(skillCounts.entries())
      .map(([name, count]) => ({ name, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 6);

    return {
      totalJobs,
      openJobs,
      totalCandidates,
      averageScore,
      topSkills,
    };
  }, [jobs, candidates]);

  return (
    <div className="tv-grid">
      <div className="tv-stats">
        <StatCard title="Total jobs" value={analytics.totalJobs} subtitle="All roles" />
        <StatCard title="Open jobs" value={analytics.openJobs} subtitle="Active pipelines" />
        <StatCard title="Candidates" value={analytics.totalCandidates} subtitle="Profiles in vault" />
        <StatCard
          title="Avg resume score"
          value={analytics.averageScore.toFixed(1)}
          subtitle="AI match signal"
        />
      </div>

      {error ? <div className="tv-alert">{error}</div> : null}

      <SectionCard title="Top skills demand" subtitle="Signals across roles and profiles">
        <div className="tv-skill-list">
          {analytics.topSkills.map((skill) => {
            const max = analytics.topSkills[0]?.count || 1;
            const percent = Math.round((skill.count / max) * 100);
            return (
              <div key={skill.name} className="tv-skill-item">
                <div className="tv-skill-label">
                  <span>{skill.name}</span>
                  <span>{skill.count}</span>
                </div>
                <ProgressBar now={percent} className="tv-progress" />
              </div>
            );
          })}
        </div>
      </SectionCard>

      <SectionCard title="Hiring velocity" subtitle="Roles by status">
        <div className="tv-status-grid">
          {['open', 'closed', 'filled'].map((status) => {
            const count = jobs.filter((job) => job.status === status).length;
            return (
              <div key={status} className="tv-status-card">
                <div className="tv-status-title">{formatEnum(status)}</div>
                <div className="tv-status-value">{count}</div>
              </div>
            );
          })}
        </div>
      </SectionCard>
    </div>
  );
};

export default Analytics;

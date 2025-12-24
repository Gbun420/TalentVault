import React from 'react';
import { Link } from 'react-router-dom';
import SectionCard from '../components/SectionCard';

const NotFound = () => (
  <div className="tv-grid">
    <SectionCard title="Page not found" subtitle="We could not locate that view.">
      <Link className="tv-link" to="/">
        Back to dashboard
      </Link>
    </SectionCard>
  </div>
);

export default NotFound;

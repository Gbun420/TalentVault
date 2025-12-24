import React from 'react';
import { Card } from '@themesberg/react-bootstrap';

const StatCard = ({ title, value, subtitle }) => (
  <Card className="tv-card">
    <Card.Body>
      <div className="tv-stat-label">{title}</div>
      <div className="tv-stat-value">{value}</div>
      {subtitle ? <div className="tv-stat-subtitle">{subtitle}</div> : null}
    </Card.Body>
  </Card>
);

export default StatCard;

import React from 'react';
import { Card } from '@themesberg/react-bootstrap';

const SectionCard = ({ title, subtitle, action, children }) => (
  <Card className="tv-card">
    <Card.Body>
      <div className="tv-card-header">
        <div>
          <div className="tv-card-title">{title}</div>
          {subtitle ? <div className="tv-card-subtitle">{subtitle}</div> : null}
        </div>
        {action ? <div>{action}</div> : null}
      </div>
      {children}
    </Card.Body>
  </Card>
);

export default SectionCard;

import React from 'react';
import { Form, InputGroup, Button } from '@themesberg/react-bootstrap';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faBell, faSearch } from '@fortawesome/free-solid-svg-icons';

const Topbar = () => (
  <div className="tv-topbar">
    <div>
      <h1 className="tv-page-title">TalentVault Control Room</h1>
      <p className="tv-page-subtitle">Monitor the hiring marketplace in real time.</p>
    </div>
    <div className="tv-topbar-actions">
      <InputGroup className="tv-search">
        <InputGroup.Text>
          <FontAwesomeIcon icon={faSearch} />
        </InputGroup.Text>
        <Form.Control placeholder="Search jobs, candidates, companies" />
      </InputGroup>
      <Button variant="outline-light" className="tv-icon-btn">
        <FontAwesomeIcon icon={faBell} />
      </Button>
      <div className="tv-user">
        <div className="tv-user-avatar">GB</div>
        <div>
          <div className="tv-user-name">Glenn Bundy</div>
          <div className="tv-user-role">Founder</div>
        </div>
      </div>
    </div>
  </div>
);

export default Topbar;

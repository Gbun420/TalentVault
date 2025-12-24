import React, { useState } from 'react';
import { Button, Form } from '@themesberg/react-bootstrap';
import SectionCard from '../components/SectionCard';
import { DEFAULT_API_BASE, getApiBase, setApiBase } from '../config/api';

const Settings = () => {
  const [apiBase, setApiBaseValue] = useState(getApiBase());
  const [saved, setSaved] = useState(false);

  const handleSave = () => {
    setApiBase(apiBase);
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="tv-grid">
      <SectionCard title="Platform settings" subtitle="Configure TalentVault dashboard">
        <Form className="tv-form">
          <Form.Group className="mb-3">
            <Form.Label>Strapi API base URL</Form.Label>
            <Form.Control
              value={apiBase}
              onChange={(event) => setApiBaseValue(event.target.value)}
              placeholder={DEFAULT_API_BASE}
            />
            <Form.Text>Example: https://your-strapi-domain/api</Form.Text>
          </Form.Group>
          <Button variant="dark" onClick={handleSave}>
            Save settings
          </Button>
          {saved ? <span className="tv-save-status">Saved.</span> : null}
        </Form>
      </SectionCard>

      <SectionCard title="Environment" subtitle="Local development reminders">
        <ul className="tv-list">
          <li>Ensure CORS allows http://localhost:3000</li>
          <li>Publish content entries before expecting them to appear</li>
          <li>Use Strapi admin to manage roles and permissions</li>
        </ul>
      </SectionCard>
    </div>
  );
};

export default Settings;

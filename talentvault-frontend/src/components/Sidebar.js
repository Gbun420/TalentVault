import React from 'react';
import { NavLink } from 'react-router-dom';
import { Nav } from '@themesberg/react-bootstrap';

const navItems = [
  { label: 'Overview', path: '/' },
  { label: 'Jobs', path: '/jobs' },
  { label: 'Candidates', path: '/candidates' },
  { label: 'Analytics', path: '/analytics' },
  { label: 'Settings', path: '/settings' },
];

const Sidebar = () => (
  <aside className="tv-sidebar">
    <div className="tv-sidebar-brand">
      <div className="tv-logo">TV</div>
      <div>
        <div className="tv-brand-title">TalentVault</div>
        <div className="tv-brand-subtitle">Ops dashboard</div>
      </div>
    </div>
    <Nav className="tv-nav" as="nav">
      {navItems.map((item) => (
        <Nav.Link
          key={item.path}
          as={NavLink}
          to={item.path}
          className={({ isActive }) => (isActive ? 'tv-nav-link active' : 'tv-nav-link')}
          end={item.path === '/'}
        >
          {item.label}
        </Nav.Link>
      ))}
    </Nav>
    <div className="tv-sidebar-footer">
      <div className="tv-status">
        <span className="tv-status-dot" />
        Live sync enabled
      </div>
      <a className="tv-link" href="http://localhost:1337/admin" target="_blank" rel="noreferrer">
        Open Strapi Admin
      </a>
    </div>
  </aside>
);

export default Sidebar;

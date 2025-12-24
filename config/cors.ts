const defaultOrigins = [
  'http://localhost:8080',
  'http://127.0.0.1:8080',
  'http://localhost:3000',
  'http://127.0.0.1:3000',
];
const extraOrigins = process.env.TALENTVAULT_FRONTEND_ORIGINS
  ? process.env.TALENTVAULT_FRONTEND_ORIGINS.split(',').map((origin) => origin.trim())
  : [];
const origins = Array.from(new Set([...defaultOrigins, ...extraOrigins].filter(Boolean)));

export default {
  origin: origins,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'HEAD', 'OPTIONS'],
  headers: ['Content-Type', 'Authorization', 'Origin', 'Accept'],
  credentials: true,
};

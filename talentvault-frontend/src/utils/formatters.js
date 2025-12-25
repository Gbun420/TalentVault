export const formatLocation = (location) => {
  if (!location) return 'Remote';
  const parts = [location.city, location.region, location.country].filter(Boolean);
  return parts.length ? parts.join(', ') : 'Remote';
};

export const formatDate = (value) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
};

export const formatEnum = (value) => {
  if (!value) return '-';
  return value
    .split('_')
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(' ');
};

export const formatSalary = (range) => {
  if (!range || (!range.min && !range.max)) return 'Salary TBD';
  const currency = (range.currency || 'EUR').toUpperCase();
  const formatMoney = (value) => `${currency} ${Number(value).toLocaleString()}`;
  const min = range.min ? formatMoney(range.min) : '';
  const max = range.max ? formatMoney(range.max) : '';
  const spacer = min && max ? ' - ' : '';
  const period = range.period ? ` / ${range.period}` : '';
  return `${min}${spacer}${max}${period}`.trim();
};

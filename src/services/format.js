export const money = (n, currency = 'GEL') => `${Number(n).toFixed(n % 1 ? 2 : 0)} ${currency}`;

export const formatDateTime = (d, lang = 'en') =>
  new Date(d).toLocaleString(lang === 'ka' ? 'ka-GE' : 'en-GB', { dateStyle: 'medium', timeStyle: 'short' });

export const formatValidity = (value, t) => {
  const match = String(value).match(/^(\d+)\s+days?$/i);
  if (!match) return value;
  return `${match[1]} ${t.common.days}`;
};


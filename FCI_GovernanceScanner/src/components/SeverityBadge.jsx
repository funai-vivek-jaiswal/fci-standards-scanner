import React from 'react';

const MAP = {
  CRITICAL: 'critical',
  HIGH:     'high',
  MEDIUM:   'medium',
  LOW:      'low',
  PASS:     'pass',
  FAIL:     'fail',
  WARN:     'warn',
  SKIP:     'skip',
};

export default function SeverityBadge({ value }) {
  const key = (value || '').toUpperCase();
  const cls = MAP[key] || 'skip';
  return (
    <span className={`badge badge--${cls}`}>
      {value || '—'}
    </span>
  );
}

import React from 'react';

interface BadgeProps {
  children: React.ReactNode;
  color?: string;
}

export const Badge: React.FC<BadgeProps> = ({ children, color = '#7a7a84' }) => (
  <span style={{
    display: 'inline-block', padding: '2px 10px', borderRadius: '9999px',
    fontSize: '0.7rem', fontWeight: 500, background: color, color: '#fff',
    whiteSpace: 'nowrap',
  }}>
    {children}
  </span>
);

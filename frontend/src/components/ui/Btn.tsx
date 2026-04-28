import React, { useState, CSSProperties } from 'react';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'outline';
type Size = 'sm' | 'md' | 'lg';

interface BtnProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: Variant;
  size?: Size;
  disabled?: boolean;
  style?: CSSProperties;
  type?: 'button' | 'submit';
}

const SIZES: Record<Size, CSSProperties> = {
  sm: { padding: '4px 10px', fontSize: '0.75rem' },
  md: { padding: '8px 16px', fontSize: '0.875rem' },
  lg: { padding: '10px 20px', fontSize: '1rem' },
};

export const Btn: React.FC<BtnProps> = ({
  children, onClick, variant = 'primary', size = 'md', disabled, style: extra, type = 'button',
}) => {
  const [hovered, setHovered] = useState(false);

  const variants: Record<Variant, CSSProperties> = {
    primary: { background: hovered ? '#006b62' : '#008577', color: '#fff', border: 'none' },
    secondary: { background: hovered ? '#d5d5d8' : '#e8e8eb', color: '#27272f', border: 'none' },
    danger: { background: hovered ? '#c41610' : '#E91B0C', color: '#fff', border: 'none' },
    ghost: { background: hovered ? '#f3f3f5' : 'transparent', color: '#27272f', border: 'none' },
    outline: { background: 'transparent', color: '#008577', border: '1px solid #008577' },
  };

  return (
    <button
      type={type}
      onClick={disabled ? undefined : onClick}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      disabled={disabled}
      style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        borderRadius: '5px', cursor: disabled ? 'default' : 'pointer',
        fontFamily: "'Montserrat', sans-serif", fontWeight: 500,
        transition: 'all 150ms ease-in-out', opacity: disabled ? 0.5 : 1,
        whiteSpace: 'nowrap', ...SIZES[size], ...variants[variant], ...extra,
      }}
    >
      {children}
    </button>
  );
};

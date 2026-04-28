import React, { CSSProperties } from 'react';

interface InputProps {
  label?: string;
  type?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  placeholder?: string;
  style?: CSSProperties;
  step?: string;
  min?: string | number;
  max?: string | number;
  autoFocus?: boolean;
}

export const Input: React.FC<InputProps> = ({
  label, type = 'text', value, onChange, placeholder, style: extra, ...rest
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
    {label && (
      <label style={{ fontSize: '0.75rem', fontWeight: 500, color: '#5a5a64' }}>{label}</label>
    )}
    <input
      type={type}
      value={value}
      onChange={onChange}
      placeholder={placeholder}
      style={{
        padding: '8px 12px', border: '1px solid #d5d5d8', borderRadius: '5px',
        fontSize: '0.875rem', fontFamily: "'Montserrat', sans-serif",
        background: '#fff', color: '#27272f', outline: 'none',
        transition: 'border-color 150ms ease-in-out', width: '100%',
        ...extra,
      }}
      onFocus={e => (e.target.style.borderColor = '#008577')}
      onBlur={e => (e.target.style.borderColor = '#d5d5d8')}
      {...rest}
    />
  </div>
);

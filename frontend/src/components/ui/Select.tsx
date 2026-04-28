import React, { CSSProperties } from 'react';

interface Option { value: string | number; label: string }

interface SelectProps {
  label?: string;
  value: string | number;
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  options: Option[];
  placeholder?: string;
  style?: CSSProperties;
}

export const Select: React.FC<SelectProps> = ({
  label, value, onChange, options, placeholder, style: extra,
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
    {label && (
      <label style={{ fontSize: '0.75rem', fontWeight: 500, color: '#5a5a64' }}>{label}</label>
    )}
    <select
      value={value}
      onChange={onChange}
      style={{
        padding: '8px 12px', border: '1px solid #d5d5d8', borderRadius: '5px',
        fontSize: '0.875rem', fontFamily: "'Montserrat', sans-serif",
        background: '#fff', color: '#27272f', cursor: 'pointer', outline: 'none',
        transition: 'border-color 150ms ease-in-out', ...extra,
      }}
      onFocus={e => (e.target.style.borderColor = '#008577')}
      onBlur={e => (e.target.style.borderColor = '#d5d5d8')}
    >
      {placeholder && <option value="">{placeholder}</option>}
      {options.map(o => (
        <option key={o.value} value={o.value}>{o.label}</option>
      ))}
    </select>
  </div>
);

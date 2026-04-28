import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useAppStore } from '../store/appStore';
import { Icons } from './ui/Icons';

export const Sidebar: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { username, logout } = useAuthStore();
  const { accounts, selectedAccountId } = useAppStore();
  const selectedAccount = accounts.find(a => a.id === selectedAccountId);

  const is = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  const navBtn = (label: string, icon: React.ReactNode, path: string) => (
    <button
      onClick={() => navigate(path)}
      style={{
        display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
        padding: '10px 14px',
        background: is(path) ? 'rgba(0,0,0,0.2)' : 'transparent',
        color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer',
        fontSize: '0.8rem', fontWeight: 500, fontFamily: "'Montserrat', sans-serif",
        textAlign: 'left', marginBottom: '2px', transition: 'background 150ms',
      }}
    >
      {icon} {label}
    </button>
  );

  return (
    <aside style={{
      width: '220px', minHeight: '100vh', background: '#008577',
      color: '#fff', display: 'flex', flexDirection: 'column', flexShrink: 0,
    }}>
      <div style={{ padding: '20px', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', justifyContent: 'center' }}>
          <Icons.Wallet />
          <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>Finance 2026</span>
        </div>
      </div>

      <nav style={{ flex: 1, padding: '12px' }}>
        {navBtn('Accueil', <Icons.Home />, '/')}
        {selectedAccount && navBtn(selectedAccount.name, <Icons.List />, `/accounts/${selectedAccount.id}`)}
        {accounts.length >= 2 && navBtn('Équilibrage', <Icons.Scale />, '/equilibrage')}
        {accounts.length >= 1 && navBtn('Statistiques', <Icons.BarChart />, '/statistics')}
      </nav>

      <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px' }}>
          <div style={{
            width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            fontSize: '0.75rem', fontWeight: 600, flexShrink: 0,
          }}>
            {username.slice(0, 2).toUpperCase()}
          </div>
          <span style={{ fontSize: '0.75rem', overflow: 'hidden', textOverflow: 'ellipsis' }}>{username}</span>
        </div>
        <button
          onClick={logout}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px', width: '100%',
            padding: '6px 8px', background: 'rgba(255,255,255,0.1)', color: '#fff',
            border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '0.7rem',
            fontFamily: "'Montserrat', sans-serif',",
          }}
        >
          <Icons.LogOut /> Déconnexion
        </button>
      </div>
    </aside>
  );
};

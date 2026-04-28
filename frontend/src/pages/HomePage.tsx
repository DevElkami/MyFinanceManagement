import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { apiDeleteAccount } from '../services/api';
import { Account, fmt } from '../types';
import { Btn } from '../components/ui/Btn';
import { Icons } from '../components/ui/Icons';
import { AccountFormModal } from '../components/AccountFormModal';

const MONTH_NAMES = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

export const HomePage: React.FC = () => {
  const navigate = useNavigate();
  const { accounts, operations, setSelectedAccountId, removeAccount } = useAppStore();
  const [accountModal, setAccountModal] = useState<{ open: boolean; account: Account | null }>({ open: false, account: null });

  const now = new Date();

  const getSolde = (acc: Account) => {
    const ops = operations.filter(o => o.accountId === acc.id);
    return Number(acc.soldeInitial) + ops.reduce((s, o) => s + Number(o.amount), 0);
  };

  const getMonthStats = (accountId: number, monthsBack: number) => {
    const target = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - monthsBack + 1, 0);
    const filtered = operations.filter(o => {
      if (o.accountId !== accountId) return false;
      const d = new Date(o.date + 'T00:00:00');
      return d >= target && d <= end;
    });
    return {
      recettes: filtered.filter(o => Number(o.amount) > 0).reduce((s, o) => s + Number(o.amount), 0),
      depenses: filtered.filter(o => Number(o.amount) < 0).reduce((s, o) => s + Number(o.amount), 0),
    };
  };

  const months = [0, 1, 2, 3].map(i => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return { label: MONTH_NAMES[d.getMonth()] + ' ' + d.getFullYear(), back: i };
  });

  const handleDelete = async (id: number) => {
    if (!window.confirm('Supprimer ce compte et toutes ses opérations ?')) return;
    try {
      await apiDeleteAccount(id);
      removeAccount(id);
    } catch {}
  };

  const handleSelect = (acc: Account) => {
    setSelectedAccountId(acc.id);
    navigate(`/accounts/${acc.id}`);
  };

  return (
    <div style={{ padding: '24px' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' }}>
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 500 }}>Mes comptes</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          {accounts.length >= 2 && (
            <Btn variant="outline" onClick={() => navigate('/equilibrage')}><Icons.Scale /> Équilibrage</Btn>
          )}
          <Btn onClick={() => setAccountModal({ open: true, account: null })}><Icons.Plus /> Nouveau compte</Btn>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' }}>
        {accounts.map(acc => {
          const solde = getSolde(acc);
          return (
            <div
              key={acc.id}
              onClick={() => handleSelect(acc)}
              style={{
                background: '#fff', borderRadius: '8px', padding: '20px',
                boxShadow: '0 1px 2px rgba(0,0,0,0.05)', cursor: 'pointer',
                border: '1px solid #e8e8eb', transition: 'box-shadow 150ms',
              }}
              onMouseEnter={e => ((e.currentTarget as HTMLElement).style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)')}
              onMouseLeave={e => ((e.currentTarget as HTMLElement).style.boxShadow = '0 1px 2px rgba(0,0,0,0.05)')}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                  <h3 style={{ margin: 0, fontSize: '1rem', fontWeight: 500 }}>{acc.name}</h3>
                  <p style={{ margin: '2px 0 0', fontSize: '0.75rem', color: '#7a7a84' }}>{acc.bank} — {acc.owner}</p>
                </div>
                <div style={{ display: 'flex', gap: '4px' }} onClick={e => e.stopPropagation()}>
                  <button style={iconBtnStyle} onClick={() => setAccountModal({ open: true, account: acc })}><Icons.Edit /></button>
                  <button style={{ ...iconBtnStyle, color: '#E91B0C' }} onClick={() => handleDelete(acc.id)}><Icons.Trash /></button>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', margin: '16px 0' }}>
                <span style={{ fontSize: '0.75rem', color: '#7a7a84' }}>Solde</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 500, color: solde >= 0 ? '#048604' : '#E91B0C' }}>
                  {fmt(solde)}
                </span>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', borderTop: '1px solid #e8e8eb', paddingTop: '12px' }}>
                {months.map(m => {
                  const s = getMonthStats(acc.id, m.back);
                  return (
                    <div key={m.back} style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                      <span style={{ fontSize: '0.65rem', fontWeight: 500, color: '#5a5a64', textTransform: 'uppercase' }}>{m.label}</span>
                      <span style={{ fontSize: '0.7rem', color: '#048604' }}>+{fmt(s.recettes)}</span>
                      <span style={{ fontSize: '0.7rem', color: '#E91B0C' }}>{fmt(s.depenses)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {accounts.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 20px', color: '#7a7a84' }}>
          <Icons.Wallet />
          <p>Aucun compte. Créez votre premier compte pour commencer.</p>
          <Btn onClick={() => setAccountModal({ open: true, account: null })}><Icons.Plus /> Créer un compte</Btn>
        </div>
      )}

      <AccountFormModal
        open={accountModal.open}
        account={accountModal.account}
        onClose={() => setAccountModal({ open: false, account: null })}
      />
    </div>
  );
};

const iconBtnStyle: React.CSSProperties = {
  background: 'none', border: 'none', cursor: 'pointer', color: '#7a7a84',
  padding: '4px', borderRadius: '4px', display: 'flex',
};

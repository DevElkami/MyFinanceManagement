import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import {
  apiDeleteCategory, apiDeleteTier, apiDeleteEcheance,
  apiGetEcheances,
} from '../services/api';
import { Category, Tier, Echeance, fmt, fmtDate } from '../types';
import { Btn } from '../components/ui/Btn';
import { Icons } from '../components/ui/Icons';
import { Badge } from '../components/ui/Badge';
import { CategoryFormModal } from '../components/CategoryFormModal';
import { TierFormModal } from '../components/TierFormModal';
import { EcheanceFormModal } from '../components/EcheanceFormModal';

type ManagementType = 'categories' | 'tiers' | 'echeances';

interface Props { type: ManagementType }

export const ManagementPage: React.FC<Props> = ({ type }) => {
  const { id } = useParams<{ id: string }>();
  const accountId = parseInt(id!);
  const navigate = useNavigate();
  const { categories, tiers, echeances, setEcheances, removeCategory, removeTier, removeEcheance, upsertCategory, upsertTier, upsertEcheance } = useAppStore();

  const [selected, setSelected] = useState<any>(null);
  const [addModal, setAddModal] = useState(false);
  const [editModal, setEditModal] = useState(false);

  useEffect(() => {
    if (type === 'echeances') {
      apiGetEcheances(accountId).then(setEcheances).catch(() => {});
    }
    setSelected(null);
  }, [type, accountId]);

  const titles: Record<ManagementType, string> = {
    categories: 'Catégories', tiers: 'Tiers', echeances: 'Échéancier',
  };

  const items = type === 'categories' ? categories : type === 'tiers' ? tiers : echeances.filter(e => e.accountId === accountId);

  const handleDelete = async () => {
    if (!selected) return;
    if (!window.confirm('Supprimer cet élément ?')) return;
    try {
      if (type === 'categories') { await apiDeleteCategory(selected.id); removeCategory(selected.id); }
      else if (type === 'tiers') { await apiDeleteTier(selected.id); removeTier(selected.id); }
      else { await apiDeleteEcheance(selected.id); removeEcheance(selected.id); }
      setSelected(null);
    } catch {}
  };

  const renderColumns = (item: any) => {
    if (type === 'categories') {
      return [item.label, <Badge color="#008577">{(item as Category).type}</Badge>];
    }
    if (type === 'tiers') {
      return [(item as Tier).label];
    }
    const e = item as Echeance;
    return [
      `Jour ${e.dayOfMonth}`,
      <span style={{ color: Number(e.amount) < 0 ? '#E91B0C' : '#048604' }}>{fmt(Number(e.amount))}</span>,
      e.type,
      tiers.find(t => t.id === e.tierId)?.label || '—',
      e.note,
    ];
  };

  const columnHeaders = type === 'categories'
    ? ['Libellé', 'Type']
    : type === 'tiers'
    ? ['Libellé']
    : ['Jour du mois', 'Montant', 'Type', 'Tiers', 'Note'];

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: '#fff', borderBottom: '1px solid #e8e8eb', flexWrap: 'wrap', gap: '8px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button style={backBtnStyle} onClick={() => navigate(`/accounts/${accountId}`)}>
            <Icons.ChevronLeft /> Retour
          </button>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>{titles[type]}</h2>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Btn size="sm" onClick={() => setAddModal(true)}><Icons.Plus /> Ajouter</Btn>
          <Btn variant="secondary" size="sm" disabled={!selected} onClick={() => selected && setEditModal(true)}><Icons.Edit /> Modifier</Btn>
          <Btn variant="danger" size="sm" disabled={!selected} onClick={handleDelete}><Icons.Trash /> Supprimer</Btn>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', fontFamily: "'Montserrat', sans-serif" }}>
          <thead style={{ background: '#f5f5f5', borderBottom: '2px solid #d5d5d8', position: 'sticky', top: 0 }}>
            <tr>
              {columnHeaders.map(h => (
                <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', color: '#27272f' }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {items.map((item: any, idx) => (
              <tr
                key={item.id}
                onClick={() => setSelected(selected?.id === item.id ? null : item)}
                style={{ background: selected?.id === item.id ? '#edf7f6' : idx % 2 ? '#fafafa' : '#fff', borderBottom: '1px solid #e8e8eb', cursor: 'pointer', transition: 'background 100ms' }}
              >
                {renderColumns(item).map((cell, i) => (
                  <td key={i} style={{ padding: '8px 12px', color: '#27272f' }}>{cell as React.ReactNode}</td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && (
          <div style={{ textAlign: 'center', padding: '40px', color: '#7a7a84', fontSize: '0.8rem' }}>Aucun élément</div>
        )}
      </div>

      {type === 'categories' && (
        <>
          <CategoryFormModal open={addModal} category={null} onClose={() => setAddModal(false)} onSaved={cat => { upsertCategory(cat); setAddModal(false); }} />
          <CategoryFormModal open={editModal} category={selected} onClose={() => setEditModal(false)} onSaved={cat => { upsertCategory(cat); setEditModal(false); setSelected(null); }} />
        </>
      )}
      {type === 'tiers' && (
        <>
          <TierFormModal open={addModal} tier={null} onClose={() => setAddModal(false)} onSaved={t => { upsertTier(t); setAddModal(false); }} />
          <TierFormModal open={editModal} tier={selected} onClose={() => setEditModal(false)} onSaved={t => { upsertTier(t); setEditModal(false); setSelected(null); }} />
        </>
      )}
      {type === 'echeances' && (
        <>
          <EcheanceFormModal open={addModal} echeance={null} accountId={accountId} onClose={() => setAddModal(false)} onSaved={e => { upsertEcheance(e); setAddModal(false); }} />
          <EcheanceFormModal open={editModal} echeance={selected} accountId={accountId} onClose={() => setEditModal(false)} onSaved={e => { upsertEcheance(e); setEditModal(false); setSelected(null); }} />
        </>
      )}
    </div>
  );
};

const backBtnStyle: React.CSSProperties = {
  display: 'flex', alignItems: 'center', gap: '2px', background: 'none',
  border: 'none', cursor: 'pointer', color: '#008577', fontSize: '0.8rem',
  fontWeight: 500, fontFamily: "'Montserrat', sans-serif",
};

import React, { useEffect, useState, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import {
  apiGetOperations, apiDeleteOperation, apiPatchOperationStatut, apiRapprocher, apiApplyEcheances,
} from '../services/api';
import { Operation, OperationStatut, fmt, fmtDate, OP_TYPES, STATUTS } from '../types';
import { Btn } from '../components/ui/Btn';
import { Icons } from '../components/ui/Icons';
import { Badge } from '../components/ui/Badge';
import { Select } from '../components/ui/Select';
import { Input } from '../components/ui/Input';
import { OperationPopup } from '../components/OperationPopup';
import { ImportWizard } from '../components/ImportWizard';

const STATUT_COLOR: Record<string, string> = { Aucun: '#babac4', Pointé: '#0B78D0', Rapproché: '#048604' };
const MONTH_NAMES = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

export const ConsultationPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const accountId = parseInt(id!);
  const navigate = useNavigate();
  const { accounts, operations, categories, tiers, setOperations, setSelectedAccountId, upsertOperation, removeOperation, toggleOperationStatut } = useAppStore();
  const account = accounts.find(a => a.id === accountId);

  const [opModal, setOpModal] = useState<{ open: boolean; op: Operation | null }>({ open: false, op: null });
  const [importOpen, setImportOpen] = useState(false);
  const [filterType, setFilterType] = useState('');
  const [filterCat, setFilterCat] = useState('');
  const [filterStatut, setFilterStatut] = useState('');
  const [filterTier, setFilterTier] = useState('');
  const [filterNote, setFilterNote] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [rapprocheMontant, setRapprocheMontant] = useState('');
  const [selectedOpId, setSelectedOpId] = useState<number | null>(null);

  useEffect(() => {
    if (!account) return;
    setSelectedAccountId(accountId);
    apiGetOperations(accountId).then(setOperations).catch(() => {});
    apiApplyEcheances(accountId).catch(() => {});
  }, [accountId]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'F5' && selectedOpId) {
        e.preventDefault();
        handleToggleStatut(selectedOpId);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [selectedOpId]);

  if (!account) return <div style={{ padding: '24px' }}>Compte non trouvé</div>;

  const ops = operations.filter(o => o.accountId === accountId);
  let filtered = [...ops];
  if (filterType) filtered = filtered.filter(o => o.type === filterType);
  if (filterCat) filtered = filtered.filter(o => o.categoryId === +filterCat);
  if (filterStatut) filtered = filtered.filter(o => o.statut === filterStatut);
  if (filterTier) filtered = filtered.filter(o => o.tierId === +filterTier);
  if (filterNote) filtered = filtered.filter(o => o.note?.toLowerCase().includes(filterNote.toLowerCase()));
  filtered.sort((a, b) => a.date.localeCompare(b.date));

  const allSorted = [...ops].sort((a, b) => a.date.localeCompare(b.date));
  const balanceMap: Record<number, number> = {};
  let running = Number(account.soldeInitial);
  for (const o of allSorted) { running += Number(o.amount); balanceMap[o.id] = running; }

  const solde = Number(account.soldeInitial) + ops.reduce((s, o) => s + Number(o.amount), 0);
  const soldePointe = Number(account.soldeInitial) + ops.filter(o => o.statut === 'Pointé' || o.statut === 'Rapproché').reduce((s, o) => s + Number(o.amount), 0);
  const pointeTotal = ops.filter(o => o.statut === 'Pointé').reduce((s, o) => s + Number(o.amount), 0);
  const ecartRapproche = rapprocheMontant ? parseFloat(rapprocheMontant) - pointeTotal : null;

  const now = new Date();
  const monthStats = [0, 1, 2, 3].map(i => {
    const target = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0);
    const f = ops.filter(o => { const d = new Date(o.date + 'T00:00:00'); return d >= target && d <= end; });
    return {
      label: MONTH_NAMES[target.getMonth()] + ' ' + target.getFullYear(),
      recettes: f.filter(o => Number(o.amount) > 0).reduce((s, o) => s + Number(o.amount), 0),
      depenses: f.filter(o => Number(o.amount) < 0).reduce((s, o) => s + Number(o.amount), 0),
    };
  });

  const getTierLabel = (id: number | null) => tiers.find(t => t.id === id)?.label || '—';

  const handleToggleStatut = async (opId: number) => {
    try {
      const updated = await apiPatchOperationStatut(opId);
      upsertOperation(updated);
    } catch {
      toggleOperationStatut(opId);
    }
  };

  const handleDelete = async (opId: number) => {
    if (!window.confirm('Supprimer cette opération ?')) return;
    try { await apiDeleteOperation(opId); removeOperation(opId); } catch {}
  };

  const handleRapprocher = async () => {
    if (!window.confirm('Rapprocher toutes les opérations pointées ? Cette action est irréversible.')) return;
    try {
      await apiRapprocher(accountId);
      const updated = await apiGetOperations(accountId);
      setOperations(updated);
    } catch {}
  };

  const resetFilters = () => { setFilterType(''); setFilterCat(''); setFilterStatut(''); setFilterTier(''); setFilterNote(''); };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      {/* Toolbar */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: '#fff', borderBottom: '1px solid #e8e8eb', flexWrap: 'wrap', gap: '8px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button style={{ display: 'flex', alignItems: 'center', gap: '2px', background: 'none', border: 'none', cursor: 'pointer', color: '#008577', fontSize: '0.8rem', fontWeight: 500, fontFamily: "'Montserrat', sans-serif" }} onClick={() => navigate('/')}>
            <Icons.ChevronLeft /> Retour
          </button>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>{account.name}</h2>
          <Badge color={solde >= 0 ? '#048604' : '#E91B0C'}>{fmt(solde)}</Badge>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' }}>
          <Btn variant="ghost" size="sm" onClick={() => setImportOpen(true)}><Icons.Upload /> Importer</Btn>
          <Btn variant="ghost" size="sm" onClick={() => navigate(`/accounts/${accountId}/categories`)}><Icons.Tag /> Catégories</Btn>
          <Btn variant="ghost" size="sm" onClick={() => navigate(`/accounts/${accountId}/tiers`)}><Icons.Users /> Tiers</Btn>
          <Btn variant="ghost" size="sm" onClick={() => navigate(`/accounts/${accountId}/echeances`)}><Icons.Clock /> Échéancier</Btn>
          <Btn size="sm" onClick={() => setOpModal({ open: true, op: null })}><Icons.Plus /> Opération</Btn>
        </div>
      </div>

      {/* Rapprochement bar */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 20px', background: '#f9f9f9', borderBottom: '1px solid #e8e8eb', flexWrap: 'wrap', flexShrink: 0 }}>
        <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#5a5a64' }}>Rapprochement :</span>
        <input
          type="number" step="0.01" placeholder="Montant à rapprocher" value={rapprocheMontant}
          onChange={e => setRapprocheMontant(e.target.value)}
          style={{ padding: '5px 10px', border: '1px solid #d5d5d8', borderRadius: '5px', fontSize: '0.8rem', width: '160px', fontFamily: "'Montserrat', sans-serif" }}
        />
        {ecartRapproche !== null && (
          <span style={{ fontSize: '0.8rem', color: Math.abs(ecartRapproche) < 0.01 ? '#048604' : '#C24E00' }}>
            Écart : {fmt(ecartRapproche)}
          </span>
        )}
        <Btn variant="secondary" size="sm" onClick={handleRapprocher}>Rapprocher</Btn>
        <div style={{ marginLeft: 'auto' }}>
          <Btn variant="ghost" size="sm" onClick={() => setShowFilters(v => !v)}>
            <Icons.Filter /> Filtres {showFilters ? '▲' : '▼'}
          </Btn>
        </div>
      </div>

      {/* Filters */}
      {showFilters && (
        <div style={{ display: 'flex', gap: '12px', padding: '12px 20px', background: '#f9f9f9', borderBottom: '1px solid #e8e8eb', flexWrap: 'wrap', alignItems: 'flex-end', flexShrink: 0 }}>
          <Select label="Type" value={filterType} onChange={e => setFilterType(e.target.value)} options={OP_TYPES.map(t => ({ value: t, label: t }))} placeholder="Tous" style={{ minWidth: '120px' }} />
          <Select label="Catégorie" value={filterCat} onChange={e => setFilterCat(e.target.value)} options={categories.map(c => ({ value: c.id, label: c.label }))} placeholder="Toutes" style={{ minWidth: '140px' }} />
          <Select label="Statut" value={filterStatut} onChange={e => setFilterStatut(e.target.value)} options={STATUTS.map(s => ({ value: s, label: s }))} placeholder="Tous" style={{ minWidth: '100px' }} />
          <Select label="Tiers" value={filterTier} onChange={e => setFilterTier(e.target.value)} options={tiers.map(t => ({ value: t.id, label: t.label }))} placeholder="Tous" style={{ minWidth: '140px' }} />
          <Input label="Note" value={filterNote} onChange={e => setFilterNote(e.target.value)} placeholder="Rechercher..." style={{ minWidth: '140px' }} />
          <Btn variant="ghost" size="sm" style={{ alignSelf: 'flex-end' }} onClick={resetFilters}>Réinitialiser</Btn>
        </div>
      )}

      {/* Table */}
      <div style={{ flex: 1, overflow: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', fontFamily: "'Montserrat', sans-serif" }}>
          <thead style={{ background: '#f5f5f5', borderBottom: '2px solid #d5d5d8', position: 'sticky', top: 0, zIndex: 1 }}>
            <tr>
              {['Date', 'Type', 'Tiers', 'Débit', 'Crédit', 'Statut', 'Solde', ''].map((h, i) => (
                <th key={i} style={{ padding: '8px 12px', textAlign: i >= 3 && i <= 6 ? 'right' : 'left', fontSize: '0.7rem', fontWeight: 600, color: '#27272f', textTransform: 'uppercase', letterSpacing: '0.3px', whiteSpace: 'nowrap' }}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {filtered.map((op, idx) => (
              <tr
                key={op.id}
                onClick={() => setSelectedOpId(op.id)}
                style={{ background: op.id === selectedOpId ? '#edf7f6' : idx % 2 ? '#fafafa' : '#fff', borderBottom: '1px solid #e8e8eb', cursor: 'pointer', transition: 'background 100ms' }}
                onMouseEnter={e => { if (op.id !== selectedOpId) (e.currentTarget as HTMLElement).style.filter = 'brightness(0.97)'; }}
                onMouseLeave={e => ((e.currentTarget as HTMLElement).style.filter = '')}
              >
                <td style={tdStyle}>{fmtDate(op.date)}</td>
                <td style={tdStyle}><span style={{ fontSize: '0.75rem' }}>{op.type}</span></td>
                <td style={tdStyle}>{getTierLabel(op.tierId)}</td>
                <td style={{ ...tdStyle, textAlign: 'right', color: '#E91B0C' }}>
                  {Number(op.amount) < 0 ? fmt(Math.abs(Number(op.amount))) : ''}
                </td>
                <td style={{ ...tdStyle, textAlign: 'right', color: '#048604' }}>
                  {Number(op.amount) > 0 ? fmt(Number(op.amount)) : ''}
                </td>
                <td style={{ ...tdStyle, textAlign: 'center' }}>
                  <button
                    onClick={e => { e.stopPropagation(); handleToggleStatut(op.id); }}
                    title={`${op.statut} (F5 pour changer)`}
                    style={{ width: '24px', height: '24px', borderRadius: '50%', border: 'none', background: STATUT_COLOR[op.statut] || '#babac4', color: '#fff', fontSize: '12px', cursor: 'pointer', lineHeight: 1, display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}
                  >
                    {op.statut === 'Aucun' ? '○' : op.statut === 'Pointé' ? '●' : '✓'}
                  </button>
                </td>
                <td style={{ ...tdStyle, textAlign: 'right', fontWeight: 500 }}>
                  {balanceMap[op.id] !== undefined ? fmt(balanceMap[op.id]) : ''}
                </td>
                <td style={{ ...tdStyle, textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '2px', justifyContent: 'flex-end' }}>
                    <button style={iconBtnStyle} onClick={e => { e.stopPropagation(); setOpModal({ open: true, op }); }}><Icons.Edit /></button>
                    <button style={{ ...iconBtnStyle, color: '#E91B0C' }} onClick={e => { e.stopPropagation(); handleDelete(op.id); }}><Icons.Trash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: '#7a7a84', fontSize: '0.875rem' }}>Aucune opération trouvée</div>}
      </div>

      {/* Footer */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: '#fff', borderTop: '2px solid #e8e8eb', flexWrap: 'wrap', gap: '12px', flexShrink: 0 }}>
        <div style={{ display: 'flex', gap: '20px' }}>
          {monthStats.map(m => (
            <div key={m.label} style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 500, color: '#5a5a64' }}>{m.label}</span>
              <span style={{ fontSize: '0.7rem', color: '#048604' }}>+{fmt(m.recettes)}</span>
              <span style={{ fontSize: '0.7rem', color: '#E91B0C' }}>{fmt(m.depenses)}</span>
            </div>
          ))}
        </div>
        <div style={{ display: 'flex', gap: '24px' }}>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '0.7rem', color: '#5a5a64' }}>Solde pointé</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0B78D0' }}>{fmt(soldePointe)}</span>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
            <span style={{ fontSize: '0.7rem', color: '#5a5a64' }}>Solde courant</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: solde >= 0 ? '#048604' : '#E91B0C' }}>{fmt(solde)}</span>
          </div>
        </div>
      </div>

      <OperationPopup
        open={opModal.open} operation={opModal.op} accountId={accountId}
        onClose={() => setOpModal({ open: false, op: null })}
        onSaved={op => { upsertOperation(op); setOpModal({ open: false, op: null }); }}
      />
      <ImportWizard open={importOpen} accountId={accountId} accountName={account.name} onClose={() => setImportOpen(false)} onImported={() => apiGetOperations(accountId).then(setOperations).catch(() => {})} />
    </div>
  );
};

const tdStyle: React.CSSProperties = { padding: '8px 12px', color: '#27272f' };
const iconBtnStyle: React.CSSProperties = { background: 'none', border: 'none', cursor: 'pointer', color: '#7a7a84', padding: '2px', borderRadius: '4px', display: 'flex' };

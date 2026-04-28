import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Btn } from './ui/Btn';
import { Echeance, OP_TYPES } from '../types';
import { apiCreateEcheance, apiUpdateEcheance } from '../services/api';
import { useAppStore } from '../store/appStore';

interface Props {
  open: boolean;
  echeance: Echeance | null;
  accountId: number;
  onClose: () => void;
  onSaved: (ech: Echeance) => void;
}

export const EcheanceFormModal: React.FC<Props> = ({ open, echeance, accountId, onClose, onSaved }) => {
  const { categories, tiers } = useAppStore();
  const [creditDebit, setCreditDebit] = useState<'debit' | 'credit'>('debit');
  const [dayOfMonth, setDayOfMonth] = useState('1');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('Prélèvement');
  const [tierId, setTierId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState('');
  const [equilibre, setEquilibre] = useState(true);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setCreditDebit(echeance ? (Number(echeance.amount) >= 0 ? 'credit' : 'debit') : 'debit');
      setDayOfMonth(echeance?.dayOfMonth?.toString() || '1');
      setAmount(echeance ? Math.abs(Number(echeance.amount)).toString() : '');
      setType(echeance?.type || 'Prélèvement');
      setTierId(echeance?.tierId?.toString() || '');
      setCategoryId(echeance?.categoryId?.toString() || '');
      setNote(echeance?.note || '');
      setEquilibre(echeance?.equilibre ?? true);
    }
  }, [echeance, open]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const amt = parseFloat(amount) || 0;
      const data = {
        dayOfMonth: parseInt(dayOfMonth) || 1,
        amount: creditDebit === 'debit' ? -Math.abs(amt) : Math.abs(amt),
        type, tierId: tierId ? +tierId : null,
        categoryId: categoryId ? +categoryId : null,
        note, equilibre,
      };
      const saved = echeance
        ? await apiUpdateEcheance(echeance.id, data)
        : await apiCreateEcheance(accountId, data);
      onSaved(saved);
    } catch {}
    setLoading(false);
  };

  return (
    <Modal open={open} onClose={onClose} title={echeance ? "Modifier l'échéance" : 'Nouvelle échéance'}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {(['debit', 'credit'] as const).map(cd => (
            <button key={cd} onClick={() => setCreditDebit(cd)} style={{
              flex: 1, padding: '8px', borderRadius: '5px', border: '1px solid',
              borderColor: creditDebit === cd ? (cd === 'debit' ? '#E91B0C' : '#048604') : '#d5d5d8',
              background: creditDebit === cd ? (cd === 'debit' ? '#fef2f2' : '#f0fdf4') : '#fff',
              color: creditDebit === cd ? (cd === 'debit' ? '#E91B0C' : '#048604') : '#7a7a84',
              cursor: 'pointer', fontWeight: 500, fontSize: '0.8rem',
              fontFamily: "'Montserrat', sans-serif", transition: 'all 150ms',
            }}>
              {cd === 'debit' ? 'Débit' : 'Crédit'}
            </button>
          ))}
        </div>

        <Input label="Jour du mois (1-31)" type="number" value={dayOfMonth} onChange={e => setDayOfMonth(e.target.value)} min="1" max="31" />
        <Input label="Montant (€)" type="number" value={amount} onChange={e => setAmount(e.target.value)} step="0.01" placeholder="0.00" />
        <Select label="Type" value={type} onChange={e => setType(e.target.value)} options={OP_TYPES.map(t => ({ value: t, label: t }))} />
        <Select label="Tiers" value={tierId} onChange={e => setTierId(e.target.value)} options={tiers.map(t => ({ value: t.id, label: t.label }))} placeholder="Sélectionner" />
        <Select label="Catégorie" value={categoryId} onChange={e => setCategoryId(e.target.value)} options={categories.map(c => ({ value: c.id, label: c.label }))} placeholder="Sélectionner" />
        <Input label="Note" value={note} onChange={e => setNote(e.target.value)} placeholder="Note facultative" />

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#5a5a64', cursor: 'pointer' }}>
          <input type="checkbox" checked={equilibre} onChange={e => setEquilibre(e.target.checked)} />
          Inclure dans l'équilibrage
        </label>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <Btn variant="secondary" onClick={onClose}>Annuler</Btn>
          <Btn onClick={handleSave} disabled={!amount || loading}>{loading ? 'Enregistrement...' : 'Valider'}</Btn>
        </div>
      </div>
    </Modal>
  );
};

import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Btn } from './ui/Btn';
import { Operation, OP_TYPES } from '../types';
import { apiCreateOperation, apiUpdateOperation } from '../services/api';
import { useAppStore } from '../store/appStore';

interface Props {
  open: boolean;
  operation: Operation | null;
  accountId: number;
  onClose: () => void;
  onSaved: (op: Operation) => void;
}

export const OperationPopup: React.FC<Props> = ({ open, operation, accountId, onClose, onSaved }) => {
  const { accounts, categories, tiers } = useAppStore();
  const [creditDebit, setCreditDebit] = useState<'debit' | 'credit'>('debit');
  const [date, setDate] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState('CB');
  const [tierId, setTierId] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [note, setNote] = useState('');
  const [equilibre, setEquilibre] = useState(true);
  const [linkedAccountId, setLinkedAccountId] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setDate(operation?.date || new Date().toISOString().slice(0, 10));
      setAmount(operation ? Math.abs(Number(operation.amount)).toString() : '');
      setType(operation?.type || 'CB');
      setTierId(operation?.tierId?.toString() || '');
      setCategoryId(operation?.categoryId?.toString() || '');
      setNote(operation?.note || '');
      setEquilibre(operation?.equilibre ?? true);
      setCreditDebit(operation ? (Number(operation.amount) >= 0 ? 'credit' : 'debit') : 'debit');
      setLinkedAccountId('');
    }
  }, [open, operation]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const amt = parseFloat(amount) || 0;
      const data = {
        date, amount: creditDebit === 'debit' ? -Math.abs(amt) : Math.abs(amt),
        type, tierId: tierId ? +tierId : null, categoryId: categoryId ? +categoryId : null,
        note, equilibre, linkedAccountId: linkedAccountId ? +linkedAccountId : undefined,
      };
      const saved = operation
        ? await apiUpdateOperation(operation.id, data)
        : await apiCreateOperation(accountId, data);
      onSaved(saved);
    } catch {}
    setLoading(false);
  };

  const otherAccounts = accounts.filter(a => a.id !== accountId);

  return (
    <Modal open={open} onClose={onClose} title={operation ? "Modifier l'opération" : 'Nouvelle opération'} width={480}>
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

        <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} />
        <Input label="Montant" type="number" value={amount} onChange={e => setAmount(e.target.value)} step="0.01" placeholder="0.00" />
        <Select label="Type d'opération" value={type} onChange={e => setType(e.target.value)} options={OP_TYPES.map(t => ({ value: t, label: t }))} />
        <Select label="Tiers" value={tierId} onChange={e => setTierId(e.target.value)} options={tiers.map(t => ({ value: t.id, label: t.label }))} placeholder="Sélectionner un tiers" />
        <Select label="Catégorie" value={categoryId} onChange={e => setCategoryId(e.target.value)} options={categories.map(c => ({ value: c.id, label: `${c.label} (${c.type})` }))} placeholder="Sélectionner une catégorie" />
        <Input label="Note" value={note} onChange={e => setNote(e.target.value)} placeholder="Note facultative" />

        {!operation && otherAccounts.length > 0 && (
          <Select label="Virement inter-comptes" value={linkedAccountId} onChange={e => setLinkedAccountId(e.target.value)} options={otherAccounts.map(a => ({ value: a.id, label: a.name }))} placeholder="Aucun (pas de virement)" />
        )}

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#5a5a64', cursor: 'pointer' }}>
          <input type="checkbox" checked={equilibre} onChange={e => setEquilibre(e.target.checked)} />
          Inclure dans l'équilibrage
        </label>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
          <Btn variant="secondary" onClick={onClose}>Fermer</Btn>
          <Btn onClick={handleSave} disabled={loading || !amount}>{loading ? 'Enregistrement...' : 'Valider'}</Btn>
        </div>
      </div>
    </Modal>
  );
};

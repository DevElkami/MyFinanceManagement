import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Btn } from './ui/Btn';
import { Account } from '../types';
import { apiCreateAccount, apiUpdateAccount } from '../services/api';
import { useAppStore } from '../store/appStore';

interface Props {
  open: boolean;
  account: Account | null;
  onClose: () => void;
}

export const AccountFormModal: React.FC<Props> = ({ open, account, onClose }) => {
  const { upsertAccount } = useAppStore();
  const [name, setName] = useState('');
  const [bank, setBank] = useState('');
  const [owner, setOwner] = useState('');
  const [solde, setSolde] = useState('0');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) {
      setName(account?.name || '');
      setBank(account?.bank || '');
      setOwner(account?.owner || '');
      setSolde(account?.soldeInitial?.toString() || '0');
    }
  }, [account, open]);

  const handleSave = async () => {
    if (!name) return;
    setLoading(true);
    try {
      const data = { name, bank, owner, soldeInitial: parseFloat(solde) || 0 };
      const saved = account
        ? await apiUpdateAccount(account.id, data)
        : await apiCreateAccount(data);
      upsertAccount(saved);
      onClose();
    } catch {}
    setLoading(false);
  };

  return (
    <Modal open={open} onClose={onClose} title={account ? 'Modifier le compte' : 'Nouveau compte'}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input label="Nom du compte" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Compte Courant" autoFocus />
        <Input label="Banque" value={bank} onChange={e => setBank(e.target.value)} placeholder="Ex: Banque Populaire" />
        <Input label="Propriétaire" value={owner} onChange={e => setOwner(e.target.value)} placeholder="Ex: Jean Dupont" />
        <Input label="Solde initial (€)" type="number" value={solde} onChange={e => setSolde(e.target.value)} step="0.01" />
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
          <Btn variant="secondary" onClick={onClose}>Annuler</Btn>
          <Btn onClick={handleSave} disabled={!name || loading}>{loading ? 'Enregistrement...' : 'Valider'}</Btn>
        </div>
      </div>
    </Modal>
  );
};

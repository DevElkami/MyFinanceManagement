import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Btn } from './ui/Btn';
import { Tier } from '../types';
import { apiCreateTier, apiUpdateTier } from '../services/api';

interface Props {
  open: boolean;
  tier: Tier | null;
  onClose: () => void;
  onSaved: (tier: Tier) => void;
}

export const TierFormModal: React.FC<Props> = ({ open, tier, onClose, onSaved }) => {
  const [label, setLabel] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) setLabel(tier?.label || '');
  }, [tier, open]);

  const handleSave = async () => {
    if (!label) return;
    setLoading(true);
    try {
      const saved = tier
        ? await apiUpdateTier(tier.id, { label })
        : await apiCreateTier({ label });
      onSaved(saved);
    } catch {}
    setLoading(false);
  };

  return (
    <Modal open={open} onClose={onClose} title={tier ? 'Modifier le tiers' : 'Nouveau tiers'}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input label="Libellé" value={label} onChange={e => setLabel(e.target.value)} placeholder="Ex: Sécurité Sociale" autoFocus />
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <Btn variant="secondary" onClick={onClose}>Annuler</Btn>
          <Btn onClick={handleSave} disabled={!label || loading}>{loading ? 'Enregistrement...' : 'Valider'}</Btn>
        </div>
      </div>
    </Modal>
  );
};

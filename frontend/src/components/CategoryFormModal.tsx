import React, { useState, useEffect } from 'react';
import { Modal } from './ui/Modal';
import { Input } from './ui/Input';
import { Select } from './ui/Select';
import { Btn } from './ui/Btn';
import { Category, CATEGORY_TYPES } from '../types';
import { apiCreateCategory, apiUpdateCategory } from '../services/api';

interface Props {
  open: boolean;
  category: Category | null;
  onClose: () => void;
  onSaved: (cat: Category) => void;
}

export const CategoryFormModal: React.FC<Props> = ({ open, category, onClose, onSaved }) => {
  const [label, setLabel] = useState('');
  const [type, setType] = useState<string>('Divers');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open) { setLabel(category?.label || ''); setType(category?.type || 'Divers'); }
  }, [category, open]);

  const handleSave = async () => {
    if (!label) return;
    setLoading(true);
    try {
      const saved = category
        ? await apiUpdateCategory(category.id, { label, type })
        : await apiCreateCategory({ label, type });
      onSaved(saved);
    } catch {}
    setLoading(false);
  };

  return (
    <Modal open={open} onClose={onClose} title={category ? 'Modifier la catégorie' : 'Nouvelle catégorie'}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input label="Libellé" value={label} onChange={e => setLabel(e.target.value)} placeholder="Ex: Alimentation" autoFocus />
        <Select label="Type" value={type} onChange={e => setType(e.target.value)} options={CATEGORY_TYPES.map(t => ({ value: t, label: t }))} />
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <Btn variant="secondary" onClick={onClose}>Annuler</Btn>
          <Btn onClick={handleSave} disabled={!label || loading}>{loading ? 'Enregistrement...' : 'Valider'}</Btn>
        </div>
      </div>
    </Modal>
  );
};

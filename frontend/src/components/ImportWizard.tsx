import React, { useState, useEffect, useRef } from 'react';
import { Modal } from './ui/Modal';
import { Select } from './ui/Select';
import { Btn } from './ui/Btn';
import { Icons } from './ui/Icons';
import { apiImport, apiGetImportMappings, apiSaveImportMappings } from '../services/api';

const FIELD_LABELS = ['Date', 'Montant', 'Type', 'Tiers', 'Catégorie', 'Note'];
const FORMATS = [
  { value: 'csv', label: 'CSV' },
  { value: 'xml', label: 'XML' },
  { value: 'ofx', label: 'OFX' },
  { value: 'cfonb', label: 'CFONB' },
];

interface Props {
  open: boolean;
  accountId: number;
  accountName: string;
  onClose: () => void;
  onImported: () => void;
}

export const ImportWizard: React.FC<Props> = ({ open, accountId, accountName, onClose, onImported }) => {
  const [step, setStep] = useState(1);
  const [format, setFormat] = useState('csv');
  const [file, setFile] = useState<File | null>(null);
  const [mapping, setMapping] = useState<Record<string, string>>({});
  const [result, setResult] = useState<any>(null);
  const [importing, setImporting] = useState(false);
  const [error, setError] = useState('');
  const fileRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (open) { setStep(1); setFile(null); setMapping({}); setResult(null); setError(''); }
  }, [open]);

  useEffect(() => {
    if (open) {
      apiGetImportMappings().then(m => {
        if (m?.mappingJson) setMapping(m.mappingJson);
      }).catch(() => {});
    }
  }, [open]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) setFile(f);
  };

  const handleImport = async () => {
    if (!file) return;
    setImporting(true); setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      formData.append('format', format);
      if (Object.keys(mapping).length) formData.append('mapping', JSON.stringify(mapping));
      const res = await apiImport(accountId, formData);
      setResult(res);
      if (Object.keys(mapping).length) await apiSaveImportMappings({ format, mappingJson: mapping }).catch(() => {});
      onImported();
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur lors de l\'import');
    } finally {
      setImporting(false);
    }
  };

  const stepLabels = ['Fichier', 'Vérification', 'Import'];

  return (
    <Modal open={open} onClose={onClose} title={`Import — ${accountName}`} width={640}>
      {/* Stepper */}
      <div style={{ display: 'flex', gap: '4px', marginBottom: '24px' }}>
        {stepLabels.map((l, i) => (
          <div key={i} style={{ flex: 1, textAlign: 'center' }}>
            <div style={{
              width: '28px', height: '28px', borderRadius: '50%', margin: '0 auto 4px',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              fontSize: '0.75rem', fontWeight: 600,
              background: step > i + 1 ? '#048604' : step === i + 1 ? '#008577' : '#e8e8eb',
              color: step >= i + 1 ? '#fff' : '#7a7a84',
            }}>
              {step > i + 1 ? '✓' : i + 1}
            </div>
            <span style={{ fontSize: '0.65rem', color: step === i + 1 ? '#008577' : '#7a7a84', fontWeight: 500 }}>{l}</span>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Select label="Format du fichier" value={format} onChange={e => setFormat(e.target.value)} options={FORMATS} />

          <div
            style={{ border: '2px dashed #d5d5d8', borderRadius: '8px', padding: '40px 20px', textAlign: 'center', color: '#7a7a84', cursor: 'pointer' }}
            onClick={() => fileRef.current?.click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
          >
            <Icons.Upload />
            <p style={{ margin: '8px 0 0', fontSize: '0.8rem' }}>
              {file ? file.name : 'Cliquez ou déposez un fichier ici'}
            </p>
          </div>
          <input ref={fileRef} type="file" style={{ display: 'none' }} onChange={handleFileChange} accept=".csv,.xml,.ofx,.txt" />

          {file && format === 'csv' && (
            <div style={{ padding: '12px', background: '#f9f9f9', borderRadius: '5px', fontSize: '0.8rem' }}>
              <strong>Mapping des colonnes (optionnel)</strong>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                {FIELD_LABELS.map(col => (
                  <div key={col} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem' }}>
                    <span style={{ width: '80px', color: '#5a5a64', flexShrink: 0 }}>{col} →</span>
                    <input
                      value={mapping[col.toLowerCase()] || ''}
                      onChange={e => setMapping(m => ({ ...m, [col.toLowerCase()]: e.target.value }))}
                      placeholder={`Nom colonne`}
                      style={{ flex: 1, padding: '4px 6px', fontSize: '0.7rem', border: '1px solid #d5d5d8', borderRadius: '4px', fontFamily: "'Montserrat', sans-serif" }}
                    />
                  </div>
                ))}
              </div>
            </div>
          )}

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Btn variant="secondary" onClick={onClose}>Annuler</Btn>
            <Btn disabled={!file} onClick={() => setStep(2)}>Suivant</Btn>
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#FFF7ED', border: '1px solid #C24E00', borderRadius: '5px', padding: '12px 16px' }}>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#C24E00', fontWeight: 500 }}>Attention</p>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#5a5a64' }}>
              Le compte « {accountName} » peut déjà contenir des opérations. Les doublons (même date, montant et type) seront ignorés automatiquement.
            </p>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#5a5a64', margin: 0 }}>
            Fichier sélectionné : <strong>{file?.name}</strong>
          </p>
          {error && <div style={{ fontSize: '0.8rem', color: '#E91B0C', background: '#fef2f2', padding: '8px 12px', borderRadius: '5px' }}>{error}</div>}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Btn variant="secondary" onClick={() => setStep(1)}>Précédent</Btn>
            <Btn onClick={() => { setStep(3); handleImport(); }}>Importer</Btn>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          {importing ? (
            <>
              <div style={{ width: '40px', height: '40px', border: '3px solid #e8e8eb', borderTopColor: '#008577', borderRadius: '50%', margin: '0 auto', animation: 'spin 0.8s linear infinite' }} />
              <p style={{ marginTop: '16px', fontSize: '0.875rem', color: '#5a5a64' }}>Import en cours...</p>
            </>
          ) : result ? (
            <>
              <div style={{ color: '#048604', marginBottom: '8px', display: 'flex', justifyContent: 'center' }}><Icons.Check /></div>
              <p style={{ fontSize: '0.875rem', color: '#048604', fontWeight: 500 }}>
                Import terminé : {result.imported} opération(s) ajoutée(s), {result.skipped} doublon(s) ignoré(s)
              </p>
              <Btn style={{ marginTop: '16px' }} onClick={onClose}>Fermer</Btn>
            </>
          ) : (
            <p style={{ color: '#E91B0C' }}>{error || 'Une erreur est survenue'}</p>
          )}
        </div>
      )}
    </Modal>
  );
};

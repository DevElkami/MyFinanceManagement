// Import wizard (4 steps)
const ImportWizard = ({ open, onClose, account }) => {
  const [step, setStep] = React.useState(1);
  const [format, setFormat] = React.useState('csv');
  const [fileName, setFileName] = React.useState('');
  const [importing, setImporting] = React.useState(false);

  React.useEffect(() => { if (open) { setStep(1); setFileName(''); setImporting(false); } }, [open]);

  const mockPreview = [
    { date: '15/03/2026', type: 'CB', tiers: 'Carrefour', debit: '87.45', credit: '' },
    { date: '16/03/2026', type: 'Virement', tiers: 'Employeur SAS', debit: '', credit: '2 450.00' },
    { date: '17/03/2026', type: 'Prélèvement', tiers: 'EDF', debit: '95.20', credit: '' },
    { date: '18/03/2026', type: 'CB', tiers: 'TotalEnergies', debit: '65.30', credit: '' },
    { date: '19/03/2026', type: 'CB', tiers: 'FNAC', debit: '129.99', credit: '' },
  ];

  const handleImport = () => { setImporting(true); setTimeout(() => { setImporting(false); onClose(); }, 1500); };

  const stepLabels = ['Fichier', 'Aperçu', 'Vérification', 'Import'];

  return (
    <Modal open={open} onClose={onClose} title={`Import — ${account?.name || ''}`} width={640}>
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
            }}>{step > i + 1 ? '✓' : i + 1}</div>
            <span style={{ fontSize: '0.65rem', color: step === i + 1 ? '#008577' : '#7a7a84', fontWeight: 500 }}>{l}</span>
          </div>
        ))}
      </div>

      {step === 1 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Select label="Format du fichier" value={format} onChange={e => setFormat(e.target.value)}
            options={[{ value: 'csv', label: 'CSV' }, { value: 'xml', label: 'XML' }, { value: 'ofx', label: 'OFX' }, { value: 'cfonb', label: 'CFONB' }]} />
          <div style={{
            border: '2px dashed #d5d5d8', borderRadius: '8px', padding: '40px 20px',
            textAlign: 'center', color: '#7a7a84', cursor: 'pointer',
          }} onClick={() => setFileName('releve_mars_2026.' + format)}>
            <Icons.Upload />
            <p style={{ margin: '8px 0 0', fontSize: '0.8rem' }}>
              {fileName ? fileName : 'Cliquez pour sélectionner un fichier'}
            </p>
          </div>
          {fileName && (
            <div style={{ padding: '12px', background: '#f9f9f9', borderRadius: '5px', fontSize: '0.8rem' }}>
              <strong>Mapping des colonnes</strong>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', marginTop: '8px' }}>
                {['Date', 'Montant', 'Type', 'Tiers', 'Catégorie', 'Note'].map(col => (
                  <div key={col} style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.75rem' }}>
                    <span style={{ width: '70px', color: '#5a5a64' }}>{col} →</span>
                    <select style={{ flex: 1, padding: '4px 6px', fontSize: '0.7rem', border: '1px solid #d5d5d8', borderRadius: '4px' }}>
                      <option>Colonne {col}</option>
                    </select>
                  </div>
                ))}
              </div>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Btn variant="secondary" onClick={onClose}>Annuler</Btn>
            <Btn variant="primary" disabled={!fileName} onClick={() => setStep(2)}>Suivant</Btn>
          </div>
        </div>
      )}

      {step === 2 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <p style={{ fontSize: '0.8rem', color: '#5a5a64', margin: 0 }}>Aperçu des {mockPreview.length} opérations importées :</p>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.75rem' }}>
            <thead><tr style={{ background: '#f5f5f5', borderBottom: '1px solid #d5d5d8' }}>
              {['Date', 'Type', 'Tiers', 'Débit', 'Crédit'].map(h => (
                <th key={h} style={{ padding: '6px 8px', textAlign: 'left', fontSize: '0.65rem', textTransform: 'uppercase', fontWeight: 600 }}>{h}</th>
              ))}
            </tr></thead>
            <tbody>
              {mockPreview.map((r, i) => (
                <tr key={i} style={{ borderBottom: '1px solid #e8e8eb' }}>
                  <td style={{ padding: '6px 8px' }}>{r.date}</td>
                  <td style={{ padding: '6px 8px' }}>{r.type}</td>
                  <td style={{ padding: '6px 8px' }}>{r.tiers}</td>
                  <td style={{ padding: '6px 8px', color: '#E91B0C' }}>{r.debit}</td>
                  <td style={{ padding: '6px 8px', color: '#048604' }}>{r.credit}</td>
                </tr>
              ))}
            </tbody>
          </table>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Btn variant="secondary" onClick={() => setStep(1)}>Précédent</Btn>
            <Btn variant="primary" onClick={() => setStep(3)}>Suivant</Btn>
          </div>
        </div>
      )}

      {step === 3 && (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div style={{ background: '#FFF7ED', border: '1px solid #C24E00', borderRadius: '5px', padding: '12px 16px' }}>
            <p style={{ margin: 0, fontSize: '0.8rem', color: '#C24E00', fontWeight: 500 }}>Attention</p>
            <p style={{ margin: '4px 0 0', fontSize: '0.8rem', color: '#5a5a64' }}>
              Le compte « {account?.name} » contient déjà des opérations. Les doublons (même date, montant, tiers et type) seront ignorés automatiquement.
            </p>
          </div>
          <p style={{ fontSize: '0.8rem', color: '#5a5a64', margin: 0 }}>
            {mockPreview.length} opérations seront ajoutées au compte.
          </p>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
            <Btn variant="secondary" onClick={() => setStep(2)}>Précédent</Btn>
            <Btn variant="primary" onClick={() => { setStep(4); handleImport(); }}>Importer</Btn>
          </div>
        </div>
      )}

      {step === 4 && (
        <div style={{ textAlign: 'center', padding: '40px 20px' }}>
          {importing ? (
            <>
              <div style={{ width: '40px', height: '40px', border: '3px solid #e8e8eb', borderTopColor: '#008577', borderRadius: '50%', margin: '0 auto', animation: 'spin 0.8s linear infinite' }}></div>
              <p style={{ marginTop: '16px', fontSize: '0.875rem', color: '#5a5a64' }}>Import en cours...</p>
            </>
          ) : (
            <>
              <div style={{ color: '#048604', marginBottom: '8px' }}><Icons.Check /></div>
              <p style={{ fontSize: '0.875rem', color: '#048604', fontWeight: 500 }}>Import terminé avec succès</p>
            </>
          )}
        </div>
      )}
    </Modal>
  );
};

Object.assign(window, { ImportWizard });

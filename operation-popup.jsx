// Operation popup (add / edit)
const OperationPopup = ({ open, onClose, operation, accounts, currentAccountId, categories, tiers, onSave }) => {
  const isEdit = !!operation;
  const [date, setDate] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [type, setType] = React.useState('CB');
  const [tierId, setTierId] = React.useState('');
  const [categoryId, setCategoryId] = React.useState('');
  const [note, setNote] = React.useState('');
  const [equilibre, setEquilibre] = React.useState(true);
  const [creditDebit, setCreditDebit] = React.useState('debit');
  const [virementCompte, setVirementCompte] = React.useState('');

  React.useEffect(() => {
    if (open) {
      setDate(operation?.date || new Date().toISOString().slice(0, 10));
      setAmount(operation ? Math.abs(operation.amount).toString() : '');
      setType(operation?.type || 'CB');
      setTierId(operation?.tierId?.toString() || '');
      setCategoryId(operation?.categoryId?.toString() || '');
      setNote(operation?.note || '');
      setEquilibre(operation?.equilibre ?? true);
      setCreditDebit(operation?.creditDebit || 'debit');
      setVirementCompte('');
    }
  }, [open, operation]);

  const handleSave = () => {
    const amt = parseFloat(amount) || 0;
    onSave({
      ...(operation || {}),
      date, amount: creditDebit === 'debit' ? -Math.abs(amt) : Math.abs(amt),
      type, tierId: +tierId, categoryId: +categoryId, note, equilibre, creditDebit,
      accountId: currentAccountId,
    });
    onClose();
  };

  const otherAccounts = accounts.filter(a => a.id !== currentAccountId);

  return (
    <Modal open={open} onClose={onClose} title={isEdit ? "Modifier l'opération" : 'Nouvelle opération'} width={480}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        {/* Credit/Debit toggle */}
        <div style={{ display: 'flex', gap: '8px' }}>
          {['debit', 'credit'].map(cd => (
            <button key={cd} onClick={() => setCreditDebit(cd)} style={{
              flex: 1, padding: '8px', borderRadius: '5px', border: '1px solid',
              borderColor: creditDebit === cd ? (cd === 'debit' ? '#E91B0C' : '#048604') : '#d5d5d8',
              background: creditDebit === cd ? (cd === 'debit' ? '#fef2f2' : '#f0fdf4') : '#fff',
              color: creditDebit === cd ? (cd === 'debit' ? '#E91B0C' : '#048604') : '#7a7a84',
              cursor: 'pointer', fontWeight: 500, fontSize: '0.8rem',
              fontFamily: "'Montserrat', sans-serif",
            }}>{cd === 'debit' ? 'Débit' : 'Crédit'}</button>
          ))}
        </div>

        <Input label="Date" type="date" value={date} onChange={e => setDate(e.target.value)} />
        <Input label="Montant" type="number" value={amount} onChange={e => setAmount(e.target.value)} step="0.01" placeholder="0.00" />
        <Select label="Type d'opération" value={type} onChange={e => setType(e.target.value)}
          options={OP_TYPES.map(t => ({ value: t, label: t }))} />
        <Select label="Tiers" value={tierId} onChange={e => setTierId(e.target.value)}
          options={tiers.map(t => ({ value: t.id, label: t.label }))} placeholder="Sélectionner un tiers" />
        <Select label="Catégorie" value={categoryId} onChange={e => setCategoryId(e.target.value)}
          options={categories.map(c => ({ value: c.id, label: c.label + ' (' + c.type + ')' }))} placeholder="Sélectionner une catégorie" />
        <Input label="Note" value={note} onChange={e => setNote(e.target.value)} placeholder="Note facultative" />

        {otherAccounts.length > 0 && (
          <Select label="Virement inter-comptes" value={virementCompte} onChange={e => setVirementCompte(e.target.value)}
            options={otherAccounts.map(a => ({ value: a.id, label: a.name }))} placeholder="Aucun (pas de virement)" />
        )}

        <label style={{ display: 'flex', alignItems: 'center', gap: '8px', fontSize: '0.8rem', color: '#5a5a64' }}>
          <input type="checkbox" checked={equilibre} onChange={e => setEquilibre(e.target.checked)} />
          Inclure dans l'équilibrage
        </label>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
          <Btn variant="secondary" onClick={onClose}>Fermer</Btn>
          <Btn variant="primary" onClick={handleSave}>Valider</Btn>
        </div>
      </div>
    </Modal>
  );
};

Object.assign(window, { OperationPopup });

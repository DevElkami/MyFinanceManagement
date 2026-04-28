// Categories, Tiers, Echéancier management screens
const ManagementScreen = ({ type, items, onBack, onAdd, onEdit, onDelete, columns }) => {
  const [selected, setSelected] = React.useState(null);
  return (
    <div style={mgmtStyles.root}>
      <div style={mgmtStyles.toolbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button style={mgmtStyles.backBtn} onClick={onBack}><Icons.ChevronLeft /> Retour</button>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>{type}</h2>
        </div>
        <div style={{ display: 'flex', gap: '8px' }}>
          <Btn variant="primary" size="sm" onClick={onAdd}><Icons.Plus /> Ajouter</Btn>
          <Btn variant="secondary" size="sm" disabled={!selected} onClick={() => selected && onEdit(selected)}><Icons.Edit /> Modifier</Btn>
          <Btn variant="danger" size="sm" disabled={!selected} onClick={() => selected && onDelete(selected.id)}><Icons.Trash /> Supprimer</Btn>
        </div>
      </div>
      <div style={mgmtStyles.tableWrap}>
        <table style={mgmtStyles.table}>
          <thead><tr style={mgmtStyles.thead}>
            {columns.map(c => <th key={c.key} style={mgmtStyles.th}>{c.label}</th>)}
          </tr></thead>
          <tbody>
            {items.map((item, idx) => (
              <tr key={item.id} onClick={() => setSelected(item)}
                style={{ ...mgmtStyles.tr, background: selected?.id === item.id ? '#edf7f6' : idx % 2 ? '#fafafa' : '#fff' }}>
                {columns.map(c => <td key={c.key} style={mgmtStyles.td}>{c.render ? c.render(item) : item[c.key]}</td>)}
              </tr>
            ))}
          </tbody>
        </table>
        {items.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: '#7a7a84', fontSize: '0.8rem' }}>Aucun élément</div>}
      </div>
    </div>
  );
};

// Category form modal
const CategoryFormModal = ({ open, onClose, category, onSave }) => {
  const [label, setLabel] = React.useState('');
  const [type, setType] = React.useState('Divers');
  React.useEffect(() => {
    setLabel(category?.label || '');
    setType(category?.type || 'Divers');
  }, [category, open]);

  return (
    <Modal open={open} onClose={onClose} title={category ? 'Modifier la catégorie' : 'Nouvelle catégorie'}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input label="Libellé" value={label} onChange={e => setLabel(e.target.value)} placeholder="Ex: Alimentation" />
        <Select label="Type" value={type} onChange={e => setType(e.target.value)}
          options={CATEGORY_TYPES.map(t => ({ value: t, label: t }))} />
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <Btn variant="secondary" onClick={onClose}>Annuler</Btn>
          <Btn variant="primary" onClick={() => { onSave({ ...(category || {}), label, type }); onClose(); }}>Valider</Btn>
        </div>
      </div>
    </Modal>
  );
};

// Tiers form modal
const TierFormModal = ({ open, onClose, tier, onSave }) => {
  const [label, setLabel] = React.useState('');
  React.useEffect(() => { setLabel(tier?.label || ''); }, [tier, open]);
  return (
    <Modal open={open} onClose={onClose} title={tier ? 'Modifier le tiers' : 'Nouveau tiers'}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input label="Libellé" value={label} onChange={e => setLabel(e.target.value)} placeholder="Ex: Sécurité Sociale" />
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <Btn variant="secondary" onClick={onClose}>Annuler</Btn>
          <Btn variant="primary" onClick={() => { onSave({ ...(tier || {}), label }); onClose(); }}>Valider</Btn>
        </div>
      </div>
    </Modal>
  );
};

// Echéance form modal
const EcheanceFormModal = ({ open, onClose, echeance, categories, tiers, onSave }) => {
  const [date, setDate] = React.useState('');
  const [amount, setAmount] = React.useState('');
  const [type, setType] = React.useState('Prélèvement');
  const [tierId, setTierId] = React.useState('');
  const [categoryId, setCategoryId] = React.useState('');
  const [note, setNote] = React.useState('');
  const [creditDebit, setCreditDebit] = React.useState('debit');

  React.useEffect(() => {
    setDate(echeance?.date || new Date().toISOString().slice(0, 10));
    setAmount(echeance ? Math.abs(echeance.amount).toString() : '');
    setType(echeance?.type || 'Prélèvement');
    setTierId(echeance?.tierId?.toString() || '');
    setCategoryId(echeance?.categoryId?.toString() || '');
    setNote(echeance?.note || '');
    setCreditDebit(echeance?.creditDebit || 'debit');
  }, [echeance, open]);

  return (
    <Modal open={open} onClose={onClose} title={echeance ? "Modifier l'échéance" : 'Nouvelle échéance'}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
        <div style={{ display: 'flex', gap: '8px' }}>
          {['debit', 'credit'].map(cd => (
            <button key={cd} onClick={() => setCreditDebit(cd)} style={{
              flex: 1, padding: '8px', borderRadius: '5px', border: '1px solid',
              borderColor: creditDebit === cd ? (cd === 'debit' ? '#E91B0C' : '#048604') : '#d5d5d8',
              background: creditDebit === cd ? (cd === 'debit' ? '#fef2f2' : '#f0fdf4') : '#fff',
              color: creditDebit === cd ? (cd === 'debit' ? '#E91B0C' : '#048604') : '#7a7a84',
              cursor: 'pointer', fontWeight: 500, fontSize: '0.8rem', fontFamily: "'Montserrat', sans-serif",
            }}>{cd === 'debit' ? 'Débit' : 'Crédit'}</button>
          ))}
        </div>
        <Input label="Date de l'échéance (jour du mois)" type="date" value={date} onChange={e => setDate(e.target.value)} />
        <Input label="Montant" type="number" value={amount} onChange={e => setAmount(e.target.value)} step="0.01" />
        <Select label="Type" value={type} onChange={e => setType(e.target.value)}
          options={OP_TYPES.map(t => ({ value: t, label: t }))} />
        <Select label="Tiers" value={tierId} onChange={e => setTierId(e.target.value)}
          options={tiers.map(t => ({ value: t.id, label: t.label }))} placeholder="Sélectionner" />
        <Select label="Catégorie" value={categoryId} onChange={e => setCategoryId(e.target.value)}
          options={categories.map(c => ({ value: c.id, label: c.label }))} placeholder="Sélectionner" />
        <Input label="Note" value={note} onChange={e => setNote(e.target.value)} placeholder="Note facultative" />
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
          <Btn variant="secondary" onClick={onClose}>Annuler</Btn>
          <Btn variant="primary" onClick={() => {
            const amt = parseFloat(amount) || 0;
            onSave({ ...(echeance || {}), date, amount: creditDebit === 'debit' ? -Math.abs(amt) : Math.abs(amt), type, tierId: +tierId, categoryId: +categoryId, note, creditDebit });
            onClose();
          }}>Valider</Btn>
        </div>
      </div>
    </Modal>
  );
};

const mgmtStyles = {
  root: { display: 'flex', flexDirection: 'column', height: '100%' },
  toolbar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 20px', background: '#fff', borderBottom: '1px solid #e8e8eb', flexWrap: 'wrap', gap: '8px',
  },
  backBtn: {
    display: 'flex', alignItems: 'center', gap: '2px', background: 'none',
    border: 'none', cursor: 'pointer', color: '#008577', fontSize: '0.8rem',
    fontWeight: 500, fontFamily: "'Montserrat', sans-serif",
  },
  tableWrap: { flex: 1, overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', fontFamily: "'Montserrat', sans-serif" },
  thead: { background: '#f5f5f5', borderBottom: '2px solid #d5d5d8' },
  th: { padding: '8px 12px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', color: '#27272f' },
  tr: { borderBottom: '1px solid #e8e8eb', cursor: 'pointer', transition: 'background 100ms' },
  td: { padding: '8px 12px', color: '#27272f' },
};

Object.assign(window, { ManagementScreen, CategoryFormModal, TierFormModal, EcheanceFormModal });

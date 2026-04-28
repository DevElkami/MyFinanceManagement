// Home screen - accounts dashboard
const HomeScreen = ({ accounts, operations, onSelect, onAdd, onEdit, onDelete, onEquilibrage }) => {
  const now = new Date();
  const getMonthStats = (accountId, monthsBack) => {
    const ops = operations.filter(o => o.accountId === accountId);
    const target = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - monthsBack + 1, 0);
    const filtered = ops.filter(o => {
      const d = new Date(o.date);
      return d >= target && d <= end;
    });
    const depenses = filtered.filter(o => o.amount < 0).reduce((s, o) => s + o.amount, 0);
    const recettes = filtered.filter(o => o.amount > 0).reduce((s, o) => s + o.amount, 0);
    return { depenses, recettes };
  };

  const getSolde = (acc) => {
    const ops = operations.filter(o => o.accountId === acc.id);
    return acc.soldeInitial + ops.reduce((s, o) => s + o.amount, 0);
  };

  const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  const months = [0, 1, 2, 3].map(i => {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    return { label: monthNames[d.getMonth()] + ' ' + d.getFullYear(), back: i };
  });

  return (
    <div style={homeStyles.root}>
      <div style={homeStyles.topBar}>
        <h2 style={{ margin: 0, fontSize: '1.25rem', fontWeight: 500 }}>Mes comptes</h2>
        <div style={{ display: 'flex', gap: '8px' }}>
          {accounts.length >= 2 && (
            <Btn variant="outline" onClick={onEquilibrage}><Icons.Scale /> Équilibrage</Btn>
          )}
          <Btn variant="primary" onClick={onAdd}><Icons.Plus /> Nouveau compte</Btn>
        </div>
      </div>

      <div style={homeStyles.grid}>
        {accounts.map(acc => {
          const solde = getSolde(acc);
          return (
            <div key={acc.id} style={homeStyles.card} onClick={() => onSelect(acc.id)}>
              <div style={homeStyles.cardHeader}>
                <div>
                  <h3 style={homeStyles.cardTitle}>{acc.name}</h3>
                  <p style={homeStyles.cardBank}>{acc.bank} — {acc.owner}</p>
                </div>
                <div style={{ display: 'flex', gap: '4px' }} onClick={e => e.stopPropagation()}>
                  <button style={homeStyles.iconBtn} onClick={() => onEdit(acc)}><Icons.Edit /></button>
                  <button style={{ ...homeStyles.iconBtn, color: '#E91B0C' }} onClick={() => onDelete(acc.id)}><Icons.Trash /></button>
                </div>
              </div>
              <div style={homeStyles.solde}>
                <span style={{ fontSize: '0.75rem', color: '#7a7a84' }}>Solde</span>
                <span style={{ fontSize: '1.5rem', fontWeight: 500, color: solde >= 0 ? '#048604' : '#E91B0C' }}>{fmt(solde)}</span>
              </div>
              <div style={homeStyles.monthsRow}>
                {months.map(m => {
                  const s = getMonthStats(acc.id, m.back);
                  return (
                    <div key={m.back} style={homeStyles.monthCol}>
                      <span style={homeStyles.monthLabel}>{m.label}</span>
                      <span style={{ fontSize: '0.7rem', color: '#048604' }}>+{fmt(s.recettes)}</span>
                      <span style={{ fontSize: '0.7rem', color: '#E91B0C' }}>{fmt(s.depenses)}</span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>

      {accounts.length === 0 && (
        <div style={homeStyles.empty}>
          <Icons.Wallet />
          <p>Aucun compte. Créez votre premier compte pour commencer.</p>
          <Btn variant="primary" onClick={onAdd}><Icons.Plus /> Créer un compte</Btn>
        </div>
      )}
    </div>
  );
};

// Account form modal
const AccountFormModal = ({ open, onClose, account, onSave }) => {
  const [name, setName] = React.useState(account?.name || '');
  const [bank, setBank] = React.useState(account?.bank || '');
  const [owner, setOwner] = React.useState(account?.owner || '');
  const [solde, setSolde] = React.useState(account?.soldeInitial?.toString() || '0');

  React.useEffect(() => {
    setName(account?.name || '');
    setBank(account?.bank || '');
    setOwner(account?.owner || '');
    setSolde(account?.soldeInitial?.toString() || '0');
  }, [account, open]);

  return (
    <Modal open={open} onClose={onClose} title={account ? 'Modifier le compte' : 'Nouveau compte'}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <Input label="Nom du compte" value={name} onChange={e => setName(e.target.value)} placeholder="Ex: Compte Courant" />
        <Input label="Banque" value={bank} onChange={e => setBank(e.target.value)} placeholder="Ex: Banque Populaire" />
        <Input label="Propriétaire" value={owner} onChange={e => setOwner(e.target.value)} placeholder="Ex: Jean Dupont" />
        <Input label="Solde initial" type="number" value={solde} onChange={e => setSolde(e.target.value)} step="0.01" />
        <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end', marginTop: '8px' }}>
          <Btn variant="secondary" onClick={onClose}>Annuler</Btn>
          <Btn variant="primary" onClick={() => onSave({ ...(account || {}), name, bank, owner, soldeInitial: parseFloat(solde) || 0 })}>Valider</Btn>
        </div>
      </div>
    </Modal>
  );
};

const homeStyles = {
  root: { padding: '24px' },
  topBar: { display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', flexWrap: 'wrap', gap: '12px' },
  grid: { display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))', gap: '16px' },
  card: {
    background: '#fff', borderRadius: '8px', padding: '20px',
    boxShadow: '0 1px 2px rgba(0,0,0,0.05)', cursor: 'pointer',
    transition: 'box-shadow 150ms ease-in-out', border: '1px solid #e8e8eb',
  },
  cardHeader: { display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' },
  cardTitle: { margin: 0, fontSize: '1rem', fontWeight: 500, color: '#27272f' },
  cardBank: { margin: '2px 0 0', fontSize: '0.75rem', color: '#7a7a84' },
  iconBtn: {
    background: 'none', border: 'none', cursor: 'pointer', color: '#7a7a84',
    padding: '4px', borderRadius: '4px', display: 'flex',
  },
  solde: { display: 'flex', flexDirection: 'column', margin: '16px 0' },
  monthsRow: { display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '8px', borderTop: '1px solid #e8e8eb', paddingTop: '12px' },
  monthCol: { display: 'flex', flexDirection: 'column', gap: '2px' },
  monthLabel: { fontSize: '0.65rem', fontWeight: 500, color: '#5a5a64', textTransform: 'uppercase' },
  empty: { textAlign: 'center', padding: '60px 20px', color: '#7a7a84' },
};

Object.assign(window, { HomeScreen, AccountFormModal });

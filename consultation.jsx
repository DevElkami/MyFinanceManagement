// Consultation screen - operations list with filters
const ConsultationScreen = ({ account, accounts, operations, categories, tiers, onBack, onAddOp, onEditOp, onDeleteOp, onImport, onCategories, onTiers, onEcheances, onToggleStatut }) => {
  const [filterType, setFilterType] = React.useState('');
  const [filterCat, setFilterCat] = React.useState('');
  const [filterStatut, setFilterStatut] = React.useState('');
  const [filterTier, setFilterTier] = React.useState('');
  const [filterNote, setFilterNote] = React.useState('');
  const [showFilters, setShowFilters] = React.useState(false);
  const [rapprocheMontant, setRapprocheMontant] = React.useState('');

  const ops = operations.filter(o => o.accountId === account.id);
  let filtered = [...ops];
  if (filterType) filtered = filtered.filter(o => o.type === filterType);
  if (filterCat) filtered = filtered.filter(o => o.categoryId === +filterCat);
  if (filterStatut) filtered = filtered.filter(o => o.statut === filterStatut);
  if (filterTier) filtered = filtered.filter(o => o.tierId === +filterTier);
  if (filterNote) filtered = filtered.filter(o => o.note.toLowerCase().includes(filterNote.toLowerCase()));
  filtered.sort((a, b) => a.date.localeCompare(b.date));

  // Compute running balance
  const allSorted = [...ops].sort((a, b) => a.date.localeCompare(b.date));
  const balanceMap = {};
  let running = account.soldeInitial;
  allSorted.forEach(o => { running += o.amount; balanceMap[o.id] = running; });

  const solde = account.soldeInitial + ops.reduce((s, o) => s + o.amount, 0);
  const soldePointe = account.soldeInitial + ops.filter(o => o.statut === 'Pointé' || o.statut === 'Rapproché').reduce((s, o) => s + o.amount, 0);
  const pointeTotal = ops.filter(o => o.statut === 'Pointé').reduce((s, o) => s + o.amount, 0);
  const ecartRapproche = rapprocheMontant ? (parseFloat(rapprocheMontant) - pointeTotal) : null;

  const now = new Date();
  const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
  const getMonthStats = (monthsBack) => {
    const target = new Date(now.getFullYear(), now.getMonth() - monthsBack, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - monthsBack + 1, 0);
    const f = ops.filter(o => { const d = new Date(o.date); return d >= target && d <= end; });
    return {
      label: monthNames[target.getMonth()] + ' ' + target.getFullYear(),
      depenses: f.filter(o => o.amount < 0).reduce((s, o) => s + o.amount, 0),
      recettes: f.filter(o => o.amount > 0).reduce((s, o) => s + o.amount, 0),
    };
  };
  const months = [0, 1, 2, 3].map(i => getMonthStats(i));

  const getTierLabel = (id) => (tiers.find(t => t.id === id) || {}).label || '—';
  const getCatLabel = (id) => (categories.find(c => c.id === id) || {}).label || '—';

  const statutColor = { 'Aucun': '#babac4', 'Pointé': '#0B78D0', 'Rapproché': '#048604' };

  const handleRapprocher = () => {
    if (window.confirm('Rapprocher toutes les opérations pointées ? Cette action est irréversible.')) {
      // Visual only - would mark pointé as rapproché
    }
  };

  return (
    <div style={consStyles.root}>
      {/* Top toolbar */}
      <div style={consStyles.toolbar}>
        <div style={consStyles.toolLeft}>
          <button style={consStyles.backBtn} onClick={onBack}><Icons.ChevronLeft /> Retour</button>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>{account.name}</h2>
          <Badge color={solde >= 0 ? '#048604' : '#E91B0C'}>{fmt(solde)}</Badge>
        </div>
        <div style={consStyles.toolRight}>
          <Btn variant="ghost" size="sm" onClick={onImport}><Icons.Upload /> Importer</Btn>
          <Btn variant="ghost" size="sm" onClick={onCategories}><Icons.Tag /> Catégories</Btn>
          <Btn variant="ghost" size="sm" onClick={onTiers}><Icons.Users /> Tiers</Btn>
          <Btn variant="ghost" size="sm" onClick={onEcheances}><Icons.Clock /> Échéancier</Btn>
          <Btn variant="primary" size="sm" onClick={onAddOp}><Icons.Plus /> Opération</Btn>
        </div>
      </div>

      {/* Rapprochement bar */}
      <div style={consStyles.rapproBar}>
        <span style={{ fontSize: '0.8rem', fontWeight: 500, color: '#5a5a64' }}>Rapprochement :</span>
        <input
          type="number" step="0.01" placeholder="Montant à rapprocher"
          value={rapprocheMontant} onChange={e => setRapprocheMontant(e.target.value)}
          style={consStyles.rapproInput}
        />
        {ecartRapproche !== null && (
          <span style={{ fontSize: '0.8rem', color: Math.abs(ecartRapproche) < 0.01 ? '#048604' : '#C24E00' }}>
            Écart : {fmt(ecartRapproche)}
          </span>
        )}
        <Btn variant="secondary" size="sm" onClick={handleRapprocher}>Rapprocher</Btn>
        <div style={{ marginLeft: 'auto' }}>
          <Btn variant="ghost" size="sm" onClick={() => setShowFilters(!showFilters)}>
            <Icons.Filter /> Filtres {showFilters ? '▲' : '▼'}
          </Btn>
        </div>
      </div>

      {/* Filter row */}
      {showFilters && (
        <div style={consStyles.filterRow}>
          <Select label="Type" value={filterType} onChange={e => setFilterType(e.target.value)}
            options={OP_TYPES.map(t => ({ value: t, label: t }))} placeholder="Tous" style={{ minWidth: '120px' }} />
          <Select label="Catégorie" value={filterCat} onChange={e => setFilterCat(e.target.value)}
            options={categories.map(c => ({ value: c.id, label: c.label }))} placeholder="Toutes" style={{ minWidth: '140px' }} />
          <Select label="Statut" value={filterStatut} onChange={e => setFilterStatut(e.target.value)}
            options={STATUTS.map(s => ({ value: s, label: s }))} placeholder="Tous" style={{ minWidth: '100px' }} />
          <Select label="Tiers" value={filterTier} onChange={e => setFilterTier(e.target.value)}
            options={tiers.map(t => ({ value: t.id, label: t.label }))} placeholder="Tous" style={{ minWidth: '140px' }} />
          <Input label="Note" value={filterNote} onChange={e => setFilterNote(e.target.value)} placeholder="Rechercher..." style={{ minWidth: '140px' }} />
          <Btn variant="ghost" size="sm" style={{ alignSelf: 'flex-end' }} onClick={() => { setFilterType(''); setFilterCat(''); setFilterStatut(''); setFilterTier(''); setFilterNote(''); }}>Réinitialiser</Btn>
        </div>
      )}

      {/* Operations table */}
      <div style={consStyles.tableWrap}>
        <table style={consStyles.table}>
          <thead>
            <tr style={consStyles.thead}>
              <th style={consStyles.th}>Date</th>
              <th style={consStyles.th}>Type</th>
              <th style={consStyles.th}>Tiers</th>
              <th style={{ ...consStyles.th, textAlign: 'right' }}>Débit</th>
              <th style={{ ...consStyles.th, textAlign: 'right' }}>Crédit</th>
              <th style={{ ...consStyles.th, textAlign: 'center', width: '70px' }}>Statut</th>
              <th style={{ ...consStyles.th, textAlign: 'right' }}>Solde</th>
              <th style={{ ...consStyles.th, width: '60px' }}></th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((op, idx) => (
              <tr key={op.id} style={{ ...consStyles.tr, background: idx % 2 ? '#fafafa' : '#fff' }}>
                <td style={consStyles.td}>{fmtDate(op.date)}</td>
                <td style={consStyles.td}><span style={{ fontSize: '0.75rem' }}>{op.type}</span></td>
                <td style={consStyles.td}>{getTierLabel(op.tierId)}</td>
                <td style={{ ...consStyles.td, textAlign: 'right', color: '#E91B0C' }}>
                  {op.amount < 0 ? fmt(Math.abs(op.amount)) : ''}
                </td>
                <td style={{ ...consStyles.td, textAlign: 'right', color: '#048604' }}>
                  {op.amount > 0 ? fmt(op.amount) : ''}
                </td>
                <td style={{ ...consStyles.td, textAlign: 'center' }}>
                  <button
                    onClick={() => onToggleStatut(op.id)}
                    style={{ ...consStyles.statutBtn, background: statutColor[op.statut] || '#babac4' }}
                    title={op.statut + ' (F5 pour changer)'}
                  >{op.statut === 'Aucun' ? '○' : op.statut === 'Pointé' ? '●' : '✓'}</button>
                </td>
                <td style={{ ...consStyles.td, textAlign: 'right', fontWeight: 500 }}>
                  {balanceMap[op.id] !== undefined ? fmt(balanceMap[op.id]) : ''}
                </td>
                <td style={{ ...consStyles.td, textAlign: 'right' }}>
                  <div style={{ display: 'flex', gap: '2px', justifyContent: 'flex-end' }}>
                    <button style={consStyles.iconBtn} onClick={() => onEditOp(op)}><Icons.Edit /></button>
                    <button style={{ ...consStyles.iconBtn, color: '#E91B0C' }} onClick={() => onDeleteOp(op.id)}><Icons.Trash /></button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
        {filtered.length === 0 && <div style={{ textAlign: 'center', padding: '40px', color: '#7a7a84', fontSize: '0.875rem' }}>Aucune opération trouvée</div>}
      </div>

      {/* Footer stats */}
      <div style={consStyles.footer}>
        <div style={consStyles.footerMonths}>
          {months.map(m => (
            <div key={m.label} style={consStyles.footerMonth}>
              <span style={{ fontSize: '0.7rem', fontWeight: 500, color: '#5a5a64' }}>{m.label}</span>
              <span style={{ fontSize: '0.7rem', color: '#048604' }}>+{fmt(m.recettes)}</span>
              <span style={{ fontSize: '0.7rem', color: '#E91B0C' }}>{fmt(m.depenses)}</span>
            </div>
          ))}
        </div>
        <div style={consStyles.footerSoldes}>
          <div style={consStyles.footerItem}>
            <span style={{ fontSize: '0.7rem', color: '#5a5a64' }}>Solde pointé</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: '#0B78D0' }}>{fmt(soldePointe)}</span>
          </div>
          <div style={consStyles.footerItem}>
            <span style={{ fontSize: '0.7rem', color: '#5a5a64' }}>Solde courant</span>
            <span style={{ fontSize: '0.875rem', fontWeight: 500, color: solde >= 0 ? '#048604' : '#E91B0C' }}>{fmt(solde)}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

const consStyles = {
  root: { display: 'flex', flexDirection: 'column', height: '100%' },
  toolbar: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 20px', background: '#fff', borderBottom: '1px solid #e8e8eb',
    flexWrap: 'wrap', gap: '8px',
  },
  toolLeft: { display: 'flex', alignItems: 'center', gap: '12px' },
  toolRight: { display: 'flex', alignItems: 'center', gap: '4px', flexWrap: 'wrap' },
  backBtn: {
    display: 'flex', alignItems: 'center', gap: '2px', background: 'none',
    border: 'none', cursor: 'pointer', color: '#008577', fontSize: '0.8rem',
    fontWeight: 500, fontFamily: "'Montserrat', sans-serif",
  },
  rapproBar: {
    display: 'flex', alignItems: 'center', gap: '12px', padding: '8px 20px',
    background: '#f9f9f9', borderBottom: '1px solid #e8e8eb', flexWrap: 'wrap',
  },
  rapproInput: {
    padding: '5px 10px', border: '1px solid #d5d5d8', borderRadius: '5px',
    fontSize: '0.8rem', width: '160px', fontFamily: "'Montserrat', sans-serif",
  },
  filterRow: {
    display: 'flex', gap: '12px', padding: '12px 20px', background: '#f9f9f9',
    borderBottom: '1px solid #e8e8eb', flexWrap: 'wrap', alignItems: 'flex-end',
  },
  tableWrap: { flex: 1, overflow: 'auto' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', fontFamily: "'Montserrat', sans-serif" },
  thead: { background: '#f5f5f5', borderBottom: '2px solid #d5d5d8', position: 'sticky', top: 0 },
  th: {
    padding: '8px 12px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 600,
    color: '#27272f', textTransform: 'uppercase', letterSpacing: '0.3px',
  },
  tr: { borderBottom: '1px solid #e8e8eb', transition: 'background 100ms' },
  td: { padding: '8px 12px', color: '#27272f' },
  statutBtn: {
    width: '24px', height: '24px', borderRadius: '50%', border: 'none',
    color: '#fff', fontSize: '12px', cursor: 'pointer', lineHeight: 1,
  },
  iconBtn: {
    background: 'none', border: 'none', cursor: 'pointer', color: '#7a7a84',
    padding: '2px', borderRadius: '4px', display: 'flex',
  },
  footer: {
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '12px 20px', background: '#fff', borderTop: '2px solid #e8e8eb',
    flexWrap: 'wrap', gap: '12px',
  },
  footerMonths: { display: 'flex', gap: '20px' },
  footerMonth: { display: 'flex', flexDirection: 'column', gap: '1px' },
  footerSoldes: { display: 'flex', gap: '24px' },
  footerItem: { display: 'flex', flexDirection: 'column', alignItems: 'flex-end' },
};

Object.assign(window, { ConsultationScreen });

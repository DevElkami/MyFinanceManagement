// Équilibrage + Statistics screens
const EquilibrageScreen = ({ accounts, operations, categories, onBack, onStats }) => {
  const [acc1Id, setAcc1Id] = React.useState(accounts[0]?.id || '');
  const [acc2Id, setAcc2Id] = React.useState(accounts[1]?.id || '');
  const [activeMonth, setActiveMonth] = React.useState(null);
  const [expandedCats, setExpandedCats] = React.useState({});

  const acc1 = accounts.find(a => a.id === +acc1Id);
  const acc2 = accounts.find(a => a.id === +acc2Id);

  // Find common months
  const getMonths = () => {
    const ms = new Set();
    operations.filter(o => o.accountId === +acc1Id || o.accountId === +acc2Id).forEach(o => {
      ms.add(o.date.slice(0, 7));
    });
    return [...ms].sort();
  };
  const months = getMonths();

  React.useEffect(() => { if (months.length && !activeMonth) setActiveMonth(months[months.length - 1]); }, [months]);

  const getOpsForMonth = (accId, month) =>
    operations.filter(o => o.accountId === accId && o.date.startsWith(month) && o.equilibre);

  const getSalary = (accId, month) => {
    const salaireCat = categories.find(c => c.type === 'Salaire');
    if (!salaireCat) return 0;
    return getOpsForMonth(accId, month).filter(o => o.categoryId === salaireCat.id && o.amount > 0).reduce((s, o) => s + o.amount, 0);
  };

  const getDebits = (accId, month) =>
    getOpsForMonth(accId, month).filter(o => o.amount < 0).reduce((s, o) => s + o.amount, 0);

  const getDebitsByCat = (accId, month) => {
    const map = {};
    getOpsForMonth(accId, month).filter(o => o.amount < 0).forEach(o => {
      const cat = categories.find(c => c.id === o.categoryId);
      const key = cat ? cat.label : 'Non catégorisé';
      map[key] = (map[key] || 0) + o.amount;
    });
    return map;
  };

  const getOpsForCat = (accId, month, catLabel) => {
    return getOpsForMonth(accId, month).filter(o => {
      const cat = categories.find(c => c.id === o.categoryId);
      return (cat ? cat.label : 'Non catégorisé') === catLabel && o.amount < 0;
    });
  };

  const m = activeMonth;
  const sal1 = m ? getSalary(+acc1Id, m) : 0;
  const sal2 = m ? getSalary(+acc2Id, m) : 0;
  const hasSalaries = sal1 > 0 && sal2 > 0;
  const deb1 = m ? getDebits(+acc1Id, m) : 0;
  const deb2 = m ? getDebits(+acc2Id, m) : 0;
  const totalDeb = deb1 + deb2;

  const ratio1 = hasSalaries ? (sal1 + sal2) / sal1 : 0;
  const ratio2 = hasSalaries ? (sal1 + sal2) / sal2 : 0;
  const prorata1 = hasSalaries ? totalDeb / ratio2 : 0;
  const prorata2 = hasSalaries ? totalDeb / ratio1 : 0;
  const ecart1 = hasSalaries ? deb1 - prorata1 : 0;
  const ecart2 = hasSalaries ? deb2 - prorata2 : 0;

  const debByCat1 = m ? getDebitsByCat(+acc1Id, m) : {};
  const debByCat2 = m ? getDebitsByCat(+acc2Id, m) : {};
  const allCatLabels = [...new Set([...Object.keys(debByCat1), ...Object.keys(debByCat2)])].sort();

  const monthLabel = (ym) => {
    const [y, mo] = ym.split('-');
    const names = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
    return names[+mo - 1] + ' ' + y;
  };

  return (
    <div style={eqStyles.root}>
      <div style={eqStyles.toolbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button style={eqStyles.backBtn} onClick={onBack}><Icons.ChevronLeft /> Retour</button>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>Équilibrage des comptes</h2>
        </div>
        <Btn variant="outline" size="sm" onClick={onStats}><Icons.BarChart /> Statistiques</Btn>
      </div>

      {/* Account selectors */}
      <div style={eqStyles.selectors}>
        <Select label="Compte 1" value={acc1Id} onChange={e => setAcc1Id(e.target.value)}
          options={accounts.map(a => ({ value: a.id, label: a.name }))} />
        <span style={{ fontSize: '1.2rem', color: '#7a7a84', alignSelf: 'flex-end', padding: '8px' }}>⇄</span>
        <Select label="Compte 2" value={acc2Id} onChange={e => setAcc2Id(e.target.value)}
          options={accounts.map(a => ({ value: a.id, label: a.name }))} />
      </div>

      {/* Month tabs */}
      <div style={eqStyles.monthTabs}>
        {months.map(mo => (
          <button key={mo} onClick={() => setActiveMonth(mo)} style={{
            ...eqStyles.monthTab, ...(activeMonth === mo ? eqStyles.monthTabActive : {}),
          }}>{monthLabel(mo)}</button>
        ))}
      </div>

      {m && +acc1Id !== +acc2Id && (
        <div style={eqStyles.content}>
          {!hasSalaries && (
            <div style={{ background: '#FFF7ED', border: '1px solid #C24E00', borderRadius: '5px', padding: '12px', margin: '0 0 16px', fontSize: '0.8rem', color: '#C24E00' }}>
              Chaque compte doit avoir une opération « Salaire » pour effectuer les calculs de prorata.
            </div>
          )}

          {/* Category breakdown */}
          <table style={eqStyles.table}>
            <thead><tr style={eqStyles.thead}>
              <th style={eqStyles.th}>Catégorie</th>
              <th style={{ ...eqStyles.th, textAlign: 'right' }}>{acc1?.name || 'Compte 1'}</th>
              <th style={{ ...eqStyles.th, textAlign: 'right' }}>{acc2?.name || 'Compte 2'}</th>
            </tr></thead>
            <tbody>
              {allCatLabels.map(cat => {
                const expanded = expandedCats[cat];
                const ops1 = getOpsForCat(+acc1Id, m, cat);
                const ops2 = getOpsForCat(+acc2Id, m, cat);
                return (
                  <React.Fragment key={cat}>
                    <tr style={eqStyles.tr} onClick={() => setExpandedCats(p => ({ ...p, [cat]: !p[cat] }))}>
                      <td style={{ ...eqStyles.td, cursor: 'pointer', fontWeight: 500 }}>
                        <span style={{ fontSize: '0.7rem', marginRight: '4px' }}>{expanded ? '▼' : '▶'}</span>
                        {cat}
                      </td>
                      <td style={{ ...eqStyles.td, textAlign: 'right', color: '#E91B0C' }}>{fmt(debByCat1[cat] || 0)}</td>
                      <td style={{ ...eqStyles.td, textAlign: 'right', color: '#E91B0C' }}>{fmt(debByCat2[cat] || 0)}</td>
                    </tr>
                    {expanded && [...ops1, ...ops2].map((op, i) => (
                      <tr key={op.id + '-' + i} style={{ background: '#f9f9f9' }}>
                        <td style={{ ...eqStyles.td, paddingLeft: '28px', fontSize: '0.7rem', color: '#7a7a84' }}>{fmtDate(op.date)}</td>
                        <td style={{ ...eqStyles.td, textAlign: 'right', fontSize: '0.7rem', color: op.accountId === +acc1Id ? '#E91B0C' : '#babac4' }}>
                          {op.accountId === +acc1Id ? fmt(op.amount) : ''}
                        </td>
                        <td style={{ ...eqStyles.td, textAlign: 'right', fontSize: '0.7rem', color: op.accountId === +acc2Id ? '#E91B0C' : '#babac4' }}>
                          {op.accountId === +acc2Id ? fmt(op.amount) : ''}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>

          {/* Totals */}
          <div style={eqStyles.totals}>
            <div style={eqStyles.totalRow}>
              <span style={{ fontWeight: 500 }}>Total débits</span>
              <span style={{ color: '#E91B0C' }}>{fmt(deb1)}</span>
              <span style={{ color: '#E91B0C' }}>{fmt(deb2)}</span>
            </div>
            {hasSalaries && (
              <>
                <div style={eqStyles.totalRow}>
                  <span style={{ fontWeight: 500 }}>Salaires</span>
                  <span style={{ color: '#048604' }}>{fmt(sal1)}</span>
                  <span style={{ color: '#048604' }}>{fmt(sal2)}</span>
                </div>
                <div style={eqStyles.totalRow}>
                  <span style={{ fontWeight: 500 }}>Total prorata</span>
                  <span>{fmt(prorata1)}</span>
                  <span>{fmt(prorata2)}</span>
                </div>
                <div style={{ ...eqStyles.totalRow, background: '#f0f9f7', borderRadius: '5px', padding: '8px 12px' }}>
                  <span style={{ fontWeight: 600 }}>Écart</span>
                  <span style={{ fontWeight: 600, color: ecart1 >= 0 ? '#048604' : '#E91B0C' }}>{fmt(ecart1)}</span>
                  <span style={{ fontWeight: 600, color: ecart2 >= 0 ? '#048604' : '#E91B0C' }}>{fmt(ecart2)}</span>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {+acc1Id === +acc2Id && (
        <div style={{ textAlign: 'center', padding: '60px', color: '#7a7a84', fontSize: '0.875rem' }}>
          Veuillez sélectionner deux comptes différents.
        </div>
      )}
    </div>
  );
};

// Statistics screen
const StatisticsScreen = ({ accounts, operations, categories, onBack }) => {
  const [mode, setMode] = React.useState('compare');
  const [accFilter, setAccFilter] = React.useState('all');
  const [catFilter, setCatFilter] = React.useState('all');

  const modes = [
    { value: 'compare', label: 'Comparaison mois précédent' },
    { value: 'year', label: 'Cumuls année en cours' },
    { value: 'five_years', label: 'Cumuls 5 dernières années' },
    { value: 'all_time', label: 'Cumuls depuis le début' },
  ];

  // SVG chart helper
  const renderLineChart = () => {
    const w = 700, h = 300, pad = 50;
    // Generate mock chart data
    const now = new Date();
    let labels = [];
    let datasets = [];

    const monthNames = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];

    if (mode === 'compare') {
      const m1 = new Date(now.getFullYear(), now.getMonth(), 1);
      const m0 = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      labels = [monthNames[m0.getMonth()], monthNames[m1.getMonth()]];
    } else if (mode === 'year') {
      labels = monthNames.slice(0, now.getMonth() + 1);
    } else if (mode === 'five_years') {
      for (let y = now.getFullYear() - 4; y <= now.getFullYear(); y++) labels.push(y.toString());
    } else {
      const years = [...new Set(operations.map(o => o.date.slice(0, 4)))].sort();
      labels = years.length ? years : [now.getFullYear().toString()];
    }

    const catsList = catFilter === 'all' ? categories : categories.filter(c => c.id === +catFilter);
    const colors = ['#008577', '#0B78D0', '#C24E00', '#E91B0C', '#048604', '#7a7a84', '#4da69f', '#d97a3f'];

    catsList.slice(0, 6).forEach((cat, ci) => {
      const values = labels.map(() => Math.random() * 500 + 50);
      datasets.push({ label: cat.label, values, color: colors[ci % colors.length] });
    });

    if (datasets.length === 0) return <div style={{ textAlign: 'center', padding: '40px', color: '#7a7a84' }}>Aucune donnée</div>;

    const allVals = datasets.flatMap(d => d.values);
    const maxVal = Math.max(...allVals, 1);
    const xStep = labels.length > 1 ? (w - pad * 2) / (labels.length - 1) : 0;

    return (
      <svg viewBox={`0 0 ${w} ${h}`} style={{ width: '100%', maxWidth: '700px', fontFamily: "'Montserrat', sans-serif" }}>
        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
          const y = pad + (h - pad * 2) * (1 - f);
          return <g key={i}>
            <line x1={pad} y1={y} x2={w - pad} y2={y} stroke="#e8e8eb" strokeWidth="1" />
            <text x={pad - 8} y={y + 4} textAnchor="end" fontSize="9" fill="#7a7a84">{Math.round(maxVal * f)}</text>
          </g>;
        })}
        {/* X labels */}
        {labels.map((l, i) => (
          <text key={i} x={pad + i * xStep} y={h - 15} textAnchor="middle" fontSize="9" fill="#7a7a84">{l}</text>
        ))}
        {/* Lines */}
        {datasets.map((ds, di) => {
          const pts = ds.values.map((v, i) => `${pad + i * xStep},${pad + (h - pad * 2) * (1 - v / maxVal)}`);
          return <g key={di}>
            <polyline points={pts.join(' ')} fill="none" stroke={ds.color} strokeWidth="2" />
            {ds.values.map((v, i) => (
              <circle key={i} cx={pad + i * xStep} cy={pad + (h - pad * 2) * (1 - v / maxVal)} r="3" fill={ds.color} />
            ))}
          </g>;
        })}
        {/* Legend */}
        {datasets.map((ds, di) => (
          <g key={di} transform={`translate(${pad + di * 110}, ${h - 2})`}>
            <rect width="8" height="8" rx="2" fill={ds.color} />
            <text x="12" y="8" fontSize="8" fill="#5a5a64">{ds.label.slice(0, 14)}</text>
          </g>
        ))}
      </svg>
    );
  };

  return (
    <div style={eqStyles.root}>
      <div style={eqStyles.toolbar}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button style={eqStyles.backBtn} onClick={onBack}><Icons.ChevronLeft /> Retour</button>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>Statistiques</h2>
        </div>
      </div>
      <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Select label="Type de calcul" value={mode} onChange={e => setMode(e.target.value)}
            options={modes} style={{ minWidth: '200px' }} />
          <Select label="Comptes" value={accFilter} onChange={e => setAccFilter(e.target.value)}
            options={[{ value: 'all', label: 'Tous les comptes' }, ...accounts.map(a => ({ value: a.id, label: a.name }))]} />
          <Select label="Catégorie" value={catFilter} onChange={e => setCatFilter(e.target.value)}
            options={[{ value: 'all', label: 'Toutes les catégories' }, ...categories.map(c => ({ value: c.id, label: c.label }))]} />
        </div>
        <div style={{ background: '#fff', borderRadius: '8px', padding: '20px', border: '1px solid #e8e8eb' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '0.9rem', fontWeight: 500, color: '#5a5a64' }}>{modes.find(m => m.value === mode)?.label}</h3>
          {renderLineChart()}
        </div>
      </div>
    </div>
  );
};

const eqStyles = {
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
  selectors: {
    display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 20px',
    background: '#fff', borderBottom: '1px solid #e8e8eb', flexWrap: 'wrap',
  },
  monthTabs: {
    display: 'flex', gap: '2px', padding: '0 20px', background: '#fff',
    borderBottom: '1px solid #e8e8eb', overflow: 'auto',
  },
  monthTab: {
    padding: '10px 16px', background: 'none', border: 'none',
    borderBottom: '2px solid transparent', cursor: 'pointer',
    fontSize: '0.75rem', fontWeight: 500, color: '#7a7a84',
    fontFamily: "'Montserrat', sans-serif", whiteSpace: 'nowrap',
  },
  monthTabActive: { color: '#008577', borderBottomColor: '#008577' },
  content: { flex: 1, overflow: 'auto', padding: '20px' },
  table: { width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', fontFamily: "'Montserrat', sans-serif" },
  thead: { background: '#f5f5f5', borderBottom: '2px solid #d5d5d8' },
  th: { padding: '8px 12px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', color: '#27272f' },
  tr: { borderBottom: '1px solid #e8e8eb' },
  td: { padding: '8px 12px', color: '#27272f', fontSize: '0.8rem' },
  totals: { marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' },
  totalRow: {
    display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px',
    fontSize: '0.8rem', padding: '4px 12px',
  },
};

Object.assign(window, { EquilibrageScreen, StatisticsScreen });

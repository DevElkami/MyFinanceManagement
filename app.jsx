// Main App — routing, state, sidebar, dark mode, tweaks
const TWEAK_DEFAULTS = /*EDITMODE-BEGIN*/{
  "accentColor": "#008577",
  "darkMode": false,
  "compactMode": false,
  "sidebarStyle": "sidebar"
}/*EDITMODE-END*/;

const App = () => {
  const [tweaks, setTweak] = useTweaks(TWEAK_DEFAULTS);
  const dark = tweaks.darkMode;
  const accent = tweaks.accentColor;
  const compact = tweaks.compactMode;
  const navStyle = tweaks.sidebarStyle;

  // Auth
  const [loggedIn, setLoggedIn] = React.useState(false);
  const [user, setUser] = React.useState('');

  // Data state
  const [accounts, setAccounts] = React.useState(INITIAL_ACCOUNTS);
  const [operations, setOperations] = React.useState(INITIAL_OPERATIONS);
  const [categories, setCategories] = React.useState(CATEGORIES);
  const [tiersList, setTiersList] = React.useState(TIERS);
  const [echeances, setEcheances] = React.useState(INITIAL_ECHEANCES);

  // Navigation
  const [screen, setScreen] = React.useState('home');
  const [selectedAccount, setSelectedAccount] = React.useState(null);
  const [mobileMenuOpen, setMobileMenuOpen] = React.useState(false);

  // Modals
  const [accountModal, setAccountModal] = React.useState({ open: false, account: null });
  const [opModal, setOpModal] = React.useState({ open: false, op: null });
  const [importModal, setImportModal] = React.useState(false);
  const [catModal, setCatModal] = React.useState({ open: false, cat: null });
  const [tierModal, setTierModal] = React.useState({ open: false, tier: null });
  const [echModal, setEchModal] = React.useState({ open: false, ech: null });

  const currentAccount = accounts.find(a => a.id === selectedAccount);

  const nextId = (arr) => Math.max(0, ...arr.map(x => x.id)) + 1;

  const handleToggleStatut = (opId) => {
    setOperations(prev => prev.map(o => {
      if (o.id !== opId) return o;
      const cycle = { 'Aucun': 'Pointé', 'Pointé': 'Rapproché', 'Rapproché': 'Aucun' };
      return { ...o, statut: cycle[o.statut] || 'Aucun' };
    }));
  };

  // F5 key handler for statut toggle (on consultation screen)
  React.useEffect(() => {
    const handler = (e) => {
      if (e.key === 'F5' && screen === 'consultation') {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [screen]);

  // Colors
  const bg = dark ? '#1a1a22' : '#f5f5f5';
  const surface = dark ? '#27272f' : '#ffffff';
  const text = dark ? '#e8e8eb' : '#27272f';
  const textSec = dark ? '#9a9aa4' : '#7a7a84';
  const border = dark ? '#3a3a44' : '#e8e8eb';

  if (!loggedIn) {
    return <LoginScreen onLogin={(u) => { setUser(u); setLoggedIn(true); }} />;
  }

  const navItems = [
    { id: 'home', label: 'Accueil', icon: Icons.Home },
  ];

  const renderSidebar = () => {
    if (navStyle === 'topbar') return null;
    return (
      <aside style={{
        width: '220px', minHeight: '100vh', background: accent,
        color: '#fff', display: 'flex', flexDirection: 'column',
        transition: 'all 250ms ease-in-out',
      }}>
        <div style={{ padding: '20px', textAlign: 'center', borderBottom: '1px solid rgba(255,255,255,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <Icons.Wallet />
            <span style={{ fontSize: '1.1rem', fontWeight: 500 }}>Finance 2026</span>
          </div>
        </div>
        <nav style={{ flex: 1, padding: '12px' }}>
          <button onClick={() => setScreen('home')} style={{
            display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
            padding: '10px 14px', background: screen === 'home' ? 'rgba(0,0,0,0.2)' : 'transparent',
            color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer',
            fontSize: '0.8rem', fontWeight: 500, fontFamily: "'Montserrat', sans-serif",
          }}><Icons.Home /> Accueil</button>
          {selectedAccount && currentAccount && (
            <button onClick={() => setScreen('consultation')} style={{
              display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
              padding: '10px 14px', background: screen === 'consultation' ? 'rgba(0,0,0,0.2)' : 'transparent',
              color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer',
              fontSize: '0.8rem', fontWeight: 500, fontFamily: "'Montserrat', sans-serif", marginTop: '4px',
            }}><Icons.List /> {currentAccount.name}</button>
          )}
          {accounts.length >= 2 && (
            <button onClick={() => setScreen('equilibrage')} style={{
              display: 'flex', alignItems: 'center', gap: '10px', width: '100%',
              padding: '10px 14px', background: screen === 'equilibrage' ? 'rgba(0,0,0,0.2)' : 'transparent',
              color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer',
              fontSize: '0.8rem', fontWeight: 500, fontFamily: "'Montserrat', sans-serif", marginTop: '4px',
            }}><Icons.Scale /> Équilibrage</button>
          )}
        </nav>
        <div style={{ padding: '12px', borderTop: '1px solid rgba(255,255,255,0.15)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '8px' }}>
            <div style={{
              width: '32px', height: '32px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.75rem', fontWeight: 600,
            }}>{user.slice(0, 2).toUpperCase()}</div>
            <span style={{ fontSize: '0.75rem' }}>{user}</span>
          </div>
          <button onClick={() => setLoggedIn(false)} style={{
            display: 'flex', alignItems: 'center', gap: '6px', width: '100%', marginTop: '4px',
            padding: '6px 8px', background: 'rgba(255,255,255,0.1)', color: '#fff',
            border: 'none', borderRadius: '5px', cursor: 'pointer', fontSize: '0.7rem',
            fontFamily: "'Montserrat', sans-serif",
          }}><Icons.LogOut /> Déconnexion</button>
        </div>
      </aside>
    );
  };

  const renderTopbar = () => {
    if (navStyle !== 'topbar') return null;
    return (
      <header style={{
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
        padding: '0 20px', height: '56px', background: accent, color: '#fff',
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Icons.Wallet />
            <span style={{ fontWeight: 500 }}>Finance 2026</span>
          </div>
          <button onClick={() => setScreen('home')} style={{
            background: screen === 'home' ? 'rgba(0,0,0,0.2)' : 'transparent',
            color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer',
            padding: '6px 12px', fontSize: '0.8rem', fontFamily: "'Montserrat', sans-serif",
          }}>Accueil</button>
          {accounts.length >= 2 && (
            <button onClick={() => setScreen('equilibrage')} style={{
              background: screen === 'equilibrage' ? 'rgba(0,0,0,0.2)' : 'transparent',
              color: '#fff', border: 'none', borderRadius: '5px', cursor: 'pointer',
              padding: '6px 12px', fontSize: '0.8rem', fontFamily: "'Montserrat', sans-serif",
            }}>Équilibrage</button>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <span style={{ fontSize: '0.75rem' }}>{user}</span>
          <button onClick={() => setLoggedIn(false)} style={{
            background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', borderRadius: '5px',
            cursor: 'pointer', padding: '4px 8px', fontSize: '0.7rem', fontFamily: "'Montserrat', sans-serif",
            display: 'flex', alignItems: 'center', gap: '4px',
          }}><Icons.LogOut /></button>
        </div>
      </header>
    );
  };

  const renderContent = () => {
    switch (screen) {
      case 'home':
        return <HomeScreen accounts={accounts} operations={operations}
          onSelect={(id) => { setSelectedAccount(id); setScreen('consultation'); }}
          onAdd={() => setAccountModal({ open: true, account: null })}
          onEdit={(acc) => setAccountModal({ open: true, account: acc })}
          onDelete={(id) => { setAccounts(a => a.filter(x => x.id !== id)); setOperations(o => o.filter(x => x.accountId !== id)); }}
          onEquilibrage={() => setScreen('equilibrage')}
        />;
      case 'consultation':
        if (!currentAccount) { setScreen('home'); return null; }
        return <ConsultationScreen
          account={currentAccount} accounts={accounts}
          operations={operations} categories={categories} tiers={tiersList}
          onBack={() => setScreen('home')}
          onAddOp={() => setOpModal({ open: true, op: null })}
          onEditOp={(op) => setOpModal({ open: true, op })}
          onDeleteOp={(id) => setOperations(o => o.filter(x => x.id !== id))}
          onImport={() => setImportModal(true)}
          onCategories={() => setScreen('categories')}
          onTiers={() => setScreen('tiers')}
          onEcheances={() => setScreen('echeances')}
          onToggleStatut={handleToggleStatut}
        />;
      case 'categories':
        return <ManagementScreen type="Catégories" items={categories}
          onBack={() => setScreen('consultation')}
          onAdd={() => setCatModal({ open: true, cat: null })}
          onEdit={(cat) => setCatModal({ open: true, cat })}
          onDelete={(id) => setCategories(c => c.filter(x => x.id !== id))}
          columns={[
            { key: 'label', label: 'Libellé' },
            { key: 'type', label: 'Type', render: (item) => <Badge color="#008577">{item.type}</Badge> },
          ]}
        />;
      case 'tiers':
        return <ManagementScreen type="Tiers" items={tiersList}
          onBack={() => setScreen('consultation')}
          onAdd={() => setTierModal({ open: true, tier: null })}
          onEdit={(t) => setTierModal({ open: true, tier: t })}
          onDelete={(id) => setTiersList(t => t.filter(x => x.id !== id))}
          columns={[{ key: 'label', label: 'Libellé' }]}
        />;
      case 'echeances':
        return <ManagementScreen type="Échéancier" items={echeances.filter(e => e.accountId === selectedAccount)}
          onBack={() => setScreen('consultation')}
          onAdd={() => setEchModal({ open: true, ech: null })}
          onEdit={(e) => setEchModal({ open: true, ech: e })}
          onDelete={(id) => setEcheances(e => e.filter(x => x.id !== id))}
          columns={[
            { key: 'date', label: 'Date', render: (item) => fmtDate(item.date) },
            { key: 'amount', label: 'Montant', render: (item) => <span style={{ color: item.amount < 0 ? '#E91B0C' : '#048604' }}>{fmt(item.amount)}</span> },
            { key: 'type', label: 'Type' },
            { key: 'tierId', label: 'Tiers', render: (item) => (tiersList.find(t => t.id === item.tierId) || {}).label || '—' },
            { key: 'note', label: 'Note' },
          ]}
        />;
      case 'equilibrage':
        return <EquilibrageScreen accounts={accounts} operations={operations} categories={categories}
          onBack={() => setScreen('home')} onStats={() => setScreen('statistics')} />;
      case 'statistics':
        return <StatisticsScreen accounts={accounts} operations={operations} categories={categories}
          onBack={() => setScreen('equilibrage')} />;
      default:
        return null;
    }
  };

  // Apply dark mode CSS vars
  const rootStyle = {
    '--accent': accent,
    '--bg': bg, '--surface': surface, '--text': text, '--textSec': textSec, '--border': border,
    fontFamily: "'Montserrat', sans-serif", background: bg, color: text, minHeight: '100vh',
    fontSize: compact ? '0.85rem' : '1rem',
  };

  return (
    <div style={rootStyle}>
      <div style={{ display: 'flex', flexDirection: navStyle === 'topbar' ? 'column' : 'row', minHeight: '100vh' }}>
        {renderSidebar()}
        <div style={{ flex: 1, display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
          {renderTopbar()}
          <div style={{ flex: 1, overflow: 'auto' }}>{renderContent()}</div>
        </div>
      </div>

      {/* Modals */}
      <AccountFormModal open={accountModal.open} account={accountModal.account}
        onClose={() => setAccountModal({ open: false, account: null })}
        onSave={(acc) => {
          if (acc.id) { setAccounts(a => a.map(x => x.id === acc.id ? acc : x)); }
          else { setAccounts(a => [...a, { ...acc, id: nextId(accounts) }]); }
          setAccountModal({ open: false, account: null });
        }}
      />
      <OperationPopup open={opModal.open} operation={opModal.op}
        accounts={accounts} currentAccountId={selectedAccount}
        categories={categories} tiers={tiersList}
        onClose={() => setOpModal({ open: false, op: null })}
        onSave={(op) => {
          if (op.id) { setOperations(o => o.map(x => x.id === op.id ? op : x)); }
          else { setOperations(o => [...o, { ...op, id: nextId(operations), statut: 'Aucun' }]); }
        }}
      />
      <ImportWizard open={importModal} onClose={() => setImportModal(false)} account={currentAccount} />
      <CategoryFormModal open={catModal.open} category={catModal.cat}
        onClose={() => setCatModal({ open: false, cat: null })}
        onSave={(cat) => {
          if (cat.id) { setCategories(c => c.map(x => x.id === cat.id ? cat : x)); }
          else { setCategories(c => [...c, { ...cat, id: nextId(categories) }]); }
        }}
      />
      <TierFormModal open={tierModal.open} tier={tierModal.tier}
        onClose={() => setTierModal({ open: false, tier: null })}
        onSave={(t) => {
          if (t.id) { setTiersList(ts => ts.map(x => x.id === t.id ? t : x)); }
          else { setTiersList(ts => [...ts, { ...t, id: nextId(tiersList) }]); }
        }}
      />
      <EcheanceFormModal open={echModal.open} echeance={echModal.ech}
        categories={categories} tiers={tiersList}
        onClose={() => setEchModal({ open: false, ech: null })}
        onSave={(e) => {
          if (e.id) { setEcheances(es => es.map(x => x.id === e.id ? e : x)); }
          else { setEcheances(es => [...es, { ...e, id: nextId(echeances), accountId: selectedAccount }]); }
        }}
      />

      <TweaksPanel title="Tweaks">
        <TweakColor label="Couleur d'accent" value={accent} onChange={v => setTweak('accentColor', v)} />
        <TweakToggle label="Mode sombre" value={dark} onChange={v => setTweak('darkMode', v)} />
        <TweakToggle label="Mode compact" value={compact} onChange={v => setTweak('compactMode', v)} />
        <TweakRadio label="Navigation" value={navStyle} onChange={v => setTweak('sidebarStyle', v)}
          options={[{ value: 'sidebar', label: 'Latérale' }, { value: 'topbar', label: 'Supérieure' }]} />
      </TweaksPanel>
    </div>
  );
};

ReactDOM.createRoot(document.getElementById('root')).render(<App />);

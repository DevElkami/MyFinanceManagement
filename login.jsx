// Login & First-use screen
const LoginScreen = ({ onLogin }) => {
  const [isFirstUse, setIsFirstUse] = React.useState(false);
  const [login, setLogin] = React.useState('');
  const [password, setPassword] = React.useState('');
  const [confirmPw, setConfirmPw] = React.useState('');
  const [error, setError] = React.useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!login || !password) { setError('Veuillez remplir tous les champs'); return; }
    if (isFirstUse && password !== confirmPw) { setError('Les mots de passe ne correspondent pas'); return; }
    if (isFirstUse && password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères'); return; }
    onLogin(login);
  };

  return (
    <div style={loginStyles.wrapper}>
      <div style={loginStyles.card}>
        <div style={loginStyles.header}>
          <div style={loginStyles.logoIcon}>
            <Icons.Wallet />
          </div>
          <h1 style={loginStyles.title}>Finance 2026</h1>
          <p style={loginStyles.subtitle}>Gestion de finances personnelles</p>
        </div>

        <div style={loginStyles.tabRow}>
          <button
            style={{ ...loginStyles.tab, ...(!isFirstUse ? loginStyles.tabActive : {}) }}
            onClick={() => { setIsFirstUse(false); setError(''); }}
          >Connexion</button>
          <button
            style={{ ...loginStyles.tab, ...(isFirstUse ? loginStyles.tabActive : {}) }}
            onClick={() => { setIsFirstUse(true); setError(''); }}
          >Première utilisation</button>
        </div>

        <form onSubmit={handleSubmit} style={loginStyles.form}>
          <Input label="Identifiant" value={login} onChange={e => setLogin(e.target.value)} placeholder="Votre identifiant" />
          <Input label="Mot de passe" type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="Votre mot de passe" />
          {isFirstUse && (
            <Input label="Confirmer le mot de passe" type="password" value={confirmPw} onChange={e => setConfirmPw(e.target.value)} placeholder="Confirmez le mot de passe" />
          )}
          {error && <div style={loginStyles.error}>{error}</div>}
          <Btn variant="primary" size="lg" style={{ width: '100%', justifyContent: 'center', marginTop: '8px' }}>
            {isFirstUse ? 'Créer mon compte' : 'Se connecter'}
          </Btn>
        </form>
      </div>
      <p style={loginStyles.footer}>Finance 2026 — Application mono-utilisateur sécurisée</p>
    </div>
  );
};

const loginStyles = {
  wrapper: {
    minHeight: '100vh', display: 'flex', flexDirection: 'column',
    alignItems: 'center', justifyContent: 'center',
    background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8eb 100%)',
    padding: '20px',
  },
  card: {
    background: '#fff', borderRadius: '8px', width: 'min(400px, 100%)',
    boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflow: 'hidden',
  },
  header: {
    textAlign: 'center', padding: '32px 24px 16px',
  },
  logoIcon: {
    width: '56px', height: '56px', borderRadius: '12px',
    background: '#008577', color: '#fff', display: 'flex',
    alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px',
  },
  title: { margin: 0, fontSize: '1.5rem', fontWeight: 500, color: '#27272f' },
  subtitle: { margin: '4px 0 0', fontSize: '0.875rem', color: '#7a7a84' },
  tabRow: {
    display: 'flex', borderBottom: '1px solid #e8e8eb',
  },
  tab: {
    flex: 1, padding: '10px', background: 'none', border: 'none',
    borderBottom: '2px solid transparent', cursor: 'pointer',
    fontSize: '0.8rem', fontWeight: 500, color: '#7a7a84',
    fontFamily: "'Montserrat', sans-serif",
  },
  tabActive: { color: '#008577', borderBottomColor: '#008577' },
  form: { padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' },
  error: { fontSize: '0.8rem', color: '#E91B0C', background: '#fef2f2', padding: '8px 12px', borderRadius: '5px' },
  footer: { marginTop: '24px', fontSize: '0.75rem', color: '#9a9aa4' },
};

Object.assign(window, { LoginScreen });

import React, { useState } from 'react';
import { useAuthStore } from '../store/authStore';
import { apiLogin, apiRegister } from '../services/api';
import { Icons } from '../components/ui/Icons';
import { Input } from '../components/ui/Input';
import { Btn } from '../components/ui/Btn';

export const LoginPage: React.FC = () => {
  const { login } = useAuthStore();
  const [isFirstUse, setIsFirstUse] = useState(false);
  const [loginVal, setLoginVal] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPw, setConfirmPw] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!loginVal || !password) { setError('Veuillez remplir tous les champs'); return; }
    if (isFirstUse && password !== confirmPw) { setError('Les mots de passe ne correspondent pas'); return; }
    if (isFirstUse && password.length < 6) { setError('Le mot de passe doit contenir au moins 6 caractères'); return; }

    setLoading(true);
    try {
      const fn = isFirstUse ? apiRegister : apiLogin;
      const data = await fn(loginVal, password);
      login(data.token, data.username);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Erreur de connexion');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh', display: 'flex', flexDirection: 'column',
      alignItems: 'center', justifyContent: 'center',
      background: 'linear-gradient(135deg, #f5f5f5 0%, #e8e8eb 100%)', padding: '20px',
    }}>
      <div style={{
        background: '#fff', borderRadius: '8px', width: 'min(400px, 100%)',
        boxShadow: '0 4px 6px rgba(0,0,0,0.1)', overflow: 'hidden',
      }}>
        <div style={{ textAlign: 'center', padding: '32px 24px 16px' }}>
          <div style={{
            width: '56px', height: '56px', borderRadius: '12px', background: '#008577',
            color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 16px',
          }}>
            <Icons.Wallet />
          </div>
          <h1 style={{ margin: 0, fontSize: '1.5rem', fontWeight: 500, color: '#27272f' }}>Finance 2026</h1>
          <p style={{ margin: '4px 0 0', fontSize: '0.875rem', color: '#7a7a84' }}>
            Gestion de finances personnelles
          </p>
        </div>

        <div style={{ display: 'flex', borderBottom: '1px solid #e8e8eb' }}>
          {[{ v: false, l: 'Connexion' }, { v: true, l: 'Première utilisation' }].map(({ v, l }) => (
            <button
              key={l}
              onClick={() => { setIsFirstUse(v); setError(''); }}
              style={{
                flex: 1, padding: '10px', background: 'none',
                border: 'none', borderBottom: `2px solid ${isFirstUse === v ? '#008577' : 'transparent'}`,
                cursor: 'pointer', fontSize: '0.8rem', fontWeight: 500,
                color: isFirstUse === v ? '#008577' : '#7a7a84',
                fontFamily: "'Montserrat', sans-serif", transition: 'all 150ms',
              }}
            >
              {l}
            </button>
          ))}
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <Input
            label="Identifiant" value={loginVal}
            onChange={e => setLoginVal(e.target.value)} placeholder="Votre identifiant"
          />
          <Input
            label="Mot de passe" type="password" value={password}
            onChange={e => setPassword(e.target.value)} placeholder="Votre mot de passe"
          />
          {isFirstUse && (
            <Input
              label="Confirmer le mot de passe" type="password" value={confirmPw}
              onChange={e => setConfirmPw(e.target.value)} placeholder="Confirmez le mot de passe"
            />
          )}
          {error && (
            <div style={{ fontSize: '0.8rem', color: '#E91B0C', background: '#fef2f2', padding: '8px 12px', borderRadius: '5px' }}>
              {error}
            </div>
          )}
          <Btn
            type="submit" size="lg" style={{ width: '100%', justifyContent: 'center', marginTop: '4px' }}
            disabled={loading}
          >
            {loading ? 'Chargement...' : isFirstUse ? 'Créer mon compte' : 'Se connecter'}
          </Btn>
        </form>
      </div>
      <p style={{ marginTop: '24px', fontSize: '0.75rem', color: '#9a9aa4' }}>
        Finance 2026 — Application mono-utilisateur sécurisée
      </p>
    </div>
  );
};

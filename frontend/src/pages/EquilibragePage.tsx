import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { apiGetEquilibrage, apiGetEquilibragePrefs, apiPutEquilibragePrefs } from '../services/api';
import { fmt } from '../types';
import { Btn } from '../components/ui/Btn';
import { Select } from '../components/ui/Select';
import { Icons } from '../components/ui/Icons';

const MONTH_NAMES = ['Jan', 'Fév', 'Mar', 'Avr', 'Mai', 'Jun', 'Jul', 'Aoû', 'Sep', 'Oct', 'Nov', 'Déc'];
const monthLabel = (ym: string) => { const [y, m] = ym.split('-'); return MONTH_NAMES[+m - 1] + ' ' + y; };

export const EquilibragePage: React.FC = () => {
  const navigate = useNavigate();
  const { accounts } = useAppStore();
  const [acc1Id, setAcc1Id] = useState<number>(0);
  const [acc2Id, setAcc2Id] = useState<number>(0);
  const [activeMonth, setActiveMonth] = useState<string>('');
  const [data, setData] = useState<Record<string, any>>({});
  const [expandedCats, setExpandedCats] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (accounts.length >= 2) {
      apiGetEquilibragePrefs().then(prefs => {
        setAcc1Id(prefs?.account1Id || accounts[0].id);
        setAcc2Id(prefs?.account2Id || accounts[1].id);
      }).catch(() => {
        setAcc1Id(accounts[0].id);
        setAcc2Id(accounts[1].id);
      });
    }
  }, [accounts]);

  useEffect(() => {
    if (!acc1Id || !acc2Id || acc1Id === acc2Id) return;
    setLoading(true);
    apiGetEquilibrage(acc1Id, acc2Id).then(d => {
      setData(d);
      const months = Object.keys(d).sort();
      if (months.length && !activeMonth) setActiveMonth(months[months.length - 1]);
    }).catch(() => {}).finally(() => setLoading(false));
  }, [acc1Id, acc2Id]);

  const savePrefs = () => {
    if (acc1Id && acc2Id) apiPutEquilibragePrefs({ account1Id: acc1Id, account2Id: acc2Id }).catch(() => {});
  };

  const acc1 = accounts.find(a => a.id === acc1Id);
  const acc2 = accounts.find(a => a.id === acc2Id);
  const months = Object.keys(data).sort();
  const monthData = data[activeMonth];

  const accountOptions = accounts.map(a => ({ value: a.id, label: a.name }));

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: '#fff', borderBottom: '1px solid #e8e8eb', flexWrap: 'wrap', gap: '8px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button style={backBtnStyle} onClick={() => navigate('/')}><Icons.ChevronLeft /> Retour</button>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>Équilibrage des comptes</h2>
        </div>
        <Btn variant="outline" size="sm" onClick={() => navigate('/statistics')}><Icons.BarChart /> Statistiques</Btn>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '16px 20px', background: '#fff', borderBottom: '1px solid #e8e8eb', flexWrap: 'wrap', flexShrink: 0 }}>
        <Select label="Compte 1" value={acc1Id} onChange={e => { setAcc1Id(+e.target.value); setActiveMonth(''); }} options={accountOptions} />
        <span style={{ fontSize: '1.2rem', color: '#7a7a84', alignSelf: 'flex-end', padding: '8px' }}>⇄</span>
        <Select label="Compte 2" value={acc2Id} onChange={e => { setAcc2Id(+e.target.value); setActiveMonth(''); }} options={accountOptions} />
        <Btn variant="secondary" size="sm" style={{ alignSelf: 'flex-end' }} onClick={savePrefs}>Mémoriser</Btn>
      </div>

      <div style={{ display: 'flex', gap: '2px', padding: '0 20px', background: '#fff', borderBottom: '1px solid #e8e8eb', overflow: 'auto', flexShrink: 0 }}>
        {months.map(mo => (
          <button key={mo} onClick={() => setActiveMonth(mo)} style={{
            padding: '10px 16px', background: 'none', border: 'none',
            borderBottom: `2px solid ${activeMonth === mo ? '#008577' : 'transparent'}`,
            cursor: 'pointer', fontSize: '0.75rem', fontWeight: 500,
            color: activeMonth === mo ? '#008577' : '#7a7a84',
            fontFamily: "'Montserrat', sans-serif", whiteSpace: 'nowrap',
          }}>{monthLabel(mo)}</button>
        ))}
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '20px' }}>
        {acc1Id === acc2Id && (
          <div style={{ textAlign: 'center', padding: '60px', color: '#7a7a84' }}>Veuillez sélectionner deux comptes différents.</div>
        )}
        {loading && <div style={{ textAlign: 'center', padding: '40px', color: '#7a7a84' }}>Chargement...</div>}

        {monthData && !loading && acc1Id !== acc2Id && (
          <>
            {!monthData.hasSalaries && (
              <div style={{ background: '#FFF7ED', border: '1px solid #C24E00', borderRadius: '5px', padding: '12px', marginBottom: '16px', fontSize: '0.8rem', color: '#C24E00' }}>
                Chaque compte doit avoir une opération « Salaire » pour effectuer les calculs de prorata.
              </div>
            )}

            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.8rem', fontFamily: "'Montserrat', sans-serif" }}>
              <thead style={{ background: '#f5f5f5', borderBottom: '2px solid #d5d5d8' }}>
                <tr>
                  <th style={th}>Catégorie</th>
                  <th style={{ ...th, textAlign: 'right' }}>{acc1?.name || 'Compte 1'}</th>
                  <th style={{ ...th, textAlign: 'right' }}>{acc2?.name || 'Compte 2'}</th>
                </tr>
              </thead>
              <tbody>
                {Object.entries(monthData.categories || {}).map(([cat, catData]: [string, any]) => (
                  <React.Fragment key={cat}>
                    <tr
                      style={{ borderBottom: '1px solid #e8e8eb', cursor: 'pointer' }}
                      onClick={() => setExpandedCats(p => ({ ...p, [cat]: !p[cat] }))}
                    >
                      <td style={{ padding: '8px 12px', fontWeight: 500 }}>
                        <span style={{ fontSize: '0.7rem', marginRight: '4px' }}>{expandedCats[cat] ? '▼' : '▶'}</span>
                        {cat}
                      </td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', color: '#E91B0C' }}>{fmt(catData.acc1Total || 0)}</td>
                      <td style={{ padding: '8px 12px', textAlign: 'right', color: '#E91B0C' }}>{fmt(catData.acc2Total || 0)}</td>
                    </tr>
                    {expandedCats[cat] && [...(catData.ops1 || []), ...(catData.ops2 || [])].map((op: any, i: number) => (
                      <tr key={op.id + '-' + i} style={{ background: '#f9f9f9' }}>
                        <td style={{ padding: '6px 12px 6px 28px', fontSize: '0.7rem', color: '#7a7a84' }}>{op.date}</td>
                        <td style={{ padding: '6px 12px', textAlign: 'right', fontSize: '0.7rem', color: op.accountId === acc1Id ? '#E91B0C' : '#babac4' }}>
                          {op.accountId === acc1Id ? fmt(Number(op.amount)) : ''}
                        </td>
                        <td style={{ padding: '6px 12px', textAlign: 'right', fontSize: '0.7rem', color: op.accountId === acc2Id ? '#E91B0C' : '#babac4' }}>
                          {op.accountId === acc2Id ? fmt(Number(op.amount)) : ''}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>

            <div style={{ marginTop: '16px', display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {[
                { label: 'Total débits', v1: monthData.deb1, v2: monthData.deb2, color: '#E91B0C' },
                ...(monthData.hasSalaries ? [
                  { label: 'Salaires', v1: monthData.sal1, v2: monthData.sal2, color: '#048604' },
                  { label: 'Total prorata', v1: monthData.prorata1, v2: monthData.prorata2, color: undefined },
                ] : []),
              ].map(row => (
                <div key={row.label} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '0.8rem', padding: '4px 12px' }}>
                  <span style={{ fontWeight: 500 }}>{row.label}</span>
                  <span style={{ textAlign: 'right', color: row.color }}>{fmt(Number(row.v1) || 0)}</span>
                  <span style={{ textAlign: 'right', color: row.color }}>{fmt(Number(row.v2) || 0)}</span>
                </div>
              ))}
              {monthData.hasSalaries && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '12px', fontSize: '0.8rem', padding: '8px 12px', background: '#f0f9f7', borderRadius: '5px' }}>
                  <span style={{ fontWeight: 600 }}>Écart</span>
                  <span style={{ textAlign: 'right', fontWeight: 600, color: monthData.ecart1 >= 0 ? '#048604' : '#E91B0C' }}>{fmt(Number(monthData.ecart1))}</span>
                  <span style={{ textAlign: 'right', fontWeight: 600, color: monthData.ecart2 >= 0 ? '#048604' : '#E91B0C' }}>{fmt(Number(monthData.ecart2))}</span>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

const backBtnStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '2px', background: 'none', border: 'none', cursor: 'pointer', color: '#008577', fontSize: '0.8rem', fontWeight: 500, fontFamily: "'Montserrat', sans-serif" };
const th: React.CSSProperties = { padding: '8px 12px', textAlign: 'left', fontSize: '0.7rem', fontWeight: 600, textTransform: 'uppercase', color: '#27272f' };

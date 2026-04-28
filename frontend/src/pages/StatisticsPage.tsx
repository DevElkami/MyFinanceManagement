import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/appStore';
import { apiGetStatistics } from '../services/api';
import { Select } from '../components/ui/Select';
import { Icons } from '../components/ui/Icons';

const COLORS = ['#008577', '#0B78D0', '#C24E00', '#E91B0C', '#048604', '#7a7a84', '#4da69f', '#d97a3f'];

const MODES = [
  { value: 'compare', label: 'Comparaison mois précédent' },
  { value: 'year', label: 'Cumuls année en cours' },
  { value: 'five_years', label: 'Cumuls 5 dernières années' },
  { value: 'all_time', label: 'Cumuls depuis le début' },
];

export const StatisticsPage: React.FC = () => {
  const navigate = useNavigate();
  const { accounts, categories } = useAppStore();
  const [mode, setMode] = useState('compare');
  const [accFilter, setAccFilter] = useState('all');
  const [catFilter, setCatFilter] = useState('all');
  const [chartData, setChartData] = useState<{ labels: string[]; datasets: { label: string; values: number[] }[] }>({ labels: [], datasets: [] });

  useEffect(() => {
    const params: any = { mode };
    if (accFilter !== 'all') params.accounts = accFilter;
    if (catFilter !== 'all') params.category = catFilter;
    apiGetStatistics(params).then(setChartData).catch(() => {});
  }, [mode, accFilter, catFilter]);

  const renderChart = () => {
    const { labels, datasets } = chartData;
    if (!datasets.length) return <div style={{ textAlign: 'center', padding: '40px', color: '#7a7a84' }}>Aucune donnée</div>;

    const W = 700, H = 300, PAD = 50;
    const allVals = datasets.flatMap(d => d.values);
    const maxVal = Math.max(...allVals, 1);
    const xStep = labels.length > 1 ? (W - PAD * 2) / (labels.length - 1) : 0;

    return (
      <svg viewBox={`0 0 ${W} ${H}`} style={{ width: '100%', maxWidth: '700px', fontFamily: "'Montserrat', sans-serif" }}>
        {[0, 0.25, 0.5, 0.75, 1].map((f, i) => {
          const y = PAD + (H - PAD * 2) * (1 - f);
          return (
            <g key={i}>
              <line x1={PAD} y1={y} x2={W - PAD} y2={y} stroke="#e8e8eb" strokeWidth="1" />
              <text x={PAD - 8} y={y + 4} textAnchor="end" fontSize="9" fill="#7a7a84">{Math.round(maxVal * f)}</text>
            </g>
          );
        })}
        {labels.map((l, i) => (
          <text key={i} x={PAD + i * xStep} y={H - 12} textAnchor="middle" fontSize="9" fill="#7a7a84">{l}</text>
        ))}
        {datasets.map((ds, di) => {
          const color = COLORS[di % COLORS.length];
          const pts = ds.values.map((v, i) => `${PAD + i * xStep},${PAD + (H - PAD * 2) * (1 - v / maxVal)}`).join(' ');
          return (
            <g key={di}>
              <polyline points={pts} fill="none" stroke={color} strokeWidth="2" />
              {ds.values.map((v, i) => (
                <circle key={i} cx={PAD + i * xStep} cy={PAD + (H - PAD * 2) * (1 - v / maxVal)} r="3" fill={color} />
              ))}
            </g>
          );
        })}
        {datasets.map((ds, di) => (
          <g key={di} transform={`translate(${PAD + (di % 6) * 110}, ${H - 2})`}>
            <rect width="8" height="8" rx="2" fill={COLORS[di % COLORS.length]} />
            <text x="12" y="8" fontSize="8" fill="#5a5a64">{ds.label.slice(0, 14)}</text>
          </g>
        ))}
      </svg>
    );
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', height: '100vh' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 20px', background: '#fff', borderBottom: '1px solid #e8e8eb', flexWrap: 'wrap', gap: '8px', flexShrink: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button style={backBtnStyle} onClick={() => navigate('/equilibrage')}><Icons.ChevronLeft /> Retour</button>
          <h2 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 500 }}>Statistiques</h2>
        </div>
      </div>

      <div style={{ flex: 1, overflow: 'auto', padding: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
          <Select label="Type de calcul" value={mode} onChange={e => setMode(e.target.value)} options={MODES} style={{ minWidth: '220px' }} />
          <Select
            label="Comptes" value={accFilter} onChange={e => setAccFilter(e.target.value)}
            options={[{ value: 'all', label: 'Tous les comptes' }, ...accounts.map(a => ({ value: String(a.id), label: a.name }))]}
          />
          <Select
            label="Catégorie" value={catFilter} onChange={e => setCatFilter(e.target.value)}
            options={[{ value: 'all', label: 'Toutes les catégories' }, ...categories.map(c => ({ value: String(c.id), label: c.label }))]}
          />
        </div>

        <div style={{ background: '#fff', borderRadius: '8px', padding: '20px', border: '1px solid #e8e8eb' }}>
          <h3 style={{ margin: '0 0 16px', fontSize: '0.9rem', fontWeight: 500, color: '#5a5a64' }}>
            {MODES.find(m => m.value === mode)?.label}
          </h3>
          {renderChart()}
        </div>
      </div>
    </div>
  );
};

const backBtnStyle: React.CSSProperties = { display: 'flex', alignItems: 'center', gap: '2px', background: 'none', border: 'none', cursor: 'pointer', color: '#008577', fontSize: '0.8rem', fontWeight: 500, fontFamily: "'Montserrat', sans-serif" };

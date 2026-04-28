const csv = require('csv-parser');
const { Readable } = require('stream');

function parseDate(str) {
  if (!str) return null;
  str = str.trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(str)) return str;
  // DD/MM/YYYY or DD-MM-YYYY or DD.MM.YYYY
  const m = str.match(/^(\d{1,2})[\/\-\.](\d{1,2})[\/\-\.](\d{2,4})$/);
  if (m) {
    const y = m[3].length === 2 ? '20' + m[3] : m[3];
    return `${y}-${m[2].padStart(2, '0')}-${m[1].padStart(2, '0')}`;
  }
  return null;
}

function parseAmount(str) {
  if (!str) return 0;
  const cleaned = str.toString().replace(/\s/g, '').replace(',', '.');
  return parseFloat(cleaned) || 0;
}

function guessType(str) {
  const s = (str || '').toLowerCase();
  if (s.includes('virement')) return 'Virement';
  if (s.includes('prélèv') || s.includes('prelev')) return 'Prélèvement';
  if (s.includes('chèque') || s.includes('cheque')) return 'Chèque';
  if (s.includes('remise')) return 'Remise de chèque';
  if (s.includes('cb') || s.includes('carte')) return 'CB';
  return 'CB';
}

async function parseCsv(buffer, mapping) {
  return new Promise((resolve, reject) => {
    const results = [];
    const stream = Readable.from(buffer.toString('utf8'));
    stream
      .pipe(csv({ separator: ';' }))
      .on('data', (row) => {
        let date, amount, type, note;
        if (mapping) {
          date = parseDate(row[mapping.date]);
          amount = parseAmount(row[mapping.amount]);
          type = guessType(row[mapping.type] || '');
          note = row[mapping.note] || '';
        } else {
          // Auto-detect common column names (case-insensitive key lookup)
          const find = (...names) => {
            const k = Object.keys(row).find(k => names.includes(k.toLowerCase().trim()));
            return k ? row[k] : undefined;
          };
          const dateVal = find('date', 'date valeur', 'date opération', 'dateop');
          const amountVal = find('montant', 'amount', 'valeur');
          const creditVal = find('crédit', 'credit');
          const debitVal = find('débit', 'debit');
          const typeVal = find('type', 'libellé', 'libelle', 'label');

          date = parseDate(dateVal);
          if (creditVal !== undefined || debitVal !== undefined) {
            const credit = parseAmount(creditVal);
            const debit = parseAmount(debitVal);
            amount = credit > 0 ? credit : -Math.abs(debit);
          } else {
            amount = parseAmount(amountVal);
          }
          type = guessType(typeVal || '');
          note = typeVal || '';
        }
        if (date) results.push({ date, amount, type, note });
      })
      .on('end', () => resolve(results))
      .on('error', reject);
  });
}

async function parseXml(buffer) {
  const xml2js = require('xml2js');
  const parsed = await xml2js.parseStringPromise(buffer.toString(), { explicitArray: false });
  const ops = [];

  function traverse(obj) {
    if (!obj || typeof obj !== 'object') return;
    const keys = Object.keys(obj).map(k => k.toLowerCase());
    const hasDate = keys.some(k => k.includes('date'));
    const hasAmount = keys.some(k => ['amount', 'montant', 'trnamt'].includes(k));
    if (hasDate && hasAmount) {
      const dateKey = Object.keys(obj).find(k => k.toLowerCase().includes('date'));
      const amountKey = Object.keys(obj).find(k => ['amount', 'montant', 'trnamt', 'Amount', 'TRNAMT'].includes(k));
      const date = parseDate(String(obj[dateKey] || ''));
      const amount = parseAmount(String(obj[amountKey] || ''));
      const noteKey = Object.keys(obj).find(k => ['name', 'memo', 'label', 'libelle', 'NAME', 'MEMO'].includes(k));
      if (date) ops.push({ date, amount, type: 'Virement', note: noteKey ? String(obj[noteKey]) : '' });
    }
    Object.values(obj).forEach(v => { if (typeof v === 'object') traverse(v); });
  }

  traverse(parsed);
  return ops;
}

async function parseOfx(buffer) {
  const text = buffer.toString('latin1');
  const ops = [];
  const blocks = text.match(/<STMTTRN[\s\S]*?<\/STMTTRN>/gi) || [];
  for (const block of blocks) {
    const get = (tag) => {
      const m = block.match(new RegExp(`<${tag}>([^<\r\n]+)`, 'i'));
      return m ? m[1].trim() : '';
    };
    const dtposted = get('DTPOSTED') || get('DTUSER');
    const amountStr = get('TRNAMT');
    const name = get('NAME') || get('MEMO');
    const trntype = get('TRNTYPE');
    if (dtposted && amountStr) {
      const y = dtposted.slice(0, 4), mo = dtposted.slice(4, 6), d = dtposted.slice(6, 8);
      const date = `${y}-${mo}-${d}`;
      if (parseDate(date)) {
        ops.push({ date, amount: parseFloat(amountStr), type: guessType(trntype || name), note: name });
      }
    }
  }
  return ops;
}

async function parseCfonb(buffer) {
  const lines = buffer.toString('latin1').split(/\r?\n/);
  const ops = [];
  for (const line of lines) {
    if (line.length < 80) continue;
    const code = line.slice(0, 2);
    if (code !== '04') continue;
    try {
      const dateStr = line.slice(5, 11); // JJMMAA
      const sign = line.slice(19, 20) === 'C' ? 1 : -1;
      const amountRaw = line.slice(20, 32).trim();
      const amount = sign * parseFloat(amountRaw.slice(0, -2) + '.' + amountRaw.slice(-2).replace(/\D/g, '0'));
      const label = line.slice(48, 79).trim();
      const d = dateStr.slice(0, 2), m = dateStr.slice(2, 4), y = '20' + dateStr.slice(4, 6);
      const date = `${y}-${m}-${d}`;
      if (parseDate(date)) ops.push({ date, amount, type: guessType(label), note: label });
    } catch {}
  }
  return ops;
}

exports.parse = async (buffer, format, mapping) => {
  switch ((format || 'csv').toLowerCase()) {
    case 'xml': return parseXml(buffer);
    case 'ofx': return parseOfx(buffer);
    case 'cfonb': return parseCfonb(buffer);
    default: return parseCsv(buffer, mapping);
  }
};

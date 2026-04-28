const { Op } = require('sequelize');
const { Account, Operation, Category } = require('../models');

exports.getStatistics = async (req, res, next) => {
  try {
    const { mode = 'compare', accounts: accountsParam, category } = req.query;

    const ownedAccounts = await Account.findAll({ where: { userId: req.user.id } });
    let accountIds = ownedAccounts.map(a => a.id);

    if (accountsParam && accountsParam !== 'all') {
      const requested = accountsParam.split(',').map(Number);
      accountIds = accountIds.filter(id => requested.includes(id));
    }

    const where = { accountId: { [Op.in]: accountIds } };
    if (category && category !== 'all') where.categoryId = parseInt(category);

    const [operations, categories] = await Promise.all([
      Operation.findAll({ where, order: [['date', 'ASC']] }),
      Category.findAll({ where: { userId: req.user.id } }),
    ]);

    const now = new Date();
    let labels = [];
    let getKey;

    if (mode === 'compare') {
      for (let i = 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        labels.push(`${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`);
      }
      getKey = (date) => date.slice(0, 7);
    } else if (mode === 'year') {
      for (let m = 0; m <= now.getMonth(); m++) {
        labels.push(`${now.getFullYear()}-${String(m + 1).padStart(2, '0')}`);
      }
      getKey = (date) => date.slice(0, 7);
    } else if (mode === 'five_years') {
      for (let y = now.getFullYear() - 4; y <= now.getFullYear(); y++) labels.push(String(y));
      getKey = (date) => date.slice(0, 4);
    } else {
      const years = [...new Set(operations.map(o => o.date.slice(0, 4)))].sort();
      labels = years.length ? years : [String(now.getFullYear())];
      getKey = (date) => date.slice(0, 4);
    }

    const catMap = {};
    for (const op of operations) {
      if (parseFloat(op.amount) >= 0) continue;
      const key = getKey(op.date);
      if (!labels.includes(key)) continue;
      const cat = categories.find(c => c.id === op.categoryId);
      const catLabel = cat ? cat.label : 'Autres';
      if (!catMap[catLabel]) catMap[catLabel] = {};
      catMap[catLabel][key] = (catMap[catLabel][key] || 0) + Math.abs(parseFloat(op.amount));
    }

    const datasets = Object.entries(catMap).map(([label, data]) => ({
      label,
      values: labels.map(l => Math.round((data[l] || 0) * 100) / 100),
    }));

    res.json({ labels, datasets });
  } catch (err) { next(err); }
};

const { Echeance, Account, Operation } = require('../models');

async function checkAccount(accountId, userId) {
  const account = await Account.findOne({ where: { id: accountId, userId } });
  if (!account) throw Object.assign(new Error('Compte non trouvé'), { status: 404 });
  return account;
}

exports.list = async (req, res, next) => {
  try {
    await checkAccount(req.params.accountId, req.user.id);
    res.json(await Echeance.findAll({ where: { accountId: req.params.accountId } }));
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    await checkAccount(req.params.accountId, req.user.id);
    const { dayOfMonth, amount, type, tierId, categoryId, note, equilibre } = req.body;
    const ech = await Echeance.create({
      accountId: req.params.accountId,
      dayOfMonth: parseInt(dayOfMonth) || 1,
      amount: parseFloat(amount), type,
      tierId: tierId || null, categoryId: categoryId || null,
      note: note || '', equilibre: equilibre !== false,
    });
    res.status(201).json(ech);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const ech = await Echeance.findByPk(req.params.id);
    if (!ech) return res.status(404).json({ error: 'Échéance non trouvée' });
    await checkAccount(ech.accountId, req.user.id);
    const { dayOfMonth, amount, type, tierId, categoryId, note, equilibre } = req.body;
    await ech.update({
      dayOfMonth: parseInt(dayOfMonth) || ech.dayOfMonth,
      amount: parseFloat(amount), type,
      tierId: tierId || null, categoryId: categoryId || null,
      note, equilibre,
    });
    res.json(ech);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const ech = await Echeance.findByPk(req.params.id);
    if (!ech) return res.status(404).json({ error: 'Échéance non trouvée' });
    await checkAccount(ech.accountId, req.user.id);
    await ech.destroy();
    res.json({ success: true });
  } catch (err) { next(err); }
};

exports.applyEcheances = async (req, res, next) => {
  try {
    await checkAccount(req.params.accountId, req.user.id);
    const echeances = await Echeance.findAll({ where: { accountId: req.params.accountId } });
    const now = new Date();
    const currentMonth = toYM(now.getFullYear(), now.getMonth() + 1);
    const created = [];

    for (const ech of echeances) {
      const startMonth = ech.lastAppliedMonth ? addMonth(ech.lastAppliedMonth) : currentMonth;
      let month = startMonth;
      while (month <= currentMonth) {
        const [y, m] = month.split('-').map(Number);
        const daysInMonth = new Date(y, m, 0).getDate();
        const day = Math.min(ech.dayOfMonth, daysInMonth);
        const date = `${month}-${String(day).padStart(2, '0')}`;
        const op = await Operation.create({
          accountId: ech.accountId, date,
          amount: parseFloat(ech.amount), type: ech.type,
          tierId: ech.tierId, categoryId: ech.categoryId,
          note: ech.note, equilibre: ech.equilibre, statut: 'Aucun',
        });
        created.push(op);
        await ech.update({ lastAppliedMonth: month });
        month = addMonth(month);
      }
    }

    res.json({ created: created.length, operations: created });
  } catch (err) { next(err); }
};

function toYM(year, month) {
  return `${year}-${String(month).padStart(2, '0')}`;
}

function addMonth(ym) {
  const [y, m] = ym.split('-').map(Number);
  const d = new Date(y, m, 1);
  return toYM(d.getFullYear(), d.getMonth() + 1);
}

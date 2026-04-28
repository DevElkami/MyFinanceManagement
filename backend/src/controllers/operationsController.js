const { Op } = require('sequelize');
const { Operation, Account } = require('../models');

async function checkAccount(accountId, userId) {
  const account = await Account.findOne({ where: { id: accountId, userId } });
  if (!account) throw Object.assign(new Error('Compte non trouvé'), { status: 404 });
  return account;
}

exports.list = async (req, res, next) => {
  try {
    await checkAccount(req.params.accountId, req.user.id);
    const where = { accountId: req.params.accountId };
    if (req.query.type) where.type = req.query.type;
    if (req.query.category_id) where.categoryId = req.query.category_id;
    if (req.query.statut) where.statut = req.query.statut;
    if (req.query.tier_id) where.tierId = req.query.tier_id;
    if (req.query.note) where.note = { [Op.like]: `%${req.query.note}%` };
    const operations = await Operation.findAll({ where, order: [['date', 'ASC']] });
    res.json(operations);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    await checkAccount(req.params.accountId, req.user.id);
    const { date, amount, type, tierId, categoryId, note, equilibre, linkedAccountId } = req.body;

    const op = await Operation.create({
      accountId: req.params.accountId,
      date, amount: parseFloat(amount), type,
      tierId: tierId || null, categoryId: categoryId || null,
      note: note || '', equilibre: equilibre !== false, statut: 'Aucun',
    });

    if (linkedAccountId) {
      await checkAccount(linkedAccountId, req.user.id);
      const linked = await Operation.create({
        accountId: linkedAccountId, date, amount: -parseFloat(amount),
        type: 'Virement', tierId: tierId || null, categoryId: categoryId || null,
        note: note || '', equilibre: equilibre !== false, statut: 'Aucun',
        linkedOperationId: op.id,
      });
      await op.update({ linkedOperationId: linked.id });
    }

    res.status(201).json(op);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const op = await Operation.findByPk(req.params.id);
    if (!op) return res.status(404).json({ error: 'Opération non trouvée' });
    await checkAccount(op.accountId, req.user.id);

    const { date, amount, type, tierId, categoryId, note, equilibre } = req.body;
    await op.update({ date, amount: parseFloat(amount), type, tierId: tierId || null, categoryId: categoryId || null, note, equilibre });

    if (op.linkedOperationId) {
      const linked = await Operation.findByPk(op.linkedOperationId);
      if (linked) await linked.update({ date, amount: -parseFloat(amount), type: 'Virement', note });
    }

    res.json(op);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const op = await Operation.findByPk(req.params.id);
    if (!op) return res.status(404).json({ error: 'Opération non trouvée' });
    await checkAccount(op.accountId, req.user.id);
    if (op.linkedOperationId) {
      await Operation.destroy({ where: { id: op.linkedOperationId } });
    }
    await op.destroy();
    res.json({ success: true });
  } catch (err) { next(err); }
};

exports.patchStatut = async (req, res, next) => {
  try {
    const op = await Operation.findByPk(req.params.id);
    if (!op) return res.status(404).json({ error: 'Opération non trouvée' });
    await checkAccount(op.accountId, req.user.id);
    const cycle = { Aucun: 'Pointé', Pointé: 'Rapproché', Rapproché: 'Aucun' };
    const newStatut = req.body.statut || cycle[op.statut] || 'Aucun';
    await op.update({ statut: newStatut });
    res.json(op);
  } catch (err) { next(err); }
};

exports.rapprocher = async (req, res, next) => {
  try {
    await checkAccount(req.params.accountId, req.user.id);
    const [count] = await Operation.update(
      { statut: 'Rapproché' },
      { where: { accountId: req.params.accountId, statut: 'Pointé' } }
    );
    res.json({ success: true, updated: count });
  } catch (err) { next(err); }
};

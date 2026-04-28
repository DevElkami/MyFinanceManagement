const { Account, Operation, Echeance } = require('../models');

exports.list = async (req, res, next) => {
  try {
    const accounts = await Account.findAll({ where: { userId: req.user.id }, order: [['id', 'ASC']] });
    res.json(accounts);
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { name, bank, owner, soldeInitial } = req.body;
    if (!name) return res.status(400).json({ error: 'Le nom est requis' });
    const account = await Account.create({
      userId: req.user.id, name, bank: bank || '', owner: owner || '',
      soldeInitial: parseFloat(soldeInitial) || 0,
    });
    res.status(201).json(account);
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const account = await Account.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!account) return res.status(404).json({ error: 'Compte non trouvé' });
    const { name, bank, owner, soldeInitial } = req.body;
    await account.update({ name, bank, owner, soldeInitial: parseFloat(soldeInitial) || 0 });
    res.json(account);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const account = await Account.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!account) return res.status(404).json({ error: 'Compte non trouvé' });
    await Operation.destroy({ where: { accountId: account.id } });
    await Echeance.destroy({ where: { accountId: account.id } });
    await account.destroy();
    res.json({ success: true });
  } catch (err) { next(err); }
};

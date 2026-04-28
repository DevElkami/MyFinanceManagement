const { Op } = require('sequelize');
const { Account, Operation, Category, EcartOverride, EquilibragePreference } = require('../models');
const equilibrageService = require('../services/equilibrageService');

exports.getEquilibrage = async (req, res, next) => {
  try {
    const { account1, account2 } = req.query;
    const [acc1, acc2] = await Promise.all([
      Account.findOne({ where: { id: account1, userId: req.user.id } }),
      Account.findOne({ where: { id: account2, userId: req.user.id } }),
    ]);
    if (!acc1 || !acc2) return res.status(404).json({ error: 'Comptes non trouvés' });

    const [operations, categories, overrides] = await Promise.all([
      Operation.findAll({ where: { accountId: { [Op.in]: [acc1.id, acc2.id] } }, order: [['date', 'ASC']] }),
      Category.findAll({ where: { userId: req.user.id } }),
      EcartOverride.findAll({
        where: {
          [Op.or]: [
            { account1Id: acc1.id, account2Id: acc2.id },
            { account1Id: acc2.id, account2Id: acc1.id },
          ],
        },
      }),
    ]);

    const result = equilibrageService.compute(acc1, acc2, operations, categories, overrides);
    res.json(result);
  } catch (err) { next(err); }
};

exports.putEcart = async (req, res, next) => {
  try {
    const { account1Id, account2Id, month, ecartAccount1, ecartAccount2 } = req.body;
    const existing = await EcartOverride.findOne({ where: { account1Id, account2Id, month } });
    if (existing) {
      await existing.update({ ecartAccount1, ecartAccount2 });
      res.json(existing);
    } else {
      res.json(await EcartOverride.create({ account1Id, account2Id, month, ecartAccount1, ecartAccount2 }));
    }
  } catch (err) { next(err); }
};

exports.deleteEcart = async (req, res, next) => {
  try {
    await EcartOverride.destroy({ where: { id: req.params.id } });
    res.json({ success: true });
  } catch (err) { next(err); }
};

exports.getPreferences = async (req, res, next) => {
  try {
    res.json(await EquilibragePreference.findOne({ where: { userId: req.user.id } }) || null);
  } catch (err) { next(err); }
};

exports.putPreferences = async (req, res, next) => {
  try {
    const { account1Id, account2Id } = req.body;
    const existing = await EquilibragePreference.findOne({ where: { userId: req.user.id } });
    if (existing) {
      await existing.update({ account1Id, account2Id });
      res.json(existing);
    } else {
      res.json(await EquilibragePreference.create({ userId: req.user.id, account1Id, account2Id }));
    }
  } catch (err) { next(err); }
};

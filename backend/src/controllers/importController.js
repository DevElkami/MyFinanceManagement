const { Account, Operation, ImportMapping } = require('../models');
const importService = require('../services/importService');

exports.importFile = async (req, res, next) => {
  try {
    const account = await Account.findOne({ where: { id: req.params.accountId, userId: req.user.id } });
    if (!account) return res.status(404).json({ error: 'Compte non trouvé' });
    if (!req.file) return res.status(400).json({ error: 'Fichier manquant' });

    const format = req.body.format || 'csv';
    const mapping = req.body.mapping ? JSON.parse(req.body.mapping) : null;

    const parsed = await importService.parse(req.file.buffer, format, mapping);

    const existing = await Operation.findAll({ where: { accountId: account.id } });

    const toCreate = parsed.filter(row => {
      if (!row.date) return false;
      return !existing.some(
        op => op.date === row.date &&
          Math.abs(parseFloat(op.amount) - parseFloat(row.amount)) < 0.005 &&
          op.type === (row.type || 'CB')
      );
    });

    await Operation.bulkCreate(toCreate.map(row => ({
      accountId: account.id,
      date: row.date,
      amount: parseFloat(row.amount),
      type: row.type || 'CB',
      tierId: row.tierId || null,
      categoryId: row.categoryId || null,
      note: row.note || '',
      statut: 'Aucun',
      equilibre: true,
    })));

    res.json({ imported: toCreate.length, skipped: parsed.length - toCreate.length, total: parsed.length });
  } catch (err) { next(err); }
};

exports.getMappings = async (req, res, next) => {
  try {
    const mapping = await ImportMapping.findOne({
      where: { userId: req.user.id },
      order: [['id', 'DESC']],
    });
    res.json(mapping || null);
  } catch (err) { next(err); }
};

exports.saveMappings = async (req, res, next) => {
  try {
    const { format, mappingJson } = req.body;
    const existing = await ImportMapping.findOne({ where: { userId: req.user.id } });
    if (existing) {
      await existing.update({ format, mappingJson });
      res.json(existing);
    } else {
      const m = await ImportMapping.create({ userId: req.user.id, format, mappingJson });
      res.json(m);
    }
  } catch (err) { next(err); }
};

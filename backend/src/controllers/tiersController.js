const { Tier } = require('../models');

exports.list = async (req, res, next) => {
  try {
    res.json(await Tier.findAll({ where: { userId: req.user.id }, order: [['label', 'ASC']] }));
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { label } = req.body;
    if (!label) return res.status(400).json({ error: 'Le libellé est requis' });
    res.status(201).json(await Tier.create({ userId: req.user.id, label }));
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const tier = await Tier.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!tier) return res.status(404).json({ error: 'Tiers non trouvé' });
    await tier.update({ label: req.body.label });
    res.json(tier);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const tier = await Tier.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!tier) return res.status(404).json({ error: 'Tiers non trouvé' });
    await tier.destroy();
    res.json({ success: true });
  } catch (err) { next(err); }
};

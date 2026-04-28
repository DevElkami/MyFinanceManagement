const { Category } = require('../models');

exports.list = async (req, res, next) => {
  try {
    res.json(await Category.findAll({ where: { userId: req.user.id }, order: [['label', 'ASC']] }));
  } catch (err) { next(err); }
};

exports.create = async (req, res, next) => {
  try {
    const { label, type } = req.body;
    if (!label) return res.status(400).json({ error: 'Le libellé est requis' });
    res.status(201).json(await Category.create({ userId: req.user.id, label, type: type || 'Divers' }));
  } catch (err) { next(err); }
};

exports.update = async (req, res, next) => {
  try {
    const cat = await Category.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!cat) return res.status(404).json({ error: 'Catégorie non trouvée' });
    await cat.update({ label: req.body.label, type: req.body.type });
    res.json(cat);
  } catch (err) { next(err); }
};

exports.remove = async (req, res, next) => {
  try {
    const cat = await Category.findOne({ where: { id: req.params.id, userId: req.user.id } });
    if (!cat) return res.status(404).json({ error: 'Catégorie non trouvée' });
    await cat.destroy();
    res.json({ success: true });
  } catch (err) { next(err); }
};

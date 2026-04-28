const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { User } = require('../models');

const sign = (user) =>
  jwt.sign(
    { id: user.id, login: user.login },
    process.env.JWT_SECRET || 'secret',
    { expiresIn: '180d' }
  );

exports.register = async (req, res, next) => {
  try {
    const { login, password } = req.body;
    if (!login || !password) return res.status(400).json({ error: 'Login et mot de passe requis' });
    if (password.length < 6) return res.status(400).json({ error: 'Le mot de passe doit contenir au moins 6 caractères' });
    const existing = await User.findOne({ where: { login } });
    if (existing) return res.status(409).json({ error: 'Cet identifiant est déjà utilisé' });
    const passwordHash = await bcrypt.hash(password, 10);
    const user = await User.create({ login, passwordHash });
    res.status(201).json({ token: sign(user), username: user.login });
  } catch (err) { next(err); }
};

exports.login = async (req, res, next) => {
  try {
    const { login, password } = req.body;
    if (!login || !password) return res.status(400).json({ error: 'Login et mot de passe requis' });
    const user = await User.findOne({ where: { login } });
    if (!user) return res.status(401).json({ error: 'Identifiant ou mot de passe incorrect' });
    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(401).json({ error: 'Identifiant ou mot de passe incorrect' });
    res.json({ token: sign(user), username: user.login });
  } catch (err) { next(err); }
};

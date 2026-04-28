require('dotenv').config();
const express = require('express');
const cors = require('cors');
const { sequelize } = require('./models');

const authRoutes = require('./routes/auth');
const accountRoutes = require('./routes/accounts');
const operationRoutes = require('./routes/operations');
const categoryRoutes = require('./routes/categories');
const tierRoutes = require('./routes/tiers');
const echeanceRoutes = require('./routes/echeances');
const importRoutes = require('./routes/import');
const equilibrageRoutes = require('./routes/equilibrage');
const statisticsRoutes = require('./routes/statistics');
const authMiddleware = require('./middleware/auth');

const app = express();

app.use(cors({ origin: process.env.CORS_ORIGIN || '*' }));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Public
app.use('/api/auth', authRoutes);

// Protected — auth middleware on all /api routes below
app.use('/api', authMiddleware);
app.use('/api/accounts', accountRoutes);
app.use('/api', operationRoutes);
app.use('/api/categories', categoryRoutes);
app.use('/api/tiers', tierRoutes);
app.use('/api', echeanceRoutes);
app.use('/api', importRoutes);
app.use('/api', equilibrageRoutes);
app.use('/api', statisticsRoutes);

// Global error handler
app.use((err, req, res, next) => {
  console.error(err);
  res.status(err.status || 500).json({ error: err.message || 'Internal server error' });
});

const PORT = process.env.PORT || 3001;

const start = async () => {
  try {
    await sequelize.authenticate();
    console.log('Database connected');
    await sequelize.sync({ alter: false });
    console.log('Models synchronized');
  } catch (err) {
    console.warn('Database unavailable:', err.message);
    console.warn('Configure .env with DB credentials and restart to enable data persistence');
  }
  app.listen(PORT, () => console.log(`Finance 2026 API running on :${PORT}`));
};

start();

module.exports = app;

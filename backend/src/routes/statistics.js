const router = require('express').Router();
const c = require('../controllers/statisticsController');

router.get('/statistics', c.getStatistics);

module.exports = router;

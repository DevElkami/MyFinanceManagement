const router = require('express').Router();
const c = require('../controllers/echeancesController');

router.get('/accounts/:accountId/echeances', c.list);
router.post('/accounts/:accountId/echeances', c.create);
router.post('/accounts/:accountId/apply-echeances', c.applyEcheances);
router.put('/echeances/:id', c.update);
router.delete('/echeances/:id', c.remove);

module.exports = router;

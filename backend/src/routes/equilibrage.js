const router = require('express').Router();
const c = require('../controllers/equilibrageController');

router.get('/equilibrage/preferences', c.getPreferences);
router.put('/equilibrage/preferences', c.putPreferences);
router.get('/equilibrage', c.getEquilibrage);
router.put('/equilibrage/ecart', c.putEcart);
router.delete('/equilibrage/ecart/:id', c.deleteEcart);

module.exports = router;

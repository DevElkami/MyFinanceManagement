const router = require('express').Router();
const c = require('../controllers/operationsController');

router.get('/accounts/:accountId/operations', c.list);
router.post('/accounts/:accountId/operations', c.create);
router.post('/accounts/:accountId/rapprocher', c.rapprocher);
router.put('/operations/:id', c.update);
router.delete('/operations/:id', c.remove);
router.patch('/operations/:id/statut', c.patchStatut);

module.exports = router;

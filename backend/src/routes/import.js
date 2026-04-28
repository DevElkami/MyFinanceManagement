const router = require('express').Router();
const multer = require('multer');
const c = require('../controllers/importController');

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

router.post('/accounts/:accountId/import', upload.single('file'), c.importFile);
router.get('/import-mappings', c.getMappings);
router.post('/import-mappings', c.saveMappings);

module.exports = router;

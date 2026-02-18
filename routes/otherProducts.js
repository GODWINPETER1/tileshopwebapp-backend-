const express = require('express');
const router = express.Router();
const controller = require('../controllers/otherProductController');
const upload = require('../middleware/upload');

router.get('/', controller.getAll);
router.get('/:id', controller.getById);
router.post('/', upload.single('mainImage') , controller.create);
router.put('/:id',upload.single('mainImage'), controller.update);
router.delete('/:id', controller.remove);

module.exports = router;

const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, equipmentController.getAllEquipment);
router.get('/:id', verifyToken, equipmentController.getEquipmentById);
router.post('/', verifyToken, equipmentController.createEquipment);
router.put('/:id', verifyToken, equipmentController.updateEquipment);
router.delete('/:id', verifyToken, equipmentController.deleteEquipment);

module.exports = router;
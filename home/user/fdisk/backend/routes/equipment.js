const express = require('express');
const router = express.Router();
const equipmentController = require('../controllers/equipmentController');
const { authenticateToken } = require('../middleware/auth');

router.get('/', authenticateToken, equipmentController.getAllEquipment);
router.get('/:id', authenticateToken, equipmentController.getEquipmentById);
router.post('/', authenticateToken, equipmentController.createEquipment);
router.put('/:id', authenticateToken, equipmentController.updateEquipment);
router.delete('/:id', authenticateToken, equipmentController.deleteEquipment);

module.exports = router;
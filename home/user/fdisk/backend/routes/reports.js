const express = require('express');
const router = express.Router();
const reportController = require('../controllers/reportController');
const { verifyToken } = require('../middleware/auth');

router.get('/', verifyToken, reportController.getAllReports);
router.get('/:id', verifyToken, reportController.getReportById);
router.post('/', verifyToken, reportController.createReport);
router.put('/:id', verifyToken, reportController.updateReport);
router.delete('/:id', verifyToken, reportController.deleteReport);

module.exports = router;
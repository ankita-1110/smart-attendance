/**
 * Student Routes
 * Handles student-related operations
 */

const express = require('express');
const router = express.Router();
const studentController = require('../controllers/studentController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Get student profile
router.get('/profile', authenticateToken, studentController.getProfile);

// Get QR code for student
router.get('/qr-code', authenticateToken, studentController.getQRCode);

// Update student profile
router.put('/profile', authenticateToken, studentController.updateProfile);

module.exports = router;


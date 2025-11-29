/**
 * Admin Routes
 * Handles admin dashboard operations
 */

const express = require('express');
const router = express.Router();
const adminController = require('../controllers/adminController');
const { authenticateToken, isAdmin } = require('../middleware/authMiddleware');

// Get all students
router.get('/students', authenticateToken, isAdmin, adminController.getAllStudents);

// Get attendance statistics
router.get('/stats', authenticateToken, isAdmin, adminController.getStats);

// Export attendance as CSV
router.get('/export', authenticateToken, isAdmin, adminController.exportCSV);

// Get attendance with filters
router.get('/attendance', authenticateToken, isAdmin, adminController.getAttendance);

module.exports = router;


/**
 * Attendance Routes
 * Handles attendance marking and retrieval
 */

const express = require('express');
const router = express.Router();
const attendanceController = require('../controllers/attendanceController');
const { authenticateToken } = require('../middleware/authMiddleware');

// Mark attendance (requires authentication)
router.post('/mark', authenticateToken, attendanceController.markAttendance);

// Get attendance records for a student
router.get('/student/:studentId', authenticateToken, attendanceController.getStudentAttendance);

// Get all attendance records (admin only)
router.get('/all', authenticateToken, attendanceController.getAllAttendance);

module.exports = router;


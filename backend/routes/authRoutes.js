/**
 * Authentication Routes
 * Handles registration and login
 */

const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const upload = require('../middleware/uploadMiddleware');

// Student registration
router.post('/register', upload.single('photo'), authController.register);

// Student login
router.post('/login', authController.login);

// Admin login
router.post('/admin/login', authController.adminLogin);

module.exports = router;


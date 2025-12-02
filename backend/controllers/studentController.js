/**
 * Student Controller
 * Handles student-related operations
 */

const QRCode = require('qrcode');
const { db } = require('../firebase');

// Get Student Profile
exports.getProfile = async (req, res) => {
  try {
    const userId = req.user.userId;

    const studentDoc = await db.collection('students').doc(userId).get();
    
    if (!studentDoc.exists) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const studentData = studentDoc.data();
    delete studentData.password; // Remove password from response

    res.json({
      student: {
        id: studentDoc.id,
        ...studentData
      }
    });
  } catch (error) {
    console.error('Get profile error:', error);
    res.status(500).json({ error: 'Failed to retrieve profile', details: error.message });
  }
};

// Get QR Code for Student
exports.getQRCode = async (req, res) => {
  try {
    const userId = req.user.userId;
    const rollNumber = req.user.rollNumber;

    // Create QR code data
    const qrData = JSON.stringify({
      studentId: userId,
      rollNumber: rollNumber,
      timestamp: Date.now()
    });

    // Generate QR code as data URL
    const qrCodeDataUrl = await QRCode.toDataURL(qrData, {
      width: 300,
      margin: 2
    });

    res.json({
      qrCode: qrCodeDataUrl,
      studentId: userId,
      rollNumber: rollNumber
    });
  } catch (error) {
    console.error('QR code generation error:', error);
    res.status(500).json({ error: 'Failed to generate QR code', details: error.message });
  }
};

// Update Student Profile
exports.updateProfile = async (req, res) => {
  try {
    const userId = req.user.userId;
    const { name, email } = req.body;

    const updateData = {
      updatedAt: new Date()
    };

    if (name) updateData.name = name;
    if (email) updateData.email = email;

    await db.collection('students').doc(userId).update(updateData);

    res.json({
      message: 'Profile updated successfully'
    });
  } catch (error) {
    console.error('Update profile error:', error);
    res.status(500).json({ error: 'Failed to update profile', details: error.message });
  }
};


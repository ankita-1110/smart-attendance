/**
 * Attendance Controller
 * Handles attendance marking and retrieval
 */

const { db } = require('../firebase');

// Mark Attendance
exports.markAttendance = async (req, res) => {
  try {
    const { studentId, method } = req.body;
    const userId = req.user.userId;
    const rollNumber = req.user.rollNumber;

    // Validate required fields
    if (!studentId) {
      return res.status(400).json({ error: 'Student ID is required' });
    }

    if (!userId) {
      return res.status(400).json({ error: 'User ID not found in token' });
    }

    // Verify student can only mark their own attendance
    if (req.user.role === 'student' && userId !== studentId) {
      return res.status(403).json({ error: 'You can only mark your own attendance' });
    }

    // Get student data
    const studentDoc = await db.collection('students').doc(studentId).get();
    if (!studentDoc.exists) {
      return res.status(404).json({ error: 'Student not found' });
    }

    const studentData = studentDoc.data();
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Check if attendance already marked today
    const attendanceRef = db.collection('attendance');
    const todayAttendance = await attendanceRef
      .where('studentId', '==', studentId)
      .where('date', '==', today.toISOString().split('T')[0])
      .get();

    if (!todayAttendance.empty) {
      return res.status(400).json({ 
        error: 'Attendance already marked for today',
        attendance: todayAttendance.docs[0].data()
      });
    }

    // Create attendance record
    const attendanceData = {
      studentId,
      rollNumber: studentData.rollNumber,
      studentName: studentData.name,
      date: today.toISOString().split('T')[0],
      timestamp: now.toISOString(),
      method: method || 'manual',
      markedAt: now.toISOString()
    };

    const docRef = await attendanceRef.add(attendanceData);

    res.status(201).json({
      message: 'Attendance marked successfully',
      attendance: {
        id: docRef.id,
        ...attendanceData
      }
    });
  } catch (error) {
    console.error('Mark attendance error:', error);
    console.error('Error stack:', error.stack);
    res.status(500).json({ 
      error: 'Failed to mark attendance', 
      details: error.message,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined
    });
  }
};

// Get Student Attendance
exports.getStudentAttendance = async (req, res) => {
  try {
    const { studentId } = req.params;
    const userId = req.user.userId;

    // Verify student can only view their own attendance
    if (req.user.role === 'student' && userId !== studentId) {
      return res.status(403).json({ error: 'Access denied' });
    }

    const attendanceRef = db.collection('attendance');
    const snapshot = await attendanceRef
      .where('studentId', '==', studentId)
      .orderBy('timestamp', 'desc')
      .get();

    const attendance = [];
    snapshot.forEach(doc => {
      attendance.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      studentId,
      attendance,
      totalDays: attendance.length
    });
  } catch (error) {
    console.error('Get attendance error:', error);
    res.status(500).json({ error: 'Failed to retrieve attendance', details: error.message });
  }
};

// Get All Attendance (Admin)
exports.getAllAttendance = async (req, res) => {
  try {
    const { date, studentId } = req.query;

    let query = db.collection('attendance').orderBy('timestamp', 'desc');

    if (date) {
      query = query.where('date', '==', date);
    }

    if (studentId) {
      query = query.where('studentId', '==', studentId);
    }

    const snapshot = await query.limit(1000).get();

    const attendance = [];
    snapshot.forEach(doc => {
      attendance.push({
        id: doc.id,
        ...doc.data()
      });
    });

    res.json({
      attendance,
      totalRecords: attendance.length
    });
  } catch (error) {
    console.error('Get all attendance error:', error);
    res.status(500).json({ error: 'Failed to retrieve attendance', details: error.message });
  }
};


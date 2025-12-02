/**
 * Admin Controller
 * Handles admin dashboard operations
 */

const { db } = require('../firebase');

// Get All Students
exports.getAllStudents = async (req, res) => {
  try {
    const snapshot = await db.collection('students').get();
    
    const students = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      delete data.password; // Remove password
      students.push({
        id: doc.id,
        ...data
      });
    });

    res.json({
      students,
      total: students.length
    });
  } catch (error) {
    console.error('Get all students error:', error);
    res.status(500).json({ error: 'Failed to retrieve students', details: error.message });
  }
};

// Get Attendance Statistics
exports.getStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = db.collection('attendance');

    if (startDate && endDate) {
      query = query.where('date', '>=', startDate).where('date', '<=', endDate);
    }

    const snapshot = await query.get();

    const stats = {
      totalRecords: snapshot.size,
      byDate: {},
      byStudent: {},
      byMethod: {}
    };

    snapshot.forEach(doc => {
      const data = doc.data();
      
      // Count by date
      stats.byDate[data.date] = (stats.byDate[data.date] || 0) + 1;
      
      // Count by student
      stats.byStudent[data.studentId] = (stats.byStudent[data.studentId] || 0) + 1;
      
      // Count by method
      stats.byMethod[data.method] = (stats.byMethod[data.method] || 0) + 1;
    });

    res.json(stats);
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to retrieve statistics', details: error.message });
  }
};

// Export Attendance as CSV
exports.exportCSV = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    let query = db.collection('attendance').orderBy('timestamp', 'desc');

    if (startDate && endDate) {
      query = query.where('date', '>=', startDate).where('date', '<=', endDate);
    }

    const snapshot = await query.get();

    const records = [];
    snapshot.forEach(doc => {
      const data = doc.data();
      records.push({
        'Student Name': data.studentName,
        'Roll Number': data.rollNumber,
        'Date': data.date,
        'Time': new Date(data.timestamp).toLocaleTimeString(),
        'Method': data.method
      });
    });

    // Set headers for CSV download
    res.setHeader('Content-Type', 'text/csv');
    res.setHeader('Content-Disposition', 'attachment; filename=attendance.csv');

    // Convert to CSV
    const csvHeader = 'Student Name,Roll Number,Date,Time,Method\n';
    const csvRows = records.map(record => 
      `"${record['Student Name']}","${record['Roll Number']}","${record['Date']}","${record['Time']}","${record['Method']}"`
    ).join('\n');

    res.send(csvHeader + csvRows);
  } catch (error) {
    console.error('Export CSV error:', error);
    res.status(500).json({ error: 'Failed to export CSV', details: error.message });
  }
};

// Get Attendance with Filters
exports.getAttendance = async (req, res) => {
  try {
    const { date, studentId, startDate, endDate } = req.query;

    let query = db.collection('attendance').orderBy('timestamp', 'desc');

    if (date) {
      query = query.where('date', '==', date);
    } else if (startDate && endDate) {
      query = query.where('date', '>=', startDate).where('date', '<=', endDate);
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
    console.error('Get attendance error:', error);
    res.status(500).json({ error: 'Failed to retrieve attendance', details: error.message });
  }
};


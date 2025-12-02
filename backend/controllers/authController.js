/**
 * Authentication Controller
 * Handles registration and login logic
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const { db, bucket } = require('../firebase');

// Student Registration
exports.register = async (req, res) => {
  try {
    const { name, rollNumber, email, password } = req.body;
    const photo = req.file;

    // Validate input
    if (!name || !rollNumber || !email || !password) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    // Check if student already exists
    const studentRef = db.collection('students');
    const existingStudent = await studentRef.where('email', '==', email).get();
    
    if (!existingStudent.empty) {
      return res.status(400).json({ error: 'Student with this email already exists' });
    }

    const existingRoll = await studentRef.where('rollNumber', '==', rollNumber).get();
    if (!existingRoll.empty) {
      return res.status(400).json({ error: 'Student with this roll number already exists' });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Upload photo to Firebase Storage if provided
    let photoUrl = null;
    if (photo) {
      const fileName = `students/${rollNumber}_${Date.now()}_${photo.originalname}`;
      const file = bucket.file(fileName);
      
      await file.save(photo.buffer, {
        metadata: {
          contentType: photo.mimetype
        }
      });

      await file.makePublic();
      photoUrl = `https://storage.googleapis.com/${bucket.name}/${fileName}`;
    }

    // Save student to Firestore
    const studentData = {
      name,
      rollNumber,
      email,
      password: hashedPassword,
      photoUrl,
      role: 'student',
      createdAt: new Date(),
      updatedAt: new Date()
    };

    const docRef = await studentRef.add(studentData);
    
    // Generate JWT token
    const token = jwt.sign(
      { 
        userId: docRef.id, 
        email, 
        role: 'student',
        rollNumber 
      },
      process.env.JWT_SECRET || 'bJWQAQegyJEXbSqZoREfwGYmNtQZjx6oGZ0UOCjmnOvPCHNrBX0cLhKEKEGRX16cWfKfclV7wDuJeRISECkQbw==',
      { expiresIn: '7d' }
    );

    res.status(201).json({
      message: 'Student registered successfully',
      token,
      student: {
        id: docRef.id,
        name,
        rollNumber,
        email,
        photoUrl
      }
    });
  } catch (error) {
    console.error('Registration error:', error);
    res.status(500).json({ error: 'Registration failed', details: error.message });
  }
};

// Student Login
exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Find student by email
    const studentRef = db.collection('students');
    const snapshot = await studentRef.where('email', '==', email).get();

    if (snapshot.empty) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    const studentDoc = snapshot.docs[0];
    const studentData = studentDoc.data();

    // Verify password
    const isValidPassword = await bcrypt.compare(password, studentData.password);
    if (!isValidPassword) {
      return res.status(401).json({ error: 'Invalid email or password' });
    }

    // Generate JWT token
    const token = jwt.sign(
      {
        userId: studentDoc.id,
        email: studentData.email,
        role: studentData.role || 'student',
        rollNumber: studentData.rollNumber
      },
      process.env.JWT_SECRET || 'bJWQAQegyJEXbSqZoREfwGYmNtQZjx6oGZ0UOCjmnOvPCHNrBX0cLhKEKEGRX16cWfKfclV7wDuJeRISECkQbw==',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Login successful',
      token,
      student: {
        id: studentDoc.id,
        name: studentData.name,
        rollNumber: studentData.rollNumber,
        email: studentData.email,
        photoUrl: studentData.photoUrl
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed', details: error.message });
  }
};

// Admin Login
exports.adminLogin = async (req, res) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email and password are required' });
    }

    // Check admin credentials (hardcoded for demo - use environment variables in production)
    const adminEmail = process.env.ADMIN_EMAIL || 'admin@gmail.com';
    const adminPassword = process.env.ADMIN_PASSWORD || 'admin@123';

    if (email !== adminEmail || password !== adminPassword) {
      return res.status(401).json({ error: 'Invalid admin credentials' });
    }

    // Generate JWT token for admin
    const token = jwt.sign(
      {
        userId: 'admin',
        email: adminEmail,
        role: 'admin'
      },
      process.env.JWT_SECRET || 'bJWQAQegyJEXbSqZoREfwGYmNtQZjx6oGZ0UOCjmnOvPCHNrBX0cLhKEKEGRX16cWfKfclV7wDuJeRISECkQbw==',
      { expiresIn: '7d' }
    );

    res.json({
      message: 'Admin login successful',
      token,
      admin: {
        email: adminEmail,
        role: 'admin'
      }
    });
  } catch (error) {
    console.error('Admin login error:', error);
    res.status(500).json({ error: 'Admin login failed', details: error.message });
  }
};


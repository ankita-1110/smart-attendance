# Smart Attendance System

A complete web-based Smart Attendance System with Cloud Storage built using Node.js, Express, Firebase Firestore, and modern frontend technologies.

## Features

- ✅ **Student Registration** with optional photo upload to Firebase Storage
- ✅ **Secure Authentication** using JWT tokens and bcrypt password hashing
- ✅ **Multiple Attendance Methods**:
  - Manual login attendance
  - QR Code based attendance
- ✅ **Admin Dashboard** with:
  - View all students
  - View attendance records
  - Filter by date or student
  - Export attendance as CSV
  - Attendance statistics with charts
- ✅ **Student Dashboard** with:
  - Personal attendance history
  - Attendance statistics
  - QR code generation
- ✅ **Responsive Design** using Bootstrap 5
- ✅ **Cloud Storage** using Firebase Storage for student photos

## Tech Stack

- **Backend**: Node.js + Express
- **Database**: Firebase Firestore
- **Cloud Storage**: Firebase Storage
- **Frontend**: HTML + CSS + JavaScript + Bootstrap 5
- **Authentication**: JWT (JSON Web Tokens)
- **Password Hashing**: bcryptjs
- **QR Code**: qrcode library
- **Charts**: Chart.js

## Project Structure

```
Smart-Attendance/
│── backend/
│   ├── server.js                 # Main server file
│   ├── firebase.js               # Firebase configuration
│   ├── package.json              # Backend dependencies
│   ├── .env.example              # Environment variables example
│   ├── serviceAccountKey.json.example  # Firebase service account example
│   ├── routes/                   # API routes
│   │   ├── authRoutes.js
│   │   ├── attendanceRoutes.js
│   │   ├── studentRoutes.js
│   │   └── adminRoutes.js
│   ├── controllers/              # Route controllers
│   │   ├── authController.js
│   │   ├── attendanceController.js
│   │   ├── studentController.js
│   │   └── adminController.js
│   └── middleware/              # Express middleware
│       ├── authMiddleware.js
│       └── uploadMiddleware.js
│
│── frontend/
│   ├── index.html                # Login page
│   ├── register.html             # Registration page
│   ├── dashboard.html            # Dashboard (student/admin)
│   ├── attendance.html           # Attendance marking page
│   ├── css/
│   │   └── style.css            # Custom styles
│   └── js/
│       ├── auth.js              # Authentication logic
│       ├── dashboard.js          # Dashboard logic
│       └── attendance.js        # Attendance marking logic
│
└── README.md                     # This file
```

## Setup Instructions

### Prerequisites

- Node.js (v14 or higher)
- npm or yarn
- Firebase project with Firestore and Storage enabled
- Firebase Service Account Key (JSON file)

### Step 1: Firebase Setup

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Create a new project or use an existing one
3. Enable **Firestore Database**:
   - Go to Firestore Database
   - Click "Create database"
   - Start in production mode
   - Choose your preferred location
4. Enable **Storage**:
   - Go to Storage
   - Click "Get started"
   - Start in production mode
   - Use the same location as Firestore
5. Get **Service Account Key**:
   - Go to Project Settings → Service Accounts
   - Click "Generate new private key"
   - Download the JSON file
   - Rename it to `serviceAccountKey.json`
   - Place it in the `backend/` directory

### Step 2: Backend Setup

1. Navigate to the backend directory:
```bash
cd backend
```

2. Install dependencies:
```bash
npm install
```

3. Create `.env` file:
```bash
cp .env.example .env
```

4. Edit `.env` file and set your values:
```env
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=admin@123
```

5. Copy your Firebase service account key:
   - Copy `serviceAccountKey.json` to the `backend/` directory
   - Or rename the example file and fill in your Firebase credentials

6. Start the server:
```bash
npm start
```

For development with auto-reload:
```bash
npm run dev
```

The server will run on `http://localhost:3000`

### Step 3: Frontend Setup

1. Update API URL in frontend JavaScript files if needed:
   - Open `frontend/js/auth.js`
   - Open `frontend/js/dashboard.js`
   - Open `frontend/js/attendance.js`
   - Change `API_BASE_URL` if your backend is running on a different port

2. The frontend is served by the Express server, so no additional setup is needed.

### Step 4: Access the Application

1. Open your browser and go to `http://localhost:3000`
2. Register a new student account
3. Login with your credentials
4. Mark attendance using manual or QR code method

## Default Admin Credentials

- **Email**: `admin@gmail.com`
- **Password**: `admin@123`

**⚠️ Important**: Change these credentials in production by updating the `.env` file!

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register a new student
- `POST /api/auth/login` - Student login
- `POST /api/auth/admin/login` - Admin login

### Students
- `GET /api/students/profile` - Get student profile (authenticated)
- `GET /api/students/qr-code` - Get QR code for student (authenticated)
- `PUT /api/students/profile` - Update student profile (authenticated)

### Attendance
- `POST /api/attendance/mark` - Mark attendance (authenticated)
- `GET /api/attendance/student/:studentId` - Get student attendance (authenticated)
- `GET /api/attendance/all` - Get all attendance records (admin only)

### Admin
- `GET /api/admin/students` - Get all students (admin only)
- `GET /api/admin/stats` - Get attendance statistics (admin only)
- `GET /api/admin/attendance` - Get attendance with filters (admin only)
- `GET /api/admin/export` - Export attendance as CSV (admin only)

## Usage Guide

### For Students

1. **Registration**:
   - Go to `/register`
   - Fill in your details (name, roll number, email, password)
   - Optionally upload a photo
   - Click "Register"

2. **Login**:
   - Go to `/` (home page)
   - Select "Student" as user type
   - Enter your email and password
   - Click "Login"

3. **Mark Attendance**:
   - Go to `/attendance`
   - Choose "Manual" tab and click "Mark Attendance"
   - Or use "QR Code" tab to view your QR code

4. **View Dashboard**:
   - Go to `/dashboard`
   - View your attendance history and statistics

### For Admins

1. **Login**:
   - Go to `/` (home page)
   - Select "Admin" as user type
   - Enter admin email and password
   - Click "Login"

2. **View Dashboard**:
   - Go to `/dashboard`
   - View all students and attendance records
   - See statistics and charts

3. **Filter Attendance**:
   - Select a date from the date picker
   - Click "Filter" to view attendance for that date

4. **Export CSV**:
   - Optionally select a date
   - Click "Export CSV" to download attendance data

## Security Features

- Passwords are hashed using bcryptjs
- JWT tokens for API authentication
- Token expiration (7 days)
- Role-based access control (student/admin)
- File upload validation (images only, 5MB limit)

## Firestore Collections

The application uses the following Firestore collections:

- **students**: Stores student information
  - Fields: name, rollNumber, email, password (hashed), photoUrl, role, createdAt, updatedAt

- **attendance**: Stores attendance records
  - Fields: studentId, rollNumber, studentName, date, timestamp, method, markedAt

## Troubleshooting

### Common Issues

1. **Firebase Connection Error**:
   - Ensure `serviceAccountKey.json` is in the `backend/` directory
   - Verify Firebase project settings
   - Check Firestore and Storage are enabled

2. **Port Already in Use**:
   - Change `PORT` in `.env` file
   - Or stop the process using port 3000

3. **CORS Errors**:
   - Ensure backend is running
   - Check API_BASE_URL in frontend JS files matches backend URL

4. **Authentication Errors**:
   - Clear browser localStorage
   - Login again
   - Check JWT_SECRET in `.env` matches

5. **File Upload Errors**:
   - Check Firebase Storage rules allow uploads
   - Verify file size is under 5MB
   - Ensure file is an image format

## Production Deployment

### AWS Cloud Deployment

This project is **fully compatible with AWS**! Firebase works perfectly with AWS EC2, Elastic Beanstalk, or Lambda.

**Quick AWS Deployment:**
```bash
# See DEPLOYMENT.md for detailed instructions
eb init
eb setenv FIREBASE_KEY_BASE64="$(cat serviceAccountKey.json | base64)"
eb create smart-attendance-prod
eb deploy
```

**Key Points:**
- ✅ Firebase works seamlessly with AWS (cross-cloud architecture)
- ✅ Backend can be deployed on AWS EC2/Elastic Beanstalk
- ✅ Firebase key can be stored securely via environment variables
- ✅ See `DEPLOYMENT.md` and `AWS_DEPLOYMENT.md` for complete guide

### General Production Checklist

Before deploying to production:

1. Change `JWT_SECRET` to a strong random string
2. Update `ADMIN_EMAIL` and `ADMIN_PASSWORD`
3. Set proper Firebase Security Rules
4. Use environment variables for all sensitive data
5. Enable HTTPS
6. Set up proper error logging
7. Configure CORS for your domain
8. Use a process manager like PM2 (for EC2) or Elastic Beanstalk (managed)

## License

This project is open source and available for educational purposes.

## Support

For issues or questions, please check the code comments or create an issue in the repository.

---

**Built with ❤️ using Node.js, Express, and Firebase**


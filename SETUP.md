# Quick Setup Guide

## Prerequisites Checklist

- [ ] Node.js installed (v14+)
- [ ] Firebase project created
- [ ] Firestore Database enabled
- [ ] Firebase Storage enabled
- [ ] Service Account Key downloaded

## Step-by-Step Setup

### 1. Firebase Configuration

1. Create a Firebase project at https://console.firebase.google.com/
2. Enable **Firestore Database**:
   - Go to Firestore Database → Create database
   - Choose production mode
   - Select a location
3. Enable **Storage**:
   - Go to Storage → Get started
   - Choose production mode
   - Use same location as Firestore
4. Get **Service Account Key**:
   - Project Settings → Service Accounts
   - Generate new private key
   - Save as `backend/serviceAccountKey.json`

### 2. Backend Setup

```bash
cd backend
npm install
```

Create `.env` file in `backend/` directory:
```env
PORT=3000
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
ADMIN_EMAIL=admin@gmail.com
ADMIN_PASSWORD=admin@123
```

**Important**: Replace `JWT_SECRET` with a strong random string!

### 3. Start Server

```bash
npm start
```

Server runs on `http://localhost:3000`

### 4. Access Application

1. Open browser: `http://localhost:3000`
2. Register a student account
3. Login and start using!

## Default Admin Login

- Email: `admin@gmail.com`
- Password: `admin@123`

**Change these in production!**

## Troubleshooting

### Firebase Errors
- Ensure `serviceAccountKey.json` is in `backend/` folder
- Check Firestore and Storage are enabled
- Verify service account has proper permissions

### Port Already in Use
- Change `PORT` in `.env` file
- Or kill process using port 3000

### Module Not Found
- Run `npm install` in `backend/` directory
- Check `package.json` dependencies

## Next Steps

1. Change default admin credentials
2. Set strong JWT_SECRET
3. Configure Firebase Security Rules
4. Deploy to production

For detailed documentation, see [README.md](README.md)


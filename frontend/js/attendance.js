/**
 * Attendance JavaScript
 * Handles attendance marking functionality
 */

const API_BASE_URL = 'http://localhost:3000/api';

// Check authentication
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token) {
        window.location.href = '/';
        return;
    }
    
    // Redirect admin users back to dashboard - attendance marking is for students only
    if (role === 'admin') {
        alert('Attendance marking is only available for students. Redirecting to dashboard...');
        window.location.href = '/dashboard';
        return;
    }
    
    loadQRCode();
    checkTodayStatus();
    
    // Logout handler
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            localStorage.removeItem('role');
            window.location.href = '/';
        });
    }
    
    // Manual attendance button
    const markBtn = document.getElementById('markAttendanceBtn');
    if (markBtn) {
        markBtn.addEventListener('click', markAttendance);
    }
});

// Get auth token
function getAuthToken() {
    return localStorage.getItem('token');
}

// Get user ID
function getUserId() {
    try {
        const user = JSON.parse(localStorage.getItem('user'));
        if (!user || !user.id) {
            throw new Error('User not found in localStorage');
        }
        return user.id;
    } catch (error) {
        console.error('Error getting user ID:', error);
        localStorage.clear();
        window.location.href = '/';
        throw error;
    }
}

// Load QR Code
async function loadQRCode() {
    try {
        const response = await fetch(`${API_BASE_URL}/students/qr-code`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        if (!response.ok) {
            if (response.status === 401) {
                localStorage.clear();
                window.location.href = '/';
                return;
            }
            throw new Error(`Failed to load QR code: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Clear previous QR code
        document.getElementById('qrcode').innerHTML = '';
        
        // Generate QR code using client-side library
        // Create QR code data that can be used to mark attendance
        const qrData = JSON.stringify({
            studentId: data.studentId,
            rollNumber: data.rollNumber,
            timestamp: Date.now()
        });
        
        new QRCode(document.getElementById('qrcode'), {
            text: qrData,
            width: 256,
            height: 256,
            colorDark: '#000000',
            colorLight: '#ffffff',
            correctLevel: QRCode.CorrectLevel.H
        });
    } catch (error) {
        console.error('Error loading QR code:', error);
        showAlert('qrAlert', 'Failed to load QR code. Please refresh the page.', 'danger');
    }
}

// Mark Attendance
async function markAttendance() {
    const btn = document.getElementById('markAttendanceBtn');
    btn.disabled = true;
    btn.textContent = 'Marking...';
    
    try {
        // Check if user is logged in
        const token = getAuthToken();
        if (!token) {
            showAlert('manualAlert', 'Please log in to mark attendance', 'danger');
            setTimeout(() => window.location.href = '/', 2000);
            return;
        }

        const userId = getUserId();
        if (!userId) {
            showAlert('manualAlert', 'User information not found. Please log in again.', 'danger');
            setTimeout(() => window.location.href = '/', 2000);
            return;
        }

        console.log('Marking attendance for student:', userId);
        
        const response = await fetch(`${API_BASE_URL}/attendance/mark`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({
                studentId: userId,
                method: 'manual'
            })
        });
        
        console.log('Response status:', response.status);
        
        if (!response.ok) {
            let errorData;
            try {
                errorData = await response.json();
            } catch (e) {
                errorData = { error: `Server error: ${response.status} ${response.statusText}` };
            }
            
            // Handle authentication errors
            if (response.status === 401 || response.status === 403) {
                localStorage.clear();
                showAlert('manualAlert', 'Session expired. Please log in again.', 'danger');
                setTimeout(() => window.location.href = '/', 2000);
                return;
            }
            
            throw new Error(errorData.error || errorData.details || `Failed to mark attendance: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Attendance marked successfully:', data);
        showAlert('manualAlert', 'Attendance marked successfully!', 'success');
        checkTodayStatus();
    } catch (error) {
        console.error('Error marking attendance:', error);
        
        let errorMessage = 'Network error. Please try again.';
        
        // Distinguish between network errors and other errors
        if (error.name === 'TypeError' && error.message.includes('fetch')) {
            errorMessage = 'Cannot connect to server. Please check your connection and ensure the server is running.';
        } else if (error.message) {
            errorMessage = error.message;
        }
        
        showAlert('manualAlert', errorMessage, 'danger');
    } finally {
        btn.disabled = false;
        btn.textContent = 'Mark Attendance';
    }
}

// Check Today's Status
async function checkTodayStatus() {
    try {
        const userId = getUserId();
        const response = await fetch(`${API_BASE_URL}/attendance/student/${userId}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        if (!response.ok) {
            console.error('Failed to check status:', response.status);
            return;
        }
        
        const data = await response.json();
        const today = new Date().toISOString().split('T')[0];
        
        const todayRecord = data.attendance?.find(record => {
            const recordDate = new Date(record.timestamp || record.date);
            return recordDate.toISOString().split('T')[0] === today;
        });
        
        const statusDiv = document.getElementById('todayStatus');
        if (todayRecord) {
            const time = new Date(todayRecord.timestamp || todayRecord.date);
            statusDiv.innerHTML = `
                <span class="badge bg-success">Attendance Marked</span><br>
                <small class="text-muted">Marked at: ${time.toLocaleTimeString()}</small>
            `;
            const markBtn = document.getElementById('markAttendanceBtn');
            if (markBtn) {
                markBtn.disabled = true;
                markBtn.textContent = 'Already Marked Today';
            }
        } else {
            statusDiv.innerHTML = '<span class="badge bg-warning">Not Marked Yet</span>';
        }
    } catch (error) {
        console.error('Error checking status:', error);
    }
}

// Show Alert
function showAlert(containerId, message, type = 'success') {
    const container = document.getElementById(containerId);
    container.innerHTML = `
        <div class="alert alert-${type} alert-dismissible fade show" role="alert">
            ${message}
            <button type="button" class="btn-close" data-bs-dismiss="alert"></button>
        </div>
    `;
}


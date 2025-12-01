/**
 * Dashboard JavaScript
 * Handles dashboard display and admin panel
 */

// Use relative URL for Docker deployment (nginx will proxy to backend)
const API_BASE_URL = '/api';

// Check authentication
window.addEventListener('DOMContentLoaded', () => {
    const token = localStorage.getItem('token');
    const role = localStorage.getItem('role');
    
    if (!token) {
        window.location.href = '/';
        return;
    }
    
    if (role === 'admin') {
        loadAdminDashboard();
    } else {
        loadStudentDashboard();
    }
    
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
});

// Get auth token
function getAuthToken() {
    return localStorage.getItem('token');
}

// Load Student Dashboard
async function loadStudentDashboard() {
    const user = JSON.parse(localStorage.getItem('user'));
    document.getElementById('studentName').textContent = user.name;
    document.getElementById('rollNumber').textContent = user.rollNumber;
    
    try {
        const response = await fetch(`${API_BASE_URL}/students/profile`, {
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
            throw new Error(`Failed to load profile: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Load attendance
        const attendanceResponse = await fetch(`${API_BASE_URL}/attendance/student/${data.student.id}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        if (!attendanceResponse.ok) {
            console.error('Failed to load attendance:', attendanceResponse.status);
            displayStudentAttendance({ totalDays: 0, attendance: [] });
            return;
        }
        
        const attendanceData = await attendanceResponse.json();
        displayStudentAttendance(attendanceData);
    } catch (error) {
        console.error('Error loading dashboard:', error);
        alert('Failed to load dashboard. Please refresh the page.');
    }
}

// Display Student Attendance
function displayStudentAttendance(data) {
    document.getElementById('totalAttendance').textContent = data.totalDays;
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthAttendance = data.attendance.filter(record => {
        const recordDate = new Date(record.timestamp);
        return recordDate.getMonth() === currentMonth && recordDate.getFullYear() === currentYear;
    }).length;
    
    document.getElementById('monthAttendance').textContent = monthAttendance;
    
    if (data.attendance.length > 0) {
        const lastRecord = data.attendance[0];
        const lastDate = new Date(lastRecord.timestamp);
        document.getElementById('lastAttendance').textContent = lastDate.toLocaleDateString() + ' ' + lastDate.toLocaleTimeString();
    }
    
    const tableBody = document.getElementById('attendanceTable');
    if (data.attendance.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="3" class="text-center">No attendance records found</td></tr>';
    } else {
        tableBody.innerHTML = data.attendance.map(record => {
            const date = new Date(record.timestamp);
            return `
                <tr>
                    <td>${date.toLocaleDateString()}</td>
                    <td>${date.toLocaleTimeString()}</td>
                    <td><span class="badge bg-info">${record.method}</span></td>
                </tr>
            `;
        }).join('');
    }
}

// Load Admin Dashboard
async function loadAdminDashboard() {
    document.getElementById('studentDashboard').style.display = 'none';
    document.getElementById('adminDashboard').style.display = 'block';
    document.getElementById('adminLink').style.display = 'block';
    document.getElementById('studentName').textContent = 'Admin';
    
    // Hide "Mark Attendance" link for admin users
    const attendanceLink = document.querySelector('a[href="/attendance"]');
    if (attendanceLink && attendanceLink.closest('li')) {
        attendanceLink.closest('li').style.display = 'none';
    }
    
    try {
        // Load students
        const studentsResponse = await fetch(`${API_BASE_URL}/admin/students`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        if (!studentsResponse.ok) {
            if (studentsResponse.status === 401 || studentsResponse.status === 403) {
                localStorage.clear();
                window.location.href = '/';
                return;
            }
            throw new Error(`Failed to load students: ${studentsResponse.status}`);
        }
        
        const studentsData = await studentsResponse.json();
        document.getElementById('totalStudents').textContent = studentsData.total || 0;
        
        // Load attendance stats
        const statsResponse = await fetch(`${API_BASE_URL}/admin/stats`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        if (!statsResponse.ok) {
            console.error('Failed to load stats:', statsResponse.status);
            displayAdminStats({ totalRecords: 0, byDate: {}, byMethod: {} });
        } else {
            const statsData = await statsResponse.json();
            displayAdminStats(statsData);
        }
        
        // Load all attendance
        const attendanceResponse = await fetch(`${API_BASE_URL}/admin/attendance`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        if (!attendanceResponse.ok) {
            console.error('Failed to load attendance:', attendanceResponse.status);
            displayAdminAttendance([]);
        } else {
            const attendanceData = await attendanceResponse.json();
            displayAdminAttendance(attendanceData.attendance || []);
        }
    } catch (error) {
        console.error('Error loading admin dashboard:', error);
        alert('Failed to load admin dashboard. Please refresh the page.');
    }
}

// Display Admin Statistics
function displayAdminStats(stats) {
    document.getElementById('totalRecords').textContent = stats.totalRecords;
    
    const today = new Date().toISOString().split('T')[0];
    document.getElementById('todayAttendance').textContent = stats.byDate[today] || 0;
    
    const now = new Date();
    const currentMonth = now.getMonth();
    const currentYear = now.getFullYear();
    
    const monthRecords = Object.keys(stats.byDate).filter(date => {
        const dateObj = new Date(date);
        return dateObj.getMonth() === currentMonth && dateObj.getFullYear() === currentYear;
    }).reduce((sum, date) => sum + stats.byDate[date], 0);
    
    document.getElementById('monthRecords').textContent = monthRecords;
    
    // Create charts
    createDateChart(stats.byDate);
    createMethodChart(stats.byMethod);
}

// Create Date Chart
function createDateChart(dateData) {
    const ctx = document.getElementById('dateChart').getContext('2d');
    const labels = Object.keys(dateData).sort().slice(-7); // Last 7 days
    const data = labels.map(date => dateData[date] || 0);
    
    new Chart(ctx, {
        type: 'line',
        data: {
            labels: labels,
            datasets: [{
                label: 'Attendance',
                data: data,
                borderColor: 'rgb(75, 192, 192)',
                tension: 0.1
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true
        }
    });
}

// Create Method Chart
function createMethodChart(methodData) {
    const ctx = document.getElementById('methodChart').getContext('2d');
    const labels = Object.keys(methodData);
    const data = Object.values(methodData);
    
    new Chart(ctx, {
        type: 'doughnut',
        data: {
            labels: labels,
            datasets: [{
                label: 'Attendance by Method',
                data: data,
                backgroundColor: [
                    'rgb(255, 99, 132)',
                    'rgb(54, 162, 235)',
                    'rgb(255, 205, 86)'
                ]
            }]
        },
        options: {
            responsive: true,
            maintainAspectRatio: true
        }
    });
}

// Display Admin Attendance
function displayAdminAttendance(attendance) {
    const tableBody = document.getElementById('adminAttendanceTable');
    if (attendance.length === 0) {
        tableBody.innerHTML = '<tr><td colspan="5" class="text-center">No attendance records found</td></tr>';
    } else {
        tableBody.innerHTML = attendance.map(record => {
            const date = new Date(record.timestamp);
            return `
                <tr>
                    <td>${record.studentName}</td>
                    <td>${record.rollNumber}</td>
                    <td>${date.toLocaleDateString()}</td>
                    <td>${date.toLocaleTimeString()}</td>
                    <td><span class="badge bg-info">${record.method}</span></td>
                </tr>
            `;
        }).join('');
    }
}

// Filter Attendance
async function filterAttendance() {
    const date = document.getElementById('filterDate').value;
    if (!date) {
        alert('Please select a date');
        return;
    }
    
    try {
        const response = await fetch(`${API_BASE_URL}/admin/attendance?date=${date}`, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        if (!response.ok) {
            throw new Error(`Failed to filter attendance: ${response.status}`);
        }
        
        const data = await response.json();
        displayAdminAttendance(data.attendance || []);
    } catch (error) {
        console.error('Error filtering attendance:', error);
        alert('Failed to filter attendance. Please try again.');
    }
}

// Export CSV
async function exportCSV() {
    const date = document.getElementById('filterDate').value;
    let url = `${API_BASE_URL}/admin/export`;
    if (date) {
        url += `?startDate=${date}&endDate=${date}`;
    }
    
    try {
        const response = await fetch(url, {
            headers: {
                'Authorization': `Bearer ${getAuthToken()}`
            }
        });
        
        if (!response.ok) {
            if (response.status === 401 || response.status === 403) {
                localStorage.clear();
                window.location.href = '/';
                return;
            }
            const errorData = await response.json().catch(() => ({}));
            throw new Error(errorData.error || `Failed to export CSV: ${response.status}`);
        }
        
        const blob = await response.blob();
        const downloadUrl = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = downloadUrl;
        a.download = `attendance_${date || 'all'}.csv`;
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(downloadUrl);
        document.body.removeChild(a);
    } catch (error) {
        console.error('Export error:', error);
        alert('Failed to export CSV');
    }
}


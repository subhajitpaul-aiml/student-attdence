/**
 * EduTrack - Authentication & Role-Based Access Control
 * Manages user sessions, demo 1-click logins, and page access control.
 */

const Auth = {
  // Get currently logged-in user
  getUser() {
    return Storage.getCurrentUser();
  },

  // Check login credentials against storage
  login(identifier, password, remember = true) {
    const users = Storage.getUsers();
    const cleanId = identifier.trim().toLowerCase();
    
    const user = users.find(u => 
      (u.email.toLowerCase() === cleanId || u.username.toLowerCase() === cleanId) &&
      u.password === password
    );

    if (user) {
      Storage.setCurrentUser(user);
      if (remember) {
        localStorage.setItem('edutrack_remember_me', cleanId);
      } else {
        localStorage.removeItem('edutrack_remember_me');
      }
      return { success: true, user };
    }

    return { 
      success: false, 
      message: 'Invalid credentials. Try using one of the 1-click demo accounts below.' 
    };
  },

  // 1-Click Demo Logins
  quickLogin(role) {
    const users = Storage.getUsers();
    let target = null;

    if (role === 'admin') {
      target = users.find(u => u.role === 'admin');
    } else if (role === 'teacher') {
      target = users.find(u => u.role === 'teacher');
    } else if (role === 'student') {
      target = users.find(u => u.role === 'student');
    }

    if (target) {
      Storage.setCurrentUser(target);
      this.redirectToDashboard(target.role);
      return target;
    }
    return null;
  },

  // Redirect to correct dashboard based on role
  redirectToDashboard(role) {
    // Detect whether we are in a subfolder (admin/, teacher/, student/) or root
    const path = window.location.pathname;
    const isSubfolder = path.includes('/admin/') || path.includes('/teacher/') || path.includes('/student/');
    const prefix = isSubfolder ? '../' : './';

    switch (role) {
      case 'admin':
        window.location.href = `${prefix}admin/dashboard.html`;
        break;
      case 'teacher':
        window.location.href = `${prefix}teacher/dashboard.html`;
        break;
      case 'student':
        window.location.href = `${prefix}student/dashboard.html`;
        break;
      default:
        window.location.href = `${prefix}login.html`;
    }
  },

  // Logout current user
  logout() {
    Storage.setCurrentUser(null);
    const path = window.location.pathname;
    const isSubfolder = path.includes('/admin/') || path.includes('/teacher/') || path.includes('/student/');
    const prefix = isSubfolder ? '../' : './';
    window.location.href = `${prefix}login.html`;
  },

  // Guard page for specific roles
  requireRole(allowedRoles = []) {
    const user = this.getUser();
    const path = window.location.pathname;
    const isSubfolder = path.includes('/admin/') || path.includes('/teacher/') || path.includes('/student/');
    const prefix = isSubfolder ? '../' : './';

    if (!user) {
      window.location.href = `${prefix}login.html?redirect=${encodeURIComponent(window.location.pathname)}`;
      return false;
    }

    if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
      // User is logged in but doesn't have permission; redirect to their appropriate home
      this.redirectToDashboard(user.role);
      return false;
    }

    return true;
  },

  // Populate user data in header / sidebar
  renderUserInfo() {
    const user = this.getUser();
    if (!user) return;

    // Display user name
    document.querySelectorAll('.js-user-name').forEach(el => {
      el.textContent = user.name;
    });

    // Display user role / title
    document.querySelectorAll('.js-user-role').forEach(el => {
      el.textContent = user.title || (user.role.charAt(0).toUpperCase() + user.role.slice(1));
    });

    // Display user email
    document.querySelectorAll('.js-user-email').forEach(el => {
      el.textContent = user.email;
    });

    // Display avatar
    document.querySelectorAll('.js-user-avatar').forEach(el => {
      if (el.tagName === 'IMG') {
        el.src = user.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80';
        el.alt = user.name;
      }
    });

    // Display role badge
    document.querySelectorAll('.js-role-badge').forEach(el => {
      el.textContent = user.role.toUpperCase();
      el.className = `role-badge badge-${user.role}`;
    });
  }
};

// Auto-populate user details when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
  // Only render user info if not on login page
  if (!window.location.pathname.endsWith('login.html') && !window.location.pathname.endsWith('index.html')) {
    Auth.renderUserInfo();
  }
});

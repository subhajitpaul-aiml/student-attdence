/**
 * EduTrack - Core UI Framework & Component Controllers
 * Handles sidebars, modals, toast alerts, dropdowns, icons and common utilities.
 */

document.addEventListener('DOMContentLoaded', () => {
  App.init();
});

const App = {
  init() {
    this.initIcons();
    this.initSidebar();
    this.initDropdowns();
    this.highlightActiveNav();
    this.initModals();
    this.applySavedTheme();
    this.initHeaderNotifications();
  },

  // Initialize Lucide icons
  initIcons() {
    if (window.lucide) {
      window.lucide.createIcons();
    }
  },

  // Sidebar mobile toggle & collapse
  initSidebar() {
    const toggleBtn = document.getElementById('sidebarToggleBtn');
    const sidebar = document.getElementById('appSidebar');
    const overlay = document.getElementById('sidebarOverlay');

    if (toggleBtn && sidebar) {
      toggleBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        sidebar.classList.toggle('open');
        if (overlay) overlay.classList.toggle('active');
      });
    }

    if (overlay && sidebar) {
      overlay.addEventListener('click', () => {
        sidebar.classList.remove('open');
        overlay.classList.remove('active');
      });
    }

    // Close on ESC
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && sidebar && sidebar.classList.contains('open')) {
        sidebar.classList.remove('open');
        if (overlay) overlay.classList.remove('active');
      }
    });
  },

  // Profile dropdown & notification popover
  initDropdowns() {
    const userMenuBtn = document.getElementById('userMenuBtn');
    const userDropdown = document.getElementById('userDropdown');
    const notifBtn = document.getElementById('notifMenuBtn');
    const notifDropdown = document.getElementById('notifDropdown');

    // Toggle user dropdown
    if (userMenuBtn && userDropdown) {
      userMenuBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        userDropdown.classList.toggle('show');
        if (notifDropdown) notifDropdown.classList.remove('show');
      });
    }

    // Toggle notification dropdown
    if (notifBtn && notifDropdown) {
      notifBtn.addEventListener('click', (e) => {
        e.stopPropagation();
        notifDropdown.classList.toggle('show');
        if (userDropdown) userDropdown.classList.remove('show');
      });
    }

    // Close dropdowns on outside click
    document.addEventListener('click', (e) => {
      if (userDropdown && !userDropdown.contains(e.target) && userMenuBtn && !userMenuBtn.contains(e.target)) {
        userDropdown.classList.remove('show');
      }
      if (notifDropdown && !notifDropdown.contains(e.target) && notifBtn && !notifBtn.contains(e.target)) {
        notifDropdown.classList.remove('show');
      }
    });
  },

  // Highlight active link in sidebar
  highlightActiveNav() {
    const currentPath = window.location.pathname.toLowerCase();
    const navLinks = document.querySelectorAll('.sidebar-nav .nav-link');

    navLinks.forEach(link => {
      const href = link.getAttribute('href');
      if (!href) return;
      
      const cleanHref = href.split('/').pop().toLowerCase();
      const cleanPath = currentPath.split('/').pop().toLowerCase();

      if (cleanHref === cleanPath || (cleanPath === '' && cleanHref === 'dashboard.html')) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });
  },

  // Generic modal backdrop click and close button listeners
  initModals() {
    document.querySelectorAll('.modal-overlay').forEach(overlay => {
      overlay.addEventListener('click', (e) => {
        if (e.target === overlay) {
          this.closeModal(overlay.id);
        }
      });
    });

    document.querySelectorAll('[data-close-modal]').forEach(btn => {
      btn.addEventListener('click', () => {
        const modalId = btn.getAttribute('data-close-modal');
        if (modalId) {
          this.closeModal(modalId);
        } else {
          const parentModal = btn.closest('.modal-overlay');
          if (parentModal) this.closeModal(parentModal.id);
        }
      });
    });
  },

  openModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.add('active');
      document.body.style.overflow = 'hidden';
      this.initIcons();
    }
  },

  closeModal(modalId) {
    const modal = document.getElementById(modalId);
    if (modal) {
      modal.classList.remove('active');
      document.body.style.overflow = '';
    }
  },

  // Confirmation Dialog
  showConfirmModal({ title, message, confirmText = 'Confirm', cancelText = 'Cancel', confirmVariant = 'primary', onConfirm }) {
    let confirmOverlay = document.getElementById('globalConfirmModal');
    if (!confirmOverlay) {
      confirmOverlay = document.createElement('div');
      confirmOverlay.id = 'globalConfirmModal';
      confirmOverlay.className = 'modal-overlay';
      confirmOverlay.innerHTML = `
        <div class="modal-card modal-sm animate-scale">
          <div class="modal-header">
            <h3 class="modal-title" id="confirmModalTitle"></h3>
            <button class="modal-close-btn" id="confirmModalClose"><i data-lucide="x"></i></button>
          </div>
          <div class="modal-body">
            <p id="confirmModalMessage" class="text-secondary text-sm"></p>
          </div>
          <div class="modal-footer">
            <button class="btn btn-outline" id="confirmModalCancel"></button>
            <button class="btn" id="confirmModalAction"></button>
          </div>
        </div>
      `;
      document.body.appendChild(confirmOverlay);
    }

    const titleEl = document.getElementById('confirmModalTitle');
    const msgEl = document.getElementById('confirmModalMessage');
    const cancelBtn = document.getElementById('confirmModalCancel');
    const actionBtn = document.getElementById('confirmModalAction');
    const closeBtn = document.getElementById('confirmModalClose');

    titleEl.textContent = title;
    msgEl.innerHTML = message;
    cancelBtn.textContent = cancelText;
    actionBtn.textContent = confirmText;
    actionBtn.className = `btn btn-${confirmVariant}`;

    const cleanup = () => {
      confirmOverlay.classList.remove('active');
      document.body.style.overflow = '';
    };

    closeBtn.onclick = cleanup;
    cancelBtn.onclick = cleanup;
    actionBtn.onclick = () => {
      cleanup();
      if (typeof onConfirm === 'function') onConfirm();
    };

    confirmOverlay.classList.add('active');
    document.body.style.overflow = 'hidden';
    this.initIcons();
  },

  // Toast Notification System
  showToast(title, message, type = 'info', duration = 4000) {
    let container = document.getElementById('toastContainer');
    if (!container) {
      container = document.createElement('div');
      container.id = 'toastContainer';
      container.className = 'toast-container';
      document.body.appendChild(container);
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type} animate-slide-in`;

    const iconMap = {
      success: 'check-circle',
      error: 'alert-circle',
      warning: 'alert-triangle',
      info: 'info'
    };

    const iconName = iconMap[type] || 'info';

    toast.innerHTML = `
      <div class="toast-icon">
        <i data-lucide="${iconName}"></i>
      </div>
      <div class="toast-content">
        <div class="toast-title">${title}</div>
        <div class="toast-message">${message}</div>
      </div>
      <button class="toast-close" aria-label="Close">&times;</button>
    `;

    container.appendChild(toast);
    this.initIcons();

    const closeBtn = toast.querySelector('.toast-close');
    const dismiss = () => {
      toast.classList.add('toast-fade-out');
      setTimeout(() => {
        if (toast.parentNode) toast.parentNode.removeChild(toast);
      }, 300);
    };

    closeBtn.addEventListener('click', dismiss);
    if (duration > 0) {
      setTimeout(dismiss, duration);
    }
  },

  // Apply Theme from Storage
  applySavedTheme() {
    const settings = Storage.getSettings();
    if (settings && settings.theme === 'dark') {
      document.documentElement.classList.add('theme-dark');
    } else {
      document.documentElement.classList.remove('theme-dark');
    }
  },

  // Render recent notifications in header dropdown
  initHeaderNotifications() {
    const container = document.getElementById('headerNotifList');
    const badge = document.getElementById('headerNotifBadge');
    if (!container) return;

    const notifs = Storage.getNotifications().slice(0, 5);
    if (badge) {
      badge.textContent = notifs.length;
      badge.style.display = notifs.length > 0 ? 'inline-flex' : 'none';
    }

    if (notifs.length === 0) {
      container.innerHTML = `
        <div class="empty-state p-4 text-center text-muted">
          <i data-lucide="bell-off" class="mx-auto mb-2 opacity-50"></i>
          <p class="text-xs">No recent notifications</p>
        </div>
      `;
      this.initIcons();
      return;
    }

    container.innerHTML = notifs.map(n => `
      <div class="notif-item ${n.status === 'Failed' ? 'notif-failed' : ''}">
        <div class="notif-badge-icon ${n.channel.toLowerCase()}">
          <i data-lucide="${n.channel === 'WhatsApp' ? 'message-circle' : 'smartphone'}"></i>
        </div>
        <div class="notif-content">
          <div class="notif-header">
            <span class="notif-target">${n.studentName} (${n.recipientType})</span>
            <span class="badge badge-${n.status.toLowerCase()}">${n.status}</span>
          </div>
          <p class="notif-text text-truncate">${n.content || 'Simulated Absent Alert'}</p>
          <span class="notif-time">${n.date}</span>
        </div>
      </div>
    `).join('');

    this.initIcons();
  },

  // CSV Exporter Utility
  downloadCSV(filename, headers, rows) {
    const csvContent = [
      headers.join(','),
      ...rows.map(row => 
        row.map(field => {
          const str = String(field ?? '').replace(/"/g, '""');
          return `"${str}"`;
        }).join(',')
      )
    ].join('\r\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }
};

// Global helper for showing quick toast
window.showToast = (title, msg, type) => App.showToast(title, msg, type);
window.openModal = (id) => App.openModal(id);
window.closeModal = (id) => App.closeModal(id);
window.showConfirm = (opts) => App.showConfirmModal(opts);

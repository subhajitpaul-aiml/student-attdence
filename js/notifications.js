/**
 * EduTrack - Notification Simulation & History Controller
 * Handles notification logs, SMS/WhatsApp previews, retry simulations, filtering, and CSV export.
 */

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('notificationsTableBody')) {
    NotificationsController.init();
  }
});

const NotificationsController = {
  notifications: [],
  filters: {
    channel: 'all',
    status: 'all',
    class: 'all',
    date: '',
    search: ''
  },
  activePreviewNotif: null,

  init() {
    this.loadData();
    this.populateClassFilter();
    this.bindEvents();
    this.updateStatsCards();
    this.render();
  },

  loadData() {
    this.notifications = Storage.getNotifications();
  },

  populateClassFilter() {
    const classFilter = document.getElementById('notifClassFilter');
    if (!classFilter) return;

    const classes = Storage.getClasses();
    const uniqueClassNames = [...new Set(classes.map(c => c.name))];
    classFilter.innerHTML = '<option value="all">All Classes</option>' +
      uniqueClassNames.map(c => `<option value="${c}">${c}</option>`).join('');
  },

  bindEvents() {
    // Channel filter tabs/buttons
    document.querySelectorAll('.js-channel-filter').forEach(btn => {
      btn.addEventListener('click', (e) => {
        document.querySelectorAll('.js-channel-filter').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');
        this.filters.channel = btn.getAttribute('data-channel');
        this.render();
      });
    });

    // Status filter dropdown
    const statusSelect = document.getElementById('notifStatusFilter');
    if (statusSelect) {
      statusSelect.addEventListener('change', (e) => {
        this.filters.status = e.target.value;
        this.render();
      });
    }

    // Class filter dropdown
    const classSelect = document.getElementById('notifClassFilter');
    if (classSelect) {
      classSelect.addEventListener('change', (e) => {
        this.filters.class = e.target.value;
        this.render();
      });
    }

    // Date filter
    const dateInput = document.getElementById('notifDateFilter');
    if (dateInput) {
      dateInput.addEventListener('change', (e) => {
        this.filters.date = e.target.value;
        this.render();
      });
    }

    // Search query
    const searchInput = document.getElementById('notifSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.filters.search = e.target.value.toLowerCase();
        this.render();
      });
    }

    // Reset filters
    const resetBtn = document.getElementById('notifResetFilterBtn');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        this.resetFilters();
      });
    }

    // Export CSV
    const exportBtn = document.getElementById('notifExportCSVBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportCSV();
      });
    }

    // Test Alert Button
    const testAlertBtn = document.getElementById('triggerTestAlertBtn');
    if (testAlertBtn) {
      testAlertBtn.addEventListener('click', () => {
        App.openModal('testAlertModal');
      });
    }

    // Test Alert Form Submit
    const testAlertForm = document.getElementById('testAlertForm');
    if (testAlertForm) {
      testAlertForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleTestAlertSubmit();
      });
    }
  },

  resetFilters() {
    this.filters = {
      channel: 'all',
      status: 'all',
      class: 'all',
      date: '',
      search: ''
    };

    const searchInput = document.getElementById('notifSearchInput');
    if (searchInput) searchInput.value = '';

    const dateInput = document.getElementById('notifDateFilter');
    if (dateInput) dateInput.value = '';

    const statusSelect = document.getElementById('notifStatusFilter');
    if (statusSelect) statusSelect.value = 'all';

    const classSelect = document.getElementById('notifClassFilter');
    if (classSelect) classSelect.value = 'all';

    document.querySelectorAll('.js-channel-filter').forEach(b => {
      b.classList.toggle('active', b.getAttribute('data-channel') === 'all');
    });

    this.render();
    App.showToast('Filters Cleared', 'Displaying all notifications.', 'info');
  },

  getFilteredNotifications() {
    return this.notifications.filter(item => {
      const matchChannel = this.filters.channel === 'all' || item.channel.toLowerCase() === this.filters.channel.toLowerCase();
      const matchStatus = this.filters.status === 'all' || item.status.toLowerCase() === this.filters.status.toLowerCase();
      const matchClass = this.filters.class === 'all' || item.class === this.filters.class;
      const matchDate = !this.filters.date || item.date.startsWith(this.filters.date);
      const matchSearch = !this.filters.search || 
        item.studentName.toLowerCase().includes(this.filters.search) ||
        item.phone.toLowerCase().includes(this.filters.search) ||
        (item.recipientName && item.recipientName.toLowerCase().includes(this.filters.search));

      return matchChannel && matchStatus && matchClass && matchDate && matchSearch;
    });
  },

  updateStatsCards() {
    const total = this.notifications.length;
    const delivered = this.notifications.filter(n => n.status === 'Delivered').length;
    const pending = this.notifications.filter(n => n.status === 'Pending' || n.status === 'Sending').length;
    const failed = this.notifications.filter(n => n.status === 'Failed').length;
    const deliveredRate = total > 0 ? ((delivered / total) * 100).toFixed(1) : 0;

    const totalEl = document.getElementById('statNotifTotal');
    const rateEl = document.getElementById('statNotifRate');
    const pendingEl = document.getElementById('statNotifPending');
    const failedEl = document.getElementById('statNotifFailed');

    if (totalEl) totalEl.textContent = total;
    if (rateEl) rateEl.textContent = `${deliveredRate}%`;
    if (pendingEl) pendingEl.textContent = pending;
    if (failedEl) failedEl.textContent = failed;
  },

  render() {
    const tbody = document.getElementById('notificationsTableBody');
    const countEl = document.getElementById('notifCountDisplay');
    if (!tbody) return;

    const filtered = this.getFilteredNotifications();

    if (countEl) {
      countEl.textContent = `Showing ${filtered.length} of ${this.notifications.length} simulated notifications`;
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-5 text-muted">
            <div style="padding: 2.5rem 1rem;">
              <i data-lucide="inbox" style="width: 40px; height: 40px; margin: 0 auto 0.75rem auto; opacity: 0.4;"></i>
              <p class="font-semibold text-base">No notifications match your filters</p>
              <p class="text-xs text-muted">Try selecting "All" channels or clearing your search term.</p>
            </div>
          </td>
        </tr>
      `;
      App.initIcons();
      return;
    }

    tbody.innerHTML = filtered.map(notif => `
      <tr>
        <td>
          <div class="user-cell">
            <div class="user-avatar" style="background:#e0e7ff; color:#3730a3; display:flex; align-items:center; justify-content:center; font-weight:700;">
              ${notif.studentName.charAt(0)}
            </div>
            <div>
              <span class="user-info-name">${notif.studentName}</span>
              <span class="user-info-sub">${notif.class || 'Grade 10'}-${notif.section || 'A'}</span>
            </div>
          </div>
        </td>
        <td>
          <span class="badge" style="background:#f1f5f9; color:#1e293b; border:1px solid #e2e8f0;">
            ${notif.recipientType}: ${notif.recipientName || notif.studentName}
          </span>
        </td>
        <td>
          <span class="font-mono text-xs font-semibold text-slate-700">${notif.phone}</span>
        </td>
        <td>
          <span class="badge ${notif.channel === 'WhatsApp' ? 'badge-channel-whatsapp' : 'badge-channel-sms'}">
            <i data-lucide="${notif.channel === 'WhatsApp' ? 'message-circle' : 'smartphone'}" style="width:13px;height:13px;"></i>
            ${notif.channel}
          </span>
        </td>
        <td>
          <span class="badge badge-${notif.status.toLowerCase()}">
            <span class="badge-dot"></span> ${notif.status}
          </span>
        </td>
        <td>
          <span class="text-xs text-slate-500">${notif.date}</span>
        </td>
        <td>
          <div class="table-actions">
            <button class="btn btn-outline btn-icon-sm" title="View Message Preview" onclick="NotificationsController.viewPreview('${notif.id}')">
              <i data-lucide="eye"></i>
            </button>
            ${(notif.status === 'Failed' || notif.status === 'Pending') ? `
              <button class="btn btn-outline btn-icon-sm" title="Retry Simulation" onclick="NotificationsController.retrySimulation('${notif.id}')" style="color:var(--primary);">
                <i data-lucide="rotate-cw"></i>
              </button>
            ` : ''}
          </div>
        </td>
      </tr>
    `).join('');

    App.initIcons();
  },

  viewPreview(id) {
    const notif = this.notifications.find(n => n.id === id);
    if (!notif) return;
    this.activePreviewNotif = notif;

    const modalTitle = document.getElementById('notifDetailModalTitle');
    if (modalTitle) {
      modalTitle.textContent = `${notif.channel} Simulation Preview - ${notif.studentName}`;
    }

    // Populate WhatsApp Preview Elements
    document.getElementById('modalWaStudentName').textContent = notif.studentName;
    document.getElementById('modalWaStudentId').textContent = notif.studentId || 'STU-1001';
    document.getElementById('modalWaClass').textContent = notif.class || 'Grade 10';
    document.getElementById('modalWaSection').textContent = notif.section || 'A';
    document.getElementById('modalWaDate').textContent = notif.date;
    document.getElementById('modalWaRecipient').textContent = `${notif.recipientName || notif.studentName} (${notif.phone})`;
    document.getElementById('modalWaStatusBadge').textContent = notif.status;
    document.getElementById('modalWaStatusBadge').className = `badge badge-${notif.status.toLowerCase()}`;

    // Populate SMS Preview Elements
    document.getElementById('modalSmsStudentName').textContent = notif.studentName;
    document.getElementById('modalSmsClass').textContent = notif.class || 'Grade 10';
    document.getElementById('modalSmsSection').textContent = notif.section || 'A';
    document.getElementById('modalSmsDate').textContent = notif.date;
    document.getElementById('modalSmsRecipient').textContent = `${notif.recipientName || notif.studentName} (${notif.phone})`;
    document.getElementById('modalSmsContent').textContent = notif.content || `EduTrack Alert: ${notif.studentName} was marked ABSENT. Please contact the institution.`;

    // Switch to tab matching the notification's channel
    this.switchDetailTab(notif.channel.toLowerCase() === 'whatsapp' ? 'whatsapp' : 'sms');
    App.openModal('notifDetailModal');
  },

  switchDetailTab(channel) {
    const tabSMS = document.getElementById('detailTabSMS');
    const tabWA = document.getElementById('detailTabWA');
    const contentSMS = document.getElementById('detailContentSMS');
    const contentWA = document.getElementById('detailContentWA');

    if (channel === 'sms') {
      if (tabSMS) tabSMS.classList.add('active');
      if (tabWA) tabWA.classList.remove('active');
      if (contentSMS) contentSMS.classList.add('active');
      if (contentWA) contentWA.classList.remove('active');
    } else {
      if (tabSMS) tabSMS.classList.remove('active');
      if (tabWA) tabWA.classList.add('active');
      if (contentSMS) contentSMS.classList.remove('active');
      if (contentWA) contentWA.classList.add('active');
    }
  },

  retrySimulation(id) {
    const notif = this.notifications.find(n => n.id === id);
    if (!notif) return;

    // Transition state from Failed -> Sending -> Delivered
    Storage.updateNotificationStatus(id, 'Sending');
    this.loadData();
    this.render();
    this.updateStatsCards();
    App.showToast('Simulating Dispatch', `Sending ${notif.channel} alert to ${notif.phone}...`, 'info');

    setTimeout(() => {
      Storage.updateNotificationStatus(id, 'Delivered');
      this.loadData();
      this.render();
      this.updateStatsCards();
      App.showToast('Simulation Delivered', `${notif.channel} alert marked as Delivered.`, 'success');
    }, 1200);
  },

  handleTestAlertSubmit() {
    const studentName = document.getElementById('testAlertStudentName').value.trim();
    const phone = document.getElementById('testAlertPhone').value.trim();
    const channel = document.getElementById('testAlertChannel').value;
    const recipientType = document.getElementById('testAlertRecipient').value;
    const className = document.getElementById('testAlertClass').value;
    const section = document.getElementById('testAlertSection').value;

    if (!studentName || !phone) {
      App.showToast('Error', 'Please provide student name and phone number.', 'warning');
      return;
    }

    const todayStr = new Date().toISOString().slice(0, 10);
    const nowStr = `${todayStr} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

    const newNotif = {
      studentId: 'STU-TEST',
      studentName,
      recipientType,
      recipientName: recipientType === 'Parent' ? `Parent of ${studentName}` : studentName,
      phone,
      channel,
      status: 'Sending',
      date: nowStr,
      class: className,
      section,
      messageType: 'Absent Alert',
      content: `EduTrack DEMO Alert: ${studentName} was marked ABSENT today (${todayStr}) in ${className}-${section}. Please contact the institution.`
    };

    Storage.addNotification(newNotif);
    this.loadData();
    this.updateStatsCards();
    this.render();
    App.closeModal('testAlertModal');
    App.showToast('Test Queued', `Simulating ${channel} alert dispatch...`, 'info');

    // Simulate automatic delivery transition
    setTimeout(() => {
      Storage.updateNotificationStatus(newNotif.id, 'Delivered');
      this.loadData();
      this.updateStatsCards();
      this.render();
      App.showToast('Test Delivered', `Simulated ${channel} message delivered to ${phone}.`, 'success');
    }, 1500);
  },

  exportCSV() {
    const filtered = this.getFilteredNotifications();
    const headers = ['Notification ID', 'Student Name', 'Recipient Type', 'Recipient Name', 'Phone Number', 'Channel', 'Status', 'Date', 'Simulated Content'];
    const rows = filtered.map(n => [
      n.id,
      n.studentName,
      n.recipientType,
      n.recipientName || '',
      n.phone,
      n.channel,
      n.status,
      n.date,
      n.content || ''
    ]);

    App.downloadCSV(`EduTrack_Notifications_Log_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    App.showToast('Export Successful', 'Notification logs downloaded to CSV.', 'success');
  }
};

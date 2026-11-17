/**
 * EduTrack - Interactive Attendance Management Controller
 * Handles marking Present/Absent/Late, instant absent alert preview,
 * duplicate check, confirmation modal, and automatic simulated notifications dispatch.
 */

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('attendanceTableBody')) {
    AttendanceController.init();
  }
});

const AttendanceController = {
  currentClass: 'Grade 10',
  currentSection: 'A',
  currentDate: new Date().toISOString().slice(0, 10),
  students: [],
  attendanceState: {}, // studentId -> 'present' | 'absent' | 'late'
  recentAbsentStudent: null,

  init() {
    this.initDefaultDate();
    this.populateSelectors();
    this.bindEvents();
    this.loadStudentsAndState();
  },

  initDefaultDate() {
    const dateInput = document.getElementById('attendanceDatePicker');
    if (dateInput) {
      dateInput.value = this.currentDate;
    }
  },

  populateSelectors() {
    const classSelect = document.getElementById('attendanceClassSelect');
    const sectionSelect = document.getElementById('attendanceSectionSelect');
    const classes = Storage.getClasses();

    if (classSelect) {
      const uniqueClasses = [...new Set(classes.map(c => c.name))];
      classSelect.innerHTML = uniqueClasses.map(c => 
        `<option value="${c}" ${c === this.currentClass ? 'selected' : ''}>${c}</option>`
      ).join('');
    }

    if (sectionSelect) {
      sectionSelect.innerHTML = `
        <option value="A" ${this.currentSection === 'A' ? 'selected' : ''}>Section A</option>
        <option value="B" ${this.currentSection === 'B' ? 'selected' : ''}>Section B</option>
      `;
    }
  },

  bindEvents() {
    const classSelect = document.getElementById('attendanceClassSelect');
    const sectionSelect = document.getElementById('attendanceSectionSelect');
    const dateInput = document.getElementById('attendanceDatePicker');

    if (classSelect) {
      classSelect.addEventListener('change', (e) => {
        this.currentClass = e.target.value;
        this.loadStudentsAndState();
      });
    }

    if (sectionSelect) {
      sectionSelect.addEventListener('change', (e) => {
        this.currentSection = e.target.value;
        this.loadStudentsAndState();
      });
    }

    if (dateInput) {
      dateInput.addEventListener('change', (e) => {
        this.currentDate = e.target.value;
        this.loadStudentsAndState();
      });
    }

    // Mark all present
    const markAllPresentBtn = document.getElementById('markAllPresentBtn');
    if (markAllPresentBtn) {
      markAllPresentBtn.addEventListener('click', () => {
        this.markAll('present');
      });
    }

    // Reset attendance
    const resetAttendanceBtn = document.getElementById('resetAttendanceBtn');
    if (resetAttendanceBtn) {
      resetAttendanceBtn.addEventListener('click', () => {
        this.resetAll();
      });
    }

    // Search students
    const searchInput = document.getElementById('attendanceSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.renderTable(e.target.value.toLowerCase());
      });
    }

    // Save Attendance Button
    const saveBtn = document.getElementById('saveAttendanceBtn');
    if (saveBtn) {
      saveBtn.addEventListener('click', () => {
        this.initiateSaveAttendance();
      });
    }

    // Preview notification modal button in instant alert
    const previewAlertBtn = document.getElementById('instantPreviewBtn');
    if (previewAlertBtn) {
      previewAlertBtn.addEventListener('click', () => {
        if (this.recentAbsentStudent) {
          this.openNotificationPreviewModal(this.recentAbsentStudent);
        }
      });
    }

    // Tab switching in preview modal
    const tabSMS = document.getElementById('tabBtnSMS');
    const tabWA = document.getElementById('tabBtnWA');
    if (tabSMS && tabWA) {
      tabSMS.addEventListener('click', () => this.switchPreviewTab('sms'));
      tabWA.addEventListener('click', () => this.switchPreviewTab('whatsapp'));
    }
  },

  loadStudentsAndState() {
    // Get all students for selected class and section
    const allStudents = Storage.getStudents();
    this.students = allStudents.filter(s => s.class === this.currentClass && s.section === this.currentSection);

    // Check if attendance already recorded for this date
    const existingRecords = Storage.getAttendance({
      class: this.currentClass,
      section: this.currentSection,
      date: this.currentDate
    });

    this.attendanceState = {};

    if (existingRecords.length > 0) {
      // Pre-fill existing state
      existingRecords.forEach(rec => {
        this.attendanceState[rec.studentId] = rec.status;
      });
      App.showToast('Existing Records Loaded', `Attendance for ${this.currentDate} was previously saved.`, 'info');
    } else {
      // Default all to 'present' for easy workflow
      this.students.forEach(s => {
        this.attendanceState[s.id] = 'present';
      });
    }

    this.renderTable();
    this.updateSummaryCounters();
  },

  setStatus(studentId, status) {
    this.attendanceState[studentId] = status;
    const student = this.students.find(s => s.id === studentId);

    if (status === 'absent' && student) {
      this.recentAbsentStudent = student;
      this.showInstantAbsentAlert(student);
    }

    this.updateStudentRowUI(studentId, status);
    this.updateSummaryCounters();
  },

  markAll(status) {
    this.students.forEach(s => {
      this.attendanceState[s.id] = status;
    });
    this.renderTable();
    this.updateSummaryCounters();
    App.showToast('Updated', `All students marked as ${status.toUpperCase()}.`, 'info');
  },

  resetAll() {
    this.students.forEach(s => {
      delete this.attendanceState[s.id];
    });
    this.renderTable();
    this.updateSummaryCounters();
    this.hideInstantAbsentAlert();
    App.showToast('Reset', 'Attendance marking has been reset.', 'info');
  },

  showInstantAbsentAlert(student) {
    const alertBox = document.getElementById('instantAbsentAlert');
    const nameEl = document.getElementById('instantAbsentStudentName');
    const parentPhoneEl = document.getElementById('instantAbsentParentPhone');

    if (alertBox) {
      if (nameEl) nameEl.textContent = student.name;
      if (parentPhoneEl) parentPhoneEl.textContent = student.parentPhone;
      alertBox.classList.add('active');
    }
  },

  hideInstantAbsentAlert() {
    const alertBox = document.getElementById('instantAbsentAlert');
    if (alertBox) alertBox.classList.remove('active');
  },

  renderTable(filterQuery = '') {
    const tbody = document.getElementById('attendanceTableBody');
    if (!tbody) return;

    let list = this.students;
    if (filterQuery) {
      list = list.filter(s => 
        s.name.toLowerCase().includes(filterQuery) ||
        s.id.toLowerCase().includes(filterQuery) ||
        (s.phone && s.phone.includes(filterQuery))
      );
    }

    if (list.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-5 text-muted">
            <div style="padding: 2.5rem 1rem;">
              <i data-lucide="users" style="width: 36px; height: 36px; margin: 0 auto 0.5rem auto; opacity: 0.4;"></i>
              <p class="font-semibold">No students in ${this.currentClass} - ${this.currentSection}</p>
            </div>
          </td>
        </tr>
      `;
      App.initIcons();
      return;
    }

    tbody.innerHTML = list.map(student => {
      const status = this.attendanceState[student.id] || 'present';
      return `
        <tr id="row-${student.id}">
          <td>
            <span class="font-mono text-xs font-semibold text-slate-500">${student.id}</span>
          </td>
          <td>
            <div class="user-cell">
              <img class="user-avatar" src="${student.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}" alt="${student.name}">
              <div>
                <span class="user-info-name">${student.name}</span>
                <span class="user-info-sub">Parent: ${student.parentName}</span>
              </div>
            </div>
          </td>
          <td>
            <span class="text-sm font-semibold text-slate-700">${student.class} - ${student.section}</span>
          </td>
          <td>
            <span class="text-sm text-slate-600">${student.phone || student.parentPhone}</span>
          </td>
          <td>
            <span id="badge-${student.id}" class="badge badge-${status}">
              <span class="badge-dot"></span> ${status}
            </span>
          </td>
          <td>
            <div class="status-btn-group" role="group">
              <button type="button" class="status-btn btn-p ${status === 'present' ? 'active' : ''}" 
                onclick="AttendanceController.setStatus('${student.id}', 'present')" title="Present">
                <i data-lucide="check"></i> P
              </button>
              <button type="button" class="status-btn btn-a ${status === 'absent' ? 'active' : ''}" 
                onclick="AttendanceController.setStatus('${student.id}', 'absent')" title="Absent">
                <i data-lucide="x"></i> A
              </button>
              <button type="button" class="status-btn btn-l ${status === 'late' ? 'active' : ''}" 
                onclick="AttendanceController.setStatus('${student.id}', 'late')" title="Late">
                <i data-lucide="clock"></i> L
              </button>
            </div>
          </td>
        </tr>
      `;
    }).join('');

    App.initIcons();
  },

  updateStudentRowUI(studentId, status) {
    const badge = document.getElementById(`badge-${studentId}`);
    if (badge) {
      badge.className = `badge badge-${status}`;
      badge.innerHTML = `<span class="badge-dot"></span> ${status}`;
    }

    const row = document.getElementById(`row-${studentId}`);
    if (row) {
      const btnP = row.querySelector('.btn-p');
      const btnA = row.querySelector('.btn-a');
      const btnL = row.querySelector('.btn-l');

      if (btnP) btnP.classList.toggle('active', status === 'present');
      if (btnA) btnA.classList.toggle('active', status === 'absent');
      if (btnL) btnL.classList.toggle('active', status === 'late');
    }
  },

  updateSummaryCounters() {
    const total = this.students.length;
    let present = 0;
    let absent = 0;
    let late = 0;

    this.students.forEach(s => {
      const st = this.attendanceState[s.id];
      if (st === 'present') present++;
      else if (st === 'absent') absent++;
      else if (st === 'late') late++;
    });

    const totalEl = document.getElementById('countTotalStudents');
    const presentEl = document.getElementById('countPresentStudents');
    const absentEl = document.getElementById('countAbsentStudents');
    const lateEl = document.getElementById('countLateStudents');

    if (totalEl) totalEl.textContent = total;
    if (presentEl) presentEl.textContent = present;
    if (absentEl) absentEl.textContent = absent;
    if (lateEl) lateEl.textContent = late;
  },

  // Save Attendance & generate notifications
  initiateSaveAttendance() {
    const total = this.students.length;
    if (total === 0) {
      App.showToast('No Students', 'Please select a class with enrolled students.', 'warning');
      return;
    }

    let present = 0;
    let absent = 0;
    let late = 0;
    const absentStudents = [];

    this.students.forEach(s => {
      const st = this.attendanceState[s.id] || 'present';
      if (st === 'present') present++;
      else if (st === 'absent') {
        absent++;
        absentStudents.push(s);
      } else if (st === 'late') late++;
    });

    const isExisting = Storage.checkAttendanceExists(this.currentClass, this.currentSection, this.currentDate);

    // Show Confirmation Modal
    App.showConfirmModal({
      title: isExisting ? 'Update Attendance Confirmation' : 'Confirm & Save Attendance',
      message: `
        <div style="margin-bottom: 0.75rem;">
          <p class="font-medium text-slate-800">
            Attendance for <strong>${this.currentClass} - ${this.currentSection}</strong> on <strong>${this.currentDate}</strong>:
          </p>
        </div>
        <div style="background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 0.75rem 1rem; margin-bottom: 0.75rem;">
          <div style="display:flex; justify-content:space-between; margin-bottom: 4px;">
            <span class="text-slate-600 font-semibold">Total Students:</span>
            <span class="font-bold">${total}</span>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom: 4px; color: #059669;">
            <span>Present:</span>
            <span class="font-bold">${present}</span>
          </div>
          <div style="display:flex; justify-content:space-between; margin-bottom: 4px; color: #dc2626;">
            <span>Absent:</span>
            <span class="font-bold">${absent}</span>
          </div>
          <div style="display:flex; justify-content:space-between; color: #d97706;">
            <span>Late:</span>
            <span class="font-bold">${late}</span>
          </div>
        </div>
        ${absent > 0 ? `
          <div class="demo-banner" style="margin-bottom:0;">
            <i data-lucide="bell" class="demo-banner-icon"></i>
            <div class="demo-banner-text">
              <strong>Simulated Alert Trigger:</strong> Saving will automatically generate SMS & WhatsApp demonstration alerts for <strong>${absent} absent student(s)</strong> and their parents.
            </div>
          </div>
        ` : ''}
      `,
      confirmText: isExisting ? 'Update Attendance' : 'Save Attendance',
      confirmVariant: 'primary',
      onConfirm: () => {
        this.commitAttendanceRecords(absentStudents);
      }
    });
  },

  commitAttendanceRecords(absentStudents) {
    const user = Auth.getUser() || { name: 'Teacher', teacherId: 'TCH-101' };
    const records = this.students.map(s => ({
      id: `att-${s.id}-${this.currentDate}`,
      studentId: s.id,
      studentName: s.name,
      class: s.class,
      section: s.section,
      date: this.currentDate,
      status: this.attendanceState[s.id] || 'present',
      recordedBy: `${user.name} (${user.teacherId || user.role})`,
      recordedAt: new Date().toISOString(),
      remarks: (this.attendanceState[s.id] === 'absent') ? 'Simulated Absence Recorded' : 'Regular'
    }));

    Storage.saveAttendanceBatch(records);

    // Generate Automatic Simulated Notifications for Absent Students
    const settings = Storage.getSettings();
    let notifsCount = 0;

    absentStudents.forEach(student => {
      const nowStr = `${this.currentDate} ${new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;

      // 1. Parent WhatsApp (if consent & phone exists & setting enabled)
      if (settings.whatsAppEnabled && settings.notifyParents && student.consentWhatsApp && student.parentWhatsApp) {
        Storage.addNotification({
          studentId: student.id,
          studentName: student.name,
          recipientType: 'Parent',
          recipientName: student.parentName,
          phone: student.parentWhatsApp,
          channel: 'WhatsApp',
          status: 'Delivered',
          date: nowStr,
          class: student.class,
          section: student.section,
          messageType: 'Absent Alert',
          content: `Dear Parent, your child ${student.name} has been marked ABSENT today (${this.currentDate}) in ${student.class}-${student.section}. Please contact EduTrack Institution.`
        });
        notifsCount++;
      }

      // 2. Parent SMS (if consent & phone exists & setting enabled)
      if (settings.smsEnabled && settings.notifyParents && student.consentSMS && student.parentPhone) {
        Storage.addNotification({
          studentId: student.id,
          studentName: student.name,
          recipientType: 'Parent',
          recipientName: student.parentName,
          phone: student.parentPhone,
          channel: 'SMS',
          status: 'Delivered',
          date: nowStr,
          class: student.class,
          section: student.section,
          messageType: 'Absent Alert',
          content: `EduTrack Alert: ${student.name} was marked ABSENT today on ${this.currentDate}. Contact the institution office for queries.`
        });
        notifsCount++;
      }

      // 3. Student WhatsApp (if student phone & consent)
      if (settings.whatsAppEnabled && settings.notifyStudents && student.consentWhatsApp && student.phone) {
        Storage.addNotification({
          studentId: student.id,
          studentName: student.name,
          recipientType: 'Student',
          recipientName: student.name,
          phone: student.phone,
          channel: 'WhatsApp',
          status: 'Sent',
          date: nowStr,
          class: student.class,
          section: student.section,
          messageType: 'Absent Alert',
          content: `Hello ${student.name}, you have been marked ABSENT for ${this.currentDate} in ${student.class}-${student.section}.`
        });
        notifsCount++;
      }

      // 4. Student SMS (if student phone & consent)
      if (settings.smsEnabled && settings.notifyStudents && student.consentSMS && student.phone) {
        Storage.addNotification({
          studentId: student.id,
          studentName: student.name,
          recipientType: 'Student',
          recipientName: student.name,
          phone: student.phone,
          channel: 'SMS',
          status: 'Sent',
          date: nowStr,
          class: student.class,
          section: student.section,
          messageType: 'Absent Alert',
          content: `EduTrack Student Notice: You are marked ABSENT for today ${this.currentDate}.`
        });
        notifsCount++;
      }
    });

    // Update header notifications count if present
    App.initHeaderNotifications();

    // Show celebratory toast
    App.showToast(
      'Attendance Saved Successfully',
      `Saved records for ${this.students.length} students.${notifsCount > 0 ? ` ${notifsCount} simulated alerts prepared.` : ''}`,
      'success'
    );
  },

  // Notification Preview Modal
  openNotificationPreviewModal(student) {
    if (!student) return;

    // Fill SMS preview fields
    document.getElementById('previewSmsStudentName').textContent = student.name;
    document.getElementById('previewSmsClass').textContent = student.class;
    document.getElementById('previewSmsSection').textContent = student.section;
    document.getElementById('previewSmsDate').textContent = this.currentDate;
    document.getElementById('previewSmsRecipient').textContent = `${student.parentName} (${student.parentPhone})`;

    // Fill WhatsApp preview fields
    document.getElementById('previewWaStudentName').textContent = student.name;
    document.getElementById('previewWaStudentId').textContent = student.id;
    document.getElementById('previewWaClass').textContent = student.class;
    document.getElementById('previewWaSection').textContent = student.section;
    document.getElementById('previewWaDate').textContent = this.currentDate;
    document.getElementById('previewWaRecipient').textContent = `${student.parentName} (${student.parentWhatsApp || student.parentPhone})`;

    this.switchPreviewTab('sms');
    App.openModal('notificationPreviewModal');
  },

  switchPreviewTab(channel) {
    const tabSMS = document.getElementById('tabBtnSMS');
    const tabWA = document.getElementById('tabBtnWA');
    const contentSMS = document.getElementById('previewContentSMS');
    const contentWA = document.getElementById('previewContentWA');

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
  }
};

/**
 * EduTrack - Student Management Controller
 * Handles student listing, filtering, search, add/edit/delete, and profile view.
 */

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('studentsTableBody')) {
    StudentsController.init();
  }
});

const StudentsController = {
  students: [],
  currentFilterClass: 'all',
  currentFilterSection: 'all',
  searchQuery: '',
  editingStudentId: null,

  init() {
    this.loadData();
    this.populateClassDropdowns();
    this.bindEvents();
    this.render();
  },

  loadData() {
    this.students = Storage.getStudents();
  },

  populateClassDropdowns() {
    const classes = Storage.getClasses();
    const classFilter = document.getElementById('studentClassFilter');
    const formClass = document.getElementById('studentFormClass');

    // Extract unique class names
    const uniqueClassNames = [...new Set(classes.map(c => c.name))];

    if (classFilter) {
      classFilter.innerHTML = '<option value="all">All Classes</option>' +
        uniqueClassNames.map(c => `<option value="${c}">${c}</option>`).join('');
    }

    if (formClass) {
      formClass.innerHTML = '<option value="">Select Class</option>' +
        uniqueClassNames.map(c => `<option value="${c}">${c}</option>`).join('');
    }
  },

  bindEvents() {
    // Search input
    const searchInput = document.getElementById('studentSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.render();
      });
    }

    // Class filter
    const classFilter = document.getElementById('studentClassFilter');
    if (classFilter) {
      classFilter.addEventListener('change', (e) => {
        this.currentFilterClass = e.target.value;
        this.render();
      });
    }

    // Add Student Button
    const addBtn = document.getElementById('addStudentBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        this.openStudentForm();
      });
    }

    // Student Form Submit
    const studentForm = document.getElementById('studentForm');
    if (studentForm) {
      studentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleFormSubmit();
      });
    }

    // Export CSV
    const exportBtn = document.getElementById('exportStudentsBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportCSV();
      });
    }
  },

  getFilteredStudents() {
    return this.students.filter(student => {
      const matchClass = this.currentFilterClass === 'all' || student.class === this.currentFilterClass;
      const matchSearch = !this.searchQuery || 
        student.name.toLowerCase().includes(this.searchQuery) ||
        student.id.toLowerCase().includes(this.searchQuery) ||
        (student.email && student.email.toLowerCase().includes(this.searchQuery)) ||
        (student.parentName && student.parentName.toLowerCase().includes(this.searchQuery));

      return matchClass && matchSearch;
    });
  },

  render() {
    const tbody = document.getElementById('studentsTableBody');
    const countEl = document.getElementById('studentCountDisplay');
    if (!tbody) return;

    const filtered = this.getFilteredStudents();

    if (countEl) {
      countEl.textContent = `Showing ${filtered.length} of ${this.students.length} students`;
    }

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="7" class="text-center py-5 text-muted">
            <div style="padding: 2.5rem 1rem;">
              <i data-lucide="users" style="width: 40px; height: 40px; margin: 0 auto 0.75rem auto; opacity: 0.4;"></i>
              <p class="font-semibold text-base">No students found</p>
              <p class="text-xs text-muted">Try adjusting your filters or search keywords.</p>
            </div>
          </td>
        </tr>
      `;
      App.initIcons();
      return;
    }

    tbody.innerHTML = filtered.map(student => `
      <tr>
        <td>
          <span class="font-mono text-xs font-semibold text-slate-500">${student.id}</span>
        </td>
        <td>
          <div class="user-cell">
            <img class="user-avatar" src="${student.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}" alt="${student.name}" onerror="this.src='https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'">
            <div>
              <span class="user-info-name">${student.name}</span>
              <span class="user-info-sub">${student.email}</span>
            </div>
          </div>
        </td>
        <td>
          <span class="badge" style="background:#f1f5f9; color:#1e293b; border:1px solid #cbd5e1;">${student.class} - ${student.section}</span>
        </td>
        <td>
          <span class="text-sm font-medium">${student.phone || '<em class="text-muted">Not provided</em>'}</span>
        </td>
        <td>
          <div>
            <span class="font-medium text-sm text-slate-900">${student.parentName}</span>
            <span class="text-xs text-muted d-block">${student.parentPhone}</span>
          </div>
        </td>
        <td>
          <div style="display:flex; gap:4px;">
            <span class="badge ${student.consentSMS ? 'badge-channel-sms' : 'badge-pending'}" title="SMS Consent">
              <i data-lucide="smartphone" style="width:12px;height:12px;"></i> SMS
            </span>
            <span class="badge ${student.consentWhatsApp ? 'badge-channel-whatsapp' : 'badge-pending'}" title="WhatsApp Consent">
              <i data-lucide="message-circle" style="width:12px;height:12px;"></i> WA
            </span>
          </div>
        </td>
        <td>
          <div class="table-actions">
            <button class="btn btn-outline btn-icon-sm" title="View Profile" onclick="StudentsController.viewProfile('${student.id}')">
              <i data-lucide="eye"></i>
            </button>
            <button class="btn btn-outline btn-icon-sm" title="Edit Student" onclick="StudentsController.editStudent('${student.id}')">
              <i data-lucide="edit-3"></i>
            </button>
            <button class="btn btn-outline btn-icon-sm text-danger" title="Delete Student" onclick="StudentsController.deleteStudent('${student.id}')">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    App.initIcons();
  },

  openStudentForm(student = null) {
    this.editingStudentId = student ? student.id : null;
    const modalTitle = document.getElementById('studentModalTitle');
    const form = document.getElementById('studentForm');

    if (!form) return;
    form.reset();

    if (student) {
      modalTitle.textContent = 'Edit Student Details';
      document.getElementById('studentIdField').value = student.id;
      document.getElementById('studentFullName').value = student.name;
      document.getElementById('studentEmail').value = student.email;
      document.getElementById('studentPhone').value = student.phone || '';
      document.getElementById('studentDOB').value = student.dob || '';
      document.getElementById('studentGender').value = student.gender || 'Male';
      document.getElementById('studentFormClass').value = student.class;
      document.getElementById('studentFormSection').value = student.section;
      document.getElementById('studentAddress').value = student.address || '';
      document.getElementById('studentParentName').value = student.parentName || '';
      document.getElementById('studentParentPhone').value = student.parentPhone || '';
      document.getElementById('studentParentWhatsApp').value = student.parentWhatsApp || '';
      document.getElementById('studentConsentSMS').checked = !!student.consentSMS;
      document.getElementById('studentConsentWA').checked = !!student.consentWhatsApp;
    } else {
      modalTitle.textContent = 'Add New Student';
      document.getElementById('studentIdField').value = `STU-${1000 + this.students.length + 1}`;
      document.getElementById('studentGender').value = 'Male';
      document.getElementById('studentConsentSMS').checked = true;
      document.getElementById('studentConsentWA').checked = true;
    }

    App.openModal('studentFormModal');
  },

  handleFormSubmit() {
    const id = document.getElementById('studentIdField').value.trim();
    const name = document.getElementById('studentFullName').value.trim();
    const email = document.getElementById('studentEmail').value.trim();
    const phone = document.getElementById('studentPhone').value.trim();
    const dob = document.getElementById('studentDOB').value;
    const gender = document.getElementById('studentGender').value;
    const studentClass = document.getElementById('studentFormClass').value;
    const section = document.getElementById('studentFormSection').value;
    const address = document.getElementById('studentAddress').value.trim();
    const parentName = document.getElementById('studentParentName').value.trim();
    const parentPhone = document.getElementById('studentParentPhone').value.trim();
    const parentWhatsApp = document.getElementById('studentParentWhatsApp').value.trim();
    const consentSMS = document.getElementById('studentConsentSMS').checked;
    const consentWhatsApp = document.getElementById('studentConsentWA').checked;

    if (!name || !email || !studentClass || !section || !parentName || !parentPhone) {
      App.showToast('Validation Error', 'Please complete all required fields.', 'warning');
      return;
    }

    const studentData = {
      id,
      name,
      email,
      phone,
      dob,
      gender,
      class: studentClass,
      section,
      address,
      parentName,
      parentPhone,
      parentWhatsApp: parentWhatsApp || parentPhone,
      consentSMS,
      consentWhatsApp,
      avatar: `https://images.unsplash.com/photo-${gender === 'Female' ? '1534528741775-53994a69daeb' : '1539571696357-5a69c17a67c6'}?w=150&auto=format&fit=crop&q=80`
    };

    Storage.saveStudent(studentData);
    this.loadData();
    this.render();
    App.closeModal('studentFormModal');
    App.showToast('Success', `Student ${name} saved successfully.`, 'success');
  },

  editStudent(id) {
    const student = this.students.find(s => s.id === id);
    if (student) {
      this.openStudentForm(student);
    }
  },

  deleteStudent(id) {
    const student = this.students.find(s => s.id === id);
    if (!student) return;

    App.showConfirmModal({
      title: 'Delete Student',
      message: `Are you sure you want to permanently remove <strong>${student.name}</strong> (${student.id}) from the system?`,
      confirmText: 'Delete Student',
      confirmVariant: 'danger',
      onConfirm: () => {
        Storage.deleteStudent(id);
        this.loadData();
        this.render();
        App.showToast('Deleted', `Student ${student.name} removed.`, 'info');
      }
    });
  },

  viewProfile(id) {
    const student = this.students.find(s => s.id === id);
    if (!student) return;

    // Calculate student attendance statistics
    const records = Storage.getAttendance({ studentId: id });
    const totalDays = records.length || 1;
    const presentCount = records.filter(r => r.status === 'present').length;
    const absentCount = records.filter(r => r.status === 'absent').length;
    const lateCount = records.filter(r => r.status === 'late').length;
    const percentage = ((presentCount / totalDays) * 100).toFixed(1);

    document.getElementById('viewStudentAvatar').src = student.avatar || 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80';
    document.getElementById('viewStudentName').textContent = student.name;
    document.getElementById('viewStudentId').textContent = student.id;
    document.getElementById('viewStudentClass').textContent = `${student.class} - Section ${student.section}`;
    
    // Overview tab fields
    document.getElementById('viewStudentEmail').textContent = student.email;
    document.getElementById('viewStudentPhone').textContent = student.phone || 'N/A';
    document.getElementById('viewStudentDOB').textContent = student.dob || 'N/A';
    document.getElementById('viewStudentGender').textContent = student.gender || 'N/A';
    document.getElementById('viewStudentAddress').textContent = student.address || 'N/A';

    // Parent tab fields
    document.getElementById('viewParentName').textContent = student.parentName;
    document.getElementById('viewParentPhone').textContent = student.parentPhone;
    document.getElementById('viewParentWhatsApp').textContent = student.parentWhatsApp || student.parentPhone;
    document.getElementById('viewConsentSMSBadge').className = `badge ${student.consentSMS ? 'badge-present' : 'badge-absent'}`;
    document.getElementById('viewConsentSMSBadge').textContent = student.consentSMS ? 'Opted In' : 'Opted Out';
    document.getElementById('viewConsentWABadge').className = `badge ${student.consentWhatsApp ? 'badge-present' : 'badge-absent'}`;
    document.getElementById('viewConsentWABadge').textContent = student.consentWhatsApp ? 'Opted In' : 'Opted Out';

    // Attendance stats
    document.getElementById('viewTotalWorkingDays').textContent = totalDays;
    document.getElementById('viewPresentDays').textContent = presentCount;
    document.getElementById('viewAbsentDays').textContent = absentCount;
    document.getElementById('viewLateDays').textContent = lateCount;
    document.getElementById('viewAttendanceRate').textContent = `${percentage}%`;

    // Render recent attendance history in modal
    const historyTbody = document.getElementById('viewAttendanceHistoryBody');
    if (historyTbody) {
      if (records.length === 0) {
        historyTbody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">No attendance logs available.</td></tr>`;
      } else {
        historyTbody.innerHTML = records.slice(0, 5).map(r => `
          <tr>
            <td>${r.date}</td>
            <td><span class="badge badge-${r.status}">${r.status}</span></td>
            <td>${r.recordedBy || 'Class Teacher'}</td>
            <td>${r.remarks || 'Normal'}</td>
          </tr>
        `).join('');
      }
    }

    App.openModal('studentProfileModal');
  },

  exportCSV() {
    const filtered = this.getFilteredStudents();
    const headers = ['Student ID', 'Full Name', 'Class', 'Section', 'Email', 'Phone', 'Parent Name', 'Parent Phone', 'Parent WhatsApp', 'SMS Consent', 'WhatsApp Consent'];
    const rows = filtered.map(s => [
      s.id,
      s.name,
      s.class,
      s.section,
      s.email,
      s.phone || '',
      s.parentName,
      s.parentPhone,
      s.parentWhatsApp || '',
      s.consentSMS ? 'YES' : 'NO',
      s.consentWhatsApp ? 'YES' : 'NO'
    ]);

    App.downloadCSV(`EduTrack_Students_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    App.showToast('Exported', 'Student list exported successfully.', 'success');
  }
};

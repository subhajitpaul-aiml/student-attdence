/**
 * EduTrack - Teacher Management Controller
 * Handles teacher directory, assigned classes, subject specialization, and CRUD.
 */

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('teachersTableBody') || document.getElementById('teachersGrid')) {
    TeachersController.init();
  }
});

const TeachersController = {
  teachers: [],
  searchQuery: '',
  currentSubjectFilter: 'all',

  init() {
    this.loadData();
    this.populateSubjectFilter();
    this.bindEvents();
    this.render();
  },

  loadData() {
    this.teachers = Storage.getTeachers();
  },

  populateSubjectFilter() {
    const filterSelect = document.getElementById('teacherSubjectFilter');
    if (!filterSelect) return;

    const subjects = [...new Set(this.teachers.map(t => t.subject))];
    filterSelect.innerHTML = '<option value="all">All Subjects</option>' +
      subjects.map(s => `<option value="${s}">${s}</option>`).join('');
  },

  bindEvents() {
    const searchInput = document.getElementById('teacherSearchInput');
    if (searchInput) {
      searchInput.addEventListener('input', (e) => {
        this.searchQuery = e.target.value.toLowerCase();
        this.render();
      });
    }

    const filterSelect = document.getElementById('teacherSubjectFilter');
    if (filterSelect) {
      filterSelect.addEventListener('change', (e) => {
        this.currentSubjectFilter = e.target.value;
        this.render();
      });
    }

    const addBtn = document.getElementById('addTeacherBtn');
    if (addBtn) {
      addBtn.addEventListener('click', () => {
        this.openTeacherForm();
      });
    }

    const form = document.getElementById('teacherForm');
    if (form) {
      form.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleFormSubmit();
      });
    }
  },

  getFilteredTeachers() {
    return this.teachers.filter(t => {
      const matchSubject = this.currentSubjectFilter === 'all' || t.subject === this.currentSubjectFilter;
      const matchSearch = !this.searchQuery ||
        t.name.toLowerCase().includes(this.searchQuery) ||
        t.id.toLowerCase().includes(this.searchQuery) ||
        t.email.toLowerCase().includes(this.searchQuery) ||
        t.subject.toLowerCase().includes(this.searchQuery);

      return matchSubject && matchSearch;
    });
  },

  render() {
    const tbody = document.getElementById('teachersTableBody');
    const countDisplay = document.getElementById('teacherCountDisplay');
    const filtered = this.getFilteredTeachers();

    if (countDisplay) {
      countDisplay.textContent = `Showing ${filtered.length} of ${this.teachers.length} faculty members`;
    }

    if (!tbody) return;

    if (filtered.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="6" class="text-center py-5 text-muted">
            <div style="padding: 2.5rem 1rem;">
              <i data-lucide="user-x" style="width: 40px; height: 40px; margin: 0 auto 0.75rem auto; opacity: 0.4;"></i>
              <p class="font-semibold text-base">No teachers match your search</p>
            </div>
          </td>
        </tr>
      `;
      App.initIcons();
      return;
    }

    tbody.innerHTML = filtered.map(t => `
      <tr>
        <td>
          <span class="font-mono text-xs font-semibold text-slate-500">${t.id}</span>
        </td>
        <td>
          <div class="user-cell">
            <img class="user-avatar" src="${t.avatar || 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'}" alt="${t.name}">
            <div>
              <span class="user-info-name">${t.name}</span>
              <span class="user-info-sub">${t.qualification || 'Faculty Member'}</span>
            </div>
          </div>
        </td>
        <td>
          <span class="badge" style="background:#eff6ff; color:#1e40af; border:1px solid #bfdbfe;">
            ${t.subject}
          </span>
        </td>
        <td>
          <div style="display:flex; flex-direction:column; gap:2px;">
            <span class="text-sm font-medium text-slate-900">${t.email}</span>
            <span class="text-xs text-muted">${t.phone}</span>
          </div>
        </td>
        <td>
          <div style="display:flex; gap:4px; flex-wrap:wrap;">
            ${(t.assignedClasses || []).map(cls => `
              <span class="badge" style="background:#f1f5f9; color:#334155;">${cls}</span>
            `).join('')}
          </div>
        </td>
        <td>
          <div class="table-actions">
            <button class="btn btn-outline btn-icon-sm" title="Edit Teacher" onclick="TeachersController.editTeacher('${t.id}')">
              <i data-lucide="edit-3"></i>
            </button>
            <button class="btn btn-outline btn-icon-sm text-danger" title="Delete Teacher" onclick="TeachersController.deleteTeacher('${t.id}')">
              <i data-lucide="trash-2"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    App.initIcons();
  },

  openTeacherForm(teacher = null) {
    const modalTitle = document.getElementById('teacherModalTitle');
    const form = document.getElementById('teacherForm');
    if (!form) return;
    form.reset();

    if (teacher) {
      modalTitle.textContent = 'Edit Faculty Profile';
      document.getElementById('teacherIdField').value = teacher.id;
      document.getElementById('teacherFullName').value = teacher.name;
      document.getElementById('teacherEmail').value = teacher.email;
      document.getElementById('teacherPhone').value = teacher.phone;
      document.getElementById('teacherSubject').value = teacher.subject;
      document.getElementById('teacherQualification').value = teacher.qualification || '';
      document.getElementById('teacherClasses').value = (teacher.assignedClasses || []).join(', ');
    } else {
      modalTitle.textContent = 'Add Faculty Member';
      document.getElementById('teacherIdField').value = `TCH-${100 + this.teachers.length + 1}`;
    }

    App.openModal('teacherFormModal');
  },

  handleFormSubmit() {
    const id = document.getElementById('teacherIdField').value.trim();
    const name = document.getElementById('teacherFullName').value.trim();
    const email = document.getElementById('teacherEmail').value.trim();
    const phone = document.getElementById('teacherPhone').value.trim();
    const subject = document.getElementById('teacherSubject').value.trim();
    const qualification = document.getElementById('teacherQualification').value.trim();
    const classesRaw = document.getElementById('teacherClasses').value.trim();

    if (!name || !email || !subject || !phone) {
      App.showToast('Validation Error', 'Please complete all required fields.', 'warning');
      return;
    }

    const assignedClasses = classesRaw ? classesRaw.split(',').map(s => s.trim()).filter(Boolean) : ['Grade 10-A'];

    const teacherData = {
      id,
      name,
      email,
      phone,
      subject,
      qualification,
      assignedClasses,
      status: 'Active',
      avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
    };

    Storage.saveTeacher(teacherData);
    this.loadData();
    this.populateSubjectFilter();
    this.render();
    App.closeModal('teacherFormModal');
    App.showToast('Success', `Faculty member ${name} updated successfully.`, 'success');
  },

  editTeacher(id) {
    const teacher = this.teachers.find(t => t.id === id);
    if (teacher) {
      this.openTeacherForm(teacher);
    }
  },

  deleteTeacher(id) {
    const teacher = this.teachers.find(t => t.id === id);
    if (!teacher) return;

    App.showConfirmModal({
      title: 'Remove Faculty Member',
      message: `Are you sure you want to remove <strong>${teacher.name}</strong> (${teacher.subject})?`,
      confirmText: 'Remove',
      confirmVariant: 'danger',
      onConfirm: () => {
        Storage.deleteTeacher(id);
        this.loadData();
        this.populateSubjectFilter();
        this.render();
        App.showToast('Faculty Removed', `${teacher.name} has been removed.`, 'info');
      }
    });
  }
};

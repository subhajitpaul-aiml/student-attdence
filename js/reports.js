/**
 * EduTrack - Attendance Analytics & Reports Controller
 * Implements period calculations, formula:
 * Attendance Percentage = (Total Present Days / Total Working Days) * 100
 * Chart.js visual visualizations, student-wise rosters, class comparisons, and CSV export.
 */

document.addEventListener('DOMContentLoaded', () => {
  if (document.getElementById('reportPeriodSelect') || document.getElementById('reportStudentTableBody')) {
    ReportsController.init();
  }
});

const ReportsController = {
  selectedPeriod: 'month', // 'today' | 'week' | 'month' | 'all'
  selectedClass: 'all',
  trendChartInstance: null,
  distributionChartInstance: null,

  init() {
    this.populateClassFilter();
    this.bindEvents();
    this.generateReports();
  },

  populateClassFilter() {
    const filter = document.getElementById('reportClassFilter');
    if (!filter) return;

    const classes = Storage.getClasses();
    const uniqueClasses = [...new Set(classes.map(c => c.name))];
    filter.innerHTML = '<option value="all">All Classes</option>' +
      uniqueClasses.map(c => `<option value="${c}">${c}</option>`).join('');
  },

  bindEvents() {
    const periodSelect = document.getElementById('reportPeriodSelect');
    if (periodSelect) {
      periodSelect.addEventListener('change', (e) => {
        this.selectedPeriod = e.target.value;
        this.generateReports();
      });
    }

    const classFilter = document.getElementById('reportClassFilter');
    if (classFilter) {
      classFilter.addEventListener('change', (e) => {
        this.selectedClass = e.target.value;
        this.generateReports();
      });
    }

    // Export CSV
    const exportBtn = document.getElementById('exportReportCSVBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => {
        this.exportCSV();
      });
    }

    // Print Report
    const printBtn = document.getElementById('printReportBtn');
    if (printBtn) {
      printBtn.addEventListener('click', () => {
        window.print();
      });
    }
  },

  getFilteredRecords() {
    let records = Storage.getAttendance();

    if (this.selectedClass !== 'all') {
      records = records.filter(r => r.class === this.selectedClass);
    }

    // Filter by period
    const today = new Date();
    const todayStr = today.toISOString().slice(0, 10);

    if (this.selectedPeriod === 'today') {
      records = records.filter(r => r.date === todayStr);
    } else if (this.selectedPeriod === 'week') {
      const sevenDaysAgo = new Date(today);
      sevenDaysAgo.setDate(today.getDate() - 7);
      const limitStr = sevenDaysAgo.toISOString().slice(0, 10);
      records = records.filter(r => r.date >= limitStr);
    } else if (this.selectedPeriod === 'month') {
      const thirtyDaysAgo = new Date(today);
      thirtyDaysAgo.setDate(today.getDate() - 30);
      const limitStr = thirtyDaysAgo.toISOString().slice(0, 10);
      records = records.filter(r => r.date >= limitStr);
    }

    return records;
  },

  generateReports() {
    const records = this.getFilteredRecords();
    const students = Storage.getStudents();
    
    // Calculate global statistics
    const totalRecords = records.length;
    const presentCount = records.filter(r => r.status === 'present').length;
    const absentCount = records.filter(r => r.status === 'absent').length;
    const lateCount = records.filter(r => r.status === 'late').length;

    // Distinct dates count as working days in this period
    const distinctDates = [...new Set(records.map(r => r.date))];
    const workingDaysCount = distinctDates.length || 1;

    // Overall Attendance Percentage Formula: (Total Present / (Total Present + Total Absent + Total Late)) * 100
    const presentPct = totalRecords > 0 ? ((presentCount / totalRecords) * 100).toFixed(1) : '0.0';
    const absentPct = totalRecords > 0 ? ((absentCount / totalRecords) * 100).toFixed(1) : '0.0';
    const latePct = totalRecords > 0 ? ((lateCount / totalRecords) * 100).toFixed(1) : '0.0';

    // Update stat cards
    const overallEl = document.getElementById('reportOverallPct');
    const presentEl = document.getElementById('reportPresentPct');
    const absentEl = document.getElementById('reportAbsentPct');
    const lateEl = document.getElementById('reportLatePct');
    const workingDaysEl = document.getElementById('reportWorkingDays');

    if (overallEl) overallEl.textContent = `${presentPct}%`;
    if (presentEl) presentEl.textContent = `${presentPct}% (${presentCount})`;
    if (absentEl) absentEl.textContent = `${absentPct}% (${absentCount})`;
    if (lateEl) lateEl.textContent = `${latePct}% (${lateCount})`;
    if (workingDaysEl) workingDaysEl.textContent = `${workingDaysCount} Days`;

    // Render Student-Wise Table
    this.renderStudentTable(records, students);

    // Render Class-Wise Summary Table
    this.renderClassTable(records);

    // Render Charts
    this.renderTrendChart(records);
    this.renderDistributionChart(presentCount, absentCount, lateCount);
  },

  renderStudentTable(records, allStudents) {
    const tbody = document.getElementById('reportStudentTableBody');
    if (!tbody) return;

    let targetStudents = allStudents;
    if (this.selectedClass !== 'all') {
      targetStudents = targetStudents.filter(s => s.class === this.selectedClass);
    }

    if (targetStudents.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-muted">No students found.</td></tr>`;
      return;
    }

    const rows = targetStudents.map(student => {
      const studentRecs = records.filter(r => r.studentId === student.id);
      const studentTotalDays = studentRecs.length;
      const studentPresent = studentRecs.filter(r => r.status === 'present').length;
      const studentAbsent = studentRecs.filter(r => r.status === 'absent').length;
      const studentLate = studentRecs.filter(r => r.status === 'late').length;

      // Formula: (Present Days / Total Working Days) * 100
      const pct = studentTotalDays > 0 
        ? ((studentPresent / studentTotalDays) * 100).toFixed(1) 
        : '100.0';

      const numericPct = parseFloat(pct);
      let statusBadge = '';
      if (numericPct >= 85) {
        statusBadge = '<span class="badge badge-present">Excellent</span>';
      } else if (numericPct >= 75) {
        statusBadge = '<span class="badge badge-late">Average</span>';
      } else {
        statusBadge = '<span class="badge badge-absent">Critical &lt; 75%</span>';
      }

      return `
        <tr>
          <td><span class="font-mono text-xs font-semibold text-slate-500">${student.id}</span></td>
          <td>
            <div class="user-cell">
              <img class="user-avatar" src="${student.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80'}" alt="${student.name}">
              <div>
                <span class="user-info-name">${student.name}</span>
                <span class="user-info-sub">${student.parentPhone}</span>
              </div>
            </div>
          </td>
          <td><span class="text-sm font-semibold">${student.class}-${student.section}</span></td>
          <td><span class="font-semibold">${studentTotalDays}</span></td>
          <td><span class="text-success font-semibold">${studentPresent}</span></td>
          <td><span class="text-danger font-semibold">${studentAbsent}</span></td>
          <td><span class="text-warning font-semibold">${studentLate}</span></td>
          <td>
            <div style="display:flex; align-items:center; gap:0.5rem;">
              <strong style="color: ${numericPct >= 85 ? 'var(--success)' : (numericPct >= 75 ? 'var(--warning)' : 'var(--danger)')}">${pct}%</strong>
              ${statusBadge}
            </div>
          </td>
        </tr>
      `;
    });

    tbody.innerHTML = rows.join('');
  },

  renderClassTable(records) {
    const tbody = document.getElementById('reportClassTableBody');
    if (!tbody) return;

    const classes = Storage.getClasses();
    
    tbody.innerHTML = classes.map(cls => {
      const clsRecs = records.filter(r => r.class === cls.name && r.section === cls.section);
      const total = clsRecs.length;
      const pres = clsRecs.filter(r => r.status === 'present').length;
      const abs = clsRecs.filter(r => r.status === 'absent').length;
      const late = clsRecs.filter(r => r.status === 'late').length;

      const presPct = total > 0 ? ((pres / total) * 100).toFixed(1) : '100.0';
      const absPct = total > 0 ? ((abs / total) * 100).toFixed(1) : '0.0';
      const latePct = total > 0 ? ((late / total) * 100).toFixed(1) : '0.0';

      return `
        <tr>
          <td><strong class="text-slate-900">${cls.name} - ${cls.section}</strong></td>
          <td>${cls.classTeacher}</td>
          <td>${cls.studentCount}</td>
          <td><span class="text-success font-bold">${presPct}%</span></td>
          <td><span class="text-danger font-bold">${absPct}%</span></td>
          <td><span class="text-warning font-bold">${latePct}%</span></td>
          <td>
            <div style="background:#e2e8f0; border-radius:9999px; height:8px; width:100%; overflow:hidden;">
              <div style="background:var(--primary); height:100%; width:${presPct}%;"></div>
            </div>
          </td>
        </tr>
      `;
    }).join('');
  },

  renderTrendChart(records) {
    const ctx = document.getElementById('attendanceTrendChart');
    if (!ctx || !window.Chart) return;

    // Group records by date
    const dateMap = {};
    records.forEach(r => {
      if (!dateMap[r.date]) {
        dateMap[r.date] = { present: 0, absent: 0, late: 0 };
      }
      if (r.status === 'present') dateMap[r.date].present++;
      else if (r.status === 'absent') dateMap[r.date].absent++;
      else if (r.status === 'late') dateMap[r.date].late++;
    });

    const dates = Object.keys(dateMap).sort();
    const presentData = dates.map(d => dateMap[d].present);
    const absentData = dates.map(d => dateMap[d].absent);

    if (this.trendChartInstance) {
      this.trendChartInstance.destroy();
    }

    this.trendChartInstance = new Chart(ctx, {
      type: 'line',
      data: {
        labels: dates.map(d => d.slice(5)), // MM-DD
        datasets: [
          {
            label: 'Present Students',
            data: presentData,
            borderColor: '#10b981',
            backgroundColor: 'rgba(16, 185, 129, 0.1)',
            tension: 0.3,
            fill: true,
            borderWidth: 2.5
          },
          {
            label: 'Absent Students',
            data: absentData,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.08)',
            tension: 0.3,
            fill: true,
            borderWidth: 2.5
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'top', labels: { boxWidth: 12, font: { family: 'Plus Jakarta Sans', weight: '600' } } }
        },
        scales: {
          y: {
            beginAtZero: true,
            grid: { color: '#f1f5f9' }
          },
          x: {
            grid: { display: false }
          }
        }
      }
    });
  },

  renderDistributionChart(present, absent, late) {
    const ctx = document.getElementById('attendanceDistributionChart');
    if (!ctx || !window.Chart) return;

    if (this.distributionChartInstance) {
      this.distributionChartInstance.destroy();
    }

    this.distributionChartInstance = new Chart(ctx, {
      type: 'doughnut',
      data: {
        labels: ['Present', 'Absent', 'Late'],
        datasets: [
          {
            data: [present || 1, absent, late],
            backgroundColor: ['#10b981', '#ef4444', '#f59e0b'],
            borderWidth: 0,
            hoverOffset: 4
          }
        ]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: { position: 'bottom', labels: { boxWidth: 12, padding: 16 } }
        },
        cutout: '72%'
      }
    });
  },

  exportCSV() {
    const records = this.getFilteredRecords();
    const students = Storage.getStudents();
    const headers = ['Student ID', 'Student Name', 'Class', 'Section', 'Total Days', 'Present Days', 'Absent Days', 'Late Days', 'Attendance %'];
    
    const rows = students.map(s => {
      const studentRecs = records.filter(r => r.studentId === s.id);
      const total = studentRecs.length;
      const pres = studentRecs.filter(r => r.status === 'present').length;
      const abs = studentRecs.filter(r => r.status === 'absent').length;
      const late = studentRecs.filter(r => r.status === 'late').length;
      const pct = total > 0 ? ((pres / total) * 100).toFixed(1) : '100.0';
      return [s.id, s.name, s.class, s.section, total, pres, abs, late, `${pct}%`];
    });

    App.downloadCSV(`EduTrack_Attendance_Report_${this.selectedPeriod}_${new Date().toISOString().slice(0, 10)}.csv`, headers, rows);
    App.showToast('Exported', 'Attendance report downloaded to CSV.', 'success');
  }
};

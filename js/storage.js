/**
 * EduTrack - Storage Layer & Mock Data Engine
 * Uses localStorage for full persistence across sessions and page reloads.
 */

const STORAGE_KEYS = {
  USERS: 'edutrack_users',
  CLASSES: 'edutrack_classes',
  TEACHERS: 'edutrack_teachers',
  STUDENTS: 'edutrack_students',
  ATTENDANCE: 'edutrack_attendance',
  NOTIFICATIONS: 'edutrack_notifications',
  SETTINGS: 'edutrack_settings',
  CURRENT_USER: 'edutrack_current_user'
};

const Storage = {
  // Initialize mock data if not already present
  init() {
    if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
      this.seedInitialData();
    }
  },

  seedInitialData() {
    // 1. Initial Users (Admin, Teachers, Students)
    const users = [
      {
        id: 'usr-admin-1',
        email: 'admin@edutrack.edu',
        username: 'admin',
        password: 'admin123',
        name: 'Dr. Robert Vance',
        role: 'admin',
        title: 'Institution Principal',
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        phone: '+1 (555) 234-5678'
      },
      {
        id: 'usr-tch-1',
        email: 'sarah.jenkins@edutrack.edu',
        username: 'sarah.jenkins',
        password: 'teacher123',
        name: 'Sarah Jenkins',
        role: 'teacher',
        teacherId: 'TCH-101',
        subject: 'Mathematics',
        assignedClasses: ['Grade 10-A', 'Grade 9-B'],
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80',
        phone: '+1 (555) 345-6789'
      },
      {
        id: 'usr-tch-2',
        email: 'michael.chang@edutrack.edu',
        username: 'michael.chang',
        password: 'teacher123',
        name: 'Michael Chang',
        role: 'teacher',
        teacherId: 'TCH-102',
        subject: 'Physics & Science',
        assignedClasses: ['Grade 10-B', 'Grade 11-A'],
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        phone: '+1 (555) 456-7890'
      },
      {
        id: 'usr-stu-1',
        email: 'alex.morgan@edutrack.edu',
        username: 'alex.morgan',
        password: 'student123',
        name: 'Alex Morgan',
        role: 'student',
        studentId: 'STU-1001',
        class: 'Grade 10',
        section: 'A',
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        phone: '+1 (555) 567-8901'
      }
    ];

    // 2. Classes & Sections
    const classes = [
      {
        id: 'CLS-10-A',
        name: 'Grade 10',
        section: 'A',
        room: 'Room 301',
        capacity: 35,
        classTeacher: 'Sarah Jenkins',
        teacherId: 'TCH-101',
        studentCount: 12
      },
      {
        id: 'CLS-10-B',
        name: 'Grade 10',
        section: 'B',
        room: 'Room 302',
        capacity: 35,
        classTeacher: 'Michael Chang',
        teacherId: 'TCH-102',
        studentCount: 8
      },
      {
        id: 'CLS-09-A',
        name: 'Grade 9',
        section: 'A',
        room: 'Room 201',
        capacity: 30,
        classTeacher: 'David Ross',
        teacherId: 'TCH-103',
        studentCount: 6
      },
      {
        id: 'CLS-09-B',
        name: 'Grade 9',
        section: 'B',
        room: 'Room 202',
        capacity: 30,
        classTeacher: 'Elena Rostova',
        teacherId: 'TCH-104',
        studentCount: 6
      },
      {
        id: 'CLS-11-A',
        name: 'Grade 11',
        section: 'A',
        room: 'Room 401',
        capacity: 40,
        classTeacher: 'Marcus Thorne',
        teacherId: 'TCH-105',
        studentCount: 5
      }
    ];

    // 3. Teachers
    const teachers = [
      {
        id: 'TCH-101',
        name: 'Sarah Jenkins',
        email: 'sarah.jenkins@edutrack.edu',
        phone: '+1 (555) 345-6789',
        subject: 'Mathematics',
        qualification: 'M.Sc. Applied Mathematics, M.Ed.',
        assignedClasses: ['Grade 10-A', 'Grade 9-B'],
        joinDate: '2021-08-15',
        status: 'Active',
        avatar: 'https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&auto=format&fit=crop&q=80'
      },
      {
        id: 'TCH-102',
        name: 'Michael Chang',
        email: 'michael.chang@edutrack.edu',
        phone: '+1 (555) 456-7890',
        subject: 'Physics',
        qualification: 'Ph.D. Experimental Physics',
        assignedClasses: ['Grade 10-B', 'Grade 11-A'],
        joinDate: '2020-01-10',
        status: 'Active',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80'
      },
      {
        id: 'TCH-103',
        name: 'David Ross',
        email: 'david.ross@edutrack.edu',
        phone: '+1 (555) 678-9012',
        subject: 'English Literature',
        qualification: 'M.A. English & Comparative Literature',
        assignedClasses: ['Grade 9-A', 'Grade 10-A'],
        joinDate: '2019-09-01',
        status: 'Active',
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80'
      },
      {
        id: 'TCH-104',
        name: 'Elena Rostova',
        email: 'elena.rostova@edutrack.edu',
        phone: '+1 (555) 789-0123',
        subject: 'Chemistry',
        qualification: 'M.Sc. Organic Chemistry',
        assignedClasses: ['Grade 9-B', 'Grade 11-A'],
        joinDate: '2022-07-20',
        status: 'Active',
        avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80'
      },
      {
        id: 'TCH-105',
        name: 'Marcus Thorne',
        email: 'marcus.thorne@edutrack.edu',
        phone: '+1 (555) 890-1234',
        subject: 'Computer Science',
        qualification: 'M.Tech Software Engineering',
        assignedClasses: ['Grade 11-A', 'Grade 10-B'],
        joinDate: '2023-01-05',
        status: 'Active',
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80'
      },
      {
        id: 'TCH-106',
        name: 'Rebecca Torres',
        email: 'rebecca.torres@edutrack.edu',
        phone: '+1 (555) 901-2345',
        subject: 'History & Civics',
        qualification: 'M.A. Modern History',
        assignedClasses: ['Grade 10-A', 'Grade 9-A'],
        joinDate: '2021-11-12',
        status: 'Active',
        avatar: 'https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&auto=format&fit=crop&q=80'
      }
    ];

    // 4. Students
    const students = [
      {
        id: 'STU-1001',
        name: 'Alex Morgan',
        email: 'alex.morgan@edutrack.edu',
        phone: '+1 (555) 567-8901',
        dob: '2009-04-12',
        gender: 'Male',
        class: 'Grade 10',
        section: 'A',
        address: '742 Evergreen Terrace, Springfield, CA',
        parentName: 'David Morgan',
        parentPhone: '+1 (555) 891-2345',
        parentWhatsApp: '+1 (555) 891-2345',
        parentEmail: 'david.morgan@example.com',
        consentSMS: true,
        consentWhatsApp: true,
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        rollNumber: '10A-01'
      },
      {
        id: 'STU-1002',
        name: 'Sophia Chen',
        email: 'sophia.chen@edutrack.edu',
        phone: '+1 (555) 567-8902',
        dob: '2009-08-23',
        gender: 'Female',
        class: 'Grade 10',
        section: 'A',
        address: '128 Blossom Valley Rd, Cupertino, CA',
        parentName: 'Wei Chen',
        parentPhone: '+1 (555) 891-2346',
        parentWhatsApp: '+1 (555) 891-2346',
        parentEmail: 'wei.chen@example.com',
        consentSMS: true,
        consentWhatsApp: true,
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        rollNumber: '10A-02'
      },
      {
        id: 'STU-1003',
        name: 'Liam Henderson',
        email: 'liam.h@edutrack.edu',
        phone: '+1 (555) 567-8903',
        dob: '2009-02-17',
        gender: 'Male',
        class: 'Grade 10',
        section: 'A',
        address: '45 Pine Ridge Dr, Los Altos, CA',
        parentName: 'Sarah Henderson',
        parentPhone: '+1 (555) 891-2347',
        parentWhatsApp: '+1 (555) 891-2347',
        parentEmail: 'sarah.h@example.com',
        consentSMS: true,
        consentWhatsApp: false, // parent prefers SMS only
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        rollNumber: '10A-03'
      },
      {
        id: 'STU-1004',
        name: 'Emma Watson-Brown',
        email: 'emma.wb@edutrack.edu',
        phone: '+1 (555) 567-8904',
        dob: '2009-11-05',
        gender: 'Female',
        class: 'Grade 10',
        section: 'A',
        address: '89 Willow Creek Lane, Palo Alto, CA',
        parentName: 'George Brown',
        parentPhone: '+1 (555) 891-2348',
        parentWhatsApp: '+1 (555) 891-2348',
        parentEmail: 'george.brown@example.com',
        consentSMS: true,
        consentWhatsApp: true,
        avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
        rollNumber: '10A-04'
      },
      {
        id: 'STU-1005',
        name: 'Noah Patel',
        email: 'noah.patel@edutrack.edu',
        phone: '+1 (555) 567-8905',
        dob: '2009-06-30',
        gender: 'Male',
        class: 'Grade 10',
        section: 'A',
        address: '302 Cedar Ave, Sunnyvale, CA',
        parentName: 'Rajesh Patel',
        parentPhone: '+1 (555) 891-2349',
        parentWhatsApp: '+1 (555) 891-2349',
        parentEmail: 'rajesh.patel@example.com',
        consentSMS: true,
        consentWhatsApp: true,
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
        rollNumber: '10A-05'
      },
      {
        id: 'STU-1006',
        name: 'Olivia Martinez',
        email: 'olivia.m@edutrack.edu',
        phone: '+1 (555) 567-8906',
        dob: '2009-09-14',
        gender: 'Female',
        class: 'Grade 10',
        section: 'A',
        address: '512 Oakwood Blvd, Santa Clara, CA',
        parentName: 'Carlos Martinez',
        parentPhone: '+1 (555) 891-2350',
        parentWhatsApp: '+1 (555) 891-2350',
        parentEmail: 'carlos.m@example.com',
        consentSMS: true,
        consentWhatsApp: true,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        rollNumber: '10A-06'
      },
      {
        id: 'STU-1007',
        name: 'Ethan Brooks',
        email: 'ethan.brooks@edutrack.edu',
        phone: '+1 (555) 567-8907',
        dob: '2009-01-20',
        gender: 'Male',
        class: 'Grade 10',
        section: 'A',
        address: '610 Redwood Way, Mountain View, CA',
        parentName: 'Patricia Brooks',
        parentPhone: '+1 (555) 891-2351',
        parentWhatsApp: '+1 (555) 891-2351',
        parentEmail: 'patricia.b@example.com',
        consentSMS: true,
        consentWhatsApp: true,
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
        rollNumber: '10A-07'
      },
      {
        id: 'STU-1008',
        name: 'Ava Washington',
        email: 'ava.w@edutrack.edu',
        phone: '+1 (555) 567-8908',
        dob: '2009-12-03',
        gender: 'Female',
        class: 'Grade 10',
        section: 'A',
        address: '77 Magnolia St, San Jose, CA',
        parentName: 'Marcus Washington',
        parentPhone: '+1 (555) 891-2352',
        parentWhatsApp: '+1 (555) 891-2352',
        parentEmail: 'marcus.w@example.com',
        consentSMS: true,
        consentWhatsApp: true,
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        rollNumber: '10A-08'
      },
      {
        id: 'STU-1009',
        name: 'Lucas Campbell',
        email: 'lucas.c@edutrack.edu',
        phone: '', // no student phone
        dob: '2009-05-18',
        gender: 'Male',
        class: 'Grade 10',
        section: 'A',
        address: '920 Sunset Blvd, Los Gatos, CA',
        parentName: 'Linda Campbell',
        parentPhone: '+1 (555) 891-2353',
        parentWhatsApp: '+1 (555) 891-2353',
        parentEmail: 'linda.c@example.com',
        consentSMS: true,
        consentWhatsApp: true,
        avatar: 'https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&auto=format&fit=crop&q=80',
        rollNumber: '10A-09'
      },
      {
        id: 'STU-1010',
        name: 'Mia Takahashi',
        email: 'mia.t@edutrack.edu',
        phone: '+1 (555) 567-8910',
        dob: '2009-07-29',
        gender: 'Female',
        class: 'Grade 10',
        section: 'A',
        address: '1410 Cherry Blossom Way, Saratoga, CA',
        parentName: 'Kenji Takahashi',
        parentPhone: '+1 (555) 891-2354',
        parentWhatsApp: '', // no parent WhatsApp
        parentEmail: 'kenji.t@example.com',
        consentSMS: true,
        consentWhatsApp: false,
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        rollNumber: '10A-10'
      },
      {
        id: 'STU-1011',
        name: 'Daniel Kim',
        email: 'daniel.kim@edutrack.edu',
        phone: '+1 (555) 567-8911',
        dob: '2009-03-11',
        gender: 'Male',
        class: 'Grade 10',
        section: 'A',
        address: '224 Mission College Blvd, Santa Clara, CA',
        parentName: 'Sun-Young Kim',
        parentPhone: '+1 (555) 891-2355',
        parentWhatsApp: '+1 (555) 891-2355',
        parentEmail: 'sun.kim@example.com',
        consentSMS: true,
        consentWhatsApp: true,
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        rollNumber: '10A-11'
      },
      {
        id: 'STU-1012',
        name: 'Isabella Rossi',
        email: 'isabella.r@edutrack.edu',
        phone: '+1 (555) 567-8912',
        dob: '2009-10-15',
        gender: 'Female',
        class: 'Grade 10',
        section: 'A',
        address: '815 Cypress Point, Milpitas, CA',
        parentName: 'Antonio Rossi',
        parentPhone: '+1 (555) 891-2356',
        parentWhatsApp: '+1 (555) 891-2356',
        parentEmail: 'antonio.rossi@example.com',
        consentSMS: true,
        consentWhatsApp: true,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        rollNumber: '10A-12'
      },
      // Grade 10-B Students
      {
        id: 'STU-1013',
        name: 'Benjamin Lee',
        email: 'ben.lee@edutrack.edu',
        phone: '+1 (555) 567-8913',
        dob: '2009-04-02',
        gender: 'Male',
        class: 'Grade 10',
        section: 'B',
        address: '400 Castro St, Mountain View, CA',
        parentName: 'Min-Jun Lee',
        parentPhone: '+1 (555) 891-2357',
        parentWhatsApp: '+1 (555) 891-2357',
        parentEmail: 'minjun.lee@example.com',
        consentSMS: true,
        consentWhatsApp: true,
        avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&auto=format&fit=crop&q=80',
        rollNumber: '10B-01'
      },
      {
        id: 'STU-1014',
        name: 'Harper Davis',
        email: 'harper.davis@edutrack.edu',
        phone: '+1 (555) 567-8914',
        dob: '2009-08-19',
        gender: 'Female',
        class: 'Grade 10',
        section: 'B',
        address: '1100 University Ave, Palo Alto, CA',
        parentName: 'Thomas Davis',
        parentPhone: '+1 (555) 891-2358',
        parentWhatsApp: '+1 (555) 891-2358',
        parentEmail: 'thomas.davis@example.com',
        consentSMS: true,
        consentWhatsApp: true,
        avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&auto=format&fit=crop&q=80',
        rollNumber: '10B-02'
      },
      {
        id: 'STU-1015',
        name: 'James Wilson',
        email: 'james.w@edutrack.edu',
        phone: '+1 (555) 567-8915',
        dob: '2009-06-12',
        gender: 'Male',
        class: 'Grade 10',
        section: 'B',
        address: '320 Stevens Creek, Cupertino, CA',
        parentName: 'Emily Wilson',
        parentPhone: '+1 (555) 891-2359',
        parentWhatsApp: '+1 (555) 891-2359',
        parentEmail: 'emily.wilson@example.com',
        consentSMS: true,
        consentWhatsApp: true,
        avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80',
        rollNumber: '10B-03'
      },
      {
        id: 'STU-1016',
        name: 'Chloe Taylor',
        email: 'chloe.t@edutrack.edu',
        phone: '+1 (555) 567-8916',
        dob: '2009-01-08',
        gender: 'Female',
        class: 'Grade 10',
        section: 'B',
        address: '730 Fremont Ave, Los Altos, CA',
        parentName: 'Richard Taylor',
        parentPhone: '+1 (555) 891-2360',
        parentWhatsApp: '+1 (555) 891-2360',
        parentEmail: 'richard.taylor@example.com',
        consentSMS: true,
        consentWhatsApp: true,
        avatar: 'https://images.unsplash.com/photo-1524504388940-b1c1722653e1?w=150&auto=format&fit=crop&q=80',
        rollNumber: '10B-04'
      },
      {
        id: 'STU-1017',
        name: 'Mason Wright',
        email: 'mason.w@edutrack.edu',
        phone: '+1 (555) 567-8917',
        dob: '2009-09-27',
        gender: 'Male',
        class: 'Grade 10',
        section: 'B',
        address: '940 Tasman Dr, Sunnyvale, CA',
        parentName: 'Arthur Wright',
        parentPhone: '+1 (555) 891-2361',
        parentWhatsApp: '+1 (555) 891-2361',
        parentEmail: 'arthur.w@example.com',
        consentSMS: true,
        consentWhatsApp: true,
        avatar: 'https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80',
        rollNumber: '10B-05'
      },
      {
        id: 'STU-1018',
        name: 'Ella Scott',
        email: 'ella.scott@edutrack.edu',
        phone: '+1 (555) 567-8918',
        dob: '2009-12-14',
        gender: 'Female',
        class: 'Grade 10',
        section: 'B',
        address: '210 Saratoga Ave, San Jose, CA',
        parentName: 'Jessica Scott',
        parentPhone: '+1 (555) 891-2362',
        parentWhatsApp: '+1 (555) 891-2362',
        parentEmail: 'jessica.scott@example.com',
        consentSMS: true,
        consentWhatsApp: true,
        avatar: 'https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&auto=format&fit=crop&q=80',
        rollNumber: '10B-06'
      },
      // Grade 9-A Students
      {
        id: 'STU-1019',
        name: 'Aiden Cooper',
        email: 'aiden.c@edutrack.edu',
        phone: '+1 (555) 567-8919',
        dob: '2010-03-22',
        gender: 'Male',
        class: 'Grade 9',
        section: 'A',
        address: '550 Hamilton Ave, Palo Alto, CA',
        parentName: 'Brian Cooper',
        parentPhone: '+1 (555) 891-2363',
        parentWhatsApp: '+1 (555) 891-2363',
        parentEmail: 'brian.cooper@example.com',
        consentSMS: true,
        consentWhatsApp: true,
        avatar: 'https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=150&auto=format&fit=crop&q=80',
        rollNumber: '09A-01'
      },
      {
        id: 'STU-1020',
        name: 'Zoe Jenkins',
        email: 'zoe.jenkins@edutrack.edu',
        phone: '+1 (555) 567-8920',
        dob: '2010-07-11',
        gender: 'Female',
        class: 'Grade 9',
        section: 'A',
        address: '330 Mathilda Ave, Sunnyvale, CA',
        parentName: 'Edward Jenkins',
        parentPhone: '+1 (555) 891-2364',
        parentWhatsApp: '+1 (555) 891-2364',
        parentEmail: 'edward.j@example.com',
        consentSMS: true,
        consentWhatsApp: true,
        avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        rollNumber: '09A-02'
      }
    ];

    // 5. Historical Attendance Data Generation (Last 14 working school days)
    const attendance = [];
    const today = new Date();
    
    // Helper to format YYYY-MM-DD
    const formatDate = (d) => {
      const year = d.getFullYear();
      const month = String(d.getMonth() + 1).padStart(2, '0');
      const day = String(d.getDate()).padStart(2, '0');
      return `${year}-${month}-${day}`;
    };

    const targetStudents = students.filter(s => s.class === 'Grade 10' && s.section === 'A');

    // Generate dates going back 14 school days (excluding weekends)
    let daysCount = 0;
    let cur = new Date(today);
    
    while (daysCount < 14) {
      const dayOfWeek = cur.getDay();
      // Skip weekends (0=Sun, 6=Sat)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        const dateStr = formatDate(cur);
        const isToday = daysCount === 0;

        targetStudents.forEach((student, idx) => {
          let status = 'present';

          // Simulate realistic attendance patterns
          if (isToday) {
            // On today: Alex Morgan absent, Emma late, rest present
            if (student.id === 'STU-1001') status = 'absent';
            else if (student.id === 'STU-1004') status = 'late';
            else status = 'present';
          } else {
            // Pseudo-random deterministic statuses for past days
            const seed = (daysCount * 7 + idx * 3) % 19;
            if (seed === 0) status = 'absent';
            else if (seed === 1) status = 'late';
            else status = 'present';
          }

          attendance.push({
            id: `att-${student.id}-${dateStr}`,
            studentId: student.id,
            studentName: student.name,
            class: student.class,
            section: student.section,
            date: dateStr,
            status: status, // 'present' | 'absent' | 'late'
            recordedBy: 'Sarah Jenkins (TCH-101)',
            recordedAt: `${dateStr}T08:35:00.000Z`,
            remarks: status === 'absent' ? 'Unexcused absence' : (status === 'late' ? 'Arrived 15m late' : 'On time')
          });
        });

        daysCount++;
      }
      cur.setDate(cur.getDate() - 1);
    }

    // Also populate past 5 days for Grade 10-B
    const grade10BStudents = students.filter(s => s.class === 'Grade 10' && s.section === 'B');
    let bDays = 0;
    let curB = new Date(today);
    while (bDays < 5) {
      if (curB.getDay() !== 0 && curB.getDay() !== 6) {
        const dateStr = formatDate(curB);
        grade10BStudents.forEach((student, idx) => {
          let status = (bDays === 1 && idx === 2) ? 'absent' : (idx === 4 && bDays === 3 ? 'late' : 'present');
          attendance.push({
            id: `att-${student.id}-${dateStr}`,
            studentId: student.id,
            studentName: student.name,
            class: student.class,
            section: student.section,
            date: dateStr,
            status: status,
            recordedBy: 'Michael Chang (TCH-102)',
            recordedAt: `${dateStr}T08:40:00.000Z`,
            remarks: status === 'absent' ? 'Medical leave' : 'On time'
          });
        });
        bDays++;
      }
      curB.setDate(curB.getDate() - 1);
    }

    // 6. Pre-seeded Simulated Notifications
    const todayStr = formatDate(today);
    const notifications = [
      {
        id: 'notif-sim-101',
        studentId: 'STU-1001',
        studentName: 'Alex Morgan',
        recipientType: 'Parent',
        recipientName: 'David Morgan',
        phone: '+1 (555) 891-2345',
        channel: 'WhatsApp',
        status: 'Delivered', // 'Pending' | 'Sending' | 'Sent' | 'Delivered' | 'Failed'
        date: `${todayStr} 08:36 AM`,
        timestamp: new Date().toISOString(),
        class: 'Grade 10',
        section: 'A',
        messageType: 'Absent Alert',
        isDemo: true,
        content: `Dear Parent, your child Alex Morgan has been marked ABSENT today (${todayStr}) in Grade 10-A. Please contact EduTrack Institution.`
      },
      {
        id: 'notif-sim-102',
        studentId: 'STU-1001',
        studentName: 'Alex Morgan',
        recipientType: 'Parent',
        recipientName: 'David Morgan',
        phone: '+1 (555) 891-2345',
        channel: 'SMS',
        status: 'Delivered',
        date: `${todayStr} 08:36 AM`,
        timestamp: new Date().toISOString(),
        class: 'Grade 10',
        section: 'A',
        messageType: 'Absent Alert',
        isDemo: true,
        content: `EduTrack Alert: Alex Morgan was marked ABSENT today on ${todayStr}. Contact institution office for inquiries.`
      },
      {
        id: 'notif-sim-103',
        studentId: 'STU-1001',
        studentName: 'Alex Morgan',
        recipientType: 'Student',
        recipientName: 'Alex Morgan',
        phone: '+1 (555) 567-8901',
        channel: 'WhatsApp',
        status: 'Sent',
        date: `${todayStr} 08:36 AM`,
        timestamp: new Date().toISOString(),
        class: 'Grade 10',
        section: 'A',
        messageType: 'Absent Alert',
        isDemo: true,
        content: `Hi Alex, you have been marked ABSENT for today (${todayStr}) in Grade 10-A.`
      },
      {
        id: 'notif-sim-104',
        studentId: 'STU-1001',
        studentName: 'Alex Morgan',
        recipientType: 'Student',
        recipientName: 'Alex Morgan',
        phone: '+1 (555) 567-8901',
        channel: 'SMS',
        status: 'Sent',
        date: `${todayStr} 08:36 AM`,
        timestamp: new Date().toISOString(),
        class: 'Grade 10',
        section: 'A',
        messageType: 'Absent Alert',
        isDemo: true,
        content: `EduTrack Student Alert: You are marked ABSENT for class on ${todayStr}.`
      },
      {
        id: 'notif-sim-098',
        studentId: 'STU-1003',
        studentName: 'Liam Henderson',
        recipientType: 'Parent',
        recipientName: 'Sarah Henderson',
        phone: '+1 (555) 891-2347',
        channel: 'SMS',
        status: 'Delivered',
        date: '2026-11-16 08:42 AM',
        timestamp: '2026-11-16T08:42:00.000Z',
        class: 'Grade 10',
        section: 'A',
        messageType: 'Absent Alert',
        isDemo: true,
        content: `EduTrack Alert: Liam Henderson was marked ABSENT today on 2026-11-16. Please contact the institution.`
      },
      {
        id: 'notif-sim-097',
        studentId: 'STU-1015',
        studentName: 'James Wilson',
        recipientType: 'Parent',
        recipientName: 'Emily Wilson',
        phone: '+1 (555) 891-2359',
        channel: 'WhatsApp',
        status: 'Delivered',
        date: '2026-11-14 08:45 AM',
        timestamp: '2026-11-14T08:45:00.000Z',
        class: 'Grade 10',
        section: 'B',
        messageType: 'Absent Alert',
        isDemo: true,
        content: `Dear Parent, your child James Wilson has been marked ABSENT today in Grade 10-B.`
      },
      {
        id: 'notif-sim-096',
        studentId: 'STU-1007',
        studentName: 'Ethan Brooks',
        recipientType: 'Parent',
        recipientName: 'Patricia Brooks',
        phone: '+1 (555) 891-2351',
        channel: 'SMS',
        status: 'Failed', // simulated network glitch demo
        date: '2026-11-11 08:50 AM',
        timestamp: '2026-11-11T08:50:00.000Z',
        class: 'Grade 10',
        section: 'A',
        messageType: 'Absent Alert',
        isDemo: true,
        content: `EduTrack Alert: Ethan Brooks was marked ABSENT today on 2026-11-11.`
      }
    ];

    // 7. System Settings
    const settings = {
      institutionName: 'EduTrack International Academy',
      institutionTagline: 'Smart Institution Attendance & Communication System',
      institutionAddress: '452 Academic Boulevard, Innovation Park, CA 90210',
      institutionPhone: '+1 (800) 555-3388',
      institutionEmail: 'administration@edutrack.edu',
      academicYear: '2026 - 2027',
      currency: 'USD',
      timezone: 'America/Los_Angeles (PST)',
      
      // Notification simulation toggles
      smsEnabled: true,
      whatsAppEnabled: true,
      autoNotifyAbsent: true,
      autoNotifyLate: false,
      notifyParents: true,
      notifyStudents: true,
      
      // Notification templates
      smsTemplate: 'Dear Parent, Your child {{student_name}} has been marked ABSENT today. Class: {{class_name}}, Section: {{section}}, Date: {{date}}. Please contact EduTrack Office.',
      whatsAppTemplate: '🏫 *EduTrack Attendance Alert*\n\nStudent: *{{student_name}}* (ID: {{student_id}})\nClass: *{{class_name}}* | Section: *{{section}}*\nDate: *{{date}}*\nStatus: 🔴 *ABSENT*\n\nPlease get in touch with institution administration if this absence was unexcused.',

      // Theme
      theme: 'light',
      accentColor: '#1e40af' // Navy / Indigo
    };

    // Commit to localStorage
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(users));
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(attendance));
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(notifications));
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(settings));

    // Default current user to Admin if not logged in
    if (!localStorage.getItem(STORAGE_KEYS.CURRENT_USER)) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(users[0]));
    }
  },

  // -------------------------------------------------------------
  // USERS
  // -------------------------------------------------------------
  getUsers() {
    this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.USERS) || '[]');
  },

  getCurrentUser() {
    this.init();
    const cur = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return cur ? JSON.parse(cur) : null;
  },

  setCurrentUser(user) {
    if (user) {
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    } else {
      localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    }
  },

  // -------------------------------------------------------------
  // CLASSES
  // -------------------------------------------------------------
  getClasses() {
    this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.CLASSES) || '[]');
  },

  saveClass(clsData) {
    const classes = this.getClasses();
    const index = classes.findIndex(c => c.id === clsData.id);
    if (index >= 0) {
      classes[index] = { ...classes[index], ...clsData };
    } else {
      clsData.id = clsData.id || `CLS-${clsData.name.replace(/\s+/g, '')}-${clsData.section}`;
      classes.push(clsData);
    }
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
    return clsData;
  },

  deleteClass(classId) {
    const classes = this.getClasses().filter(c => c.id !== classId);
    localStorage.setItem(STORAGE_KEYS.CLASSES, JSON.stringify(classes));
    return true;
  },

  // -------------------------------------------------------------
  // TEACHERS
  // -------------------------------------------------------------
  getTeachers() {
    this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.TEACHERS) || '[]');
  },

  saveTeacher(teacherData) {
    const teachers = this.getTeachers();
    const index = teachers.findIndex(t => t.id === teacherData.id);
    if (index >= 0) {
      teachers[index] = { ...teachers[index], ...teacherData };
    } else {
      if (!teacherData.id) {
        teacherData.id = `TCH-${100 + teachers.length + 1}`;
      }
      teachers.push(teacherData);
    }
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
    return teacherData;
  },

  deleteTeacher(teacherId) {
    const teachers = this.getTeachers().filter(t => t.id !== teacherId);
    localStorage.setItem(STORAGE_KEYS.TEACHERS, JSON.stringify(teachers));
    return true;
  },

  // -------------------------------------------------------------
  // STUDENTS
  // -------------------------------------------------------------
  getStudents() {
    this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.STUDENTS) || '[]');
  },

  getStudentById(id) {
    return this.getStudents().find(s => s.id === id);
  },

  saveStudent(studentData) {
    const students = this.getStudents();
    const index = students.findIndex(s => s.id === studentData.id);
    if (index >= 0) {
      students[index] = { ...students[index], ...studentData };
    } else {
      if (!studentData.id) {
        studentData.id = `STU-${1000 + students.length + 1}`;
      }
      students.push(studentData);
    }
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    return studentData;
  },

  deleteStudent(studentId) {
    const students = this.getStudents().filter(s => s.id !== studentId);
    localStorage.setItem(STORAGE_KEYS.STUDENTS, JSON.stringify(students));
    return true;
  },

  // -------------------------------------------------------------
  // ATTENDANCE
  // -------------------------------------------------------------
  getAttendance(filters = {}) {
    this.init();
    let records = JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || '[]');
    if (filters.class) {
      records = records.filter(r => r.class === filters.class);
    }
    if (filters.section) {
      records = records.filter(r => r.section === filters.section);
    }
    if (filters.date) {
      records = records.filter(r => r.date === filters.date);
    }
    if (filters.studentId) {
      records = records.filter(r => r.studentId === filters.studentId);
    }
    return records;
  },

  checkAttendanceExists(className, section, date) {
    const records = this.getAttendance({ class: className, section: section, date: date });
    return records.length > 0;
  },

  saveAttendanceBatch(records) {
    this.init();
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.ATTENDANCE) || '[]');
    
    records.forEach(newRec => {
      const idx = all.findIndex(r => r.studentId === newRec.studentId && r.date === newRec.date);
      if (idx >= 0) {
        all[idx] = { ...all[idx], ...newRec };
      } else {
        all.push(newRec);
      }
    });

    localStorage.setItem(STORAGE_KEYS.ATTENDANCE, JSON.stringify(all));
    return true;
  },

  // -------------------------------------------------------------
  // NOTIFICATIONS
  // -------------------------------------------------------------
  getNotifications(filters = {}) {
    this.init();
    let notifs = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
    
    // Sort newest first
    notifs.sort((a, b) => new Date(b.timestamp || b.date) - new Date(a.timestamp || a.date));

    if (filters.channel && filters.channel !== 'all') {
      notifs = notifs.filter(n => n.channel.toLowerCase() === filters.channel.toLowerCase());
    }
    if (filters.status && filters.status !== 'all') {
      notifs = notifs.filter(n => n.status.toLowerCase() === filters.status.toLowerCase());
    }
    if (filters.studentId) {
      notifs = notifs.filter(n => n.studentId === filters.studentId);
    }
    if (filters.class && filters.class !== 'all') {
      notifs = notifs.filter(n => n.class === filters.class);
    }
    if (filters.date) {
      notifs = notifs.filter(n => n.date.startsWith(filters.date));
    }
    if (filters.search) {
      const q = filters.search.toLowerCase();
      notifs = notifs.filter(n => 
        n.studentName.toLowerCase().includes(q) ||
        n.phone.toLowerCase().includes(q) ||
        (n.recipientName && n.recipientName.toLowerCase().includes(q))
      );
    }
    return notifs;
  },

  addNotification(notif) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
    notif.id = notif.id || `notif-sim-${Date.now()}-${Math.floor(Math.random() * 1000)}`;
    notif.timestamp = notif.timestamp || new Date().toISOString();
    notif.isDemo = true;
    all.unshift(notif);
    localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
    return notif;
  },

  updateNotificationStatus(id, newStatus) {
    const all = JSON.parse(localStorage.getItem(STORAGE_KEYS.NOTIFICATIONS) || '[]');
    const item = all.find(n => n.id === id);
    if (item) {
      item.status = newStatus;
      localStorage.setItem(STORAGE_KEYS.NOTIFICATIONS, JSON.stringify(all));
      return item;
    }
    return null;
  },

  // -------------------------------------------------------------
  // SETTINGS
  // -------------------------------------------------------------
  getSettings() {
    this.init();
    return JSON.parse(localStorage.getItem(STORAGE_KEYS.SETTINGS) || '{}');
  },

  saveSettings(newSettings) {
    const current = this.getSettings();
    const updated = { ...current, ...newSettings };
    localStorage.setItem(STORAGE_KEYS.SETTINGS, JSON.stringify(updated));
    return updated;
  },

  // Reset to initial mock state
  resetAll() {
    localStorage.removeItem(STORAGE_KEYS.USERS);
    localStorage.removeItem(STORAGE_KEYS.CLASSES);
    localStorage.removeItem(STORAGE_KEYS.TEACHERS);
    localStorage.removeItem(STORAGE_KEYS.STUDENTS);
    localStorage.removeItem(STORAGE_KEYS.ATTENDANCE);
    localStorage.removeItem(STORAGE_KEYS.NOTIFICATIONS);
    localStorage.removeItem(STORAGE_KEYS.SETTINGS);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    this.init();
  }
};

// Initialize right away
Storage.init();

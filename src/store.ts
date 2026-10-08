import { v4 as uuidv4 } from 'uuid';
import type { User, Faculty, Student, Dean, EvaluationCycle, Criterion, SubQuestion, Evaluation, AuditLogEntry, RateLimitEntry, FacultyMetrics, EventType, TrainingRecommendation, Dispute, Program, Subject, AdminRelease, DeanRelease } from './types';
import { saveToLocalStorage, loadFromLocalStorage } from './utils/persistence';

const BENCHMARK = 3.0;
const THRESHOLD = 10;

const SUB_QUESTIONS: SubQuestion[] = [
  { id: 'sq-teaching-1', criterionId: 'crit-teaching', text: 'Uses effective and engaging teaching methods', order: 1 },
  { id: 'sq-teaching-2', criterionId: 'crit-teaching', text: 'Presents material in a clear and organized manner', order: 2 },
  { id: 'sq-teaching-3', criterionId: 'crit-teaching', text: 'Encourages active participation and critical thinking', order: 3 },
  { id: 'sq-mastery-1', criterionId: 'crit-mastery', text: 'Demonstrates deep knowledge of the subject matter', order: 1 },
  { id: 'sq-mastery-2', criterionId: 'crit-mastery', text: 'Answers questions accurately and confidently', order: 2 },
  { id: 'sq-mastery-3', criterionId: 'crit-mastery', text: 'Connects theory to real-world applications effectively', order: 3 },
  { id: 'sq-punctuality-1', criterionId: 'crit-punctuality', text: 'Starts and ends class on time', order: 1 },
  { id: 'sq-punctuality-2', criterionId: 'crit-punctuality', text: 'Returns graded assignments and feedback promptly', order: 2 },
  { id: 'sq-punctuality-3', criterionId: 'crit-punctuality', text: 'Meets scheduled office hours consistently', order: 3 },
  { id: 'sq-professionalism-1', criterionId: 'crit-professionalism', text: 'Maintains respectful and professional communication', order: 1 },
  { id: 'sq-professionalism-2', criterionId: 'crit-professionalism', text: 'Demonstrates fairness and integrity in all interactions', order: 2 },
  { id: 'sq-professionalism-3', criterionId: 'crit-professionalism', text: 'Shows commitment to student success and development', order: 3 },
];

const FACULTY_SEED: Faculty[] = [
  { id: 'F001', name: 'Dr. Sarah Chen', department: 'Computer Science', title: 'Associate Professor', courses: ['CS101', 'CS201', 'CS301'], acknowledgmentStatus: 'pending_review' },
  { id: 'F002', name: 'Dr. James Wilson', department: 'Computer Science', title: 'Professor', courses: ['CS401', 'CS350'], acknowledgmentStatus: 'pending_review' },
  { id: 'F003', name: 'Dr. Maria Garcia', department: 'Mathematics', title: 'Assistant Professor', courses: ['MATH101', 'MATH201'], acknowledgmentStatus: 'pending_review' },
  { id: 'F004', name: 'Dr. Robert Kim', department: 'Mathematics', title: 'Professor', courses: ['MATH301'], acknowledgmentStatus: 'pending_review' },
  { id: 'F005', name: 'Dr. Emily Thompson', department: 'Physics', title: 'Associate Professor', courses: ['PHYS101', 'PHYS301'], acknowledgmentStatus: 'pending_review' },
  { id: 'F006', name: 'Dr. Michael Brown', department: 'Computer Science', title: 'Assistant Professor', courses: ['CS150', 'CS250'], acknowledgmentStatus: 'pending_review' },
  { id: 'F007', name: 'Dr. Lisa Anderson', department: 'Mathematics', title: 'Associate Professor', courses: ['MATH150', 'MATH250'], acknowledgmentStatus: 'pending_review' },
  { id: 'F008', name: 'Dr. David Martinez', department: 'Physics', title: 'Assistant Professor', courses: ['PHYS201'], acknowledgmentStatus: 'pending_review' },
  { id: 'F009', name: 'Dr. Jennifer Lee', department: 'Computer Science', title: 'Lecturer', courses: ['CS101'], acknowledgmentStatus: 'pending_review' },
  { id: 'F010', name: 'Dr. Thomas Wright', department: 'Mathematics', title: 'Professor', courses: ['MATH301', 'MATH401'], acknowledgmentStatus: 'pending_review' },
  { id: 'F011', name: 'Dr. Amanda Clark', department: 'Physics', title: 'Associate Professor', courses: ['PHYS101', 'PHYS201'], acknowledgmentStatus: 'pending_review' },
];

const PROGRAMS_SEED: Program[] = [
  { id: 'BSCS', name: 'BS Computer Science', department: 'Computer Science' },
  { id: 'BSMATH', name: 'BS Mathematics', department: 'Mathematics' },
  { id: 'BSPHYS', name: 'BS Physics', department: 'Physics' },
];

const SUBJECTS_SEED: Subject[] = [
  { id: 'CS101', code: 'CS101', name: 'Introduction to Programming', programId: 'BSCS', facultyId: 'F001' },
  { id: 'CS150', code: 'CS150', name: 'Digital Logic Design', programId: 'BSCS', facultyId: 'F006' },
  { id: 'CS201', code: 'CS201', name: 'Data Structures', programId: 'BSCS', facultyId: 'F001' },
  { id: 'CS250', code: 'CS250', name: 'Computer Organization', programId: 'BSCS', facultyId: 'F006' },
  { id: 'CS301', code: 'CS301', name: 'Algorithms', programId: 'BSCS', facultyId: 'F001' },
  { id: 'CS350', code: 'CS350', name: 'Software Engineering', programId: 'BSCS', facultyId: 'F002' },
  { id: 'CS401', code: 'CS401', name: 'Database Systems', programId: 'BSCS', facultyId: 'F002' },
  { id: 'MATH101', code: 'MATH101', name: 'Calculus I', programId: 'BSMATH', facultyId: 'F003' },
  { id: 'MATH150', code: 'MATH150', name: 'Discrete Mathematics', programId: 'BSMATH', facultyId: 'F007' },
  { id: 'MATH201', code: 'MATH201', name: 'Calculus II', programId: 'BSMATH', facultyId: 'F003' },
  { id: 'MATH250', code: 'MATH250', name: 'Linear Algebra', programId: 'BSMATH', facultyId: 'F007' },
  { id: 'MATH301', code: 'MATH301', name: 'Differential Equations', programId: 'BSMATH', facultyId: 'F004' },
  { id: 'MATH401', code: 'MATH401', name: 'Advanced Calculus', programId: 'BSMATH', facultyId: 'F010' },
  { id: 'PHYS101', code: 'PHYS101', name: 'General Physics I', programId: 'BSPHYS', facultyId: 'F005' },
  { id: 'PHYS201', code: 'PHYS201', name: 'Modern Physics', programId: 'BSPHYS', facultyId: 'F008' },
  { id: 'PHYS301', code: 'PHYS301', name: 'Quantum Mechanics', programId: 'BSPHYS', facultyId: 'F005' },
];

const STUDENTS_SEED: Student[] = [
  { id: 'C24-001', name: 'Alice Johnson', programId: 'BSCS', enrolledSubjects: ['CS101', 'CS201', 'MATH101'] },
  { id: 'C24-002', name: 'Bob Smith', programId: 'BSCS', enrolledSubjects: ['CS101', 'CS150', 'CS201'] },
  { id: 'C24-003', name: 'Carol Davis', programId: 'BSCS', enrolledSubjects: ['CS201', 'CS250', 'MATH201'] },
  { id: 'C24-004', name: 'David Lee', programId: 'BSCS', enrolledSubjects: ['CS301', 'CS350', 'MATH201'] },
  { id: 'C24-005', name: 'Emma Wilson', programId: 'BSCS', enrolledSubjects: ['CS101', 'CS301', 'PHYS101'] },
  { id: 'C24-006', name: 'Frank Brown', programId: 'BSCS', enrolledSubjects: ['CS401', 'MATH101', 'PHYS101'] },
  { id: 'C24-007', name: 'Grace Taylor', programId: 'BSMATH', enrolledSubjects: ['MATH150', 'MATH201', 'PHYS101'] },
  { id: 'C24-008', name: 'Henry Martinez', programId: 'BSMATH', enrolledSubjects: ['MATH201', 'MATH250', 'MATH401'] },
  { id: 'C24-009', name: 'Ivy Anderson', programId: 'BSMATH', enrolledSubjects: ['MATH101', 'MATH201', 'PHYS101'] },
  { id: 'C24-010', name: 'Jack Thomas', programId: 'BSPHYS', enrolledSubjects: ['PHYS101', 'PHYS201', 'MATH301'] },
  { id: 'C24-011', name: 'Karen White', programId: 'BSPHYS', enrolledSubjects: ['PHYS101', 'PHYS301', 'MATH201'] },
  { id: 'C24-012', name: 'Laura Palmer', programId: 'BSPHYS', enrolledSubjects: ['PHYS201', 'PHYS301', 'MATH101'] },
  { id: 'C24-013', name: 'Michael Chen', programId: 'BSCS', enrolledSubjects: ['CS101', 'CS201', 'CS301'] },
  { id: 'C24-014', name: 'Sophia Rodriguez', programId: 'BSCS', enrolledSubjects: ['CS150', 'CS250', 'MATH150'] },
  { id: 'C24-015', name: 'Daniel Kim', programId: 'BSMATH', enrolledSubjects: ['MATH101', 'MATH201', 'MATH401'] },
  { id: 'C24-016', name: 'Olivia Patel', programId: 'BSMATH', enrolledSubjects: ['MATH150', 'MATH250', 'MATH401'] },
  { id: 'C24-017', name: 'Ethan Nguyen', programId: 'BSPHYS', enrolledSubjects: ['PHYS101', 'PHYS201', 'PHYS301'] },
  { id: 'C24-018', name: 'Ava Williams', programId: 'BSCS', enrolledSubjects: ['CS201', 'CS350', 'CS401'] },
  { id: 'C24-019', name: 'Noah Garcia', programId: 'BSMATH', enrolledSubjects: ['MATH201', 'MATH301', 'MATH401'] },
  { id: 'C24-020', name: 'Isabella Lopez', programId: 'BSPHYS', enrolledSubjects: ['PHYS101', 'PHYS201', 'MATH201'] },
  { id: 'C24-021', name: 'Liam Johnson', programId: 'BSCS', enrolledSubjects: ['CS101', 'CS150', 'CS201'] },
  { id: 'C24-022', name: 'Mia Thompson', programId: 'BSMATH', enrolledSubjects: ['MATH101', 'MATH150', 'MATH201'] },
  { id: 'C24-023', name: 'James Wilson', programId: 'BSPHYS', enrolledSubjects: ['PHYS201', 'PHYS301', 'MATH301'] },
  { id: 'C24-024', name: 'Charlotte Davis', programId: 'BSCS', enrolledSubjects: ['CS250', 'CS301', 'CS350'] },
  { id: 'C24-025', name: 'Ryan Martinez', programId: 'BSCS', enrolledSubjects: ['CS101', 'CS201', 'CS301'] },
];

const DEANS_SEED: Dean[] = [
  { id: 'M001', name: 'Dr. Patricia Moore', department: 'Computer Science' },
  { id: 'M002', name: 'Dr. William Chang', department: 'Mathematics' },
  { id: 'M003', name: 'Dr. Elizabeth Brown', department: 'Physics' },
];

const CYCLES_SEED: EvaluationCycle[] = [
  { id: 'cyc-001', name: 'Spring 2026 Midterm', displayName: 'AY 2025–2026 | Second Semester', startDate: '2026-03-01', endDate: '2026-03-31', status: 'active' },
  { id: 'cyc-002', name: 'Spring 2026 Final', displayName: 'AY 2025–2026 | Second Semester Final', startDate: '2026-05-15', endDate: '2026-06-15', status: 'upcoming' },
  { id: 'cyc-003', name: 'Fall 2025 Final', displayName: 'AY 2025–2026 | First Semester', startDate: '2025-12-01', endDate: '2025-12-31', status: 'completed' },
  { id: 'cyc-004', name: 'Fall 2025 Midterm', displayName: 'AY 2025–2026 | First Semester Midterm', startDate: '2025-10-01', endDate: '2025-10-31', status: 'archived' },
];

const CRITERIA_SEED: Criterion[] = [
  { id: 'crit-teaching', name: 'Teaching Style', order: 1 },
  { id: 'crit-mastery', name: 'Mastery of Subject', order: 2 },
  { id: 'crit-punctuality', name: 'Punctuality', order: 3 },
  { id: 'crit-professionalism', name: 'Professionalism', order: 4 },
];

function createDeterministicRatings(baseRatings: Record<string, number>): Record<string, number> {
  return { ...baseRatings };
}

function generateSeedEvaluations(): Evaluation[] {
  const evals: Evaluation[] = [];
  const feedbacks = [
    'Excellent teaching style, very engaging lectures.',
    'Could improve on pacing, sometimes moves too fast.',
    'Great at explaining complex concepts clearly.',
    'Assessments are fair and well-structured.',
    'The workload is manageable and well-distributed.',
    'Very approachable during office hours.',
    'Lectures could use more real-world examples.',
    'Excellent use of visual aids in presentations.',
    'Sometimes the material feels overwhelming.',
    'Very passionate about the subject matter.',
  ];

  const facultyEvals = [
    { id: 'F001', count: 14, base: { 'sq-teaching-1': 5, 'sq-teaching-2': 5, 'sq-teaching-3': 5, 'sq-mastery-1': 5, 'sq-mastery-2': 5, 'sq-mastery-3': 4, 'sq-punctuality-1': 5, 'sq-punctuality-2': 5, 'sq-punctuality-3': 5, 'sq-professionalism-1': 5, 'sq-professionalism-2': 5, 'sq-professionalism-3': 5 } },
    { id: 'F002', count: 12, base: { 'sq-teaching-1': 4, 'sq-teaching-2': 4, 'sq-teaching-3': 4, 'sq-mastery-1': 4, 'sq-mastery-2': 4, 'sq-mastery-3': 4, 'sq-punctuality-1': 2, 'sq-punctuality-2': 2, 'sq-punctuality-3': 3, 'sq-professionalism-1': 3, 'sq-professionalism-2': 3, 'sq-professionalism-3': 3 } },
    { id: 'F003', count: 11, base: { 'sq-teaching-1': 2, 'sq-teaching-2': 2, 'sq-teaching-3': 1, 'sq-mastery-1': 3, 'sq-mastery-2': 3, 'sq-mastery-3': 2, 'sq-punctuality-1': 2, 'sq-punctuality-2': 3, 'sq-punctuality-3': 2, 'sq-professionalism-1': 1, 'sq-professionalism-2': 2, 'sq-professionalism-3': 1 } },
    { id: 'F004', count: 10, base: { 'sq-teaching-1': 4, 'sq-teaching-2': 5, 'sq-teaching-3': 4, 'sq-mastery-1': 5, 'sq-mastery-2': 4, 'sq-mastery-3': 5, 'sq-punctuality-1': 4, 'sq-punctuality-2': 4, 'sq-punctuality-3': 5, 'sq-professionalism-1': 4, 'sq-professionalism-2': 4, 'sq-professionalism-3': 4 } },
    { id: 'F005', count: 10, base: { 'sq-teaching-1': 4, 'sq-teaching-2': 3, 'sq-teaching-3': 4, 'sq-mastery-1': 3, 'sq-mastery-2': 3, 'sq-mastery-3': 3, 'sq-punctuality-1': 3, 'sq-punctuality-2': 3, 'sq-punctuality-3': 3, 'sq-professionalism-1': 2, 'sq-professionalism-2': 2, 'sq-professionalism-3': 1 } },
    { id: 'F006', count: 13, base: { 'sq-teaching-1': 4, 'sq-teaching-2': 4, 'sq-teaching-3': 4, 'sq-mastery-1': 4, 'sq-mastery-2': 4, 'sq-mastery-3': 4, 'sq-punctuality-1': 4, 'sq-punctuality-2': 4, 'sq-punctuality-3': 4, 'sq-professionalism-1': 4, 'sq-professionalism-2': 4, 'sq-professionalism-3': 4 } },
    { id: 'F007', count: 11, base: { 'sq-teaching-1': 4, 'sq-teaching-2': 3, 'sq-teaching-3': 4, 'sq-mastery-1': 3, 'sq-mastery-2': 4, 'sq-mastery-3': 3, 'sq-punctuality-1': 3, 'sq-punctuality-2': 4, 'sq-punctuality-3': 3, 'sq-professionalism-1': 4, 'sq-professionalism-2': 3, 'sq-professionalism-3': 4 } },
    { id: 'F008', count: 10, base: { 'sq-teaching-1': 4, 'sq-teaching-2': 4, 'sq-teaching-3': 3, 'sq-mastery-1': 4, 'sq-mastery-2': 4, 'sq-mastery-3': 4, 'sq-punctuality-1': 4, 'sq-punctuality-2': 3, 'sq-punctuality-3': 4, 'sq-professionalism-1': 4, 'sq-professionalism-2': 4, 'sq-professionalism-3': 4 } },
    { id: 'F009', count: 12, base: { 'sq-teaching-1': 5, 'sq-teaching-2': 5, 'sq-teaching-3': 5, 'sq-mastery-1': 5, 'sq-mastery-2': 4, 'sq-mastery-3': 5, 'sq-punctuality-1': 5, 'sq-punctuality-2': 5, 'sq-punctuality-3': 4, 'sq-professionalism-1': 5, 'sq-professionalism-2': 5, 'sq-professionalism-3': 5 } },
    { id: 'F010', count: 11, base: { 'sq-teaching-1': 4, 'sq-teaching-2': 3, 'sq-teaching-3': 4, 'sq-mastery-1': 4, 'sq-mastery-2': 4, 'sq-mastery-3': 3, 'sq-punctuality-1': 3, 'sq-punctuality-2': 4, 'sq-punctuality-3': 3, 'sq-professionalism-1': 4, 'sq-professionalism-2': 4, 'sq-professionalism-3': 4 } },
    { id: 'F011', count: 13, base: { 'sq-teaching-1': 5, 'sq-teaching-2': 4, 'sq-teaching-3': 5, 'sq-mastery-1': 5, 'sq-mastery-2': 5, 'sq-mastery-3': 4, 'sq-punctuality-1': 4, 'sq-punctuality-2': 5, 'sq-punctuality-3': 4, 'sq-professionalism-1': 5, 'sq-professionalism-2': 4, 'sq-professionalism-3': 5 } },
  ];

  facultyEvals.forEach(({ id, count, base }) => {
    const faculty = FACULTY_SEED.find(f => f.id === id);
    if (!faculty) return;
    
    // Get all students enrolled in this faculty's courses
    const enrolledStudents = STUDENTS_SEED.filter(student => 
      student.enrolledSubjects.some(subjectId => faculty.courses.includes(subjectId))
    );
    
    for (let i = 0; i < count; i++) {
      const ratings = createDeterministicRatings(base);
      const courseId = faculty.courses[i % faculty.courses.length];
      
      // Find a student enrolled in this specific course
      const studentForCourse = enrolledStudents.filter(s => s.enrolledSubjects.includes(courseId));
      const selectedStudent = studentForCourse.length > 0 
        ? studentForCourse[i % studentForCourse.length]
        : enrolledStudents[i % enrolledStudents.length];
      
      evals.push({
        id: uuidv4(),
        facultyId: id,
        courseId: courseId,
        cycleId: 'cyc-001',
        ratings,
        feedback: feedbacks[i % feedbacks.length],
        submittedAt: new Date(2026, 2, 5 + i).toISOString(),
        studentId: selectedStudent?.id,
      });
    }
  });

  return evals;
}

class DataStore {
  private faculty: Faculty[] = JSON.parse(JSON.stringify(FACULTY_SEED));
  private students: Student[] = [...STUDENTS_SEED];
  private deans: Dean[] = [...DEANS_SEED];
  private cycles: EvaluationCycle[] = JSON.parse(JSON.stringify(CYCLES_SEED));
  private criteria: Criterion[] = [...CRITERIA_SEED];
  private subQuestions: SubQuestion[] = [...SUB_QUESTIONS];
  private programs: Program[] = [...PROGRAMS_SEED];
  private subjects: Subject[] = [...SUBJECTS_SEED];
  private evaluations: Evaluation[] = generateSeedEvaluations();
  private auditLog: AuditLogEntry[] = [];
  private rateLimits: Map<string, RateLimitEntry> = new Map();
  private listeners: Map<EventType, Set<() => void>> = new Map();
  private studentSessionEvals: Map<string, Set<string>> = new Map();
  private trainingRecommendations: TrainingRecommendation[] = [];
  private disputes: Dispute[] = [];
  private users: User[] = [
    { id: 'admin', username: 'admin', password: 'admin', role: 'admin', displayName: 'System Administrator' },
    { id: 'test_admin', username: 'test_admin', password: 'test123', role: 'admin', displayName: 'TEST Administrator' },
    { id: 'faculty', username: 'faculty', password: 'faculty', role: 'faculty', displayName: 'Dr. Sarah Chen', facultyId: 'F001', department: 'Computer Science' },
    { id: 'faculty2', username: 'faculty2', password: 'faculty2', role: 'faculty', displayName: 'Dr. Jennifer Lee', facultyId: 'F009', department: 'Computer Science' },
    { id: 'faculty3', username: 'faculty3', password: 'faculty3', role: 'faculty', displayName: 'Dr. Thomas Wright', facultyId: 'F010', department: 'Mathematics' },
    { id: 'faculty4', username: 'faculty4', password: 'faculty4', role: 'faculty', displayName: 'Dr. Amanda Clark', facultyId: 'F011', department: 'Physics' },
    { id: 'test_faculty', username: 'test_faculty', password: 'test123', role: 'faculty', displayName: 'TEST Faculty', facultyId: 'F001', department: 'Computer Science' },
    { id: 'dean_cs', username: 'M001', password: 'dean123', role: 'dean', displayName: 'Dr. Patricia Moore', department: 'Computer Science' },
    { id: 'dean_math', username: 'M002', password: 'dean123', role: 'dean', displayName: 'Dr. William Chang', department: 'Mathematics' },
    { id: 'dean_phys', username: 'M003', password: 'dean123', role: 'dean', displayName: 'Dr. Elizabeth Brown', department: 'Physics' },
    { id: 'test_dean', username: 'test_dean', password: 'test123', role: 'dean', displayName: 'TEST Dean', department: 'Computer Science' },
    ...STUDENTS_SEED.map(s => ({ id: s.id, username: s.id, password: 'pass123', role: 'student' as const, displayName: s.name })),
    { id: 'test_student', username: 'test_student', password: 'test123', role: 'student', displayName: 'TEST Student' },
    { id: 'dev', username: 'dev', password: '123dev', role: 'admin', displayName: 'Developer' },
  ];

  constructor() {
    const persistedData = loadFromLocalStorage();
    if (persistedData) {
      this.faculty = persistedData.faculty || this.faculty;
      this.students = persistedData.students || this.students;
      this.deans = persistedData.deans || this.deans;
      this.cycles = persistedData.cycles || this.cycles;
      this.criteria = persistedData.criteria || this.criteria;
      this.subQuestions = persistedData.subQuestions || this.subQuestions;
      this.evaluations = persistedData.evaluations || this.evaluations;
      this.auditLog = persistedData.auditLog || this.auditLog;
      this.trainingRecommendations = persistedData.trainingRecommendations || this.trainingRecommendations;
      this.disputes = persistedData.disputes || this.disputes;
      this.addAuditLog('system', 'data_restored', 'DataStore', 'Data restored from localStorage');
    } else {
      this.addAuditLog('system', 'system_init', 'DataStore', `System initialized — Faculty: ${FACULTY_SEED.length}, Students: ${STUDENTS_SEED.length}, Deans: ${DEANS_SEED.length}, Cycles: ${CYCLES_SEED.length}, Criteria: ${CRITERIA_SEED.length}, Sub-Questions: ${SUB_QUESTIONS.length}, Seed Evaluations: ${this.evaluations.length}`);
    }
  }

  private async simulateLatency(): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, 300 + Math.random() * 200));
  }

  private persistData(): void {
    saveToLocalStorage({
      faculty: this.faculty,
      students: this.students,
      deans: this.deans,
      cycles: this.cycles,
      criteria: this.criteria,
      subQuestions: this.subQuestions,
      evaluations: this.evaluations,
      auditLog: this.auditLog,
      trainingRecommendations: this.trainingRecommendations,
      disputes: this.disputes,
    });
  }

  subscribe(event: EventType, callback: () => void): () => void {
    if (!this.listeners.has(event)) this.listeners.set(event, new Set());
    this.listeners.get(event)!.add(callback);
    return () => this.listeners.get(event)?.delete(callback);
  }

  emit(event: EventType): void {
    this.listeners.get(event)?.forEach(cb => cb());
  }

  async authenticate(username: string, password: string): Promise<User | null> {
    await this.simulateLatency();
    const user = this.users.find(u => u.username === username && u.password === password);
    if (user) this.addAuditLog(`user:${user.role}:${user.id}`, 'login', user.displayName, `Role: ${user.role}`);
    else this.addAuditLog('user:unknown', 'login_failed', username, `Failed login attempt`);
    return user || null;
  }

  checkRateLimit(studentId: string): boolean {
    const now = Date.now();
    const entry = this.rateLimits.get(studentId);
    if (!entry || now - entry.windowStart > 60000) { this.rateLimits.set(studentId, { count: 1, windowStart: now }); return true; }
    if (entry.count >= 100) return false;
    entry.count++;
    return true;
  }

  getFaculty(): Faculty[] { return JSON.parse(JSON.stringify(this.faculty)); }
  getFacultyById(id: string): Faculty | undefined { return this.faculty.find(f => f.id === id); }
  getFacultyByDepartment(dept: string): Faculty[] { return this.faculty.filter(f => f.department === dept); }
  getFacultyCourses(facultyId: string): string[] {
    const faculty = this.faculty.find(f => f.id === facultyId);
    return faculty ? [...faculty.courses] : [];
  }

  async acknowledgeFaculty(facultyId: string, verifiedBy: string, signature?: string): Promise<void> {
    await this.simulateLatency();
    const f = this.faculty.find(fc => fc.id === facultyId);
    if (f) { 
      f.acknowledgmentStatus = 'acknowledged'; 
      f.acknowledgedAt = new Date().toISOString(); 
      f.acknowledgedBy = verifiedBy;
      if (signature) f.signature = signature;
    }
    this.addAuditLog(`faculty:${facultyId}`, 'acknowledgment', facultyId, `Faculty acknowledged report with e-signature. Verified by: ${verifiedBy}`);
    this.persistData();
    this.emit('acknowledgment_changed');
  }

  getDisputes(): Dispute[] { return [...this.disputes]; }
  getPendingDisputes(): Dispute[] { return this.disputes.filter(d => d.status === 'pending'); }

  async submitDispute(facultyId: string, cycleId: string, justification: string): Promise<Dispute> {
    await this.simulateLatency();
    const faculty = this.getFacultyById(facultyId);
    if (!faculty) throw new Error('Faculty not found');
    const dispute: Dispute = {
      id: uuidv4(),
      facultyId,
      cycleId,
      submittedAt: new Date().toISOString(),
      justification,
      status: 'pending',
    };
    this.disputes.push(dispute);
    faculty.acknowledgmentStatus = 'disputed';
    faculty.disputeId = dispute.id;
    this.addAuditLog(`faculty:${facultyId}`, 'dispute_submitted', facultyId, `Dispute submitted`);
    this.persistData();
    this.emit('dispute_submitted');
    this.emit('acknowledgment_changed');
    return dispute;
  }

  async resolveDispute(disputeId: string, resolvedBy: string, resolution: string): Promise<void> {
    await this.simulateLatency();
    const dispute = this.disputes.find(d => d.id === disputeId);
    if (!dispute) throw new Error('Dispute not found');
    dispute.status = 'resolved';
    dispute.resolvedAt = new Date().toISOString();
    dispute.resolvedBy = resolvedBy;
    dispute.resolution = resolution;
    const faculty = this.getFacultyById(dispute.facultyId);
    if (faculty) {
      faculty.acknowledgmentStatus = 'pending_acknowledgment';
      faculty.disputeId = undefined;
    }
    this.addAuditLog(`admin:${resolvedBy}`, 'dispute_resolved', disputeId, `Dispute resolved`);
    this.persistData();
    this.emit('dispute_resolved');
    this.emit('acknowledgment_changed');
  }

  async dismissDispute(disputeId: string, resolvedBy: string, reason: string): Promise<void> {
    await this.simulateLatency();
    const dispute = this.disputes.find(d => d.id === disputeId);
    if (!dispute) throw new Error('Dispute not found');
    dispute.status = 'dismissed';
    dispute.resolvedAt = new Date().toISOString();
    dispute.resolvedBy = resolvedBy;
    dispute.resolution = `Dismissed: ${reason}`;
    const faculty = this.getFacultyById(dispute.facultyId);
    if (faculty) {
      faculty.acknowledgmentStatus = 'pending_acknowledgment';
      faculty.disputeId = undefined;
    }
    this.addAuditLog(`admin:${resolvedBy}`, 'dispute_dismissed', disputeId, `Dispute dismissed`);
    this.persistData();
    this.emit('dispute_resolved');
    this.emit('acknowledgment_changed');
  }

  async sendReminder(facultyId: string): Promise<void> {
    await this.simulateLatency();
    const faculty = this.getFacultyById(facultyId);
    if (!faculty) throw new Error('Faculty not found');
    faculty.lastReminderSent = new Date().toISOString();
    this.addAuditLog('admin', 'reminder_sent', facultyId, `Reminder sent to ${faculty.name}`);
    this.persistData();
    this.emit('acknowledgment_changed');
  }

  getTrainingRecommendations(): TrainingRecommendation[] { return [...this.trainingRecommendations]; }
  getTrainingRecommendationForFaculty(facultyId: string, cycleId?: string): TrainingRecommendation | undefined {
    return this.trainingRecommendations.find(r => r.facultyId === facultyId && r.cycleId === (cycleId || this.getActiveCycle()?.id));
  }

  async generateTrainingRecommendation(facultyId: string, cycleId?: string): Promise<TrainingRecommendation> {
    await this.simulateLatency();
    const faculty = this.getFacultyById(facultyId);
    if (!faculty) throw new Error('Faculty not found');
    const effectiveCycleId = cycleId || this.getActiveCycle()?.id || '';
    const metrics = this.getFacultyMetrics(facultyId, effectiveCycleId);
    const criteria = this.getCriteria();
    const lowCriteria = criteria.map(c => ({ name: c.name, avg: metrics.criteriaAverages[c.id] || 0 })).filter(c => c.avg < BENCHMARK && c.avg > 0);
    const recommendation = lowCriteria.length > 0
      ? `Based on evaluation data, the following areas scored below the ${BENCHMARK}/5.0 benchmark:\n\n${lowCriteria.map(c => `- ${c.name}: ${c.avg.toFixed(2)}/5.0`).join('\n')}\n\nRecommended actions:\n- Schedule a meeting with department head\n- Consider peer observation sessions\n- Review teaching materials and methods`
      : 'No areas below benchmark identified. Continue current teaching practices.';
    this.trainingRecommendations = this.trainingRecommendations.filter(r => !(r.facultyId === facultyId && r.cycleId === effectiveCycleId));
    const newRec: TrainingRecommendation = { id: uuidv4(), facultyId, cycleId: effectiveCycleId, recommendation, generatedAt: new Date().toISOString(), editedByAdmin: false };
    this.trainingRecommendations.push(newRec);
    this.addAuditLog('admin:ai', 'tna_generated', facultyId, `TNA generated for ${faculty.name}`);
    this.persistData();
    this.emit('training_changed');
    return newRec;
  }

  async updateTrainingRecommendation(recId: string, newRec: string): Promise<void> {
    await this.simulateLatency();
    const rec = this.trainingRecommendations.find(r => r.id === recId);
    if (rec) { rec.recommendation = newRec; rec.editedByAdmin = true; this.persistData(); this.emit('training_changed'); }
  }

  async deleteTrainingRecommendation(recId: string): Promise<void> {
    await this.simulateLatency();
    this.trainingRecommendations = this.trainingRecommendations.filter(r => r.id !== recId);
    this.persistData();
    this.emit('training_changed');
  }

  getCycles(): EvaluationCycle[] { return JSON.parse(JSON.stringify(this.cycles)); }
  getActiveCycle(): EvaluationCycle | undefined { return this.cycles.find(c => c.status === 'active'); }

  async addCycle(cycle: Omit<EvaluationCycle, 'id'>): Promise<EvaluationCycle> {
    await this.simulateLatency();
    const newCycle = { ...cycle, id: `cyc-${uuidv4().slice(0, 8)}` };
    this.cycles.push(newCycle);
    this.addAuditLog('admin', 'cycle_created', newCycle.id, `Created "${newCycle.displayName}"`);
    this.persistData();
    this.emit('cycle_changed');
    return newCycle;
  }

  async activateCycle(cycleId: string): Promise<void> {
    await this.simulateLatency();
    this.cycles.forEach(c => { if (c.status === 'active') c.status = 'archived'; });
    const cycle = this.cycles.find(c => c.id === cycleId);
    if (cycle) cycle.status = 'active';
    this.addAuditLog('admin', 'cycle_activated', cycleId, `Activated "${cycle?.displayName}"`);
    this.persistData();
    this.emit('cycle_changed');
  }

  async archiveCycle(cycleId: string): Promise<void> {
    await this.simulateLatency();
    const cycle = this.cycles.find(c => c.id === cycleId);
    if (cycle) cycle.status = 'archived';
    this.addAuditLog('admin', 'cycle_archived', cycleId, `Archived "${cycle?.displayName}"`);
    this.persistData();
    this.emit('cycle_changed');
  }

  async unarchiveCycle(cycleId: string): Promise<void> {
    await this.simulateLatency();
    const cycle = this.cycles.find(c => c.id === cycleId);
    if (cycle) cycle.status = 'completed';
    this.addAuditLog('admin', 'cycle_unarchived', cycleId, `Unarchived "${cycle?.displayName}" to completed status`);
    this.persistData();
    this.emit('cycle_changed');
  }

  async removeCycle(cycleId: string): Promise<void> {
    await this.simulateLatency();
    const cycle = this.cycles.find(c => c.id === cycleId);
    this.cycles = this.cycles.filter(c => c.id !== cycleId);
    this.addAuditLog('admin', 'cycle_removed', cycleId, `Removed "${cycle?.name}"`);
    this.persistData();
    this.emit('cycle_changed');
  }

  // Three-Tier Release Pipeline Methods
  async adminReleaseCycle(cycleId: string, adminId: string, signature: string): Promise<void> {
    await this.simulateLatency();
    const cycle = this.cycles.find(c => c.id === cycleId);
    if (!cycle) throw new Error('Cycle not found');
    cycle.adminRelease = {
      released: true,
      signature,
      releasedAt: new Date().toISOString(),
      releasedBy: adminId,
    };
    this.addAuditLog(`admin:${adminId}`, 'admin_release', cycleId, `Admin released cycle "${cycle.displayName}" with e-signature`);
    this.persistData();
    this.emit('cycle_changed');
  }

  async deanReleaseCycle(cycleId: string, department: string, deanId: string, signature: string): Promise<void> {
    await this.simulateLatency();
    const cycle = this.cycles.find(c => c.id === cycleId);
    if (!cycle) throw new Error('Cycle not found');
    if (!cycle.deanReleases) cycle.deanReleases = {};
    cycle.deanReleases[department] = {
      released: true,
      signature,
      releasedAt: new Date().toISOString(),
      releasedBy: deanId,
    };
    this.addAuditLog(`dean:${deanId}`, 'dean_release', cycleId, `Dean released department "${department}" for cycle "${cycle.displayName}"`);
    this.persistData();
    this.emit('cycle_changed');
  }

  isCycleAdminReleased(cycleId?: string): boolean {
    const cycle = this.cycles.find(c => c.id === (cycleId || this.getActiveCycle()?.id));
    return cycle?.adminRelease?.released === true;
  }

  isCycleDeanReleased(cycleId: string | undefined, department: string): boolean {
    const cycle = this.cycles.find(c => c.id === (cycleId || this.getActiveCycle()?.id));
    return cycle?.deanReleases?.[department]?.released === true;
  }

  getCycleAdminRelease(cycleId?: string): AdminRelease | undefined {
    const cycle = this.cycles.find(c => c.id === (cycleId || this.getActiveCycle()?.id));
    return cycle?.adminRelease;
  }

  getCycleDeanRelease(cycleId: string | undefined, department: string): DeanRelease | undefined {
    const cycle = this.cycles.find(c => c.id === (cycleId || this.getActiveCycle()?.id));
    return cycle?.deanReleases?.[department];
  }

  getCriteria(): Criterion[] { return [...this.criteria].sort((a, b) => a.order - b.order); }
  getSubQuestions(): SubQuestion[] { return [...this.subQuestions].sort((a, b) => a.order - b.order); }
  getSubQuestionsForCriterion(criterionId: string): SubQuestion[] { return this.subQuestions.filter(sq => sq.criterionId === criterionId).sort((a, b) => a.order - b.order); }

  async addCriterion(name: string): Promise<Criterion> {
    await this.simulateLatency();
    const newCrit = { id: `crit-${uuidv4().slice(0, 8)}`, name, order: this.criteria.length + 1 };
    this.criteria.push(newCrit);
    this.addAuditLog('admin', 'criterion_added', newCrit.id, `Added "${name}"`);
    this.persistData();
    this.emit('criteria_changed');
    return newCrit;
  }

  async removeCriterion(criterionId: string): Promise<void> {
    await this.simulateLatency();
    const crit = this.criteria.find(c => c.id === criterionId);
    const sqCount = this.subQuestions.filter(sq => sq.criterionId === criterionId).length;
    this.criteria = this.criteria.filter(c => c.id !== criterionId);
    this.subQuestions = this.subQuestions.filter(sq => sq.criterionId !== criterionId);
    this.criteria.forEach((c, i) => c.order = i + 1);
    this.addAuditLog('admin', 'criterion_removed', criterionId, `Removed "${crit?.name}" and ${sqCount} sub-questions`);
    this.persistData();
    this.emit('criteria_changed');
  }

  async addSubQuestion(criterionId: string, text: string): Promise<SubQuestion> {
    await this.simulateLatency();
    const existing = this.subQuestions.filter(sq => sq.criterionId === criterionId);
    const newSQ: SubQuestion = { id: `sq-${uuidv4().slice(0, 8)}`, criterionId, text, order: existing.length + 1 };
    this.subQuestions.push(newSQ);
    const crit = this.criteria.find(c => c.id === criterionId);
    this.addAuditLog('admin', 'subquestion_added', newSQ.id, `Added to "${crit?.name}": "${text}"`);
    this.persistData();
    this.emit('criteria_changed');
    return newSQ;
  }

  async removeSubQuestion(sqId: string): Promise<void> {
    await this.simulateLatency();
    const sq = this.subQuestions.find(s => s.id === sqId);
    if (!sq) return;
    const crit = this.criteria.find(c => c.id === sq.criterionId);
    this.subQuestions = this.subQuestions.filter(s => s.id !== sqId);
    this.subQuestions.filter(s => s.criterionId === sq.criterionId).sort((a, b) => a.order - b.order).forEach((s, i) => s.order = i + 1);
    this.addAuditLog('admin', 'subquestion_removed', sqId, `Removed from "${crit?.name}": "${sq.text}"`);
    this.persistData();
    this.emit('criteria_changed');
  }

  async updateSubQuestion(sqId: string, newText: string): Promise<void> {
    await this.simulateLatency();
    const sq = this.subQuestions.find(s => s.id === sqId);
    if (!sq) return;
    const oldText = sq.text;
    const crit = this.criteria.find(c => c.id === sq.criterionId);
    sq.text = newText;
    this.addAuditLog('admin', 'subquestion_edited', sqId, `Edited in "${crit?.name}": "${oldText}" → "${newText}"`);
    this.persistData();
    this.emit('criteria_changed');
  }

  getPrograms(): Program[] { return [...this.programs]; }
  getSubjects(): Subject[] { return [...this.subjects]; }
  getSubjectsByProgram(programId: string): Subject[] { return this.subjects.filter(s => s.programId === programId); }
  getSubjectById(subjectId: string): Subject | undefined { return this.subjects.find(s => s.id === subjectId); }
  getFacultyBySubject(subjectId: string): Faculty | undefined {
    const subject = this.getSubjectById(subjectId);
    if (!subject) return undefined;
    return this.faculty.find(f => f.id === subject.facultyId);
  }

  isSubjectEvaluatedByStudent(studentId: string, subjectId: string): boolean {
    return this.studentSessionEvals.get(studentId)?.has(subjectId) || false;
  }

  getAvailableSubjectsForStudent(studentId: string): Subject[] {
    const student = this.students.find(s => s.id === studentId);
    if (!student) return [];
    return student.enrolledSubjects
      .filter(subjectId => !this.isSubjectEvaluatedByStudent(studentId, subjectId))
      .map(subjectId => this.getSubjectById(subjectId))
      .filter((s): s is Subject => s !== undefined);
  }

  async submitEvaluation(evalData: Omit<Evaluation, 'id' | 'submittedAt'>, studentId?: string): Promise<Evaluation> {
    await this.simulateLatency();
    const evaluation: Evaluation = { ...evalData, id: uuidv4(), submittedAt: new Date().toISOString(), studentId: studentId || undefined };
    this.evaluations.push(evaluation);
    if (studentId) {
      if (!this.studentSessionEvals.has(studentId)) this.studentSessionEvals.set(studentId, new Set());
      this.studentSessionEvals.get(studentId)!.add(evalData.courseId);
    }
    const fac = this.faculty.find(f => f.id === evalData.facultyId);
    if (fac && fac.acknowledgmentStatus === 'acknowledged') { fac.acknowledgmentStatus = 'pending_acknowledgment'; this.emit('acknowledgment_changed'); }
    const vals = Object.values(evalData.ratings);
    const avg = vals.length > 0 ? vals.reduce((a, b) => a + b, 0) / vals.length : 0;
    this.addAuditLog('student:anonymous', 'submission', evalData.facultyId, `Faculty: "${fac?.name}", Course: ${evalData.courseId}, Avg: ${avg.toFixed(2)}/5`);
    this.persistData();
    this.emit('submission_added');
    return evaluation;
  }

  getEvaluations(): Evaluation[] { return [...this.evaluations]; }
  getEvaluationsForFaculty(facultyId: string, cycleId?: string, courseId?: string): Evaluation[] {
    return this.evaluations.filter(e => e.facultyId === facultyId && (!cycleId || e.cycleId === cycleId) && (!courseId || e.courseId === courseId));
  }
  getEvaluationsForDepartment(dept: string, cycleId?: string): Evaluation[] {
    const facultyIds = this.faculty.filter(f => f.department === dept).map(f => f.id);
    return this.evaluations.filter(e => facultyIds.includes(e.facultyId) && (!cycleId || e.cycleId === cycleId));
  }

  getFacultyMetrics(facultyId: string, cycleId?: string, courseId?: string): FacultyMetrics {
    const evals = this.getEvaluationsForFaculty(facultyId, cycleId, courseId);
    const criteria = this.getCriteria();
    const subQuestions = this.getSubQuestions();
    const sqTotals: Record<string, { total: number; count: number }> = {};
    const scoreDistribution = Array(5).fill(0);
    const courseBreakdown: Record<string, { count: number; total: number }> = {};

    evals.forEach(ev => {
      let evalTotal = 0, evalCount = 0;
      Object.entries(ev.ratings).forEach(([sqId, rating]) => {
        if (!sqTotals[sqId]) sqTotals[sqId] = { total: 0, count: 0 };
        sqTotals[sqId].total += rating;
        sqTotals[sqId].count++;
        if (rating >= 1 && rating <= 5) scoreDistribution[rating - 1]++;
        evalTotal += rating;
        evalCount++;
      });
      if (!courseBreakdown[ev.courseId]) courseBreakdown[ev.courseId] = { count: 0, total: 0 };
      const avg = evalCount > 0 ? evalTotal / evalCount : 0;
      courseBreakdown[ev.courseId].count++;
      courseBreakdown[ev.courseId].total += avg;
    });

    const sqAvgs: Record<string, number> = {};
    subQuestions.forEach(sq => { const d = sqTotals[sq.id]; sqAvgs[sq.id] = d && d.count > 0 ? d.total / d.count : 0; });
    const critAvgs: Record<string, number> = {};
    criteria.forEach(c => {
      const critSQs = subQuestions.filter(sq => sq.criterionId === c.id);
      if (critSQs.length === 0) { critAvgs[c.id] = 0; return; }
      critAvgs[c.id] = critSQs.reduce((sum, sq) => sum + (sqAvgs[sq.id] || 0), 0) / critSQs.length;
    });

    const overallAvg = evals.length > 0 ? evals.reduce((sum, ev) => { const vals = Object.values(ev.ratings); return sum + vals.reduce((a, b) => a + b, 0) / vals.length; }, 0) / evals.length : 0;
    const cb: Record<string, { count: number; average: number }> = {};
    Object.entries(courseBreakdown).forEach(([course, data]) => { cb[course] = { count: data.count, average: data.count > 0 ? data.total / data.count : 0 }; });

    return { totalSubmissions: evals.length, overallAverage: overallAvg, criteriaAverages: critAvgs, subQuestionAverages: sqAvgs, scoreDistribution, feedback: evals.map(e => ({ feedback: e.feedback, courseId: e.courseId, submittedAt: e.submittedAt })), courseBreakdown: cb };
  }

  getDepartmentMetrics(dept: string, cycleId?: string) {
    const evals = this.getEvaluationsForDepartment(dept, cycleId);
    const facultyInDept = this.getFacultyByDepartment(dept);
    const criteria = this.getCriteria();
    const subQuestions = this.getSubQuestions();
    const sqTotals: Record<string, { total: number; count: number }> = {};
    let totalScore = 0, totalRatings = 0;
    evals.forEach(ev => {
      Object.entries(ev.ratings).forEach(([sqId, rating]) => {
        if (!sqTotals[sqId]) sqTotals[sqId] = { total: 0, count: 0 };
        sqTotals[sqId].total += rating;
        sqTotals[sqId].count++;
        totalScore += rating;
        totalRatings++;
      });
    });
    const sqAvgs: Record<string, number> = {};
    subQuestions.forEach(sq => { const d = sqTotals[sq.id]; sqAvgs[sq.id] = d && d.count > 0 ? d.total / d.count : 0; });
    const criteriaAverages: Record<string, number> = {};
    criteria.forEach(c => {
      const critSQs = subQuestions.filter(sq => sq.criterionId === c.id);
      if (critSQs.length === 0) { criteriaAverages[c.id] = 0; return; }
      criteriaAverages[c.id] = critSQs.reduce((s, sq) => s + (sqAvgs[sq.id] || 0), 0) / critSQs.length;
    });
    return { totalSubmissions: evals.length, institutionAverage: totalRatings > 0 ? totalScore / totalRatings : 0, totalFaculty: facultyInDept.length, criteriaAverages, facultyCompletion: facultyInDept.map(f => ({ faculty: f, submissions: evals.filter(e => e.facultyId === f.id).length, acknowledgmentStatus: f.acknowledgmentStatus })) };
  }

  private addAuditLog(actor: string, action: string, target: string, details?: string): void {
    this.auditLog.push({ id: uuidv4(), timestamp: new Date().toISOString(), actor, action, target, details });
  }

  getAuditLog(): AuditLogEntry[] { return [...this.auditLog].reverse(); }
  getStudents(): Student[] { return [...this.students]; }
  getStudentById(id: string): Student | undefined { return this.students.find(s => s.id === id); }
  getDeans(): Dean[] { return [...this.deans]; }

  async createFacultyAccount(name: string, department: string, title: string, courses: string[], username: string, password: string): Promise<{ success: boolean; message: string; facultyId?: string }> {
    await this.simulateLatency();
    if (this.users.find(u => u.username === username)) return { success: false, message: 'Username already exists' };
    const facultyId = `F${String(this.faculty.length + 1).padStart(3, '0')}`;
    const newFaculty: Faculty = { id: facultyId, name, department, title, courses, acknowledgmentStatus: 'pending_review' };
    this.faculty.push(newFaculty);
    const newUser: User = { id: username, username, password, role: 'faculty', displayName: name, facultyId, department };
    this.users.push(newUser);
    this.addAuditLog('admin', 'faculty_created', facultyId, `Created faculty account: ${name} (${username})`);
    this.persistData();
    this.emit('data_refresh');
    return { success: true, message: 'Faculty account created successfully', facultyId };
  }

  async createStudentAccount(name: string, studentId: string, programId: string, enrolledSubjects: string[], username: string, password: string): Promise<{ success: boolean; message: string }> {
    await this.simulateLatency();
    if (this.users.find(u => u.username === username)) return { success: false, message: 'Username already exists' };
    if (this.students.find(s => s.id === studentId)) return { success: false, message: 'Student ID already exists' };
    const newStudent: Student = { id: studentId, name, programId, enrolledSubjects };
    this.students.push(newStudent);
    const newUser: User = { id: username, username, password, role: 'student', displayName: name };
    this.users.push(newUser);
    this.addAuditLog('admin', 'student_created', studentId, `Created student account: ${name} (${username})`);
    this.persistData();
    this.emit('data_refresh');
    return { success: true, message: 'Student account created successfully' };
  }

  async createDeanAccount(name: string, department: string, username: string, password: string): Promise<{ success: boolean; message: string; deanId?: string }> {
    await this.simulateLatency();
    if (this.users.find(u => u.username === username)) return { success: false, message: 'Username already exists' };
    const deanId = `M${String(this.deans.length + 1).padStart(3, '0')}`;
    const newDean: Dean = { id: deanId, name, department };
    this.deans.push(newDean);
    const newUser: User = { id: username, username, password, role: 'dean', displayName: name, department };
    this.users.push(newUser);
    this.addAuditLog('admin', 'dean_created', deanId, `Created dean account: ${name} (${username})`);
    this.persistData();
    this.emit('data_refresh');
    return { success: true, message: 'Dean account created successfully', deanId };
  }

  async createAdminAccount(name: string, username: string, password: string): Promise<{ success: boolean; message: string }> {
    await this.simulateLatency();
    if (this.users.find(u => u.username === username)) return { success: false, message: 'Username already exists' };
    const newUser: User = { id: username, username, password, role: 'admin', displayName: name };
    this.users.push(newUser);
    this.addAuditLog('admin', 'admin_created', username, `Created admin account: ${name} (${username})`);
    this.persistData();
    this.emit('data_refresh');
    return { success: true, message: 'Admin account created successfully' };
  }

  resetData(): void {
    this.faculty = JSON.parse(JSON.stringify(FACULTY_SEED));
    this.students = [...STUDENTS_SEED];
    this.deans = [...DEANS_SEED];
    this.cycles = JSON.parse(JSON.stringify(CYCLES_SEED));
    this.criteria = [...CRITERIA_SEED];
    this.subQuestions = [...SUB_QUESTIONS];
    this.programs = [...PROGRAMS_SEED];
    this.subjects = [...SUBJECTS_SEED];
    this.evaluations = generateSeedEvaluations();
    this.auditLog = [];
    this.trainingRecommendations = [];
    this.disputes = [];
    this.studentSessionEvals.clear();
    this.addAuditLog('admin', 'data_reset', 'DataStore', 'All data reset to seed values');
    this.persistData();
    this.emit('data_refresh');
  }

  exportAllData(): any {
    return {
      faculty: this.faculty, students: this.students, deans: this.deans, cycles: this.cycles,
      criteria: this.criteria, subQuestions: this.subQuestions, evaluations: this.evaluations,
      auditLog: this.auditLog, trainingRecommendations: this.trainingRecommendations, disputes: this.disputes,
    };
  }

  importAllData(data: any): void {
    if (data.faculty) this.faculty = data.faculty;
    if (data.students) this.students = data.students;
    if (data.deans) this.deans = data.deans;
    if (data.cycles) this.cycles = data.cycles;
    if (data.criteria) this.criteria = data.criteria;
    if (data.subQuestions) this.subQuestions = data.subQuestions;
    if (data.evaluations) this.evaluations = data.evaluations;
    if (data.auditLog) this.auditLog = data.auditLog;
    if (data.trainingRecommendations) this.trainingRecommendations = data.trainingRecommendations;
    if (data.disputes) this.disputes = data.disputes;
    this.addAuditLog('admin', 'data_imported', 'DataStore', 'Data imported');
    this.persistData();
    this.emit('data_refresh');
  }
}

export const store = new DataStore();
export { BENCHMARK, THRESHOLD };

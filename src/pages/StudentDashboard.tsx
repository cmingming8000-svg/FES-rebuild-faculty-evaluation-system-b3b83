import React, { useState, useEffect, useCallback } from 'react';
import { store } from '../store';
import { useAuth } from '../auth';
import { stripPII, detectPII } from '../utils/pii';
import type { EvaluationCycle, Criterion, SubQuestion, Program, Subject } from '../types';
import { CheckCircle, AlertTriangle, Send, Shield, Eye, BookOpen, User, Clock, GraduationCap } from 'lucide-react';

interface StudentDashboardProps { viewingCycleId?: string; onViewingCycleChange?: (cycleId: string) => void; }

export default function StudentDashboard({ viewingCycleId, onViewingCycleChange }: StudentDashboardProps) {
  const { user } = useAuth();
  const studentId = user?.id || '';
  const [cycles, setCycles] = useState<EvaluationCycle[]>([]);
  const [criteria, setCriteria] = useState<Criterion[]>([]);
  const [subQuestions, setSubQuestions] = useState<SubQuestion[]>([]);
  const [programs, setPrograms] = useState<Program[]>([]);
  const [availableSubjects, setAvailableSubjects] = useState<Subject[]>([]);
  const [selectedProgram, setSelectedProgram] = useState('');
  const [selectedSubject, setSelectedSubject] = useState('');
  const [boundFacultyId, setBoundFacultyId] = useState('');
  const [boundFacultyName, setBoundFacultyName] = useState('');
  const [ratings, setRatings] = useState<Record<string, number>>({});
  const [feedback, setFeedback] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitResult, setSubmitResult] = useState<'success' | 'error' | null>(null);
  const [piiDetected, setPiiDetected] = useState<string[]>([]);
  const [showPiiWarning, setShowPiiWarning] = useState(true);
  const activeCycle = cycles.find(c => c.status === 'active');

  const loadData = useCallback(() => {
    setCycles(store.getCycles()); setCriteria(store.getCriteria()); setSubQuestions(store.getSubQuestions());
    setPrograms(store.getPrograms()); setAvailableSubjects(store.getAvailableSubjectsForStudent(studentId));
  }, [studentId]);

  useEffect(() => { loadData(); const unsubs = [store.subscribe('criteria_changed', loadData), store.subscribe('cycle_changed', loadData), store.subscribe('submission_added', loadData)]; return () => unsubs.forEach(u => u()); }, [loadData]);
  useEffect(() => { const detected = detectPII(feedback); setPiiDetected(detected); }, [feedback]);

  const subjectsForProgram = selectedProgram ? availableSubjects.filter(s => s.programId === selectedProgram) : [];
  const handleProgramSelect = (programId: string) => { setSelectedProgram(programId); setSelectedSubject(''); setBoundFacultyId(''); setBoundFacultyName(''); setRatings({}); };
  const handleSubjectSelect = (subjectId: string) => { setSelectedSubject(subjectId); const faculty = store.getFacultyBySubject(subjectId); if (faculty) { setBoundFacultyId(faculty.id); setBoundFacultyName(faculty.name); } setRatings({}); };
  const handleRatingChange = (sqId: string, value: string) => { const rating = parseInt(value); if (!isNaN(rating) && rating >= 1 && rating <= 5) setRatings(prev => ({ ...prev, [sqId]: rating })); else if (value === '') setRatings(prev => { const n = { ...prev }; delete n[sqId]; return n; }); };
  const allRated = subQuestions.every(sq => ratings[sq.id] !== undefined);

  const handleSubmit = async () => {
    if (!selectedSubject || !boundFacultyId || !allRated || !activeCycle) return;
    setSubmitting(true); setSubmitResult(null);
    try {
      const strippedFeedback = stripPII(feedback);
      await store.submitEvaluation({ facultyId: boundFacultyId, courseId: selectedSubject, cycleId: activeCycle.id, ratings, feedback: strippedFeedback }, studentId);
      setSubmitResult('success');
      setSelectedProgram(''); setSelectedSubject(''); setBoundFacultyId(''); setBoundFacultyName(''); setRatings({}); setFeedback('');
      setAvailableSubjects(store.getAvailableSubjectsForStudent(studentId));
    } catch { setSubmitResult('error'); }
    finally { setSubmitting(false); }
  };

  const subQsByCriterion = criteria.map(c => ({ criterion: c, subQuestions: subQuestions.filter(sq => sq.criterionId === c.id) }));

  return (
    <div className="space-y-6">
      {activeCycle && (<div className="rounded-xl p-4 flex items-center gap-3" style={{ backgroundColor: '#F5E6D3', border: '1px solid #B87333' }}><Clock size={20} style={{ color: '#B87333' }} /><div><p className="font-semibold text-sm" style={{ color: '#002366' }}>Active Evaluation Cycle</p><p className="text-xs">{activeCycle.displayName} — {activeCycle.startDate} to {activeCycle.endDate}</p></div></div>)}
      {submitResult === 'success' && (<div className="rounded-xl p-4 flex items-center gap-3" style={{ backgroundColor: '#D1FAE5', border: '1px solid #2E8B57' }}><CheckCircle size={20} style={{ color: '#2E8B57' }} /><p className="text-sm font-medium" style={{ color: '#2E8B57' }}>Evaluation submitted successfully! Your response is anonymous.</p></div>)}
      {submitResult === 'error' && (<div className="rounded-xl p-4 flex items-center gap-3" style={{ backgroundColor: '#FEE2E2', border: '1px solid #C41E3A' }}><AlertTriangle size={20} style={{ color: '#C41E3A' }} /><p className="text-sm font-medium" style={{ color: '#C41E3A' }}>Submission failed. Please try again.</p></div>)}
      <div className="rounded-xl shadow-md p-6" style={{ backgroundColor: '#EDEBE8' }}>
        <h2 className="text-xl font-bold mb-4 flex items-center gap-2" style={{ color: '#002366' }}><Shield size={22} style={{ color: '#B87333' }} />Submit Evaluation</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div><label className="block text-sm font-medium mb-1"><GraduationCap size={14} className="inline mr-1" style={{ color: '#B87333' }} />1. Select Program</label><select value={selectedProgram} onChange={e => handleProgramSelect(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border outline-none" style={{ backgroundColor: '#F8F6F1', borderColor: '#D5D8DC' }}><option value="">-- Choose your program --</option>{programs.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}</select></div>
          <div><label className="block text-sm font-medium mb-1"><BookOpen size={14} className="inline mr-1" style={{ color: '#B87333' }} />2. Select Course/Subject</label><select value={selectedSubject} onChange={e => handleSubjectSelect(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border outline-none" style={{ backgroundColor: '#F8F6F1', borderColor: '#D5D8DC' }} disabled={!selectedProgram}><option value="">-- Choose a course/subject --</option>{subjectsForProgram.map(s => (<option key={s.id} value={s.id}>{s.code} - {s.name}</option>))}</select>{!selectedProgram && <p className="text-xs mt-1" style={{ color: '#9CA3AF' }}>Select a program first</p>}{selectedProgram && subjectsForProgram.length === 0 && <p className="text-xs mt-1" style={{ color: '#2E8B57' }}>✓ All courses/subjects evaluated!</p>}</div>
          <div><label className="block text-sm font-medium mb-1"><User size={14} className="inline mr-1" style={{ color: '#B87333' }} />3. Assigned Professor</label><input type="text" value={boundFacultyName} disabled className="w-full px-3 py-2.5 rounded-lg border text-sm outline-none" style={{ backgroundColor: '#D5D8DC', borderColor: '#D5D8DC', color: boundFacultyName ? '#1A1A1A' : '#9CA3AF' }} placeholder="Select a subject first..." />{boundFacultyName && <p className="text-xs mt-1" style={{ color: '#2E8B57' }}>✓ Professor locked</p>}</div>
        </div>
        {selectedSubject && boundFacultyId && (<>
          <div className="mb-4 flex items-center gap-1 text-sm" style={{ color: '#1A1A1A' }}><Eye size={14} style={{ color: '#B87333' }} />Rate each question on a scale of 1-5 (1 = Poor, 5 = Excellent)</div>
          <div className="space-y-4 mb-6">{subQsByCriterion.map(({ criterion, subQuestions: sqs }) => (<div key={criterion.id} className="rounded-lg p-3" style={{ backgroundColor: '#F8F6F1' }}><h4 className="text-xs font-bold uppercase tracking-wide mb-2" style={{ color: '#002366' }}>{criterion.name}</h4><div className="space-y-2">{sqs.map(sq => (<div key={sq.id} className="flex items-center justify-between gap-3 py-1.5 px-2 rounded"><div className="flex items-center gap-2 flex-1 min-w-0"><span className="text-xs" style={{ color: '#1A1A1A' }}>{sq.text}</span></div><select value={ratings[sq.id] || ''} onChange={e => handleRatingChange(sq.id, e.target.value)} className="px-2 py-1 rounded border text-sm outline-none min-w-[80px]" style={{ backgroundColor: '#EDEBE8', borderColor: '#D5D8DC' }}><option value="">--</option>{[1, 2, 3, 4, 5].map(n => (<option key={n} value={n}>{n}</option>))}</select></div>))}</div></div>))}</div>
          <div className="mb-6"><label className="block text-sm font-medium mb-1">Additional Feedback (Optional)</label><textarea value={feedback} onChange={e => setFeedback(e.target.value)} className="w-full px-3 py-2.5 rounded-lg border outline-none resize-none" style={{ backgroundColor: '#F8F6F1', borderColor: '#D5D8DC' }} rows={4} placeholder="Share your thoughts..." />{piiDetected.length > 0 && showPiiWarning && (<div className="mt-2 p-3 rounded-lg flex items-start gap-2" style={{ backgroundColor: '#FEF3C7', border: '1px solid #B87333' }}><AlertTriangle size={16} style={{ color: '#B87333' }} className="flex-shrink-0 mt-0.5" /><div className="flex-1"><p className="text-xs font-medium" style={{ color: '#B87333' }}>Potential PII detected: {piiDetected.join(', ')}</p><p className="text-xs mt-1" style={{ color: '#4B5563' }}>This will be automatically redacted.</p></div><button onClick={() => setShowPiiWarning(false)} className="text-xs underline" style={{ color: '#B87333' }}>Dismiss</button></div>)}</div>
          <button onClick={handleSubmit} disabled={!allRated || submitting} className="w-full py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50 disabled:cursor-not-allowed" style={{ backgroundColor: '#002366' }}>{submitting ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><Send size={18} />Submit Anonymous Evaluation</>}</button>
        </>)}
      </div>
    </div>
  );
}

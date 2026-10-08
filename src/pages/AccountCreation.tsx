import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { store } from '../store';
import { useAuth } from '../auth';
import { UserPlus, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';

type UserRole = 'faculty' | 'student' | 'dean' | 'admin';

export default function AccountCreation() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [selectedRole, setSelectedRole] = useState<UserRole>('faculty');
  const [formData, setFormData] = useState({ name: '', username: '', password: '', confirmPassword: '', department: '', title: '', courses: [] as string[], studentId: '', programId: '', enrolledSubjects: [] as string[] });
  const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const programs = store.getPrograms();
  const subjects = store.getSubjects();
  const allCourses = Array.from(new Set(store.getFaculty().flatMap(f => f.courses)));

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => { const { name, value } = e.target; setFormData(prev => ({ ...prev, [name]: value })); };
  const handleArrayChange = (field: 'courses' | 'enrolledSubjects', value: string) => { setFormData(prev => ({ ...prev, [field]: prev[field].includes(value) ? prev[field].filter(item => item !== value) : [...prev[field], value] })); };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setMessage(null); setIsSubmitting(true);
    if (!formData.name || !formData.username || !formData.password) { setMessage({ type: 'error', text: 'Please fill in all required fields' }); setIsSubmitting(false); return; }
    if (formData.password !== formData.confirmPassword) { setMessage({ type: 'error', text: 'Passwords do not match' }); setIsSubmitting(false); return; }
    try {
      let result;
      switch (selectedRole) {
        case 'faculty': result = await store.createFacultyAccount(formData.name, formData.department, formData.title, formData.courses, formData.username, formData.password); break;
        case 'student': result = await store.createStudentAccount(formData.name, formData.studentId, formData.programId, formData.enrolledSubjects, formData.username, formData.password); break;
        case 'dean': result = await store.createDeanAccount(formData.name, formData.department, formData.username, formData.password); break;
        case 'admin': result = await store.createAdminAccount(formData.name, formData.username, formData.password); break;
      }
      if (result!.success) { setMessage({ type: 'success', text: result!.message }); setFormData({ name: '', username: '', password: '', confirmPassword: '', department: '', title: '', courses: [], studentId: '', programId: '', enrolledSubjects: [] }); }
      else setMessage({ type: 'error', text: result!.message });
    } catch (error) { setMessage({ type: 'error', text: 'An error occurred' }); }
    setIsSubmitting(false);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4"><button onClick={() => navigate('/')} className="flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium hover:opacity-90" style={{ backgroundColor: '#D5D8DC', color: '#1A1A1A' }}><ArrowLeft size={16} />Back to Dashboard</button><h2 className="text-2xl font-bold" style={{ color: '#002366' }}>Create New Account</h2></div>
      <div className="rounded-xl p-6 shadow-sm" style={{ backgroundColor: '#EDEBE8' }}>
        <div className="mb-6"><label className="block text-sm font-medium mb-3">Select Account Type *</label><div className="grid grid-cols-4 gap-3">{(['faculty', 'student', 'dean', 'admin'] as UserRole[]).map(role => (<button key={role} type="button" onClick={() => setSelectedRole(role)} className="px-4 py-3 rounded-lg text-sm font-medium" style={{ backgroundColor: selectedRole === role ? '#002366' : '#F8F6F1', color: selectedRole === role ? '#FFFFFF' : '#1A1A1A', border: selectedRole === role ? '2px solid #002366' : '2px solid #D5D8DC' }}>{role.charAt(0).toUpperCase() + role.slice(1)}</button>))}</div></div>
        {message && (<div className="mb-6 p-4 rounded-lg flex items-start gap-3" style={{ backgroundColor: message.type === 'success' ? '#D1FAE5' : '#FEE2E2', border: `1px solid ${message.type === 'success' ? '#2E8B57' : '#C41E3A'}` }}>{message.type === 'success' ? <CheckCircle size={20} style={{ color: '#2E8B57' }} /> : <AlertCircle size={20} style={{ color: '#C41E3A' }} />}<p className="text-sm" style={{ color: message.type === 'success' ? '#2E8B57' : '#C41E3A' }}>{message.text}</p></div>)}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-4">
            <div><label className="block text-sm font-medium mb-2">Full Name *</label><input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={{ backgroundColor: '#F8F6F1', borderColor: '#D5D8DC' }} placeholder="Full name" required /></div>
            {selectedRole === 'faculty' && (<><div><label className="block text-sm font-medium mb-2">Department *</label><select name="department" value={formData.department} onChange={handleInputChange} className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={{ backgroundColor: '#F8F6F1', borderColor: '#D5D8DC' }} required><option value="">Select Department</option><option value="Computer Science">Computer Science</option><option value="Mathematics">Mathematics</option><option value="Physics">Physics</option></select></div><div><label className="block text-sm font-medium mb-2">Title *</label><select name="title" value={formData.title} onChange={handleInputChange} className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={{ backgroundColor: '#F8F6F1', borderColor: '#D5D8DC' }} required><option value="">Select Title</option><option value="Professor">Professor</option><option value="Associate Professor">Associate Professor</option><option value="Assistant Professor">Assistant Professor</option><option value="Lecturer">Lecturer</option></select></div></>)}
            {selectedRole === 'student' && (<><div><label className="block text-sm font-medium mb-2">Student ID *</label><input type="text" name="studentId" value={formData.studentId} onChange={handleInputChange} className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={{ backgroundColor: '#F8F6F1', borderColor: '#D5D8DC' }} placeholder="C24-026" required /></div><div><label className="block text-sm font-medium mb-2">Program *</label><select name="programId" value={formData.programId} onChange={handleInputChange} className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={{ backgroundColor: '#F8F6F1', borderColor: '#D5D8DC' }} required><option value="">Select Program</option>{programs.map(p => (<option key={p.id} value={p.id}>{p.name}</option>))}</select></div></>)}
            {selectedRole === 'dean' && (<div><label className="block text-sm font-medium mb-2">Department *</label><select name="department" value={formData.department} onChange={handleInputChange} className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={{ backgroundColor: '#F8F6F1', borderColor: '#D5D8DC' }} required><option value="">Select Department</option><option value="Computer Science">Computer Science</option><option value="Mathematics">Mathematics</option><option value="Physics">Physics</option></select></div>)}
          </div>
          <div className="border-t pt-6" style={{ borderColor: '#D5D8DC' }}><h3 className="text-sm font-semibold mb-4" style={{ color: '#002366' }}>Login Credentials</h3><div className="space-y-4"><div><label className="block text-sm font-medium mb-2">Username *</label><input type="text" name="username" value={formData.username} onChange={handleInputChange} className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={{ backgroundColor: '#F8F6F1', borderColor: '#D5D8DC' }} required /></div><div><label className="block text-sm font-medium mb-2">Password *</label><input type="password" name="password" value={formData.password} onChange={handleInputChange} className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={{ backgroundColor: '#F8F6F1', borderColor: '#D5D8DC' }} required /></div><div><label className="block text-sm font-medium mb-2">Confirm Password *</label><input type="password" name="confirmPassword" value={formData.confirmPassword} onChange={handleInputChange} className="w-full px-3 py-2 rounded-lg border text-sm outline-none" style={{ backgroundColor: '#F8F6F1', borderColor: '#D5D8DC' }} required /></div></div></div>
          <button type="submit" disabled={isSubmitting} className="w-full py-3 rounded-lg font-semibold text-white flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: '#002366' }}>{isSubmitting ? <><div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />Creating Account...</> : <><UserPlus size={18} />Create Account</>}</button>
        </form>
      </div>
    </div>
  );
}

import React, { useState, useEffect } from 'react';
import { useAuth } from '../auth';
import { store } from '../store';
import type { EvaluationCycle } from '../types';
import { LogIn, Shield, AlertCircle, Calendar } from 'lucide-react';

export default function Login() {
  const { login, isLoading, error } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [activeCycle, setActiveCycle] = useState<EvaluationCycle | undefined>();
  const [showQuickLogin, setShowQuickLogin] = useState(false);

  useEffect(() => {
    setActiveCycle(store.getActiveCycle());
    const unsub = store.subscribe('cycle_changed', () => setActiveCycle(store.getActiveCycle()));
    return unsub;
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (username === 'dev' && password === '123dev') { setShowQuickLogin(true); return; }
    await login(username, password);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4" style={{ background: 'linear-gradient(135deg, #D5D8DC 0%, #EDEBE8 100%)' }}>
      <div className="w-full max-w-md">
        {activeCycle && (
          <div className="mb-4 rounded-xl p-3 flex items-center gap-2 shadow-sm" style={{ backgroundColor: '#EDEBE8', border: '1px solid #B87333' }}>
            <span className="w-2.5 h-2.5 rounded-full bg-green-500 animate-pulse flex-shrink-0" />
            <Calendar size={16} style={{ color: '#B87333' }} className="flex-shrink-0" />
            <div>
              <p className="text-[10px] font-bold uppercase tracking-wider" style={{ color: '#B87333' }}>Current Active Period</p>
              <p className="text-sm font-semibold" style={{ color: '#002366' }}>{activeCycle.displayName}</p>
            </div>
          </div>
        )}
        <div className="text-center mb-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl mb-4" style={{ background: 'linear-gradient(135deg, #002366, #003399)', border: '3px solid #B87333' }}>
            <span className="text-4xl font-bold" style={{ fontFamily: 'Georgia, serif', color: '#B87333' }}>W</span>
          </div>
          <h1 className="text-2xl font-bold" style={{ color: '#002366' }}>FES</h1>
          <p className="text-sm" style={{ color: '#1A1A1A' }}>Faculty Evaluation System</p>
        </div>
        <div className="rounded-xl shadow-lg p-8" style={{ backgroundColor: '#EDEBE8' }}>
          <div className="flex items-center gap-2 mb-6"><Shield size={20} style={{ color: '#B87333' }} /><h2 className="text-lg font-semibold" style={{ color: '#002366' }}>Secure Login</h2></div>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Username</label>
              <input type="text" value={username} onChange={e => setUsername(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border outline-none" style={{ backgroundColor: '#F8F6F1', borderColor: '#D5D8DC' }} placeholder="Enter username" required />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Password</label>
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full px-4 py-2.5 rounded-lg border outline-none" style={{ backgroundColor: '#F8F6F1', borderColor: '#D5D8DC' }} placeholder="Enter password" required />
            </div>
            {error && <div className="flex items-center gap-2 p-3 rounded-lg" style={{ backgroundColor: '#FEE2E2', color: '#C41E3A' }}><AlertCircle size={16} /><span className="text-sm">{error}</span></div>}
            <button type="submit" disabled={isLoading} className="w-full py-2.5 rounded-lg font-semibold text-white flex items-center justify-center gap-2 hover:opacity-90 disabled:opacity-50" style={{ backgroundColor: '#002366' }}>
              {isLoading ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" /> : <><LogIn size={18} />Sign In</>}
            </button>
          </form>
          {showQuickLogin && (
            <div className="mt-6 pt-4 border-t" style={{ borderColor: '#D5D8DC' }}>
              <label className="block text-xs font-medium mb-2" style={{ color: '#B87333' }}>Quick Login (Demo Accounts):</label>
              <select onChange={(e) => { const [u, p] = e.target.value.split('|'); if (u && p) { setUsername(u); setPassword(p); } }} className="w-full px-3 py-2 rounded-lg border text-xs outline-none mb-3" style={{ backgroundColor: '#F8F6F1', borderColor: '#D5D8DC' }} defaultValue="">
                <option value="" disabled>Select an account...</option>
                <optgroup label="Admin">
                  <option value="admin|admin">System Administrator (admin / admin)</option>
                  <option value="test_admin|test123">TEST Administrator (test_admin / test123)</option>
                </optgroup>
                <optgroup label="Faculty">
                  <option value="faculty|faculty">Dr. Sarah Chen - CS (faculty / faculty)</option>
                  <option value="faculty2|faculty2">Dr. Jennifer Lee - CS (faculty2 / faculty2)</option>
                  <option value="faculty3|faculty3">Dr. Thomas Wright - Math (faculty3 / faculty3)</option>
                  <option value="faculty4|faculty4">Dr. Amanda Clark - Physics (faculty4 / faculty4)</option>
                  <option value="test_faculty|test123">TEST Faculty (test_faculty / test123)</option>
                </optgroup>
                <optgroup label="Deans">
                  <option value="M001|dean123">Dr. Patricia Moore - CS Dean (M001 / dean123)</option>
                  <option value="M002|dean123">Dr. William Chang - Math Dean (M002 / dean123)</option>
                  <option value="M003|dean123">Dr. Elizabeth Brown - Physics Dean (M003 / dean123)</option>
                  <option value="test_dean|test123">TEST Dean (test_dean / test123)</option>
                </optgroup>
                <optgroup label="Students - BS Computer Science">
                  <option value="C24-001|pass123">Alice Johnson (C24-001 / pass123)</option>
                  <option value="C24-002|pass123">Bob Smith (C24-002 / pass123)</option>
                  <option value="C24-003|pass123">Carol Davis (C24-003 / pass123)</option>
                </optgroup>
                <optgroup label="Students - BS Mathematics">
                  <option value="C24-007|pass123">Grace Taylor (C24-007 / pass123)</option>
                  <option value="C24-008|pass123">Henry Martinez (C24-008 / pass123)</option>
                </optgroup>
                <optgroup label="Students - BS Physics">
                  <option value="C24-010|pass123">Jack Thomas (C24-010 / pass123)</option>
                  <option value="C24-011|pass123">Karen White (C24-011 / pass123)</option>
                </optgroup>
                <optgroup label="Test Accounts">
                  <option value="test_student|test123">TEST Student (test_student / test123)</option>
                </optgroup>
              </select>
              <p className="text-[10px] text-center" style={{ color: '#9CA3AF' }}>Select an account to auto-fill credentials, then click Sign In</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

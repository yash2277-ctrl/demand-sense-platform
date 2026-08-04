import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, Upload, TrendingUp, BookOpen, FileText,
  Target, Settings as SettingsIcon, LogOut, CheckCircle2,
  XCircle, Loader2, Sparkles, MapPin
} from 'lucide-react'

import Login from './pages/Login'
import Dashboard from './pages/Dashboard'
import UploadData from './pages/UploadData'
import Predictions from './pages/Predictions'
import RAGContext from './pages/RAGContext'
import Reports from './pages/Reports'
import Analytics from './pages/Analytics'
import AccuracyTracker from './pages/AccuracyTracker'
import Settings from './pages/Settings'
import Riogami from './components/Riogami'

const API_URL = '/api'

export default function App() {
  const [accountType, setAccountType] = useState(null) // 'real' or 'demo'
  const [activeTab, setActiveTab] = useState('dashboard')
  const [health, setHealth] = useState({ database: false, faiss: false, llm: false, loading: true })

  useEffect(() => {
    if (accountType) {
      fetch(`${API_URL}/health`)
        .then(res => res.json())
        .then(data => setHealth({ ...data.status, loading: false }))
        .catch(() => setHealth({ database: false, faiss: false, llm: false, loading: false }))
    }
  }, [accountType])

  if (!accountType) return <Login onLoginType={setAccountType} />

  const getStatusColor = (status) => status ? 'var(--cyan)' : 'var(--text-muted)'

  const navItems = [
    { id: 'dashboard', label: 'Global Intelligence', icon: MapPin, section: 'SPATIAL' },
    { id: 'upload', label: 'Data Ingestion', icon: Upload, section: 'SPATIAL' },
    { id: 'predictions', label: 'Quantum Predict', icon: TrendingUp, section: 'SPATIAL' },

    { id: 'rag', label: 'RAG Context', icon: BookOpen, section: 'INTELLIGENCE' },
    { id: 'reports', label: 'Neural Reports', icon: FileText, section: 'INTELLIGENCE' },
    { id: 'analytics', label: 'Deep Analytics', icon: Target, section: 'INTELLIGENCE' },

    { id: 'accuracy', label: 'Model Accuracy', icon: Sparkles, section: 'SYSTEM' },
    { id: 'settings', label: 'Configuration', icon: SettingsIcon, section: 'SYSTEM' },
  ]

  const sections = [...new Set(navItems.map(item => item.section))]

  return (
    <div className="app-container">
      {/* Sidebar */}
      <div className="sidebar">
        <div style={{ padding: '32px 24px', display: 'flex', alignItems: 'center', gap: 12 }}>
          <div style={{ width: 36, height: 36, borderRadius: 10, background: 'linear-gradient(135deg, var(--cyan), var(--violet))', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 0 20px rgba(0, 243, 255, 0.4)' }}>
            <Sparkles size={18} color="#000" />
          </div>
          <div>
            <h1 style={{ fontSize: 18, fontWeight: 700, letterSpacing: '-0.5px' }}>DemandSense</h1>
            <p style={{ fontSize: 9, color: 'var(--cyan)', fontFamily: 'var(--font-mono)', letterSpacing: '2px' }}>SPATIAL AI</p>
          </div>
        </div>

        <nav style={{ flex: 1, padding: '0 16px' }}>
          {sections.map(section => (
            <div key={section} style={{ marginBottom: 24 }}>
              <div style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)', marginBottom: 8, paddingLeft: 12, letterSpacing: '1px' }}>
                {section}
              </div>
              {navItems.filter(item => item.section === section).map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', gap: 12,
                    padding: '12px', borderRadius: 8, border: 'none', background: 'transparent',
                    color: activeTab === item.id ? '#fff' : 'var(--text-secondary)',
                    backgroundColor: activeTab === item.id ? 'rgba(0, 243, 255, 0.08)' : 'transparent',
                    boxShadow: activeTab === item.id ? 'inset 2px 0 0 var(--cyan)' : 'none',
                    fontFamily: 'var(--font-sans)', fontSize: 14, fontWeight: activeTab === item.id ? 600 : 400,
                    cursor: 'pointer', textAlign: 'left', transition: 'all 0.2s',
                    textShadow: activeTab === item.id ? '0 0 10px rgba(0, 243, 255, 0.4)' : 'none'
                  }}
                >
                  <item.icon size={18} color={activeTab === item.id ? 'var(--cyan)' : 'var(--text-secondary)'} />
                  {item.label}
                </button>
              ))}
            </div>
          ))}
        </nav>

        {/* System Status */}
        <div style={{ padding: '24px 20px', borderTop: '1px solid var(--glass-border)', background: 'rgba(0,0,0,0.3)' }}>
          <div className="flex items-center gap-8 mb-16" style={{ cursor: 'pointer' }} onClick={() => setAccountType(null)}>
            <div style={{ width: 8, height: 8, borderRadius: '50%', background: 'var(--magenta)', boxShadow: '0 0 10px var(--magenta)' }} />
            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--magenta)' }}>{accountType === 'demo' ? 'DEMO MODE' : 'LIVE MODE'}</span>
            <LogOut size={12} color="var(--magenta)" style={{ marginLeft: 'auto' }} />
          </div>

          <div className="flex items-center gap-12" style={{ fontSize: 10, fontFamily: 'var(--font-mono)', color: 'var(--text-muted)' }}>
            <span style={{ color: getStatusColor(health.database) }}>DB {health.database ? <CheckCircle2 size={10} style={{ display: 'inline', verticalAlign: '-2px' }} /> : '○'}</span>
            <span>·</span>
            <span style={{ color: getStatusColor(health.llm) }}>LLM {health.llm ? <CheckCircle2 size={10} style={{ display: 'inline', verticalAlign: '-2px' }} /> : '○'}</span>
            <span>·</span>
            <span style={{ color: getStatusColor(health.faiss) }}>FAISS {health.faiss ? <CheckCircle2 size={10} style={{ display: 'inline', verticalAlign: '-2px' }} /> : '○'}</span>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="main-content">
        {/* Holographic header bar */}
        <div style={{ position: 'sticky', top: 0, zIndex: 40, background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(12px)', borderBottom: '1px solid var(--glass-border)', padding: '16px 40px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <div className="mono" style={{ fontSize: 12, color: 'var(--cyan)', textShadow: '0 0 10px rgba(0,243,255,0.4)', display: 'flex', alignItems: 'center', gap: 12 }}>
            <span style={{ animation: 'pulse 2s infinite' }}>●</span> UPLINK ESTABLISHED // {new Date().toISOString().split('T')[0]} // SECURE_NODE_7
          </div>

          {accountType === 'demo' && (
            <span style={{ padding: '4px 12px', background: 'var(--magenta-dim)', color: 'var(--magenta)', borderRadius: 4, fontSize: 10, fontFamily: 'var(--font-mono)', border: '1px solid rgba(255,0,60,0.3)', boxShadow: '0 0 15px rgba(255,0,60,0.2)' }}>
              SIMULATION ACTIVE
            </span>
          )}
        </div>

        <div className={activeTab === 'dashboard' ? '' : 'page-container'}>
          {activeTab === 'dashboard' && <Dashboard api={API_URL} accountType={accountType} />}
          {activeTab === 'upload' && <UploadData api={API_URL} accountType={accountType} />}
          {activeTab === 'predictions' && <Predictions api={API_URL} accountType={accountType} />}
          {activeTab === 'rag' && <RAGContext api={API_URL} accountType={accountType} />}
          {activeTab === 'reports' && <Reports api={API_URL} accountType={accountType} />}
          {activeTab === 'analytics' && <Analytics api={API_URL} accountType={accountType} />}
          {activeTab === 'accuracy' && <AccuracyTracker api={API_URL} accountType={accountType} />}
          {activeTab === 'settings' && <Settings />}
        </div>
      </main>

      <Riogami activeTab={activeTab} setActiveTab={setActiveTab} />
    </div>
  )
}

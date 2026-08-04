import { NavLink } from 'react-router-dom'
import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    LayoutDashboard, Upload, TrendingUp, Brain, FileText,
    Target, BarChart3, Settings, Zap, Activity
} from 'lucide-react'

const navItems = [
    { section: 'Main' },
    { path: '/', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/upload', icon: Upload, label: 'Upload Data' },
    { path: '/predictions', icon: TrendingUp, label: 'Predictions' },
    { section: 'Intelligence' },
    { path: '/rag', icon: Brain, label: 'RAG Context' },
    { path: '/reports', icon: FileText, label: 'Reports' },
    { path: '/analytics', icon: BarChart3, label: 'Analytics' },
    { section: 'System' },
    { path: '/accuracy', icon: Target, label: 'Accuracy Tracker' },
    { path: '/settings', icon: Settings, label: 'Settings' },
]

export default function Sidebar({ isOpen, onClose }) {
    const [health, setHealth] = useState(null)

    useEffect(() => {
        const check = async () => {
            try {
                const res = await fetch('/api/health')
                const data = await res.json()
                setHealth(data.status)
            } catch { setHealth({ overall: false }) }
        }
        check()
        const interval = setInterval(check, 30000)
        return () => clearInterval(interval)
    }, [])

    return (
        <aside className={`sidebar ${isOpen ? 'open' : ''}`}>
            <div className="sidebar-brand">
                <div className="sidebar-logo-box">
                    <Zap size={20} color="#080c1a" fill="#080c1a" />
                </div>
                <div className="sidebar-brand-text">
                    <h1>DemandSense</h1>
                    <p>Intelligence AI</p>
                </div>
            </div>

            <nav className="sidebar-nav">
                {navItems.map((item, i) => {
                    if (item.section) {
                        return <div key={i} className="nav-section-label">{item.section}</div>
                    }
                    const Icon = item.icon
                    return (
                        <NavLink
                            key={item.path}
                            to={item.path}
                            className={({ isActive }) => `nav-link ${isActive ? 'active' : ''}`}
                            onClick={onClose}
                            end={item.path === '/'}
                        >
                            <span className="nav-icon"><Icon size={18} /></span>
                            {item.label}
                        </NavLink>
                    )
                })}
            </nav>

            <div className="sidebar-footer">
                <div className="health-indicator">
                    <span className={`health-dot ${health?.overall ? 'online' : 'offline'}`} />
                    <div>
                        <div style={{ fontSize: 11, fontWeight: 600, color: health?.overall ? 'var(--green)' : 'var(--red)' }}>
                            {health?.overall ? 'System Online' : 'Offline'}
                        </div>
                        <div style={{ fontSize: 10, color: 'var(--text-dim)', marginTop: 2 }}>
                            {health?.database ? 'DB ✓' : 'DB ✗'} · {health?.llm ? 'LLM ✓' : 'LLM ○'} · {health?.faiss ? 'FAISS ✓' : 'FAISS ○'}
                        </div>
                    </div>
                </div>
            </div>
        </aside>
    )
}

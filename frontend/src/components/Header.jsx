import { useState } from 'react'
import { motion } from 'framer-motion'
import { Play, Loader2, Check, Calendar, Menu, Search, Bell } from 'lucide-react'

export default function Header({ onMenuToggle }) {
    const [dateFrom, setDateFrom] = useState('2024-02-23')
    const [dateTo, setDateTo] = useState('2026-02-23')
    const [runState, setRunState] = useState('idle')

    const handleRun = async () => {
        setRunState('running')
        try {
            const optRes = await fetch('/api/data/options')
            const opts = await optRes.json()
            if (opts.products?.length > 0 && opts.regions?.length > 0) {
                await fetch('/api/predict', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        product: opts.products[0],
                        region: opts.regions[0],
                        horizon: 30,
                    }),
                })
            }
            setRunState('success')
            setTimeout(() => setRunState('idle'), 2500)
        } catch {
            setRunState('idle')
        }
    }

    return (
        <header className="header">
            <div className="header-left">
                <button className="menu-toggle" onClick={onMenuToggle}>
                    <Menu size={22} />
                </button>
                <div className="header-date-pill">
                    <Calendar size={14} style={{ color: 'var(--teal)', flexShrink: 0 }} />
                    <input type="date" value={dateFrom} onChange={e => setDateFrom(e.target.value)} />
                    <span style={{ color: 'var(--text-dim)' }}>→</span>
                    <input type="date" value={dateTo} onChange={e => setDateTo(e.target.value)} />
                </div>
            </div>

            <div className="header-right">
                <button className="btn-icon" title="Search">
                    <Search size={16} />
                </button>
                <div style={{ position: 'relative' }}>
                    <button className="btn-icon" title="Notifications">
                        <Bell size={16} />
                    </button>
                    <span style={{
                        position: 'absolute', top: 6, right: 6,
                        width: 7, height: 7, borderRadius: '50%',
                        background: 'var(--teal)', boxShadow: '0 0 6px var(--teal)',
                    }} />
                </div>

                <motion.button
                    className={`btn btn-primary ${runState === 'idle' ? 'btn-pulse' : ''} ${runState === 'success' ? 'btn-success' : ''}`}
                    onClick={handleRun}
                    disabled={runState === 'running'}
                    whileHover={{ scale: 1.03 }}
                    whileTap={{ scale: 0.97 }}
                >
                    {runState === 'running' ? (
                        <><Loader2 size={16} className="spinner" style={{ animation: 'spin 0.6s linear infinite' }} /> Running</>
                    ) : runState === 'success' ? (
                        <><Check size={16} /> Complete</>
                    ) : (
                        <><Play size={16} fill="currentColor" /> Run Prediction</>
                    )}
                </motion.button>
            </div>
        </header>
    )
}

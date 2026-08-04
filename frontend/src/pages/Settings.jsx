import { useState } from 'react'
import { motion } from 'framer-motion'
import { Settings as SettingsIcon, Moon, Globe, Bell, Shield, Database, Cpu, Palette, KeyRound } from 'lucide-react'

const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } }
const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }

export default function Settings() {
    const [settings, setSettings] = useState({
        darkMode: true, autoRefresh: true, notifications: true,
        streamReports: true, cacheEmbeddings: true, showConfidence: true,
    })

    const toggle = (key) => setSettings(s => ({ ...s, [key]: !s[key] }))

    const sections = [
        {
            title: 'Appearance', icon: Palette,
            items: [
                { key: 'darkMode', label: 'Dark Mode', desc: 'Use dark theme across the platform' },
                { key: 'showConfidence', label: 'Show Confidence Bands', desc: 'Display confidence intervals on charts' },
            ]
        },
        {
            title: 'Notifications', icon: Bell,
            items: [
                { key: 'notifications', label: 'Push Notifications', desc: 'Receive alerts for prediction anomalies' },
                { key: 'autoRefresh', label: 'Auto Refresh', desc: 'Automatically refresh data every 30 seconds' },
            ]
        },
        {
            title: 'AI Pipeline', icon: Cpu,
            items: [
                { key: 'streamReports', label: 'Stream Reports', desc: 'Stream LLM responses word-by-word in real-time' },
                { key: 'cacheEmbeddings', label: 'Cache Embeddings', desc: 'Cache FAISS indices for repeated queries' },
            ]
        },
    ]

    const apiConfigs = [
        { label: 'News API', icon: Globe, status: 'Not configured', configured: false },
        { label: 'Claude API', icon: KeyRound, status: 'Not configured', configured: false },
        { label: 'OpenAI API', icon: KeyRound, status: 'Not configured', configured: false },
        { label: 'Database', icon: Database, status: 'SQLite Connected', configured: true },
        { label: 'FAISS Index', icon: Shield, status: 'Ready (in-memory)', configured: true },
    ]

    return (
        <div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-12 mb-24">
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--teal-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <SettingsIcon size={22} color="var(--teal)" />
                </div>
                <div>
                    <h2 className="page-title">Settings</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Configure platform preferences and integrations</p>
                </div>
            </motion.div>

            <div className="settings-grid">
                {sections.map((sec, si) => {
                    const SIcon = sec.icon
                    return (
                        <motion.div className="glass-card" key={si} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 + si * 0.08 }}>
                            <div className="card-title"><SIcon size={18} className="icon" /> {sec.title}</div>
                            {sec.items.map((item, ii) => (
                                <div className="setting-item" key={ii}>
                                    <div className="setting-label">
                                        <h4>{item.label}</h4>
                                        <p>{item.desc}</p>
                                    </div>
                                    <div
                                        onClick={() => toggle(item.key)}
                                        style={{
                                            width: 50, height: 24, borderRadius: 4,
                                            background: settings[item.key] ? 'rgba(0,243,255,0.2)' : 'rgba(255,255,255,0.05)',
                                            border: `1px solid ${settings[item.key] ? '#00f3ff' : 'rgba(255,255,255,0.1)'}`,
                                            display: 'flex', alignItems: 'center', padding: 2, cursor: 'pointer',
                                            justifyContent: settings[item.key] ? 'flex-end' : 'flex-start',
                                            boxShadow: settings[item.key] ? 'inset 0 0 10px rgba(0,243,255,0.5)' : 'none',
                                            flexShrink: 0
                                        }}
                                    >
                                        <motion.div
                                            layout
                                            transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                                            style={{
                                                width: 20, height: 18, borderRadius: 2,
                                                background: settings[item.key] ? '#00f3ff' : '#4d5670',
                                                boxShadow: settings[item.key] ? '0 0 10px #00f3ff' : 'none'
                                            }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </motion.div>
                    )
                })}

                <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                    <div className="card-title"><Shield size={18} className="icon" /> API & Integrations</div>
                    {apiConfigs.map((cfg, i) => {
                        const CIcon = cfg.icon
                        return (
                            <div className="setting-item" key={i}>
                                <div className="flex items-center gap-12">
                                    <div style={{
                                        width: 36, height: 36, borderRadius: 10,
                                        background: cfg.configured ? 'var(--green-dim)' : 'rgba(255,255,255,0.04)',
                                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    }}>
                                        <CIcon size={16} color={cfg.configured ? 'var(--green)' : 'var(--text-dim)'} />
                                    </div>
                                    <div className="setting-label">
                                        <h4>{cfg.label}</h4>
                                        <p>{cfg.status}</p>
                                    </div>
                                </div>
                                <span className={`badge ${cfg.configured ? 'badge-green' : 'badge-amber'}`} style={{ fontSize: 10 }}>
                                    {cfg.configured ? 'Active' : 'Inactive'}
                                </span>
                            </div>
                        )
                    })}
                </motion.div>
            </div>

            <motion.div className="glass-card mt-24" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }}
                style={{ borderColor: 'rgba(255, 79, 109, 0.15)' }}>
                <div className="card-title" style={{ color: 'var(--red)' }}>⚠️ Danger Zone</div>
                <div className="flex items-center justify-between" style={{ padding: '12px 0' }}>
                    <div className="setting-label">
                        <h4>Reset All Data</h4>
                        <p>Clear database and re-seed with dummy data. This cannot be undone.</p>
                    </div>
                    <motion.button className="btn btn-sm" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                        style={{ background: 'var(--red-dim)', color: 'var(--red)', border: '1px solid rgba(255,79,109,0.2)' }}>
                        Reset Data
                    </motion.button>
                </div>
            </motion.div>
        </div>
    )
}

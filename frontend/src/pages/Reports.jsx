import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { FileText, ChevronDown, ChevronUp, Download, Filter, AlertCircle } from 'lucide-react'

export default function Reports({ api, accountType }) {
    const [reports, setReports] = useState([])
    const [options, setOptions] = useState({ products: [], regions: [] })
    const [fp, setFp] = useState('')
    const [fr, setFr] = useState('')
    const [expandedId, setExpandedId] = useState(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(null)

    useEffect(() => { fetch(`${api}/data/options`).then(r => r.json()).then(setOptions).catch(() => { }); load() }, [])

    const load = async () => {
        setLoading(true)
        setError(null)
        try {
            let url = `${api}/reports?limit=50`
            if (fp) url += `&product=${encodeURIComponent(fp)}`
            if (fr) url += `&region=${encodeURIComponent(fr)}`
            const res = await fetch(url)
            if (!res.ok) throw new Error('API failed')
            setReports((await res.json()).reports || [])
        } catch (e) {
            if (accountType === 'demo') {
                console.warn('Backend unavailable. Injecting dummy reports.', e)
                setReports([
                    { id: 'rpt-1', product: fp || 'Electronics', region: fr || 'North America', created_at: new Date().toISOString(), content: `## Executive Summary\nDemand for ${fp || 'Electronics'} in ${fr || 'North America'} is projected to surge by 14% over the next quarter.\n\n## Key Drivers\n* Supply chain bottlenecks have eased at major ports.\n* Consumer sentiment indicates high willingness to spend on tech upgrades.\n* Predictive models show an 85% confidence score in this upward trend.\n\n## Risk Factors\n* Moderate inflation could compress margins if pricing is not adjusted.\n* Logistics capacity must be secured early to avoid peak-season surcharges.` },
                    { id: 'rpt-2', product: fp || 'Apparel', region: fr || 'Europe', created_at: new Date(Date.now() - 86400000).toISOString(), content: `## Executive Summary\nThe ${fp || 'Apparel'} market in ${fr || 'Europe'} is stabilizing after a volatile Q2.\n\n## Strategic Recommendations\n* Optimize inventory distribution to central hubs.\n* Implement targeted digital marketing campaigns based on recent RAG contexts highlighting eco-conscious consumer trends.` },
                    { id: 'rpt-3', product: fp || 'Home Goods', region: fr || 'Asia Pacific', created_at: new Date(Date.now() - 172800000).toISOString(), content: `## Overview\nEmerging market signals indicate a massive shift towards domestic manufacturing for ${fp || 'Home Goods'} in ${fr || 'Asia Pacific'}.\n\n## Analytics\n* Demand velocity has increased by 8.4% month-over-month.\n* We recommend expanding warehouse footprint by 20,000 sq ft.` }
                ])
            } else {
                setError('No reports generated yet. Run a prediction from the Predictions page first to generate AI reports.')
                setReports([])
            }
        }
        setLoading(false)
    }

    useEffect(() => { load() }, [fp, fr])

    const downloadPdf = async (id) => {
        try {
            const res = await fetch(`${api}/reports/${id}/pdf`)
            const blob = await res.blob()
            const url = URL.createObjectURL(blob)
            const a = document.createElement('a'); a.href = url; a.download = `report_${id}.pdf`; a.click()
        } catch (e) { console.error(e) }
    }

    const renderReport = (text) => {
        if (!text) return <p style={{ color: 'var(--text-dim)' }}>No content</p>
        return text.split('\n').map((l, i) => {
            if (l.startsWith('## ')) return <motion.h2 initial={{ opacity: 0, x: -5 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }} key={i} style={{ color: '#00f3ff', textShadow: '0 0 10px rgba(0,243,255,0.4)', marginTop: 24, marginBottom: 12, fontFamily: 'var(--font-mono)', fontSize: 16, textTransform: 'uppercase' }}>{l.slice(3)}</motion.h2>
            if (l.startsWith('- ') || l.startsWith('* ')) return <motion.li initial={{ opacity: 0, y: 5 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.08 }} key={i} style={{ color: 'var(--text-secondary)', fontSize: 13, marginLeft: 16, fontFamily: 'var(--font-mono)', marginBottom: 8 }}><span style={{ color: '#b44fff', marginRight: 8, textShadow: '0 0 5px #b44fff' }}>&gt;</span> {l.slice(2)}</motion.li>
            if (!l.trim()) return <br key={i} />
            return <motion.p initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.08 }} key={i} style={{ color: '#8b95b0', fontSize: 13, lineHeight: 1.7, fontFamily: 'var(--font-mono)' }}>{l}</motion.p>
        })
    }

    return (
        <div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-12 mb-24">
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--amber-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <FileText size={22} color="var(--amber)" />
                </div>
                <div>
                    <h2 className="page-title">Reports</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>AI-generated demand intelligence reports</p>
                </div>
            </motion.div>

            <div className="filter-row">
                <Filter size={16} style={{ color: 'var(--text-muted)' }} />
                <select className="select" value={fp} onChange={e => setFp(e.target.value)}>
                    <option value="">All Products</option>
                    {options.products?.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <select className="select" value={fr} onChange={e => setFr(e.target.value)}>
                    <option value="">All Regions</option>
                    {options.regions?.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <span style={{ color: 'var(--text-dim)', fontSize: 12, fontFamily: 'var(--font-mono)' }}>{reports.length} reports</span>
            </div>

            {error && (
                <motion.div className="glass-card mb-24" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ borderColor: 'rgba(255,79,109,0.3)', background: 'rgba(255,0,60,0.05)', marginTop: 16 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <AlertCircle size={20} color="var(--magenta)" />
                        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{error}</p>
                    </div>
                </motion.div>
            )}

            {loading ? (
                <div style={{ textAlign: 'center', padding: 60 }}><div className="spinner spinner-lg" style={{ color: 'var(--teal)' }} /></div>
            ) : reports.length === 0 && !error ? (
                <motion.div className="glass-card" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ textAlign: 'center', padding: 60 }}>
                    <FileText size={40} style={{ color: 'var(--text-dim)', marginBottom: 16 }} />
                    <p style={{ color: 'var(--text-muted)' }}>No reports yet. Run a prediction to generate your first report.</p>
                </motion.div>
            ) : (
                reports.map((r, i) => (
                    <motion.div className="report-item" key={r.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
                        <div className="report-item-header" onClick={() => setExpandedId(expandedId === r.id ? null : r.id)}>
                            <div className="flex items-center gap-12">
                                {expandedId === r.id ? <ChevronUp size={16} style={{ color: 'var(--teal)' }} /> : <ChevronDown size={16} style={{ color: 'var(--text-muted)' }} />}
                                <div>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, fontWeight: 700 }}>{r.product} — {r.region}</div>
                                    <div style={{ fontSize: 11, color: 'var(--text-dim)', marginTop: 2, fontFamily: 'var(--font-mono)' }}>{r.created_at?.slice(0, 16).replace('T', ' ')}</div>
                                </div>
                            </div>
                            <motion.button className="btn btn-ghost btn-sm" whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}
                                onClick={(e) => { e.stopPropagation(); downloadPdf(r.id) }}>
                                <Download size={14} /> PDF
                            </motion.button>
                        </div>
                        <div className={`report-item-body ${expandedId === r.id ? 'expanded' : ''}`} style={{ background: 'linear-gradient(180deg, rgba(10,12,16,0.98), rgba(5,6,8,0.98))', border: expandedId === r.id ? '1px solid rgba(0,243,255,0.3)' : 'none', borderTop: 'none', borderBottomLeftRadius: 12, borderBottomRightRadius: 12, padding: expandedId === r.id ? '32px' : '0 32px', boxShadow: expandedId === r.id ? 'inset 0 0 30px rgba(0,243,255,0.05)' : 'none' }}>
                            <div className="report-content">
                                {expandedId === r.id && (
                                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24, fontSize: 10, fontFamily: 'var(--font-mono)', color: '#00e5b0', letterSpacing: '1px', textTransform: 'uppercase' }}>
                                        <div style={{ width: 8, height: 8, background: '#00e5b0', borderRadius: '50%', boxShadow: '0 0 10px #00e5b0' }} />
                                        Neural Link Active // Decoding Insight Stream...
                                    </motion.div>
                                )}
                                {expandedId === r.id && renderReport(r.content)}
                            </div>
                        </div>
                    </motion.div>
                ))
            )}
        </div>
    )
}

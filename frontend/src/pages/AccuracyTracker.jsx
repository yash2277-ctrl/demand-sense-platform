import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Target, CheckCircle2, Loader2 } from 'lucide-react'

export default function AccuracyTracker({ api, accountType }) {
    const [records, setRecords] = useState([])
    const [summary, setSummary] = useState(null)
    const [selPred, setSelPred] = useState('')
    const [actual, setActual] = useState('')
    const [submitting, setSubmitting] = useState(false)
    const [toast, setToast] = useState(null)

    useEffect(() => { loadAccuracy() }, [])

    const loadAccuracy = async () => {
        try {
            const res = await fetch(`${api}/accuracy`)
            if (!res.ok) throw new Error('API failed')
            const d = await res.json()
            setRecords(d.records || [])
            setSummary(d.summary || null)
        } catch {
            if (accountType === 'demo') {
                console.warn('Backend unavailable. Injecting dummy accuracy records.')
                setRecords([
                    { prediction_id: 142, product: 'Electronics', region: 'North America', predicted_demand: 12500, actual_demand: 12200, mae: 300, mape: 2.4, status: 'Accurate', created_at: new Date().toISOString() },
                    { prediction_id: 140, product: 'Apparel', region: 'Europe', predicted_demand: 8400, actual_demand: 7900, mae: 500, mape: 5.9, status: 'Overestimated', created_at: new Date(Date.now() - 86400000).toISOString() },
                    { prediction_id: 138, product: 'Home Goods', region: 'Asia Pacific', predicted_demand: 18200, actual_demand: 19500, mae: 1300, mape: 7.1, status: 'Underestimated', created_at: new Date(Date.now() - 172800000).toISOString() },
                    { prediction_id: 135, product: 'Electronics', region: 'South America', predicted_demand: 4500, actual_demand: 4450, mae: 50, mape: 1.1, status: 'Accurate', created_at: new Date(Date.now() - 345600000).toISOString() }
                ])
                setSummary({ average_mae: 537.5, average_mape: 4.12, total_records: 4 })
            } else {
                setRecords([])
                setSummary(null)
            }
        }
    }

    const submit = async () => {
        if (!selPred || !actual) return
        setSubmitting(true)
        try {
            const res = await fetch(`${api}/accuracy`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ prediction_id: Number(selPred), actual_demand: Number(actual) }),
            })
            if (!res.ok) throw new Error('API down')
            const d = await res.json()
            if (d.error) { setToast('❌ ' + d.error) } else { setToast('✅ Accuracy recorded!'); loadAccuracy(); setActual('') }
            setTimeout(() => setToast(null), 3000)
        } catch {
            setToast('✅ Simulated accuracy record saved!')
            setActual('')
            setTimeout(() => setToast(null), 3000)
        }
        setSubmitting(false)
    }

    return (
        <div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-12 mb-24">
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--green-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Target size={22} color="var(--green)" />
                </div>
                <div>
                    <h2 className="page-title">Accuracy Tracker</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Track model performance against actual demand</p>
                </div>
            </motion.div>

            <AnimatePresence>
                {toast && (
                    <motion.div className="toast-container" initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 100, opacity: 0 }}>
                        <div className="toast">{toast}</div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div className="glass-card mb-24" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div className="card-title"><CheckCircle2 size={18} className="icon" /> Record Actual Demand</div>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1, minWidth: 180 }}>
                        <label className="card-label">Prediction ID</label>
                        <select className="select" value={selPred} onChange={e => setSelPred(e.target.value)}>
                            <option value="">Select prediction...</option>
                            {Array.from({ length: 10 }, (_, i) => <option key={i + 1} value={i + 1}>Prediction #{i + 1}</option>)}
                        </select>
                    </div>
                    <div style={{ flex: 1, minWidth: 180 }}>
                        <label className="card-label">Actual Demand</label>
                        <input className="input" type="number" placeholder="e.g. 1250" value={actual} onChange={e => setActual(e.target.value)} />
                    </div>
                    <motion.button className="btn btn-primary" onClick={submit} disabled={submitting || !selPred || !actual}
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{ height: 42 }}>
                        {submitting ? <><Loader2 size={16} className="spinner" /> Saving</> : <><CheckCircle2 size={16} /> Submit</>}
                    </motion.button>
                </div>
            </motion.div>

            {summary && (
                <motion.div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.15 }}>
                    <div style={{ background: 'rgba(10,12,16,0.8)', border: '1px solid rgba(0,243,255,0.2)', borderRadius: 16, padding: '24px', boxShadow: 'inset 0 0 20px rgba(0,243,255,0.05)' }}>
                        <div className="mono" style={{ fontSize: 10, color: 'var(--cyan)', marginBottom: 12, letterSpacing: '1px' }}>AVG MAE (ERROR)</div>
                        <div style={{ fontSize: 36, fontWeight: 800, color: '#00f3ff', textShadow: '0 0 20px rgba(0,243,255,0.6)' }}>{summary.average_mae}</div>
                    </div>
                    <div style={{ background: 'rgba(10,12,16,0.8)', border: '1px solid rgba(180,79,255,0.2)', borderRadius: 16, padding: '24px', boxShadow: 'inset 0 0 20px rgba(180,79,255,0.05)' }}>
                        <div className="mono" style={{ fontSize: 10, color: '#b44fff', marginBottom: 12, letterSpacing: '1px' }}>AVG MAPE %</div>
                        <div style={{ fontSize: 36, fontWeight: 800, color: '#b44fff', textShadow: '0 0 20px rgba(180,79,255,0.6)' }}>{summary.average_mape}%</div>
                    </div>
                    <div style={{ background: 'rgba(10,12,16,0.8)', border: '1px solid rgba(0,229,176,0.2)', borderRadius: 16, padding: '24px', boxShadow: 'inset 0 0 20px rgba(0,229,176,0.05)' }}>
                        <div className="mono" style={{ fontSize: 10, color: '#00e5b0', marginBottom: 12, letterSpacing: '1px' }}>TOTAL RUNS</div>
                        <div style={{ fontSize: 36, fontWeight: 800, color: '#00e5b0', textShadow: '0 0 20px rgba(0,229,176,0.4)' }}>{summary.total_records}</div>
                    </div>
                </motion.div>
            )}

            <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className="table-wrap">
                    <table>
                        <thead><tr><th>ID</th><th>Product</th><th>Region</th><th>Predicted</th><th>Actual</th><th>MAE</th><th>MAPE</th><th>Status</th><th>Date</th></tr></thead>
                        <tbody>
                            {records.length > 0 ? records.map((r, i) => (
                                <motion.tr key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.05 }}>
                                    <td><span className="mono">#{r.prediction_id}</span></td>
                                    <td>{r.product}</td><td>{r.region}</td>
                                    <td><span className="mono">{r.predicted_demand?.toLocaleString()}</span></td>
                                    <td><span className="mono">{r.actual_demand?.toLocaleString()}</span></td>
                                    <td><span className="mono">{r.mae}</span></td>
                                    <td><span className="mono">{r.mape}%</span></td>
                                    <td><span className={`badge ${r.status === 'Accurate' ? 'badge-green' : r.status === 'Overestimated' ? 'badge-amber' : 'badge-red'}`}>{r.status}</span></td>
                                    <td style={{ fontSize: 11, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>{r.created_at?.slice(0, 10)}</td>
                                </motion.tr>
                            )) : (
                                <tr><td colSpan={9} style={{ textAlign: 'center', color: 'var(--text-dim)', padding: 48 }}>
                                    No accuracy records yet — submit actual demand values to begin tracking model performance.
                                </td></tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    )
}

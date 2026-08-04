import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload as UploadIcon, FileSpreadsheet, CheckCircle2, XCircle, CloudUpload } from 'lucide-react'

export default function Upload({ api }) {
    const [dragging, setDragging] = useState(false)
    const [uploading, setUploading] = useState(false)
    const [progress, setProgress] = useState(0)
    const [result, setResult] = useState(null)
    const [toast, setToast] = useState(null)
    const fileRef = useRef()

    const handleFile = async (file) => {
        if (!file || !file.name.endsWith('.csv')) return
        setUploading(true); setProgress(0); setResult(null)
        const pi = setInterval(() => setProgress(p => Math.min(p + 12, 90)), 200)
        try {
            const fd = new FormData(); fd.append('file', file)
            const res = await fetch(`${api}/upload`, { method: 'POST', body: fd })
            const data = await res.json()
            clearInterval(pi); setProgress(100); setResult(data)
            setToast('CSV uploaded successfully!'); setTimeout(() => setToast(null), 3000)
        } catch (e) { clearInterval(pi); setProgress(0); setResult({ error: e.message }) }
        setUploading(false)
    }

    return (
        <div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-12 mb-24">
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--teal-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <CloudUpload size={22} color="var(--teal)" />
                </div>
                <div>
                    <h2 className="page-title">Upload Data</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Import your historical sales data in CSV format</p>
                </div>
            </motion.div>

            <AnimatePresence>
                {toast && (
                    <motion.div className="toast-container" initial={{ x: 100, opacity: 0 }} animate={{ x: 0, opacity: 1 }} exit={{ x: 100, opacity: 0 }}>
                        <div className="toast"><CheckCircle2 size={16} /> {toast}</div>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.div
                className={`upload-zone ${dragging ? 'active' : ''}`}
                initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
                onDragOver={e => { e.preventDefault(); setDragging(true) }}
                onDragLeave={() => setDragging(false)}
                onDrop={e => { e.preventDefault(); setDragging(false); handleFile(e.dataTransfer.files[0]) }}
                onClick={() => fileRef.current?.click()}
            >
                <div className="upload-icon-wrapper">
                    <UploadIcon size={32} />
                </div>
                <h3 style={{ fontSize: 18, fontWeight: 700, marginBottom: 6, fontFamily: 'var(--font-heading)' }}>
                    {dragging ? 'Drop your CSV here' : 'Drag & drop your CSV file'}
                </h3>
                <p style={{ color: 'var(--text-muted)', fontSize: 13 }}>or click to browse · supports .csv files</p>
                <input ref={fileRef} type="file" accept=".csv" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
                {uploading && (
                    <div className="progress-track" style={{ maxWidth: 360, margin: '20px auto 0' }}>
                        <motion.div className="progress-fill" animate={{ width: `${progress}%` }} />
                    </div>
                )}
            </motion.div>

            <motion.div className="glass-card mt-24" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
                <div className="card-title"><FileSpreadsheet size={18} className="icon" /> Expected Format</div>
                <div className="table-wrap">
                    <table>
                        <thead><tr><th>date</th><th>product</th><th>region</th><th>demand</th></tr></thead>
                        <tbody>
                            <tr>
                                <td><span className="mono">2024-01-15</span></td>
                                <td>Electronics</td><td>North America</td>
                                <td><span className="mono">1,250.00</span></td>
                            </tr>
                            <tr>
                                <td><span className="mono">2024-01-16</span></td>
                                <td>Clothing</td><td>Europe</td>
                                <td><span className="mono">842.50</span></td>
                            </tr>
                        </tbody>
                    </table>
                </div>
            </motion.div>

            <AnimatePresence>
                {result && !result.error && (
                    <motion.div className="glass-card mt-24" initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0 }}
                        style={{ borderColor: 'rgba(68, 255, 143, 0.2)' }}>
                        <div className="card-title"><CheckCircle2 size={18} style={{ color: 'var(--green)' }} /> Upload Successful</div>
                        <div className="kpi-grid" style={{ gridTemplateColumns: 'repeat(4, 1fr)' }}>
                            <div>
                                <div className="kpi-label">Rows</div>
                                <div className="kpi-value teal" style={{ fontSize: 24 }}>{result.rows_uploaded?.toLocaleString()}</div>
                            </div>
                            <div>
                                <div className="kpi-label">Products</div>
                                <div className="kpi-value blue" style={{ fontSize: 24 }}>{result.unique_products}</div>
                            </div>
                            <div>
                                <div className="kpi-label">Regions</div>
                                <div className="kpi-value blue" style={{ fontSize: 24 }}>{result.unique_regions}</div>
                            </div>
                            <div>
                                <div className="kpi-label">Date Range</div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-primary)', marginTop: 6 }}>
                                    {result.date_range?.start?.slice(0, 10)} → {result.date_range?.end?.slice(0, 10)}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}
                {result?.error && (
                    <motion.div className="glass-card mt-24" initial={{ opacity: 0 }} animate={{ opacity: 1 }} style={{ borderColor: 'var(--red-dim)' }}>
                        <div className="card-title"><XCircle size={18} style={{ color: 'var(--red)' }} /> Error</div>
                        <p style={{ color: 'var(--text-secondary)', fontSize: 13 }}>{result.error}</p>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

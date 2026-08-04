import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { LineChart, Line, AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { TrendingUp, Play, Loader2, Gauge, MapPin, Clock, AlertCircle } from 'lucide-react'

export default function Predictions({ api, accountType }) {
    const [options, setOptions] = useState({ products: [], regions: [] })
    const [product, setProduct] = useState('')
    const [region, setRegion] = useState('')
    const [horizon, setHorizon] = useState(30)
    const [prediction, setPrediction] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetch(`${api}/data/options`).then(r => r.json()).then(d => {
            setOptions(d)
            if (d.products?.length) setProduct(d.products[0])
            if (d.regions?.length) setRegion(d.regions[0])
        }).catch(() => { })
    }, [])

    const run = async () => {
        if (!product || !region) return
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(`${api}/predict`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product, region, horizon }),
            })
            if (!res.ok) throw new Error('API failed')
            const data = await res.json()
            if (data.error) throw new Error(data.error)
            setPrediction(data)
        } catch (e) {
            if (accountType === 'demo') {
                console.warn('Backend unavailable. Injecting dummy prediction data.')
                const hist = []
                let lastVal = 10000 + Math.random() * 5000
                for (let i = 30; i > 0; i--) {
                    hist.push({ date: new Date(Date.now() - i * 86400000).toISOString(), demand: lastVal })
                    lastVal += (Math.random() * 1000 - 450)
                }
                const dates = [], vals = [], ups = [], lows = []
                let pVal = lastVal
                for (let i = 1; i <= horizon; i++) {
                    dates.push(new Date(Date.now() + i * 86400000).toISOString())
                    pVal += (Math.random() * 1200 - 400)
                    vals.push(pVal)
                    ups.push(pVal * 1.15)
                    lows.push(pVal * 0.85)
                }
                setPrediction({
                    product, region, horizon, confidence_score: Math.round(85 + Math.random() * 10),
                    historical: hist,
                    predicted: { dates, values: vals, upper: ups, lower: lows }
                })
            } else {
                setError(e.message || 'No prediction data available. Upload a CSV with matching product/region via Data Ingestion first.')
                setPrediction(null)
            }
        }
        setLoading(false)
    }

    const chartData = () => {
        if (!prediction) return []
        const d = []
            ; (prediction.historical || []).forEach(h => d.push({ date: h.date?.slice(5, 10), historical: Math.round(h.demand) }))
            ; (prediction.predicted?.dates || []).forEach((dt, i) => d.push({
                date: dt?.slice(5, 10),
                predicted: Math.round(prediction.predicted.values[i]),
                upper: Math.round(prediction.predicted.upper?.[i] || prediction.predicted.values[i] * 1.1),
                lower: Math.round(prediction.predicted.lower?.[i] || prediction.predicted.values[i] * 0.9),
            }))
        return d
    }

    return (
        <div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-12 mb-24">
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--cyan-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <TrendingUp size={22} color="var(--cyan)" />
                </div>
                <div>
                    <h2 className="page-title">Predictions</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Run demand forecasts with ensemble models</p>
                </div>
            </motion.div>

            <motion.div className="glass-card mb-24" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', alignItems: 'flex-end' }}>
                    <div style={{ flex: 1, minWidth: 180 }}>
                        <label className="card-label">Product</label>
                        <select className="select" value={product} onChange={e => setProduct(e.target.value)}>
                            {options.products.length === 0 && <option value="">No products available</option>}
                            {options.products.map(p => <option key={p} value={p}>{p}</option>)}
                        </select>
                    </div>
                    <div style={{ flex: 1, minWidth: 180 }}>
                        <label className="card-label">Region</label>
                        <select className="select" value={region} onChange={e => setRegion(e.target.value)}>
                            {options.regions.length === 0 && <option value="">No regions available</option>}
                            {options.regions.map(r => <option key={r} value={r}>{r}</option>)}
                        </select>
                    </div>
                    <div style={{ flex: 1, minWidth: 180 }}>
                        <label className="card-label">Horizon</label>
                        <select className="select" value={horizon} onChange={e => setHorizon(Number(e.target.value))}>
                            <option value={30}>30 days</option><option value={60}>60 days</option><option value={90}>90 days</option>
                        </select>
                    </div>
                    <motion.button className={`btn btn-primary ${loading ? 'btn-pulse' : ''}`} onClick={run} disabled={loading}
                        whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }} style={{ height: 42 }}>
                        {loading ? <><Loader2 size={16} className="spinner" /> Running...</> : <><Play size={16} fill="currentColor" /> Run Prediction</>}
                    </motion.button>
                </div>
            </motion.div>

            {error && (
                <motion.div className="glass-card mb-24" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ borderColor: 'rgba(255,79,109,0.3)', background: 'rgba(255,0,60,0.05)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <AlertCircle size={20} color="var(--magenta)" />
                        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{error}</p>
                    </div>
                </motion.div>
            )}

            {prediction && (
                <>
                    <motion.div className="kpi-grid" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}>
                        <div className="kpi-card">
                            <div className="kpi-icon-box teal"><TrendingUp size={20} /></div>
                            <div className="kpi-label">Product</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--text-primary)' }}>{prediction.product}</div>
                        </div>
                        <div className="kpi-card">
                            <div className="kpi-icon-box blue"><MapPin size={20} /></div>
                            <div className="kpi-label">Region</div>
                            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 16, color: 'var(--text-primary)' }}>{prediction.region}</div>
                        </div>
                        <div className="kpi-card">
                            <div className="kpi-icon-box amber"><Gauge size={20} /></div>
                            <div className="kpi-label">Confidence</div>
                            <div className="kpi-value teal" style={{ fontSize: 28 }}>{prediction.confidence_score}%</div>
                        </div>
                        <div className="kpi-card">
                            <div className="kpi-icon-box purple"><Clock size={20} /></div>
                            <div className="kpi-label">Horizon</div>
                            <div className="kpi-value blue" style={{ fontSize: 28 }}>{prediction.horizon}d</div>
                        </div>
                    </motion.div>

                    <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }}>
                        <div className="card-title"><TrendingUp size={18} className="icon" /> Forecast Results</div>
                        <div className="chart-container">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={chartData()} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
                                    <defs>
                                        <linearGradient id="predConfArea" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="0%" stopColor="#4f8dff" stopOpacity={0.12} />
                                            <stop offset="100%" stopColor="#4f8dff" stopOpacity={0.01} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                                    <XAxis dataKey="date" stroke="#4d5670" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} />
                                    <YAxis stroke="#4d5670" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} axisLine={false} />
                                    <Tooltip contentStyle={{ background: 'var(--bg-card-solid)', border: '1px solid var(--glass-border)', borderRadius: 8, fontSize: 12 }} />
                                    <Area dataKey="upper" stroke="none" fill="url(#predConfArea)" />
                                    <Line type="monotone" dataKey="historical" stroke="#00e5b0" strokeWidth={2} dot={false} name="Historical" />
                                    <Line type="monotone" dataKey="predicted" stroke="#4f8dff" strokeWidth={2} strokeDasharray="8 4" dot={false} name="Predicted" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </motion.div>
                </>
            )}
        </div>
    )
}

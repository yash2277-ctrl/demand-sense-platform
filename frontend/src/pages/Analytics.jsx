import React, { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
    BarChart3, TrendingUp, TrendingDown, Activity, Globe, Package,
    ArrowUpRight, ArrowDownRight
} from 'lucide-react'
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, PieChart, Pie, Cell, RadarChart,
    PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar
} from 'recharts'

const stagger = { hidden: {}, visible: { transition: { staggerChildren: 0.06 } } }
const fadeUp = { hidden: { opacity: 0, y: 16 }, visible: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.16, 1, 0.3, 1] } } }

const COLORS = ['#00e5b0', '#4f8dff', '#b44fff', '#ffb444', '#ff4f6d']

export default function Analytics({ api }) {
    const [options, setOptions] = useState({ products: [], regions: [] })

    useEffect(() => {
        fetch(`${api}/data/options`).then(r => r.json()).then(setOptions).catch(() => { })
    }, [])

    const productDist = [
        { name: 'Electronics', value: 42, trend: 8.2 },
        { name: 'Clothing', value: 31, trend: -2.4 },
        { name: 'Food & Bev', value: 27, trend: 5.1 },
    ]

    const regionData = [
        { region: 'NA', demand: 1450, growth: 12 },
        { region: 'EU', demand: 1230, growth: 8 },
        { region: 'APAC', demand: 1680, growth: 18 },
    ]

    const monthlyTrend = Array.from({ length: 12 }, (_, i) => ({
        month: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i],
        demand: Math.round(1000 + Math.sin(i / 2) * 400 + Math.random() * 200),
        predicted: Math.round(1050 + Math.sin(i / 2) * 380 + Math.random() * 150),
    }))

    const radarData = [
        { metric: 'Accuracy', value: 88 },
        { metric: 'Speed', value: 95 },
        { metric: 'Coverage', value: 72 },
        { metric: 'Freshness', value: 85 },
        { metric: 'Relevance', value: 91 },
        { metric: 'Confidence', value: 82 },
    ]

    const metrics = [
        { label: 'Total Predictions', value: '847', change: '+12.5%', positive: true, icon: TrendingUp, colorName: 'cyan', colorHex: '#00f3ff' },
        { label: 'Avg Confidence', value: '87.3%', change: '+3.2%', positive: true, icon: Activity, colorName: 'magenta', colorHex: '#b44fff' },
        { label: 'Reports Generated', value: '234', change: '+8.7%', positive: true, icon: BarChart3, colorName: 'green', colorHex: '#00e5b0' },
        { label: 'Data Points', value: '19.7K', change: '+15.1%', positive: true, icon: Globe, colorName: 'red', colorHex: '#ff003c' },
    ]

    const correlationData = [
        [1.00, 0.82, 0.45, 0.12],
        [0.82, 1.00, 0.76, 0.34],
        [0.45, 0.76, 1.00, 0.89],
        [0.12, 0.34, 0.89, 1.00]
    ]
    const corrLabels = ["Demand", "Price", "Weather", "Social"]

    return (
        <div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-12 mb-24">
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--blue-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <BarChart3 size={22} color="var(--blue)" />
                </div>
                <div>
                    <h2 className="page-title">Analytics</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Platform performance and demand analytics</p>
                </div>
            </motion.div>

            {/* Metrics */}
            <motion.div className="kpi-grid" variants={stagger} initial="hidden" animate="visible">
                {metrics.map((m, i) => {
                    const Icon = m.icon
                    return (
                        <motion.div className="kpi-card cyber-kpi" key={i} variants={fadeUp} style={{ background: 'rgba(10,12,16,0.8)', border: `1px solid ${m.colorHex}30`, borderRadius: 16, padding: '24px', boxShadow: `inset 0 0 20px ${m.colorHex}10` }}>
                            <div className="mono" style={{ fontSize: 10, color: m.colorHex, marginBottom: 16, letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: 6, textTransform: 'uppercase' }}>
                                <Icon size={14} /> {m.label}
                            </div>
                            <div style={{ fontSize: 36, fontWeight: 800, color: m.colorHex, textShadow: `0 0 20px ${m.colorHex}80`, marginBottom: 8 }}>{m.value}</div>
                            <div className="flex items-center gap-4">
                                {m.positive ? <ArrowUpRight size={14} color="#00e5b0" /> : <ArrowDownRight size={14} color="#ff003c" />}
                                <span style={{ fontSize: 12, fontFamily: 'var(--font-mono)', color: m.positive ? '#00e5b0' : '#ff003c', fontWeight: 700, textShadow: `0 0 10px ${m.positive ? '#00e5b0' : '#ff003c'}` }}>
                                    {m.change}
                                </span>
                                <span style={{ fontSize: 11, color: 'var(--text-dim)', letterSpacing: '0.5px' }}>VS LAST MONTH</span>
                            </div>
                        </motion.div>
                    )
                })}
            </motion.div>

            {/* Charts */}
            <div className="analytics-grid">
                <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}>
                    <div className="card-title"><BarChart3 size={18} className="icon" /> Monthly Demand vs Predicted</div>
                    <div style={{ height: 260 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={monthlyTrend} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.03)" />
                                <XAxis dataKey="month" stroke="#4d5670" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} />
                                <YAxis stroke="#4d5670" fontSize={10} fontFamily="JetBrains Mono" tickLine={false} axisLine={false} />
                                <Tooltip contentStyle={{ background: 'var(--bg-card-solid)', border: '1px solid var(--glass-border)', borderRadius: 8, fontSize: 12 }} />
                                <Bar dataKey="demand" fill="#00e5b0" radius={[4, 4, 0, 0]} opacity={0.8} name="Actual" />
                                <Bar dataKey="predicted" fill="#4f8dff" radius={[4, 4, 0, 0]} opacity={0.6} name="Predicted" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }}>
                    <div className="card-title"><Package size={18} className="icon" /> Product Distribution</div>
                    <div style={{ height: 260, display: 'flex', alignItems: 'center' }}>
                        <ResponsiveContainer width="55%" height="100%">
                            <PieChart>
                                <Pie data={productDist} cx="50%" cy="50%" innerRadius={55} outerRadius={85} dataKey="value" stroke="none">
                                    {productDist.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
                                </Pie>
                            </PieChart>
                        </ResponsiveContainer>
                        <div style={{ flex: 1 }}>
                            {productDist.map((p, i) => (
                                <div key={i} className="flex items-center justify-between" style={{ padding: '10px 0', borderBottom: i < productDist.length - 1 ? '1px solid rgba(255,255,255,0.04)' : 'none' }}>
                                    <div className="flex items-center gap-8">
                                        <div style={{ width: 10, height: 10, borderRadius: 3, background: COLORS[i] }} />
                                        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{p.name}</span>
                                    </div>
                                    <div style={{ textAlign: 'right' }}>
                                        <span className="mono" style={{ fontSize: 13, fontWeight: 700 }}>{p.value}%</span>
                                        <div className="flex items-center gap-4" style={{ justifyContent: 'flex-end' }}>
                                            {p.trend > 0 ? <ArrowUpRight size={10} color="var(--green)" /> : <ArrowDownRight size={10} color="var(--red)" />}
                                            <span style={{ fontSize: 10, color: p.trend > 0 ? 'var(--green)' : 'var(--red)', fontFamily: 'var(--font-mono)' }}>{p.trend > 0 ? '+' : ''}{p.trend}%</span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>

                <motion.div className="glass-card" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
                    <div className="card-title"><Globe size={18} className="icon" /> Regional Demand</div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, marginTop: 8 }}>
                        {regionData.map((r, i) => (
                            <div key={i}>
                                <div className="flex items-center justify-between mb-4">
                                    <span style={{ fontSize: 13, fontWeight: 600 }}>{r.region}</span>
                                    <span className="mono" style={{ fontSize: 14, fontWeight: 700, color: 'var(--teal)' }}>{r.demand.toLocaleString()}</span>
                                </div>
                                <div style={{ height: 6, background: 'rgba(255,255,255,0.06)', borderRadius: 3, overflow: 'hidden' }}>
                                    <motion.div
                                        initial={{ width: 0 }}
                                        animate={{ width: `${(r.demand / 1800) * 100}%` }}
                                        transition={{ duration: 1, delay: 0.4 + i * 0.15 }}
                                        style={{ height: '100%', background: `linear-gradient(90deg, ${COLORS[i]}, ${COLORS[i]}80)`, borderRadius: 3 }}
                                    />
                                </div>
                                <div className="flex items-center gap-4 mt-4">
                                    <ArrowUpRight size={12} color="var(--green)" />
                                    <span style={{ fontSize: 11, fontFamily: 'var(--font-mono)', color: 'var(--green)' }}>+{r.growth}% growth</span>
                                </div>
                            </div>
                        ))}
                    </div>
                </motion.div>

                <motion.div className="glass-card cyber-kpi" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.45 }} style={{ background: 'rgba(10,12,16,0.8)', border: `1px solid rgba(0,243,255,0.1)` }}>
                    <div className="card-title" style={{ color: 'var(--cyan)' }}><Activity size={18} className="icon" /> Model Performance Radar</div>
                    <div style={{ height: 260 }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <RadarChart data={radarData}>
                                <PolarGrid stroke="rgba(0,243,255,0.15)" />
                                <PolarAngleAxis dataKey="metric" tick={{ fill: 'var(--cyan)', fontSize: 11, fontFamily: 'var(--font-mono)' }} />
                                <PolarRadiusAxis angle={30} domain={[0, 100]} tick={false} axisLine={false} />
                                <Radar name="Performance" dataKey="value" stroke="var(--cyan)" fill="var(--cyan)" fillOpacity={0.2} strokeWidth={2} style={{ filter: 'drop-shadow(0 0 8px rgba(0,243,255,0.6))' }} />
                            </RadarChart>
                        </ResponsiveContainer>
                    </div>
                </motion.div>

                <motion.div className="glass-card cyber-kpi" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }} style={{ background: 'rgba(10,12,16,0.8)', border: `1px solid rgba(180,79,255,0.2)` }}>
                    <div className="card-title" style={{ color: '#b44fff' }}><Globe size={18} className="icon" /> Neural Correlation Matrix</div>
                    <div style={{ display: 'grid', gridTemplateColumns: 'auto 1fr 1fr 1fr 1fr', gap: 4, marginTop: 16 }}>
                        <div />
                        {corrLabels.map(l => <div key={l} className="mono" style={{ fontSize: 9, color: 'var(--text-dim)', textAlign: 'center' }}>{l}</div>)}
                        {correlationData.map((row, i) => (
                            <React.Fragment key={i}>
                                <div className="mono" style={{ fontSize: 9, color: 'var(--text-dim)', display: 'flex', alignItems: 'center', justifyContent: 'flex-end', paddingRight: 8 }}>{corrLabels[i]}</div>
                                {row.map((val, j) => (
                                    <div key={j} style={{
                                        background: `rgba(180,79,255,${val * 0.8})`,
                                        height: 48,
                                        borderRadius: 4,
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        color: val > 0.6 ? '#fff' : 'rgba(255,255,255,0.5)',
                                        fontSize: 10,
                                        fontFamily: 'var(--font-mono)',
                                        fontWeight: val > 0.8 ? 800 : 400,
                                        boxShadow: val > 0.8 ? '0 0 10px rgba(180,79,255,0.4)' : 'none'
                                    }}>
                                        {val.toFixed(2)}
                                    </div>
                                ))}
                            </React.Fragment>
                        ))}
                    </div>
                </motion.div>
            </div>
        </div>
    )
}

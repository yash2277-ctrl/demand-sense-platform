import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Brain, Search, Loader2, ExternalLink, AlertCircle } from 'lucide-react'

export default function RAGContext({ api, accountType }) {
    const [options, setOptions] = useState({ products: [], regions: [] })
    const [product, setProduct] = useState('')
    const [region, setRegion] = useState('')
    const [context, setContext] = useState(null)
    const [loading, setLoading] = useState(false)
    const [error, setError] = useState(null)

    useEffect(() => {
        fetch(`${api}/data/options`).then(r => r.json()).then(d => {
            setOptions(d)
            if (d.products?.length) setProduct(d.products[0])
            if (d.regions?.length) setRegion(d.regions[0])
        }).catch(() => { })
    }, [])

    const fetchCtx = async () => {
        if (!product || !region) return
        setLoading(true)
        setError(null)
        try {
            const res = await fetch(`${api}/rag/context`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product, region }),
            })
            if (!res.ok) throw new Error('API failed')
            setContext(await res.json())
        } catch (e) {
            if (accountType === 'demo') {
                console.warn('Backend unavailable. Injecting dummy RAG context.')
                setContext({
                    query: `Impact of recent economic and logistics events on ${product || 'Retail'} demand in ${region || 'Target Area'}`,
                    total_fetched: 142,
                    created_at: new Date().toISOString(),
                    articles: [
                        { category: 'Supply Chain', source: 'Global Logistics Times', title: `${region || 'Target Area'} Port Expansion Speeds Delivery`, description: 'New automated cranes at the primary port have reduced turnaround times by 22%, easing supply bottlenecks for high-demand electronics.', relevance_score: 94, publishedAt: new Date().toISOString() },
                        { category: 'Market Trend', source: 'Economic Forum', title: `Surge in Q4 ${product || 'Retail'} Spending`, description: 'Consumer confidence indices show a sharp uptick in discretionary spending across the middle class expanding demographic.', relevance_score: 88, publishedAt: new Date(Date.now() - 86400000).toISOString() },
                        { category: 'Regulation', source: 'Trade Watch', title: `New Tariffs Lifted on High-Tech Imports`, description: 'The regional government has approved a tax holiday for green technology and smart devices, spurring a massive influx of inventory.', relevance_score: 82, publishedAt: new Date(Date.now() - 172800000).toISOString() },
                        { category: 'Weather', source: 'Climate Monitor', title: 'Unseasonal Storms Delay Inland Transit', description: 'Minor delays reported on major trucking routes due to heavy rainfall, though critical supply chains remain largely unaffected over the weekend.', relevance_score: 75, publishedAt: new Date(Date.now() - 259200000).toISOString() }
                    ]
                })
            } else {
                setError('RAG context requires a configured News API key and FAISS index. Upload data first to build the knowledge graph.')
                setContext(null)
            }
        }
        setLoading(false)
    }

    useEffect(() => { if (product && region) fetchCtx() }, [product, region])

    return (
        <div>
            <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex items-center gap-12 mb-24">
                <div style={{ width: 44, height: 44, borderRadius: 12, background: 'var(--violet-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <Brain size={22} color="var(--violet)" />
                </div>
                <div>
                    <h2 className="page-title">RAG Context</h2>
                    <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Retrieval-Augmented Generation intelligence pipeline</p>
                </div>
            </motion.div>

            <div className="filter-row">
                <select className="select" value={product} onChange={e => setProduct(e.target.value)} style={{ maxWidth: 200 }}>
                    {options.products.length === 0 && <option value="">No products</option>}
                    {options.products.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
                <select className="select" value={region} onChange={e => setRegion(e.target.value)} style={{ maxWidth: 200 }}>
                    {options.regions.length === 0 && <option value="">No regions</option>}
                    {options.regions.map(r => <option key={r} value={r}>{r}</option>)}
                </select>
                <motion.button className={`btn btn-primary btn-sm`} onClick={fetchCtx} disabled={loading}
                    whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                    {loading ? <><Loader2 size={14} className="spinner" /> Fetching</> : <><Search size={14} /> Fetch Context</>}
                </motion.button>
            </div>

            {error && (
                <motion.div className="glass-card mb-24" initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    style={{ borderColor: 'rgba(255,79,109,0.3)', background: 'rgba(255,0,60,0.05)', marginTop: 24 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <AlertCircle size={20} color="var(--magenta)" />
                        <p style={{ color: 'var(--text-secondary)', fontSize: 14 }}>{error}</p>
                    </div>
                </motion.div>
            )}

            {context && (
                <>
                    <motion.div className="glass-card mb-24" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16 }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'var(--cyan-dim)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                                <Search size={16} color="var(--cyan)" />
                            </div>
                            <div>
                                <div className="card-label">Retrieval Query</div>
                                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--cyan)', lineHeight: 1.5 }}>"{context.query}"</div>
                                <div style={{ fontSize: 12, color: 'var(--text-dim)', marginTop: 8, fontFamily: 'var(--font-mono)' }}>
                                    {context.total_fetched} articles • {context.created_at?.slice(0, 10)}
                                </div>
                            </div>
                        </div>
                    </motion.div>

                    <motion.div className="glass-card" initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} style={{ padding: 0 }}>
                        {context.articles?.map((art, i) => (
                            <motion.div className="article-card" key={i} initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.2 + i * 0.08 }}
                                style={{ padding: 24, display: 'flex', justifyContent: 'space-between', gap: 20, alignItems: 'flex-start' }}>
                                <div style={{ flex: 1 }}>
                                    <div className="flex items-center gap-8" style={{ marginBottom: 8 }}>
                                        <span className={`badge badge-${art.category === 'Supply Chain' ? 'amber' : art.category === 'Weather' ? 'blue' :
                                            art.category === 'Regulation' ? 'red' : 'purple'
                                            }`}>{art.category}</span>
                                        <span style={{ fontSize: 11, color: 'var(--text-dim)' }}>{art.source} · {art.publishedAt?.slice(0, 10)}</span>
                                    </div>
                                    <h4 style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-primary)', marginBottom: 6, lineHeight: 1.4 }}>{art.title}</h4>
                                    <p style={{ fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.7 }}>{art.description}</p>
                                </div>
                                <div style={{ textAlign: 'right', minWidth: 90, flexShrink: 0 }}>
                                    <div style={{ fontFamily: 'var(--font-mono)', fontSize: 22, fontWeight: 800, color: art.relevance_score > 80 ? 'var(--cyan)' : 'var(--violet)' }}>
                                        {art.relevance_score}%
                                    </div>
                                    <div style={{ fontSize: 10, color: 'var(--text-dim)', fontFamily: 'var(--font-mono)' }}>RELEVANCE</div>
                                    <div className="relevance-bar" style={{ marginTop: 8 }}>
                                        <motion.div className="relevance-fill"
                                            initial={{ width: 0 }} animate={{ width: `${art.relevance_score}%` }}
                                            transition={{ duration: 1, delay: 0.3 + i * 0.1 }}
                                            style={{ background: art.relevance_score > 80 ? 'var(--cyan)' : 'var(--violet)' }}
                                        />
                                    </div>
                                </div>
                            </motion.div>
                        ))}
                    </motion.div>
                </>
            )}
        </div>
    )
}

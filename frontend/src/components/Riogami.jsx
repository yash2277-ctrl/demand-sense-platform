import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Bot, Sparkles, X, ChevronRight, MessageSquare } from 'lucide-react'

// Riogami AI Assistant - Global Floating Helper
export default function Riogami({ activeTab, setActiveTab }) {
    const [isOpen, setIsOpen] = useState(false)
    const [messages, setMessages] = useState([
        { role: 'assistant', text: 'Greetings, Commander. I am Riogami, your Spatial AI navigator. How may I assist your global expansion today?' }
    ])
    const [input, setInput] = useState('')
    const [isTyping, setIsTyping] = useState(false)
    const endRef = useRef(null)

    // Contextual greetings based on page
    useEffect(() => {
        if (!isOpen) return
        const contextMap = {
            'dashboard': 'We are currently viewing the Global Intelligence Radar. Scan a region to predict demand and fetch neural reports.',
            'upload': 'This is the Data Ingestion Hub. Upload your enterprise CSV here to synchronize the proprietary knowledge graph.',
            'predictions': 'Quantum Predict module active. Run isolated multi-horizon forecasts here.',
            'rag': 'Viewing the RAG Context vector memory. This is what I use to ground my regional intelligence.',
            'reports': 'Accessing the Neural Reports archive. All previous expansion intelligence is securely stored here.',
            'analytics': 'Deep Analytics active. Review cross-regional platform performance.',
            'accuracy': 'Model Accuracy tracker. We maintain a log of MAE and MAPE across all neural nets here.',
            'settings': 'Configuration panel. Adjust system parameters and API integrations here.'
        }

        setMessages(prev => [
            ...prev,
            { role: 'assistant', text: contextMap[activeTab] || 'How can I assist you?' }
        ])
    }, [activeTab, isOpen])

    useEffect(() => {
        if (isOpen && endRef.current) {
            endRef.current.scrollIntoView({ behavior: 'smooth' })
        }
    }, [messages, isTyping, isOpen])

    const handleSend = async (e) => {
        e.preventDefault()
        if (!input.trim()) return

        const userMsg = { role: 'user', text: input }
        setMessages(prev => [...prev, userMsg])
        setInput('')
        setIsTyping(true)

        // API Integration
        try {
            // Check for navigation commands locally to still allow UI control
            const q = input.toLowerCase()
            let navAction = null
            if (q.includes('navigate') || q.includes('go to') || q.includes('open')) {
                if (q.includes('dashboard') || q.includes('globe')) { navAction = 'dashboard' }
                else if (q.includes('predict')) { navAction = 'predictions' }
                else if (q.includes('report')) { navAction = 'reports' }
                else if (q.includes('upload')) { navAction = 'upload' }
                else if (q.includes('analytics')) { navAction = 'analytics' }

                if (navAction) {
                    setActiveTab(navAction)
                    setMessages(prev => [...prev, { role: 'assistant', text: `Navigating to ${navAction}...` }])
                    setIsTyping(false)
                    return
                }
            }

            const currentMessages = messages
            const apiMessages = [...currentMessages, userMsg].map(m => ({
                role: m.role,
                content: m.text
            }))

            const res = await fetch('/api/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ messages: apiMessages })
            })

            if (!res.ok) throw new Error('API Error')

            const reader = res.body.getReader()
            const decoder = new TextDecoder()

            // Add a placeholder assistant message to stream into
            setMessages(prev => [...prev, { role: 'assistant', text: '' }])
            setIsTyping(false)

            while (true) {
                const { value, done } = await reader.read()
                if (done) break

                const chunk = decoder.decode(value)
                const lines = chunk.split('\n')

                for (const line of lines) {
                    if (line.startsWith('data: ')) {
                        const data = line.slice(6)
                        if (data !== '[DONE]') {
                            try {
                                const parsed = JSON.parse(data)
                                if (parsed.done) break
                                if (parsed.text) {
                                    setMessages(prev => {
                                        const newMsgs = [...prev]
                                        // Update the last message
                                        newMsgs[newMsgs.length - 1].text += parsed.text
                                        return newMsgs
                                    })
                                }
                            } catch (e) { }
                        }
                    }
                }
            }
        } catch (e) {
            console.error('Chat error:', e)
            setMessages(prev => [...prev, { role: 'assistant', text: '📡 Connection to Neural Core lost. Ensure the API is running.' }])
            setIsTyping(false)
        }
    }

    return (
        <div style={{ position: 'fixed', bottom: 32, right: 32, zIndex: 9999 }}>
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 20, scale: 0.9 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.9 }}
                        className="glass-card"
                        style={{
                            width: 360,
                            height: 500,
                            marginBottom: 16,
                            padding: 0,
                            display: 'flex',
                            flexDirection: 'column',
                            boxShadow: '0 0 40px rgba(0, 243, 255, 0.2)',
                            border: '1px solid rgba(0, 243, 255, 0.4)'
                        }}
                    >
                        {/* Header */}
                        <div style={{ padding: '16px 20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: 'rgba(0, 243, 255, 0.05)' }}>
                            <div className="flex items-center gap-12">
                                <div style={{ position: 'relative' }}>
                                    <div style={{ width: 32, height: 32, borderRadius: '50%', background: 'linear-gradient(135deg, var(--cyan), var(--violet))', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                        <Bot size={18} color="#000" />
                                    </div>
                                    <div style={{ position: 'absolute', bottom: -2, right: -2, width: 10, height: 10, borderRadius: '50%', background: 'var(--cyan)', border: '2px solid #000', animation: 'pulse 2s infinite' }} />
                                </div>
                                <div>
                                    <h3 style={{ fontSize: 14, fontWeight: 700, color: 'white' }}>Riogami</h3>
                                    <div className="mono" style={{ fontSize: 10, color: 'var(--cyan)' }}>AI SPATIAL NAVIGATOR</div>
                                </div>
                            </div>
                            <button onClick={() => setIsOpen(false)} style={{ background: 'none', border: 'none', color: 'var(--text-muted)', cursor: 'pointer' }}>
                                <X size={18} />
                            </button>
                        </div>

                        {/* Chat Area */}
                        <div style={{ flex: 1, overflowY: 'auto', padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {messages.map((msg, idx) => (
                                <motion.div
                                    key={idx}
                                    initial={{ opacity: 0, x: msg.role === 'user' ? 20 : -20 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    style={{
                                        alignSelf: msg.role === 'user' ? 'flex-end' : 'flex-start',
                                        maxWidth: '85%',
                                        padding: '12px 16px',
                                        borderRadius: 16,
                                        borderBottomRightRadius: msg.role === 'user' ? 4 : 16,
                                        borderBottomLeftRadius: msg.role === 'assistant' ? 4 : 16,
                                        background: msg.role === 'user' ? 'rgba(0, 243, 255, 0.1)' : 'rgba(255, 255, 255, 0.05)',
                                        border: `1px solid ${msg.role === 'user' ? 'rgba(0, 243, 255, 0.2)' : 'var(--glass-border)'}`,
                                        color: msg.role === 'user' ? 'var(--cyan)' : 'white',
                                        fontSize: 13,
                                        lineHeight: 1.5,
                                    }}
                                >
                                    {msg.role === 'assistant' && <Sparkles size={12} color="var(--magenta)" style={{ marginBottom: 6 }} />}
                                    {msg.text}
                                </motion.div>
                            ))}
                            {isTyping && (
                                <div style={{ alignSelf: 'flex-start', padding: '12px 16px', borderRadius: 16, background: 'rgba(255, 255, 255, 0.05)', border: '1px solid var(--glass-border)' }}>
                                    <motion.div animate={{ opacity: [0.4, 1, 0.4] }} transition={{ repeat: Infinity, duration: 1.5 }} className="mono" style={{ fontSize: 10, color: 'var(--cyan)' }}>
                                        PROCESSING...
                                    </motion.div>
                                </div>
                            )}
                            <div ref={endRef} />
                        </div>

                        {/* Input Form */}
                        <form onSubmit={handleSend} style={{ padding: 16, borderTop: '1px solid var(--glass-border)', display: 'flex', gap: 8 }}>
                            <input
                                type="text"
                                placeholder="Ask Riogami..."
                                value={input}
                                onChange={e => setInput(e.target.value)}
                                className="input"
                                style={{ flex: 1, background: 'rgba(0,0,0,0.5)', borderRadius: 24, paddingLeft: 16 }}
                            />
                            <button
                                type="submit"
                                disabled={!input.trim() || isTyping}
                                style={{
                                    width: 40, height: 40, borderRadius: '50%', background: input.trim() ? 'var(--cyan)' : 'rgba(255,255,255,0.1)',
                                    border: 'none', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: input.trim() ? 'pointer' : 'default',
                                    transition: 'all 0.2s', color: '#000'
                                }}
                            >
                                <ChevronRight size={20} />
                            </button>
                        </form>
                    </motion.div>
                )}
            </AnimatePresence>

            <motion.button
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                onClick={() => setIsOpen(!isOpen)}
                style={{
                    width: 64, height: 64, borderRadius: '50%', background: 'linear-gradient(135deg, var(--cyan), var(--violet))',
                    border: '2px solid rgba(0, 243, 255, 0.5)', display: 'flex', alignItems: 'center', justifyContent: 'center',
                    boxShadow: '0 0 30px rgba(0, 243, 255, 0.4)', cursor: 'pointer', outline: 'none', marginLeft: 'auto'
                }}
            >
                {isOpen ? <X size={28} color="#000" /> : <Bot size={28} color="#000" />}
            </motion.button>
        </div>
    )
}

import { useState } from 'react'
import { motion, useMotionValue, useTransform, useSpring } from 'framer-motion'
import Particles from '@tsparticles/react'
import { loadSlim } from '@tsparticles/slim'
import { Zap, Command, ArrowRight, ShieldCheck, Fingerprint, Globe, Activity, Sparkles } from 'lucide-react'

export default function Login({ onLoginType }) {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [hovered, setHovered] = useState(null)

    const particlesInit = async (engine) => { await loadSlim(engine) }

    const handleRealLogin = (e) => {
        e.preventDefault()
        if (email && password) onLoginType('real')
    }

    const handleDemoLogin = () => onLoginType('demo')

    // 3D tilt effect
    const mouseX = useMotionValue(0)
    const mouseY = useMotionValue(0)
    const springX = useSpring(useTransform(mouseX, [-400, 400], [8, -8]), { stiffness: 150, damping: 20 })
    const springY = useSpring(useTransform(mouseY, [-400, 400], [-8, 8]), { stiffness: 150, damping: 20 })

    const handleMouseMove = (e) => {
        const rect = e.currentTarget.getBoundingClientRect()
        mouseX.set(e.clientX - (rect.left + rect.width / 2))
        mouseY.set(e.clientY - (rect.top + rect.height / 2))
    }

    const stats = [
        { icon: Globe, label: 'SPATIAL NODES', value: '47' },
        { icon: Activity, label: 'NEURAL UPTIME', value: '99.7%' },
        { icon: Sparkles, label: 'AI MODELS', value: '3' },
    ]

    return (
        <div className="app-container" onMouseMove={handleMouseMove}
            style={{ position: 'relative', justifyContent: 'center', alignItems: 'center', overflow: 'hidden', background: '#000' }}>

            {/* Particle Background */}
            <Particles id="tsparticles" init={particlesInit} options={{
                background: { color: { value: "#000000" } },
                fpsLimit: 60,
                particles: {
                    color: { value: ["#00f3ff", "#b900ff", "#ff003c"] },
                    links: { color: "#00f3ff", distance: 120, enable: true, opacity: 0.06, width: 1 },
                    move: { enable: true, speed: 0.6, direction: "none", random: true, outModes: { default: "bounce" } },
                    number: { density: { enable: true, area: 900 }, value: 80 },
                    opacity: { value: { min: 0.1, max: 0.4 } },
                    shape: { type: "circle" },
                    size: { value: { min: 1, max: 2.5 } },
                },
                detectRetina: true,
            }} />

            {/* Ambient Gradient Orbs */}
            <div style={{ position: 'absolute', width: '50vw', height: '50vw', background: 'radial-gradient(circle, rgba(0,243,255,0.12) 0%, transparent 60%)', top: '-15%', left: '-15%', filter: 'blur(80px)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', width: '40vw', height: '40vw', background: 'radial-gradient(circle, rgba(185,0,255,0.1) 0%, transparent 60%)', bottom: '-10%', right: '-10%', filter: 'blur(80px)', pointerEvents: 'none' }} />
            <div style={{ position: 'absolute', width: '30vw', height: '30vw', background: 'radial-gradient(circle, rgba(255,0,60,0.06) 0%, transparent 60%)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)', filter: 'blur(100px)', pointerEvents: 'none' }} />

            {/* Scan Line */}
            <motion.div
                animate={{ y: ['0vh', '100vh'] }}
                transition={{ duration: 6, repeat: Infinity, ease: 'linear' }}
                style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 2, background: 'linear-gradient(90deg, transparent, rgba(0,243,255,0.4), transparent)', pointerEvents: 'none', zIndex: 2 }}
            />

            {/* Main Glass Card with 3D Tilt */}
            <motion.div
                initial={{ opacity: 0, scale: 0.92, y: 30 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                style={{
                    width: '90vw', maxWidth: 480, padding: '48px 40px', zIndex: 10,
                    background: 'linear-gradient(145deg, rgba(10,12,18,0.92), rgba(5,5,8,0.96))',
                    backdropFilter: 'blur(40px)',
                    border: '1px solid rgba(0,243,255,0.15)',
                    borderRadius: 24,
                    boxShadow: '0 0 100px rgba(0,0,0,0.9), 0 0 60px rgba(0,243,255,0.08), inset 0 1px 0 rgba(255,255,255,0.05)',
                    rotateX: springY, rotateY: springX,
                    perspective: 1200,
                    transformStyle: "preserve-3d"
                }}
            >
                {/* Holographic top shimmer */}
                <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: 1, background: 'linear-gradient(90deg, transparent 10%, rgba(0,243,255,0.5) 50%, transparent 90%)', borderRadius: '24px 24px 0 0' }} />

                {/* Logo */}
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', marginBottom: 32, transform: "translateZ(40px)" }}>
                    <motion.div
                        initial={{ rotate: -180, scale: 0 }}
                        animate={{ rotate: 0, scale: 1 }}
                        transition={{ type: 'spring', stiffness: 200, damping: 15, delay: 0.2 }}
                        style={{
                            width: 72, height: 72, borderRadius: 20,
                            background: 'linear-gradient(135deg, #00f3ff, #b900ff)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            boxShadow: '0 0 50px rgba(0,243,255,0.5), 0 0 100px rgba(185,0,255,0.2)',
                            marginBottom: 20
                        }}
                    >
                        <Zap size={36} color="#000" strokeWidth={2.5} />
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                        style={{ fontSize: 40, fontWeight: 800, textAlign: 'center', letterSpacing: '-1.5px', color: '#fff', textShadow: '0 0 30px rgba(255,255,255,0.2)' }}>
                        DemandSense
                    </motion.h1>
                    <motion.p
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }}
                        className="mono" style={{ textAlign: 'center', color: '#00f3ff', fontSize: 12, letterSpacing: '3px', textTransform: 'uppercase', textShadow: '0 0 15px rgba(0,243,255,0.5)' }}>
                        SPATIAL INTELLIGENCE PLATFORM
                    </motion.p>
                </div>

                {/* Live Stats Ticker */}
                <motion.div
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.55 }}
                    style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 32, transform: "translateZ(20px)" }}
                >
                    {stats.map((s, i) => (
                        <div key={i} style={{
                            background: 'rgba(0,243,255,0.04)', border: '1px solid rgba(0,243,255,0.1)',
                            borderRadius: 12, padding: '12px 8px', textAlign: 'center'
                        }}>
                            <s.icon size={14} color="#00f3ff" style={{ marginBottom: 6 }} />
                            <div className="mono" style={{ fontSize: 18, fontWeight: 800, color: '#fff', textShadow: '0 0 10px rgba(0,243,255,0.4)' }}>{s.value}</div>
                            <div className="mono" style={{ fontSize: 8, color: 'var(--text-muted)', letterSpacing: '1px', marginTop: 4 }}>{s.label}</div>
                        </div>
                    ))}
                </motion.div>

                {/* Login Form */}
                <motion.form
                    onSubmit={handleRealLogin}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                    style={{ display: 'flex', flexDirection: 'column', gap: 16, marginBottom: 20, transform: "translateZ(10px)" }}
                >
                    <div>
                        <label className="mono" style={{ fontSize: 10, color: '#00f3ff', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6, letterSpacing: '1.5px' }}>
                            <Fingerprint size={12} /> SECURE NODE / EMAIL
                        </label>
                        <input type="email" required className="input"
                            placeholder="operative@demandsense.ai"
                            value={email} onChange={e => setEmail(e.target.value)}
                            style={{ border: '1px solid rgba(0,243,255,0.2)', background: 'rgba(0,5,10,0.8)', height: 48, fontSize: 15, borderRadius: 12 }}
                        />
                    </div>
                    <div>
                        <label className="mono" style={{ fontSize: 10, color: '#00f3ff', marginBottom: 8, display: 'flex', alignItems: 'center', gap: 6, letterSpacing: '1.5px' }}>
                            <ShieldCheck size={12} /> ACCESS KEY / PASSWORD
                        </label>
                        <input type="password" required className="input"
                            placeholder="••••••••••••"
                            value={password} onChange={e => setPassword(e.target.value)}
                            style={{ border: '1px solid rgba(0,243,255,0.2)', background: 'rgba(0,5,10,0.8)', height: 48, fontSize: 15, borderRadius: 12 }}
                        />
                    </div>

                    <motion.button
                        type="submit"
                        whileHover={{ scale: 1.02, boxShadow: '0 0 40px rgba(0,243,255,0.6)' }}
                        whileTap={{ scale: 0.98 }}
                        onMouseEnter={() => setHovered('auth')} onMouseLeave={() => setHovered(null)}
                        className="btn btn-primary"
                        style={{
                            width: '100%', justifyContent: 'center', padding: '16px', marginTop: 8,
                            fontSize: 14, letterSpacing: '2px', borderRadius: 12, fontWeight: 700,
                            background: hovered === 'auth'
                                ? 'linear-gradient(90deg, #00ffff, #7733ff)'
                                : 'linear-gradient(90deg, #00f3ff, #0099ff)',
                            transition: 'background 0.3s'
                        }}>
                        AUTHENTICATE UPLINK <ArrowRight size={18} />
                    </motion.button>
                </motion.form>

                {/* Divider */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.7 }}
                    style={{ display: 'flex', alignItems: 'center', gap: 16, margin: '20px 0', transform: "translateZ(10px)" }}>
                    <div style={{ flex: 1, height: 1, background: 'linear-gradient(90deg, transparent, rgba(0,243,255,0.25))' }} />
                    <span className="mono" style={{ fontSize: 10, color: 'var(--text-muted)', letterSpacing: '2px' }}>DEMO ACCESS</span>
                    <div style={{ flex: 1, height: 1, background: 'linear-gradient(-90deg, transparent, rgba(0,243,255,0.25))' }} />
                </motion.div>

                {/* Demo Button */}
                <motion.button
                    type="button" onClick={handleDemoLogin}
                    initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.75 }}
                    whileHover={{ scale: 1.02, borderColor: 'rgba(185,0,255,0.6)', boxShadow: '0 0 30px rgba(185,0,255,0.3)' }}
                    whileTap={{ scale: 0.98 }}
                    onMouseEnter={() => setHovered('demo')} onMouseLeave={() => setHovered(null)}
                    className="btn"
                    style={{
                        width: '100%', justifyContent: 'center', padding: '16px', fontSize: 13,
                        letterSpacing: '2px', textTransform: 'uppercase', borderRadius: 12,
                        background: hovered === 'demo' ? 'rgba(185,0,255,0.1)' : 'rgba(0,243,255,0.05)',
                        border: '1px solid rgba(0,243,255,0.3)', color: '#00f3ff',
                        transform: "translateZ(20px)", transition: 'all 0.3s'
                    }}
                >
                    <Command size={16} /> INITIALIZE DEMO SIMULATION
                </motion.button>

                {/* Footer */}
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.85 }}
                    className="mono" style={{ textAlign: 'center', marginTop: 28, fontSize: 9, color: 'rgba(255,255,255,0.25)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, letterSpacing: '1.5px' }}>
                    <ShieldCheck size={10} color="#ff003c" /> END-TO-END ENCRYPTED · AES-256
                </motion.div>
            </motion.div>
        </div>
    )
}

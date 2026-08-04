import React, { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import Globe from 'react-globe.gl'
import {
    Search, MapPin, Activity, Zap, ShieldAlert, Cpu,
    TrendingUp, Crosshair, AlertTriangle, Newspaper,
    Download, Share2, X, Target
} from 'lucide-react'
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    LineChart, Line
} from 'recharts'

// ── Curated location database — all 28 Indian states + 8 UTs + world locations ──
const DEMO_LOCATIONS = {
    // ── India (country) ──
    'india': { lat: 20.5937, lng: 78.9629, name: 'India', country: 'India', pop: '1.44B', gdp: '$3.7T', market: 'Hyper-Growth', culture: 'Mobile-First Digital Economy', risk: 'LOW' },

    // ── 28 Indian States ──
    'andhra pradesh': { lat: 15.9129, lng: 79.7400, name: 'Andhra Pradesh', country: 'India', pop: '52.2M', gdp: '$163B', market: 'Emerging', culture: 'Agritech & Pharma Hub', risk: 'LOW' },
    'arunachal pradesh': { lat: 28.2180, lng: 94.7278, name: 'Arunachal Pradesh', country: 'India', pop: '1.7M', gdp: '$4.5B', market: 'Frontier', culture: 'Eco-Tourism & Hydropower', risk: 'MODERATE' },
    'assam': { lat: 26.2006, lng: 92.9376, name: 'Assam', country: 'India', pop: '35.6M', gdp: '$53B', market: 'Emerging', culture: 'Tea & Oil Economy', risk: 'MODERATE' },
    'bihar': { lat: 25.0961, lng: 85.3131, name: 'Bihar', country: 'India', pop: '128.5M', gdp: '$88B', market: 'High-Potential', culture: 'Agricultural Heartland', risk: 'MODERATE' },
    'chhattisgarh': { lat: 21.2787, lng: 81.8661, name: 'Chhattisgarh', country: 'India', pop: '29.4M', gdp: '$47B', market: 'Resource-Rich', culture: 'Mining & Steel Belt', risk: 'MODERATE' },
    'goa': { lat: 15.2993, lng: 74.1240, name: 'Goa', country: 'India', pop: '1.6M', gdp: '$12B', market: 'Niche Luxury', culture: 'Tourism & Hospitality Hub', risk: 'LOW' },
    'gujarat': { lat: 22.2587, lng: 71.1924, name: 'Gujarat', country: 'India', pop: '70.4M', gdp: '$252B', market: 'Industrial Powerhouse', culture: 'Manufacturing & Petrochemicals', risk: 'LOW' },
    'haryana': { lat: 29.0588, lng: 76.0856, name: 'Haryana', country: 'India', pop: '30.2M', gdp: '$122B', market: 'Tech-Adjacent', culture: 'Auto Manufacturing & IT Corridor', risk: 'LOW' },
    'himachal pradesh': { lat: 31.1048, lng: 77.1734, name: 'Himachal Pradesh', country: 'India', pop: '7.5M', gdp: '$25B', market: 'Tourism-Led', culture: 'Hydro Energy & Apple Economy', risk: 'LOW' },
    'jharkhand': { lat: 23.6102, lng: 85.2799, name: 'Jharkhand', country: 'India', pop: '39.3M', gdp: '$46B', market: 'Resource-Based', culture: 'Coal & Minerals Economy', risk: 'HIGH' },
    'karnataka': { lat: 15.3173, lng: 75.7139, name: 'Karnataka', country: 'India', pop: '67.6M', gdp: '$270B', market: 'Tech Capital', culture: 'Silicon Valley of India', risk: 'LOW' },
    'kerala': { lat: 10.8505, lng: 76.2711, name: 'Kerala', country: 'India', pop: '35.6M', gdp: '$118B', market: 'High-HDI', culture: 'Healthcare & Remittance Economy', risk: 'LOW' },
    'madhya pradesh': { lat: 22.9734, lng: 78.6569, name: 'Madhya Pradesh', country: 'India', pop: '85.4M', gdp: '$135B', market: 'Agri-Industrial', culture: 'Soybean & Wheat Belt', risk: 'MODERATE' },
    'maharashtra': { lat: 19.7515, lng: 75.7139, name: 'Maharashtra', country: 'India', pop: '126.4M', gdp: '$450B', market: 'Financial Capital', culture: 'Finance, Film & IT Mega-Hub', risk: 'LOW' },
    'manipur': { lat: 24.6637, lng: 93.9063, name: 'Manipur', country: 'India', pop: '3.1M', gdp: '$4.2B', market: 'Frontier', culture: 'Handloom & Handicraft', risk: 'HIGH' },
    'meghalaya': { lat: 25.4670, lng: 91.3662, name: 'Meghalaya', country: 'India', pop: '3.8M', gdp: '$5.8B', market: 'Frontier', culture: 'Mining & Eco-Tourism', risk: 'MODERATE' },
    'mizoram': { lat: 23.1645, lng: 92.9376, name: 'Mizoram', country: 'India', pop: '1.3M', gdp: '$3.8B', market: 'Frontier', culture: 'Bamboo & Sericulture', risk: 'MODERATE' },
    'nagaland': { lat: 26.1584, lng: 94.5624, name: 'Nagaland', country: 'India', pop: '2.3M', gdp: '$4.1B', market: 'Frontier', culture: 'Organic Agriculture & Crafts', risk: 'MODERATE' },
    'odisha': { lat: 20.9517, lng: 85.0985, name: 'Odisha', country: 'India', pop: '46.4M', gdp: '$73B', market: 'Industrial Growth', culture: 'Steel & Aluminium Corridor', risk: 'MODERATE' },
    'punjab': { lat: 31.1471, lng: 75.3412, name: 'Punjab', country: 'India', pop: '31.0M', gdp: '$85B', market: 'Agri-Rich', culture: 'Green Revolution Breadbasket', risk: 'LOW' },
    'rajasthan': { lat: 27.0238, lng: 74.2179, name: 'Rajasthan', country: 'India', pop: '81.0M', gdp: '$148B', market: 'Tourism & Energy', culture: 'Solar Energy & Heritage Tourism', risk: 'MODERATE' },
    'sikkim': { lat: 27.5330, lng: 88.5122, name: 'Sikkim', country: 'India', pop: '0.7M', gdp: '$5.0B', market: 'Organic Niche', culture: '100% Organic Farming State', risk: 'LOW' },
    'tamil nadu': { lat: 11.1271, lng: 78.6569, name: 'Tamil Nadu', country: 'India', pop: '77.8M', gdp: '$310B', market: 'Diversified Industrial', culture: 'Auto, IT & Textile Powerhouse', risk: 'LOW' },
    'telangana': { lat: 18.1124, lng: 79.0193, name: 'Telangana', country: 'India', pop: '39.3M', gdp: '$158B', market: 'Tech-Forward', culture: 'Pharma City & Cyber Hub', risk: 'LOW' },
    'tripura': { lat: 23.9408, lng: 91.9882, name: 'Tripura', country: 'India', pop: '4.2M', gdp: '$8.2B', market: 'Growing', culture: 'Rubber & Natural Gas', risk: 'MODERATE' },
    'uttar pradesh': { lat: 26.8467, lng: 80.9462, name: 'Uttar Pradesh', country: 'India', pop: '231.5M', gdp: '$268B', market: 'Mass Market Giant', culture: 'FMCG & Agriculture Mega-Market', risk: 'MODERATE' },
    'uttarakhand': { lat: 30.0668, lng: 79.0193, name: 'Uttarakhand', country: 'India', pop: '11.4M', gdp: '$35B', market: 'Pharma & Tourism', culture: 'Pharma Manufacturing & Pilgrimage', risk: 'LOW' },
    'west bengal': { lat: 22.9868, lng: 87.8550, name: 'West Bengal', country: 'India', pop: '99.6M', gdp: '$178B', market: 'Diversified', culture: 'FMCG, Jute & IT Services', risk: 'MODERATE' },

    // ── 8 Union Territories ──
    'delhi': { lat: 28.7041, lng: 77.1025, name: 'Delhi', country: 'India', pop: '32.9M', gdp: '$120B', market: 'Capital Economy', culture: 'National Capital & Commerce Hub', risk: 'LOW' },
    'chandigarh': { lat: 30.7333, lng: 76.7794, name: 'Chandigarh', country: 'India', pop: '1.2M', gdp: '$6.5B', market: 'High Per-Capita', culture: 'Planned City & IT Services', risk: 'LOW' },
    'puducherry': { lat: 11.9416, lng: 79.8083, name: 'Puducherry', country: 'India', pop: '1.7M', gdp: '$5.8B', market: 'Niche', culture: 'Tourism & Heritage Economy', risk: 'LOW' },
    'jammu and kashmir': { lat: 33.7782, lng: 76.5762, name: 'Jammu and Kashmir', country: 'India', pop: '14.9M', gdp: '$28B', market: 'Tourism Recovery', culture: 'Apple, Saffron & Tourism', risk: 'HIGH' },
    'ladakh': { lat: 34.1526, lng: 77.5771, name: 'Ladakh', country: 'India', pop: '0.3M', gdp: '$0.8B', market: 'Frontier', culture: 'Adventure Tourism & Solar Energy', risk: 'MODERATE' },
    'andaman and nicobar islands': { lat: 11.7401, lng: 92.6586, name: 'Andaman and Nicobar Islands', country: 'India', pop: '0.4M', gdp: '$1.2B', market: 'Frontier', culture: 'Maritime & Eco-Tourism', risk: 'MODERATE' },
    'lakshadweep': { lat: 10.5667, lng: 72.6417, name: 'Lakshadweep', country: 'India', pop: '0.07M', gdp: '$0.2B', market: 'Micro', culture: 'Island Tourism & Fisheries', risk: 'LOW' },
    'dadra and nagar haveli': { lat: 20.1809, lng: 73.0169, name: 'Dadra and Nagar Haveli', country: 'India', pop: '0.6M', gdp: '$2.1B', market: 'Industrial Zone', culture: 'Manufacturing & Textiles SEZ', risk: 'LOW' },

    // ── Major World Locations ──
    'usa': { lat: 37.0902, lng: -95.7129, name: 'USA', country: 'USA', pop: '336M', gdp: '$28.8T', market: 'Mature Dominant', culture: 'Tech & Consumer Superpower', risk: 'LOW' },
    'germany': { lat: 51.1657, lng: 10.4515, name: 'Germany', country: 'Germany', pop: '84M', gdp: '$4.5T', market: 'Industrial Leader', culture: 'Auto & Engineering Powerhouse', risk: 'LOW' },
    'brazil': { lat: -14.2350, lng: -51.9253, name: 'Brazil', country: 'Brazil', pop: '216M', gdp: '$2.1T', market: 'Emerging Giant', culture: 'Agribusiness & Mining', risk: 'MODERATE' },
    'china': { lat: 35.8617, lng: 104.1954, name: 'China', country: 'China', pop: '1.43B', gdp: '$18.5T', market: 'Manufacturing Giant', culture: 'World Factory & Tech Innovator', risk: 'MODERATE' },
    'japan': { lat: 36.2048, lng: 138.2529, name: 'Japan', country: 'Japan', pop: '124M', gdp: '$4.2T', market: 'Tech-Mature', culture: 'Robotics & Precision Engineering', risk: 'LOW' },
    'uk': { lat: 55.3781, lng: -3.4360, name: 'United Kingdom', country: 'UK', pop: '68M', gdp: '$3.3T', market: 'Financial Hub', culture: 'Fintech & Services Economy', risk: 'LOW' },
    'france': { lat: 46.2276, lng: 2.2137, name: 'France', country: 'France', pop: '68M', gdp: '$3.0T', market: 'Luxury & Agri', culture: 'Luxury Goods & Aerospace', risk: 'LOW' },
    'australia': { lat: -25.2744, lng: 133.7751, name: 'Australia', country: 'Australia', pop: '26M', gdp: '$1.7T', market: 'Resource-Rich', culture: 'Mining & Services', risk: 'LOW' },
    'canada': { lat: 56.1304, lng: -106.3468, name: 'Canada', country: 'Canada', pop: '40M', gdp: '$2.1T', market: 'Resource & Tech', culture: 'Energy & AI Innovation', risk: 'LOW' },
    'south korea': { lat: 35.9078, lng: 127.7669, name: 'South Korea', country: 'South Korea', pop: '52M', gdp: '$1.7T', market: 'Tech-Advanced', culture: 'Semiconductor & K-Culture', risk: 'LOW' },
    'singapore': { lat: 1.3521, lng: 103.8198, name: 'Singapore', country: 'Singapore', pop: '6M', gdp: '$515B', market: 'Financial Gateway', culture: 'Global Trade & Fintech Hub', risk: 'LOW' },
    'uae': { lat: 23.4241, lng: 53.8478, name: 'UAE', country: 'UAE', pop: '10M', gdp: '$507B', market: 'Diversifying', culture: 'Oil, Tourism & Fintech', risk: 'LOW' },
    'saudi arabia': { lat: 23.8859, lng: 45.0792, name: 'Saudi Arabia', country: 'Saudi Arabia', pop: '36M', gdp: '$1.1T', market: 'Vision 2030', culture: 'Oil to Tech Transition', risk: 'MODERATE' },
    'indonesia': { lat: -0.7893, lng: 113.9213, name: 'Indonesia', country: 'Indonesia', pop: '278M', gdp: '$1.4T', market: 'Digital Surge', culture: 'E-commerce & Palm Oil Giant', risk: 'MODERATE' },
    'mexico': { lat: 23.6345, lng: -102.5528, name: 'Mexico', country: 'Mexico', pop: '130M', gdp: '$1.8T', market: 'Nearshoring Boom', culture: 'Auto & Electronics Manufacturing', risk: 'MODERATE' },
    'nigeria': { lat: 9.0820, lng: 8.6753, name: 'Nigeria', country: 'Nigeria', pop: '224M', gdp: '$472B', market: 'Africa\'s Giant', culture: 'Oil, Fintech & Agriculture', risk: 'HIGH' },
    'south africa': { lat: -30.5595, lng: 22.9375, name: 'South Africa', country: 'South Africa', pop: '60M', gdp: '$399B', market: 'Diversified African', culture: 'Mining, Finance & Tourism', risk: 'MODERATE' },
    'russia': { lat: 61.5240, lng: 105.3188, name: 'Russia', country: 'Russia', pop: '144M', gdp: '$2.2T', market: 'Commodity-Driven', culture: 'Energy & Defense Economy', risk: 'HIGH' },
    'italy': { lat: 41.8719, lng: 12.5674, name: 'Italy', country: 'Italy', pop: '59M', gdp: '$2.2T', market: 'Fashion & Auto', culture: 'Luxury Fashion & Automotive', risk: 'LOW' },
    'spain': { lat: 40.4637, lng: -3.7492, name: 'Spain', country: 'Spain', pop: '48M', gdp: '$1.6T', market: 'Tourism & Renewables', culture: 'Tourism & Green Energy', risk: 'LOW' },
    'thailand': { lat: 15.8700, lng: 100.9925, name: 'Thailand', country: 'Thailand', pop: '72M', gdp: '$535B', market: 'Tourism & Manufacturing', culture: 'Auto Parts & Tourism', risk: 'MODERATE' },
    'vietnam': { lat: 14.0583, lng: 108.2772, name: 'Vietnam', country: 'Vietnam', pop: '100M', gdp: '$430B', market: 'Manufacturing Shift', culture: 'Electronics & Textile Manufacturing', risk: 'LOW' },
    'bangladesh': { lat: 23.6850, lng: 90.3563, name: 'Bangladesh', country: 'Bangladesh', pop: '173M', gdp: '$460B', market: 'Textile Giant', culture: 'Garment Export Powerhouse', risk: 'MODERATE' },
    'pakistan': { lat: 30.3753, lng: 69.3451, name: 'Pakistan', country: 'Pakistan', pop: '235M', gdp: '$374B', market: 'Emerging Consumer', culture: 'Textiles & Agriculture', risk: 'HIGH' },
    'egypt': { lat: 26.8206, lng: 30.8025, name: 'Egypt', country: 'Egypt', pop: '106M', gdp: '$476B', market: 'MENA Gateway', culture: 'Tourism, Suez Canal & Gas', risk: 'MODERATE' },
    'turkey': { lat: 38.9637, lng: 35.2433, name: 'Turkey', country: 'Turkey', pop: '86M', gdp: '$1.1T', market: 'Bridge Economy', culture: 'Auto, Textiles & Defense', risk: 'MODERATE' },
    'poland': { lat: 51.9194, lng: 19.1451, name: 'Poland', country: 'Poland', pop: '38M', gdp: '$842B', market: 'EU Growth Star', culture: 'EU Manufacturing & IT Hub', risk: 'LOW' },
    'netherlands': { lat: 52.1326, lng: 5.2913, name: 'Netherlands', country: 'Netherlands', pop: '18M', gdp: '$1.1T', market: 'Trade & Logistics', culture: 'Port of Europe & Agritech', risk: 'LOW' },
    'switzerland': { lat: 46.8182, lng: 8.2275, name: 'Switzerland', country: 'Switzerland', pop: '9M', gdp: '$884B', market: 'Wealth & Pharma', culture: 'Banking, Pharma & Precision', risk: 'LOW' },
}

// ── Deterministic seeded random for consistent per-region data ──
function seededRandom(seed) {
    let s = seed
    return function () {
        s = (s * 16807) % 2147483647
        return (s - 1) / 2147483646
    }
}

function hashString(str) {
    let hash = 5381
    for (let i = 0; i < str.length; i++) {
        hash = ((hash << 5) + hash) + str.charCodeAt(i)
        hash = hash & hash // Convert to 32bit integer
    }
    return Math.abs(hash)
}

// ── Generate unique deterministic dummy data per region ──
function generateRegionDummyPredictions(regionName, horizon) {
    const seed = hashString(regionName)
    const rng = seededRandom(seed)

    // Base demand varies by region hash — creates unique curves
    const baseDemand = 8000 + rng() * 25000
    const volatility = 0.03 + rng() * 0.08
    const trendSlope = (rng() - 0.4) * 150  // can trend up or down
    const seasonStrength = 1000 + rng() * 4000

    const historical = []
    let value = baseDemand
    for (let i = 30; i > 0; i--) {
        const d = new Date()
        d.setDate(d.getDate() - i)
        const seasonal = seasonStrength * Math.sin(2 * Math.PI * (d.getMonth() / 12))
        value = baseDemand + seasonal + trendSlope * (30 - i) / 30 + (rng() - 0.5) * baseDemand * volatility
        historical.push({ ds: d.toISOString(), y: Math.round(value) })
    }

    const predicted = []
    let pValue = value
    for (let i = 1; i <= horizon; i++) {
        const d = new Date()
        d.setDate(d.getDate() + i)
        const seasonal = seasonStrength * Math.sin(2 * Math.PI * ((d.getMonth() + i / 30) / 12))
        pValue = baseDemand + seasonal + trendSlope * i / 30 + (rng() - 0.5) * baseDemand * volatility
        predicted.push({
            ds: d.toISOString(),
            yhat: Math.round(pValue),
            yhat_lower: Math.round(pValue * (0.82 + rng() * 0.05)),
            yhat_upper: Math.round(pValue * (1.10 + rng() * 0.08))
        })
    }

    const confidence = 72 + rng() * 22  // 72-94 range

    return {
        historical,
        predicted,
        summary: { confidence_score: Math.round(confidence * 10) / 10 }
    }
}

// ── Generate region-specific news ──
function generateRegionNews(regionName, locationData) {
    const culture = locationData?.culture || 'Diversified Economy'
    const market = locationData?.market || 'Emerging'
    const country = locationData?.country || regionName

    return {
        articles: [
            {
                source: 'Global Logistics Intelligence',
                category: 'Supply Chain',
                title: `Major Port & Rail Upgrades Accelerate ${regionName} Trade Flows`,
                relevance_score: 91 + Math.floor(hashString(regionName + 'sc') % 8)
            },
            {
                source: 'Regional Economic Observer',
                category: 'Market Trend',
                title: `${culture} — ${regionName} Sees ${market} Market Dynamics in Q1 2026`,
                relevance_score: 83 + Math.floor(hashString(regionName + 'mt') % 10)
            },
            {
                source: 'Climate Analytics',
                category: 'Weather',
                title: `Monsoon & Seasonal Patterns Reshape Logistics Corridors Near ${regionName}`,
                relevance_score: 74 + Math.floor(hashString(regionName + 'wt') % 12)
            },
            {
                source: `${country} Policy Gazette`,
                category: 'Regulation',
                title: `New Trade Incentives & Tax Reforms Drive Investment into ${regionName}`,
                relevance_score: 68 + Math.floor(hashString(regionName + 'rg') % 14)
            }
        ]
    }
}


export default function Dashboard({ api, accountType }) {
    const globeEl = useRef()
    const [search, setSearch] = useState('')
    const [activeRegion, setActiveRegion] = useState(null)
    const [arcsData, setArcsData] = useState([])

    // Dashboard state
    const [predictionData, setPredictionData] = useState(null)
    const [newsContext, setNewsContext] = useState(null)
    const [reportText, setReportText] = useState('')
    const [horizon, setHorizon] = useState(30)
    const [loading, setLoading] = useState(false)
    const [demographics, setDemographics] = useState(null)
    const [targetRing, setTargetRing] = useState([])

    const getPredictedSeries = (data) => {
        if (!data?.predicted) return []

        // Current backend shape: predicted.{dates,values,lower,upper}
        if (!Array.isArray(data.predicted) && Array.isArray(data.predicted.values)) {
            return data.predicted.values.map((value, idx) => ({
                ds: data.predicted.dates?.[idx],
                yhat: value,
                yhat_lower: data.predicted.lower?.[idx],
                yhat_upper: data.predicted.upper?.[idx],
            }))
        }

        // Demo/fallback shape: predicted[]
        if (Array.isArray(data.predicted)) {
            return data.predicted
        }

        return []
    }

    const getHistoricalSeries = (data) => {
        if (!Array.isArray(data?.historical)) return []

        // Current backend shape: historical[].{date,demand}
        if (data.historical.length > 0 && data.historical[0].date) {
            return data.historical.map((item) => ({ ds: item.date, y: item.demand }))
        }

        // Demo/fallback shape: historical[].{ds,y}
        return data.historical
    }

    useEffect(() => {
        // Generate random arcs for aesthetics
        const arcs = [...Array(20).keys()].map(() => ({
            startLat: (Math.random() - 0.5) * 180, startLng: (Math.random() - 0.5) * 360,
            endLat: (Math.random() - 0.5) * 180, endLng: (Math.random() - 0.5) * 360,
            color: Math.random() > 0.5 ? '#00f3ff' : '#ff003c'
        }))
        setArcsData(arcs)

        if (globeEl.current) {
            globeEl.current.controls().autoRotate = true
            globeEl.current.controls().autoRotateSpeed = 0.5
        }
    }, [])

    const handleSearch = async (e) => {
        e.preventDefault()
        if (!search) return

        const key = search.toLowerCase().trim()

        // Look up in our curated database
        const knownLocation = DEMO_LOCATIONS[key]

        // Deterministic fallback for truly unknown places
        let hash = 0
        for (let i = 0; i < search.length; i++) {
            hash = search.charCodeAt(i) + ((hash << 5) - hash)
        }
        const seed1 = Math.abs(Math.sin(hash++) * 10000)
        const seed2 = Math.abs(Math.sin(hash++) * 10000)
        const fallbackLat = (seed1 - Math.floor(seed1)) * 160 - 80
        const fallbackLng = (seed2 - Math.floor(seed2)) * 360 - 180

        const coords = knownLocation || { lat: fallbackLat, lng: fallbackLng, name: search, country: 'Unknown', pop: 'N/A', gdp: 'N/A', market: 'Unexplored', culture: 'Uncharted Territory', risk: 'UNKNOWN' }

        // Stop auto-rotate, zoom to point
        if (globeEl.current) {
            globeEl.current.controls().autoRotate = false
            globeEl.current.pointOfView({ lat: coords.lat - 25, lng: coords.lng - 30, altitude: 1.2 }, 2000)
            setTargetRing([{ lat: coords.lat, lng: coords.lng }])
        }

        // Delay open panel
        setTimeout(() => {
            setActiveRegion(coords)
            fetchDashboardData(coords)
        }, 1500)
    }

    const fetchDashboardData = async (locationData) => {
        const regionName = locationData.name
        setLoading(true)
        setPredictionData(null)
        setNewsContext(null)
        setReportText('')

        // Set demographics from curated data
        setDemographics({
            culture: locationData.culture || 'Uncharted',
            market: locationData.market || 'Emerging',
            marketSize: locationData.gdp || 'N/A',
            population: locationData.pop || 'N/A',
            risk: locationData.risk || 'UNKNOWN'
        })

        try {
            const product = 'Electronics'

            // 1. Fetch Predictions — use ACTUAL region name, not hardcoded 'NA'
            const predRes = await fetch(`${api}/predict`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product, region: regionName, horizon: horizon })
            })
            if (!predRes.ok) throw new Error('Backend err')
            const pData = await predRes.json()
            if (pData.error) throw new Error(pData.error) // No data for this region — fall through to demo
            setPredictionData(pData)

            // 2. Fetch RAG Context
            const ragRes = await fetch(`${api}/rag/context`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ product, region: regionName })
            })
            if (!ragRes.ok) throw new Error('Backend err')
            const rData = await ragRes.json()
            setNewsContext(rData)

            // 3. Stream AI Report
            const reportRes = await fetch(`${api}/reports/generate`, {
                method: 'POST', headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    product,
                    region: regionName,
                    prediction_summary: {
                        confidence_score: pData.confidence_score,
                        horizon,
                        predicted_head: pData.predicted?.values?.slice(0, 5) || [],
                    },
                    context_articles: rData.articles || [],
                    horizon,
                    confidence: pData.confidence_score || 80,
                })
            })
            if (!reportRes.ok || !reportRes.body) throw new Error('Report generation failed')

            const reader = reportRes.body.getReader()
            const decoder = new TextDecoder()

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
                                setReportText(prev => prev + parsed.text)
                            } catch (e) { }
                        }
                    }
                }
            }
        } catch (e) {
            if (accountType === 'demo') {
                console.warn('Backend unavailable. Generating intelligent region-specific fallbacks.')

                // UNIQUE per-region predictions
                const dummyPred = generateRegionDummyPredictions(regionName, horizon)
                setPredictionData(dummyPred)

                // UNIQUE per-region news
                setNewsContext(generateRegionNews(regionName, locationData))

                // REGION-SPECIFIC streaming report
                const dummyText = `**DEMAND OUTLOOK — ${regionName.toUpperCase()}**\nOur neural network ensemble projects a ${locationData.market?.toLowerCase() || 'emerging'} demand trajectory for electronics in ${regionName}. The region's ${locationData.culture?.toLowerCase() || 'economy'} drives unique demand patterns distinct from other markets.\n\n**KEY DRIVERS**\n1. ${locationData.culture || 'Regional economy'} creates specialized demand corridors.\n2. Population of ${locationData.pop || 'N/A'} with GDP of ${locationData.gdp || 'N/A'} indicates ${locationData.risk === 'LOW' ? 'stable' : 'dynamic'} growth potential.\n\n**RISK ASSESSMENT: ${locationData.risk || 'MODERATE'}**\n${locationData.risk === 'HIGH' ? 'Elevated geopolitical and supply-chain volatility detected.' : locationData.risk === 'LOW' ? 'Stable macro environment with predictable demand curves.' : 'Moderate risk — monitor seasonal disruptions and policy shifts.'}\n\n**RECOMMENDATION**\nScale inventory prepositioning based on ${regionName}'s unique seasonal demand cycles. Adjust coverage by ${Math.round(8 + hashString(regionName) % 20)}% to capture the incoming demand wave.`

                let i = 0
                const interval = setInterval(() => {
                    if (i < dummyText.length) {
                        setReportText(prev => prev + dummyText[i])
                        i++
                    } else {
                        clearInterval(interval)
                    }
                }, 10)
            } else {
                setReportText('⚠ Backend returned no data for this region. Upload a CSV via Data Ingestion to generate real predictions and reports.')
            }
        } finally {
            setLoading(false)
        }
    }

    // ── Build chart data from predictions ──
    let chartData = []
    try {
        const historicalSeries = getHistoricalSeries(predictionData)
        const predictedSeries = getPredictedSeries(predictionData)

        if (historicalSeries.length > 0 || predictedSeries.length > 0) {
            chartData = [
                ...historicalSeries.map(d => ({ date: d.ds ? d.ds.split('T')[0] : '', historical: Math.round(d.y) })),
                ...predictedSeries.map(d => ({ date: d.ds ? d.ds.split('T')[0] : '', predicted: Math.round(d.yhat || 0), lower: Math.round(d.yhat_lower || 0), upper: Math.round(d.yhat_upper || 0) }))
            ]
        }
    } catch (e) {
        console.error("Chart data mapping error", e)
    }

    const predictedSeries = getPredictedSeries(predictionData)
    const latestPredicted = predictedSeries.length > 0
        ? Math.round(predictedSeries[predictedSeries.length - 1]?.yhat || 0)
        : 0
    const confidenceScore = predictionData?.confidence_score ?? predictionData?.summary?.confidence_score

    const riskColor = demographics?.risk === 'HIGH' ? '#ff003c' : demographics?.risk === 'MODERATE' ? '#ffaa00' : demographics?.risk === 'LOW' ? '#00e5b0' : '#8b95b0'

    return (
        <div style={{ position: 'relative', width: '100%', height: 'calc(100vh - 54px)', background: '#000', overflow: 'hidden', display: 'flex', flexDirection: 'column' }}>

            {/* Top 3D Globe Section */}
            <motion.div
                style={{ position: 'relative', width: '100%', height: '100vh', cursor: 'grab', flexShrink: 0 }}
            >
                <Globe
                    ref={globeEl}
                    globeImageUrl="//unpkg.com/three-globe/example/img/earth-blue-marble.jpg"
                    bumpImageUrl="//unpkg.com/three-globe/example/img/earth-topology.png"
                    backgroundImageUrl="//unpkg.com/three-globe/example/img/night-sky.png"
                    arcsData={arcsData}
                    arcColor="color"
                    arcDashLength={() => Math.random()}
                    arcDashGap={() => Math.random()}
                    arcDashAnimateTime={() => Math.random() * 4000 + 500}
                    backgroundColor="#000000"
                    htmlElementsData={targetRing}
                    htmlElement={d => {
                        const el = document.createElement('div')
                        el.innerHTML = `
                            <div style="
                                width: 24px; 
                                height: 24px; 
                                background: rgba(0,243,255,0.4); 
                                border: 2px solid #00f3ff; 
                                border-radius: 50%; 
                                animation: pulse-ring 1.5s cubic-bezier(0.215, 0.61, 0.355, 1) infinite;
                                box-shadow: 0 0 20px #00f3ff;
                            "></div>
                            <style>
                                @keyframes pulse-ring {
                                    0% { transform: scale(0.5); opacity: 1; }
                                    100% { transform: scale(3); opacity: 0; }
                                }
                            </style>
                        `
                        return el
                    }}
                />
                <div className="hologram-scan" />

                {/* Search Overlay */}
                <div style={{ position: 'absolute', top: 32, left: 40, width: 400, zIndex: 10 }}>
                    <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 0.2 }}>
                        <h1 style={{ fontSize: 32, fontWeight: 700, color: 'white', letterSpacing: '-1px', marginBottom: 4 }}>
                            Global Expansion <span className="cyan-glow">Radar</span>
                        </h1>
                        <p className="mono" style={{ fontSize: 11, color: 'var(--cyan)', textTransform: 'uppercase', marginBottom: 24, letterSpacing: '1px' }}>
              // Target Region Spatial Lock — 28 States + 8 UTs + Global
                        </p>

                        <form onSubmit={handleSearch} style={{ position: 'relative' }}>
                            <Search size={18} color="var(--text-muted)" style={{ position: 'absolute', left: 16, top: '50%', transform: 'translateY(-50%)' }} />
                            <input
                                type="text"
                                className="input"
                                placeholder="e.g. Maharashtra, Kerala, USA, Japan..."
                                value={search}
                                onChange={e => setSearch(e.target.value)}
                                style={{ paddingLeft: 48, background: 'rgba(10,10,12,0.8)', backdropFilter: 'blur(10px)', height: 50, fontSize: 16, border: '1px solid rgba(0, 243, 255, 0.3)' }}
                            />
                            <button type="submit" style={{ position: 'absolute', right: 8, top: 8, padding: '6px 16px', background: 'var(--cyan)', border: 'none', borderRadius: 4, color: '#000', fontWeight: 600, cursor: 'pointer', fontFamily: 'var(--font-sans)' }}>
                                SCAN
                            </button>
                        </form>
                    </motion.div>
                </div>
            </motion.div>

            {/* Expanded Dashboard Panel (Right-Aligned) */}
            <AnimatePresence>
                {activeRegion && (
                    <motion.div
                        initial={{ x: 100, opacity: 0 }}
                        animate={{ x: 0, opacity: 1 }}
                        exit={{ x: 100, opacity: 0 }}
                        transition={{ type: 'spring', damping: 25, stiffness: 200 }}
                        style={{
                            position: 'absolute',
                            top: 40,
                            right: 40,
                            width: 540,
                            height: 'calc(100vh - 140px)',
                            overflowY: 'auto',
                            background: 'linear-gradient(135deg, rgba(10,12,16,0.95), rgba(5,6,8,0.98))',
                            backdropFilter: 'blur(40px)',
                            border: '1px solid rgba(0,243,255,0.1)',
                            borderRadius: 24,
                            boxShadow: '0 30px 60px rgba(0,0,0,0.8), inset 0 1px 0 rgba(255,255,255,0.05), 0 0 40px rgba(0,243,255,0.1)',
                            padding: '32px',
                            zIndex: 50
                        }}
                        className="cyber-panel-scroll"
                    >
                        {/* Target Header */}
                        <div className="mono" style={{ fontSize: 11, color: 'var(--cyan)', marginBottom: 8, letterSpacing: '1.5px', display: 'flex', alignItems: 'center', gap: 6 }}>
                            <Crosshair size={14} /> TARGET LOCK ACQUIRED
                        </div>

                        <h2 style={{ fontSize: 42, fontWeight: 800, color: 'white', marginBottom: 4, letterSpacing: '-1px' }}>
                            {activeRegion.name}
                        </h2>
                        {activeRegion.country && activeRegion.country !== activeRegion.name && (
                            <p className="mono" style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16, letterSpacing: '1px' }}>
                                {activeRegion.country} • POP {demographics?.population || 'N/A'}
                            </p>
                        )}

                        <button onClick={() => setActiveRegion(null)}
                            style={{
                                background: 'linear-gradient(90deg, #ff0055, #b44fff)',
                                border: 'none',
                                color: 'white',
                                cursor: 'pointer',
                                padding: '8px 16px',
                                borderRadius: 8,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                fontWeight: 600,
                                fontSize: 13,
                                boxShadow: '0 4px 15px rgba(255, 0, 85, 0.4)',
                                marginBottom: 32
                            }}>
                            <X size={14} /> Close Terminal
                        </button>

                        {/* Top 4 Metrics Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                            {/* Demand */}
                            <div style={{ background: 'rgba(15,18,25,0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: '20px' }}>
                                <div className="mono" style={{ fontSize: 10, color: 'var(--cyan)', marginBottom: 16, letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <TrendingUp size={12} /> PREDICTED DEMAND
                                </div>
                                <div style={{ fontSize: 36, fontWeight: 800, color: '#00f3ff', textShadow: '0 0 20px rgba(0,243,255,0.6)', marginBottom: 12 }}>
                                    {latestPredicted > 0 ? latestPredicted.toLocaleString() : '—'}
                                </div>
                                <div className="mono" style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.5px' }}>
                                    {horizon}-DAY FORECAST
                                </div>
                            </div>

                            {/* Confidence */}
                            <div style={{ background: 'rgba(15,18,25,0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: '20px' }}>
                                <div className="mono" style={{ fontSize: 10, color: 'var(--cyan)', marginBottom: 16, letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Target size={12} /> MODEL CONFIDENCE
                                </div>
                                <div style={{ fontSize: 36, fontWeight: 800, color: '#b44fff', textShadow: '0 0 20px rgba(180,79,255,0.6)', marginBottom: 12 }}>
                                    {confidenceScore || '—'}%
                                </div>
                                <div className="mono" style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.5px' }}>
                                    PROPHET + ARIMA ENSEMBLE
                                </div>
                            </div>

                            {/* Risk */}
                            <div style={{ background: 'rgba(15,18,25,0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: '20px' }}>
                                <div className="mono" style={{ fontSize: 10, color: 'var(--cyan)', marginBottom: 16, letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <AlertTriangle size={12} /> RISK ANALYSIS
                                </div>
                                <div style={{ fontSize: 28, fontWeight: 800, color: riskColor, textShadow: `0 0 20px ${riskColor}88`, marginBottom: 12, marginTop: 8 }}>
                                    {demographics?.risk || 'UNKNOWN'}
                                </div>
                                <div className="mono" style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.5px' }}>
                                    {demographics?.risk === 'HIGH' ? 'ELEVATED VOLATILITY' : demographics?.risk === 'LOW' ? 'STABLE MACRO' : 'MONITOR ACTIVELY'}
                                </div>
                            </div>

                            {/* Context */}
                            <div style={{ background: 'rgba(15,18,25,0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: '20px' }}>
                                <div className="mono" style={{ fontSize: 10, color: 'var(--cyan)', marginBottom: 16, letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Newspaper size={12} /> RAG CONTEXT SIGNALS
                                </div>
                                <div style={{ fontSize: 36, fontWeight: 800, color: 'white', textShadow: '0 0 20px rgba(255,255,255,0.4)', marginBottom: 12 }}>
                                    {newsContext?.articles?.length || '—'}
                                </div>
                                <div className="mono" style={{ fontSize: 9, color: 'var(--text-dim)', letterSpacing: '0.5px' }}>
                                    VERIFIED SOURCES
                                </div>
                            </div>
                        </div>

                        {/* ── DEMAND TREND CHART ── */}
                        {chartData.length > 0 && (
                            <div style={{ background: 'rgba(15,18,25,0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: '20px', marginBottom: 16 }}>
                                <div className="mono" style={{ fontSize: 10, color: '#00f3ff', marginBottom: 16, letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <TrendingUp size={12} /> DEMAND TREND — {activeRegion.name.toUpperCase()}
                                </div>
                                <ResponsiveContainer width="100%" height={180}>
                                    <AreaChart data={chartData} margin={{ top: 5, right: 5, bottom: 5, left: 5 }}>
                                        <defs>
                                            <linearGradient id="gradHistorical" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#00f3ff" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#00f3ff" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="gradPredicted" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#b44fff" stopOpacity={0.4} />
                                                <stop offset="95%" stopColor="#b44fff" stopOpacity={0} />
                                            </linearGradient>
                                            <linearGradient id="gradConfidence" x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor="#b44fff" stopOpacity={0.1} />
                                                <stop offset="95%" stopColor="#b44fff" stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <XAxis dataKey="date" tick={false} axisLine={{ stroke: 'rgba(255,255,255,0.05)' }} />
                                        <YAxis hide />
                                        <Tooltip
                                            contentStyle={{ background: 'rgba(10,12,16,0.95)', border: '1px solid rgba(0,243,255,0.2)', borderRadius: 8, fontSize: 11, fontFamily: 'var(--font-mono)' }}
                                            labelStyle={{ color: '#00f3ff' }}
                                        />
                                        <Area type="monotone" dataKey="lower" stroke="none" fill="url(#gradConfidence)" />
                                        <Area type="monotone" dataKey="upper" stroke="none" fill="url(#gradConfidence)" />
                                        <Area type="monotone" dataKey="historical" stroke="#00f3ff" strokeWidth={2} fill="url(#gradHistorical)" dot={false} />
                                        <Area type="monotone" dataKey="predicted" stroke="#b44fff" strokeWidth={2} fill="url(#gradPredicted)" dot={false} strokeDasharray="5 3" />
                                    </AreaChart>
                                </ResponsiveContainer>
                                <div style={{ display: 'flex', gap: 16, justifyContent: 'center', marginTop: 8 }}>
                                    <span className="mono" style={{ fontSize: 9, color: '#00f3ff', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <span style={{ width: 12, height: 2, background: '#00f3ff', borderRadius: 1 }} /> HISTORICAL
                                    </span>
                                    <span className="mono" style={{ fontSize: 9, color: '#b44fff', display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <span style={{ width: 12, height: 2, background: '#b44fff', borderRadius: 1, borderStyle: 'dashed' }} /> PREDICTED
                                    </span>
                                </div>
                            </div>
                        )}

                        {/* Demographics Grid */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                            {/* GDP / Market Size */}
                            <div style={{ background: 'rgba(15,18,25,0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: '20px' }}>
                                <div className="mono" style={{ fontSize: 10, color: '#ff003c', marginBottom: 16, letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Activity size={12} /> GDP / MARKET SIZE
                                </div>
                                <div style={{ fontSize: 28, fontWeight: 800, color: 'white' }}>
                                    {demographics?.marketSize || 'N/A'}
                                </div>
                            </div>

                            {/* Market Phase */}
                            <div style={{ background: 'rgba(15,18,25,0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: '20px' }}>
                                <div className="mono" style={{ fontSize: 10, color: '#00e5b0', marginBottom: 16, letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <TrendingUp size={12} /> MARKET PHASE
                                </div>
                                <div style={{ fontSize: 24, fontWeight: 800, color: '#00e5b0', textShadow: '0 0 15px rgba(0,229,176,0.4)' }}>
                                    {demographics?.market || 'Emerging'}
                                </div>
                            </div>
                        </div>

                        {/* Culture/Economy Profile */}
                        <div style={{ background: 'rgba(15,18,25,0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: '20px', marginBottom: 16 }}>
                            <div className="mono" style={{ fontSize: 10, color: '#b44fff', marginBottom: 16, letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: 6 }}>
                                <MapPin size={12} /> ECONOMIC PROFILE
                            </div>
                            <div style={{ fontSize: 24, fontWeight: 800, color: 'white' }}>
                                {demographics?.culture || 'Uncharted Territory'}
                            </div>
                        </div>

                        {/* News Articles */}
                        {newsContext?.articles && (
                            <div style={{ background: 'rgba(15,18,25,0.8)', border: '1px solid rgba(255,255,255,0.05)', borderRadius: 16, padding: '20px', marginBottom: 16 }}>
                                <div className="mono" style={{ fontSize: 10, color: 'var(--cyan)', marginBottom: 16, letterSpacing: '1px', display: 'flex', alignItems: 'center', gap: 6 }}>
                                    <Newspaper size={12} /> INTELLIGENCE FEED — {activeRegion.name.toUpperCase()}
                                </div>
                                {newsContext.articles.map((art, i) => (
                                    <div key={i} style={{ padding: '12px 0', borderBottom: i < newsContext.articles.length - 1 ? '1px solid rgba(255,255,255,0.05)' : 'none' }}>
                                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 4 }}>
                                            <span className="mono" style={{ fontSize: 9, color: art.category === 'Supply Chain' ? '#ffaa00' : art.category === 'Weather' ? '#00aaff' : art.category === 'Regulation' ? '#ff003c' : '#b44fff', letterSpacing: '1px' }}>
                                                {art.category?.toUpperCase()}
                                            </span>
                                            <span className="mono" style={{ fontSize: 12, fontWeight: 800, color: art.relevance_score > 85 ? '#00f3ff' : '#b44fff' }}>
                                                {art.relevance_score}%
                                            </span>
                                        </div>
                                        <p style={{ color: '#ccd0dc', fontSize: 12, lineHeight: 1.5, fontWeight: 600 }}>
                                            {art.title}
                                        </p>
                                        {art.source && (
                                            <span className="mono" style={{ fontSize: 9, color: 'var(--text-dim)' }}>{art.source}</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}

                        <style>{`
                            .cyber-panel-scroll::-webkit-scrollbar {
                                width: 6px;
                            }
                            .cyber-panel-scroll::-webkit-scrollbar-track {
                                background: rgba(0,0,0,0.2);
                                border-radius: 4px;
                            }
                            .cyber-panel-scroll::-webkit-scrollbar-thumb {
                                background: rgba(0, 243, 255, 0.3);
                                border-radius: 4px;
                            }
                            .cyber-panel-scroll::-webkit-scrollbar-thumb:hover {
                                background: rgba(0, 243, 255, 0.6);
                            }
                        `}
                        </style>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

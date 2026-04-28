import { useState, useMemo, useEffect } from 'react'
import { motion } from 'framer-motion'

const STORAGE_KEY = 'pitch-me-order'

const initialNames = [
  "Francisco Felix Soto",
  "Daniel Minichetti",
  "Caitlin Driscoll",
  "Tomas Araya",
  "Nadeem Akram",
  "Jeff Hector"
]

const COLORS = [
  '#ef4444',
  '#f97316',
  '#facc15',
  '#22c55e',
  '#3b82f6',
  '#8b5cf6',
  '#ec4899',
]

function polarToCartesian(cx, cy, r, angle) {
  const rad = (angle - 90) * Math.PI / 180
  return { x: cx + r * Math.cos(rad), y: cy + r * Math.sin(rad) }
}

function describeArc(cx, cy, r, startAngle, endAngle) {
  const start = polarToCartesian(cx, cy, r, endAngle)
  const end = polarToCartesian(cx, cy, r, startAngle)
  const largeArcFlag = endAngle - startAngle <= 180 ? '0' : '1'

  return `M ${cx} ${cy} L ${start.x} ${start.y} A ${r} ${r} 0 ${largeArcFlag} 0 ${end.x} ${end.y} Z`
}

export default function App() {
  const [names, setNames] = useState(initialNames)
  const [order, setOrder] = useState([])
  const [rotation, setRotation] = useState(0)
  const [spinning, setSpinning] = useState(false)

  useEffect(() => {
    const saved = localStorage.getItem(STORAGE_KEY)
    if (saved) {
      const parsed = JSON.parse(saved)
      setOrder(parsed)
      setNames(initialNames.filter(n => !parsed.includes(n)))
    }
  }, [])

  useEffect(() => {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(order))
  }, [order])

  const slices = useMemo(() => {
    if (!names.length) return []
    const angle = 360 / names.length
    return names.map((name, i) => ({
      name,
      color: COLORS[i % COLORS.length],
      path: describeArc(128, 128, 128, i * angle, (i + 1) * angle),
      labelAngle: i * angle + angle / 2
    }))
  }, [names])

  const spin = () => {
    if (spinning || !names.length) return
    setSpinning(true)

    const index = Math.floor(Math.random() * names.length)
    const angle = 360 / names.length
    const spins = Math.floor(Math.random() * 5) + 5
    const final = spins * 360 + (360 - index * angle - angle / 2)

    setRotation(r => r + final)

    setTimeout(() => {
      setOrder(o => [...o, names[index]])
      setNames(n => n.filter((_, i) => i !== index))
      setSpinning(false)
    }, 3000)
  }

  const reset = () => {
    localStorage.removeItem(STORAGE_KEY)
    setNames(initialNames)
    setOrder([])
    setRotation(0)
  }

  return (
    <div style={{ textAlign: 'center', padding: 20 }}>
      <h1>Pitch Me Order</h1>

      <motion.svg
        width="256"
        height="256"
        viewBox="0 0 256 256"
        animate={{ rotate: rotation }}
        transition={{ duration: 3, ease: 'easeOut' }}
      >
        {slices.map(s => (
          <g key={s.name}>
            <path d={s.path} fill={s.color} stroke="#fff" />
            <text
              x="128"
              y="128"
              fill="#fff"
              fontSize="10"
              textAnchor="middle"
              dominantBaseline="middle"
              transform={`rotate(${s.labelAngle}, 128,128) translate(0,-90)`}
            >
              {s.name}
            </text>
          </g>
        ))}
      </motion.svg>

      <div style={{ marginTop: 16 }}>
        <button onClick={spin} disabled={spinning || !names.length}>Spin</button>
        <button onClick={reset} style={{ marginLeft: 8 }}>Reset Week</button>
      </div>

      <h3>Pitch Order</h3>
      <ol>{order.map((n, i) => <li key={i}>{n}</li>)}</ol>
    </div>
  )
}
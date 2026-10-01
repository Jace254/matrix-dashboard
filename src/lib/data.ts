// Realistic seed data for the Overview dashboard. Values mirror the Figma frame exactly
// (the monthly sales series reproduces the design's pixel grid column-for-column).

export type Period = "weekly" | "monthly" | "yearly"

export const kpis = [
  { id: "revenue", label: "Total Revenue", value: 20320, prefix: "$", decimals: 0, unit: "", delta: 0.94,
    bars: [30, 38, 31, 35, 43, 31, 31], accent: 3 },
  { id: "orders", label: "Total Orders", value: 10320, prefix: "", decimals: 0, unit: "Orders", delta: 0.94,
    bars: [30, 38, 31, 45, 22, 31, 31], accent: 3 },
  { id: "customers", label: "New Customers", value: 4305, prefix: "", decimals: 0, unit: "New Users", delta: 0.94,
    bars: [26, 36, 28, 42, 38, 24, 33], accent: 3 },
  { id: "conversion", label: "Conversion Rate", value: 3.9, prefix: "", suffix: "%", decimals: 1, unit: "", delta: 0.94,
    bars: [28, 34, 26, 40, 30, 36, 29], accent: 3 },
] as const

/** Pixel chart geometry: 25 rows, each row = 2.5k. */
export const PIXEL_ROWS = 25
export const ROW_VALUE = 2.5

// Column heights (in cells) read straight from the Figma grid.
const monthlyNewCells = [4, 5, 6, 8, 11, 9, 7, 10, 15, 13, 9, 6, 10, 9, 7, 6, 8, 12, 15, 20, 10, 7, 4, 2, 5, 9, 16, 8, 6, 8, 9, 15, 12, 10, 7, 3, 1, 9, 13, 16, 9, 8, 6, 4, 8, 10, 6, 5, 7, 10, 15, 13, 8, 6, 7, 8, 12]
const monthlyExistingCells = [1, 2, 3, 2, 5, 7, 5, 6, 3, 1, 5, 3, 4, 6, 4, 3, 1, 3, 8, 5, 3, 2, 1, 2, 3, 6, 4, 5, 3, 1, 2, 9, 5, 2, 2, 1, 1, 3, 4, 7, 3, 3, 2, 1, 2, 8, 3, 4, 5, 3, 1, 2, 2, 4, 6, 3, 1]

/** Deterministic pseudo-random in [0,1). */
function rand(seed: number) {
  const x = Math.sin(seed * 9301 + 49297) * 233280
  return x - Math.floor(x)
}

/** Turn a cell count back into a realistic value (k) that lands in that cell. */
function cellsToValue(cells: number, seed: number) {
  if (cells <= 0) return 0
  return +(cells * ROW_VALUE - rand(seed) * 2.3).toFixed(1)
}

export const valueToCells = (v: number) => Math.min(PIXEL_ROWS, Math.max(0, Math.ceil(v / ROW_VALUE - 1e-9)))

export type SeriesPoint = { label: string; newUser: number; existing: number }

const MONTHS = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"]

function monthly(): SeriesPoint[] {
  return monthlyNewCells.map((n, i) => {
    const m = Math.min(11, Math.floor((i * 12) / 57))
    return { label: `${MONTHS[m]} 2025`, newUser: cellsToValue(n, i + 1), existing: cellsToValue(monthlyExistingCells[i], i + 101) }
  }).map((p, i) => (i === 26 ? { ...p, newUser: 38, existing: 9.6 } : p)) // highlighted point in the design (Jun 2025)
}

function synth(count: number, base: number, amp: number, seedBase: number, label: (i: number) => string): SeriesPoint[] {
  return Array.from({ length: count }, (_, i) => {
    const wave = Math.sin(i / 2.7 + seedBase) * 0.5 + Math.sin(i / 6.1 + seedBase * 2) * 0.35
    const nu = Math.max(2.5, base + wave * amp + (rand(i + seedBase * 17) - 0.5) * amp * 0.9)
    const ex = Math.max(1.2, nu * (0.28 + rand(i * 3 + seedBase) * 0.3))
    return { label: label(i), newUser: +Math.min(59, nu).toFixed(1), existing: +ex.toFixed(1) }
  })
}

const DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]

export const salesSeries: Record<Period, { points: SeriesPoint[]; axis: string[]; total: number }> = {
  monthly: { points: monthly(), axis: MONTHS, total: 20320 },
  weekly: {
    points: synth(57, 21, 18, 3, (i) => `${DAYS[Math.min(6, Math.floor((i * 7) / 57))]}, ${String(Math.floor(i / 2) % 24).padStart(2, "0")}:00`),
    axis: DAYS,
    total: 4860,
  },
  yearly: {
    points: synth(57, 30, 16, 7, (i) => `${2014 + Math.min(11, Math.floor((i * 12) / 57))}`),
    axis: Array.from({ length: 12 }, (_, i) => `${2014 + i}`),
    total: 243840,
  },
}

/** Revenue breakdown — 13 daily samples, heights (px) straight from Figma; 1px = $10. */
export const revenueBars = [
  { x: 29.4, total: 143, value: 96 },
  { x: 53.4, total: 175, value: 128 },
  { x: 77.4, total: 120, value: 73 },
  { x: 101.4, total: 197, value: 154 },
  { x: 125.4, total: 154, value: 102.72 },
  { x: 149.4, total: 109, value: 73 },
  { x: 173.4, total: 143, value: 109 },
  { x: 197.4, total: 109, value: 67 },
  { x: 221.4, total: 186, value: 146 },
  { x: 245.4, total: 130, value: 81 },
  { x: 269.4, total: 166, value: 120 },
  { x: 293.4, total: 143, value: 83 },
  { x: 317.4, total: 126, value: 81 },
].map((b, i) => ({ ...b, date: `Jan ${1 + Math.round((i * 29) / 12)}`, revenue: Math.round(b.value * 10), target: Math.round(b.total * 10) }))

export type Status = "Success" | "Pending" | "Refunded"
export type Transaction = { id: string; customer: string; product: string; status: Status; qty: number; unitPrice: number; total: number }

export const transactions: Transaction[] = [
  { id: "#04910", customer: "Ryan Korsgaard", product: "Ergo Office Chair", status: "Success", qty: 12, unitPrice: 3450, total: 41400 },
  { id: "#04911", customer: "Madelyn Lubin", product: "Sunset Desk 02", status: "Success", qty: 20, unitPrice: 2980, total: 89200 },
  { id: "#04912", customer: "Abram Bergson", product: "Eco Bookshelf", status: "Pending", qty: 22, unitPrice: 1750, total: 75900 },
  { id: "#04913", customer: "Phillip Mango", product: "Green Leaf Desk", status: "Refunded", qty: 24, unitPrice: 1950, total: 19500 },
]

export const extraTransactions: Omit<Transaction, "id">[] = [
  { customer: "Kianna Dorwart", product: "Oak Standing Desk", status: "Pending", qty: 6, unitPrice: 2150, total: 12900 },
  { customer: "Cristofer Vetrovs", product: "Mesh Task Chair", status: "Success", qty: 14, unitPrice: 890, total: 12460 },
  { customer: "Alena Geidt", product: "Walnut Side Table", status: "Success", qty: 9, unitPrice: 640, total: 5760 },
]

export const fmtMoney = (n: number) => `$${Math.round(n).toLocaleString("en-US")}`

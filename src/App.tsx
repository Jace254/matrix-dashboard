import { useEffect, useState } from "react"
import { AnimatePresence, motion } from "motion/react"

import { Sidebar } from "@/components/dashboard/sidebar"
import { Header } from "@/components/dashboard/header"
import { ContentHeader } from "@/components/dashboard/content-header"
import { KpiCards } from "@/components/dashboard/kpi-cards"
import { SalesTrend } from "@/components/dashboard/sales-trend"
import { RevenueBreakdown } from "@/components/dashboard/revenue-breakdown"
import { TransactionsTable } from "@/components/dashboard/transactions-table"
import { TooltipProvider } from "@/components/ui/tooltip"
import { transactions } from "@/lib/data"

function exportCsv() {
  const head = "id,customer,product,status,qty,unit_price,total_revenue"
  const body = transactions.map((t) => [t.id, t.customer, t.product, t.status, t.qty, t.unitPrice, t.total].join(",")).join("\n")
  const url = URL.createObjectURL(new Blob([`${head}\n${body}\n`], { type: "text/csv" }))
  const a = Object.assign(document.createElement("a"), { href: url, download: "spark-overview-2025-11-06.csv" })
  a.click()
  setTimeout(() => URL.revokeObjectURL(url), 1000)
}

export default function App() {
  const [navOpen, setNavOpen] = useState(false)

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && setNavOpen(false)
    window.addEventListener("keydown", onKey)
    return () => window.removeEventListener("keydown", onKey)
  }, [])

  return (
    <TooltipProvider>
      <div className="flex min-h-screen bg-background">
        <Sidebar open={navOpen} onNavigate={() => setNavOpen(false)} />
        <AnimatePresence>
          {navOpen && (
            <motion.div
              className="fixed inset-0 z-30 bg-black/50 backdrop-blur-[2px] xl:hidden"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setNavOpen(false)}
            />
          )}
        </AnimatePresence>

        <div className="flex min-w-0 flex-1 flex-col">
          <Header onMenu={() => setNavOpen(true)} />
          <main className="flex flex-col px-4 pb-[21px] pt-[20px] sm:px-5">
            <ContentHeader onExport={exportCsv} />
            <div className="mt-[12px]">
              <KpiCards />
            </div>
            <div className="mt-[9px] grid grid-cols-1 gap-3 lg:grid-cols-[minmax(0,782fr)_minmax(320px,356fr)]">
              <SalesTrend />
              <RevenueBreakdown />
            </div>
            <div className="mt-[12px]">
              <TransactionsTable />
            </div>
          </main>
        </div>
      </div>
    </TooltipProvider>
  )
}

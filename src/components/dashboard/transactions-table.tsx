import { useMemo, useState } from "react"
import { AnimatePresence, motion } from "motion/react"

import { extraTransactions, fmtMoney, transactions as seed, type Status, type Transaction } from "@/lib/data"
import { icons } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { Img } from "@/components/icon"
import { AnimatedNumber } from "@/components/animated-number"
import { CardTitle } from "@/components/dashboard/sales-trend"
import { Button } from "@/components/ui/button"
import { Checkbox } from "@/components/ui/checkbox"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type SortKey = "id" | "customer" | "product" | "status" | "qty" | "unitPrice" | "total"

const columns: { key: SortKey; label: string }[] = [
  { key: "customer", label: "Customer" },
  { key: "product", label: "Product" },
  { key: "status", label: "Status" },
  { key: "qty", label: "Qty" },
  { key: "unitPrice", label: "Unit Price" },
  { key: "total", label: "Total Revenue" },
]

const statusStyle: Record<Status, { icon: string; color: string }> = {
  Success: { icon: icons.statusSuccess, color: "text-success" },
  Pending: { icon: icons.statusPending, color: "text-warning" },
  Refunded: { icon: icons.statusRefunded, color: "text-neutral-status" },
}

export function TransactionsTable() {
  const [rows, setRows] = useState<Transaction[]>(seed)
  const [query, setQuery] = useState("")
  const [sort, setSort] = useState<{ key: SortKey; dir: 1 | -1 } | null>(null)
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const [fresh, setFresh] = useState<string | null>(null)

  const view = useMemo(() => {
    const q = query.trim().toLowerCase()
    let out = q ? rows.filter((r) => [r.id, r.customer, r.product, r.status].some((v) => v.toLowerCase().includes(q))) : rows
    if (sort) {
      out = [...out].sort((a, b) => {
        const va = a[sort.key]
        const vb = b[sort.key]
        return (typeof va === "number" ? va - (vb as number) : String(va).localeCompare(String(vb))) * sort.dir
      })
    }
    return out
  }, [rows, query, sort])

  const allChecked = view.length > 0 && view.every((r) => selected.has(r.id))
  const someChecked = view.some((r) => selected.has(r.id))

  const toggleSort = (key: SortKey) =>
    setSort((s) => (s?.key !== key ? { key, dir: 1 } : s.dir === 1 ? { key, dir: -1 } : null))

  const addTransaction = () => {
    const next = extraTransactions[(rows.length - seed.length) % extraTransactions.length]
    const id = `#0${4910 + rows.length}`
    setRows((r) => [{ ...next, id }, ...r])
    setFresh(id)
    setTimeout(() => setFresh(null), 1600)
  }

  return (
    <section className="flex min-w-0 flex-col rounded-[12px] bg-card-shell p-[2px] lg:ml-[2px]" aria-labelledby="tx-title">
      <CardTitle id="tx-title" title="Recent Transactions" info="Latest orders across all channels">
        <label className="group hidden h-[30px] w-[240px] cursor-text items-center gap-2 overflow-clip rounded-[6px] border-[0.6px] border-white/[0.12] px-[8px] py-[7px] transition-[border-color,box-shadow] focus-within:border-primary/50 focus-within:shadow-[0px_0px_0px_3px_rgba(249,115,22,0.12)] hover:border-white/20 sm:flex">
          <span className="relative size-[16.64px] shrink-0">
            <Img src={icons.search} width={14.5699} height={14.8872} className="absolute left-[1.15px] top-[1.15px]" />
          </span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            type="search"
            placeholder="Search transactions..."
            aria-label="Search transactions"
            className="w-full min-w-0 bg-transparent text-[12.48px] leading-[1.6] text-foreground outline-none placeholder:text-subtle-foreground [&::-webkit-search-cancel-button]:hidden"
          />
        </label>
        <Button variant="primary" size="sm" onClick={addTransaction} className="group border-[0.6px] border-white/20">
          <Img src={icons.plus} width={12} height={12} className="transition-transform duration-300 group-hover:rotate-90" />
          Add Transaction
        </Button>
      </CardTitle>

      <div className="overflow-x-auto rounded-[10px] bg-card stroke-inside [scrollbar-width:thin]">
        <table className="w-full min-w-[980px] table-fixed border-collapse text-left">
          <thead>
            <tr className="h-[36px] [&>th]:shadow-[inset_0_-0.8px_0_var(--border)]">
              <th className="w-[36px] p-[10px] align-middle">
                <Checkbox
                  aria-label="Select all"
                  checked={allChecked ? true : someChecked ? "indeterminate" : false}
                  onCheckedChange={(v) => setSelected(v ? new Set(view.map((r) => r.id)) : new Set())}
                />
              </th>
              <HeaderCell label="ID" active={sort?.key === "id" ? sort.dir : 0} onClick={() => toggleSort("id")} className="w-[90px] pl-[12px] pr-[16px]" />
              {columns.map((c) => (
                <HeaderCell key={c.key} label={c.label} active={sort?.key === c.key ? sort.dir : 0} onClick={() => toggleSort(c.key)} />
              ))}
              <th className="w-[60px] px-[12px] py-[10px] font-mono text-[12px] font-normal uppercase leading-none text-subtle-foreground">
                <div className="flex justify-end whitespace-nowrap">Actions</div>
              </th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {view.map((r, i) => {
                const isSel = selected.has(r.id)
                const st = statusStyle[r.status]
                return (
                  <motion.tr
                    key={r.id}
                    layout="position"
                    initial={{ opacity: 0, backgroundColor: "rgba(249,115,22,0.10)" }}
                    animate={{ opacity: 1, backgroundColor: fresh === r.id ? "rgba(249,115,22,0.10)" : "rgba(249,115,22,0)" }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1], backgroundColor: { duration: 1.2 } }}
                    className={cn(
                      "group h-[44px] transition-colors [&>td]:shadow-[inset_0_-0.6px_0_var(--border)] duration-150 hover:!bg-white/[0.025]",
                      isSel && "!bg-primary/[0.06]"
                    )}
                  >
                    <td className="p-[10px] align-middle">
                      <Checkbox
                        aria-label={`Select ${r.id}`}
                        checked={isSel}
                        onCheckedChange={(v) =>
                          setSelected((s) => {
                            const n = new Set(s)
                            if (v) n.add(r.id)
                            else n.delete(r.id)
                            return n
                          })
                        }
                      />
                    </td>
                    <td className="w-[90px] truncate px-[12px] py-[10px] text-[13px] leading-none text-subtle-foreground">{r.id}</td>
                    <td className="truncate px-[12px] py-[10px] text-[13px] leading-none text-foreground">{r.customer}</td>
                    <td className="truncate px-[12px] py-[10px] text-[13px] leading-none text-foreground">{r.product}</td>
                    <td className="px-[12px] py-[10px]">
                      <span className="flex h-[24px] w-[92px] items-center justify-center gap-[4px] overflow-clip rounded-[88px] border-[0.6px] border-white/[0.08] bg-muted px-[8px] py-[10px] shadow-[0px_0px_0px_1px_rgba(0,0,0,0.2)] transition-transform duration-200 group-hover:-translate-y-px">
                        <Img src={st.icon} width={12} height={12} />
                        <span className={cn("whitespace-nowrap text-[12px] leading-[normal]", st.color)}>{r.status}</span>
                      </span>
                    </td>
                    <td className="px-[12px] py-[10px] font-mono text-[13px] font-medium leading-none text-foreground tabular">
                      <AnimatedNumber value={r.qty} duration={0.9} delay={0.3 + i * 0.05} />
                    </td>
                    <td className="px-[12px] py-[10px] font-mono text-[13px] font-medium leading-none text-foreground tabular">
                      <AnimatedNumber value={r.unitPrice} prefix="$" duration={1} delay={0.3 + i * 0.05} />
                    </td>
                    <td className="px-[12px] py-[10px] font-mono text-[13px] font-medium leading-none text-foreground tabular">
                      <AnimatedNumber value={r.total} prefix="$" duration={1.1} delay={0.3 + i * 0.05} />
                    </td>
                    <td className="w-[60px] px-[12px] py-0">
                      <div className="flex justify-end">
                        <RowActions tx={r} onDelete={() => setRows((rs) => rs.filter((x) => x.id !== r.id))} />
                      </div>
                    </td>
                  </motion.tr>
                )
              })}
            </AnimatePresence>
            {view.length === 0 && (
              <tr className="h-[88px]">
                <td colSpan={9} className="text-center text-[13px] text-subtle-foreground">
                  No transactions match “{query}”.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </section>
  )
}

function HeaderCell({ label, active, onClick, className }: { label: string; active: 0 | 1 | -1; onClick: () => void; className?: string }) {
  return (
    <th className={cn("px-[12px] py-[10px] font-normal", className)} aria-sort={active === 1 ? "ascending" : active === -1 ? "descending" : "none"}>
      <button
        onClick={onClick}
        className={cn(
          "group/sort flex items-center gap-[6px] whitespace-nowrap font-mono text-[12px] uppercase leading-none outline-none transition-colors",
          active ? "text-[#b3b3b3]" : "text-subtle-foreground hover:text-[#999]"
        )}
      >
        {label}
        <span className="relative h-[8px] w-[6px]">
          <Img
            src={icons.sort}
            width={6}
            height={8}
            className={cn(
              "transition-[transform,clip-path,opacity] duration-200",
              active === 1 && "[clip-path:inset(0_0_50%_0)]",
              active === -1 && "[clip-path:inset(50%_0_0_0)]",
              !active && "opacity-100 group-hover/sort:opacity-80"
            )}
          />
        </span>
      </button>
    </th>
  )
}

function RowActions({ tx, onDelete }: { tx: Transaction; onDelete: () => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="secondary" size="iconSm" aria-label={`Actions for ${tx.id}`} className="data-[state=open]:bg-[#42413f]">
          <Img src={icons.moreCircle} width={16} height={16} />
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
        <DropdownMenuLabel>
          {tx.id} · {fmtMoney(tx.total)}
        </DropdownMenuLabel>
        <DropdownMenuGroup>
          <DropdownMenuItem>View details</DropdownMenuItem>
          <DropdownMenuItem>Download invoice</DropdownMenuItem>
          <DropdownMenuItem>Contact customer</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem variant="destructive" onSelect={onDelete}>
            Remove
          </DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

import { useState } from "react"
import { motion } from "motion/react"

import { avatar, icons } from "@/lib/icons"
import { cn } from "@/lib/utils"
import { Img, MaskIcon } from "@/components/icon"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"

type NavItem = { id: string; label: string; icon: string }
type NavGroup = { title: string; items: NavItem[] }

const groups: NavGroup[] = [
  {
    title: "Main Menu",
    items: [
      { id: "dashboard", label: "Dashboard", icon: icons.homeOutline },
      { id: "products", label: "Products", icon: icons.chartBarLine },
      { id: "transactions", label: "Transactions", icon: icons.money },
      { id: "reports", label: "Reports & Analytics", icon: icons.file02 },
      { id: "messages", label: "Messages", icon: icons.bubbleChat },
      { id: "team", label: "Team Performance", icon: icons.presentation },
      { id: "campaigns", label: "Campaigns", icon: icons.megaphone },
    ],
  },
  {
    title: "Customers",
    items: [
      { id: "customers", label: "Customer List", icon: icons.userMultiple },
      { id: "channels", label: "Channels", icon: icons.modernTv },
      { id: "orders", label: "Order Management", icon: icons.invoice },
    ],
  },
  {
    title: "Management",
    items: [
      { id: "roles", label: "Roles & Permissions", icon: icons.userList },
      { id: "billing", label: "Billing & Subscription", icon: icons.invoice01 },
      { id: "integrations", label: "Integrations", icon: icons.archive },
    ],
  },
  {
    title: "Settings",
    items: [
      { id: "support", label: "Customer Support", icon: icons.headset },
      { id: "help", label: "Help Center", icon: icons.helpCircle },
      { id: "settings", label: "System Settings", icon: icons.setting },
    ],
  },
]

const teams = ["Ascend Team", "Ascend Labs", "Client · Aimo"]

export function Sidebar({ open, onNavigate }: { open: boolean; onNavigate?: () => void }) {
  const [active, setActive] = useState("dashboard")
  const [team, setTeam] = useState(teams[0])

  return (
    <aside
      className={cn(
        "fixed inset-y-0 left-0 z-40 flex w-[250px] flex-col justify-between overflow-y-auto bg-sidebar p-4 [scrollbar-width:none]",
        "border-r-[0.6px] border-border transition-transform duration-300 ease-out-expo xl:sticky xl:top-0 xl:h-screen xl:translate-x-0",
        open ? "translate-x-0 shadow-[0_2.8px_2.2px_rgba(0,_0,_0,_0.034),_0_6.7px_5.3px_rgba(0,_0,_0,_0.048),_0_12.5px_10px_rgba(0,_0,_0,_0.06),_0_22.3px_17.9px_rgba(0,_0,_0,_0.072),_0_41.8px_33.4px_rgba(0,_0,_0,_0.086),_0_100px_80px_rgba(0,_0,_0,_0.12)] xl:shadow-none" : "-translate-x-full"
      )}
    >
      <div className="flex w-full flex-col gap-5">
        {/* Team selector */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="group relative flex w-[220px] items-center gap-[8.32px] overflow-clip rounded-[8px] bg-card p-[10.4px] shadow-[inset_0_0_0_1px_#1a1a19] text-left outline-none transition-colors hover:bg-[#353433]"
              aria-label="Switch team"
            >
              <span className="relative size-[33.28px] shrink-0">
                <Img src={icons.logo} className="absolute left-[-4.8px] top-[-2.8px]" width={42.88} height={42.88} />
              </span>
              <span className="flex min-w-px flex-1 flex-col justify-center gap-[6px] leading-none">
                <span className="w-full text-[12px] text-subtle-foreground">Agency</span>
                <span className="w-full truncate text-[14px] font-medium text-[#ccc]">{team}</span>
              </span>
              <Img src={icons.selectorChevrons} width={8} height={12} className="transition-transform duration-200 group-hover:scale-110" />
              <span className="pointer-events-none absolute inset-0 rounded-[inherit] shadow-[inset_0px_0px_0px_1.6px_rgba(255,255,255,0.1)]" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="start" className="w-[220px]">
            <DropdownMenuLabel>Workspaces</DropdownMenuLabel>
            <DropdownMenuGroup>
              {teams.map((t) => (
                <DropdownMenuItem key={t} onSelect={() => setTeam(t)}>
                  <span className={cn("size-1.5 rounded-full", t === team ? "bg-primary" : "bg-muted-2")} />
                  {t}
                </DropdownMenuItem>
              ))}
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>

        {groups.map((group, gi) => (
          <div key={group.title} className="flex flex-col gap-5">
            {gi > 0 && <div className="w-[220px] divider-etched" />}
            <nav className="flex w-full flex-col gap-[10px]" aria-label={group.title}>
              <p className="text-[12px] leading-[normal] tracking-[0.06px] text-foreground">{group.title}</p>
              <ul className="flex w-full flex-col">
                {group.items.map((item) => {
                  const isActive = item.id === active
                  return (
                    <li key={item.id}>
                      <button
                        onClick={() => {
                          setActive(item.id)
                          onNavigate?.()
                        }}
                        aria-current={isActive ? "page" : undefined}
                        className={cn(
                          "group relative flex w-full items-center gap-2 overflow-clip rounded-[8px] px-[10px] py-[8px] text-left text-[14px] leading-[normal] outline-none transition-colors duration-150",
                          isActive ? "font-medium text-primary" : "text-soft-foreground hover:bg-white/[0.03] hover:text-[#cfcfcf]"
                        )}
                      >
                        {isActive && (
                          <motion.span
                            layoutId="sidebar-active"
                            className="absolute inset-0 rounded-[8px] bg-card"
                            transition={{ type: "spring", stiffness: 520, damping: 40 }}
                          />
                        )}
                        <span className="relative flex size-4 items-center justify-center">
                          {isActive && item.id === "dashboard" ? (
                            <Img src={icons.home} width={16} height={16} />
                          ) : (
                            <MaskIcon
                              src={item.icon}
                              className={cn(
                                "transition-[color,transform] duration-150",
                                isActive ? "text-primary" : "text-subtle-foreground group-hover:text-[#a3a3a3] group-hover:scale-105"
                              )}
                            />
                          )}
                        </span>
                        <span className="relative truncate">{item.label}</span>
                      </button>
                    </li>
                  )
                })}
              </ul>
            </nav>
          </div>
        ))}
      </div>

      {/* Profile */}
      <div className="mt-10 flex w-full flex-col gap-[10px]">
        <div className="w-[220px] divider-etched [--divider:#141414]" />
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button className="group relative flex w-full items-center gap-[8.32px] rounded-[10px] bg-card p-[10.4px] stroke-inside text-left outline-none transition-colors hover:bg-[#353433]">
              <span className="relative size-[33.28px] shrink-0 overflow-clip rounded-[8.32px] border-[0.6px] border-white bg-[#f7f7f7] shadow-[0px_0px_0px_1px_rgba(0,0,0,0.06)]">
                <img
                  src={avatar}
                  alt="Liam Agesa"
                  className="absolute left-[-3.72px] top-[-8.92px] h-[50.96px] w-[38.506px] max-w-none object-cover"
                />
              </span>
              <span className="flex min-w-px flex-1 flex-col justify-center gap-[6px] whitespace-nowrap font-display leading-none">
                <span className="text-[14px] tracking-[0.28px] text-foreground">Liam Agesa</span>
                <span className="text-[12px] tracking-[0.24px] text-subtle-foreground">Pro Plan</span>
              </span>
              <Img src={icons.onlineDot} width={9.36} height={9.36} className="absolute bottom-[6.78px] left-[35.6px]" />
              <span className="flex size-3 items-center justify-center">
                <Img
                  src={icons.arrowDown2}
                  width={8.2}
                  height={4.7}
                  className="transition-transform duration-200 group-data-[state=open]:rotate-180"
                />
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent side="top" align="start" className="w-[218px]">
            <DropdownMenuLabel>salung@sparkpixel.studio</DropdownMenuLabel>
            <DropdownMenuGroup>
              <DropdownMenuItem>Profile</DropdownMenuItem>
              <DropdownMenuItem>Billing</DropdownMenuItem>
              <DropdownMenuItem>Keyboard shortcuts</DropdownMenuItem>
            </DropdownMenuGroup>
            <DropdownMenuSeparator />
            <DropdownMenuGroup>
              <DropdownMenuItem variant="destructive">Log out</DropdownMenuItem>
            </DropdownMenuGroup>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </aside>
  )
}

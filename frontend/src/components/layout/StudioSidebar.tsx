import type { ReactNode } from 'react'
import { Bell, BookOpenText, CheckSquare, PenTool } from 'lucide-react'
import { NavLink } from 'react-router-dom'

import { BrandMenuCard } from './BrandMenuCard'

type NavItem = {
  to?: string
  icon: ReactNode
  label: string
  extraClassName?: string
}

const navItems: NavItem[] = [
  { to: '/writing', icon: <PenTool className="h-6 w-6" />, label: '写作区' },
  { to: '/tasks', icon: <CheckSquare className="h-6 w-6" />, label: '任务区' },
  { icon: <BookOpenText className="h-6 w-6" />, label: '资料库' },
  { icon: <Bell className="h-5 w-5" />, label: '系统通知', extraClassName: 'mt-4' },
]

const linkClassName = ({ isActive }: { isActive: boolean }) =>
  [
    'group relative rounded-xl p-2 transition-colors hover:bg-white/5',
    isActive ? 'text-[#BD9F67]' : 'text-gray-400',
  ].join(' ')

function Tooltip({ children }: { children: ReactNode }) {
  return (
    <span className="pointer-events-none absolute left-14 top-1/2 -translate-y-1/2 whitespace-nowrap rounded bg-gray-800 px-2 py-1 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100">
      {children}
    </span>
  )
}

function StaticButton({ icon, label, extraClassName }: NavItem) {
  return (
    <button className={`group relative rounded-xl p-2 text-gray-400 transition-colors hover:bg-white/5 ${extraClassName || ''}`}>
      {icon}
      <Tooltip>{label}</Tooltip>
    </button>
  )
}

export function StudioSidebar() {
  return (
    <nav className="relative z-20 flex h-full w-20 flex-col items-center border-r border-[#243137] bg-[#243137] py-6 shadow-2xl">
      <NavLink
        to="/settings"
        className={({ isActive }) =>
          [
            'group relative mb-10 h-10 w-10 overflow-hidden rounded-full border-2 transition-all',
            isActive ? 'border-[#BD9F67] ring-2 ring-[#BD9F67]/30' : 'border-gray-400 hover:border-[#BD9F67]',
          ].join(' ')
        }
      >
        <img
          src="https://api.dicebear.com/7.x/notionists/svg?seed=Aura"
          alt="Aura avatar"
          className="h-full w-full object-cover"
        />
        <Tooltip>账户设置</Tooltip>
      </NavLink>

      <div className="flex w-full flex-1 flex-col items-center gap-6">
        {navItems.map((item) =>
          item.to ? (
            <NavLink key={item.label} to={item.to} className={linkClassName}>
              {item.icon}
              <Tooltip>{item.label}</Tooltip>
            </NavLink>
          ) : (
            <StaticButton key={item.label} {...item} />
          )
        )}
      </div>

      <BrandMenuCard />
    </nav>
  )
}

// 全局左侧导航，承载一级路由切换和品牌菜单。

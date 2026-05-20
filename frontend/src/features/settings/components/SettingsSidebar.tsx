import { Palette, ShieldCheck, User } from "lucide-react"

import type { SettingsSectionId } from "../types"

interface SettingsSidebarProps {
  activeSection: SettingsSectionId
  onChange: (section: SettingsSectionId) => void
}

const items = [
  { id: "profile", label: "个人资料", icon: User },
  { id: "security", label: "账户安全", icon: ShieldCheck },
  { id: "appearance", label: "外观与主题", icon: Palette },
] as const

export function SettingsSidebar({ activeSection, onChange }: SettingsSidebarProps) {
  return (
    <aside className="flex h-full w-64 flex-col justify-between border-r border-[#E5E4E7] bg-gray-50">
      <div>
        <div className="px-6 pb-2 pt-6">
          <h2 className="text-xl font-bold text-[#243137]">设置</h2>
          <p className="mt-1 text-xs text-gray-400">管理你的账户、偏好和界面状态。</p>
        </div>

        <div className="space-y-1 p-4">
          {items.map((item) => {
            const Icon = item.icon
            const isActive = activeSection === item.id

            return (
              <button
                key={item.id}
                onClick={() => onChange(item.id)}
                className={[
                  "flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm transition-colors",
                  isActive ? "border border-gray-200 bg-white font-medium text-[#243137] shadow-sm" : "text-gray-600 hover:bg-gray-200",
                ].join(" ")}
              >
                <Icon className={`h-[18px] w-[18px] ${isActive ? "text-[#BD9F67]" : "text-gray-400"}`} />
                {item.label}
              </button>
            )
          })}
        </div>
      </div>

      <div className="border-t border-[#E5E4E7] p-4">
        <button className="flex w-full items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-600">
          <span className="text-base">→</span>
          退出登录
        </button>
      </div>
    </aside>
  )
}

// 设置区左侧导航。

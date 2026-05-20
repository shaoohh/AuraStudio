import { Monitor, Moon, Sun } from "lucide-react"

import { Button } from "@/components/ui/button"

import type { AppearanceFormState } from "../types"

interface AppearanceSettingsFormProps {
  form: AppearanceFormState
  isSaved: boolean
  onChange: (field: keyof AppearanceFormState, value: string | boolean) => void
  onSave: () => void
}

const themes = [
  { id: "system", label: "跟随系统", icon: Monitor },
  { id: "light", label: "浅色", icon: Sun },
  { id: "dark", label: "深色", icon: Moon },
] as const

export function AppearanceSettingsForm({ form, isSaved, onChange, onSave }: AppearanceSettingsFormProps) {
  return (
    <main className="no-scrollbar flex-1 overflow-y-auto bg-white">
      <div className="mx-auto max-w-3xl px-10 py-12">
        <h1 className="mb-8 border-b border-gray-100 pb-4 text-2xl font-bold text-[#243137]">外观与主题</h1>

        <div className="space-y-8">
          <div>
            <div className="mb-4 text-sm font-medium text-[#243137]">主题模式</div>
            <div className="grid gap-3 sm:grid-cols-3">
              {themes.map((theme) => {
                const Icon = theme.icon
                const isActive = form.theme === theme.id

                return (
                  <button
                    key={theme.id}
                    onClick={() => onChange("theme", theme.id)}
                    className={[
                      "rounded-xl border p-4 text-left transition-colors",
                      isActive ? "border-[#BD9F67] bg-[#FBF8F2] text-[#243137]" : "border-[#E5E4E7] bg-white text-gray-500 hover:bg-gray-50",
                    ].join(" ")}
                  >
                    <Icon className={`mb-3 h-5 w-5 ${isActive ? "text-[#BD9F67]" : "text-gray-400"}`} />
                    <div className="text-sm font-medium">{theme.label}</div>
                  </button>
                )
              })}
            </div>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            <div>
              <div className="mb-2 text-sm font-medium text-[#243137]">信息密度</div>
              <select
                value={form.density}
                onChange={(event) => onChange("density", event.target.value)}
                className="h-11 w-full rounded-md border border-gray-200 bg-[#F8FAF9] px-3 text-sm outline-none"
              >
                <option value="comfortable">舒适</option>
                <option value="compact">紧凑</option>
              </select>
            </div>

            <div className="rounded-2xl border border-[#E5E4E7] bg-[#FCFCFA] p-4">
              <label className="flex cursor-pointer items-center justify-between gap-4">
                <div>
                  <div className="text-sm font-medium text-[#243137]">沉浸模式</div>
                  <p className="mt-1 text-xs text-gray-400">减少界面干扰，适合专注写作。</p>
                </div>

                <button
                  type="button"
                  onClick={() => onChange("focusMode", !form.focusMode)}
                  className={[
                    "relative h-7 w-12 rounded-full transition-colors",
                    form.focusMode ? "bg-[#243137]" : "bg-gray-200",
                  ].join(" ")}
                >
                  <span
                    className={[
                      "absolute top-1 h-5 w-5 rounded-full bg-white transition-transform",
                      form.focusMode ? "translate-x-6" : "translate-x-1",
                    ].join(" ")}
                  />
                </button>
              </label>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 pt-8">
            <span className={`text-sm ${isSaved ? "text-emerald-600" : "text-gray-400"}`}>{isSaved ? "外观设置已保存" : "可以先在本地状态里试手感"}</span>
            <Button className="bg-[#243137] text-white hover:bg-gray-800" onClick={onSave}>
              保存外观设置
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}

// 外观设置表单。

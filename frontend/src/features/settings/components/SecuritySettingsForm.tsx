import { LockKeyhole, ShieldCheck } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

import type { SecurityFormState } from "../types"

interface SecuritySettingsFormProps {
  form: SecurityFormState
  isSaved: boolean
  onChange: (field: keyof SecurityFormState, value: string | boolean) => void
  onSave: () => void
}

export function SecuritySettingsForm({ form, isSaved, onChange, onSave }: SecuritySettingsFormProps) {
  return (
    <main className="no-scrollbar flex-1 overflow-y-auto bg-white">
      <div className="mx-auto max-w-3xl px-10 py-12">
        <h1 className="mb-8 border-b border-gray-100 pb-4 text-2xl font-bold text-[#243137]">账户安全</h1>

        <div className="space-y-8">
          <div className="rounded-2xl border border-[#E5E4E7] bg-[#FCFCFA] p-6">
            <div className="mb-4 flex items-center gap-3">
              <LockKeyhole className="h-5 w-5 text-[#BD9F67]" />
              <div>
                <div className="font-medium text-[#243137]">更新密码</div>
                <div className="text-sm text-gray-400">先把前端交互流程跑顺，后面再接真实校验。</div>
              </div>
            </div>

            <div className="grid gap-4">
              <Input
                type="password"
                value={form.currentPassword}
                onChange={(event) => onChange("currentPassword", event.target.value)}
                placeholder="当前密码"
                className="h-11 rounded-md border-gray-200 bg-[#F8FAF9] focus-visible:border-[#BD9F67] focus-visible:bg-white focus-visible:ring-[#BD9F67]"
              />
              <Input
                type="password"
                value={form.newPassword}
                onChange={(event) => onChange("newPassword", event.target.value)}
                placeholder="新密码"
                className="h-11 rounded-md border-gray-200 bg-[#F8FAF9] focus-visible:border-[#BD9F67] focus-visible:bg-white focus-visible:ring-[#BD9F67]"
              />
              <Input
                type="password"
                value={form.confirmPassword}
                onChange={(event) => onChange("confirmPassword", event.target.value)}
                placeholder="确认新密码"
                className="h-11 rounded-md border-gray-200 bg-[#F8FAF9] focus-visible:border-[#BD9F67] focus-visible:bg-white focus-visible:ring-[#BD9F67]"
              />
            </div>
          </div>

          <div className="rounded-2xl border border-[#E5E4E7] bg-white p-6 shadow-sm">
            <label className="flex cursor-pointer items-center justify-between gap-4">
              <div>
                <div className="flex items-center gap-2 font-medium text-[#243137]">
                  <ShieldCheck className="h-4 w-4 text-[#BD9F67]" />
                  双重验证
                </div>
                <p className="mt-1 text-sm text-gray-400">先用本地状态模拟开关和保存结果。</p>
              </div>

              <button
                type="button"
                onClick={() => onChange("twoFactorEnabled", !form.twoFactorEnabled)}
                className={[
                  "relative h-7 w-12 rounded-full transition-colors",
                  form.twoFactorEnabled ? "bg-[#243137]" : "bg-gray-200",
                ].join(" ")}
              >
                <span
                  className={[
                    "absolute top-1 h-5 w-5 rounded-full bg-white transition-transform",
                    form.twoFactorEnabled ? "translate-x-6" : "translate-x-1",
                  ].join(" ")}
                />
              </button>
            </label>
          </div>

          <div className="flex items-center justify-between border-t border-gray-100 pt-8">
            <span className={`text-sm ${isSaved ? "text-emerald-600" : "text-gray-400"}`}>{isSaved ? "安全设置已保存" : "修改后记得保存"}</span>
            <Button className="bg-[#243137] text-white hover:bg-gray-800" onClick={onSave}>
              保存安全设置
            </Button>
          </div>
        </div>
      </div>
    </main>
  )
}

// 安全设置表单。

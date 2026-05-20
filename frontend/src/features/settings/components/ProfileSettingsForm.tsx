import { Camera, Check } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"

import type { ProfileFormState } from "../types"

interface ProfileSettingsFormProps {
  form: ProfileFormState
  isSaved: boolean
  onChange: (field: keyof ProfileFormState, value: string) => void
  onCancel: () => void
  onSave: () => void
}

export function ProfileSettingsForm({ form, isSaved, onChange, onCancel, onSave }: ProfileSettingsFormProps) {
  return (
    <main className="no-scrollbar flex-1 overflow-y-auto bg-white">
      <div className="mx-auto max-w-3xl px-10 py-12">
        <h1 className="mb-8 border-b border-gray-100 pb-4 text-2xl font-bold text-[#243137]">个人资料</h1>

        <div className="space-y-8">
          <div className="flex items-center gap-6">
            <div className="group relative h-24 w-24 cursor-pointer overflow-hidden rounded-full border-4 border-[#F8FAF9] shadow-sm">
              <img
                src="https://api.dicebear.com/7.x/notionists/svg?seed=Aura"
                alt="Aura avatar"
                className="h-full w-full object-cover"
              />
              <div className="absolute inset-0 flex items-center justify-center bg-black/50 opacity-0 transition-opacity group-hover:opacity-100">
                <Camera className="h-6 w-6 text-white" />
              </div>
            </div>

            <div>
              <Button variant="outline" className="mb-2 rounded-md border-gray-200 px-4 py-2 text-sm font-medium text-[#243137] shadow-sm">
                更改头像
              </Button>
              <p className="text-xs text-gray-400">支持 JPG、PNG 或 GIF，最大 2MB。</p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-[#243137]">显示名称</label>
              <Input
                value={form.displayName}
                onChange={(event) => onChange("displayName", event.target.value)}
                className="h-11 rounded-md border-gray-200 bg-[#F8FAF9] text-gray-700 focus-visible:border-[#BD9F67] focus-visible:bg-white focus-visible:ring-[#BD9F67]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-[#243137]">注册邮箱</label>
              <Input readOnly value={form.email} className="h-11 cursor-not-allowed rounded-md border-gray-100 bg-gray-50 text-gray-400" />
            </div>
          </div>

          <div className="space-y-2">
            <label className="text-sm font-medium text-[#243137]">个人简介</label>
            <Textarea
              rows={4}
              value={form.bio}
              onChange={(event) => onChange("bio", event.target.value)}
              placeholder="写点什么来介绍自己..."
              className="min-h-[140px] resize-none rounded-md border-gray-200 bg-[#F8FAF9] text-sm text-gray-700 focus-visible:border-[#BD9F67] focus-visible:bg-white focus-visible:ring-[#BD9F67]"
            />
          </div>

          <div className="mt-8 flex items-center justify-between border-t border-gray-100 pt-8">
            <span className={`text-sm ${isSaved ? "text-emerald-600" : "text-gray-400"}`}>{isSaved ? "资料已保存" : "资料尚未保存"}</span>

            <div className="flex gap-3">
              <Button variant="ghost" className="text-gray-600" onClick={onCancel}>
                取消
              </Button>
              <Button className="bg-[#243137] text-white hover:bg-gray-800" onClick={onSave}>
                <Check className="mr-2 h-4 w-4" />
                保存更改
              </Button>
            </div>
          </div>
        </div>
      </div>
    </main>
  )
}

// 个人资料表单。

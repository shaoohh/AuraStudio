import { useEffect, useState } from 'react'
import { X } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

interface CreateBookDialogProps {
  open: boolean
  onClose: () => void
  onSubmit: (payload: { title: string; description?: string; cover?: string }) => void
}

export function CreateBookDialog({ open, onClose, onSubmit }: CreateBookDialogProps) {
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [cover, setCover] = useState('')

  useEffect(() => {
    if (!open) {
      setTitle('')
      setDescription('')
      setCover('')
    }
  }, [open])

  useEffect(() => {
    if (!open) return

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }

    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose, open])

  if (!open) return null

  return (
    <div
      className="fixed inset-0 z-[120] flex items-center justify-center bg-[#11181c]/40 px-6 backdrop-blur-[4px]"
      onClick={(event) => {
        if (event.target === event.currentTarget) onClose()
      }}
    >
      <div className="w-full max-w-[520px] rounded-[28px] border border-white/60 bg-white/90 p-8 shadow-[0_30px_60px_rgba(20,24,29,0.18)] backdrop-blur-2xl">
        <div className="flex items-start justify-between gap-6">
          <div>
            <div className="text-xs font-semibold uppercase tracking-[0.16em] text-[#a29a8d]">New Book</div>
            <h2 className="mt-2 text-2xl font-semibold text-[#1f1d1a]">添加新书</h2>
            <p className="mt-2 text-sm leading-6 text-gray-500">先把书本架子建出来，封面和简介后续都还能继续调。</p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="flex h-9 w-9 items-center justify-center rounded-full bg-[#f3f4f2] text-gray-500 transition-colors hover:text-[#1f1d1a]"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-8 space-y-5">
          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[#1f1d1a]">书名</span>
            <Input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="例如：雨幕协议"
              className="h-12 rounded-2xl border-[#e6dfd4] bg-[#f8faf9] px-4 text-sm focus-visible:border-[#BD9F67] focus-visible:bg-white focus-visible:ring-[#BD9F67]"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[#1f1d1a]">简介</span>
            <Textarea
              value={description}
              onChange={(event) => setDescription(event.target.value)}
              rows={3}
              placeholder="默认会填入：作者很懒"
              className="rounded-2xl border-[#e6dfd4] bg-[#f8faf9] px-4 py-3 text-sm focus-visible:border-[#BD9F67] focus-visible:bg-white focus-visible:ring-[#BD9F67]"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-sm font-medium text-[#1f1d1a]">封面图片</span>
            <Input
              value={cover}
              onChange={(event) => setCover(event.target.value)}
              placeholder="可选，先贴一个图片地址"
              className="h-12 rounded-2xl border-[#e6dfd4] bg-[#f8faf9] px-4 text-sm focus-visible:border-[#BD9F67] focus-visible:bg-white focus-visible:ring-[#BD9F67]"
            />
          </label>
        </div>

        <div className="mt-8 flex justify-end gap-3">
          <Button variant="ghost" className="rounded-2xl px-5 py-3 text-sm text-gray-500 hover:bg-[#f3f4f2]" onClick={onClose}>
            取消
          </Button>
          <Button
            className="rounded-2xl bg-[#243137] px-5 py-3 text-sm font-medium text-white shadow-lg shadow-[#243137]/10 hover:bg-[#1d282d]"
            onClick={() => {
              if (!title.trim()) return
              onSubmit({ title: title.trim(), description, cover })
            }}
          >
            创建书本
          </Button>
        </div>
      </div>
    </div>
  )
}

// 新建书本弹层。

import { useEffect, useMemo, useState } from 'react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import type { UpdateWritingBookInput } from '../api'
import type { WritingBook } from '../types'

interface WritingAuthorPanelProps {
  book?: WritingBook
  worksCount: number
  isSaving?: boolean
  onSave: (payload: UpdateWritingBookInput) => void
}

type DraftState = {
  title: string
  description: string
  cover: string
  penName: string
  style: string
  styleNote: string
}

const defaultStyleNote = '先把书本架子搭起来，后面再慢慢补作者画像。'

function createDraft(book?: WritingBook): DraftState {
  return {
    title: book?.title ?? '',
    description: book?.description ?? '',
    cover: book?.cover ?? '',
    penName: book?.penName ?? '未命名作者',
    style: book?.style ?? '风格待分析',
    styleNote: book?.styleNote ?? defaultStyleNote,
  }
}

export function WritingAuthorPanel({ book, worksCount, isSaving = false, onSave }: WritingAuthorPanelProps) {
  const [draft, setDraft] = useState<DraftState>(() => createDraft(book))
  const chapterCount = book ? book.volumes.reduce((count, volume) => count + volume.chapters.length, 0) : 0

  useEffect(() => {
    setDraft(createDraft(book))
  }, [book])

  const isDirty = useMemo(() => {
    if (!book) return false

    return (
      draft.title !== book.title ||
      draft.description !== book.description ||
      draft.cover !== (book.cover ?? '') ||
      draft.penName !== book.penName ||
      draft.style !== book.style ||
      draft.styleNote !== book.styleNote
    )
  }, [book, draft])

  const canSave = Boolean(book && draft.title.trim() && isDirty && !isSaving)

  if (!book) {
    return (
      <aside className="hidden h-full w-[320px] shrink-0 border-l border-[#E5E4E7] bg-[#FCFCFA] xl:flex xl:flex-col">
        <div className="border-b border-[#E5E4E7] px-6 py-5">
          <div className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#9d9385]">Book Profile</div>
          <div className="mt-2 text-lg font-semibold text-[#243137]">书本信息</div>
        </div>

        <div className="flex flex-1 items-center justify-center px-6 text-center text-sm leading-7 text-[#8d8478]">
          先创建一本书，右侧就会出现真实可编辑的书本信息表单。
        </div>
      </aside>
    )
  }

  return (
    <aside className="hidden h-full w-[320px] shrink-0 border-l border-[#E5E4E7] bg-[#FCFCFA] xl:flex xl:flex-col">
      <div className="border-b border-[#E5E4E7] px-6 py-5">
        <div className="text-[12px] font-semibold uppercase tracking-[0.16em] text-[#9d9385]">Book Profile</div>
        <div className="mt-2 text-lg font-semibold text-[#243137]">书本信息</div>
      </div>

      <div className="no-scrollbar flex-1 overflow-y-auto px-6 py-6">
        <div className="space-y-6">
          <div className="overflow-hidden rounded-[24px] border border-[#e7e2d8] bg-white shadow-sm">
            <div className="aspect-[16/9] bg-[#f3efe7]">
              {draft.cover ? (
                <img src={draft.cover} alt={draft.title || '书本封面'} className="h-full w-full object-cover" />
              ) : (
                <div className="flex h-full items-center justify-center text-sm text-[#a69d90]">暂无封面</div>
              )}
            </div>

            <div className="grid grid-cols-2 gap-3 p-5">
              <StatCard label="已有作品" value={String(worksCount)} />
              <StatCard label="当前章节" value={String(chapterCount)} />
            </div>
          </div>

          <section className="rounded-[22px] border border-[#e7e2d8] bg-white p-5">
            <div className="mb-4 text-sm font-medium text-[#1f1d1a]">基础信息</div>

            <div className="space-y-4">
              <Field label="书名">
                <Input
                  value={draft.title}
                  onChange={(event) => setDraft((current) => ({ ...current, title: event.target.value }))}
                  className="h-11 rounded-[14px] border-[#e6dfd4] bg-[#f8faf9] px-4 focus-visible:border-[#BD9F67] focus-visible:bg-white focus-visible:ring-[#BD9F67]"
                />
              </Field>

              <Field label="笔名">
                <Input
                  value={draft.penName}
                  onChange={(event) => setDraft((current) => ({ ...current, penName: event.target.value }))}
                  className="h-11 rounded-[14px] border-[#e6dfd4] bg-[#f8faf9] px-4 focus-visible:border-[#BD9F67] focus-visible:bg-white focus-visible:ring-[#BD9F67]"
                />
              </Field>

              <Field label="封面地址">
                <Input
                  value={draft.cover}
                  onChange={(event) => setDraft((current) => ({ ...current, cover: event.target.value }))}
                  placeholder="可留空"
                  className="h-11 rounded-[14px] border-[#e6dfd4] bg-[#f8faf9] px-4 focus-visible:border-[#BD9F67] focus-visible:bg-white focus-visible:ring-[#BD9F67]"
                />
              </Field>

              <Field label="简介">
                <Textarea
                  value={draft.description}
                  onChange={(event) => setDraft((current) => ({ ...current, description: event.target.value }))}
                  rows={4}
                  className="rounded-[16px] border-[#e6dfd4] bg-[#f8faf9] px-4 py-3 leading-7 focus-visible:border-[#BD9F67] focus-visible:bg-white focus-visible:ring-[#BD9F67]"
                />
              </Field>
            </div>
          </section>

          <section className="rounded-[22px] border border-[#e7e2d8] bg-white p-5">
            <div className="mb-4 text-sm font-medium text-[#1f1d1a]">风格侧写</div>

            <div className="space-y-4">
              <Field label="风格分析">
                <Textarea
                  value={draft.style}
                  onChange={(event) => setDraft((current) => ({ ...current, style: event.target.value }))}
                  rows={3}
                  className="rounded-[16px] border-[#e6dfd4] bg-[#f8faf9] px-4 py-3 leading-7 focus-visible:border-[#BD9F67] focus-visible:bg-white focus-visible:ring-[#BD9F67]"
                />
              </Field>

              <Field label="风格备注">
                <Textarea
                  value={draft.styleNote}
                  onChange={(event) => setDraft((current) => ({ ...current, styleNote: event.target.value }))}
                  rows={4}
                  className="rounded-[16px] border-[#e6dfd4] bg-[#f8faf9] px-4 py-3 leading-7 focus-visible:border-[#BD9F67] focus-visible:bg-white focus-visible:ring-[#BD9F67]"
                />
              </Field>
            </div>
          </section>

          <div className="flex justify-end gap-3">
            <Button
              variant="ghost"
              className="rounded-2xl px-5 text-[#7e7568] hover:bg-white"
              disabled={!isDirty || isSaving}
              onClick={() => setDraft(createDraft(book))}
            >
              还原
            </Button>
            <Button
              className="rounded-2xl bg-[#243137] px-5 text-white shadow-lg shadow-[#243137]/10 hover:bg-[#1d282d]"
              disabled={!canSave}
              onClick={() => {
                onSave({
                  title: draft.title.trim() || book.title,
                  description: draft.description.trim() || '作者很懒',
                  cover: draft.cover.trim() || null,
                  penName: draft.penName.trim() || '未命名作者',
                  style: draft.style.trim() || '风格待分析',
                  styleNote: draft.styleNote.trim() || defaultStyleNote,
                })
              }}
            >
              {isSaving ? '保存中...' : '保存修改'}
            </Button>
          </div>
        </div>
      </div>
    </aside>
  )
}

function Field({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <label className="block">
      <span className="mb-2 block text-sm font-medium text-[#1f1d1a]">{label}</span>
      {children}
    </label>
  )
}

function StatCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-[18px] border border-[#efe8dd] bg-[#fcfbf8] p-4">
      <div className="text-[11px] uppercase tracking-[0.14em] text-[#9d9385]">{label}</div>
      <div className="mt-2 text-xl font-semibold text-[#1f1d1a]">{value}</div>
    </div>
  )
}

// 写作区首页右侧书本信息面板，负责书本资料编辑与真实保存。

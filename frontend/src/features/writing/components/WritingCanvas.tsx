import { Plus, Sparkles } from 'lucide-react'

import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'

import type { WritingChapter, WritingTabId } from '../types'
import { WritingTabs } from './WritingTabs'

interface WritingCanvasProps {
  bookTitle: string
  volumeTitle: string
  chapter: WritingChapter
  activeTab: WritingTabId
  onTabChange: (tab: WritingTabId) => void
  onTitleChange: (value: string) => void
  onContentChange: (value: string) => void
  onPromptChange: (value: string) => void
  onSceneNoteChange: (index: number, value: string) => void
  onAddSceneNote: () => void
  onCharacterChange: (id: string, field: 'name' | 'role' | 'note', value: string) => void
  onAddCharacter: () => void
  isLoading?: boolean
}

export function WritingCanvas({
  bookTitle,
  volumeTitle,
  chapter,
  activeTab,
  onTabChange,
  onTitleChange,
  onContentChange,
  onPromptChange,
  onSceneNoteChange,
  onAddSceneNote,
  onCharacterChange,
  onAddCharacter,
  isLoading = false,
}: WritingCanvasProps) {
  return (
    <main className="flex min-w-0 flex-1 flex-col bg-white">
      <header className="border-b border-[#E5E4E7] bg-white px-8 pt-4">
        <div className="mb-4 flex items-center gap-2 text-sm text-gray-400">
          <span>我的项目</span>
          <span>/</span>
          <span>{bookTitle}</span>
          <span>/</span>
          <span>{volumeTitle}</span>
          <span>/</span>
          <span className="font-medium text-[#243137]">{chapter.title}</span>
        </div>

        <WritingTabs activeTab={activeTab} onChange={onTabChange} />
      </header>

      <div className="no-scrollbar min-h-0 flex-1 overflow-y-auto">
        {activeTab === 'original' ? (
          <div className="mx-auto max-w-3xl px-8 py-16">
            <Input
              value={chapter.title}
              onChange={(event) => onTitleChange(event.target.value)}
              className="mb-8 h-auto border-none bg-transparent px-0 text-center font-serif text-4xl font-bold text-[#243137] shadow-none focus-visible:ring-0"
            />

            <Textarea
              value={chapter.content}
              onChange={(event) => onContentChange(event.target.value)}
              disabled={isLoading}
              className="min-h-[560px] resize-none border-none bg-transparent px-0 font-serif text-lg leading-loose text-gray-700 shadow-none focus-visible:ring-0"
            />
            {isLoading ? <div className="text-center text-sm text-[#9d9385]">正在加载章节正文...</div> : null}
          </div>
        ) : null}

        {activeTab === 'scene' ? (
          <div className="mx-auto max-w-4xl px-8 py-12">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#243137]">场景追踪</h2>
                <p className="mt-1 text-sm text-gray-400">把片段拆开写，后续接标签、镜头或 AI 提示都会更顺。</p>
              </div>

              <Button variant="outline" className="rounded-[12px] border-[#E5E4E7] text-[#243137]" disabled={isLoading} onClick={onAddSceneNote}>
                <Plus className="mr-2 h-4 w-4" />
                新增片段
              </Button>
            </div>

            <div className="space-y-4">
              {chapter.sceneNotes.map((note, index) => (
                <div key={`${chapter.id}-scene-${index}`} className="rounded-xl border border-[#E5E4E7] bg-[#FCFCFA] p-5">
                  <div className="mb-3 text-xs font-semibold uppercase tracking-[0.12em] text-gray-400">Scene {index + 1}</div>
                  <Textarea
                    value={note}
                    onChange={(event) => onSceneNoteChange(index, event.target.value)}
                    disabled={isLoading}
                    className="min-h-[120px] resize-none border-none bg-transparent px-0 text-sm leading-7 text-gray-700 shadow-none focus-visible:ring-0"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null}

        {activeTab === 'prompt' ? (
          <div className="mx-auto max-w-3xl px-8 py-12">
            <div className="mb-6 flex items-center gap-2 text-[#BD9F67]">
              <Sparkles className="h-4 w-4" />
              <span className="text-sm font-medium">AI Prompt Workspace</span>
            </div>

            <div className="rounded-2xl border border-[#E5E4E7] bg-[#FCFCFA] p-6 shadow-sm">
              <Textarea
                value={chapter.prompt}
                onChange={(event) => onPromptChange(event.target.value)}
                disabled={isLoading}
                className="min-h-[360px] resize-none border-none bg-transparent px-0 text-sm leading-7 text-gray-700 shadow-none focus-visible:ring-0"
              />
            </div>
          </div>
        ) : null}

        {activeTab === 'characters' ? (
          <div className="mx-auto max-w-5xl px-8 py-12">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold text-[#243137]">角色设定</h2>
                <p className="mt-1 text-sm text-gray-400">先把人物卡和写作现场连起来，后面再接资料库。</p>
              </div>

              <Button variant="outline" className="rounded-[12px] border-[#E5E4E7] text-[#243137]" disabled={isLoading} onClick={onAddCharacter}>
                <Plus className="mr-2 h-4 w-4" />
                新增角色
              </Button>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {chapter.characters.map((character) => (
                <div key={character.id} className="rounded-xl border border-[#E5E4E7] bg-white p-5 shadow-sm">
                  <div className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_140px]">
                    <Input
                      value={character.name}
                      onChange={(event) => onCharacterChange(character.id, 'name', event.target.value)}
                      disabled={isLoading}
                      className="h-11 rounded-[12px] border-[#E5E4E7] text-[#243137]"
                    />
                    <Input
                      value={character.role}
                      onChange={(event) => onCharacterChange(character.id, 'role', event.target.value)}
                      disabled={isLoading}
                      className="h-11 rounded-[12px] border-[#E5E4E7] text-[#243137]"
                    />
                  </div>

                  <Textarea
                    value={character.note}
                    onChange={(event) => onCharacterChange(character.id, 'note', event.target.value)}
                    disabled={isLoading}
                    className="mt-3 min-h-[160px] resize-none rounded-[14px] border-[#E5E4E7] text-sm leading-7 text-gray-600"
                  />
                </div>
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </main>
  )
}

// 写作区正文工作台。

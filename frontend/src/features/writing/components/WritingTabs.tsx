import { Sparkles } from 'lucide-react'

import type { WritingTabId } from '../types'

const tabs: Array<{ id: WritingTabId; label: string }> = [
  { id: 'original', label: 'Original Text' },
  { id: 'scene', label: 'Scene Tracking' },
  { id: 'prompt', label: 'AI Prompt' },
  { id: 'characters', label: 'Character Setting' },
]

interface WritingTabsProps {
  activeTab: WritingTabId
  onChange: (tab: WritingTabId) => void
}

export function WritingTabs({ activeTab, onChange }: WritingTabsProps) {
  return (
    <div className="flex gap-6">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          onClick={() => onChange(tab.id)}
          className={[
            'flex items-center gap-1 border-b-2 pb-3 text-sm font-medium',
            activeTab === tab.id ? 'border-[#BD9F67] text-[#243137]' : 'border-transparent text-gray-400 hover:text-gray-600',
          ].join(' ')}
        >
          {tab.id === 'prompt' ? <Sparkles className="h-3.5 w-3.5 text-[#BD9F67]" /> : null}
          {tab.label}
        </button>
      ))}
    </div>
  )
}

// 写作区顶部标签切换。

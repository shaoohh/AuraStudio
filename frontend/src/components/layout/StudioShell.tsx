import { Outlet } from "react-router-dom"

import { StudioSidebar } from "./StudioSidebar"

export function StudioShell() {
  return (
    <div className="flex h-screen w-screen overflow-hidden bg-[#F8FAF9] text-gray-800">
      <StudioSidebar />
      <div className="min-w-0 flex-1">
        <Outlet />
      </div>
    </div>
  )
}

// 全局工作台布局，负责固定左侧导航和右侧内容区。

import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'

import { StudioShell } from './components/layout/StudioShell'
import { AuthGuard } from './features/auth/components/AuthGuard'
import { LoginPage } from './features/auth/pages/LoginPage'
import { SettingsPage } from './features/settings/pages/SettingsPage'
import { TasksPage } from './features/todo/pages/TasksPage'
import { WritingStudioPage } from './features/writing/pages/WritingStudioPage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />

        <Route
          path="/"
          element={
            <AuthGuard>
              <StudioShell />
            </AuthGuard>
          }
        >
          <Route index element={<Navigate to="/writing" replace />} />
          <Route path="writing" element={<WritingStudioPage />} />
          <Route path="tasks" element={<TasksPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Routes>
    </BrowserRouter>
  )
}

// 应用主路由，挂载登录页和受保护工作台。

import { useState } from "react"

import { AppearanceSettingsForm } from "../components/AppearanceSettingsForm"
import { ProfileSettingsForm } from "../components/ProfileSettingsForm"
import { SecuritySettingsForm } from "../components/SecuritySettingsForm"
import { SettingsSidebar } from "../components/SettingsSidebar"
import type { AppearanceFormState, ProfileFormState, SecurityFormState, SettingsSectionId } from "../types"

const initialProfile: ProfileFormState = {
  displayName: "Aura Writer",
  email: "hello@aura-studio.com",
  bio: "长期写长篇，也整理任务，偶尔会把一段灵感先扔进 AI Prompt 再慢慢磨。",
}

const initialSecurity: SecurityFormState = {
  currentPassword: "",
  newPassword: "",
  confirmPassword: "",
  twoFactorEnabled: true,
}

const initialAppearance: AppearanceFormState = {
  theme: "system",
  density: "comfortable",
  focusMode: false,
}

export function SettingsPage() {
  const [activeSection, setActiveSection] = useState<SettingsSectionId>("profile")
  const [profileForm, setProfileForm] = useState(initialProfile)
  const [securityForm, setSecurityForm] = useState(initialSecurity)
  const [appearanceForm, setAppearanceForm] = useState(initialAppearance)
  const [profileSaved, setProfileSaved] = useState(true)
  const [securitySaved, setSecuritySaved] = useState(true)
  const [appearanceSaved, setAppearanceSaved] = useState(true)

  return (
    <div className="flex h-full min-h-0 bg-[#F8FAF9]">
      <SettingsSidebar activeSection={activeSection} onChange={setActiveSection} />

      {activeSection === "profile" ? (
        <ProfileSettingsForm
          form={profileForm}
          isSaved={profileSaved}
          onChange={(field, value) => {
            setProfileSaved(false)
            setProfileForm((current) => ({ ...current, [field]: value }))
          }}
          onCancel={() => {
            setProfileForm(initialProfile)
            setProfileSaved(true)
          }}
          onSave={() => setProfileSaved(true)}
        />
      ) : null}

      {activeSection === "security" ? (
        <SecuritySettingsForm
          form={securityForm}
          isSaved={securitySaved}
          onChange={(field, value) => {
            setSecuritySaved(false)
            setSecurityForm((current) => ({ ...current, [field]: value }))
          }}
          onSave={() => setSecuritySaved(true)}
        />
      ) : null}

      {activeSection === "appearance" ? (
        <AppearanceSettingsForm
          form={appearanceForm}
          isSaved={appearanceSaved}
          onChange={(field, value) => {
            setAppearanceSaved(false)
            setAppearanceForm((current) => ({ ...current, [field]: value }))
          }}
          onSave={() => setAppearanceSaved(true)}
        />
      ) : null}
    </div>
  )
}

// 设置页，负责设置分区和本地表单状态。

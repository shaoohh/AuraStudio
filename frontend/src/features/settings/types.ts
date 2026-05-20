export type SettingsSectionId = "profile" | "security" | "appearance"

export interface ProfileFormState {
  displayName: string
  email: string
  bio: string
}

export interface SecurityFormState {
  currentPassword: string
  newPassword: string
  confirmPassword: string
  twoFactorEnabled: boolean
}

export interface AppearanceFormState {
  theme: "system" | "light" | "dark"
  density: "comfortable" | "compact"
  focusMode: boolean
}

// 设置域类型定义。

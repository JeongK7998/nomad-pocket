const SESSION_KEY = 'nomad_pocket_user_session'

export interface UserSession {
  id: string
  name: string
  color?: string
}

export function getCurrentUser(): UserSession | null {
  if (typeof window === 'undefined') return null
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

export function setCurrentUser(user: UserSession): void {
  localStorage.setItem(SESSION_KEY, JSON.stringify(user))
}

export function clearCurrentUser(): void {
  localStorage.removeItem(SESSION_KEY)
}

export function requireUserId(): string {
  const user = getCurrentUser()
  if (!user?.id) throw new Error('No active user — please select a user')
  return user.id
}

// 색상이 설정되지 않았을 때 fallback용 결정론적 색상
const AVATAR_COLORS = ['#004ea7','#5898ff','#99d276','#ff786b','#a27cda','#fe9e59','#75cd10','#f6728e']

export function getAvatarColor(id: string, customColor?: string | null): string {
  if (customColor) return customColor
  const hash = id.split('').reduce((acc, c) => acc + c.charCodeAt(0), 0)
  return AVATAR_COLORS[hash % AVATAR_COLORS.length]
}

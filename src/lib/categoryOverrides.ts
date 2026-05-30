const CATEGORY_COLOR_KEY = 'nomad_pocket_category_colors'
const SUBCATEGORY_EMOJI_KEY = 'nomad_pocket_subcategory_emojis'

function canUseStorage() {
  return typeof window !== 'undefined' && typeof window.localStorage !== 'undefined'
}

function readMap(key: string): Record<string, string> {
  if (!canUseStorage()) return {}
  try {
    const raw = window.localStorage.getItem(key)
    if (!raw) return {}
    const parsed = JSON.parse(raw)
    return typeof parsed === 'object' && parsed !== null ? parsed as Record<string, string> : {}
  } catch {
    return {}
  }
}

function writeMap(key: string, value: Record<string, string>) {
  if (!canUseStorage()) return
  window.localStorage.setItem(key, JSON.stringify(value))
}

export function getCategoryColorOverride(id: string) {
  return readMap(CATEGORY_COLOR_KEY)[id] ?? null
}

export function setCategoryColorOverride(id: string, color: string | null | undefined) {
  if (!canUseStorage()) return
  const map = readMap(CATEGORY_COLOR_KEY)
  if (!color) delete map[id]
  else map[id] = color
  writeMap(CATEGORY_COLOR_KEY, map)
}

export function getSubcategoryEmojiOverride(id: string) {
  return readMap(SUBCATEGORY_EMOJI_KEY)[id] ?? null
}

export function setSubcategoryEmojiOverride(id: string, emoji: string | null | undefined) {
  if (!canUseStorage()) return
  const map = readMap(SUBCATEGORY_EMOJI_KEY)
  if (!emoji) delete map[id]
  else map[id] = emoji
  writeMap(SUBCATEGORY_EMOJI_KEY, map)
}

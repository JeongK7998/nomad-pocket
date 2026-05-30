import type { Category, Subcategory } from '@/types/database'

export const CATEGORY_PASTEL_COLORS = [
  '#D9EAFD',
  '#FDE2E4',
  '#FFF1C9',
  '#DDF4E7',
  '#E7D9FF',
  '#FFDCC8',
  '#D8F3F0',
  '#FCE1F3',
  '#E6EAF2',
  '#DFF2D8',
] as const

export const DEFAULT_CATEGORY_COLOR = CATEGORY_PASTEL_COLORS[0]

export function getCategoryColor(category?: Pick<Category, 'color'> | null): string {
  return category?.color ?? DEFAULT_CATEGORY_COLOR
}

export function getSubcategoryThumbnail(category?: Pick<Category, 'color'> | null, subcategory?: Pick<Subcategory, 'emoji'> | null) {
  return {
    backgroundColor: getCategoryColor(category),
    emoji: subcategory?.emoji ?? '•',
  }
}

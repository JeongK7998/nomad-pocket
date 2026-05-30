import type { Subcategory } from '@/types/database'

export const SUBCATEGORY_EMOJI_GROUPS = [
  {
    label: '식비',
    emojis: ['🍚', '🍔', '🍕', '🍜', '🍣', '🥗', '🍞', '🥐', '🍳', '🍱', '🍙', '🍛', '🍝', '🌮', '🍗', '🥩'],
  },
  {
    label: '카페/간식',
    emojis: ['☕', '🧋', '🍵', '🥤', '🍰', '🧁', '🍪', '🍫', '🍦', '🍨', '🍩', '🥨'],
  },
  {
    label: '주거/생활',
    emojis: ['🏠', '🏡', '🛋️', '🛏️', '🚪', '🪑', '🪟', '🧺', '🧻', '🧴', '🧼', '🪥', '🧹', '🪠', '🗑️', '💡'],
  },
  {
    label: '교통/이동',
    emojis: ['🚗', '🚕', '🚌', '🚇', '🚆', '🚅', '🚲', '🛴', '🏍️', '⛽', '🅿️', '🚏', '🛣️', '🚦'],
  },
  {
    label: '여행/숙박',
    emojis: ['✈️', '🧳', '🏨', '🏝️', '🗺️', '📍', '🎫', '🚢', '🏖️', '⛰️', '🌆', '🎒'],
  },
  {
    label: '쇼핑',
    emojis: ['🛒', '🛍️', '👕', '👖', '👟', '🧥', '⌚', '💄', '🕶️', '🎁', '📦', '🧸', '🪴', '🪙'],
  },
  {
    label: '건강/운동',
    emojis: ['💊', '🏥', '🦷', '🩺', '💉', '🩹', '🧘', '💪', '🏃', '🚴', '🏊', '🥊', '⚽', '🏋️'],
  },
  {
    label: '미용/자기관리',
    emojis: ['💇', '💅', '🧴', '🧼', '🪒', '🧖', '🪞', '💄', '🧡', '😴'],
  },
  {
    label: '디지털/구독',
    emojis: ['📺', '📱', '💻', '⌨️', '🖥️', '🖨️', '🎮', '🎧', '🎵', '🎬', '📚', '📰', '🛜', '☁️', '🔋'],
  },
  {
    label: '일/학습',
    emojis: ['💼', '🧾', '📈', '📊', '📌', '✏️', '📝', '📓', '🎓', '📎', '🛠️', '🔧', '🧰', '🏢'],
  },
  {
    label: '금융/고정비',
    emojis: ['💸', '💰', '🏦', '💳', '🧮', '📉', '📈', '🧾', '🏷️', '📑', '🪙', '🔒'],
  },
  {
    label: '가족/관계',
    emojis: ['👶', '🧒', '👨', '👩', '👨‍👩‍👧', '👫', '💑', '🐶', '🐱', '🎂', '💐', '🙏'],
  },
  {
    label: '취미/여가',
    emojis: ['🎨', '📷', '🎹', '🎸', '🎤', '🎯', '🎣', '🎮', '⚽', '🏕️', '🌱', '⭐', '🎉', '🎁'],
  },
  {
    label: '분류용',
    emojis: ['✅', '📌', '📂', '📁', '🔖', '🔹', '🔸', '⚪', '🟢', '🔵', '🟣', '🟠'],
  },
] as const

export const SUBCATEGORY_EMOJI_SET = SUBCATEGORY_EMOJI_GROUPS.flatMap((group) => group.emojis)

const EMOJI_KEYWORDS: Array<{ emoji: string; keywords: string[] }> = [
  { emoji: '☕', keywords: ['커피', '카페', '라떼', '아메리카노', 'tea', 'coffee', '음료'] },
  { emoji: '🍚', keywords: ['식비', '식사', '밥', '점심', '저녁', '아침', '배달', '한식'] },
  { emoji: '🍔', keywords: ['버거', '햄버거', '패스트푸드'] },
  { emoji: '🍜', keywords: ['라면', '국수', '우동', '면'] },
  { emoji: '🍣', keywords: ['초밥', '스시', '일식'] },
  { emoji: '🍰', keywords: ['디저트', '케이크', '베이커리', '빵', '간식'] },
  { emoji: '🏠', keywords: ['주거', '월세', '전세', '집세', '관리비', '렌트', '임대'] },
  { emoji: '💡', keywords: ['전기', '전기세', '가스', '수도', '공과금'] },
  { emoji: '🧴', keywords: ['생필품', '생활용품', '세제', '휴지'] },
  { emoji: '🚇', keywords: ['지하철', '전철', 'subway'] },
  { emoji: '🚌', keywords: ['버스'] },
  { emoji: '🚕', keywords: ['택시'] },
  { emoji: '⛽', keywords: ['주유', '기름', '연료'] },
  { emoji: '✈️', keywords: ['항공', '비행기', '항공권', 'flight'] },
  { emoji: '🏨', keywords: ['호텔', '숙박', '민박', '에어비앤비'] },
  { emoji: '🧳', keywords: ['여행', '트립'] },
  { emoji: '🛒', keywords: ['쇼핑', '구매', '장보기'] },
  { emoji: '👕', keywords: ['의류', '옷', '셔츠', '바지'] },
  { emoji: '👟', keywords: ['신발', '운동화'] },
  { emoji: '💄', keywords: ['화장품', '코스메틱', '립', '메이크업'] },
  { emoji: '💊', keywords: ['약', '병원', '약국', '진료', '의료'] },
  { emoji: '💪', keywords: ['운동', '헬스', '피트니스', 'pt'] },
  { emoji: '💇', keywords: ['미용', '헤어', '커트', '미용실', '네일'] },
  { emoji: '💻', keywords: ['노트북', '컴퓨터', '개발', '디지털', '소프트웨어'] },
  { emoji: '📱', keywords: ['휴대폰', '핸드폰', '모바일', '통신'] },
  { emoji: '📺', keywords: ['넷플릭스', '구독', 'ott', '유튜브', '영상'] },
  { emoji: '💼', keywords: ['업무', '일', '비즈니스', '사업'] },
  { emoji: '✏️', keywords: ['학습', '공부', '교육', '수업', '책'] },
  { emoji: '💳', keywords: ['카드', '결제', '수수료'] },
  { emoji: '🏦', keywords: ['은행', '대출', '예금', '적금'] },
  { emoji: '💸', keywords: ['세금', '보험', '고정비'] },
  { emoji: '🎁', keywords: ['선물', '기념일'] },
  { emoji: '🐶', keywords: ['반려', '강아지', '개'] },
  { emoji: '🐱', keywords: ['고양이', '냥'] },
  { emoji: '🎨', keywords: ['취미', '그림', '전시'] },
  { emoji: '🎮', keywords: ['게임'] },
  { emoji: '🎵', keywords: ['음악', '공연', '콘서트'] },
]

export function formatSubcategoryLabel(subcategory: Pick<Subcategory, 'name' | 'emoji'> | null | undefined): string {
  if (!subcategory) return '-'
  return subcategory.emoji ? `${subcategory.emoji} ${subcategory.name}` : subcategory.name
}

export function splitSubcategoryLabel(label: string | null | undefined) {
  if (!label) return { emoji: null, text: '-' }
  const trimmed = label.trim()
  const match = trimmed.match(/^(\p{Extended_Pictographic}(?:\uFE0F|\u200D\p{Extended_Pictographic})*)\s+(.*)$/u)
  if (!match) return { emoji: null, text: trimmed }
  return { emoji: match[1], text: match[2] || trimmed }
}

function hashString(value: string) {
  let hash = 0
  for (let i = 0; i < value.length; i += 1) {
    hash = (hash * 31 + value.charCodeAt(i)) >>> 0
  }
  return hash
}

export function recommendSubcategoryEmoji(name: string, categoryName?: string | null): string {
  const haystack = `${categoryName ?? ''} ${name}`.trim().toLowerCase()
  for (const item of EMOJI_KEYWORDS) {
    if (item.keywords.some((keyword) => haystack.includes(keyword.toLowerCase()))) {
      return item.emoji
    }
  }

  const matchedGroup = SUBCATEGORY_EMOJI_GROUPS.find((group) =>
    categoryName?.includes(group.label.split('/')[0]) || name.includes(group.label.split('/')[0])
  )
  if (matchedGroup) {
    return matchedGroup.emojis[hashString(name) % matchedGroup.emojis.length]
  }

  return SUBCATEGORY_EMOJI_SET[hashString(haystack || name) % SUBCATEGORY_EMOJI_SET.length] ?? '📌'
}

const CACHE_KEY = 'nomad_exchange_rates'
const CACHE_TTL_MS = 24 * 60 * 60 * 1000 // 하루

interface RateCache {
  rates: Record<string, number> // { USD: 1342.40, JPY: 9.12, ... }
  updatedAt: string             // ISO timestamp
}

function loadCache(): RateCache | null {
  try {
    const raw = localStorage.getItem(CACHE_KEY)
    if (!raw) return null
    const cache: RateCache = JSON.parse(raw)
    const age = Date.now() - new Date(cache.updatedAt).getTime()
    return age < CACHE_TTL_MS ? cache : null
  } catch {
    return null
  }
}

function saveCache(rates: Record<string, number>) {
  const cache: RateCache = { rates, updatedAt: new Date().toISOString() }
  try { localStorage.setItem(CACHE_KEY, JSON.stringify(cache)) } catch { /* ignore */ }
}

// KRW 기준 환율 조회 (1 외화 = ? KRW)
export async function fetchKrwRates(currencyCodes: string[]): Promise<{ rates: Record<string, number>; updatedAt: string }> {
  const foreign = currencyCodes.filter((c) => c !== 'KRW')
  if (foreign.length === 0) return { rates: {}, updatedAt: new Date().toISOString() }

  const cached = loadCache()
  if (cached) {
    const needed = foreign.filter((c) => cached.rates[c] !== undefined)
    if (needed.length === foreign.length) return { rates: cached.rates, updatedAt: cached.updatedAt }
  }

  // KRW 기준으로 한 번에 조회
  const res = await fetch('https://open.er-api.com/v6/latest/KRW')
  if (!res.ok) throw new Error('환율 API 오류')
  const data = await res.json()
  const allRates: Record<string, number> = data.rates ?? {}

  // KRW/X = 1/X_per_KRW → 1 X = (1 / allRates[X]) KRW
  const krwRates: Record<string, number> = {}
  for (const code of foreign) {
    const rate = allRates[code]
    if (rate && rate > 0) krwRates[code] = Math.round((1 / rate) * 10000) / 10000
  }

  saveCache(krwRates)
  return { rates: krwRates, updatedAt: new Date().toISOString() }
}

// 캐시 업데이트 시각 반환
export function getCacheUpdatedAt(): string | null {
  const cached = loadCache()
  return cached ? cached.updatedAt : null
}

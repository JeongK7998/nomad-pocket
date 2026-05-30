const ACK_KEY = 'nomad_pocket_notification_ack'
const SNOOZE_KEY = 'nomad_pocket_notification_snooze'

type AckMap = Record<string, string>

function readAckMap(): AckMap {
  if (typeof window === 'undefined') return {}

  try {
    const raw = localStorage.getItem(ACK_KEY)
    return raw ? JSON.parse(raw) as AckMap : {}
  } catch {
    return {}
  }
}

function writeAckMap(map: AckMap) {
  localStorage.setItem(ACK_KEY, JSON.stringify(map))
}

export function getNotificationAck(userId: string): string | null {
  return readAckMap()[userId] ?? null
}

export function setNotificationAck(userId: string, iso: string) {
  const map = readAckMap()
  map[userId] = iso
  writeAckMap(map)
}

export function getNotificationSnooze(userId: string): string | null {
  try {
    if (typeof window === 'undefined') return null
    const raw = localStorage.getItem(SNOOZE_KEY)
    const map = raw ? JSON.parse(raw) as AckMap : {}
    return map[userId] ?? null
  } catch {
    return null
  }
}

export function setNotificationSnooze(userId: string, iso: string) {
  try {
    const raw = localStorage.getItem(SNOOZE_KEY)
    const map = raw ? JSON.parse(raw) as AckMap : {}
    map[userId] = iso
    localStorage.setItem(SNOOZE_KEY, JSON.stringify(map))
  } catch {
    // 알림 snooze 실패는 앱 사용을 막지 않는다.
  }
}

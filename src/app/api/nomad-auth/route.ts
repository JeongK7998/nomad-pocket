import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const COOKIE_NAME = 'nomad_pocket_session'
const COOKIE_MAX_AGE = 60 * 60 * 24 * 30
type PinHashRow = Record<'pin_hash', unknown>

function getServiceClient() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!url || !serviceKey) {
    throw new Error('Missing Supabase server configuration')
  }
  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  })
}

function sessionSecret() {
  return process.env.NOMAD_POCKET_SESSION_SECRET ?? process.env.SUPABASE_SERVICE_ROLE_KEY ?? ''
}

function signSession(value: string) {
  return createHmac('sha256', sessionSecret()).update(value).digest('hex')
}

function safeEqual(left: string, right: string) {
  const leftBuffer = Buffer.from(left)
  const rightBuffer = Buffer.from(right)
  return leftBuffer.length === rightBuffer.length && timingSafeEqual(leftBuffer, rightBuffer)
}

export async function POST(request: Request) {
  try {
    const { pin } = await request.json()
    if (typeof pin !== 'string' || pin.length === 0) {
      return NextResponse.json({ error: 'PIN is required' }, { status: 400 })
    }

    const pinHash = Buffer.from(pin, 'utf8').toString('base64')
    const supabase = getServiceClient()
    const { data, error } = await supabase
      .from('profiles')
      .select('pin_hash')
      .not('pin_hash', 'is', null)
      .limit(1)

    if (error) throw error

    const pinHashRows = (Array.isArray(data) ? data : []) as PinHashRow[]
    const sharedPinHash = pinHashRows[0]?.['pin_hash']
    if (typeof sharedPinHash !== 'string' || !safeEqual(pinHash, sharedPinHash)) {
      return NextResponse.json({ error: 'Invalid PIN' }, { status: 401 })
    }

    const sessionValue = signSession(sharedPinHash)
    const cookieStore = await cookies()
    cookieStore.set(COOKIE_NAME, sessionValue, {
      httpOnly: true,
      sameSite: 'lax',
      secure: process.env.NODE_ENV === 'production',
      path: '/',
      maxAge: COOKIE_MAX_AGE,
    })

    return NextResponse.json({ ok: true })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Authentication failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

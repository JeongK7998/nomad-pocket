import { createHmac, timingSafeEqual } from 'crypto'
import { cookies } from 'next/headers'
import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

const COOKIE_NAME = 'nomad_pocket_session'
const TABLES = new Set([
  'profiles',
  'categories',
  'subcategories',
  'payment_methods',
  'regions',
  'tags',
  'currencies',
  'fixed_items',
  'transactions',
  'budgets',
])

type FilterOperator = 'eq' | 'neq' | 'gte' | 'lte' | 'gt' | 'lt' | 'contains' | 'is' | 'not'
type QueryFilter = { operator: FilterOperator; column: string; value: unknown; filterOperator?: string }
type QueryOrder = { column: string; ascending?: boolean }
type QueryOperation = 'select' | 'insert' | 'update' | 'delete'
type QueryBody = {
  table?: string
  operation?: QueryOperation
  columns?: string
  options?: { count?: 'exact' | 'planned' | 'estimated'; head?: boolean }
  payload?: unknown
  filters?: QueryFilter[]
  orders?: QueryOrder[]
  limit?: number
  single?: boolean
}
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

function sanitizeProfiles(data: unknown) {
  if (!Array.isArray(data)) return data
  return data.map((profile) => {
    if (!profile || typeof profile !== 'object') return profile
    return { ...profile, pin_hash: null }
  })
}

async function hasValidSession(supabase: any) {
  const cookieStore = await cookies()
  const session = cookieStore.get(COOKIE_NAME)?.value
  if (!session) return false

  const { data, error } = await supabase
    .from('profiles')
    .select('pin_hash')
    .not('pin_hash', 'is', null)

  if (error) throw error
  const pinHashRows = (Array.isArray(data) ? data : []) as PinHashRow[]
  return pinHashRows.some((profile) => {
    const pinHash = profile['pin_hash']
    return typeof pinHash === 'string' && safeEqual(session, signSession(pinHash))
  })
}

function applyFilter(query: any, filter: QueryFilter) {
  switch (filter.operator) {
    case 'eq':
      return query.eq(filter.column, filter.value)
    case 'neq':
      return query.neq(filter.column, filter.value)
    case 'gte':
      return query.gte(filter.column, filter.value)
    case 'lte':
      return query.lte(filter.column, filter.value)
    case 'gt':
      return query.gt(filter.column, filter.value)
    case 'lt':
      return query.lt(filter.column, filter.value)
    case 'contains':
      return query.contains(filter.column, filter.value)
    case 'is':
      return query.is(filter.column, filter.value)
    case 'not':
      return query.not(filter.column, filter.filterOperator ?? 'eq', filter.value)
    default:
      return query
  }
}

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as QueryBody
    const table = body.table
    const operation = body.operation ?? 'select'

    if (!table || !TABLES.has(table)) {
      return NextResponse.json({ error: 'Table is not allowed' }, { status: 400 })
    }

    const supabase = getServiceClient()
    const publicProfileList = table === 'profiles' && operation === 'select'
    let validSession = await hasValidSession(supabase)

    if (!validSession && table === 'profiles' && operation === 'insert') {
      const { count, error } = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
      if (error) throw error
      validSession = (count ?? 0) === 0
    }

    if (!publicProfileList && !validSession) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 })
    }

    let query: any
    const columns = body.columns ?? '*'

    if (operation === 'select') {
      query = supabase.from(table).select(columns, body.options)
    } else if (operation === 'insert') {
      query = supabase.from(table).insert(body.payload)
      if (body.columns) query = query.select(columns)
    } else if (operation === 'update') {
      query = supabase.from(table).update(body.payload)
      if (body.columns) query = query.select(columns)
    } else if (operation === 'delete') {
      query = supabase.from(table).delete()
      if (body.columns) query = query.select(columns)
    } else {
      return NextResponse.json({ error: 'Operation is not allowed' }, { status: 400 })
    }

    for (const filter of body.filters ?? []) {
      query = applyFilter(query, filter)
    }

    for (const order of body.orders ?? []) {
      query = query.order(order.column, { ascending: order.ascending })
    }

    if (typeof body.limit === 'number') {
      query = query.limit(body.limit)
    }

    if (body.single) {
      query = query.single()
    }

    const { data, error, count } = await query
    if (error) {
      return NextResponse.json({ error: error.message, count: count ?? null }, { status: 400 })
    }

    return NextResponse.json({
      data: publicProfileList && !validSession ? sanitizeProfiles(data) : data,
      count: count ?? null,
    })
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Database request failed'
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

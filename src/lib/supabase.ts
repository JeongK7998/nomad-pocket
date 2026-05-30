import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

type FilterOperator = 'eq' | 'neq' | 'gte' | 'lte' | 'gt' | 'lt' | 'contains' | 'is' | 'not'
type QueryFilter = { operator: FilterOperator; column: string; value: unknown; filterOperator?: string }
type QueryOrder = { column: string; ascending?: boolean }
type QueryOperation = 'select' | 'insert' | 'update' | 'delete'

interface QueryState {
  table: string
  operation: QueryOperation
  columns?: string
  options?: { count?: 'exact' | 'planned' | 'estimated'; head?: boolean }
  payload?: unknown
  filters: QueryFilter[]
  orders: QueryOrder[]
  limit?: number
  single?: boolean
}

type QueryResult<T = unknown> = {
  data: T | null
  error: Error | null
  count?: number | null
}

class ApiTableQuery<T = unknown> implements PromiseLike<QueryResult<T>> {
  private state: QueryState

  constructor(table: string) {
    this.state = {
      table,
      operation: 'select',
      columns: '*',
      filters: [],
      orders: [],
    }
  }

  select(columns = '*', options?: QueryState['options']) {
    this.state.operation = this.state.operation === 'select' ? 'select' : this.state.operation
    this.state.columns = columns
    this.state.options = options
    return this
  }

  insert(payload: unknown) {
    this.state.operation = 'insert'
    this.state.payload = payload
    return this
  }

  update(payload: unknown) {
    this.state.operation = 'update'
    this.state.payload = payload
    return this
  }

  delete() {
    this.state.operation = 'delete'
    return this
  }

  eq(column: string, value: unknown) {
    this.state.filters.push({ operator: 'eq', column, value })
    return this
  }

  neq(column: string, value: unknown) {
    this.state.filters.push({ operator: 'neq', column, value })
    return this
  }

  gte(column: string, value: unknown) {
    this.state.filters.push({ operator: 'gte', column, value })
    return this
  }

  lte(column: string, value: unknown) {
    this.state.filters.push({ operator: 'lte', column, value })
    return this
  }

  gt(column: string, value: unknown) {
    this.state.filters.push({ operator: 'gt', column, value })
    return this
  }

  lt(column: string, value: unknown) {
    this.state.filters.push({ operator: 'lt', column, value })
    return this
  }

  contains(column: string, value: unknown) {
    this.state.filters.push({ operator: 'contains', column, value })
    return this
  }

  is(column: string, value: unknown) {
    this.state.filters.push({ operator: 'is', column, value })
    return this
  }

  not(column: string, filterOperator: string, value: unknown) {
    this.state.filters.push({ operator: 'not', column, filterOperator, value })
    return this
  }

  order(column: string, options?: { ascending?: boolean }) {
    this.state.orders.push({ column, ascending: options?.ascending })
    return this
  }

  limit(value: number) {
    this.state.limit = value
    return this
  }

  single() {
    this.state.single = true
    return this
  }

  async execute(): Promise<QueryResult<T>> {
    try {
      const response = await fetch('/api/db', {
        method: 'POST',
        headers: { 'content-type': 'application/json' },
        credentials: 'same-origin',
        body: JSON.stringify(this.state),
      })
      const result = await response.json().catch(() => ({}))
      if (!response.ok) {
        return {
          data: null,
          error: new Error(result?.error ?? `Database request failed (${response.status})`),
          count: result?.count ?? null,
        }
      }
      return {
        data: (result?.data ?? null) as T,
        error: null,
        count: result?.count ?? null,
      }
    } catch (error) {
      return {
        data: null,
        error: error instanceof Error ? error : new Error(String(error)),
        count: null,
      }
    }
  }

  then<TResult1 = QueryResult<T>, TResult2 = never>(
    onfulfilled?: ((value: QueryResult<T>) => TResult1 | PromiseLike<TResult1>) | null,
    onrejected?: ((reason: unknown) => TResult2 | PromiseLike<TResult2>) | null,
  ): PromiseLike<TResult1 | TResult2> {
    return this.execute().then(onfulfilled, onrejected)
  }
}

class ApiSupabaseClient {
  from(table: string) {
    return new ApiTableQuery(table)
  }
}

// Browser code must go through the Next.js API after public-table RLS lockdown.
// Server-only code can still use the normal anon client if needed.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase: any =
  typeof window === 'undefined'
    ? createClient<any>(supabaseUrl, supabaseAnonKey)
    : new ApiSupabaseClient()

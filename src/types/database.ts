export type TransactionType = 'expense' | 'income'
export type CurrencyCode = 'KRW' | 'USD' | 'JPY' | 'EUR' | 'THB' | 'SGD' | 'AUD' | 'IDR' | string
export type BudgetPeriodType = 'yearly' | 'monthly' | 'custom'
export type BudgetFilterType = 'total' | 'category' | 'subcategory' | 'region' | 'tag'
export type TransactionImportSource = 'sms' | 'image' | 'text' | 'manual'
export type TransactionImportStatus = 'pending_review' | 'reviewed'

// ─── 테이블 Row 타입 ───────────────────────────────────────────────────────────

export interface Category {
  id: string
  name: string
  type: TransactionType
  color: string | null
  user_id?: string | null
  created_at: string
}

export interface Subcategory {
  id: string
  category_id: string
  name: string
  emoji: string | null
  user_id?: string | null
  created_at: string
}

export interface PaymentMethod {
  id: string
  name: string
  color: string
  initial: string
  owner: string | null
  user_id?: string | null
  created_at: string
}

export interface Region {
  id: string
  name: string
  is_active: boolean
  user_id?: string | null
  created_at: string
}

export interface Tag {
  id: string
  name: string
  is_active: boolean
  user_id?: string | null
  created_at: string
}

export interface Currency {
  code: string
  name: string
  symbol: string
  is_active: boolean
  updated_at: string
}

export interface Transaction {
  id: string
  type: TransactionType
  date: string
  category_id: string
  subcategory_id: string
  description: string
  memo: string | null
  amount: number
  currency: string
  original_amount: number | null
  exchange_rate: number | null
  payment_method_id: string | null
  region_id: string | null
  tag_ids: string[]
  is_fixed: boolean
  fixed_item_id: string | null
  user_id?: string | null
  import_source?: TransactionImportSource | null
  import_status?: TransactionImportStatus | null
  import_confidence?: number | null
  import_raw_text?: string | null
  created_at: string
}

export interface FixedItem {
  id: string
  type: TransactionType
  category_id: string
  subcategory_id: string
  description: string
  amount: number
  currency: string
  payment_method_id: string | null
  day_of_month: number | null
  is_active: boolean
  user_id?: string | null
  created_at: string
}

export interface Budget {
  id: string
  name: string
  target_amount: number
  period_type: BudgetPeriodType
  year: number | null
  month: number | null
  start_date: string | null    // custom 기간 시작일
  end_date: string | null      // custom 기간 종료일
  filter_type: BudgetFilterType
  filter_id: string | null
  is_system?: boolean          // 월간/년간 기본 목표 — 삭제 불가 (optional: 컬럼 없어도 동작)
  is_active: boolean
  user_id?: string | null
  created_at: string
}

export interface Profile {
  id: string
  name: string
  pin_hash: string | null
  color: string | null
  created_at: string
}

// ─── Supabase Database 제네릭 타입 (supabase-js v2 형식) ──────────────────────

export type Database = {
  public: {
    Tables: {
      categories: {
        Row: Category
        Insert: Omit<Category, 'id' | 'created_at'>
        Update: Partial<Omit<Category, 'id' | 'created_at'>>
        Relationships: []
      }
      subcategories: {
        Row: Subcategory
        Insert: Omit<Subcategory, 'id' | 'created_at'>
        Update: Partial<Omit<Subcategory, 'id' | 'created_at'>>
        Relationships: []
      }
      payment_methods: {
        Row: PaymentMethod
        Insert: Omit<PaymentMethod, 'id' | 'created_at'>
        Update: Partial<Omit<PaymentMethod, 'id' | 'created_at'>>
        Relationships: []
      }
      regions: {
        Row: Region
        Insert: Omit<Region, 'id' | 'created_at'>
        Update: Partial<Omit<Region, 'id' | 'created_at'>>
        Relationships: []
      }
      tags: {
        Row: Tag
        Insert: Omit<Tag, 'id' | 'created_at'>
        Update: Partial<Omit<Tag, 'id' | 'created_at'>>
        Relationships: []
      }
      currencies: {
        Row: Currency
        Insert: Omit<Currency, 'updated_at'>
        Update: Partial<Omit<Currency, 'code'>>
        Relationships: []
      }
      transactions: {
        Row: Transaction
        Insert: Omit<Transaction, 'id' | 'created_at'>
        Update: Partial<Omit<Transaction, 'id' | 'created_at'>>
        Relationships: []
      }
      fixed_items: {
        Row: FixedItem
        Insert: Omit<FixedItem, 'id' | 'created_at'>
        Update: Partial<Omit<FixedItem, 'id' | 'created_at'>>
        Relationships: []
      }
      budgets: {
        Row: Budget
        Insert: Omit<Budget, 'id' | 'created_at'> & { is_system?: boolean }
        Update: Partial<Omit<Budget, 'id' | 'created_at'>>
        Relationships: []
      }
      profiles: {
        Row: Profile
        Insert: Omit<Profile, 'id' | 'created_at'>
        Update: Partial<Omit<Profile, 'id' | 'created_at'>>
        Relationships: []
      }
    }
    Views: Record<string, unknown>
    Functions: Record<string, unknown>
    Enums: Record<string, unknown>
    CompositeTypes: Record<string, unknown>
  }
}

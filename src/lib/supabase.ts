import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

// 현재 프로젝트는 수동 타입 레이어를 별도로 유지하고 있어
// Supabase 클라이언트 제네릭을 강하게 연결하면 오히려 기존 코드와 충돌한다.
// 실제 도메인 타입은 API 레이어에서 관리한다.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const supabase = createClient<any>(supabaseUrl, supabaseAnonKey)

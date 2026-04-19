import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  'https://exifzqlvcmdlibkrvhui.supabase.co',
  'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV4aWZ6cWx2Y21kbGlia3J2aHVpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzYyNDg2NDYsImV4cCI6MjA5MTgyNDY0Nn0.jKWQz3eU_WW8hBzNP-rm9mKntwXyHKJGO1wVuGZMZa4'
)

async function seed() {
  console.log('🌱 마스터 데이터 삽입 시작...\n')

  // ── 1. 지출 대분류 + 소분류 ─────────────────────────────────
  const expenseData = [
    { name: '주거비',   subs: ['관리비', '월세', '전기요금', '수도요금', '가스요금'] },
    { name: '식비',     subs: ['마트', '외식', '배달', '카페'] },
    { name: 'AI·구독', subs: ['AI 구독료', '앱 구독료', '스트리밍'] },
    { name: '통신료',   subs: ['인터넷', '핸드폰', 'VPN'] },
    { name: '교통',     subs: ['대중교통', '택시', '주유', '항공'] },
    { name: '의류',     subs: ['의류', '신발', '액세서리'] },
    { name: '의료·건강', subs: ['병원', '약국', '건강용품', '헬스'] },
    { name: '여가',     subs: ['취미', '스포츠', '여행', '문화·공연'] },
    { name: '교육',     subs: ['강의', '도서', '자격증'] },
    { name: '기타',     subs: ['기타'] },
  ]

  // ── 2. 수입 대분류 + 소분류 ─────────────────────────────────
  const incomeData = [
    { name: '급여',     subs: ['월급', '성과급', '상여금'] },
    { name: '프리랜서', subs: ['프로젝트', '컨설팅', '강의'] },
    { name: '투자',     subs: ['주식', '부동산', '코인', 'ETF'] },
    { name: '부업',     subs: ['판매', '서비스', '콘텐츠'] },
    { name: '배당',     subs: ['주식 배당', '부동산 배당'] },
    { name: '임대',     subs: ['임대료'] },
    { name: '기타',     subs: ['기타 수입'] },
  ]

  for (const { name, subs } of expenseData) {
    const { data: cat, error } = await supabase
      .from('categories').insert({ name, type: 'expense' }).select().single()
    if (error) { console.error('❌ 지출 대분류 오류:', name, error.message); continue }
    console.log(`  ✅ [지출] ${name}`)
    for (const sub of subs) {
      await supabase.from('subcategories').insert({ category_id: cat.id, name: sub })
    }
  }

  for (const { name, subs } of incomeData) {
    const { data: cat, error } = await supabase
      .from('categories').insert({ name, type: 'income' }).select().single()
    if (error) { console.error('❌ 수입 대분류 오류:', name, error.message); continue }
    console.log(`  ✅ [수입] ${name}`)
    for (const sub of subs) {
      await supabase.from('subcategories').insert({ category_id: cat.id, name: sub })
    }
  }

  // ── 3. 지출방식 ─────────────────────────────────────────────
  console.log('\n💳 지출방식 삽입...')
  const payments = [
    { name: '우리카드',  initial: 'W', color: '#86AEED' },
    { name: '삼성카드',  initial: 'S', color: '#FFD979' },
    { name: '현대카드',  initial: 'H', color: '#FF9F73' },
    { name: '지역화폐',  initial: 'R', color: '#99D276' },
    { name: '현금',      initial: 'C', color: '#AEAFAF' },
  ]
  for (const p of payments) {
    const { error } = await supabase.from('payment_methods').insert(p)
    if (error) console.error('❌', p.name, error.message)
    else console.log(`  ✅ ${p.name}`)
  }

  // ── 4. 지역 ─────────────────────────────────────────────────
  console.log('\n📍 지역 삽입...')
  const regions = ['서울', '도쿄', '방콕', '발리', '제주도']
  for (const name of regions) {
    const { error } = await supabase.from('regions').insert({ name })
    if (error) console.error('❌', name, error.message)
    else console.log(`  ✅ ${name}`)
  }

  // ── 5. 태그 ─────────────────────────────────────────────────
  console.log('\n🏷️  태그 삽입...')
  const tags = ['여행', '업무', '건강', '자기개발', '엔터테인먼트', '노마드']
  for (const name of tags) {
    const { error } = await supabase.from('tags').insert({ name })
    if (error) console.error('❌', name, error.message)
    else console.log(`  ✅ ${name}`)
  }

  console.log('\n✨ 마스터 데이터 삽입 완료!')
}

seed().catch(console.error)

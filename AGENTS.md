# Nomad Pocket — AGENTS.md

---

## 프로젝트 개요

- **앱 이름**: Nomad Pocket
- **서브타이틀**: Financial Precision
- **목적**: 노마드 라이프스타일 기반 개인 가계부 PWA
- **타겟 기기**: iPad (Primary) / iPhone (Secondary)
- **배포 목표**: PWA 우선 → 이후 App Store 출시 고려
- **디자인 소스**: Figma Make (MCP 연동)

---

## 기술 스택

- **디자인/초안**: Figma Make (Vite + React로 코드 생성)
- **실제 개발**: Next.js (Figma Make 코드 기반으로 변환)
- **Styling**: Tailwind CSS
- **컴포넌트**: shadcn/ui
- **Database**: Supabase (PostgreSQL)
- **배포**: Vercel
- **디자인 연동**: Figma MCP

> ⚠️ Figma Make가 생성한 코드는 Vite 기반이므로 Next.js로 변환 후 Vercel에 배포

---

## 디자인 시스템 요약

- **Font**: Pretendard 
- **Theme**: Light (기본) / Dark 전환 가능
- **Canvas**: iPad Pro 11-inch landscape 1366 × 1024px
- **Sidebar width**: 256px (고정)
- **Content area**: 1110px (1366 - 256)
- **Content padding**: 32px
- **Card gap**: 24px

### 주요 색상
```css
--primary-blue: #004ea7;       /* 메인 액션, FAB, 활성 상태 */
--primary-blue-light: #5898ff; /* 차트, 강조 */
--text-primary: #18202a;       /* 주요 텍스트 */
--text-secondary: #6c7b8e;     /* 보조 텍스트 */
--bg-main: #f4f4f7;            /* 메인 배경 */
--bg-dark: #18202a;            /* 사이드바, 테이블 헤더 */
--bg-dark-secondary: #33445a;  /* 활성 네비게이션 */
--bg-white: #ffffff;           /* 카드 */
--accent-red-dark: #d40000;    /* 지출 금액 */
--accent-green: #99d276;       /* 수입 긍정 */
--accent-red: #ff786b;         /* 고정지출 날짜 레이블 강조 */
--update-blue: #176bda;        /* LAST UPDATED 텍스트 */
```

### 주요 컴포넌트 스펙
```
카드:        bg-white, rounded-24px, shadow-xl, padding-24px
사이드바:    256px, bg-#18202a, rounded-24px
테이블 행:   height-48px, border-#d8e9fd, gap-12px
버튼 그룹:   bg-#e6e8f1, rounded-full, padding-4px
FAB:         58×58px, bg-#004ea7, bottom-24px, right-33px, fixed
```

### 테이블 컬럼 너비 (Transactions)
```
날짜:   36px
구분:   40px
대분류: 60px
소분류: 60px
내역:   160px
메모:   flex-1
금액:   100px (right-aligned)
```

### 컴포넌트 경로
```
# 타입 정의
src/types/database.ts                                     ← Supabase 테이블 타입 (Budget, Transaction, FixedItem 등)

# Supabase 클라이언트
src/lib/supabase.ts                                       ← createClient 싱글턴

# API 레이어
src/lib/api/dashboard.ts                                  ← Dashboard 데이터 집계 (fetchDashboardData, fetchMasterData)
src/lib/api/budgets.ts                                    ← Budget CRUD + 실적 계산 (getActualForBudget 등)
src/lib/api/transactions.ts                               ← getTransactions, createTransaction, deleteTransaction
src/lib/api/fixedItems.ts                                 ← getFixedItems, createFixedItem, deactivateFixedItem
src/lib/api/users.ts                                      ← getProfiles, createProfile, updateProfile, deleteProfile

# 세션 / 사용자 컨텍스트
src/lib/userContext.ts                                    ← UserSession, getAvatarColor, getCurrentUser, setCurrentUser

# 디자인 시스템
src/app/components/design-system/Button.tsx
src/app/components/design-system/Card.tsx
src/app/components/design-system/Table.tsx
src/app/components/design-system/Navigation.tsx

# 레이아웃 공통
src/app/components/layout/AppShell.tsx                    ← 'loading' | null | UserSession hydration 관리
src/app/components/layout/UserSelectScreen.tsx            ← 앱 진입 시 사용자 선택 화면
src/app/components/layout/Sidebar.tsx                     ← UserBadge (아바타 + 전환 버튼) 포함
src/app/components/layout/TransactionInputPopup.tsx       ← 거래 입력 팝업 (일반 + 고정항목 입력 모드)

# Dashboard (구현완료 — 실제 데이터 연동)
src/app/page.tsx                                          ← Dashboard 메인 (모드 상태 관리, 실제 쿼리)
src/app/components/dashboard/CashFlowChart.tsx            ← 모드별 바 차트 (barsOverride prop)
src/app/components/dashboard/ExpenseBreakdown.tsx         ← 반원 도넛 차트
src/app/components/dashboard/IncomeBreakdown.tsx          ← 100칸 박스 그리드

# Transactions (구현완료)
src/app/transactions/page.tsx                             ← Transactions 메인 (dim 행 클릭 → 고정항목 입력 팝업)

# Manage (구현완료)
src/app/manage/page.tsx                                   ← Manage 메인 (고정지출 월별 합계 + 연간 차트 포함)

# Budget (구현완료)
src/app/budget/page.tsx                                   ← Budget 메인
src/app/components/budget/MonthlyLineChart.tsx            ← 월별 지출/목표 라인 차트 (SVG, step line)
src/app/components/budget/GoalCard.tsx                    ← 목표 카드 (진행중/달성/초과 상태)
src/app/components/budget/BudgetPopup.tsx                 ← 목표 추가/수정 팝업
```

> 전체 디자인 시스템: DESIGN_SYSTEM.md 참조
> 사용 가이드: DESIGN_SYSTEM_USAGE.md 참조
> 빠른 참조: DESIGN_SYSTEM_QUICK_REF.md 참조

---

## 스크롤 동작 규칙

| 페이지 | 페이지 스크롤 | 예외 |
|--------|-------------|------|
| **Dashboard** | ❌ 없음 — 1024px 안에 모든 컨텐츠 꽉 차게 배치 | TOP SPENDING 카드 내부만 스크롤 |
| **Transactions** | ✅ 컨텐츠 영역 세로 스크롤 | 상단 탭/토글 sticky, 고정지출 섹션 상단 고정 |
| **Budget** | ✅ 컨텐츠 영역 세로 스크롤 | 없음 |
| **Manage** | ✅ 우측 컨텐츠 영역 세로 스크롤 | 좌측 메뉴 고정 |
| **Settings** | ✅ 컨텐츠 영역 세로 스크롤 | 없음 |

- Sidebar: 모든 페이지에서 고정
- Indicator Bar / 모드 토글: 모든 페이지 상단 sticky

---

## 공통 레이아웃

### 기본 앱 구조
```tsx
<div className="bg-[#f4f4f7] relative size-full">
  <Sidebar />  {/* 256px 고정 */}
  <div className="absolute inset-[0_0_0_256px]">
    <IndicatorBar />   {/* 32px, sticky */}
    <TitleBar />       {/* 모드 토글 포함, sticky */}
    <main />           {/* 컨텐츠 영역 */}
  </div>
</div>
```

### Indicator Bar (최상단, 전체 공통)
- 높이: 32px, sticky
- 우측: 활성 통화 환율 pills — `KRW|USD 1,342.40` / `JPY 9.12`
- 우측: `LAST UPDATED 14:02` (색상: #176bda)

### 모드 전환 토글 (우상단 공통)
- Dashboard 옵션: YEARLY / **MONTHLY(디폴트)** / WEEKLY / REGION / TAGGING
- Transactions 옵션: YEARLY / **MONTHLY(디폴트)** / WEEKLY / DAILY / CALENDAR
- 활성: bg-white, text-#004ea7 / 비활성: text-#6c7b8e
- 토글 버튼 너비: 100px (각 버튼), rounded-full 그룹
- 모드에 따라 전체 페이지 데이터 기준 변경


### Navigation Sidebar
- 상단: 앱 아이콘 + "NOMAD_POCKET" + "FINANCIAL PRECISION"
- 메뉴: Dashboard / Transactions / Budget / Manage
- 하단: Settings / 버전 정보 (v1.0.4)
- 활성 메뉴: bg-#33445a, text-white, rounded-100px

### Floating Action Button (FAB)
- 위치: 모든 페이지 우하단 fixed (bottom-24px, right-33px)
- 크기: 58×58px, bg-#004ea7, rounded-full
- 기능: 거래 입력 팝업 오픈 (Dashboard 포함 전 페이지)

---

## Page 1. Dashboard

> iPad: 스크롤 없이 1024px 안에 전체 배치

### Dashboard 모드별 동작 ✅ 구현완료

| 모드 | 뱃지 레이블 | 데이터 기준 | Cash Flow 영역 |
|------|------------|------------|----------------|
| YEARLY | YEARLY OVERVIEW | 선택 연도 전체 | 연도 텍스트 표시 |
| MONTHLY | MONTHLY OVERVIEW | 선택 월 | 월 텍스트 (26.Jun) |
| WEEKLY | WEEKLY OVERVIEW | 선택 주차 | 주차 번호 (26W) + ◀▶ 네비게이션 |
| REGION | REGION VIEW | 선택 지역 전체 | 지역 드롭다운 (native select) |
| TAGGING | TAG VIEW | 선택 태그 전체 | 태그 드롭다운 (native select) |

- WEEKLY 네비게이션: 12주 단위 페이지, ◀로 이전 묶음, ▶로 다음 묶음
- REGION/TAGGING 드롭다운: Cash Flow 레이블 하단에 native `<select>`, 레이아웃 변경 없이 fit

### 모드별 데이터 연동 ✅ 구현완료

모드가 바뀌면 아래 모든 컴포넌트가 동시에 업데이트:
- **Summary Bar**: Income / Expenses / Net 금액
- **CashFlowChart**: 바 차트 데이터 및 X축 레이블
- **Top 5 Payment**: 지출 수단 순위 및 금액
- **Expense Breakdown**: 카테고리 비중 파이 차트
- **Income Breakdown**: 카테고리 비중 박스 그리드
- **Top Spending**: 소분류 지출 순위

> Budget Goal Progress는 모드 무관 (고정 표시)

### Title Area (좌측)
- 현재 모드 뱃지 (예: "YEARLY OVERVIEW" / "MONTHLY OVERVIEW" / "REGION VIEW" / "TAG VIEW")
- 날짜 표시 — 모드에 따라:
  - YEARLY: `2026년`
  - MONTHLY/WEEKLY/REGION/TAGGING: `2026년 06월 24일`
- 뱃지: bg-#5898ff, text-white, rounded-12px, 12px Semibold, tracking-1.2px

### Summary Bar (타이틀 우측, 가로 배치)
- Cash Flow 레이블 + 모드별 값 (w-120px)
- Income (w-160px) / Expenses (w-160px) / **Net** (w-160px) 순으로 표시
- 금액 폰트: 30px Bold, letter-spacing -0.05em
- Net: 강조색 (#004ea7)
- 구분선: 1px, bg-#e6e8f1

### 메인 그래프 — 수입/지출 복합 바 차트 ✅ 구현완료
- 모드별 X축 표시:
  - MONTHLY: JAN~DEC (월별)
  - YEARLY: 2021~2030 (10년 단위)
  - WEEKLY: W01~W12 또는 W13~W24 등 (12주 단위 페이지)
  - REGION: 서울/도쿄/방콕/발리/제주도 (지역별)
  - TAGGING: 여행/업무/건강/자기개발/엔터테인먼트 (태그별)
- Y축 포맷: YEARLY는 억(億), 나머지는 M(백만)
- 바 너비: 32px, 바 갭: 25px, 차트 높이: 208px
- 활성 항목 색상: #004ea7 / 나머지: muted
- **인터랙션**:
  - 선택 항목 팝업 항상 표시 (기본 우측, 공간 없으면 좌측 자동 전환)
  - 팝업 내용: `Income ₩X,XXX,XXX` / `Expenses ₩X,XXX,XXX`
  - 다른 항목 롤오버 시 해당 항목 팝업으로 일시 전환
  - 롤오버 해제 시 선택 항목 복귀
  - 바 클릭 시 선택 항목 변경

### 그래프 우측 — TOP 5 PAYMENT
- 지출 수단 Top 5 세로 리스트
- 각 항목 구성:
  - 썸네일: 사각형(48×30px), rounded-4px, Manage에서 설정한 **컬러 배경 + 이니셜 텍스트(white, bold)**
  - 지불수단 이름
  - 금액
- 썸네일 컬러/이니셜은 Manage > 지출방식에서 설정한 값 자동 반영

### EXPENSE BREAKDOWN
- **반원(Semi-circle) 도넛 차트**
- 색상: 고정 팔레트, 지출 금액 큰 항목부터 순서 배정
- 범례: 카테고리명 + 비중(%) — 차트 우측에 세로 나열

### INCOME BREAKDOWN
- **100칸 박스 그래프** (10×10 그리드)
- 위에서부터 1%씩 박스 배정 (총 100칸)
- 카테고리별 색상 구분
- 범례: 카테고리명 + 비중(%) — 차트 우측에 세로 나열

### TOP SPENDING
- 기준: **소분류** 기준 지출 금액 많은 순
- 항목: 순위(강조색) / 소분류명(bold) / 금액
- 카드 내부 스크롤만 허용 (페이지 스크롤 없음)
- 하단: "DETAILS >" 링크

### BUDGET GOAL PROGRESS
- 슬라이드 인디케이터 (숫자 뱃지: ① ② ③)
- 목표 2개씩 가로 배치
- 각 목표 구성:
  - 목표명 (small caps)
  - Target 금액 (우측)
  - 달성률 % (크고 bold하게 강조)
  - 가로 프로그레스 바 (달성: accent, 초과: red)
  - Saved 금액 / To go 금액 (바 하단 양쪽)
- 슬라이드로 추가 목표 탐색

---

## Page 2. Transactions

> 컨텐츠 영역 세로 스크롤 / 상단 탭+토글 sticky

### 상단 구조
- 좌측: `지출` / `수입` 탭 (완전 분리 뷰)
- 우측: 모드 토글 (YEARLY/MONTHLY/WEEKLY/DAILY/CALENDAR) + 기간 네비게이션 `< 6월 >`

### CALENDAR 모드 (Transactions 전용)
- 월별 캘린더 그리드 표시
- 데일리 칸: **aspect-square (1:1 정사각형 비율)** ✅ 구현완료
- 주 행: `grid grid-cols-7 gap-[4px]` (flex-1 미사용)

### 테이블 구조
- 고정지출 섹션과 일반 거래 섹션이 **각각 독립된 테이블 헤더**를 가짐
- 테이블 헤더: bg-#18202a, text-#e6e8f1, 12px Bold, uppercase

### 테이블 컬럼
```
날짜(36px) | 구분(40px) | 대분류(60px) | 소분류(60px) | 내역(160px) | 메모(flex-1) | 금액(100px)
```

### 고정지출 섹션 (지출 탭) ✅ 구현완료
- 항목 있을 때만 섹션 표시 (없으면 섹션 자체 미표시)
- 리스트 최상단에 독립 테이블로 배치
- **날짜 셀**: 빨간색(#ff786b) 텍스트로 강조 — "고지지출" 성격 표시
- 미입력 상태: opacity 0.4 Dim 처리 + "클릭하여 입력" 힌트 텍스트 (항상 표시)
- 클릭 → "고정항목 입력" 팝업 오픈 (대분류·소분류·내역 잠금, 금액·날짜·지출방식·지역·태그 편집 가능)
- 날짜 기본값: 현재 뷰 기준 년/월 + fixed_item.day_of_month로 자동 계산
- 저장 시: `is_fixed: true`, `fixed_item_id` 링크 포함 실제 거래로 등록 → Dim 해제
- 미입력 상태로 다음 달 넘어가도 계속 고정지출로 표시
- 고정지출 관리/해제는 Manage에서만 가능

### 고정수입 섹션 (수입 탭) ✅ 구현완료
- 항목 있을 때만 섹션 표시 (없으면 섹션 자체 미표시)
- 동일한 Dim 처리 + 클릭 입력 방식 적용

### 일반 거래 리스트
- 고정지출 섹션 아래 독립 테이블로 배치
- 최신순 정렬, 날짜 그룹핑 없음
- 지출 금액: #d40000 / 수입 금액: 초록색
- **보조 금액 표시**: 외화 입력 시 메인 금액(원화) 아래 작은 글씨로 원래 통화 금액 표시
  - 예: `₩330,000` 아래 `$250.0` (muted, 소형)
- 각 행: 수정 / 삭제 버튼

### 거래 입력 팝업 ✅ 구현완료
- 트리거: FAB 버튼 또는 고정항목 행 클릭
- 스타일: 화면 중앙 모달 오버레이, white card, rounded-16px
- **일반 입력 모드** (FAB 트리거):
  - 구분: 지출 / 수입 (세그먼트), 날짜, 대분류, 소분류, 내역, 금액 + 통화, 환율 표시
  - 지출 전용: 지출방식 / 지역 / 태그 / 고정지출 체크박스
  - 수입 전용: 고정수입 체크박스
- **고정항목 입력 모드** (dim 행 클릭 트리거):
  - 타이틀: "고정항목 입력" + "대분류·소분류·내역은 고정 설정값입니다" 안내
  - **잠금 필드** (Lock 아이콘 + 회색 배경, 변경 불가): 구분 / 대분류 / 소분류 / 내역
  - **편집 가능 필드**: 날짜 / 금액 / 통화 / 지출방식 / 지역 / 태그 / 메모
  - 고정지출/수입 체크박스 숨김 (이미 고정항목)
  - 저장 시: `fixed_item_id` + `is_fixed: true` 자동 포함
- Props: `fixedItem?: FixedItem`, `defaultDate?: string` (뷰 기준 년/월 + day_of_month)
- 버튼: 저장하기 / 취소

---

## Page 3. Budget ✅ 구현완료

> 컨텐츠 영역 세로 스크롤

### 레이아웃 구조
- 상단: 라인 차트(3) + 현황 카드(1) → **3:1 비율 가로 배치, 동일 높이**
- 하단: 목표 카드 그리드 (커스텀 목표 + 시스템 목표)
- 우하단 FAB: "목표 추가" 버튼 (커스텀 목표만 추가 가능)

### 월간 지출 목표 달성 현황 (라인 차트)
- **SVG 라인 차트** — 실제 지출 라인(파랑) + 목표 라인(대시)
- X축: Jan~Dec (12개월), Y축: 자동 스케일
- **실제 지출 라인**: 현재 월까지만 그림 (미래 월 연장 없음)
- **목표 라인 (step line)**:
  - 단일 포인트 → Jan부터 Dec까지 전체 수평선
  - 여러 포인트 → 값이 바뀌는 달에서 계단형(수평→수직→수평)으로 꺾임
  - Forward+backward fill: 데이터 없는 달은 앞/뒤 가장 가까운 값으로 채움
- 호버 툴팁: 실제 지출 / 목표 금액 표시
- 데이터 포인트: 달성(파랑 원) / 초과(빨간 원)
- 현재 월 X축 레이블 강조 (bold, #004ea7)

### 목표 현황 카드 (SummaryCard)
- 전체 목표 갯수 / 달성 갯수 / 초과 갯수 / 달성률(%) 표시
- **달성 기준**: 해당 기간이 완전히 종료된 후 실제 지출이 목표 이하인 경우만 달성
  - 진행 중인 기간(현재 월 포함)은 달성으로 카운트하지 않음
- 달성률 = 달성 / (달성 + 초과) × 100 (기간 종료 목표 기준)

### 시스템 목표 (자동 생성)
- **월간 지출한도**: 매월 자동 생성 (`월간 지출한도 : N월` 형식)
  - 최초 생성 시 이전 달 금액 승계, 없으면 ₩3,000,000 기본값
- **년간 지출한도**: 매년 자동 생성 (`년간 지출한도 : YYYY년` 형식)
  - 최초 생성 시 전년도 금액 승계, 없으면 ₩36,000,000 기본값
- 사용자가 생성/삭제 불가 — **금액만 수정 가능**
- GoalCard에서 삭제 버튼 미표시 (`isSystemGoal()` 체크)
- BudgetPopup에서 금액만 편집 가능 (기간/필터 선택 비활성화)
- 시스템 목표 식별: `is_system` DB 컬럼 없이도 이름 패턴으로 식별
  ```typescript
  isSystemMonthlyGoal(b): b.period_type==='monthly' && b.filter_type==='total' && b.name.startsWith('월간 지출한도')
  isSystemYearlyGoal(b):  b.period_type==='yearly'  && b.filter_type==='total' && b.name.startsWith('년간 지출한도')
  ```
- Supabase insert 3-tier fallback (is_system+start_date → is_system only → minimal)

### 커스텀 목표 (GoalCard)
- 상태: **진행중**(파랑) / **달성**(초록 #99d276) / **초과**(빨강 #ff786b)
- 기간 뱃지 + 상태 뱃지 + 목표명 표시
- 달성률 % (대형 bold) + 현재 지출 금액
- 프로그레스 바 (상태 색상 연동)
- "N원 남음" / "N원 절약" / "N원 초과" 표시
- 수정(연필 아이콘) / 삭제(휴지통, 시스템 목표 제외)

### 목표 추가/수정 팝업 (BudgetPopup)
- 필드: 목표명 / 기간 유형(월간/년간/커스텀) / 대상 년도·월 / 금액 / 필터 기준
- 필터 기준: 전체 / 대분류 / 소분류 / 지역 / 태그
- 시스템 목표 수정 시: 금액 필드만 활성화, 나머지 비활성화 + 안내 메시지
- ESC 키로 닫기 지원

---

## Page 4. Manage

> 좌측 메뉴 고정 / 우측 컨텐츠 세로 스크롤
> 구조: 좌측 메뉴 리스트 + 우측 컨텐츠 (Master-Detail)

### 관리 항목
- 대분류 / 소분류 (계층 구조, 추가/수정/삭제)
- **지출방식 관리**:
  - 이름 / 컬러 / 이니셜 설정
  - 설정한 컬러+이니셜 → Dashboard TOP 5 PAYMENT 썸네일에 자동 반영
- 지역 관리 (추가/수정/삭제)
- **통화 관리**:
  - 주 통화: KRW (고정)
  - 부 통화: 활성화/비활성화 토글
  - 활성화된 통화만 거래 입력 시 선택 가능
  - 활성화된 통화만 Indicator Bar 환율에 표시
- 태그 관리 (추가/수정/삭제)
- **고정지출 관리** (등록/해제) ✅ 구현완료
  - 이번 달 예정 합계 + 항목 수 카드 표시
  - 연간 월별 바 차트: 과거 월 = 실제 기록 금액(파랑), 현재 월 = 실제 또는 예정(진한 파랑), 미래 월 = 현재 active 항목 합산 예정액(연한 파랑)
- **고정수입 관리** (등록/해제) — 동일 방식 적용

---

## Page 5. Settings

> 컨텐츠 영역 세로 스크롤

### 사용자 관리
- **다중 사용자 지원**: 앱 내 여러 사용자 프로필 생성/관리
- 사용자 추가 (이름 + 선택적 PIN 비밀번호)
- 사용자 수정 (이름 변경, 비밀번호 설정/변경)
- 사용자 삭제 (해당 사용자의 모든 데이터 함께 삭제)
- 사용자 전환 (로그아웃 → UserSelectScreen으로 이동)
- 현재 활성 사용자 강조 표시 ("현재" 뱃지)
- PIN: `btoa(pin)` 해시로 Supabase profiles 테이블에 저장

### 데이터
- Excel로 내보내기 (.xlsx)
- JSON으로 내보내기 (.json)
- 전체 데이터 변경하기 (기존 데이터 전체 삭제 후 JSON으로 교체)
- 데이터 추가하기 (기존 데이터에 JSON 병합)
- 전체 데이터 삭제 (DELETE 입력 확인 다이얼로그 — 현재 사용자 데이터만 삭제)

### 환경설정
- 월 시작일 설정 (1~28일, localStorage 저장)
- 주 시작일 설정 (일요일 / 월요일, localStorage 저장)
- 대시보드 기본 모드 설정 (YEARLY / MONTHLY / WEEKLY / REGION / TAGGING, 기본값 MONTHLY, localStorage 저장)
- 기본 통화 설정은 Manage에서 관리 (Settings에 없음)

### 앱 정보
- 앱 업데이트 내역 (버전별 CHANGELOG 모달)
- 버전 정보 (현재 v1.0.4)

---

## iPhone 레이아웃 (Secondary)

> iPad 레이아웃과 동일한 데이터/기능, 레이아웃만 변경

### 네비게이션
- 좌측 Sidebar → 좌측에서 슬라이딩 Drawer로 전환
- 햄버거 메뉴 아이콘으로 열기/닫기

### Dashboard (iPhone)
- 전체 세로 스크롤
- 모든 카드 풀 너비 (1열) 배치
- 배치 순서 (위→아래):
  1. Title + Summary Bar
  2. 바 차트 (풀 너비)
  3. TOP 5 PAYMENT (풀 너비)
  4. EXPENSE BREAKDOWN (풀 너비)
  5. INCOME BREAKDOWN (풀 너비)
  6. BUDGET GOAL PROGRESS (풀 너비, 세로 스택)
  7. TOP SPENDING (풀 너비, 카드 내부 스크롤)

### Transactions (iPhone)
- 상단 탭/토글 sticky
- 테이블 가로 스크롤 또는 컬럼 축소 대응

---

## 다중 사용자 아키텍처 ✅ 구현완료

### DB 스키마
```sql
-- 사용자 프로필 (별도 테이블)
profiles: id(uuid PK), name(text), pin_hash(text nullable), color(text nullable), created_at

-- 모든 데이터는 공유 (user_id = 작성자 추적용, 격리 아님)
transactions  ← user_id 컬럼: 작성자(author) 기록용
categories, subcategories, payment_methods, regions, tags, fixed_items, budgets
-- currencies는 시스템 공유 데이터 (user_id 없음)
```

### 핵심 파일
```
src/lib/userContext.ts           ← 세션 관리 (localStorage 'nomad_pocket_user_session')
                                   UserSession { id, name, color? }
                                   getAvatarColor(id, customColor?) — 커스텀색 우선, 없으면 해시 팔레트
src/lib/api/users.ts             ← profiles CRUD + migrateExistingData()
src/app/components/layout/
  UserSelectScreen.tsx           ← 앱 진입 시 사용자 선택 화면 (색상 선택 포함)
  AppShell.tsx                   ← 'loading' | null | UserSession 상태로 hydration 관리
  Sidebar.tsx                    ← UserBadge 컴포넌트 (아바타 + 전환 버튼)
  TransactionInputPopup.tsx      ← 거래 입력 / 고정항목 입력 통합 팝업
```

### 패턴
- **공유 데이터 모델**: 모든 사용자가 동일 데이터 열람/수정. `requireUserId()`는 `createTransaction`에서만 호출 (작성자 기록)
- **아바타 색상**: `getAvatarColor(userId, customColor?)` — 커스텀 색상 우선, 없으면 id 해시 % 8색 팔레트
- **사용자 색상 설정**: 16색 팔레트(USER_COLORS)에서 선택 → profiles.color 컬럼에 저장
- **Transactions 작성자 뱃지**: `user_id`로 profile 조회 → 1px 라운드 스퀘어, 사용자 색상 border/text
- **데이터 마이그레이션**: 최초 사용자 생성 시 `user_id = NULL` 행을 해당 user_id로 업데이트
- **PIN 해시**: `btoa(pin)` — 단순 base64 (로컬 앱용)
- **Hydration 방지**: AppShell이 `'loading'` 상태 동안 빈 div 렌더 → SSR 불일치 없음

---

## 핵심 개념 정의

| 용어 | 정의 |
|------|------|
| **지역** | 노마드 체류 지역. 지역별 지출 패턴 분석 |
| **태그** | 프로젝트/활동 단위 자유 라벨. 집합으로 묶어 조회 |
| **고정지출** | 매달 반복 지출. 미입력 시 Dim(opacity 0.4). 클릭 후 저장해야 실제 등록 |
| **고정수입** | 매달 반복 수입. 동일 방식 적용 |
| **주 통화** | KRW (한국 원화) |
| **부 통화** | Manage에서 활성화한 외화 (USD, JPY 등) |
| **TOP SPENDING** | 소분류 기준 지출 금액 순위 |
| **TOP 5 PAYMENT** | 지출 수단(지불방식) 기준 Top 5. 썸네일은 Manage 설정값 반영 |
| **지불수단 썸네일** | Manage > 지출방식에서 설정한 컬러+이니셜 자동 생성 |
| **보조 금액** | 외화 입력 시 원화 금액 아래 원래 통화 금액을 소형으로 표시 |

---

## 환율 API

- 하루 1회 자동 갱신, 활성 통화만 조회
- 입력 당일 환율로 원화 변환 후 저장
- 원래 통화 정보도 함께 저장 (보조 금액 표시용)
- 추천: 한국수출입은행 API 또는 ExchangeRate-API (무료 1,500회/월)

---

## 개발 단계 (MVP)

| 단계 | 포함 기능 | 상태 |
|------|----------|------|
| **1단계** | Sidebar + Dashboard + Transactions + Manage | ✅ 완료 |
| **2단계** | Budget 추가 | ✅ 완료 |
| **3단계** | 다중 통화 + 환율 API + 지역/태그 분석 + iPhone 레이아웃 | ✅ 완료 |

### 1단계 세부 진행 현황

| 기능 | 상태 | 비고 |
|------|------|------|
| Sidebar 네비게이션 | ✅ 완료 | |
| Dashboard 레이아웃 (카드 배치) | ✅ 완료 | |
| Dashboard 모드 토글 | ✅ 완료 | YEARLY/MONTHLY/WEEKLY/REGION/TAGGING |
| Dashboard CashFlow 차트 | ✅ 완료 | 모드별 데이터, 인터랙션 |
| Dashboard Summary Bar | ✅ 완료 | 모드별 Income/Expenses/Net |
| Dashboard Top 5 Payment | ✅ 완료 | 모드별 데이터 연동 |
| Dashboard Expense Breakdown | ✅ 완료 | 반원 도넛, 모드별 데이터 |
| Dashboard Income Breakdown | ✅ 완료 | 100칸 박스, 모드별 데이터 |
| Dashboard Top Spending | ✅ 완료 | 모드별 데이터 연동 |
| Dashboard Budget Goal Progress | ✅ 완료 | 슬라이드 인디케이터 |
| Transactions 테이블 (지출/수입) | ✅ 완료 | 고정지출 섹션 포함 |
| Transactions Calendar 모드 | ✅ 완료 | aspect-square 데일리 칸 |
| 거래 입력 팝업 | ✅ 완료 | FAB + 고정항목 클릭 트리거 |
| 고정지출 입력 팝업 | ✅ 완료 | dim 행 클릭 → 필드 잠금 + 자동 날짜 계산 + fixed_item_id 연결 |
| Manage 페이지 CRUD | ✅ 완료 | 대분류/소분류/지출방식/지역/태그/통화/고정항목 |
| Manage 고정지출 현황 | ✅ 완료 | 월별 합계 카드 + 연간 바 차트 (실제/예정 구분) |
| 다중 사용자 지원 | ✅ 완료 | 공유 데이터 모델, 작성자 뱃지, 16색 팔레트, PIN 보호 |
| Supabase 연동 (실제 데이터) | ✅ 완료 | 전 페이지 실제 데이터 |
| Budget 기능 구현 | ✅ 완료 | 시스템 목표 자동생성, 라인 차트, 달성 통계 |
| Settings 기능 구현 | ✅ 완료 | |

---

## 기능 구현 로드맵 (실제 데이터 연동 순서)

> 모든 기능이 데이터 의존성을 가지므로 아래 순서를 반드시 준수

### Step 1 — Supabase 기반 구축 ✅ 완료
> 모든 기능의 전제조건

- `@supabase/supabase-js` 설치 + `.env.local` 설정
- DB 테이블 설계 및 생성:
  - `categories` (대분류), `subcategories` (소분류, FK→categories)
  - `payment_methods` (지출방식: name, color, initial)
  - `regions`, `tags`
  - `currencies` (code, name, is_active)
  - `transactions` (type, date, category_id, subcategory_id, description, memo, amount, currency, original_amount, payment_method_id, region_id, tag_ids, is_fixed)
  - `fixed_items` (type, category_id, subcategory_id, description, amount, payment_method_id)
  - `budgets` (name, target_amount, period_type, start_date, end_date, filter_type, filter_id)
- Supabase 클라이언트 싱글턴 (`src/lib/supabase.ts`)
- Next.js API Routes 또는 Server Actions 구조 결정

### Step 2 — Manage 페이지 CRUD ✅ 완료
> 거래 입력 팝업의 드롭다운 재료 제공

- 대분류 / 소분류 추가·수정·삭제 (계층 구조)
- 지출방식 관리 (이름 + 컬러 + 이니셜)
- 지역 관리 (추가·수정·삭제)
- 태그 관리 (추가·수정·삭제)
- 통화 활성화/비활성화 토글
- 고정지출 / 고정수입 등록·해제

### Step 3 — 거래 입력 팝업 실제 저장 ✅ 완료
> 여기서부터 실제 데이터가 DB에 쌓임

- FAB → 팝업 → Supabase `transactions` INSERT
- 드롭다운: Manage에서 저장된 마스터 데이터 조회
- 외화 입력 시 환율 API 호출 → 원화 변환 저장
- 고정항목 클릭 → 자동 입력 팝업 → 저장 시 실제 등록
- 거래 수정 / 삭제 (UPDATE / DELETE)

### Step 4 — Transactions 모드별 실제 쿼리 ✅ 완료
> Step 3에서 데이터가 쌓인 후 의미 있음

- YEARLY / MONTHLY / WEEKLY / DAILY: 기간 필터 쿼리
- CALENDAR: 날짜별 거래 집계 표시
- 고정지출 Dim 처리 로직 실제 연동 (미입력 항목 판별)
- 기간 네비게이션 `< 6월 >` 실제 동작

### Step 5 — Dashboard 실제 데이터 연동 ✅ 완료
> Step 3~4 데이터 기반 집계

- 모드별 집계 쿼리 (SUM, GROUP BY)
- CashFlowChart / Summary Bar / Top 5 Payment / Expense Breakdown / Income Breakdown / Top Spending 모두 실제값 교체
- Budget Goal Progress → budgets 테이블 기반

### Step 6 — Budget 기능 구현 ✅ 완료
> Step 3 실거래 데이터 기반 달성률 계산

- 목표 추가·수정·삭제 (budgets 테이블)
- 실거래 데이터 집계 → 달성률 계산
- 과거 달성 통계 집계
- 대분류 / 소분류 / 지역 / 태그 기반 필터 목표 지원

### Step 7 — Settings 기능 구현 ✅ 완료
> 운영 도구 (마지막 구현)

- 사용자 이름 설정 (localStorage 저장)
- 비밀번호 PIN 설정/변경 모달 (localStorage 해시 저장, 생체인증 제거)
- Excel / JSON 데이터 백업 (DB export) — xlsx 라이브러리, 다중 시트
- 전체 데이터 변경하기 (deleteAll + JSON import)
- 데이터 추가하기 (JSON upsert/merge)
- 데이터 전체 삭제 (DELETE 입력 확인 다이얼로그)
- 월 시작일 / 주 시작일(일요일·월요일) / 대시보드 기본 모드 localStorage 저장
- 업데이트 내역 모달 (버전별 CHANGELOG)
- 설정 API: `src/lib/api/settings.ts`

### 의존성 체인 요약
```
Step 1: Supabase 스키마
    └── Step 2: Manage CRUD (마스터 데이터)
            └── Step 3: 거래 입력 팝업 (데이터 생성)
                    ├── Step 4: Transactions 모드 연동 (데이터 조회)
                    │       └── Step 5: Dashboard 실제 연동 (집계)
                    └── Step 6: Budget (목표 추적)
                            └── Step 7: Settings (운영 도구)
```

---

## Figma 레이어 네이밍 규칙

- 네비게이션: `Sidebar` (iPad) / `Drawer` (iPhone)
- 페이지: `Dashboard` / `Transactions` / `Budget` / `Manage` / `Settings`
- 공통 상단: `IndicatorBar` / `TitleBar`
- 컴포넌트: 영문으로 통일
- 모드 variant: `Yearly` / `Monthly` / `Weekly` / `Daily` / `Calendar`
- 디바이스 variant: `iPad` / `iPhone`

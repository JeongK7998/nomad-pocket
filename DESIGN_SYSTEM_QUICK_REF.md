# NOMAD POCKET 디자인 시스템 - 빠른 참조

Claude Code에 복사해서 바로 사용할 수 있는 디자인 시스템 요약입니다.

> **개발/배포 환경**
> - 디자인 초안: Figma Make (Vite + React)
> - 실제 개발: Next.js (Figma Make 코드 변환)
> - 배포: Vercel
> - 컴포넌트: shadcn/ui

---

## 📋 복사해서 Claude Code에 붙여넣기

```
NOMAD POCKET 디자인 시스템을 따라주세요:

**색상:**
- Primary: #004ea7, #5898ff
- Text: #18202a (dark), #6c7b8e (medium)
- Background: #f4f4f7 (main), #18202a (dark), white (cards)
- Accent: #d40000 (지출/부정), #99d276 (수입/긍정)

**타이포그래피:**
- Font: 'Pretendard' (Regular, Medium, SemiBold, Bold, ExtraBold)
- 크기: 10px (small), 12px (base), 14px, 18px, 20px (title), 32px+ (display)

**간격:**
- 패딩: 4px, 8px, 12px, 16px, 24px, 32px
- 갭: 4px, 12px, 24px

**둥근 모서리:**
- 4px (아이콘), 12px (작은 카드), 24px (메인 카드), 9999px (버튼)

**컴포넌트:**
- 사이드바: 256px 너비, bg-[#18202a], rounded-[24px]
- 카드: bg-white, rounded-[24px], shadow-xl, padding-[24px]
- 테이블 헤더: bg-[#18202a], text-[#e6e8f1], 12px Bold, uppercase
- 테이블 행: height-[48px], gap-[12px], border-[#d8e9fd]
- 버튼 그룹: bg-[#e6e8f1], rounded-[9999px], padding-[4px]
- 활성 버튼: bg-white, text-[#004ea7], rounded-full
- FAB: 58×58px, bg-[#004ea7], bottom-24px, right-33px

**레이아웃:**
- 사이드바 256px + 메인 컨텐츠
- 메인 패딩: 32px
- 카드 간격: 24px

**스크롤:**
- Dashboard: 스크롤 없음 (TOP SPENDING 카드 내부만)
- 나머지 페이지: 컨텐츠 영역 세로 스크롤
- Indicator Bar / 모드 토글: sticky

**재사용 컴포넌트 위치:**
- src/app/components/design-system/Button.tsx
- src/app/components/design-system/Card.tsx
- src/app/components/design-system/Table.tsx
- src/app/components/design-system/Navigation.tsx
```

---

## 🎨 주요 색상 코드

```css
#004ea7  /* Primary Blue - 버튼, 강조, FAB */
#5898ff  /* Light Blue - 차트, 아이콘 */
#18202a  /* Dark - 사이드바, 테이블 헤더, 텍스트 */
#6c7b8e  /* Medium Gray - 보조 텍스트 */
#f4f4f7  /* Light Gray - 메인 배경 */
#e6e8f1  /* Pale Gray - 버튼 그룹 */
#d8e9fd  /* Pale Blue - 테이블 경계 */
#d40000  /* Red - 지출 금액 */
#176bda  /* Blue - 환율 업데이트 시간 */
```

---

## 📐 레이아웃 템플릿

```tsx
// 기본 앱 레이아웃 (Next.js)
<div className="bg-[#f4f4f7] relative size-full">
  {/* 사이드바 - 256px */}
  <Sidebar />

  {/* 메인 컨텐츠 */}
  <div className="absolute flex flex-col inset-[0_0_0_256px]">
    {/* Indicator Bar - sticky */}
    <header className="sticky top-0 z-10 h-[32px] flex items-center justify-end px-[32px]">
      <CurrencyIndicator />
    </header>

    {/* Title Bar - sticky */}
    <div className="sticky top-[32px] z-10 px-[32px] py-[16px]">
      <ModeToggle />
    </div>

    {/* 컨텐츠 */}
    <main className="flex flex-col gap-[24px] p-[32px]">
      <Card>...</Card>
    </main>
  </div>
</div>
```

---

## 🔤 타이포그래피 템플릿

```tsx
/* 페이지 제목 */
<h1 className="font-['Pretendard:Bold',sans-serif] text-[20px] text-[#18202a] uppercase">
  TITLE
</h1>

/* 날짜 (대시보드) */
<h1 className="font-['Pretendard:Bold',sans-serif] text-[48px] text-[#363d4b]">
  2026년 06월 24일
</h1>

/* 금액 표시 */
<span className="font-['Pretendard:Bold',sans-serif] text-[32px] text-[#004ea7]">
  ₩1,031,800
</span>

/* 지출 금액 */
<span className="font-['Pretendard:Bold',sans-serif] text-[14px] text-[#d40000]">
  ₩430,000
</span>

/* 보조 텍스트 */
<p className="font-['Pretendard:Regular',sans-serif] text-[12px] text-[#6c7b8e]">
  Content
</p>
```

---

## 📦 컴포넌트 임포트

```tsx
import {
  TabButton, ButtonGroup,
  Card, CardHeader, CardContent,
  Table, TableHeader, TableBody, TableRow, TableCell,
  NavLink, Sidebar, Logo
} from './components/design-system';
```

---

## ⚡ 자주 사용하는 패턴

```tsx
/* 모드 토글 버튼 그룹 */
<ButtonGroup>
  <TabButton variant="inactive">YEARLY</TabButton>
  <TabButton variant="active">MONTHLY</TabButton>
  <TabButton variant="inactive">WEEKLY</TabButton>
  <TabButton variant="inactive">DAILY</TabButton>
  <TabButton variant="inactive">CALENDAR</TabButton>
</ButtonGroup>

/* 카드 */
<Card className="p-[24px]">
  <CardHeader>
    <h2>Title</h2>
  </CardHeader>
  <CardContent>Content</CardContent>
</Card>

/* 테이블 */
<Table>
  <TableHeader>
    <TableCell width="36px">일자</TableCell>
    <TableCell width="40px">구분</TableCell>
    <TableCell width="60px">대분류</TableCell>
    <TableCell width="60px">소분류</TableCell>
    <TableCell width="160px">내역</TableCell>
    <TableCell>메모</TableCell>
    <TableCell width="100px" align="right">금액</TableCell>
  </TableHeader>
  <TableBody>
    <TableRow>...</TableRow>
    {/* 고정지출 미입력 행 */}
    <TableRow variant="disabled">...</TableRow>
  </TableBody>
</Table>

/* FAB */
<button className="fixed bottom-[24px] right-[33px] size-[58px] bg-[#004ea7] rounded-full shadow-lg flex items-center justify-center z-50">
  <span className="text-white text-[32px]">+</span>
</button>
```

---

## 📊 테이블 구조

```
일자:   36px
구분:   40px
대분류: 60px
소분류: 60px
내역:   160px
메모:   flex-1
금액:   100px (right-aligned)

행 높이: 48px
헤더: bg-[#18202a], text-[#e6e8f1]
경계: 1px solid #d8e9fd
고정항목 미입력: opacity-40
```

---

## 🎨 카테고리 색상

```tsx
const categoryColors = {
  // 지출 카테고리
  '주거비': '#62b0fe',
  '식비': '#b37cda',
  '마트': '#ff9183',
  '차량': '#fe9e59',
  '세금': '#75cd10',

  // 수입 카테고리
  'income-1': '#b2d5ff',
  'income-2': '#ffd7aa',
  'income-3': '#cade9f',
};
```

---

## 🎯 Claude Code 프롬프트 템플릿

### 새 페이지 만들기
```
NOMAD POCKET 디자인 시스템으로 [페이지명] 페이지를 만들어줘.
Next.js 기반으로 작성하고 Vercel에 배포 가능한 구조로.

레이아웃:
- 좌측 256px 사이드바 (bg-[#18202a])
- 메인 컨텐츠 32px 패딩
- 카드 간격 24px
- Indicator Bar (32px, sticky) + 모드 토글 (sticky)

컴포넌트:
- Card, Table 등 design-system 컴포넌트 사용
- 색상: #004ea7 (primary), #18202a (text)
- 폰트: Pretendard Bold 20px (제목)
- FAB: 우하단 고정, 58×58px, bg-[#004ea7]

스크롤:
- Dashboard면: 스크롤 없음, TOP SPENDING 카드 내부만
- 그 외: 컨텐츠 영역 세로 스크롤

기능:
- [구체적인 기능 설명]
```

### 컴포넌트 수정하기
```
NOMAD POCKET 디자인 시스템을 따라서 [컴포넌트명]을 수정해줘.
Next.js 컴포넌트로 유지.

변경사항:
- [구체적인 변경 내용]

디자인 일관성 유지:
- 간격(24px 갭), 색상(#004ea7), 폰트(Pretendard) 유지
- 재사용 컴포넌트 사용
```

---

**파일 위치:**
- 전체 문서: `DESIGN_SYSTEM.md`
- 사용 가이드: `DESIGN_SYSTEM_USAGE.md`
- CSS 토큰: `src/styles/design-tokens.css`
- 컴포넌트: `src/app/components/design-system/`

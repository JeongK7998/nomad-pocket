# 디자인 시스템 사용 가이드

NOMAD POCKET 디자인 시스템을 Claude Code에서 사용하는 방법입니다.

## 1. CSS 토큰 임포트

먼저 `src/styles/design-tokens.css`를 메인 CSS 파일에 임포트하세요:

```css
/* src/app/globals.css 또는 src/styles/theme.css */
@import './design-tokens.css';
```

## 2. 재사용 가능한 컴포넌트 사용

### Button Group (탭 버튼)

```tsx
import { ButtonGroup, TabButton } from './components/design-system';

function FilterControls() {
  const [activeTab, setActiveTab] = useState('MONTHLY');

  return (
    <ButtonGroup>
      <TabButton
        variant={activeTab === 'YEARLY' ? 'active' : 'inactive'}
        onClick={() => setActiveTab('YEARLY')}
      >
        YEARLY
      </TabButton>
      <TabButton
        variant={activeTab === 'MONTHLY' ? 'active' : 'inactive'}
        onClick={() => setActiveTab('MONTHLY')}
      >
        MONTHLY
      </TabButton>
      <TabButton
        variant={activeTab === 'WEEKLY' ? 'active' : 'inactive'}
        onClick={() => setActiveTab('WEEKLY')}
      >
        WEEKLY
      </TabButton>
    </ButtonGroup>
  );
}
```

### Card 컴포넌트

```tsx
import { Card, CardHeader, CardContent } from './components/design-system';

function ExpenseBreakdown() {
  return (
    <Card>
      <CardHeader>
        <h2 className="font-['Pretendard:Bold',sans-serif] text-[20px] text-[#18202a] uppercase">
          Expense Breakdown
        </h2>
      </CardHeader>
      <CardContent>
        {/* 카드 내용 */}
      </CardContent>
    </Card>
  );
}
```

### Table 컴포넌트

```tsx
import { Table, TableHeader, TableBody, TableRow, TableCell } from './components/design-system';

function TransactionTable() {
  return (
    <Table>
      <TableHeader>
        <TableCell width="36px" align="center">일자</TableCell>
        <TableCell width="40px" align="center">구분</TableCell>
        <TableCell width="60px" align="center">대분류</TableCell>
        <TableCell width="60px" align="center">소분류</TableCell>
        <TableCell width="160px">내역</TableCell>
        <TableCell>메모</TableCell>
        <TableCell width="100px" align="right">금액</TableCell>
      </TableHeader>
      
      <TableBody>
        <TableRow>
          <TableCell width="36px" align="center">12</TableCell>
          <TableCell width="40px" align="center">지출</TableCell>
          <TableCell width="60px" align="center">주거비</TableCell>
          <TableCell width="60px" align="center">관리비</TableCell>
          <TableCell width="160px">6월 관리비</TableCell>
          <TableCell>이월 내용</TableCell>
          <TableCell width="100px" align="right">₩430,000</TableCell>
        </TableRow>
        
        <TableRow variant="disabled">
          <TableCell width="36px" align="center">17</TableCell>
          <TableCell width="40px" align="center">지출</TableCell>
          <TableCell width="60px" align="center">통신료</TableCell>
          <TableCell width="60px" align="center">인터넷</TableCell>
          <TableCell width="160px">KT 인터넷 요금</TableCell>
          <TableCell>메모</TableCell>
          <TableCell width="100px" align="right">₩30,000</TableCell>
        </TableRow>
      </TableBody>
    </Table>
  );
}
```

### Navigation (사이드바)

```tsx
import { Sidebar, Logo, NavLink } from './components/design-system';

function AppSidebar() {
  const [activePage, setActivePage] = useState('dashboard');

  return (
    <Sidebar
      logo={<Logo title="NOMAD_POCKET" subtitle="Financial Precision" />}
      footer={
        <div className="relative shrink-0 w-full px-[24px]">
          <div className="border-t border-[#6c7b8e] pt-[12px]">
            <p className="text-[#6c7b8e] text-[16px]">Settings</p>
            <p className="text-[#6c7b8e] text-[10px] mt-[4px]">v1.0.4</p>
          </div>
        </div>
      }
    >
      <NavLink
        active={activePage === 'dashboard'}
        onClick={() => setActivePage('dashboard')}
        icon={<DashboardIcon />}
      >
        Dashboard
      </NavLink>
      
      <NavLink
        active={activePage === 'transactions'}
        onClick={() => setActivePage('transactions')}
        icon={<TransactionIcon />}
      >
        Transactions
      </NavLink>
      
      <NavLink
        active={activePage === 'budget'}
        onClick={() => setActivePage('budget')}
        icon={<BudgetIcon />}
      >
        Budget
      </NavLink>
    </Sidebar>
  );
}
```

## 3. CSS 변수 직접 사용

Tailwind나 인라인 스타일에서 CSS 변수를 사용할 수 있습니다:

```tsx
// Tailwind 클래스로
<div className="bg-[var(--bg-dark)] text-[var(--text-primary)]">
  Content
</div>

// 인라인 스타일로
<div style={{ backgroundColor: 'var(--primary-blue)' }}>
  Content
</div>
```

## 4. 색상 팔레트 사용 예제

```tsx
// 카테고리별 색상
const categoryColors = {
  '주거비': 'var(--category-housing)',
  '식비': 'var(--category-food)',
  '마트': 'var(--category-mart)',
  '차량': 'var(--category-vehicle)',
  '세금': 'var(--category-tax)'
};

function CategoryBadge({ category }: { category: string }) {
  return (
    <div
      className="rounded-[4px] size-[10px]"
      style={{ backgroundColor: categoryColors[category] }}
    />
  );
}
```

## 5. 타이포그래피 사용

```tsx
// 제목
<h1 className="font-['Pretendard:Bold',sans-serif] text-[48px] text-[#363d4b] leading-[48px]">
  2026년 06월 24일
</h1>

// 부제목
<h2 className="font-['Pretendard:Bold',sans-serif] text-[20px] text-[#18202a] uppercase leading-[20px]">
  Expense Breakdown
</h2>

// 본문
<p className="font-['Pretendard:Regular',sans-serif] text-[12px] text-[#6c7b8e] leading-[normal]">
  일반 텍스트
</p>

// 금액 표시
<p className="font-['Pretendard:Bold',sans-serif] text-[32px] text-[#004ea7]">
  <span className="text-[16px]">₩ </span>
  <span>1,031,800</span>
</p>
```

## 6. 그림자와 둥근 모서리

```tsx
// 카드 그림자
<div className="shadow-[0px_8px_24px_0px_rgba(25,28,30,0.04)]">
  Card content
</div>

// 둥근 모서리
<div className="rounded-[24px]">  {/* 메인 카드 */}
<div className="rounded-[12px]">  {/* 중간 카드 */}
<div className="rounded-[9999px]"> {/* 버튼, 원형 */}
```

## 7. 레이아웃 패턴

### 사이드바가 있는 레이아웃

```tsx
function AppLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="bg-[#f4f4f7] relative rounded-[32px] size-full">
      <Sidebar>
        {/* 네비게이션 */}
      </Sidebar>
      
      <div className="absolute flex flex-col inset-[0_0_0_256px]">
        {/* 메인 컨텐츠 */}
        {children}
      </div>
    </div>
  );
}
```

### 그리드 레이아웃

```tsx
function Dashboard() {
  return (
    <div className="flex flex-col gap-[24px] p-[32px]">
      {/* 첫 번째 행 */}
      <Card className="h-[335px]">
        {/* Yearly Comparison */}
      </Card>
      
      {/* 두 번째 행 - 두 개의 카드 */}
      <div className="grid grid-cols-2 gap-[24px] h-[276px]">
        <Card>
          {/* Expense Breakdown */}
        </Card>
        <Card>
          {/* Income Breakdown */}
        </Card>
      </div>
    </div>
  );
}
```

## 8. 특수 컴포넌트

### 플로팅 액션 버튼 (FAB)

```tsx
function AddButton() {
  return (
    <button className="absolute bottom-[24px] right-[33px] size-[58px] bg-[#004ea7] rounded-full shadow-[4px_4px_8px_0px_rgba(25,28,30,0.16)] flex items-center justify-center">
      <span className="text-white text-[32px]">+</span>
    </button>
  );
}
```

### 날짜 컨트롤

```tsx
function DateControl() {
  return (
    <div className="flex gap-[54px] items-center">
      <button className="size-[40px] rounded-full bg-[#e6e8f1]">
        ←
      </button>
      
      <div className="font-['Pretendard:Bold',sans-serif] text-[40px] text-black">
        6월
      </div>
      
      <button className="size-[40px] rounded-full bg-[#e6e8f1]">
        →
      </button>
    </div>
  );
}
```

### 상단 오버레이 (환율 정보)

```tsx
function CurrencyOverlay() {
  return (
    <div className="h-[32px] flex items-center justify-end px-[32px]">
      <div className="flex gap-[24px] text-[10px]">
        <span className="text-[#6c7b8e]">KRW|USD 1,342.40</span>
        <span className="text-[#6c7b8e]">JPY 9.12</span>
        <span className="text-[#176bda]">LAST UPDATED 14:02</span>
      </div>
    </div>
  );
}
```

## 9. Claude Code에 프롬프트 전달 예시

Claude Code에 새로운 화면을 요청할 때 이렇게 말하세요:

```
"NOMAD_POCKET 디자인 시스템을 사용해서 예산 관리 페이지를 만들어줘.

디자인 시스템 컴포넌트:
- Card, CardHeader, CardContent를 사용
- 색상은 --primary-blue (#004ea7), --text-primary (#18202a) 사용
- 타이포그래피는 Pretendard Bold 20px로 제목
- 그림자는 --shadow-xl 사용
- 둥근 모서리는 24px

레이아웃:
- 좌측에 256px 사이드바
- 메인 컨텐츠는 32px 패딩
- 카드 간 간격은 24px

포함할 내용:
- 월별 예산 목표 진행률
- 카테고리별 지출 현황
- 예산 초과 경고 섹션"
```

## 10. 일관성 체크리스트

새로운 컴포넌트를 만들 때 확인하세요:

- [ ] 색상은 CSS 변수를 사용했나요?
- [ ] 폰트는 Pretendard를 사용했나요?
- [ ] 간격은 4px 단위로 맞췄나요?
- [ ] 둥근 모서리는 정해진 값(4px, 12px, 24px)을 사용했나요?
- [ ] 그림자는 디자인 시스템의 그림자를 사용했나요?
- [ ] 버튼 높이는 48px 또는 정의된 크기를 사용했나요?
- [ ] 테이블 행 높이는 48px인가요?
- [ ] 카드 패딩은 24px인가요?

---

이 가이드를 따르면 NOMAD POCKET 앱 전체에서 일관된 디자인을 유지할 수 있습니다!

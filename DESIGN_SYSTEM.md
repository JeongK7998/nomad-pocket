# NOMAD POCKET 디자인 시스템

이 문서는 Figma에서 가져온 Dashboard와 Transactions 화면을 기반으로 추출한 디자인 시스템입니다.

> **개발 환경 참고**
> - 디자인/초안: Figma Make (Vite + React로 코드 생성)
> - 실제 개발: Next.js (Figma Make 코드 기반 변환)
> - 배포: Vercel
> - Figma Make가 생성한 코드는 Vite 기반이므로 Next.js로 변환 후 Vercel에 배포

---

## 색상 팔레트 (Color Palette)

### 기본 색상 (Primary Colors)
```css
--primary-blue: #004ea7;        /* 메인 액션, 활성 상태 */
--primary-blue-light: #5898ff;  /* 차트, 강조 */
--primary-blue-lighter: #176bda; /* 링크, 업데이트 정보 */
--primary-blue-pale: #d8e9fd;   /* 차트 배경 */
```

### 텍스트 색상 (Text Colors)
```css
--text-primary: #18202a;    /* 주요 텍스트 */
--text-secondary: #6c7b8e;  /* 보조 텍스트, 레이블 */
--text-tertiary: #64748b;   /* 비활성 텍스트 */
--text-muted: #9a9a9a;      /* 흐린 텍스트 */
```

### 배경 색상 (Background Colors)
```css
--bg-main: #f4f4f7;           /* 메인 배경 */
--bg-dark: #18202a;           /* 사이드바, 테이블 헤더 */
--bg-dark-secondary: #33445a; /* 활성 네비게이션 */
--bg-light: #e6e8f1;          /* 버튼 그룹 배경 */
--bg-white: #ffffff;          /* 카드, 컨텐츠 영역 */
```

### 강조 색상 (Accent Colors)
```css
--accent-red: #ff786b;      /* 일요일, 경고 */
--accent-red-dark: #d40000; /* 지출, 부정적 */
--accent-blue-light: #86aeed; /* Top payment 아이콘 */
--accent-yellow: #ffd979;   /* Top payment 아이콘 */
--accent-orange: #ff9f73;   /* Top payment 아이콘 */
--accent-green: #99d276;    /* Top payment 아이콘 */
--accent-gray: #aeafaf;     /* Top payment 아이콘 */
```

### 카테고리 색상 (Category Colors)
```css
/* Expense Categories */
--category-housing: #62b0fe;
--category-food: #b37cda;
--category-mart: #ff9183;
--category-vehicle: #fe9e59;
--category-tax: #75cd10;

/* Income Categories */
--category-income-1: #b2d5ff;
--category-income-2: #ffd7aa;
--category-income-3: #cade9f;
--category-income-4: #dfc3f7;
--category-income-5: #f9c6c6;
--category-income-6: #c4e9e1;
--category-income-7: #ebebeb;
```

### 경계선 색상 (Border Colors)
```css
--border-light: #e6e8f1;
--border-table: #d8e9fd;
--border-card: rgba(226, 232, 240, 0.6);
--border-divider: #e4e5e9;
```

---

## 타이포그래피 (Typography)

### 폰트 패밀리 (Font Family)
```css
--font-primary: 'Pretendard', sans-serif;
--font-secondary: 'Inter', sans-serif;
```

### 폰트 크기 (Font Sizes)
```css
--text-xs: 9px;     /* 보조 정보, 환율 */
--text-sm: 10px;    /* 테이블 셀, 작은 레이블 */
--text-base: 12px;  /* 버튼, 기본 텍스트 */
--text-md: 14px;    /* 날짜, 카드 제목 */
--text-lg: 16px;    /* 네비게이션, 금액 기호 */
--text-xl: 18px;    /* 네비게이션 active */
--text-2xl: 20px;   /* 섹션 제목 */
--text-3xl: 22px;   /* 로고 */
--text-4xl: 24px;   /* 큰 금액 */
--text-5xl: 32px;   /* 대시보드 금액 */
--text-6xl: 40px;   /* 날짜 선택 */
--text-7xl: 48px;   /* 메인 날짜 */
```

### 폰트 굵기 (Font Weights)
```css
--weight-regular: 400;
--weight-medium: 500;
--weight-semibold: 600;
--weight-bold: 700;
--weight-extrabold: 800;
```

### 행간 (Line Heights)
```css
--leading-tight: 13.5px;
--leading-base: 15px;
--leading-relaxed: 16px;
--leading-loose: 20px;
--leading-normal: normal;
```

---

## 간격 시스템 (Spacing)

### 패딩 (Padding)
```css
--spacing-xs: 4px;
--spacing-sm: 8px;
--spacing-md: 12px;
--spacing-lg: 16px;
--spacing-xl: 24px;
--spacing-2xl: 32px;
```

### 갭 (Gap)
```css
--gap-xs: 2px;
--gap-sm: 4px;
--gap-md: 6px;
--gap-lg: 10px;
--gap-xl: 12px;
--gap-2xl: 24px;
--gap-3xl: 36px;
--gap-4xl: 54px;
```

---

## 둥근 모서리 (Border Radius)

```css
--radius-sm: 4px;      /* 카테고리 아이콘 */
--radius-md: 10px;     /* 작은 카드 */
--radius-lg: 12px;     /* 중간 카드 */
--radius-xl: 24px;     /* 메인 카드, 테이블 */
--radius-2xl: 32px;    /* 최외곽 컨테이너 */
--radius-full: 9999px; /* 버튼, 원형 */
```

---

## 그림자 (Shadows)

```css
--shadow-sm: 0px 1px 2px 0px rgba(0, 0, 0, 0.05);
--shadow-md: 2px 2px 5px 0px rgba(0, 0, 0, 0.1);
--shadow-lg: 4px 4px 8px 0px rgba(25, 28, 30, 0.16);
--shadow-xl: 0px 8px 24px 0px rgba(25, 28, 30, 0.04);
--shadow-inset: inset 0px 2px 4px 0px rgba(0, 0, 0, 0.05);
```

---

## 주요 컴포넌트 (Key Components)

### 1. 사이드바 네비게이션 (Sidebar Navigation)
```
크기: 256px 고정 너비
배경: #18202a
둥근 모서리: 24px
패딩: 24px (outer), 32px (inner)
```

**네비게이션 링크:**
- 기본 상태: text-[#6c7b8e]
- 활성 상태: bg-[#33445a], text-white, rounded-[100px]
- 패딩: px-24px, py-12px
- 아이콘 크기: 20×20px
- 폰트: 18px Medium

### 2. 버튼 그룹 (Segmented Control / Tab Buttons)
```
배경 컨테이너: #e6e8f1
둥근 모서리: 9999px (pill)
패딩: 4px
내부 그림자: inset 0px 2px 4px 0px rgba(0,0,0,0.05)
```

**버튼 상태:**
- 비활성: text-[#6c7b8e], 12px Medium
- 활성: bg-white, text-[#004ea7], shadow-sm, 12px SemiBold/Bold
- 개별 버튼 패딩: px-24px, py-8px
- 최소 너비: 100px

### 3. 테이블 (Transaction Table)
```
카드 배경: white
둥근 모서리: 24px
그림자: 0px 8px 24px rgba(25,28,30,0.04)
경계선: 1px solid rgba(226,232,240,0.6)
```

**테이블 헤더:**
- 배경: #18202a
- 텍스트: #e6e8f1, 12px Bold, uppercase
- 패딩: px-24px, pt-12px, pb-13px
- 하단 경계선: 1px solid #f1f5f9

**테이블 행:**
- 높이: 48px (기본)
- 패딩: px-24px, py-8px
- 경계선: 1px solid #d8e9fd
- 갭: 12px (셀 사이)

**테이블 셀 너비:**
- 일자: 36px
- 구분: 40px
- 대분류: 60px
- 소분류: 60px
- 내역: 160px
- 메모: flex-1
- 금액: 100px (right-aligned)

**고정지출/고정수입 미입력 행:**
- opacity: 0.4 (Dim 처리)
- 클릭 시 자동 입력된 팝업 오픈

### 4. 카드 컴포넌트 (Card)
```
배경: white
둥근 모서리: 24px
그림자: 0px 8px 24px rgba(25,28,30,0.04)
경계선: 1px solid rgba(226,232,240,0.6)
패딩: 24px
```

### 5. 상단 오버레이 / Indicator Bar
```
높이: 32px
배경: transparent
패딩: px-32px
환율 정보: 10px, #6c7b8e
업데이트 시간: 10px, #176bda
위치: sticky top-0
```

### 6. 날짜 컨트롤 (Date Control)
```
날짜 숫자: 40px Bold, #363d4b
날짜 단위: 24px Regular, #363d4b
갭: 10px
화살표 버튼: 40×40px 원형, bg-[#e6e8f1], #6c7b8e
```

### 7. Top Payment 아이콘
```
크기: 48×30px
둥근 모서리: 4px
그림자: 2px 2px 5px rgba(0,0,0,0.1)
텍스트: 24px Bold, white
컬러/이니셜: Manage > 지출방식에서 설정한 값 자동 반영
```

### 8. 차트 (Bar Chart)
```
바 너비: 32px
바 둥근 모서리: 4px
바 갭: 25px
차트 높이: 208px
Y축 레이블: 11px, #6c7b8e
X축 레이블: 12px Bold, uppercase
활성 월: #004ea7
비활성 월: muted
```

**바 차트 인터랙션 (Dashboard):**
- 선택 월 팝업 항상 표시 (기본 우측, 공간 없으면 좌측 자동 전환)
- 다른 월 롤오버 시 해당 월 팝업으로 일시 전환
- 롤오버 해제 시 선택 월 복귀
- 바 클릭 시 선택 월 변경

### 9. EXPENSE BREAKDOWN 차트
```
형태: 반원(Semi-circle) 도넛 차트
색상: 고정 팔레트, 지출 금액 큰 항목부터 순서 배정
범례: 카테고리명 + 비중(%)
```

### 10. INCOME BREAKDOWN 차트
```
형태: 100칸 박스 그래프
배정: 위에서부터 1%씩 (총 100칸)
색상: 카테고리별 구분
범례: 카테고리명 + 비중(%)
```

### 11. 플로팅 추가 버튼 (FAB)
```
크기: 58×58px
배경: #004ea7
그림자: 4px 4px 8px rgba(25,28,30,0.16)
위치: bottom-24px, right-33px (sticky, 전 페이지 공통)
아이콘: white "+"
```

---

## 레이아웃 (Layout)

### 그리드 시스템
```
사이드바: 256px 고정
메인 컨텐츠 시작: left-256px
컨텐츠 패딩: px-32px
카드 간 갭: 24px
```

### 반응형 기준
```
사이드바: 256px 고정
메인 컨텐츠: 나머지 flex
최소 컨테이너: 1024px~
```

### 기본 앱 레이아웃 코드
```tsx
<div className="bg-[#f4f4f7] relative size-full">
  <Sidebar />
  <div className="absolute flex flex-col inset-[0_0_0_256px]">
    <IndicatorBar />  {/* sticky */}
    <TitleBar />      {/* sticky */}
    <main className="flex flex-col gap-[24px] p-[32px]">
      {children}
    </main>
  </div>
</div>
```

---

## 스크롤 동작

| 페이지 | 스크롤 | 예외 |
|--------|--------|------|
| Dashboard | ❌ 없음 | TOP SPENDING 카드 내부만 |
| Transactions | ✅ 컨텐츠 영역 | 상단 탭/토글 sticky |
| Budget | ✅ 컨텐츠 영역 | 없음 |
| Manage | ✅ 우측 컨텐츠 | 좌측 메뉴 고정 |
| Settings | ✅ 컨텐츠 영역 | 없음 |

---

## 애니메이션 & 인터랙션

```css
transition: all 150ms ease-in-out;
```

- 네비게이션 링크: 배경 변경
- 버튼: 약간의 밝기 변화
- 테이블 행: 배경 하이라이트

---

## 아이콘 시스템

- 네비게이션 아이콘: 20×20px, 비활성 #6c7b8e / 활성 white
- 화살표: 40×40px 컨테이너, #6c7b8e
- 설정 아이콘: 20×20px, #6c7b8e

---

## 데이터 시각화 색상

```
수입 (Income): #5898ff
지출 (Expenses): #d8e9fd (배경), #5898ff (실제값)
순수익 (Net): #004ea7
지출 금액 표시: #d40000
```

---

## 특수 상태

```
비활성(Dim): opacity 0.4
일요일: #ff786b
토요일: #5898ff
평일: #18202a
```

---

## 컴포넌트 파일 경로

```
src/app/components/design-system/Button.tsx
src/app/components/design-system/Card.tsx
src/app/components/design-system/Table.tsx
src/app/components/design-system/Navigation.tsx
src/styles/design-tokens.css
```

---

생성일: 2026-04-12
버전: 1.1.0 (기술 스택 Next.js/Vercel 반영, 인터랙션 및 스크롤 규칙 추가)

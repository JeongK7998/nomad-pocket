import svgPaths from "./svg-lmhel3begn";

function Container1() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="flex flex-col font-['Pretendard:Medium',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#6c7b8e] text-[10px] tracking-[0.5px] w-[100.56px]">
        <p className="leading-[15px]">KRW|USD 1,342.40</p>
      </div>
    </div>
  );
}

function Container2() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#6c7b8e] text-[10px] tracking-[0.5px] w-[44.3px]">
        <p className="leading-[15px]">JPY 9.12</p>
      </div>
    </div>
  );
}

function Container3() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="flex flex-col font-['Inter:Medium',sans-serif] font-medium h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#176bda] text-[10px] tracking-[0.5px] w-[113px]">
        <p className="leading-[15px]">LAST UPDATED 14:02</p>
      </div>
    </div>
  );
}

function Container() {
  return (
    <div className="content-stretch flex gap-[24px] h-[15px] items-start relative shrink-0" data-name="Container">
      <Container1 />
      <Container2 />
      <Container3 />
    </div>
  );
}

function Overlay() {
  return (
    <div className="h-[32px] relative shrink-0 w-full" data-name="Overlay">
      <div className="flex flex-row items-center justify-end size-full">
        <div className="content-stretch flex items-center justify-end px-[32px] relative size-full">
          <Container />
        </div>
      </div>
    </div>
  );
}

function YearlyOverviewContainer() {
  return (
    <div className="bg-[#5898ff] content-stretch flex items-center justify-center px-[10px] py-[3px] relative rounded-[12px] shrink-0" data-name="Yearly Overview Container">
      <div className="flex flex-col font-['Pretendard:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-white tracking-[1.2px] uppercase whitespace-nowrap">
        <p className="leading-[16px]">Yearly Overview</p>
      </div>
    </div>
  );
}

function YearContainer() {
  return (
    <div className="content-stretch flex items-end justify-center relative shrink-0" data-name="Year Container">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center relative shrink-0 text-[48px]">
        <p className="leading-[48px]">2026</p>
      </div>
      <div className="flex flex-col font-['Pretendard:Regular',sans-serif] justify-end relative shrink-0 text-[24px]">
        <p className="leading-[32px]">년</p>
      </div>
    </div>
  );
}

function MonthContainer() {
  return (
    <div className="content-stretch flex items-end justify-center relative shrink-0" data-name="Month Container">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center relative shrink-0 text-[48px]">
        <p className="leading-[48px]">06</p>
      </div>
      <div className="flex flex-col font-['Pretendard:Regular',sans-serif] justify-end relative shrink-0 text-[24px]">
        <p className="leading-[32px]">월</p>
      </div>
    </div>
  );
}

function DayContainer() {
  return (
    <div className="content-stretch flex items-end justify-center relative shrink-0" data-name="Day Container">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center relative shrink-0 text-[48px]">
        <p className="leading-[48px]">24</p>
      </div>
      <div className="flex flex-col font-['Pretendard:Regular',sans-serif] justify-end relative shrink-0 text-[24px]">
        <p className="leading-[32px]">일</p>
      </div>
    </div>
  );
}

function DateContainer() {
  return (
    <div className="content-stretch flex gap-[10px] items-start leading-[0] not-italic relative shrink-0 text-[#363d4b] tracking-[-2px] whitespace-nowrap" data-name="Date Container">
      <YearContainer />
      <MonthContainer />
      <DayContainer />
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-start relative shrink-0" data-name="Container">
      <YearlyOverviewContainer />
      <DateContainer />
    </div>
  );
}

function Button() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center px-[24px] py-[8px] relative shrink-0 w-[100px]" data-name="Button">
      <div className="flex flex-col font-['Pretendard:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6c7b8e] text-[12px] text-center whitespace-nowrap">
        <p className="leading-[16px]">YEARLY</p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="bg-white content-stretch flex flex-col items-center justify-center px-[24px] py-[8px] relative rounded-[9999px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-[100px]" data-name="Button">
      <div className="flex flex-col font-['Pretendard:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#004ea7] text-[12px] text-center whitespace-nowrap">
        <p className="leading-[16px]">MONTHLY</p>
      </div>
    </div>
  );
}

function Button2() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center px-[24px] py-[8px] relative shrink-0 w-[100px]" data-name="Button">
      <div className="flex flex-col font-['Pretendard:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6c7b8e] text-[12px] text-center whitespace-nowrap">
        <p className="leading-[16px]">WEEKLY</p>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center px-[24px] py-[8px] relative shrink-0 w-[100px]" data-name="Button">
      <div className="flex flex-col font-['Pretendard:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6c7b8e] text-[12px] text-center whitespace-nowrap">
        <p className="leading-[16px]">REGION</p>
      </div>
    </div>
  );
}

function Button4() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center px-[24px] py-[8px] relative shrink-0 w-[100px]" data-name="Button">
      <div className="flex flex-col font-['Pretendard:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6c7b8e] text-[12px] text-center whitespace-nowrap">
        <p className="leading-[16px]">TAGGING</p>
      </div>
    </div>
  );
}

function BackgroundShadow() {
  return (
    <div className="content-stretch flex items-start p-[4px] relative rounded-[9999px] shrink-0" data-name="Background+Shadow">
      <div aria-hidden="true" className="absolute bg-[#e6e8f1] inset-0 pointer-events-none rounded-[9999px]" />
      <Button />
      <Button1 />
      <Button2 />
      <Button3 />
      <Button4 />
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)]" />
    </div>
  );
}

function Container4() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-end size-full">
        <div className="content-stretch flex items-end justify-between px-[32px] py-[24px] relative w-full">
          <Container5 />
          <BackgroundShadow />
        </div>
      </div>
    </div>
  );
}

function HeaderSection() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Header Section">
      <Overlay />
      <Container4 />
    </div>
  );
}

function CashFlowContainer() {
  return (
    <div className="content-stretch flex flex-col items-end leading-[normal] not-italic relative shrink-0 text-right w-[120px]" data-name="Cash Flow Container">
      <p className="font-['Pretendard:Regular',sans-serif] relative shrink-0 text-[#6c7b8e] text-[12px] w-full">Cash Flow</p>
      <p className="font-['Pretendard:Bold',sans-serif] relative shrink-0 text-[#18202a] text-[32px] w-full">26.Jun</p>
    </div>
  );
}

function IncomeContainer() {
  return (
    <div className="content-stretch flex flex-col items-end not-italic relative shrink-0 text-[#6c7b8e] text-right w-[160px]" data-name="Income Container">
      <p className="font-['Pretendard:Regular',sans-serif] leading-[normal] min-w-full relative shrink-0 text-[12px] w-[min-content]">Income</p>
      <p className="font-['Pretendard:Bold',sans-serif] leading-[0] relative shrink-0 text-[0px] tracking-[-1.2px] whitespace-nowrap">
        <span className="leading-[normal] text-[16px]">{`₩ `}</span>
        <span className="leading-[normal] text-[32px]">2,764,000</span>
      </p>
    </div>
  );
}

function ExpensesContainer() {
  return (
    <div className="content-stretch flex flex-col items-end not-italic relative shrink-0 text-right w-[160px]" data-name="Expenses Container">
      <p className="font-['Pretendard:Regular',sans-serif] leading-[normal] min-w-full relative shrink-0 text-[#6c7b8e] text-[12px] w-[min-content]">Expenses</p>
      <p className="font-['Pretendard:Bold',sans-serif] leading-[0] relative shrink-0 text-[#9a9a9a] text-[0px] tracking-[-1.2px] whitespace-nowrap">
        <span className="leading-[normal] text-[#6c7b8e] text-[16px]">₩</span>
        <span className="leading-[normal] text-[#6c7b8e] text-[24px]">{` `}</span>
        <span className="leading-[normal] text-[#6c7b8e] text-[32px]">1,732,200</span>
      </p>
    </div>
  );
}

function NetContainer() {
  return (
    <div className="content-stretch flex flex-col items-end not-italic relative shrink-0 text-right w-[160px]" data-name="Net Container">
      <p className="font-['Pretendard:Regular',sans-serif] leading-[normal] min-w-full relative shrink-0 text-[#6c7b8e] text-[12px] w-[min-content]">Net</p>
      <p className="font-['Pretendard:Bold',sans-serif] leading-[0] relative shrink-0 text-[#004ea7] text-[0px] tracking-[-1.2px] whitespace-nowrap">
        <span className="leading-[normal] text-[16px]">{`₩ `}</span>
        <span className="leading-[normal] text-[32px]">1,031,800</span>
      </p>
    </div>
  );
}

function Index() {
  return (
    <div className="relative shrink-0 w-full" data-name="index">
      <div className="content-stretch flex items-start justify-between px-[20px] relative w-full">
        <CashFlowContainer />
        <div className="relative self-stretch shrink-0 w-0">
          <div className="absolute inset-[0_-0.5px]">
            <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 1 52">
              <path d="M0.5 0V52" id="Vector 34" stroke="var(--stroke-0, #E6E8F1)" />
            </svg>
          </div>
        </div>
        <IncomeContainer />
        <ExpensesContainer />
        <NetContainer />
      </div>
    </div>
  );
}

function YAxisLabels() {
  return (
    <div className="content-stretch flex flex-col font-['Pretendard:Regular',sans-serif] h-[222px] items-start justify-between leading-[0] not-italic pt-[26px] relative shrink-0 text-[#6c7b8e] text-[0px] whitespace-nowrap" data-name="Y-Axis Labels">
      <div className="flex flex-col justify-center relative shrink-0">
        <p>
          <span className="leading-[15px] text-[9px]">₩</span>
          <span className="leading-[15px] text-[11px]">50M</span>
        </p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0">
        <p>
          <span className="leading-[15px] text-[9px]">₩</span>
          <span className="leading-[15px] text-[11px]">40M</span>
        </p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0">
        <p>
          <span className="leading-[15px] text-[9px]">₩</span>
          <span className="leading-[15px] text-[11px]">30M</span>
        </p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0">
        <p>
          <span className="leading-[15px] text-[9px]">₩</span>
          <span className="leading-[15px] text-[11px]">20M</span>
        </p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0">
        <p>
          <span className="leading-[15px] text-[9px]">₩</span>
          <span className="leading-[15px] text-[11px]">10M</span>
        </p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0">
        <p>
          <span className="leading-[15px] text-[9px]">₩</span>
          <span className="leading-[15px] text-[11px]">0</span>
        </p>
      </div>
    </div>
  );
}

function HorizontalDividersContainer() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Horizontal Dividers Container">
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none">
          <div className="h-[36px] relative w-[760px]" data-name="Horizontal Divider">
            <div aria-hidden="true" className="absolute border-[#e4e5e9] border-dashed border-t inset-0 pointer-events-none" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none">
          <div className="h-[36px] relative w-[760px]" data-name="Horizontal Divider">
            <div aria-hidden="true" className="absolute border-[#e4e5e9] border-dashed border-t inset-0 pointer-events-none" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none">
          <div className="h-[36px] relative w-[760px]" data-name="Horizontal Divider">
            <div aria-hidden="true" className="absolute border-[#e4e5e9] border-dashed border-t inset-0 pointer-events-none" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none">
          <div className="h-[36px] relative w-[760px]" data-name="Horizontal Divider">
            <div aria-hidden="true" className="absolute border-[#e4e5e9] border-dashed border-t inset-0 pointer-events-none" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none">
          <div className="h-[36px] relative w-[760px]" data-name="Horizontal Divider">
            <div aria-hidden="true" className="absolute border-[#e4e5e9] border-dashed border-t inset-0 pointer-events-none" />
          </div>
        </div>
      </div>
      <div className="flex items-center justify-center relative shrink-0">
        <div className="-scale-y-100 flex-none">
          <div className="h-[36px] relative w-[760px]" data-name="Horizontal Divider">
            <div aria-hidden="true" className="absolute border-[#e4e5e9] border-dashed border-t inset-0 pointer-events-none" />
          </div>
        </div>
      </div>
    </div>
  );
}

function XAxisLabels() {
  return (
    <div className="h-[22px] relative shrink-0 w-full" data-name="X-Axis Labels">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex font-['Pretendard:Bold',sans-serif] gap-[32px] items-center leading-[0] not-italic pt-[8px] px-[20px] relative size-full text-[12px] text-center tracking-[-0.45px] uppercase">
          <div className="flex flex-col justify-center relative shrink-0 text-[#6c7b8e] w-[30px]">
            <p className="leading-[13.5px]">Jan</p>
          </div>
          <div className="flex flex-col justify-center relative shrink-0 text-[#6c7b8e] w-[30px]">
            <p className="leading-[13.5px]">Feb</p>
          </div>
          <div className="flex flex-col justify-center relative shrink-0 text-[#6c7b8e] w-[30px]">
            <p className="leading-[13.5px]">Mar</p>
          </div>
          <div className="flex flex-col justify-center relative shrink-0 text-[#6c7b8e] w-[30px]">
            <p className="leading-[13.5px]">Apr</p>
          </div>
          <div className="flex flex-col justify-center relative shrink-0 text-[#6c7b8e] w-[30px]">
            <p className="leading-[13.5px]">May</p>
          </div>
          <div className="flex flex-col justify-center relative shrink-0 text-[#004ea7] w-[30px]">
            <p className="leading-[13.5px]">Jun</p>
          </div>
          <div className="flex flex-col justify-center relative shrink-0 text-[#6c7b8e] w-[30px]">
            <p className="leading-[13.5px]">Jul</p>
          </div>
          <div className="flex flex-col justify-center relative shrink-0 text-[#6c7b8e] w-[30px]">
            <p className="leading-[13.5px]">Aug</p>
          </div>
          <div className="flex flex-col justify-center relative shrink-0 text-[#6c7b8e] w-[30px]">
            <p className="leading-[13.5px]">Sep</p>
          </div>
          <div className="flex flex-col justify-center relative shrink-0 text-[#6c7b8e] w-[30px]">
            <p className="leading-[13.5px]">Oct</p>
          </div>
          <div className="flex flex-col justify-center relative shrink-0 text-[#6c7b8e] w-[30px]">
            <p className="leading-[13.5px]">Nov</p>
          </div>
          <div className="flex flex-col justify-center relative shrink-0 text-[#6c7b8e] w-[30px]">
            <p className="leading-[13.5px]">Dec</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function BarGroup() {
  return (
    <div className="bg-[#d8e9fd] content-stretch flex h-[103px] items-center justify-center pt-[57px] relative rounded-[4px] shrink-0 w-[32px]" data-name="Bar Group">
      <div className="bg-[#5898ff] h-[46px] rounded-[4px] shrink-0 w-[32px]" data-name="Bar" />
    </div>
  );
}

function BarContainer() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center justify-center relative shrink-0 w-[37px]" data-name="Bar Container">
      <BarGroup />
    </div>
  );
}

function BarGroup2() {
  return (
    <div className="bg-[#d8e9fd] content-stretch flex h-[133px] items-center justify-center pt-[57px] relative rounded-[4px] shrink-0 w-[32px]" data-name="Bar Group">
      <div className="absolute bg-[#5898ff] h-[100px] left-0 rounded-[4px] top-[33px] w-[32px]" data-name="Bar" />
    </div>
  );
}

function BarGroup1() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center justify-center relative shrink-0 w-[37px]" data-name="Bar Group">
      <BarGroup2 />
    </div>
  );
}

function BarGroup4() {
  return (
    <div className="bg-[#d8e9fd] content-stretch flex h-[122px] items-center justify-center pt-[57px] relative rounded-[4px] shrink-0 w-[32px]" data-name="Bar Group">
      <div className="absolute bg-[#5898ff] h-[89px] left-0 rounded-[4px] top-[33px] w-[32px]" data-name="Bar" />
    </div>
  );
}

function BarGroup3() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center justify-center relative shrink-0 w-[37px]" data-name="Bar Group">
      <BarGroup4 />
    </div>
  );
}

function BarGroup6() {
  return (
    <div className="bg-[#5898ff] content-stretch flex h-[103px] items-center justify-center pt-[57px] relative rounded-[4px] shrink-0 w-[32px]" data-name="Bar Group">
      <div className="absolute bg-[#d8e9fd] h-[93px] left-0 rounded-[4px] top-[10px] w-[32px]" data-name="Bar" />
    </div>
  );
}

function BarGroup5() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center justify-center relative shrink-0 w-[37px]" data-name="Bar Group">
      <BarGroup6 />
    </div>
  );
}

function BarGroup8() {
  return (
    <div className="bg-[#d8e9fd] content-stretch flex h-[115px] items-center justify-center pt-[57px] relative rounded-[4px] shrink-0 w-[32px]" data-name="Bar Group">
      <div className="absolute bg-[#5898ff] h-[104px] left-[0.5px] rounded-[4px] top-[11px] w-[32px]" data-name="Bar" />
    </div>
  );
}

function BarGroup7() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center justify-center relative shrink-0 w-[37px]" data-name="Bar Group">
      <BarGroup8 />
    </div>
  );
}

function BarGroup10() {
  return (
    <div className="bg-[#d8e9fd] content-stretch flex h-[133px] items-center justify-center pt-[57px] relative rounded-[4px] shrink-0 w-[32px]" data-name="Bar Group">
      <div aria-hidden="true" className="absolute border-2 border-[#5898ff] border-solid inset-0 pointer-events-none rounded-[4px]" />
      <div className="absolute bg-[#5898ff] h-[52px] left-[0.5px] rounded-[4px] top-[81px] w-[32px]" data-name="Bar" />
    </div>
  );
}

function BarGroup9() {
  return (
    <div className="content-stretch flex flex-col gap-[4px] items-center justify-center relative shrink-0 w-[37px]" data-name="Bar Group">
      <BarGroup10 />
    </div>
  );
}

function Bars() {
  return (
    <div className="absolute bottom-[22px] content-stretch flex gap-[25px] h-[208px] items-end left-[17px]" data-name="Bars">
      <BarContainer />
      <BarGroup1 />
      <BarGroup3 />
      <BarGroup5 />
      <BarGroup7 />
      <BarGroup9 />
    </div>
  );
}

function LegendLabelContainer() {
  return (
    <div className="content-stretch flex flex-col font-['Pretendard:Regular',sans-serif] gap-[4px] items-start relative shrink-0 text-white" data-name="Legend Label Container">
      <div className="flex flex-col justify-center relative shrink-0">
        <p className="leading-[15px]">Income</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0">
        <p className="leading-[15px]">Expenses</p>
      </div>
    </div>
  );
}

function LegendAmountContainer() {
  return (
    <div className="content-stretch flex flex-col font-['Pretendard:Bold',sans-serif] gap-[4px] items-start relative shrink-0" data-name="Legend Amount Container">
      <div className="flex flex-col justify-center relative shrink-0 text-[#5898ff]">
        <p className="leading-[15px]">3,820,000</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 text-[#d40000]">
        <p className="leading-[15px]">2,950,000</p>
      </div>
    </div>
  );
}

function LegendContainer() {
  return (
    <div className="absolute bg-[#18202a] content-stretch flex gap-[12px] items-start leading-[0] left-[369px] not-italic px-[14px] py-[10px] rounded-[12px] shadow-[4px_4px_8px_0px_rgba(25,28,30,0.16)] text-[12px] text-center top-[83px] whitespace-nowrap" data-name="Legend Container">
      <LegendLabelContainer />
      <LegendAmountContainer />
    </div>
  );
}

function GridContainer() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[760px]" data-name="Grid Container">
      <HorizontalDividersContainer />
      <XAxisLabels />
      <Bars />
      <LegendContainer />
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[16px] items-start min-h-px min-w-px relative" data-name="Container">
      <YAxisLabels />
      <GridContainer />
    </div>
  );
}

function YearlyComparisonContainer() {
  return (
    <div className="content-stretch flex flex-col h-full items-start relative shrink-0" data-name="Yearly Comparison Container">
      <Index />
      <Container6 />
    </div>
  );
}

function TopPaymentIcon() {
  return (
    <div className="bg-[#86aeed] content-stretch flex flex-col h-[30px] items-center justify-center relative rounded-[4px] shadow-[2px_2px_5px_0px_rgba(0,0,0,0.1)] shrink-0 w-[48px]" data-name="Top Payment Icon">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[24px] text-center text-white whitespace-nowrap">
        <p className="leading-[15px]">W</p>
      </div>
    </div>
  );
}

function TopPaymentDetails() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0 text-[12px]" data-name="Top Payment Details">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center relative shrink-0 text-[#5898ff]">
        <p className="leading-[15px]">우리카드</p>
      </div>
      <div className="flex flex-col font-['Pretendard:Regular',sans-serif] justify-center relative shrink-0 text-[#d8e9fd]">
        <p className="leading-[15px]">종일</p>
      </div>
    </div>
  );
}

function TopPaymentDetailsContainer() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start justify-center leading-[0] min-h-px min-w-px not-italic relative text-center whitespace-nowrap" data-name="Top Payment Details Container">
      <TopPaymentDetails />
      <div className="flex flex-col font-['Pretendard:Regular',sans-serif] justify-center relative shrink-0 text-[#d8e9fd] text-[10px]">
        <p className="leading-[15px]">₩53,452,000</p>
      </div>
    </div>
  );
}

function TopPaymentItemContainer() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full" data-name="Top Payment Item Container">
      <TopPaymentIcon />
      <TopPaymentDetailsContainer />
    </div>
  );
}

function TopPaymentIcon1() {
  return (
    <div className="bg-[#ffd979] content-stretch flex flex-col h-[30px] items-center justify-center relative rounded-[4px] shadow-[2px_2px_5px_0px_rgba(0,0,0,0.1)] shrink-0 w-[48px]" data-name="Top Payment Icon">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[24px] text-center text-white w-full">
        <p className="leading-[15px]">S</p>
      </div>
    </div>
  );
}

function TopPaymentDetails1() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0 text-[12px]" data-name="Top Payment Details">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center relative shrink-0 text-[#5898ff]">
        <p className="leading-[15px]">삼성카드</p>
      </div>
      <div className="flex flex-col font-['Pretendard:Regular',sans-serif] justify-center relative shrink-0 text-[#d8e9fd]">
        <p className="leading-[15px]">종일</p>
      </div>
    </div>
  );
}

function TopPaymentDetailsContainer1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start justify-center leading-[0] min-h-px min-w-px not-italic relative text-center whitespace-nowrap" data-name="Top Payment Details Container">
      <TopPaymentDetails1 />
      <div className="flex flex-col font-['Pretendard:Regular',sans-serif] justify-center relative shrink-0 text-[#d8e9fd] text-[10px]">
        <p className="leading-[15px]">₩53,452,000</p>
      </div>
    </div>
  );
}

function TopPaymentItemContainer1() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full" data-name="Top Payment Item Container">
      <TopPaymentIcon1 />
      <TopPaymentDetailsContainer1 />
    </div>
  );
}

function TopPaymentIcon2() {
  return (
    <div className="bg-[#ff9f73] content-stretch flex flex-col h-[30px] items-center justify-center relative rounded-[4px] shadow-[2px_2px_5px_0px_rgba(0,0,0,0.1)] shrink-0 w-[48px]" data-name="Top Payment Icon">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[24px] text-center text-white w-full">
        <p className="leading-[15px]">H</p>
      </div>
    </div>
  );
}

function TopPaymentDetails2() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0 text-[12px]" data-name="Top Payment Details">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center relative shrink-0 text-[#5898ff]">
        <p className="leading-[15px]">현대카드</p>
      </div>
      <div className="flex flex-col font-['Pretendard:Regular',sans-serif] justify-center relative shrink-0 text-[#d8e9fd]">
        <p className="leading-[15px]">정은</p>
      </div>
    </div>
  );
}

function TopPaymentDetailsContainer2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start justify-center leading-[0] min-h-px min-w-px not-italic relative text-center whitespace-nowrap" data-name="Top Payment Details Container">
      <TopPaymentDetails2 />
      <div className="flex flex-col font-['Pretendard:Regular',sans-serif] justify-center relative shrink-0 text-[#d8e9fd] text-[10px]">
        <p className="leading-[15px]">₩53,452,000</p>
      </div>
    </div>
  );
}

function TopPaymentItemContainer2() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full" data-name="Top Payment Item Container">
      <TopPaymentIcon2 />
      <TopPaymentDetailsContainer2 />
    </div>
  );
}

function TopPaymentIcon3() {
  return (
    <div className="bg-[#99d276] content-stretch flex flex-col h-[30px] items-center justify-center relative rounded-[4px] shadow-[2px_2px_5px_0px_rgba(0,0,0,0.1)] shrink-0 w-[48px]" data-name="Top Payment Icon">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[24px] text-center text-white w-full">
        <p className="leading-[15px]">R</p>
      </div>
    </div>
  );
}

function TopPaymentDetails3() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0" data-name="Top Payment Details">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#5898ff] text-[12px] text-center whitespace-nowrap">
        <p className="leading-[15px]">지역화폐</p>
      </div>
    </div>
  );
}

function TopPaymentDetailsContainer3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start justify-center min-h-px min-w-px relative" data-name="Top Payment Details Container">
      <TopPaymentDetails3 />
      <div className="flex flex-col font-['Pretendard:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#d8e9fd] text-[10px] text-center whitespace-nowrap">
        <p className="leading-[15px]">₩53,452,000</p>
      </div>
    </div>
  );
}

function TopPaymentItemContainer3() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full" data-name="Top Payment Item Container">
      <TopPaymentIcon3 />
      <TopPaymentDetailsContainer3 />
    </div>
  );
}

function TopPaymentIcon4() {
  return (
    <div className="bg-[#aeafaf] content-stretch flex flex-col h-[30px] items-center justify-center relative rounded-[4px] shadow-[2px_2px_5px_0px_rgba(0,0,0,0.1)] shrink-0 w-[48px]" data-name="Top Payment Icon">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[24px] text-center text-white w-full">
        <p className="leading-[15px]">$</p>
      </div>
    </div>
  );
}

function TopPaymentDetails4() {
  return (
    <div className="content-stretch flex gap-[6px] items-center relative shrink-0 text-[12px]" data-name="Top Payment Details">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center relative shrink-0 text-[#5898ff]">
        <p className="leading-[15px]">현금</p>
      </div>
      <div className="flex flex-col font-['Pretendard:Regular',sans-serif] justify-center relative shrink-0 text-[#d8e9fd]">
        <p className="leading-[15px]">종일</p>
      </div>
    </div>
  );
}

function TopPaymentDetailsContainer4() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[2px] items-start justify-center leading-[0] min-h-px min-w-px not-italic relative text-center whitespace-nowrap" data-name="Top Payment Details Container">
      <TopPaymentDetails4 />
      <div className="flex flex-col font-['Pretendard:Regular',sans-serif] justify-center relative shrink-0 text-[#d8e9fd] text-[10px]">
        <p className="leading-[15px]">₩53,452,000</p>
      </div>
    </div>
  );
}

function TopPaymentItemContainer4() {
  return (
    <div className="content-stretch flex gap-[10px] items-center relative shrink-0 w-full" data-name="Top Payment Item Container">
      <TopPaymentIcon4 />
      <TopPaymentDetailsContainer4 />
    </div>
  );
}

function TopPaymentItemsContainer() {
  return (
    <div className="content-stretch flex flex-col gap-[12px] items-start justify-center relative shrink-0 w-full" data-name="Top Payment Items Container">
      <TopPaymentItemContainer />
      <TopPaymentItemContainer1 />
      <TopPaymentItemContainer2 />
      <TopPaymentItemContainer3 />
      <TopPaymentItemContainer4 />
    </div>
  );
}

function TopPaymentContainer() {
  return (
    <div className="bg-[#18202a] h-full relative rounded-[10px] shrink-0 w-[167px]" data-name="Top Payment Container">
      <div className="content-stretch flex flex-col items-start justify-between px-[16px] py-[24px] relative size-full">
        <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[12px] text-white uppercase whitespace-nowrap">
          <p className="leading-[16px]">Top 5 Payment</p>
        </div>
        <TopPaymentItemsContainer />
      </div>
    </div>
  );
}

function Row1YearlyComparison() {
  return (
    <div className="bg-white h-[335px] relative rounded-[24px] shadow-[0px_8px_24px_0px_rgba(25,28,30,0.04)] shrink-0 w-full" data-name="ROW 1: Yearly Comparison">
      <div className="content-stretch flex gap-[24px] items-start p-[24px] relative size-full">
        <YearlyComparisonContainer />
        <TopPaymentContainer />
      </div>
    </div>
  );
}

function ExpenseCategoryGroup() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[10px] h-[14px] items-center justify-center min-h-px min-w-px relative" data-name="Expense Category Group">
      <div className="bg-[#62b0fe] rounded-[4px] shrink-0 size-[10px]" data-name="Expense Category Icon" />
      <p className="flex-[1_0_0] font-['Pretendard:Medium',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#18202a] text-[10px]">주거비</p>
    </div>
  );
}

function ExpenseCategoryContainer() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-[110px]" data-name="Expense Category Container">
      <ExpenseCategoryGroup />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18202a] text-[10px] whitespace-nowrap">17.7%</p>
    </div>
  );
}

function ExpenseCategoryGroup1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[10px] h-[14px] items-center justify-center min-h-px min-w-px relative" data-name="Expense Category Group">
      <div className="bg-[#b37cda] rounded-[4px] shrink-0 size-[10px]" data-name="Expense Category Icon" />
      <p className="flex-[1_0_0] font-['Pretendard:Medium',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#18202a] text-[10px]">식비</p>
    </div>
  );
}

function ExpenseCategoryContainer1() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-[110px]" data-name="Expense Category Container">
      <ExpenseCategoryGroup1 />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18202a] text-[10px] whitespace-nowrap">17.7%</p>
    </div>
  );
}

function ExpenseCategoryGroup2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[10px] h-[14px] items-center justify-center min-h-px min-w-px relative" data-name="Expense Category Group">
      <div className="bg-[#ff9183] rounded-[4px] shrink-0 size-[10px]" data-name="Expense Category Icon" />
      <p className="flex-[1_0_0] font-['Pretendard:Medium',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#18202a] text-[10px]">마트</p>
    </div>
  );
}

function ExpenseCategoryContainer2() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-[110px]" data-name="Expense Category Container">
      <ExpenseCategoryGroup2 />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18202a] text-[10px] whitespace-nowrap">17.7%</p>
    </div>
  );
}

function ExpenseCategoryGroup3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[10px] h-[14px] items-center justify-center min-h-px min-w-px relative" data-name="Expense Category Group">
      <div className="bg-[#fe9e59] rounded-[4px] shrink-0 size-[10px]" data-name="Expense Category Icon" />
      <p className="flex-[1_0_0] font-['Pretendard:Medium',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#18202a] text-[10px]">차량</p>
    </div>
  );
}

function ExpenseCategoryContainer3() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-[110px]" data-name="Expense Category Container">
      <ExpenseCategoryGroup3 />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18202a] text-[10px] whitespace-nowrap">17.7%</p>
    </div>
  );
}

function ExpenseCategoryGroup4() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[10px] h-[14px] items-center justify-center min-h-px min-w-px relative" data-name="Expense Category Group">
      <div className="bg-[#75cd10] rounded-[4px] shrink-0 size-[10px]" data-name="Expense Category Icon" />
      <p className="flex-[1_0_0] font-['Pretendard:Medium',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#18202a] text-[10px]">세금</p>
    </div>
  );
}

function ExpenseCategoryContainer4() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-[110px]" data-name="Expense Category Container">
      <ExpenseCategoryGroup4 />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18202a] text-[10px] whitespace-nowrap">17.7%</p>
    </div>
  );
}

function ExpenseBreakdownCategoryGroup() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Expense Breakdown Category Group">
      <ExpenseCategoryContainer />
      <ExpenseCategoryContainer1 />
      <ExpenseCategoryContainer2 />
      <ExpenseCategoryContainer3 />
      <ExpenseCategoryContainer4 />
    </div>
  );
}

function ExpenseCategoryIcon() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[10px] h-[14px] items-center justify-center min-h-px min-w-px relative" data-name="Expense Category Icon">
      <div className="bg-[#3582df] rounded-[4px] shrink-0 size-[10px]" data-name="Expense Category Name" />
      <p className="flex-[1_0_0] font-['Pretendard:Medium',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#18202a] text-[10px]">주거비</p>
    </div>
  );
}

function ExpenseCategoryGroup5() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-[110px]" data-name="Expense Category Group">
      <ExpenseCategoryIcon />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18202a] text-[10px] whitespace-nowrap">17.7%</p>
    </div>
  );
}

function ExpenseCategoryIcon1() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[10px] h-[14px] items-center justify-center min-h-px min-w-px relative" data-name="Expense Category Icon">
      <div className="bg-[#fb91d1] rounded-[4px] shrink-0 size-[10px]" data-name="Expense Category Name" />
      <p className="flex-[1_0_0] font-['Pretendard:Medium',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#18202a] text-[10px]">식비</p>
    </div>
  );
}

function ExpenseCategoryGroup6() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-[110px]" data-name="Expense Category Group">
      <ExpenseCategoryIcon1 />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18202a] text-[10px] whitespace-nowrap">17.7%</p>
    </div>
  );
}

function ExpenseCategoryIcon2() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[10px] h-[14px] items-center justify-center min-h-px min-w-px relative" data-name="Expense Category Icon">
      <div className="bg-[#ff5741] rounded-[4px] shrink-0 size-[10px]" data-name="Expense Category Name" />
      <p className="flex-[1_0_0] font-['Pretendard:Medium',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#18202a] text-[10px]">마트</p>
    </div>
  );
}

function ExpenseCategoryGroup7() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-[110px]" data-name="Expense Category Group">
      <ExpenseCategoryIcon2 />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18202a] text-[10px] whitespace-nowrap">17.7%</p>
    </div>
  );
}

function ExpenseCategoryIcon3() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[10px] h-[14px] items-center justify-center min-h-px min-w-px relative" data-name="Expense Category Icon">
      <div className="bg-[#ffdd48] rounded-[4px] shrink-0 size-[10px]" data-name="Expense Category Name" />
      <p className="flex-[1_0_0] font-['Pretendard:Medium',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#18202a] text-[10px]">차량</p>
    </div>
  );
}

function ExpenseCategoryGroup8() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-[110px]" data-name="Expense Category Group">
      <ExpenseCategoryIcon3 />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18202a] text-[10px] whitespace-nowrap">17.7%</p>
    </div>
  );
}

function ExpenseCategoryIcon4() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[10px] h-[14px] items-center justify-center min-h-px min-w-px relative" data-name="Expense Category Icon">
      <div className="bg-[#d6d6d6] rounded-[4px] shrink-0 size-[10px]" data-name="Expense Category Name" />
      <p className="flex-[1_0_0] font-['Pretendard:Medium',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#18202a] text-[10px]">세금</p>
    </div>
  );
}

function ExpenseCategoryGroup9() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-[110px]" data-name="Expense Category Group">
      <ExpenseCategoryIcon4 />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18202a] text-[10px] whitespace-nowrap">17.7%</p>
    </div>
  );
}

function ExpenseCategoryContainer5() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Expense Category Container">
      <ExpenseCategoryGroup5 />
      <ExpenseCategoryGroup6 />
      <ExpenseCategoryGroup7 />
      <ExpenseCategoryGroup8 />
      <ExpenseCategoryGroup9 />
    </div>
  );
}

function ExpenseBreakdownCategoriesContainer() {
  return (
    <div className="content-stretch flex gap-[36px] items-center relative shrink-0" data-name="Expense Breakdown Categories Container">
      <ExpenseBreakdownCategoryGroup />
      <ExpenseCategoryContainer5 />
    </div>
  );
}

function Svg() {
  return (
    <div className="h-[127px] relative w-[128px]" data-name="SVG">
      <div className="absolute inset-[-17.17%_-6.25%_-16.69%_0]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 136 170">
          <g id="SVG">
            <path d={svgPaths.p3c41f518} id="Vector" stroke="var(--stroke-0, #D6D6D6)" strokeWidth="30" />
            <path d={svgPaths.p5a1c5e6} id="Vector_2" stroke="var(--stroke-0, #75CD10)" strokeWidth="30" />
            <path d={svgPaths.p313a3300} id="Vector_3" stroke="var(--stroke-0, #FFDD48)" strokeWidth="30" />
            <path d={svgPaths.p9ca4a80} id="Vector_4" stroke="var(--stroke-0, #FE9E59)" strokeWidth="30" />
            <path d={svgPaths.p184f9f00} id="Vector_5" stroke="var(--stroke-0, #E96554)" strokeWidth="30" />
            <path d={svgPaths.p1acc3a80} id="Vector_6" stroke="var(--stroke-0, #F6728E)" strokeWidth="30" />
            <path d={svgPaths.p349b0800} id="Vector_7" stroke="var(--stroke-0, #FB91D1)" strokeWidth="30" />
            <path d={svgPaths.p31d86100} id="Vector_8" stroke="var(--stroke-0, #A27CDA)" strokeWidth="30" />
            <path d={svgPaths.p77eb080} id="Vector_9" stroke="var(--stroke-0, #3582DF)" strokeWidth="30" />
            <path d={svgPaths.p3c0123a0} id="Vector_10" stroke="var(--stroke-0, #62B0FE)" strokeWidth="30" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function ExpenseBreakdownContainer() {
  return (
    <div className="content-stretch flex flex-col gap-[24px] h-[238px] items-center justify-center relative shrink-0 w-full" data-name="Expense Breakdown Container">
      <ExpenseBreakdownCategoriesContainer />
      <div className="flex h-[128px] items-center justify-center relative shrink-0 w-[127px]" style={{ "--transform-inner-width": "1185", "--transform-inner-height": "18" } as React.CSSProperties}>
        <div className="-rotate-90 flex-none">
          <Svg />
        </div>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[18px] h-full items-start min-h-px min-w-px relative" data-name="Container">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#18202a] text-[20px] uppercase whitespace-nowrap">
        <p className="leading-[20px]">Expense Breakdown</p>
      </div>
      <ExpenseBreakdownContainer />
    </div>
  );
}

function BackgroundShadow1() {
  return (
    <div className="bg-white col-1 relative rounded-[24px] row-1 self-stretch shadow-[0px_8px_24px_0px_rgba(25,28,30,0.04)] shrink-0 w-[358.6px]" data-name="Background+Shadow">
      <div className="content-stretch flex items-start p-[24px] relative size-full">
        <Container7 />
      </div>
    </div>
  );
}

function IncomeCategoryBreakdown() {
  return (
    <div className="gap-x-[4px] gap-y-[4px] grid-cols-[repeat(10,fit-content(100%))] grid-rows-[repeat(10,fit-content(100%))] inline-grid relative shrink-0" data-name="Income Category Breakdown">
      <div className="bg-[#b2d5ff] col-1 rounded-[2px] row-1 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#b2d5ff] col-2 rounded-[2px] row-1 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#b2d5ff] col-3 rounded-[2px] row-1 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#b2d5ff] col-4 rounded-[2px] row-1 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#b2d5ff] col-5 rounded-[2px] row-1 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#b2d5ff] col-6 rounded-[2px] row-1 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#b2d5ff] col-7 rounded-[2px] row-1 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#b2d5ff] col-8 rounded-[2px] row-1 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#b2d5ff] col-9 rounded-[2px] row-1 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#b2d5ff] col-10 rounded-[2px] row-1 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#b2d5ff] col-1 rounded-[2px] row-2 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#b2d5ff] col-2 rounded-[2px] row-2 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#b2d5ff] col-3 rounded-[2px] row-2 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#b2d5ff] col-4 rounded-[2px] row-2 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#b2d5ff] col-5 rounded-[2px] row-2 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#b2d5ff] col-6 rounded-[2px] row-2 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#b2d5ff] col-7 rounded-[2px] row-2 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#b2d5ff] col-8 rounded-[2px] row-2 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#b2d5ff] col-9 rounded-[2px] row-2 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#b2d5ff] col-10 rounded-[2px] row-2 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#b2d5ff] col-1 rounded-[2px] row-3 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#b2d5ff] col-2 rounded-[2px] row-3 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#b2d5ff] col-3 rounded-[2px] row-3 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#b2d5ff] col-4 rounded-[2px] row-3 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#b2d5ff] col-5 rounded-[2px] row-3 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#b2d5ff] col-6 rounded-[2px] row-3 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#b2d5ff] col-7 rounded-[2px] row-3 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#b2d5ff] col-8 rounded-[2px] row-3 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#b2d5ff] col-9 rounded-[2px] row-3 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#b2d5ff] col-10 rounded-[2px] row-3 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#b2d5ff] col-1 rounded-[2px] row-4 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#b2d5ff] col-2 rounded-[2px] row-4 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#b2d5ff] col-3 rounded-[2px] row-4 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#b2d5ff] col-4 rounded-[2px] row-4 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#b2d5ff] col-5 rounded-[2px] row-4 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#b2d5ff] col-6 rounded-[2px] row-4 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#b2d5ff] col-7 rounded-[2px] row-4 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#b2d5ff] col-8 rounded-[2px] row-4 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#b2d5ff] col-9 rounded-[2px] row-4 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#b2d5ff] col-10 rounded-[2px] row-4 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#b2d5ff] col-1 rounded-[2px] row-5 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#b2d5ff] col-2 rounded-[2px] row-5 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#b2d5ff] col-3 rounded-[2px] row-5 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#b2d5ff] col-4 rounded-[2px] row-5 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#b2d5ff] col-5 rounded-[2px] row-5 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#ffd7aa] col-6 rounded-[2px] row-5 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#ffd7aa] col-7 rounded-[2px] row-5 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#ffd7aa] col-8 rounded-[2px] row-5 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#ffd7aa] col-9 rounded-[2px] row-5 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#ffd7aa] col-10 rounded-[2px] row-5 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#ffd7aa] col-1 rounded-[2px] row-6 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#ffd7aa] col-2 rounded-[2px] row-6 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#ffd7aa] col-3 rounded-[2px] row-6 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#ffd7aa] col-4 rounded-[2px] row-6 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#ffd7aa] col-5 rounded-[2px] row-6 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#ffd7aa] col-6 rounded-[2px] row-6 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#ffd7aa] col-7 rounded-[2px] row-6 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#ffd7aa] col-8 rounded-[2px] row-6 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#ffd7aa] col-9 rounded-[2px] row-6 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#ffd7aa] col-10 rounded-[2px] row-6 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#ffd7aa] col-1 rounded-[2px] row-7 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#ffd7aa] col-2 rounded-[2px] row-7 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#cade9f] col-3 rounded-[2px] row-7 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#cade9f] col-4 rounded-[2px] row-7 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#cade9f] col-5 rounded-[2px] row-7 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#cade9f] col-6 rounded-[2px] row-7 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#cade9f] col-7 rounded-[2px] row-7 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#cade9f] col-8 rounded-[2px] row-7 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#cade9f] col-9 rounded-[2px] row-7 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#cade9f] col-10 rounded-[2px] row-7 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#cade9f] col-1 rounded-[2px] row-8 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#cade9f] col-2 rounded-[2px] row-8 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#cade9f] col-3 rounded-[2px] row-8 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#cade9f] col-4 rounded-[2px] row-8 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#cade9f] col-5 rounded-[2px] row-8 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#dfc3f7] col-6 rounded-[2px] row-8 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#dfc3f7] col-7 rounded-[2px] row-8 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#dfc3f7] col-8 rounded-[2px] row-8 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#dfc3f7] col-9 rounded-[2px] row-8 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#dfc3f7] col-10 rounded-[2px] row-8 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#dfc3f7] col-1 rounded-[2px] row-9 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#dfc3f7] col-2 rounded-[2px] row-9 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#dfc3f7] col-3 rounded-[2px] row-9 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#dfc3f7] col-4 rounded-[2px] row-9 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#f9c6c6] col-5 rounded-[2px] row-9 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#f9c6c6] col-6 rounded-[2px] row-9 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#f9c6c6] col-7 rounded-[2px] row-9 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#f9c6c6] col-8 rounded-[2px] row-9 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#c4e9e1] col-9 rounded-[2px] row-9 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#c4e9e1] col-10 rounded-[2px] row-9 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#c4e9e1] col-1 rounded-[2px] row-10 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#ebebeb] col-2 rounded-[2px] row-10 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#ebebeb] col-3 rounded-[2px] row-10 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#ebebeb] col-4 rounded-[2px] row-10 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#ebebeb] col-5 rounded-[2px] row-10 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#ebebeb] col-6 rounded-[2px] row-10 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#ebebeb] col-7 rounded-[2px] row-10 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#ebebeb] col-8 rounded-[2px] row-10 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#ebebeb] col-9 rounded-[2px] row-10 shrink-0 size-[10px]" data-name="Income Category" />
      <div className="bg-[#ebebeb] col-10 rounded-[2px] row-10 shrink-0 size-[10px]" data-name="Income Category" />
    </div>
  );
}

function ExpenseCategoryGroup10() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[10px] h-[14px] items-center justify-center min-h-px min-w-px relative" data-name="Expense Category Group">
      <div className="bg-[#b2d5ff] rounded-[4px] shrink-0 size-[6px]" data-name="Expense Category Icon" />
      <p className="flex-[1_0_0] font-['Pretendard:Medium',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#18202a] text-[10px]">주거비</p>
    </div>
  );
}

function ExpenseCategoryContainer6() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-[110px]" data-name="Expense Category Container">
      <ExpenseCategoryGroup10 />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18202a] text-[10px] whitespace-nowrap">17.7%</p>
    </div>
  );
}

function ExpenseCategoryGroup11() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[10px] h-[14px] items-center justify-center min-h-px min-w-px relative" data-name="Expense Category Group">
      <div className="bg-[#ffd7aa] rounded-[4px] shrink-0 size-[6px]" data-name="Expense Category Icon" />
      <p className="flex-[1_0_0] font-['Pretendard:Medium',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#18202a] text-[10px]">식비</p>
    </div>
  );
}

function ExpenseCategoryContainer7() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-[110px]" data-name="Expense Category Container">
      <ExpenseCategoryGroup11 />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18202a] text-[10px] whitespace-nowrap">17.7%</p>
    </div>
  );
}

function ExpenseCategoryGroup12() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[10px] h-[14px] items-center justify-center min-h-px min-w-px relative" data-name="Expense Category Group">
      <div className="bg-[#cade9f] rounded-[4px] shrink-0 size-[6px]" data-name="Expense Category Icon" />
      <p className="flex-[1_0_0] font-['Pretendard:Medium',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#18202a] text-[10px]">마트</p>
    </div>
  );
}

function ExpenseCategoryContainer8() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-[110px]" data-name="Expense Category Container">
      <ExpenseCategoryGroup12 />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18202a] text-[10px] whitespace-nowrap">17.7%</p>
    </div>
  );
}

function ExpenseCategoryGroup13() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[10px] h-[14px] items-center justify-center min-h-px min-w-px relative" data-name="Expense Category Group">
      <div className="bg-[#dfc3f7] rounded-[4px] shrink-0 size-[6px]" data-name="Expense Category Icon" />
      <p className="flex-[1_0_0] font-['Pretendard:Medium',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#18202a] text-[10px]">차량</p>
    </div>
  );
}

function ExpenseCategoryContainer9() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-[110px]" data-name="Expense Category Container">
      <ExpenseCategoryGroup13 />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18202a] text-[10px] whitespace-nowrap">17.7%</p>
    </div>
  );
}

function ExpenseCategoryGroup14() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[10px] h-[14px] items-center justify-center min-h-px min-w-px relative" data-name="Expense Category Group">
      <div className="bg-[#f9c6c6] rounded-[4px] shrink-0 size-[6px]" data-name="Expense Category Icon" />
      <p className="flex-[1_0_0] font-['Pretendard:Medium',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#18202a] text-[10px]">세금</p>
    </div>
  );
}

function ExpenseCategoryContainer10() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-[110px]" data-name="Expense Category Container">
      <ExpenseCategoryGroup14 />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18202a] text-[10px] whitespace-nowrap">17.7%</p>
    </div>
  );
}

function ExpenseCategoryGroup15() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[10px] h-[14px] items-center justify-center min-h-px min-w-px relative" data-name="Expense Category Group">
      <div className="bg-[#c4e9e1] rounded-[4px] shrink-0 size-[6px]" data-name="Expense Category Icon" />
      <p className="flex-[1_0_0] font-['Pretendard:Medium',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#18202a] text-[10px]">세금</p>
    </div>
  );
}

function ExpenseCategoryContainer11() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-[110px]" data-name="Expense Category Container">
      <ExpenseCategoryGroup15 />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18202a] text-[10px] whitespace-nowrap">17.7%</p>
    </div>
  );
}

function ExpenseCategoryGroup16() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[10px] h-[14px] items-center justify-center min-h-px min-w-px relative" data-name="Expense Category Group">
      <div className="bg-[#ebebeb] rounded-[4px] shrink-0 size-[6px]" data-name="Expense Category Icon" />
      <p className="flex-[1_0_0] font-['Pretendard:Medium',sans-serif] leading-[normal] min-h-px min-w-px not-italic relative text-[#18202a] text-[10px]">세금</p>
    </div>
  );
}

function ExpenseCategoryContainer12() {
  return (
    <div className="content-stretch flex items-center justify-center relative shrink-0 w-[110px]" data-name="Expense Category Container">
      <ExpenseCategoryGroup16 />
      <p className="font-['Pretendard:Medium',sans-serif] leading-[normal] not-italic relative shrink-0 text-[#18202a] text-[10px] whitespace-nowrap">17.7%</p>
    </div>
  );
}

function ExpenseBreakdownCategoryGroup1() {
  return (
    <div className="content-stretch flex flex-col gap-[2px] items-start relative shrink-0" data-name="Expense Breakdown Category Group">
      <ExpenseCategoryContainer6 />
      <ExpenseCategoryContainer7 />
      <ExpenseCategoryContainer8 />
      <ExpenseCategoryContainer9 />
      <ExpenseCategoryContainer10 />
      <ExpenseCategoryContainer11 />
      <ExpenseCategoryContainer12 />
    </div>
  );
}

function ExpenseBreakdownGroup() {
  return (
    <div className="content-stretch flex items-center relative shrink-0" data-name="Expense Breakdown Group">
      <ExpenseBreakdownCategoryGroup1 />
    </div>
  );
}

function ExpenseBreakdownContainer1() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center relative shrink-0" data-name="Expense Breakdown Container">
      <ExpenseBreakdownGroup />
    </div>
  );
}

function IncomeBreakdownContainer() {
  return (
    <div className="relative shrink-0 w-full" data-name="Income Breakdown Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between pb-[24px] px-[12px] relative w-full">
          <IncomeCategoryBreakdown />
          <ExpenseBreakdownContainer1 />
        </div>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col h-full items-start justify-between min-h-px min-w-px relative" data-name="Container">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#18202a] text-[20px] uppercase whitespace-nowrap">
        <p className="leading-[20px]">income Breakdown</p>
      </div>
      <IncomeBreakdownContainer />
    </div>
  );
}

function BackgroundShadow2() {
  return (
    <div className="bg-white col-2 relative rounded-[24px] row-1 self-stretch shadow-[0px_8px_24px_0px_rgba(25,28,30,0.04)] shrink-0 w-[358.6px]" data-name="Background+Shadow">
      <div className="content-stretch flex items-start p-[24px] relative size-full">
        <Container8 />
      </div>
    </div>
  );
}

function Row2Breakdowns() {
  return (
    <div className="gap-x-[24px] gap-y-[24px] grid grid-cols-[__fit-content(100%)_minmax(0,1fr)] grid-rows-[repeat(1,minmax(0,1fr))] h-[276px] relative shrink-0 w-full" data-name="ROW 2: Breakdowns">
      <BackgroundShadow1 />
      <BackgroundShadow2 />
    </div>
  );
}

function BudgetGoalNavigationItem() {
  return (
    <div className="bg-[#004ea7] content-stretch flex flex-col items-center justify-center relative rounded-[10px] shrink-0 w-[20px]" data-name="Budget Goal Navigation Item">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[14px] text-center text-white uppercase w-full">
        <p className="leading-[16px]">1</p>
      </div>
    </div>
  );
}

function BudgetGoalNavigationItem1() {
  return (
    <div className="bg-[#e6e8f1] content-stretch flex flex-col items-center justify-center relative rounded-[10px] shrink-0 w-[20px]" data-name="Budget Goal Navigation Item">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#18202a] text-[14px] text-center uppercase w-full">
        <p className="leading-[16px]">2</p>
      </div>
    </div>
  );
}

function BudgetGoalNavigationItem2() {
  return (
    <div className="bg-[#e6e8f1] content-stretch flex flex-col items-center justify-center relative rounded-[10px] shrink-0 w-[20px]" data-name="Budget Goal Navigation Item">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#18202a] text-[14px] text-center uppercase w-full">
        <p className="leading-[16px]">3</p>
      </div>
    </div>
  );
}

function BudgetGoalNavigationContainer() {
  return (
    <div className="content-stretch flex gap-[8px] items-center relative shrink-0" data-name="Budget Goal Navigation Container">
      <BudgetGoalNavigationItem />
      <BudgetGoalNavigationItem1 />
      <BudgetGoalNavigationItem2 />
    </div>
  );
}

function Heading3Margin() {
  return (
    <div className="content-stretch flex items-center relative shrink-0 w-full" data-name="Heading 3:margin">
      <div className="flex flex-[1_0_0] flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#18202a] text-[12px] uppercase">
        <p className="leading-[16px]">Budget Goal Progress</p>
      </div>
      <BudgetGoalNavigationContainer />
    </div>
  );
}

function Heading() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Pretendard:SemiBold',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#18202a] text-[14px] w-[114.69px]">
        <p className="leading-[20px]">New Studio Fund</p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Pretendard:Regular',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#6c7b8e] text-[10px] w-[106.34px]">
        <p className="leading-[15px]">Target: ₩250,000,000</p>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[114.69px]" data-name="Container">
      <Heading />
      <Container13 />
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#004ea7] text-[18px] w-[42.16px]">
        <p className="leading-[28px]">64%</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex items-end justify-between pb-[4px] relative shrink-0 w-full" data-name="Container">
      <Container12 />
      <Container14 />
    </div>
  );
}

function Background() {
  return (
    <div className="bg-[#d8e9fd] h-[12px] overflow-clip relative rounded-[9999px] shrink-0 w-full" data-name="Background">
      <div className="absolute bg-[#004ea7] inset-[0_36%_0_0] rounded-[9999px]" data-name="Background" />
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="flex flex-col font-['Pretendard:Medium',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#6c7b8e] text-[10px] w-[102.73px]">
        <p className="leading-[15px]">₩160,000,000 Saved</p>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="flex flex-col font-['Pretendard:Medium',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#6c7b8e] text-[10px] w-[95.67px]">
        <p className="leading-[15px]">₩90,000,000 To go</p>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex h-[15px] items-start justify-between relative shrink-0 w-full" data-name="Container">
      <Container16 />
      <Container17 />
    </div>
  );
}

function Container10() {
  return (
    <div className="col-1 content-stretch flex flex-col gap-[8px] items-start justify-self-stretch relative row-1 self-start shrink-0" data-name="Container">
      <Container11 />
      <Background />
      <Container15 />
    </div>
  );
}

function Heading1() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Heading 4">
      <div className="flex flex-col font-['Pretendard:SemiBold',sans-serif] h-[20px] justify-center leading-[0] not-italic relative shrink-0 text-[#18202a] text-[14px] w-[102.39px]">
        <p className="leading-[20px]">Travel Portfolio</p>
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Pretendard:Regular',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#6c7b8e] text-[10px] w-[98.44px]">
        <p className="leading-[15px]">Target: ₩12,000,000</p>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[102.39px]" data-name="Container">
      <Heading1 />
      <Container21 />
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] h-[28px] justify-center leading-[0] not-italic relative shrink-0 text-[#ff786b] text-[18px] w-[41.72px]">
        <p className="leading-[28px]">88%</p>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="content-stretch flex items-end justify-between pb-[4px] relative shrink-0 w-full" data-name="Container">
      <Container20 />
      <Container22 />
    </div>
  );
}

function Background1() {
  return (
    <div className="bg-[#e0e0e0] h-[12px] overflow-clip relative rounded-[9999px] shrink-0 w-full" data-name="Background">
      <div className="absolute bg-[#ff786b] inset-[0_12%_0_0] rounded-[9999px]" data-name="Background" />
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="flex flex-col font-['Pretendard:Medium',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#6c7b8e] text-[10px] w-[96px]">
        <p className="leading-[15px]">₩10,560,000 Saved</p>
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="content-stretch flex flex-col items-start relative self-stretch shrink-0" data-name="Container">
      <div className="flex flex-col font-['Pretendard:Medium',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#6c7b8e] text-[10px] w-[87.81px]">
        <p className="leading-[15px]">₩1,440,000 To go</p>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="h-[15px] relative shrink-0 w-full" data-name="Container">
      <div className="content-stretch flex items-start justify-between relative size-full">
        <Container24 />
        <Container25 />
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="col-2 content-stretch flex flex-col gap-[8px] items-start justify-self-stretch relative row-1 self-start shrink-0" data-name="Container">
      <Container19 />
      <Background1 />
      <Container23 />
    </div>
  );
}

function Container9() {
  return (
    <div className="gap-x-[48px] gap-y-[48px] grid grid-cols-[repeat(2,minmax(0,1fr))] grid-rows-[repeat(1,fit-content(100%))] relative shrink-0 w-full" data-name="Container">
      <Container10 />
      <Container18 />
    </div>
  );
}

function Row3BudgetGoals() {
  return (
    <div className="bg-white flex-[1_0_0] min-h-px min-w-px relative rounded-[24px] shadow-[0px_8px_24px_0px_rgba(25,28,30,0.04)] w-full" data-name="ROW 3: Budget Goals">
      <div className="flex flex-col items-center overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col items-center justify-between p-[24px] relative size-full">
          <Heading3Margin />
          <Container9 />
        </div>
      </div>
    </div>
  );
}

function LeftColumn() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[24px] h-full items-start min-h-px min-w-px relative" data-name="LEFT COLUMN (70%)">
      <Row2Breakdowns />
      <Row3BudgetGoals />
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-[232.8px]" data-name="Container">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center relative shrink-0 text-[#6c7b8e] text-[12px] w-[16px]">
        <p className="leading-[16px]">01</p>
      </div>
      <div className="flex flex-[1_0_0] flex-col font-['Pretendard:Bold',sans-serif] justify-center min-h-px min-w-px relative text-[#004ea7] text-[14px]">
        <p className="leading-[14px]">카페</p>
      </div>
      <div className="flex flex-col font-['Pretendard:Regular',sans-serif] justify-center relative shrink-0 text-[#004ea7] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">₩1,800,000</p>
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-[232.8px]" data-name="Container">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center relative shrink-0 text-[#6c7b8e] text-[12px] w-[16px]">
        <p className="leading-[16px]">02</p>
      </div>
      <div className="flex flex-[1_0_0] flex-col font-['Pretendard:Bold',sans-serif] justify-center min-h-px min-w-px relative text-[#004ea7] text-[14px]">
        <p className="leading-[14px]">음식점</p>
      </div>
      <div className="flex flex-col font-['Pretendard:Regular',sans-serif] justify-center relative shrink-0 text-[#004ea7] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">₩1,800,000</p>
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-[232.8px]" data-name="Container">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center relative shrink-0 text-[#6c7b8e] text-[12px] w-[16px]">
        <p className="leading-[16px]">03</p>
      </div>
      <div className="flex flex-[1_0_0] flex-col font-['Pretendard:Bold',sans-serif] justify-center min-h-px min-w-px relative text-[#004ea7] text-[14px]">
        <p className="leading-[14px]">관리비</p>
      </div>
      <div className="flex flex-col font-['Pretendard:Regular',sans-serif] justify-center relative shrink-0 text-[#004ea7] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">₩1,800,000</p>
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-[232.8px]" data-name="Container">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center relative shrink-0 text-[#6c7b8e] text-[12px] w-[16px]">
        <p className="leading-[16px]">04</p>
      </div>
      <div className="flex flex-[1_0_0] flex-col font-['Pretendard:Bold',sans-serif] justify-center min-h-px min-w-px relative text-[#004ea7] text-[14px]">
        <p className="leading-[14px]">차량 유지비</p>
      </div>
      <div className="flex flex-col font-['Pretendard:Regular',sans-serif] justify-center relative shrink-0 text-[#004ea7] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">₩1,800,000</p>
      </div>
    </div>
  );
}

function Container30() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-[232.8px]" data-name="Container">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center relative shrink-0 text-[#6c7b8e] text-[12px] w-[16px]">
        <p className="leading-[16px]">05</p>
      </div>
      <div className="flex flex-[1_0_0] flex-col font-['Pretendard:Bold',sans-serif] justify-center min-h-px min-w-px relative text-[#004ea7] text-[14px]">
        <p className="leading-[14px]">세금</p>
      </div>
      <div className="flex flex-col font-['Pretendard:Regular',sans-serif] justify-center relative shrink-0 text-[#004ea7] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">₩1,800,000</p>
      </div>
    </div>
  );
}

function Container31() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-[232.8px]" data-name="Container">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center relative shrink-0 text-[#6c7b8e] text-[12px] w-[16px]">
        <p className="leading-[16px]">06</p>
      </div>
      <div className="flex flex-[1_0_0] flex-col font-['Pretendard:Bold',sans-serif] justify-center min-h-px min-w-px relative text-[#18202a] text-[14px]">
        <p className="leading-[14px]">부모님 용돈</p>
      </div>
      <div className="flex flex-col font-['Pretendard:Regular',sans-serif] justify-center relative shrink-0 text-[#18202a] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">₩1,800,000</p>
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-[232.8px]" data-name="Container">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center relative shrink-0 text-[#6c7b8e] text-[12px] w-[16px]">
        <p className="leading-[16px]">07</p>
      </div>
      <div className="flex flex-[1_0_0] flex-col font-['Pretendard:Bold',sans-serif] justify-center min-h-px min-w-px relative text-[#18202a] text-[14px]">
        <p className="leading-[14px]">용돈</p>
      </div>
      <div className="flex flex-col font-['Pretendard:Regular',sans-serif] justify-center relative shrink-0 text-[#18202a] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">₩1,800,000</p>
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-[232.8px]" data-name="Container">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center relative shrink-0 text-[#6c7b8e] text-[12px] w-[16px]">
        <p className="leading-[16px]">08</p>
      </div>
      <div className="flex flex-[1_0_0] flex-col font-['Pretendard:Bold',sans-serif] justify-center min-h-px min-w-px relative text-[#18202a] text-[14px]">
        <p className="leading-[14px]">카페</p>
      </div>
      <div className="flex flex-col font-['Pretendard:Regular',sans-serif] justify-center relative shrink-0 text-[#18202a] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">₩1,800,000</p>
      </div>
    </div>
  );
}

function Container34() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-[232.8px]" data-name="Container">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center relative shrink-0 text-[#6c7b8e] text-[12px] w-[16px]">
        <p className="leading-[16px]">09</p>
      </div>
      <div className="flex flex-[1_0_0] flex-col font-['Pretendard:Bold',sans-serif] justify-center min-h-px min-w-px relative text-[#18202a] text-[14px]">
        <p className="leading-[14px]">카페</p>
      </div>
      <div className="flex flex-col font-['Pretendard:Regular',sans-serif] justify-center relative shrink-0 text-[#18202a] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">₩1,800,000</p>
      </div>
    </div>
  );
}

function Container35() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-[232.8px]" data-name="Container">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center relative shrink-0 text-[#6c7b8e] text-[12px] w-[16px]">
        <p className="leading-[16px]">10</p>
      </div>
      <div className="flex flex-[1_0_0] flex-col font-['Pretendard:Bold',sans-serif] justify-center min-h-px min-w-px relative text-[#18202a] text-[14px]">
        <p className="leading-[14px]">카페</p>
      </div>
      <div className="flex flex-col font-['Pretendard:Regular',sans-serif] justify-center relative shrink-0 text-[#18202a] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">₩1,800,000</p>
      </div>
    </div>
  );
}

function Container36() {
  return (
    <div className="content-stretch flex gap-[12px] items-center relative shrink-0 w-[232.8px]" data-name="Container">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center relative shrink-0 text-[#6c7b8e] text-[12px] w-[16px]">
        <p className="leading-[16px]">11</p>
      </div>
      <div className="flex flex-[1_0_0] flex-col font-['Pretendard:Bold',sans-serif] justify-center min-h-px min-w-px relative text-[#18202a] text-[14px]">
        <p className="leading-[14px]">카페</p>
      </div>
      <div className="flex flex-col font-['Pretendard:Regular',sans-serif] justify-center relative shrink-0 text-[#18202a] text-[14px] whitespace-nowrap">
        <p className="leading-[20px]">₩1,800,000</p>
      </div>
    </div>
  );
}

function TopSpendingContainer() {
  return (
    <div className="content-stretch flex flex-[1_0_0] flex-col gap-[13px] items-start leading-[0] min-h-px min-w-px not-italic relative w-full" data-name="Top Spending Container">
      <Container26 />
      <Container27 />
      <Container28 />
      <Container29 />
      <Container30 />
      <Container31 />
      <Container32 />
      <Container33 />
      <Container34 />
      <Container35 />
      <Container36 />
    </div>
  );
}

function Container37() {
  return (
    <div className="content-stretch flex gap-[6px] items-center justify-center relative shrink-0" data-name="Container">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#0053b1] text-[12px] whitespace-nowrap">
        <p className="leading-[16px]">DETAILS</p>
      </div>
      <div className="h-[7px] relative shrink-0 w-[4.317px]" data-name="Icon">
        <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 4.31667 7">
          <path d={svgPaths.p35022f90} fill="var(--fill-0, #0053B1)" id="Icon" />
        </svg>
      </div>
    </div>
  );
}

function RightColumn30TopSpending() {
  return (
    <div className="bg-white h-full relative rounded-[24px] shadow-[0px_8px_24px_0px_rgba(25,28,30,0.04)] shrink-0 w-[280.8px]" data-name="RIGHT COLUMN (30%): Top Spending">
      <div className="content-stretch flex flex-col gap-[24px] items-start p-[24px] relative size-full">
        <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] min-w-full not-italic relative shrink-0 text-[#18202a] text-[12px] uppercase w-[min-content]">
          <p className="leading-[16px]">Top Spending</p>
        </div>
        <TopSpendingContainer />
        <Container37 />
      </div>
    </div>
  );
}

function Row23BreakdownGoalsAndTopSpending() {
  return (
    <div className="content-stretch flex flex-[1_0_0] gap-[24px] items-start min-h-px min-w-px relative w-full" data-name="ROW 2 & 3: Breakdown + Goals and Top Spending">
      <LeftColumn />
      <RightColumn30TopSpending />
    </div>
  );
}

function GridLayout() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="GRID LAYOUT">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[24px] items-start pb-[24px] px-[32px] relative size-full">
          <Row1YearlyComparison />
          <Row23BreakdownGoalsAndTopSpending />
        </div>
      </div>
    </div>
  );
}

function MainContentCanvas() {
  return (
    <div className="absolute content-stretch flex flex-col inset-[0_0_0_256px] items-start" data-name="Main - Content Canvas">
      <HeaderSection />
      <GridLayout />
    </div>
  );
}

function Title() {
  return (
    <div className="relative shrink-0 w-full" data-name="Title">
      <div className="content-stretch flex flex-col gap-[4px] items-start leading-[0] not-italic px-[24px] relative text-center w-full">
        <div className="flex flex-col font-['Pretendard:ExtraBold',sans-serif] justify-center relative shrink-0 text-[#5898ff] text-[22px] tracking-[-1px] w-full">
          <p className="leading-[28px]">NOMAD_POCKET</p>
        </div>
        <div className="flex flex-col font-['Pretendard:Regular',sans-serif] justify-center relative shrink-0 text-[#6c7b8e] text-[12px] tracking-[1px] uppercase w-full">
          <p className="leading-[15px]">Financial Precision</p>
        </div>
      </div>
    </div>
  );
}

function Icon({ className }: { className?: string }) {
  return (
    <div className={className || "relative shrink-0 size-[20px]"} data-name="Icon">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
        <div className="absolute inset-[6.67%]" data-name="Vector">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.3333 17.3333">
            <path d={svgPaths.pb4c0000} fill="var(--fill-0, white)" id="Vector" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Link() {
  return (
    <div className="bg-[#33445a] relative rounded-[100px] shrink-0 w-full" data-name="Link">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[24px] py-[12px] relative w-full">
          <Icon />
          <div className="flex flex-col font-['Pretendard:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-white tracking-[-0.4px] whitespace-nowrap">
            <p className="leading-[24px]">Dashboard</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Icon1({ className }: { className?: string }) {
  return (
    <div className={className || "relative shrink-0 size-[20px]"} data-name="Icon">
      <div className="absolute inset-[15.63%]" data-name="Vector">
        <div className="absolute inset-[-3.64%]">
          <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.75 14.75">
            <path d={svgPaths.p2dfcda00} id="Vector" stroke="var(--stroke-0, #6C7B8E)" strokeLinejoin="round" />
          </svg>
        </div>
      </div>
    </div>
  );
}

function Link1() {
  return (
    <div className="relative shrink-0 w-full" data-name="Link">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[24px] py-[12px] relative w-full">
          <Icon1 />
          <div className="flex flex-col font-['Pretendard:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6c7b8e] text-[18px] tracking-[-0.4px] whitespace-nowrap">
            <p className="leading-[24px]">Transactions</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Group() {
  return (
    <div className="absolute inset-[12.5%]" data-name="Group">
      <div className="absolute inset-[-3.33%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 16 16">
          <g id="Group">
            <path d={svgPaths.p46f6530} id="Vector" stroke="var(--stroke-0, #6C7B8E)" strokeLinecap="round" strokeLinejoin="round" />
            <path d={svgPaths.p2f4a8800} id="Vector_2" stroke="var(--stroke-0, #6C7B8E)" strokeLinecap="round" strokeLinejoin="round" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Icon2({ className }: { className?: string }) {
  return (
    <div className={className || "relative shrink-0 size-[20px]"} data-name="Icon">
      <Group />
    </div>
  );
}

function Link2() {
  return (
    <div className="relative shrink-0 w-full" data-name="Link">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[24px] py-[12px] relative w-full">
          <Icon2 />
          <div className="flex flex-col font-['Pretendard:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6c7b8e] text-[18px] tracking-[-0.4px] whitespace-nowrap">
            <p className="leading-[24px]">Budget</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Group1() {
  return (
    <div className="absolute inset-[8.33%]" data-name="Group">
      <div className="absolute inset-[-3%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.6668 17.6668">
          <g id="Group">
            <path d={svgPaths.p2075be00} id="Vector" stroke="var(--stroke-0, #6C7B8E)" />
            <path d={svgPaths.p29d2ac00} id="Vector_2" stroke="var(--stroke-0, #6C7B8E)" />
          </g>
        </svg>
      </div>
    </div>
  );
}

function Icon3({ className }: { className?: string }) {
  return (
    <div className={className || "relative shrink-0 size-[20px]"} data-name="Icon">
      <Group1 />
    </div>
  );
}

function Link3() {
  return (
    <div className="relative shrink-0 w-full" data-name="Link">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[24px] py-[12px] relative w-full">
          <Icon3 />
          <div className="flex flex-col font-['Pretendard:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6c7b8e] text-[18px] tracking-[-0.4px] whitespace-nowrap">
            <p className="leading-[24px]">Manage</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function MainMenu() {
  return (
    <div className="relative shrink-0 w-full" data-name="Main_Menu">
      <div className="content-stretch flex flex-col items-start px-[12px] relative w-full">
        <Link />
        <Link1 />
        <Link2 />
        <Link3 />
      </div>
    </div>
  );
}

function TopMenu() {
  return (
    <div className="content-stretch flex flex-col gap-[36px] items-start relative shrink-0 w-full" data-name="Top Menu">
      <Title />
      <MainMenu />
    </div>
  );
}

function Setting() {
  return (
    <div className="relative shrink-0 w-full" data-name="Setting">
      <div aria-hidden="true" className="absolute border-[#6c7b8e] border-solid border-t inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[16px] py-[12px] relative w-full">
          <div className="h-[20px] relative shrink-0 w-[20.1px]" data-name="Icon">
            <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 20.1 20">
              <path d={svgPaths.p3cdadd00} fill="var(--fill-0, #6C7B8E)" id="Icon" />
            </svg>
          </div>
          <div className="flex flex-col font-['Pretendard:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6c7b8e] text-[16px] tracking-[-0.4px] whitespace-nowrap">
            <p className="leading-[24px]">Settings</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function VersionContainer() {
  return (
    <div className="relative shrink-0" data-name="Version Container">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex gap-[10px] items-center relative">
        <div className="relative shrink-0 size-[10px]" data-name="Icon">
          <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 10 10">
            <path d={svgPaths.p334ceb10} fill="var(--fill-0, #6C7B8E)" id="Icon" />
          </svg>
        </div>
        <div className="flex flex-col font-['Pretendard:Regular',sans-serif] h-[15px] justify-center leading-[0] not-italic relative shrink-0 text-[#6c7b8e] text-[10px] tracking-[-0.4px] w-[24.7px]">
          <p className="leading-[0px]">v1.0.4</p>
        </div>
      </div>
    </div>
  );
}

function AppVersion() {
  return (
    <div className="relative shrink-0 w-full" data-name="App Version">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center px-[18px] relative w-full">
          <VersionContainer />
        </div>
      </div>
    </div>
  );
}

function BottomMenu() {
  return (
    <div className="relative shrink-0 w-full" data-name="Bottom Menu">
      <div className="content-stretch flex flex-col gap-[4px] items-start px-[24px] relative w-full">
        <Setting />
        <AppVersion />
      </div>
    </div>
  );
}

function SideNavBarPanel() {
  return (
    <div className="bg-[#18202a] flex-[1_0_0] h-full min-h-px min-w-px relative rounded-[24px] shadow-[4px_4px_8px_0px_rgba(25,28,30,0.16)]" data-name="SideNavBar Panel">
      <div className="content-stretch flex flex-col items-start justify-between py-[32px] relative size-full">
        <TopMenu />
        <BottomMenu />
      </div>
    </div>
  );
}

function AsideNavigation() {
  return (
    <div className="absolute content-stretch flex h-[1023px] items-center left-0 pl-[24px] py-[24px] top-0 w-[256px]" data-name="Aside_navigation">
      <SideNavBarPanel />
    </div>
  );
}

function Add() {
  return (
    <div className="absolute bottom-[24px] right-[32px] size-[58px]" data-name="Add">
      <div className="absolute inset-[-6.9%_-20.69%_-20.69%_-6.9%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 74 74">
          <g id="Add">
            <g filter="url(#filter0_d_1_782)" id="Ellipse 1">
              <circle cx="33" cy="33" fill="var(--fill-0, #004EA7)" r="29" />
            </g>
            <path d={svgPaths.p361d4300} fill="var(--fill-0, white)" id="+" />
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="74" id="filter0_d_1_782" width="74" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dx="4" dy="4" />
              <feGaussianBlur stdDeviation="4" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.0980392 0 0 0 0 0.109804 0 0 0 0 0.117647 0 0 0 0.16 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1_782" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_1_782" mode="normal" result="shape" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}

export default function Dashboard() {
  return (
    <div className="bg-[#f4f4f7] overflow-clip relative rounded-[32px] size-full" data-name="Dashboard">
      <MainContentCanvas />
      <AsideNavigation />
      <Add />
    </div>
  );
}
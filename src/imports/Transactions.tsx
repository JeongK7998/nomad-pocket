import svgPaths from "./svg-nww7nx4nrz";

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

function Button() {
  return (
    <div className="bg-white content-stretch flex flex-col items-center justify-center px-[24px] py-[8px] relative rounded-[9999px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-[100px]" data-name="Button">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#004ea7] text-[12px] text-center whitespace-nowrap">
        <p className="leading-[16px]">지출</p>
      </div>
    </div>
  );
}

function Button1() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center px-[24px] py-[8px] relative shrink-0 w-[100px]" data-name="Button">
      <div className="flex flex-col font-['Pretendard:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6c7b8e] text-[12px] text-center whitespace-nowrap">
        <p className="leading-[16px]">수입</p>
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
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)]" />
    </div>
  );
}

function Button2() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center px-[24px] py-[8px] relative shrink-0 w-[100px]" data-name="Button">
      <div className="flex flex-col font-['Pretendard:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6c7b8e] text-[12px] text-center whitespace-nowrap">
        <p className="leading-[16px]">YEARLY</p>
      </div>
    </div>
  );
}

function Button3() {
  return (
    <div className="bg-white content-stretch flex flex-col items-center justify-center px-[24px] py-[8px] relative rounded-[9999px] shadow-[0px_1px_2px_0px_rgba(0,0,0,0.05)] shrink-0 w-[100px]" data-name="Button">
      <div className="flex flex-col font-['Pretendard:SemiBold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#004ea7] text-[12px] text-center whitespace-nowrap">
        <p className="leading-[16px]">MONTHLY</p>
      </div>
    </div>
  );
}

function Button4() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center px-[24px] py-[8px] relative shrink-0 w-[100px]" data-name="Button">
      <div className="flex flex-col font-['Pretendard:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6c7b8e] text-[12px] text-center whitespace-nowrap">
        <p className="leading-[16px]">WEEKLY</p>
      </div>
    </div>
  );
}

function Button5() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center px-[24px] py-[8px] relative shrink-0 w-[100px]" data-name="Button">
      <div className="flex flex-col font-['Pretendard:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6c7b8e] text-[12px] text-center whitespace-nowrap">
        <p className="leading-[16px]">DAILY</p>
      </div>
    </div>
  );
}

function Button6() {
  return (
    <div className="content-stretch flex flex-col items-center justify-center px-[24px] py-[8px] relative shrink-0 w-[100px]" data-name="Button">
      <div className="flex flex-col font-['Pretendard:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6c7b8e] text-[12px] text-center whitespace-nowrap">
        <p className="leading-[16px]">CALENDAR</p>
      </div>
    </div>
  );
}

function BackgroundShadow1() {
  return (
    <div className="content-stretch flex items-start p-[4px] relative rounded-[9999px] shrink-0" data-name="Background+Shadow">
      <div aria-hidden="true" className="absolute bg-[#e6e8f1] inset-0 pointer-events-none rounded-[9999px]" />
      <Button2 />
      <Button3 />
      <Button4 />
      <Button5 />
      <Button6 />
      <div className="absolute inset-0 pointer-events-none rounded-[inherit] shadow-[inset_0px_2px_4px_0px_rgba(0,0,0,0.05)]" />
    </div>
  );
}

function WeuiArrowOutlined() {
  return (
    <div className="relative shrink-0 size-[40px]" data-name="weui:arrow-outlined">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 40">
        <g id="weui:arrow-outlined">
          <rect fill="var(--fill-0, #E6E8F1)" height="40" rx="20" width="40" />
          <path d={svgPaths.p33473480} fill="var(--fill-0, #6C7B8E)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function WeuiArrowOutlined1() {
  return (
    <div className="relative shrink-0 size-[40px]" data-name="weui:arrow-outlined">
      <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 40 40">
        <g id="weui:arrow-outlined">
          <rect fill="var(--fill-0, #E6E8F1)" height="40" rx="20" width="40" />
          <path d={svgPaths.p2b810100} fill="var(--fill-0, #6C7B8E)" id="Vector" />
        </g>
      </svg>
    </div>
  );
}

function DateControlPanel() {
  return (
    <div className="content-stretch flex gap-[54px] items-center relative shrink-0" data-name="Date Control Panel">
      <WeuiArrowOutlined />
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[40px] text-black text-center whitespace-nowrap">
        <p className="leading-[normal]">6월</p>
      </div>
      <WeuiArrowOutlined1 />
    </div>
  );
}

function Container4() {
  return (
    <div className="relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex items-center justify-between px-[32px] py-[12px] relative w-full">
          <BackgroundShadow />
          <BackgroundShadow1 />
          <DateControlPanel />
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

function TableHeaderAlignedWithGrid() {
  return (
    <div className="bg-[#18202a] relative shrink-0 w-full" data-name="Table Header (Aligned with Grid)">
      <div aria-hidden="true" className="absolute border-[#f1f5f9] border-b border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex font-['Pretendard:Bold',sans-serif] gap-[12px] items-start leading-[0] not-italic pb-[13px] pt-[12px] px-[24px] relative text-[#e6e8f1] text-[12px] text-center tracking-[0.9px] uppercase w-full">
        <div className="flex flex-col justify-center relative shrink-0 w-[36px]">
          <p className="leading-[13.5px]">일자</p>
        </div>
        <div className="flex flex-col justify-center relative shrink-0 w-[40px]">
          <p className="leading-[13.5px]">구분</p>
        </div>
        <div className="flex flex-col justify-center relative shrink-0 w-[60px]">
          <p className="leading-[13.5px]">대분류</p>
        </div>
        <div className="flex flex-col justify-center relative shrink-0 w-[60px]">
          <p className="leading-[13.5px]">소분류</p>
        </div>
        <div className="flex flex-col justify-center relative shrink-0 w-[160px]">
          <p className="leading-[13.5px]">내역</p>
        </div>
        <div className="flex flex-[1_0_0] flex-col justify-center min-h-px min-w-px relative">
          <p className="leading-[13.5px]">메모</p>
        </div>
        <div className="flex flex-col justify-center relative shrink-0 w-[100px]">
          <p className="leading-[13.5px]">금액</p>
        </div>
      </div>
    </div>
  );
}

function Container5() {
  return (
    <div className="content-stretch flex flex-col font-['Pretendard:Bold',sans-serif] items-center justify-center leading-[0] not-italic relative shrink-0 w-[36px] whitespace-nowrap" data-name="Container">
      <div className="flex flex-col justify-center relative shrink-0 text-[#64748b] text-[14px]">
        <p className="leading-[normal]">12</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 text-[#ff786b] text-[10px]">
        <p className="leading-[normal]">일요일</p>
      </div>
    </div>
  );
}

function MemoContainer() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative rounded-[10px]" data-name="Memo Container">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[12px] relative size-full">
          <div className="flex flex-[1_0_0] flex-col font-['Pretendard:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#18202a] text-[10px]">
            <p className="leading-[normal]">이월 내용</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Container7() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#18202a] text-[12px] text-right whitespace-nowrap">
        <p className="leading-[18px]">₩430,000</p>
      </div>
    </div>
  );
}

function Container6() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[100px]" data-name="Container">
      <Container7 />
    </div>
  );
}

function Row() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Row 1">
      <div aria-hidden="true" className="absolute border-[#d8e9fd] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[24px] py-[8px] relative size-full">
          <Container5 />
          <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#004ea7] text-[10px] text-center w-[40px]">
            <p className="leading-[normal]">고정지출</p>
          </div>
          <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#18202a] text-[10px] text-center w-[60px]">
            <p className="leading-[normal]">주거비</p>
          </div>
          <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#18202a] text-[10px] text-center w-[60px]">
            <p className="leading-[normal]">관리비</p>
          </div>
          <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#18202a] text-[10px] w-[160px]">
            <p className="leading-[normal]">6월 관리비</p>
          </div>
          <MemoContainer />
          <Container6 />
        </div>
      </div>
    </div>
  );
}

function Container8() {
  return (
    <div className="content-stretch flex flex-col font-['Pretendard:Bold',sans-serif] items-center justify-center leading-[0] not-italic relative shrink-0 w-[36px] whitespace-nowrap" data-name="Container">
      <div className="flex flex-col justify-center relative shrink-0 text-[#64748b] text-[14px]">
        <p className="leading-[normal]">14</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 text-[#18202a] text-[10px]">
        <p className="leading-[normal]">월요일</p>
      </div>
    </div>
  );
}

function MemoContainer1() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative rounded-[10px]" data-name="Memo Container">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[12px] relative size-full">
          <div className="flex flex-[1_0_0] flex-col font-['Pretendard:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#18202a] text-[10px]">
            <p className="leading-[normal]">.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Container10() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#18202a] text-[12px] text-right whitespace-nowrap">
        <p className="leading-[18px]">₩330,000</p>
      </div>
    </div>
  );
}

function Container11() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Pretendard:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#64748b] text-[9px] text-right whitespace-nowrap">
        <p className="leading-[13.5px]">$350.20</p>
      </div>
    </div>
  );
}

function Container9() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[100px]" data-name="Container">
      <Container10 />
      <Container11 />
    </div>
  );
}

function Row2() {
  return (
    <div className="relative shrink-0 w-full" data-name="Row 8">
      <div aria-hidden="true" className="absolute border-[#d8e9fd] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[24px] py-[8px] relative w-full">
          <Container8 />
          <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#004ea7] text-[10px] text-center w-[40px]">
            <p className="leading-[normal]">고정지출</p>
          </div>
          <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#18202a] text-[10px] text-center w-[60px]">
            <p className="leading-[normal]">구독료</p>
          </div>
          <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#18202a] text-[10px] text-center w-[60px]">
            <p className="leading-[normal]">AI</p>
          </div>
          <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#18202a] text-[10px] w-[160px]">
            <p className="leading-[normal]">GPT 구독료</p>
          </div>
          <MemoContainer1 />
          <Container9 />
        </div>
      </div>
    </div>
  );
}

function Container12() {
  return (
    <div className="content-stretch flex flex-col font-['Pretendard:Bold',sans-serif] items-center justify-center leading-[0] not-italic opacity-40 relative shrink-0 w-[36px] whitespace-nowrap" data-name="Container">
      <div className="flex flex-col justify-center relative shrink-0 text-[#64748b] text-[14px]">
        <p className="leading-[normal]">17</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 text-[#18202a] text-[10px]">
        <p className="leading-[normal]">수요일</p>
      </div>
    </div>
  );
}

function MemoContainer2() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px opacity-40 relative rounded-[10px]" data-name="Memo Container">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[12px] relative size-full">
          <div className="flex flex-[1_0_0] flex-col font-['Pretendard:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#18202a] text-[10px]">
            <p className="leading-[normal]">54</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Container14() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#18202a] text-[12px] text-right whitespace-nowrap">
        <p className="leading-[18px]">₩30,000</p>
      </div>
    </div>
  );
}

function Container13() {
  return (
    <div className="content-stretch flex flex-col items-start opacity-40 relative shrink-0 w-[100px]" data-name="Container">
      <Container14 />
    </div>
  );
}

function Row3() {
  return (
    <div className="bg-white h-[48px] relative shrink-0 w-full" data-name="Row 9">
      <div aria-hidden="true" className="absolute border-[#d8e9fd] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[24px] py-[8px] relative size-full">
          <Container12 />
          <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic opacity-40 relative shrink-0 text-[#004ea7] text-[10px] text-center w-[40px]">
            <p className="leading-[normal]">고정지출</p>
          </div>
          <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic opacity-40 relative shrink-0 text-[#18202a] text-[10px] text-center w-[60px]">
            <p className="leading-[normal]">통신료</p>
          </div>
          <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic opacity-40 relative shrink-0 text-[#18202a] text-[10px] text-center w-[60px]">
            <p className="leading-[normal]">인터넷</p>
          </div>
          <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic opacity-40 relative shrink-0 text-[#18202a] text-[10px] w-[160px]">
            <p className="leading-[normal]">KT 인터넷 요금</p>
          </div>
          <MemoContainer2 />
          <Container13 />
        </div>
      </div>
    </div>
  );
}

function ScrollableBody() {
  return (
    <div className="relative shrink-0 w-[1044px]" data-name="Scrollable Body">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <Row />
        <Row2 />
        <Row3 />
      </div>
    </div>
  );
}

function MainPortfolioTable() {
  return (
    <div className="bg-white relative rounded-[24px] shrink-0 w-full" data-name="Main Portfolio Table">
      <div className="content-stretch flex flex-col items-start overflow-clip p-px relative rounded-[inherit] w-full">
        <TableHeaderAlignedWithGrid />
        <ScrollableBody />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(226,232,240,0.6)] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_8px_24px_0px_rgba(25,28,30,0.04)]" />
    </div>
  );
}

function TableHeaderAlignedWithGrid1() {
  return (
    <div className="bg-[#18202a] relative shrink-0 w-full" data-name="Table Header (Aligned with Grid)">
      <div aria-hidden="true" className="absolute border-[#f1f5f9] border-b border-solid inset-0 pointer-events-none" />
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex font-['Pretendard:Bold',sans-serif] gap-[12px] items-start leading-[0] not-italic pb-[13px] pt-[12px] px-[24px] relative text-[#e6e8f1] text-[12px] text-center tracking-[0.9px] uppercase w-full">
        <div className="flex flex-col justify-center relative shrink-0 w-[36px]">
          <p className="leading-[13.5px]">일자</p>
        </div>
        <div className="flex flex-col justify-center relative shrink-0 w-[40px]">
          <p className="leading-[13.5px]">구분</p>
        </div>
        <div className="flex flex-col justify-center relative shrink-0 w-[60px]">
          <p className="leading-[13.5px]">대분류</p>
        </div>
        <div className="flex flex-col justify-center relative shrink-0 w-[60px]">
          <p className="leading-[13.5px]">소분류</p>
        </div>
        <div className="flex flex-col justify-center relative shrink-0 w-[160px]">
          <p className="leading-[13.5px]">내역</p>
        </div>
        <div className="flex flex-[1_0_0] flex-col justify-center min-h-px min-w-px relative">
          <p className="leading-[13.5px]">메모</p>
        </div>
        <div className="flex flex-col justify-center relative shrink-0 w-[100px]">
          <p className="leading-[13.5px]">금액</p>
        </div>
      </div>
    </div>
  );
}

function Container15() {
  return (
    <div className="content-stretch flex flex-col font-['Pretendard:Bold',sans-serif] items-center justify-center leading-[0] not-italic relative shrink-0 w-[36px] whitespace-nowrap" data-name="Container">
      <div className="flex flex-col justify-center relative shrink-0 text-[#64748b] text-[14px]">
        <p className="leading-[normal]">12</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 text-[#ff786b] text-[10px]">
        <p className="leading-[normal]">일요일</p>
      </div>
    </div>
  );
}

function MemoContainer3() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative rounded-[10px]" data-name="Memo Container">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[12px] relative size-full">
          <div className="flex flex-[1_0_0] flex-col font-['Pretendard:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#18202a] text-[10px]">
            <p className="leading-[normal]">이월 내용</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Container17() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#18202a] text-[12px] text-right whitespace-nowrap">
        <p className="leading-[18px]">₩430,000</p>
      </div>
    </div>
  );
}

function Container16() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[100px]" data-name="Container">
      <Container17 />
    </div>
  );
}

function Row1() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Row 1">
      <div aria-hidden="true" className="absolute border-[#d8e9fd] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[24px] py-[8px] relative size-full">
          <Container15 />
          <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#004ea7] text-[10px] text-center w-[40px]">
            <p className="leading-[normal]">지출</p>
          </div>
          <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#18202a] text-[10px] text-center w-[60px]">
            <p className="leading-[normal]">주거비</p>
          </div>
          <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#18202a] text-[10px] text-center w-[60px]">
            <p className="leading-[normal]">관리비</p>
          </div>
          <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#18202a] text-[10px] w-[160px]">
            <p className="leading-[normal]">6월 관리비</p>
          </div>
          <MemoContainer3 />
          <Container16 />
        </div>
      </div>
    </div>
  );
}

function Container18() {
  return (
    <div className="content-stretch flex flex-col font-['Pretendard:Bold',sans-serif] items-center justify-center leading-[0] not-italic relative shrink-0 w-[36px] whitespace-nowrap" data-name="Container">
      <div className="flex flex-col justify-center relative shrink-0 text-[#64748b] text-[14px]">
        <p className="leading-[normal]">14</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 text-[#18202a] text-[10px]">
        <p className="leading-[normal]">월요일</p>
      </div>
    </div>
  );
}

function MemoContainer4() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative rounded-[10px]" data-name="Memo Container">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[12px] relative size-full">
          <div className="flex flex-[1_0_0] flex-col font-['Pretendard:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#18202a] text-[10px]">
            <p className="leading-[normal]">.</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Container20() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#18202a] text-[12px] text-right whitespace-nowrap">
        <p className="leading-[18px]">₩330,000</p>
      </div>
    </div>
  );
}

function Container21() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Pretendard:Regular',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#64748b] text-[9px] text-right whitespace-nowrap">
        <p className="leading-[13.5px]">$350.20</p>
      </div>
    </div>
  );
}

function Container19() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[100px]" data-name="Container">
      <Container20 />
      <Container21 />
    </div>
  );
}

function Row4() {
  return (
    <div className="relative shrink-0 w-full" data-name="Row 8">
      <div aria-hidden="true" className="absolute border-[#d8e9fd] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[24px] py-[8px] relative w-full">
          <Container18 />
          <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#004ea7] text-[10px] text-center w-[40px]">
            <p className="leading-[normal]">지출</p>
          </div>
          <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#18202a] text-[10px] text-center w-[60px]">
            <p className="leading-[normal]">구독료</p>
          </div>
          <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#18202a] text-[10px] text-center w-[60px]">
            <p className="leading-[normal]">AI</p>
          </div>
          <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#18202a] text-[10px] w-[160px]">
            <p className="leading-[normal]">GPT 구독료</p>
          </div>
          <MemoContainer4 />
          <Container19 />
        </div>
      </div>
    </div>
  );
}

function Container22() {
  return (
    <div className="content-stretch flex flex-col font-['Pretendard:Bold',sans-serif] items-center justify-center leading-[0] not-italic relative shrink-0 w-[36px] whitespace-nowrap" data-name="Container">
      <div className="flex flex-col justify-center relative shrink-0 text-[#64748b] text-[14px]">
        <p className="leading-[normal]">17</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 text-[#18202a] text-[10px]">
        <p className="leading-[normal]">수요일</p>
      </div>
    </div>
  );
}

function MemoContainer5() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative rounded-[10px]" data-name="Memo Container">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[12px] relative size-full">
          <div className="flex flex-[1_0_0] flex-col font-['Pretendard:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#18202a] text-[10px]">
            <p className="leading-[normal]">54</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Container24() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#18202a] text-[12px] text-right whitespace-nowrap">
        <p className="leading-[18px]">₩30,000</p>
      </div>
    </div>
  );
}

function Container23() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[100px]" data-name="Container">
      <Container24 />
    </div>
  );
}

function Row5() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Row 9">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[24px] py-[8px] relative size-full">
          <Container22 />
          <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#004ea7] text-[10px] text-center w-[40px]">
            <p className="leading-[normal]">지출</p>
          </div>
          <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#18202a] text-[10px] text-center w-[60px]">
            <p className="leading-[normal]">통신료</p>
          </div>
          <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#18202a] text-[10px] text-center w-[60px]">
            <p className="leading-[normal]">인터넷</p>
          </div>
          <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#18202a] text-[10px] w-[160px]">
            <p className="leading-[normal]">KT 인터넷 요금</p>
          </div>
          <MemoContainer5 />
          <Container23 />
        </div>
      </div>
    </div>
  );
}

function Container25() {
  return (
    <div className="content-stretch flex flex-col font-['Pretendard:Bold',sans-serif] items-center justify-center leading-[0] not-italic opacity-0 relative shrink-0 w-[36px] whitespace-nowrap" data-name="Container">
      <div className="flex flex-col justify-center relative shrink-0 text-[#64748b] text-[14px]">
        <p className="leading-[normal]">17</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 text-[#18202a] text-[10px]">
        <p className="leading-[normal]">수요일</p>
      </div>
    </div>
  );
}

function MemoContainer6() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative rounded-[10px]" data-name="Memo Container">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[12px] relative size-full">
          <div className="flex flex-[1_0_0] flex-col font-['Pretendard:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#18202a] text-[10px]">
            <p className="leading-[normal]">54</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Container27() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#18202a] text-[12px] text-right whitespace-nowrap">
        <p className="leading-[18px]">₩30,000</p>
      </div>
    </div>
  );
}

function Container26() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[100px]" data-name="Container">
      <Container27 />
    </div>
  );
}

function Row6() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Row 10">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[24px] py-[8px] relative size-full">
          <Container25 />
          <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#004ea7] text-[10px] text-center w-[40px]">
            <p className="leading-[normal]">지출</p>
          </div>
          <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#18202a] text-[10px] text-center w-[60px]">
            <p className="leading-[normal]">통신료</p>
          </div>
          <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#18202a] text-[10px] text-center w-[60px]">
            <p className="leading-[normal]">인터넷</p>
          </div>
          <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#18202a] text-[10px] w-[160px]">
            <p className="leading-[normal]">KT 인터넷 요금</p>
          </div>
          <MemoContainer6 />
          <Container26 />
        </div>
      </div>
    </div>
  );
}

function Container28() {
  return (
    <div className="content-stretch flex flex-col font-['Pretendard:Bold',sans-serif] items-center justify-center leading-[0] not-italic opacity-0 relative shrink-0 w-[36px] whitespace-nowrap" data-name="Container">
      <div className="flex flex-col justify-center relative shrink-0 text-[#64748b] text-[14px]">
        <p className="leading-[normal]">17</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 text-[#18202a] text-[10px]">
        <p className="leading-[normal]">수요일</p>
      </div>
    </div>
  );
}

function MemoContainer7() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative rounded-[10px]" data-name="Memo Container">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[12px] relative size-full">
          <div className="flex flex-[1_0_0] flex-col font-['Pretendard:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#18202a] text-[10px]">
            <p className="leading-[normal]">54</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Container30() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#18202a] text-[12px] text-right whitespace-nowrap">
        <p className="leading-[18px]">₩30,000</p>
      </div>
    </div>
  );
}

function Container29() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[100px]" data-name="Container">
      <Container30 />
    </div>
  );
}

function Row7() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Row 11">
      <div aria-hidden="true" className="absolute border-[#d8e9fd] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[24px] py-[8px] relative size-full">
          <Container28 />
          <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#004ea7] text-[10px] text-center w-[40px]">
            <p className="leading-[normal]">지출</p>
          </div>
          <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#18202a] text-[10px] text-center w-[60px]">
            <p className="leading-[normal]">통신료</p>
          </div>
          <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#18202a] text-[10px] text-center w-[60px]">
            <p className="leading-[normal]">인터넷</p>
          </div>
          <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#18202a] text-[10px] w-[160px]">
            <p className="leading-[normal]">KT 인터넷 요금</p>
          </div>
          <MemoContainer7 />
          <Container29 />
        </div>
      </div>
    </div>
  );
}

function Container31() {
  return (
    <div className="content-stretch flex flex-col font-['Pretendard:Bold',sans-serif] items-center justify-center leading-[0] not-italic relative shrink-0 w-[36px] whitespace-nowrap" data-name="Container">
      <div className="flex flex-col justify-center relative shrink-0 text-[#64748b] text-[14px]">
        <p className="leading-[normal]">20</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 text-[#5898ff] text-[10px]">
        <p className="leading-[normal]">토요일</p>
      </div>
    </div>
  );
}

function MemoContainer8() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative rounded-[10px]" data-name="Memo Container">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[12px] relative size-full">
          <div className="flex flex-[1_0_0] flex-col font-['Pretendard:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#18202a] text-[10px]">
            <p className="leading-[normal]">54</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Container33() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#18202a] text-[12px] text-right whitespace-nowrap">
        <p className="leading-[18px]">₩30,000</p>
      </div>
    </div>
  );
}

function Container32() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[100px]" data-name="Container">
      <Container33 />
    </div>
  );
}

function Row8() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Row 12">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[24px] py-[8px] relative size-full">
          <Container31 />
          <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#004ea7] text-[10px] text-center w-[40px]">
            <p className="leading-[normal]">지출</p>
          </div>
          <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#18202a] text-[10px] text-center w-[60px]">
            <p className="leading-[normal]">통신료</p>
          </div>
          <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#18202a] text-[10px] text-center w-[60px]">
            <p className="leading-[normal]">인터넷</p>
          </div>
          <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#18202a] text-[10px] w-[160px]">
            <p className="leading-[normal]">KT 인터넷 요금</p>
          </div>
          <MemoContainer8 />
          <Container32 />
        </div>
      </div>
    </div>
  );
}

function Container34() {
  return (
    <div className="content-stretch flex flex-col font-['Pretendard:Bold',sans-serif] items-center justify-center leading-[0] not-italic opacity-0 relative shrink-0 w-[36px] whitespace-nowrap" data-name="Container">
      <div className="flex flex-col justify-center relative shrink-0 text-[#64748b] text-[14px]">
        <p className="leading-[normal]">17</p>
      </div>
      <div className="flex flex-col justify-center relative shrink-0 text-[#18202a] text-[10px]">
        <p className="leading-[normal]">수요일</p>
      </div>
    </div>
  );
}

function MemoContainer9() {
  return (
    <div className="flex-[1_0_0] h-[18px] min-h-px min-w-px relative rounded-[10px]" data-name="Memo Container">
      <div className="flex flex-row items-center justify-center size-full">
        <div className="content-stretch flex items-center justify-center px-[12px] relative size-full">
          <div className="flex flex-[1_0_0] flex-col font-['Pretendard:Regular',sans-serif] justify-center leading-[0] min-h-px min-w-px not-italic relative text-[#18202a] text-[10px]">
            <p className="leading-[normal]">54</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Container36() {
  return (
    <div className="content-stretch flex flex-col items-end relative shrink-0 w-full" data-name="Container">
      <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#18202a] text-[12px] text-right whitespace-nowrap">
        <p className="leading-[18px]">₩30,000</p>
      </div>
    </div>
  );
}

function Container35() {
  return (
    <div className="content-stretch flex flex-col items-start relative shrink-0 w-[100px]" data-name="Container">
      <Container36 />
    </div>
  );
}

function Row9() {
  return (
    <div className="h-[48px] relative shrink-0 w-full" data-name="Row 13">
      <div aria-hidden="true" className="absolute border-[#d8e9fd] border-b border-solid inset-0 pointer-events-none" />
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[24px] py-[8px] relative size-full">
          <Container34 />
          <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#004ea7] text-[10px] text-center w-[40px]">
            <p className="leading-[normal]">지출</p>
          </div>
          <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#18202a] text-[10px] text-center w-[60px]">
            <p className="leading-[normal]">통신료</p>
          </div>
          <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#18202a] text-[10px] text-center w-[60px]">
            <p className="leading-[normal]">인터넷</p>
          </div>
          <div className="flex flex-col font-['Pretendard:Bold',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#18202a] text-[10px] w-[160px]">
            <p className="leading-[normal]">KT 인터넷 요금</p>
          </div>
          <MemoContainer9 />
          <Container35 />
        </div>
      </div>
    </div>
  );
}

function ScrollableBody1() {
  return (
    <div className="relative shrink-0 w-[1044px]" data-name="Scrollable Body">
      <div className="bg-clip-padding border-0 border-[transparent] border-solid content-stretch flex flex-col items-start relative w-full">
        <Row1 />
        <Row4 />
        <Row5 />
        <Row6 />
        <Row7 />
        <Row8 />
        <Row9 />
      </div>
    </div>
  );
}

function MainPortfolioTable1() {
  return (
    <div className="bg-white relative rounded-[24px] shrink-0 w-full" data-name="Main Portfolio Table">
      <div className="content-stretch flex flex-col items-start overflow-clip p-px relative rounded-[inherit] w-full">
        <TableHeaderAlignedWithGrid1 />
        <ScrollableBody1 />
      </div>
      <div aria-hidden="true" className="absolute border border-[rgba(226,232,240,0.6)] border-solid inset-0 pointer-events-none rounded-[24px] shadow-[0px_8px_24px_0px_rgba(25,28,30,0.04)]" />
    </div>
  );
}

function Add() {
  return (
    <div className="absolute bottom-[24px] right-[33px] size-[58px]" data-name="Add">
      <div className="absolute inset-[-6.9%_-20.69%_-20.69%_-6.9%]">
        <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 74 74">
          <g id="Add">
            <g filter="url(#filter0_d_1_844)" id="Ellipse 1">
              <circle cx="33" cy="33" fill="var(--fill-0, #004EA7)" r="29" />
            </g>
            <path d={svgPaths.p361d4300} fill="var(--fill-0, white)" id="+" />
          </g>
          <defs>
            <filter colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse" height="74" id="filter0_d_1_844" width="74" x="0" y="0">
              <feFlood floodOpacity="0" result="BackgroundImageFix" />
              <feColorMatrix in="SourceAlpha" result="hardAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" />
              <feOffset dx="4" dy="4" />
              <feGaussianBlur stdDeviation="4" />
              <feComposite in2="hardAlpha" operator="out" />
              <feColorMatrix type="matrix" values="0 0 0 0 0.0980392 0 0 0 0 0.109804 0 0 0 0 0.117647 0 0 0 0.16 0" />
              <feBlend in2="BackgroundImageFix" mode="normal" result="effect1_dropShadow_1_844" />
              <feBlend in="SourceGraphic" in2="effect1_dropShadow_1_844" mode="normal" result="shape" />
            </filter>
          </defs>
        </svg>
      </div>
    </div>
  );
}

function GridLayout() {
  return (
    <div className="flex-[1_0_0] min-h-px min-w-px relative w-full" data-name="GRID LAYOUT">
      <div className="overflow-clip rounded-[inherit] size-full">
        <div className="content-stretch flex flex-col gap-[24px] items-start pb-[24px] px-[32px] relative size-full">
          <MainPortfolioTable />
          <MainPortfolioTable1 />
          <Add />
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

function Link() {
  return (
    <div className="relative rounded-[100px] shrink-0 w-full" data-name="Link">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[24px] py-[12px] relative w-full">
          <div className="relative shrink-0 size-[20px]" data-name="Icon">
            <div className="bg-clip-padding border-0 border-[transparent] border-solid relative size-full">
              <div className="absolute inset-[6.67%]" data-name="Vector">
                <svg className="absolute block inset-0 size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 17.3333 17.3333">
                  <path d={svgPaths.pb4c0000} fill="var(--fill-0, #6C7B8E)" id="Vector" />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex flex-col font-['Pretendard:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[#6c7b8e] text-[18px] tracking-[-0.4px] whitespace-nowrap">
            <p className="leading-[24px]">Dashboard</p>
          </div>
        </div>
      </div>
    </div>
  );
}

function Link1() {
  return (
    <div className="bg-[#33445a] relative rounded-[100px] shrink-0 w-full" data-name="Link">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[24px] py-[12px] relative w-full">
          <div className="relative shrink-0 size-[20px]" data-name="Icon">
            <div className="absolute inset-[15.63%]" data-name="Vector">
              <div className="absolute inset-[-3.64%]">
                <svg className="block size-full" fill="none" preserveAspectRatio="none" viewBox="0 0 14.75 14.75">
                  <path d={svgPaths.p2dfcda00} id="Vector" stroke="var(--stroke-0, white)" strokeLinejoin="round" />
                </svg>
              </div>
            </div>
          </div>
          <div className="flex flex-col font-['Pretendard:Medium',sans-serif] justify-center leading-[0] not-italic relative shrink-0 text-[18px] text-white tracking-[-0.4px] whitespace-nowrap">
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

function Link2() {
  return (
    <div className="relative shrink-0 w-full" data-name="Link">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[24px] py-[12px] relative w-full">
          <div className="relative shrink-0 size-[20px]" data-name="Icon">
            <Group />
          </div>
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

function Link3() {
  return (
    <div className="relative shrink-0 w-full" data-name="Link">
      <div className="flex flex-row items-center size-full">
        <div className="content-stretch flex gap-[12px] items-center px-[24px] py-[12px] relative w-full">
          <div className="relative shrink-0 size-[20px]" data-name="Icon">
            <Group1 />
          </div>
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

export default function Transactions() {
  return (
    <div className="bg-[#f4f4f7] overflow-clip relative rounded-[32px] size-full" data-name="Transactions">
      <MainContentCanvas />
      <AsideNavigation />
    </div>
  );
}
import { NextRequest, NextResponse } from 'next/server'

type ImportSource = 'sms' | 'image' | 'text'

interface ImportCandidate {
  type: 'expense' | 'income'
  date: string | null
  description: string
  memo: string | null
  amount: number
  currency: string
  categoryName: string | null
  subcategoryName: string | null
  paymentMethodName: string | null
  regionName: string | null
  tagNames: string[]
  confidence: number
}

const responseSchema = {
  type: 'object',
  additionalProperties: false,
  properties: {
    transactions: {
      type: 'array',
      items: {
        type: 'object',
        additionalProperties: false,
        properties: {
          type: { type: 'string', enum: ['expense', 'income'] },
          date: { type: ['string', 'null'] },
          description: { type: 'string' },
          memo: { type: ['string', 'null'] },
          amount: { type: 'number' },
          currency: { type: 'string' },
          categoryName: { type: ['string', 'null'] },
          subcategoryName: { type: ['string', 'null'] },
          paymentMethodName: { type: ['string', 'null'] },
          regionName: { type: ['string', 'null'] },
          tagNames: { type: 'array', items: { type: 'string' } },
          confidence: { type: 'number' },
        },
        required: [
          'type',
          'date',
          'description',
          'memo',
          'amount',
          'currency',
          'categoryName',
          'subcategoryName',
          'paymentMethodName',
          'regionName',
          'tagNames',
          'confidence',
        ],
      },
    },
  },
  required: ['transactions'],
}

function extractOutputText(data: unknown) {
  const root = data as { output_text?: string; output?: Array<{ content?: Array<{ text?: string }> }> }
  if (typeof root.output_text === 'string') return root.output_text
  return root.output
    ?.flatMap((item) => item.content ?? [])
    .map((content) => content.text)
    .filter(Boolean)
    .join('\n') ?? ''
}

function todayKST() {
  return new Intl.DateTimeFormat('sv-SE', {
    timeZone: 'Asia/Seoul',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(new Date())
}

function parseAmount(value: string) {
  const normalized = value.replace(/[^\d.]/g, '')
  const parsed = Number(normalized)
  return Number.isFinite(parsed) ? parsed : 0
}

function regexFallback(text: string): ImportCandidate[] {
  const year = new Date().getFullYear()
  const lines = text.split(/\n+/).map((line) => line.trim()).filter(Boolean)

  return lines.flatMap((line) => {
    const amountMatches = Array.from(line.matchAll(/([\d,]+(?:\.\d+)?)\s*(원|KRW|USD|달러|JPY|엔|円|¥|\$)/g))
    const amountMatch = amountMatches.at(-1)
    if (!amountMatch) return []

    const dateMatch = line.match(/(\d{4})[./-](\d{1,2})[./-](\d{1,2})|(\d{1,2})[./-](\d{1,2})/)
    const date = dateMatch
      ? dateMatch[1]
        ? `${dateMatch[1]}-${dateMatch[2].padStart(2, '0')}-${dateMatch[3].padStart(2, '0')}`
        : `${year}-${dateMatch[4].padStart(2, '0')}-${dateMatch[5].padStart(2, '0')}`
      : todayKST()

    const currencyToken = amountMatch[2] ?? 'KRW'
    const currency = currencyToken.includes('$') || currencyToken.includes('달러') ? 'USD'
      : currencyToken.includes('JPY') || currencyToken.includes('엔') || currencyToken.includes('円') || currencyToken.includes('¥') ? 'JPY'
        : 'KRW'

    const description = line
      .replace(dateMatch?.[0] ?? '', '')
      .replace(amountMatch[0], '')
      .replace(/\[[^\]]+\]/g, '')
      .replace(/승인|사용|출금|입금|결제/g, '')
      .trim() || '자동 입력'

    return [{
      type: /입금|급여|환급|캐시백/.test(line) ? 'income' : 'expense',
      date,
      description,
      memo: line,
      amount: parseAmount(amountMatch[1]),
      currency,
      categoryName: null,
      subcategoryName: null,
      paymentMethodName: line.match(/\[([^\]]+)\]/)?.[1] ?? null,
      regionName: null,
      tagNames: [],
      confidence: 0.55,
    }]
  })
}

export async function POST(request: NextRequest) {
  const body = await request.json().catch(() => null) as {
    source?: ImportSource
    text?: string
    imageDataUrl?: string
  } | null

  const source = body?.source
  const text = body?.text?.trim() ?? ''
  const imageDataUrl = body?.imageDataUrl

  if (!source || !['sms', 'text', 'image'].includes(source)) {
    return NextResponse.json({ error: '지원하지 않는 자동 입력 방식입니다.' }, { status: 400 })
  }
  if (source === 'image' && !imageDataUrl) {
    return NextResponse.json({ error: '분석할 이미지가 없습니다.' }, { status: 400 })
  }
  if (source !== 'image' && !text) {
    return NextResponse.json({ error: '분석할 텍스트가 없습니다.' }, { status: 400 })
  }

  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) {
    if (source === 'image') {
      return NextResponse.json({ error: '사진 OCR에는 OPENAI_API_KEY가 필요합니다.' }, { status: 503 })
    }
    return NextResponse.json({ transactions: regexFallback(text), provider: 'local-regex' })
  }

  const model = process.env.OPENAI_TRANSACTION_IMPORT_MODEL ?? 'gpt-5-mini'
  const prompt = [
    'Nomad Pocket 가계부에 넣을 거래 내역을 추출하세요.',
    '한국어 카드 승인 문자, 은행 문자, 영수증, 카드앱 캡처 이미지에서 거래 후보를 찾습니다.',
    source === 'image' ? '중요: 첨부된 이미지 파일 자체만 분석하세요. 현재 웹앱 UI, 입력 폼, 버튼, 팝업 문구는 거래 후보가 아닙니다.' : '',
    source === 'image' ? 'Nomad Pocket, 자동 입력, 거래 입력, 사진 OCR, 거래 후보 만들기, 저장, 취소 같은 앱 UI 문구는 무시하세요.' : '',
    '이미지 안에 다른 기기 화면, 카드 단말기 화면, 결제 완료 화면이 찍혀 있어도 그 화면의 텍스트를 읽어 거래 후보를 추출하세요.',
    '상호명과 금액이 보이면 날짜가 불확실해도 거래 후보를 1건 이상 생성하세요. 날짜가 없으면 null을 사용하세요.',
    '금액을 숫자로 확정할 수 없는 항목은 transactions에 포함하지 마세요.',
    '결제완료, 승인완료, 결제, 승인, 카드 사용 화면은 expense로 분류하세요.',
    '대분류와 소분류는 확실할 때만 입력하세요. 확실하지 않으면 반드시 null로 두세요.',
    '주거비/관리비는 월세, 집세, 임대료, 관리비처럼 주거 관련 단어가 명확히 보일 때만 사용하세요. 기본값처럼 추측해서 넣지 마세요.',
    '카페, 커피, 음료, 음식점, 편의점 등 일반 결제는 주거비/관리비로 분류하지 마세요.',
    '확실하지 않은 분류는 null로 두고, 금액/날짜/상호명은 가능한 한 보수적으로 추출하세요.',
    `오늘 날짜 기준은 ${todayKST()}이며 연도가 없으면 오늘과 같은 연도를 사용하세요.`,
    '카드 결제/승인/사용은 expense, 급여/입금/환급/이자는 income으로 분류하세요.',
    'currency는 KRW, USD, JPY, EUR, THB, SGD, AUD, IDR 중 하나를 우선 사용하세요.',
    text ? `입력 텍스트:\n${text}` : '',
  ].filter(Boolean).join('\n\n')

  const content: Array<{ type: 'input_text'; text: string } | { type: 'input_image'; image_url: string }> = [
    { type: 'input_text', text: prompt },
  ]
  if (imageDataUrl) content.push({ type: 'input_image', image_url: imageDataUrl })

  const response = await fetch('https://api.openai.com/v1/responses', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model,
      input: [{ role: 'user', content }],
      text: {
        format: {
          type: 'json_schema',
          name: 'transaction_import',
          schema: responseSchema,
          strict: true,
        },
      },
    }),
  })

  if (!response.ok) {
    const message = await response.text()
    if (source !== 'image') {
      return NextResponse.json({
        transactions: regexFallback(text),
        provider: 'local-regex',
        warning: 'OpenAI 분석에 실패해 로컬 문자 파싱으로 후보를 만들었습니다.',
        detail: message,
      })
    }
    const isQuotaError = message.includes('insufficient_quota') || message.includes('exceeded your current quota')
    return NextResponse.json({
      error: isQuotaError
        ? 'OpenAI API 한도 또는 결제 설정 문제로 사진 OCR을 사용할 수 없습니다.'
        : '자동 입력 분석에 실패했습니다.',
      detail: message,
    }, { status: response.status })
  }

  const data = await response.json()
  const outputText = extractOutputText(data)
  const parsed = JSON.parse(outputText) as { transactions: ImportCandidate[] }
  const transactions = parsed.transactions.filter((transaction) =>
    Number.isFinite(Number(transaction.amount)) && Number(transaction.amount) > 0 && transaction.description.trim().length > 0
  )
  return NextResponse.json({ transactions, provider: 'openai', model })
}

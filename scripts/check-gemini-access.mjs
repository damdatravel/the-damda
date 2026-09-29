// Run with GEMINI_API_KEY set in the environment. Never print the key.
const key = process.env.GEMINI_API_KEY
if (!key) {
  console.error('GEMINI_API_KEY 환경변수가 필요합니다.')
  process.exit(1)
}

const url = 'https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash:generateContent'
const contents = [{ role: 'user', parts: [{ text: '안녕하세요. 한 문장으로 답해주세요.' }] }]

for (const [label, tools] of [
  ['기본 호출', undefined],
  ['Google Search 포함', [{ google_search: {} }]],
]) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-goog-api-key': key },
      body: JSON.stringify({ contents, ...(tools ? { tools } : {}) }),
    })
    const result = await response.json()
    if (response.ok) {
      console.log(`${label}: 성공 (${response.status})`)
    } else {
      const error = result?.error ?? {}
      console.log(`${label}: 실패 (HTTP ${response.status}, ${error.status ?? '상태 없음'})`)
      console.log(`  내용: ${error.message ?? '오류 메시지 없음'}`)
      if (response.status === 403) break
    }
  } catch (error) {
    console.error(`${label}: 연결 실패 (${error instanceof Error ? error.message : String(error)})`)
    break
  }
}

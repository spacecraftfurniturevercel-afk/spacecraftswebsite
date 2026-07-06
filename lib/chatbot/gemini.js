const GEMINI_API_KEY = process.env.GEMINI_API_KEY

const INTERACTIONS_URL = 'https://generativelanguage.googleapis.com/v1beta/interactions'
const API_REVISION = '2026-05-20'
const PER_MODEL_TIMEOUT_MS = 12_000

/** Models supported by the Interactions API (gemini-2.0-* is NOT supported there). */
const INTERACTION_MODELS = [
  process.env.GEMINI_MODEL,
  'gemini-2.5-flash-lite',
  'gemini-3.1-flash-lite',
  'gemini-3.5-flash',
  'gemini-2.5-flash',
]
  .filter(Boolean)
  .filter((m) => !/^gemini-2\.0/i.test(m))
  .filter((m) => m !== 'gemini-flash-latest')

/** Legacy generateContent API fallback when Interactions is down. */
const LEGACY_MODELS = ['gemini-2.0-flash-lite', 'gemini-2.0-flash']

const UNIQUE_INTERACTION_MODELS = [...new Set(INTERACTION_MODELS)]
const UNIQUE_LEGACY_MODELS = [...new Set(LEGACY_MODELS)]

const SYSTEM_INSTRUCTION = `You are Spacecrafts Furniture's helpful shopping assistant for spacecraftsfurniture.in (India).
Answer in clear, friendly English. Give complete, helpful replies — do not cut off mid-sentence.
Use ONLY the facts in CONTEXT — never invent products, prices, stock, or store details.
If products are listed in CONTEXT, mention them naturally and encourage the customer to tap the product cards below.
If you cannot help, suggest calling 09003003733 or visiting the store locator page.
Plain text only; no markdown headers.`

function shouldTryNextModel(err) {
  if (!err) return false
  if (err.name === 'TimeoutError' || err.name === 'AbortError') return true
  if (err.retryable) return true
  if (err.status === 400) return true
  return false
}

function isRetryableStatus(status) {
  return status === 429 || status === 503 || status === 500 || status === 502
}

function extractInteractionText(json) {
  const steps = json?.steps || []
  for (let i = steps.length - 1; i >= 0; i -= 1) {
    const step = steps[i]
    if (step.type !== 'model_output') continue
    const text = (step.content || [])
      .filter((block) => block.type === 'text' && block.text)
      .map((block) => block.text)
      .join('')
      .trim()
    if (text) return text
  }
  return null
}

function buildInput({ userMessage, history, context }) {
  const contextBlock = JSON.stringify(context, null, 2)
  const finalUserText = `CONTEXT:\n${contextBlock}\n\nUSER MESSAGE:\n${userMessage}`

  const turns = history.slice(-6).flatMap((m) => {
    if (m.role === 'user') {
      return [{ type: 'user_input', content: [{ type: 'text', text: m.content }] }]
    }
    if (m.role === 'assistant') {
      return [{ type: 'model_output', content: [{ type: 'text', text: m.content }] }]
    }
    return []
  })

  turns.push({ type: 'user_input', content: [{ type: 'text', text: finalUserText }] })
  return turns.length === 1 ? finalUserText : turns
}

function buildLegacyContents({ userMessage, history, context }) {
  const contextBlock = JSON.stringify(context, null, 2)
  return [
    ...history.slice(-6).map((m) => ({
      role: m.role === 'assistant' ? 'model' : 'user',
      parts: [{ text: m.content }],
    })),
    {
      role: 'user',
      parts: [{ text: `CONTEXT:\n${contextBlock}\n\nUSER MESSAGE:\n${userMessage}` }],
    },
  ]
}

async function callInteractionsModel(model, payload) {
  const res = await fetch(INTERACTIONS_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': GEMINI_API_KEY,
      'Api-Revision': API_REVISION,
    },
    signal: AbortSignal.timeout(PER_MODEL_TIMEOUT_MS),
    body: JSON.stringify({
      model,
      system_instruction: SYSTEM_INSTRUCTION,
      input: buildInput(payload),
      generation_config: {
        temperature: 0.6,
        max_output_tokens: 768,
        thinking_level: 'low',
      },
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    const err = new Error(`Gemini Interactions ${model} failed (${res.status})`)
    err.status = res.status
    err.retryable = isRetryableStatus(res.status)
    console.error('[Gemini Interactions]', model, res.status, errText.slice(0, 300))
    throw err
  }

  const json = await res.json()
  if (json.status === 'failed') {
    const err = new Error(json?.error?.message || `Gemini ${model} interaction failed`)
    err.retryable = true
    throw err
  }

  const text = extractInteractionText(json)
  if (!text) {
    const err = new Error(`Gemini ${model} returned empty response`)
    err.retryable = true
    throw err
  }

  return text
}

async function callLegacyModel(model, payload) {
  const url = `https://generativelanguage.googleapis.com/v1beta/models/${model}:generateContent`

  const res = await fetch(url, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-goog-api-key': GEMINI_API_KEY,
    },
    signal: AbortSignal.timeout(PER_MODEL_TIMEOUT_MS),
    body: JSON.stringify({
      systemInstruction: { parts: [{ text: SYSTEM_INSTRUCTION }] },
      contents: buildLegacyContents(payload),
      generationConfig: {
        temperature: 0.6,
        maxOutputTokens: 768,
      },
    }),
  })

  if (!res.ok) {
    const errText = await res.text()
    const err = new Error(`Gemini legacy ${model} failed (${res.status})`)
    err.status = res.status
    err.retryable = isRetryableStatus(res.status)
    console.error('[Gemini Legacy]', model, res.status, errText.slice(0, 300))
    throw err
  }

  const json = await res.json()
  const text = json?.candidates?.[0]?.content?.parts?.[0]?.text?.trim()
  if (!text) {
    const err = new Error(`Gemini legacy ${model} returned empty response`)
    err.retryable = true
    throw err
  }

  return text
}

export async function generateChatReply(payload) {
  if (!GEMINI_API_KEY) {
    throw new Error('GEMINI_API_KEY is not configured')
  }

  let lastError = null

  for (const model of UNIQUE_INTERACTION_MODELS) {
    try {
      return await callInteractionsModel(model, payload)
    } catch (err) {
      lastError = err
      if (shouldTryNextModel(err)) continue
      throw err
    }
  }

  for (const model of UNIQUE_LEGACY_MODELS) {
    try {
      return await callLegacyModel(model, payload)
    } catch (err) {
      lastError = err
      if (shouldTryNextModel(err)) continue
      throw err
    }
  }

  throw lastError || new Error('AI service temporarily unavailable')
}

import { NextResponse } from 'next/server'
import { createSupabaseServerClient } from '../../../lib/supabaseClient'
import { handleChatMessage } from '../../../lib/chatbot/handler'

export const dynamic = 'force-dynamic'

const rateMap = new Map()
const RATE_LIMIT = 30
const RATE_WINDOW_MS = 60_000

function getClientIp(request) {
  return (
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    request.headers.get('x-real-ip') ||
    'unknown'
  )
}

function isRateLimited(ip) {
  const now = Date.now()
  const entry = rateMap.get(ip)
  if (!entry || now - entry.start > RATE_WINDOW_MS) {
    rateMap.set(ip, { start: now, count: 1 })
    return false
  }
  entry.count += 1
  return entry.count > RATE_LIMIT
}

export async function POST(request) {
  try {
    const ip = getClientIp(request)
    if (isRateLimited(ip)) {
      return NextResponse.json({ error: 'Too many messages. Please wait a moment.' }, { status: 429 })
    }

    const body = await request.json()
    const message = (body.message || '').trim()
    const history = Array.isArray(body.history) ? body.history : []

    if (!message) {
      return NextResponse.json({ error: 'Message is required' }, { status: 400 })
    }

    if (message.length > 1000) {
      return NextResponse.json({ error: 'Message is too long' }, { status: 400 })
    }

    const supabase = createSupabaseServerClient()
    const { reply, products, intent, replySource } = await handleChatMessage(supabase, { message, history })

    return NextResponse.json({
      reply,
      products,
      intent,
      replySource,
    })
  } catch (err) {
    console.error('[api/chat]', err)
    return NextResponse.json(
      { error: 'Something went wrong. Please try again or call 09003003733.' },
      { status: 500 }
    )
  }
}

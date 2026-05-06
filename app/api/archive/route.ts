import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

function getClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  )
}

export async function GET() {
  const sb = getClient()
  const { data, error } = await sb
    .from('archive_pins')
    .select('id, image_url, alt, display_order')
    .order('display_order', { ascending: true })
    .order('created_at', { ascending: false })

  if (error) return NextResponse.json({ pins: [] })
  return NextResponse.json({ pins: data ?? [] })
}

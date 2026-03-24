import { NextResponse } from 'next/server'

export const revalidate = 3600 // Cache 1 hour

interface PinterestPin {
  id: string
  title?: string
  alt_text?: string
  media?: {
    media_type: string
    images?: Record<string, { url: string; width: number; height: number }>
  }
}

interface PinterestResponse {
  items: PinterestPin[]
  bookmark?: string
}

export async function GET() {
  const token = process.env.PINTEREST_ACCESS_TOKEN
  const boardId = process.env.PINTEREST_BOARD_ID

  if (!token || !boardId) {
    return NextResponse.json(
      { images: [], configured: false },
      { status: 200 }
    )
  }

  try {
    const res = await fetch(
      `https://api.pinterest.com/v5/boards/${boardId}/pins?page_size=25&fields=id,title,alt_text,media`,
      {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        next: { revalidate: 3600 },
      }
    )

    if (!res.ok) {
      const err = await res.text()
      console.error('Pinterest API error:', res.status, err)
      return NextResponse.json(
        { images: [], configured: true, error: `API ${res.status}` },
        { status: 200 }
      )
    }

    const data: PinterestResponse = await res.json()

    const images = (data.items ?? [])
      .filter((pin) => pin.media?.media_type === 'image')
      .map((pin) => {
        const imgs = pin.media?.images ?? {}
        // Prefer 736x, fallback to 600x, then any available size
        const url =
          imgs['736x']?.url ??
          imgs['600x']?.url ??
          imgs['474x']?.url ??
          Object.values(imgs)[0]?.url ??
          null
        return {
          url,
          alt: pin.alt_text ?? pin.title ?? '',
          id: pin.id,
        }
      })
      .filter((img) => img.url !== null)

    return NextResponse.json({ images, configured: true })
  } catch (error) {
    console.error('Pinterest fetch error:', error)
    return NextResponse.json(
      { images: [], configured: true, error: String(error) },
      { status: 200 }
    )
  }
}

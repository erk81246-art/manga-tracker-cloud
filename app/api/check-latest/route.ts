import { NextResponse } from "next/server";

function cleanHtml(html: string) {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, " ")
    .replace(/<style[\s\S]*?<\/style>/gi, " ")
    .replace(/&nbsp;/g, " ")
    .replace(/&#039;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&amp;/g, "&")
    .replace(/<[^>]+>/g, " ")
    .replace(/\s+/g, " ");
}

function pickLatestChapter(html: string) {
  const text = cleanHtml(html);
  const candidates: number[] = [];

  const patterns = [
    /(?:ตอนที่|ตอน|chapter|chap|ch\.?|episode|ep\.?)\s*[:#-]?\s*(\d+(?:\.\d+)?)/gi,
    /(?:อ่าน|read)\s*(?:ตอนที่|ตอน|chapter|chap|ch\.?)\s*[:#-]?\s*(\d+(?:\.\d+)?)/gi,
    /(?:chapter|chap|ch)-?(\d+(?:\.\d+)?)/gi,
  ];

  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(text + " " + html)) !== null) {
      const n = Number(match[1]);
      if (Number.isFinite(n) && n > 0 && n < 10000) candidates.push(n);
    }
  }

  if (!candidates.length) return null;
  const latest = Math.max(...candidates);
  return Number.isInteger(latest) ? String(latest) : String(latest);
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const targetUrl = String(body?.url || "").trim();

    if (!targetUrl) {
      return NextResponse.json({ error: "ไม่มีลิงก์เว็บ" }, { status: 400 });
    }

    let parsed: URL;
    try {
      parsed = new URL(targetUrl);
    } catch {
      return NextResponse.json({ error: "ลิงก์เว็บไม่ถูกต้อง" }, { status: 400 });
    }

    if (!/^https?:$/.test(parsed.protocol)) {
      return NextResponse.json({ error: "รองรับเฉพาะลิงก์ http/https" }, { status: 400 });
    }

    const hostname = parsed.hostname.replace(/^www\./, "");
    const isGoManga = hostname === "go-manga.com" || hostname.endsWith(".go-manga.com");

    if (!isGoManga) {
      return NextResponse.json({ error: "ตอนนี้รองรับ go-manga.com ก่อน เว็บนี้ยังไม่รองรับ" }, { status: 400 });
    }

    const response = await fetch(targetUrl, {
      headers: {
        "user-agent": "Mozilla/5.0 MangaTracker/1.0",
        "accept": "text/html,application/xhtml+xml",
      },
      next: { revalidate: 0 },
    });

    if (!response.ok) {
      return NextResponse.json({ error: `เปิดเว็บไม่สำเร็จ (${response.status})` }, { status: 502 });
    }

    const html = await response.text();
    const latestChapter = pickLatestChapter(html);

    if (!latestChapter) {
      return NextResponse.json({ error: "หาเลขตอนล่าสุดไม่เจอจากหน้านี้" }, { status: 422 });
    }

    return NextResponse.json({ latestChapter, source: "go-manga.com" });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "เช็กตอนล่าสุดไม่สำเร็จ" }, { status: 500 });
  }
}

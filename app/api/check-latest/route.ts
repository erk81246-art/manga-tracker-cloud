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

function uniqueSortedNumbers(values: number[]) {
  return [...new Set(values)]
    .filter((n) => Number.isFinite(n) && n > 0 && n < 10000)
    .sort((a, b) => b - a);
}

function normalizeChapter(n: number) {
  return Number.isInteger(n) ? String(n) : String(Number(n.toFixed(2)));
}

function extractFromGoManga(html: string) {
  const text = cleanHtml(html);
  const candidates: number[] = [];

  const patterns = [
    /(?:ตอนที่|ตอน|chapter|chap|ch\.?|episode|ep\.?)\s*[:#\-]?\s*(\d+(?:\.\d+)?)/gi,
    /(?:อ่าน|read)\s*(?:ตอนที่|ตอน|chapter|chap|ch\.?)\s*[:#\-]?\s*(\d+(?:\.\d+)?)/gi,
    /(?:chapter|chap|ch)-?(\d+(?:\.\d+)?)/gi,
    /\/(?:chapter|chap|ตอน|ep)[^0-9]{0,8}(\d+(?:\.\d+)?)/gi,
  ];

  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    const target = `${text} ${html}`;
    while ((match = pattern.exec(target)) !== null) {
      candidates.push(Number(match[1]));
    }
  }

  const sorted = uniqueSortedNumbers(candidates);
  return sorted.length ? normalizeChapter(sorted[0]) : null;
}

function extractGenericLatestChapter(html: string) {
  const text = cleanHtml(html);
  const candidates: number[] = [];

  const targets = [
    html,
    text,
    html.match(/<a[\s\S]*?<\/a>/gi)?.join(" ") || "",
    html.match(/<h[1-6][\s\S]*?<\/h[1-6]>/gi)?.join(" ") || "",
  ].join(" ");

  const patterns = [
    /(?:ตอนที่|ตอน|ตอนล่าสุด|ล่าสุด|chapter|chap|ch\.?|episode|ep\.?|read chapter|อ่านตอน)\s*[:#\-]?\s*(\d+(?:\.\d+)?)/gi,
    /(?:chapter|chap|ch|episode|ep)[\s_\-\/]*(\d+(?:\.\d+)?)/gi,
    /(?:ตอน|อ่าน)[\s_\-\/]*(\d+(?:\.\d+)?)/gi,
    /\/(?:chapter|chap|ch|episode|ep|ตอน)[^0-9]{0,12}(\d+(?:\.\d+)?)(?:\/|"|'|\?|#|\s)/gi,
    /(?:data-chapter|data-episode|chapter-num|episode-num)=["']?(\d+(?:\.\d+)?)/gi,
  ];

  for (const pattern of patterns) {
    let match: RegExpExecArray | null;
    while ((match = pattern.exec(targets)) !== null) {
      candidates.push(Number(match[1]));
    }
  }

  const sorted = uniqueSortedNumbers(candidates);

  // กันเลขหลุดจากปี/วัน/ราคา: ถ้าเลขสูงเกินไปแบบ 2024/2025 มักไม่ใช่เลขตอน
  const filtered = sorted.filter((n) => n < 1500);
  const list = filtered.length ? filtered : sorted;

  return list.length ? normalizeChapter(list[0]) : null;
}

function getSupportedMode(hostname: string) {
  if (hostname === "go-manga.com" || hostname.endsWith(".go-manga.com")) {
    return "go-manga";
  }
  return "generic";
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
    const mode = getSupportedMode(hostname);

    const response = await fetch(targetUrl, {
      headers: {
        "user-agent": "Mozilla/5.0 (compatible; MangaTracker/2.2; +https://vercel.app)",
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
        "accept-language": "th-TH,th;q=0.9,en-US;q=0.8,en;q=0.7",
      },
      cache: "no-store",
    });

    if (!response.ok) {
      return NextResponse.json({ error: `เปิดเว็บไม่สำเร็จ (${response.status})` }, { status: 502 });
    }

    const contentType = response.headers.get("content-type") || "";
    if (!contentType.includes("text/html") && !contentType.includes("application/xhtml")) {
      return NextResponse.json({ error: "ลิงก์นี้ไม่ได้ส่งกลับมาเป็นหน้า HTML" }, { status: 422 });
    }

    const html = await response.text();
    const latestChapter = mode === "go-manga"
      ? extractFromGoManga(html)
      : extractGenericLatestChapter(html);

    if (!latestChapter) {
      return NextResponse.json({
        error: mode === "generic"
          ? "เว็บนี้ยังดึงเลขตอนล่าสุดไม่ได้ อาจต้องทำ parser เฉพาะเว็บนี้"
          : "หาเลขตอนล่าสุดไม่เจอจากหน้านี้"
      }, { status: 422 });
    }

    return NextResponse.json({
      latestChapter,
      source: mode === "go-manga" ? "go-manga.com" : hostname,
      mode,
      note: mode === "generic" ? "เช็กด้วย generic parser ถ้าผิดพลาดให้ทำ parser เฉพาะเว็บ" : undefined,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error?.message || "เช็กตอนล่าสุดไม่สำเร็จ" }, { status: 500 });
  }
}

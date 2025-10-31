import { NextRequest, NextResponse } from "next/server";
import spots from "@/data/spots.json";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

/** ============ Helpers chung ============ */
type Addons = { pickup?: boolean; flycam?: boolean; camera360?: boolean };
type Contact = { phone?: string; email?: string; pickupLocation?: string; specialRequest?: string };
type Guest = {
  fullName?: string;
  dob?: string;
  gender?: string;
  idNumber?: string;
  weightKg?: number;
  nationality?: string;
};
type Price = { currency?: string; perPerson?: number; total?: number };

type Payload = {
  location?: string;        // key
  locationName?: string;    // tên hiển thị
  guestsCount?: number;
  dateISO?: string;
  timeSlot?: string;
  contact?: Contact;
  guests?: Guest[];
  addons?: Addons;
  price?: Price;
  createdAt?: string;
};

const ACCEPTED_KEYS_ENV = (process.env.BOOKING_ACCEPTED_KEYS || "")
  .split(",")
  .map(s => s.trim())
  .filter(Boolean);

function acceptedKeys(): string[] {
  return ACCEPTED_KEYS_ENV.length ? ACCEPTED_KEYS_ENV : Object.keys(spots as Record<string, string>);
}
const nameOf = (k?: string, fallback?: string) =>
  (k && (spots as Record<string, string>)[k]) || fallback || (k || "—");

const escapeHtml = (s?: string) =>
  (s || "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

const fmtVND = (n?: number) =>
  typeof n === "number" ? n.toLocaleString("vi-VN", { style: "currency", currency: "VND" }) : "—";

async function sendTelegramToAll(text: string, html = true) {
  const token = process.env.TELEGRAM_BOT_TOKEN || "";
  const ids = (process.env.TELEGRAM_CHAT_IDS || "").split(",").map(s => s.trim()).filter(Boolean);
  if (!token || ids.length === 0) {
    return [{ ok: false, error: "Missing TELEGRAM_BOT_TOKEN or TELEGRAM_CHAT_IDS" }];
  }
  const url = `https://api.telegram.org/bot${token}/sendMessage`;
  const results = [];
  for (const chat_id of ids) {
    try {
      const r = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ chat_id, text, parse_mode: html ? "HTML" : undefined }),
      });
      const j = await r.json();
      results.push({ ok: !!j.ok, chat_id, raw: j });
    } catch (e: any) {
      results.push({ ok: false, chat_id, error: e?.message || String(e) });
    }
  }
  return results;
}

function pickPayload(obj: any): Payload {
  if (obj && typeof obj === "object" && obj.payload && typeof obj.payload === "object") {
    return obj.payload as Payload;
  }
  return (obj || {}) as Payload;
}

/** ============ POST /api/booking/create ============ */
export async function POST(req: NextRequest) {
  try {
    let body: any;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ ok: false, message: "Invalid JSON" }, { status: 400 });
    }
    const raw = pickPayload(body);
    const keys = acceptedKeys();

    // Resolve location key
    let key = (raw.location || "").trim();
    if (!key || !keys.includes(key)) {
      const byName = (raw.locationName || "").trim();
      const found = keys.find(k => nameOf(k) === byName);
      if (found) key = found;
    }
    if (!key || !keys.includes(key)) {
      return NextResponse.json(
        {
          ok: false,
          message: "Invalid location",
          received: String(raw.location || raw.locationName || ""),
          acceptedKeys: keys,
        },
        { status: 400 }
      );
    }

    // Chuẩn hoá payload
    const guestsCount =
      Number.isFinite(raw.guestsCount) && Number(raw.guestsCount) > 0
        ? Number(raw.guestsCount)
        : (raw.guests?.length || 1);

    const createdAt =
      raw.createdAt ||
      new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

    const normalized: Payload = {
      ...raw,
      location: key,
      locationName: nameOf(key, raw.locationName),
      guestsCount,
      createdAt,
    };

    // Build message
    const c = normalized.contact || {};
    const guestLines =
      (normalized.guests || [])
        .map((g, i) => {
          const attrs: string[] = [];
          if (g.dob) attrs.push(`DOB: ${escapeHtml(g.dob)}`);
          if (g.gender) attrs.push(escapeHtml(g.gender));
          if (g.idNumber) attrs.push(`ID: ${escapeHtml(g.idNumber)}`);
          if (typeof g.weightKg === "number") attrs.push(`Wt: ${g.weightKg}kg`);
          if (g.nationality) attrs.push(`QT: ${escapeHtml(g.nationality)}`);
          const details = attrs.length ? ` (${attrs.join(" · ")})` : "";
          return `${i + 1}. ${escapeHtml(g.fullName || "")}${details}`;
        })
        .join("\n") || "—";

    const addonLines: string[] = [];
    if (normalized.addons?.flycam) addonLines.push("• Flycam");
    if (normalized.addons?.camera360) addonLines.push("• Camera 360");
    if (normalized.addons?.pickup) addonLines.push("• Đón trả");

    const perPerson = fmtVND(normalized.price?.perPerson);
    const total = fmtVND(normalized.price?.total);

    const text = [
      `🛒 <b>ĐƠN ĐẶT BAY MỚI</b>`,
      `📍 <b>Điểm:</b> ${escapeHtml(normalized.locationName || "")} (${escapeHtml(key)})`,
      `📅 <b>Thời gian:</b> ${escapeHtml(normalized.dateISO || "")} ${escapeHtml(normalized.timeSlot || "")}`,
      `👥 <b>Số khách:</b> ${normalized.guestsCount}`,
      ``,
      `<b>Liên hệ</b>`,
      `• 📞 ${escapeHtml(c.phone || "")} · ✉️ ${escapeHtml(c.email || "")}`,
      c.pickupLocation ? `• 🚗 Điểm đón: ${escapeHtml(c.pickupLocation)}` : "",
      c.specialRequest ? `• 📝 Y/c đặc biệt: ${escapeHtml(c.specialRequest)}` : "",
      ``,
      `<b>Chi phí</b>`,
      `• Giá/khách (sau giảm): ${perPerson}`,
      addonLines.length ? `• Phụ thu:\n${addonLines.map(l => "   " + l).join("\n")}` : "",
      `• <b>Tổng tạm tính:</b> ${total}`,
      ``,
      `<b>Danh sách khách</b>`,
      guestLines,
      ``,
      `⏱️ ${escapeHtml(createdAt)}`,
    ]
      .filter(Boolean)
      .join("\n");

    // Gửi Telegram
    const results = await sendTelegramToAll(text, true);
    const failed = results.filter(r => r.ok === false);
    if (failed.length) {
      return NextResponse.json(
        { ok: false, message: "Some Telegram messages failed", details: results },
        { status: 502 }
      );
    }

    return NextResponse.json(
      {
        ok: true,
        message: "Đã gửi yêu cầu đặt bay. Chúng tôi sẽ liên hệ sớm!",
        telegram: results.map(r => ({ chat_id: (r as any).chat_id })),
        booking: normalized,
      },
      { status: 201 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { ok: false, message: err?.message || "Internal Server Error" },
      { status: 500 }
    );
  }
}

// app/api/booking/create/route.ts
import { NextResponse } from "next/server";
import { createBooking } from "@/services/booking.service";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

export async function POST(req: Request) {
  try {
    const body = await req.json().catch(() => null);
    if (!body) {
      return NextResponse.json({ ok: false, message: "Invalid JSON" }, { status: 400 });
    }

    const result = await createBooking(body); // validate + gửi Telegram
    return NextResponse.json(
      { ok: true, message: "Đã gửi yêu cầu đặt bay. Chúng tôi sẽ liên hệ sớm!", result },
      { status: 201 }
    );
  } catch (err: any) {
    if (err?.status === 400) {
      return NextResponse.json({ ok: false, message: "Invalid booking", errors: err?.details ?? {} }, { status: 400 });
    }
    console.error("POST /api/booking/create error:", err);
    return NextResponse.json({ ok: false, message: "Internal Server Error" }, { status: 500 });
  }
}

"use client";

import React, { useState } from "react";
import { useBookingStore } from "@/store/booking-store";
import { computePriceByLang, LOCATIONS } from "@/lib/booking/calculate-price";
import { useBookingText, useLangCode, BIGC_THANG_LONG_MAP } from "@/lib/booking/translations-booking";
import { createBooking } from "@/lib/booking/api";
import { notifyTelegram } from "@/lib/booking/chatbot-api";

export default function ReviewConfirmStep() {
  const t = useBookingText();
  const lang = useLangCode();

  const data = useBookingStore((s) => s.data);
  const update = useBookingStore((s) => s.update);
  const back = useBookingStore((s) => s.back);
  const next = useBookingStore((s) => s.next);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | undefined>(undefined);

  const cfg = LOCATIONS[data.location];
  const billInLang = computePriceByLang(
    { location: data.location, guestsCount: data.guestsCount, dateISO: data.dateISO, addons: data.addons },
    lang
  );

  const handleConfirm = async () => {
    setSubmitting(true);
    setError(undefined);

    try {
      // Lấy tên/điện thoại chính để thỏa validate backend
      const primaryName =
        (data as any)?.contact?.fullName?.trim?.() ||
        data?.guests?.[0]?.fullName?.trim?.() ||
        ""; // fallback: khách 1
      const primaryPhone = (data as any)?.contact?.phone?.trim?.() || "";

      // Pre-validate nhẹ phía client để báo lỗi rõ ràng hơn
      const missing: string[] = [];
      if (!primaryName) missing.push("tên liên hệ");
      if (!primaryPhone) missing.push("số điện thoại");
      if (!data?.dateISO) missing.push("ngày bay");
      if (!data?.location) missing.push("điểm bay");
      if (missing.length) {
        throw new Error(`Thiếu ${missing.join(", ")}. Vui lòng bổ sung trước khi xác nhận.`);
      }

      const payload = {
        ...data,
        // các field backend validateBooking() yêu cầu ở cấp gốc:
        name: primaryName,
        phone: primaryPhone,
        date: data.dateISO, // backend kiểm tra input.date (không phải dateISO)
        // khóa + tên hiển thị
        location: data.location,
        locationName: cfg?.name?.[lang] ?? cfg?.name?.vi ?? data.location,
        // “bảng giá” đã tính theo ngôn ngữ
        price: {
          currency: billInLang.currency,
          perPerson: billInLang.totalPerPerson,
          total: billInLang.totalAfterDiscount,
        },
        createdAt: new Date().toISOString(),
      };

      // 1) Tạo booking (server sẽ validate & chuẩn hóa)
      const createResp: any = await createBooking(payload);
      if (!createResp?.ok) {
        const serverMsg = createResp?.message || "Tạo booking thất bại";
        const serverErrs = createResp?.errors ? `\n${JSON.stringify(createResp.errors)}` : "";
        throw new Error(`${serverMsg}${serverErrs}`);
      }

      // 2) Gửi thông báo Telegram (best-effort, không chặn bước tiếp theo nếu lỗi)
      try {
        await notifyTelegram(createResp.booking || payload);
      } catch (tgErr: any) {
        console.warn("⚠️ Gửi Telegram thất bại (không chặn flow):", tgErr?.message || tgErr);
      }

      // Thành công -> sang bước 5
      next();
    } catch (e: any) {
      console.error("❌ Lỗi khi xác nhận:", e);
      setError(e?.message || "Không gửi được yêu cầu. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  };

  const glassWrapperClass =
    "bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg p-5 space-y-6";
  const innerBlockClass =
    "rounded-2xl border border-white/40 p-4 text-sm text-white/90";

  const isHaNoi = data.location === "ha_noi";

  return (
    <div className="space-y-6 text-white">
      <div className={glassWrapperClass}>
        <h3 className="text-lg font-semibold text-white">
          Vui lòng kiểm tra lại thông tin đặt bay
        </h3>

        <div className={innerBlockClass}>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-medium">{t.labels.date}: </span>
              {data.dateISO}
            </div>
            <div>
              <span className="font-medium">{t.labels.timeSlot}: </span>
              {data.timeSlot}
            </div>
            <div>
              <span className="font-medium">{t.labels.location}: </span>
              {cfg?.name?.[lang] ?? cfg?.name?.vi ?? data.location}
            </div>
            <div>
              <span className="font-medium">{t.labels.numGuests}: </span>
              {data.guestsCount}
            </div>
          </div>
        </div>

        <div className={innerBlockClass}>
          <h4 className="font-semibold text-white">{t.labels.contactInfo}</h4>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <span className="font-medium">{t.labels.phone}: </span>
              {data.contact?.phone}
            </div>
            <div>
              <span className="font-medium">{t.labels.email}: </span>
              {data.contact?.email}
            </div>
            {data?.addons?.pickup && isHaNoi && (
              <div className="md:col-span-2">
                <span className="font-medium">{t.labels.pickup}: </span>
                {t.labels.pickupFixed}{" "}
                <a className="text-blue-400 underline" href={BIGC_THANG_LONG_MAP} target="_blank" rel="noreferrer">
                  {t.buttons.viewMap}
                </a>
              </div>
            )}
            {data?.addons?.pickup && !isHaNoi && data.contact?.pickupLocation && (
              <div className="md:col-span-2">
                <span className="font-medium">{t.labels.pickup}: </span>
                {data.contact?.pickupLocation}
              </div>
            )}
            {data.contact?.specialRequest && (
              <div className="md:col-span-2">
                <span className="font-medium">{t.labels.specialRequest}: </span>
                {data.contact?.specialRequest}
              </div>
            )}
          </div>
        </div>

        <div className={innerBlockClass}>
          <h4 className="font-semibold text-white">{t.labels.passengerList}</h4>
          <div className="mt-2 space-y-2">
            {(data.guests ?? []).map((g: any, i: number) => (
              <div key={i} className="rounded-lg border border-white/40 p-3 text-white/80">
                <div>
                  <span className="font-medium">Khách {i + 1}:</span> {g.fullName}
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                  <div>{t.labels.dob}: {g.dob}</div>
                  <div>{t.labels.gender}: {g.gender}</div>
                  {g.idNumber && <div>{t.labels.idNumber}: {g.idNumber}</div>}
                  {g.weightKg && <div>{t.labels.weightKg}: {g.weightKg} kg</div>}
                  {g.nationality && <div>{t.labels.nationality}: {g.nationality}</div>}
                </div>
              </div>
            ))}
          </div>
        </div>

        <label className="flex items-start gap-3">
          <input
            type="checkbox"
            checked={data.acceptedTerms}
            onChange={(e) => update({ acceptedTerms: e.target.checked })}
            className="mt-1 h-4 w-4 accent-green-500"
          />
          <span className="text-sm text-white">
            {t.labels.termsText}{" "}
            <a className="text-blue-400 underline" href="/terms" target="_blank" rel="noreferrer">
              {t.labels.viewTerms}
            </a>
          </span>
        </label>
      </div>

      {error && (
        <div className="text-sm text-white bg-red-900/40 border border-red-500/60 rounded-lg p-3 backdrop-blur-sm">
          {error}
        </div>
      )}

      <div className="flex justify-between">
        <button
          onClick={back}
          className="px-4 py-2 rounded-xl border border-white/40 bg-black/30 text-white hover:bg-black/50 transition backdrop-blur-sm"
        >
          {t.buttons.back}
        </button>
        <button
          disabled={!data.acceptedTerms || submitting}
          onClick={handleConfirm}
          className="px-5 py-2 rounded-xl bg-green-600 text-white font-semibold hover:bg-green-700 disabled:opacity-50 transition"
        >
          {submitting ? t.buttons.processing : t.buttons.confirm}
        </button>
      </div>
    </div>
  );
}

"use client";

import React from "react";
import type { BookingData } from "@/store/booking-store";
import {
  LOCATIONS,
  formatByLang,
  type AddonKey,
  type ComputeResult,
} from "@/lib/booking/calculate-price";
import type { LangCode } from "@/lib/booking/translations-booking";

const ADDON_KEYS: AddonKey[] = ["pickup", "flycam", "camera360"];

type Props = {
  booking: BookingData;
  totals: ComputeResult;
  lang: LangCode;
  bookingResult?: any;
};

export default function BookingTicket({ booking, totals, lang, bookingResult }: Props) {
  const cfg = LOCATIONS[booking.location];
  const contact = booking.contact;

  const fallbackRef = React.useMemo(
    () => `MBL-${Math.random().toString(36).slice(2, 8).toUpperCase()}`,
    []
  );

  const bookingRef =
    bookingResult?.id ||
    bookingResult?._id ||
    bookingResult?.bookingId ||
    bookingResult?.code ||
    fallbackRef;

  const createdAt =
    bookingResult?.createdAt ||
    bookingResult?.createdAtISO ||
    new Date().toLocaleString("vi-VN", { timeZone: "Asia/Ho_Chi_Minh" });

  const locationName =
    bookingResult?.locationName || cfg.name[lang] || cfg.name.vi;

  const addons = ADDON_KEYS.map((k) => {
    const qty = totals.addonsQty[k] || 0;
    const unit = totals.addonsUnitPrice[k] || 0;
    const total = totals.addonsTotal[k] || 0;
    const label = cfg.addons[k]?.label?.[lang] ?? cfg.addons[k]?.label?.vi ?? k;
    return { k, qty, unit, total, label };
  }).filter((a) => a.qty > 0);

  const pickupSelected = (totals.addonsQty.pickup || 0) > 0;

  return (
    <div className="w-full bg-white text-slate-900 rounded-2xl p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm uppercase tracking-wider text-slate-500">
            MEBAYLUON PARAGLIDING
          </div>
          <h2 className="text-2xl font-bold leading-tight">
            E-Ticket / Vé đặt bay
          </h2>
          <p className="text-sm text-slate-500 mt-1">Created: {createdAt}</p>
        </div>

        <div className="text-right">
          <div className="text-xs text-slate-500">Booking Ref</div>
          <div className="font-mono font-semibold">{bookingRef}</div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="text-xs uppercase tracking-wider text-slate-500">Flight</div>
          <div className="mt-2 space-y-1 text-sm">
            <div>
              <span className="font-semibold">Location:</span> {locationName}
            </div>
            <div>
              <span className="font-semibold">Date:</span> {booking.dateISO || "—"}
            </div>
            <div>
              <span className="font-semibold">Time:</span> {booking.timeSlot || "—"}
            </div>
            <div>
              <span className="font-semibold">Guests:</span> {booking.guestsCount}
            </div>
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <div className="text-xs uppercase tracking-wider text-slate-500">Contact</div>
          <div className="mt-2 space-y-1 text-sm">
            <div>
              <span className="font-semibold">Phone:</span> {contact?.phone || "—"}
            </div>
            <div>
              <span className="font-semibold">Email:</span> {contact?.email || "—"}
            </div>
            {pickupSelected && (
              <div>
                <span className="font-semibold">Pickup:</span>{" "}
                {booking.location === "ha_noi" ? "BigC Thăng Long" : contact?.pickupLocation || "—"}
              </div>
            )}
            {contact?.specialRequest && (
              <div>
                <span className="font-semibold">Note:</span> {contact.specialRequest}
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="mt-4 rounded-xl border border-slate-200 p-4">
        <div className="text-xs uppercase tracking-wider text-slate-500">Passengers</div>
        <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
          {(booking.guests || []).length ? (
            booking.guests.map((g, i) => (
              <div key={i} className="rounded-lg bg-slate-50 p-3">
                <div className="font-semibold">
                  {i + 1}. {g.fullName || "—"}
                </div>
                <div className="text-xs text-slate-500">
                  {g.gender ? `${g.gender}` : ""}
                  {g.dob ? ` · ${g.dob}` : ""}
                  {g.nationality ? ` · ${g.nationality}` : ""}
                </div>
              </div>
            ))
          ) : (
            <div className="text-slate-500">—</div>
          )}
        </div>
      </div>

      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-xl border border-slate-200 p-4">
          <div className="text-xs uppercase tracking-wider text-slate-500">Add-on services</div>
          <div className="mt-2 space-y-2 text-sm">
            {addons.length ? (
              addons.map((a) => (
                <div key={a.k} className="flex items-center justify-between">
                  <div>
                    <div className="font-medium">{a.label}</div>
                    <div className="text-xs text-slate-500">
                      {formatByLang(lang, a.unit, a.unit)} /{" "}
                      {lang === "vi" ? "khách" : "pax"} × {a.qty}
                    </div>
                  </div>
                  <div className="font-semibold">{formatByLang(lang, a.total, a.total)}</div>
                </div>
              ))
            ) : (
              <div className="text-slate-500">{lang === "vi" ? "Không có" : "None"}</div>
            )}
          </div>
        </div>

        <div className="rounded-xl border border-slate-200 p-4">
          <div className="text-xs uppercase tracking-wider text-slate-500">Price</div>
          <div className="mt-2 space-y-2 text-sm">
            <div className="flex justify-between">
              <span>{lang === "vi" ? "Giá cơ bản" : "Base price"}</span>
              <span className="font-medium">
                {formatByLang(lang, totals.baseTotal, totals.baseTotal)}
              </span>
            </div>

            {totals.discountTotal > 0 && (
              <div className="flex justify-between">
                <span>{lang === "vi" ? "Giảm theo nhóm" : "Group discount"}</span>
                <span className="font-medium">
                  -{formatByLang(lang, totals.discountTotal, totals.discountTotal)}
                </span>
              </div>
            )}

            {totals.addonsGrandTotal > 0 && (
              <div className="flex justify-between">
                <span>{lang === "vi" ? "Dịch vụ thêm" : "Add-ons"}</span>
                <span className="font-medium">
                  {formatByLang(lang, totals.addonsGrandTotal, totals.addonsGrandTotal)}
                </span>
              </div>
            )}

            <div className="border-t border-slate-200 pt-2 flex justify-between text-base">
              <span className="font-semibold">{lang === "vi" ? "Tổng cộng" : "Total"}</span>
              <span className="font-bold">
                {formatByLang(lang, totals.totalAfterDiscount, totals.totalAfterDiscount)}
              </span>
            </div>

            <div className="text-xs text-slate-500">
              {lang === "vi"
                ? "* Vui lòng có mặt trước 15 phút để briefing an toàn."
                : "* Please arrive 15 minutes early for safety briefing."}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

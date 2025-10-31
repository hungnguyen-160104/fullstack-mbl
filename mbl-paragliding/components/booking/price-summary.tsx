"use client";
import React from "react";
import { useBookingStore } from "@/store/booking-store";
import {
  LOCATIONS,
  computePriceByLang,
  formatByLang,
} from "@/lib/booking/calculate-price";
import { useLangCode, useBookingText } from "@/lib/booking/translations-booking";
import type { AddonKey } from "@/lib/booking/calculate-price"; // <-- thêm dòng này

export default function PriceSummary() {
  const t = useBookingText();
  const lang = useLangCode();
  const data = useBookingStore((s) => s.data);

  const totals = computePriceByLang(
    {
      location: data.location,
      guestsCount: data.guestsCount,
      dateISO: data.dateISO,
      addons: data.addons,
    },
    lang
  );

  const cfg = LOCATIONS[data.location];

  // 👇 QUAN TRỌNG: ép kiểu entries để k có 'any'
  const addonEntries = Object.entries(
    totals.addonsPerPerson
  ) as [AddonKey, number][];

  return (
    <div className="rounded-2xl bg-white/15 backdrop-blur-md border border-white/20 shadow-xl p-6 text-white">
      <h3 className="text-xl font-semibold mb-4">{t.labels.priceSummary}</h3>

      <div className="space-y-2 text-sm">
        <div className="flex justify-between">
          <span>{t.labels.location}</span>
          <span>{cfg.name[lang] ?? cfg.name.vi}</span>
        </div>
        <div className="flex justify-between">
          <span>{t.labels.numGuests}</span>
          <span>{data.guestsCount}</span>
        </div>

        <div className="border-t border-white/30 my-2" />

        <div className="flex justify-between">
          <span>{t.labels.basePricePerGuest}</span>
          <span>{formatByLang(lang, totals.basePricePerPerson, totals.basePricePerPerson)}</span>
        </div>

        {/* 👇 Không còn lỗi ts7053 nữa */}
        {addonEntries
          .filter(([, v]) => v > 0)
          .map(([k, v]: [AddonKey, number]) => (
            <div key={k} className="flex justify-between">
              <span>
                {t.labels.addonSurcharge(
                  cfg.addons[k].label[lang] ?? cfg.addons[k].label.vi
                )}
              </span>
              <span>
                {formatByLang(lang, v, v)} / {lang === "vi" ? "khách" : "pax"}
              </span>
            </div>
          ))}

        {totals.discountPerPerson > 0 && (
          <div className="flex justify-between text-white">
            <span>{t.labels.groupDiscount}</span>
            <span>
              -{formatByLang(lang, totals.discountPerPerson, totals.discountPerPerson)} / {lang === "vi" ? "khách" : "pax"}
            </span>
          </div>
        )}

        <div className="border-t border-white/30 my-2" />
        <div className="flex justify-between font-semibold text-lg">
          <span>{t.labels.provisionalTotal}</span>
          <span>{formatByLang(lang, totals.totalAfterDiscount, totals.totalAfterDiscount)}</span>
        </div>
      </div>

      <p className="text-xs text-white/80 mt-3">* {t.messages.groupPromoAuto}</p>
    </div>
  );
}

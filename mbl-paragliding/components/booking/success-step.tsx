"use client";
import React from "react";
import { useBookingStore } from "@/store/booking-store";
import { LOCATIONS } from "@/lib/booking/calculate-price";
import { useBookingText } from "@/lib/booking/translations-booking";

export default function SuccessStep() {
  const t = useBookingText();
  const data = useBookingStore((s) => s.data);
  const reset = useBookingStore((s) => s.reset);
  const cfg = LOCATIONS[data.location];

  const zaloQR = process.env.NEXT_PUBLIC_ZALO_QR_URL;
  const whatsappQR = process.env.NEXT_PUBLIC_WHATSAPP_QR_URL;

  const glassWrapperClass =
    "bg-white/10 backdrop-blur-md border border-white/20 rounded-2xl shadow-lg p-5 space-y-6";
  const innerBlockClass = "rounded-2xl border border-white/40 p-4 text-center";
  const mapButtonStyle =
    "inline-flex items-center justify-center px-2 py-1 ml-2 rounded-md bg-red-600 text-white text-xs font-semibold hover:bg-red-700 transition";

  return (
    <div className="space-y-6 text-white">
      <div className={glassWrapperClass}>
        <h3 className="text-lg font-semibold text-white">{t.messages.successTitle}</h3>
        <p className="text-white/90">{t.messages.successBody}</p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {zaloQR && (
            <div className={innerBlockClass}>
              <div className="font-medium text-white">QR Zalo</div>
              <img src={zaloQR} alt="Zalo QR" className="mx-auto mt-2 max-h-64 rounded-lg" />
            </div>
          )}
          {whatsappQR && (
            <div className={innerBlockClass}>
              <div className="font-medium text-white">QR WhatsApp</div>
              <img src={whatsappQR} alt="WhatsApp QR" className="mx-auto mt-2 max-h-64 rounded-lg" />
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-white/40 p-4">
          <h4 className="font-semibold text-white">{t.messages.preflightTitle}</h4>
          <ol className="list-decimal ml-5 mt-2 space-y-1 text-sm text-white/80">
            <li>{t.messages.preflightNotes[0]}</li>
            <li>{t.messages.preflightNotes[1]}</li>
            <li>
              {t.messages.preflightNotes[2]}
              {cfg.coordinates?.takeoff && (
                <>
                  {" "}Cất cánh:
                  <a className={mapButtonStyle} href={cfg.coordinates.takeoff} target="_blank" rel="noreferrer">
                    {t.buttons.viewMap}
                  </a>
                </>
              )}
              {cfg.coordinates?.landing && (
                <>
                  {" "}• Hạ cánh:
                  <a className={mapButtonStyle} href={cfg.coordinates.landing} target="_blank" rel="noreferrer">
                    {t.buttons.viewMap}
                  </a>
                </>
              )}
              {cfg.coordinates?.pickup && (
                <>
                  {" "}• Điểm đón (HN):
                  <a className={mapButtonStyle} href={cfg.coordinates.pickup} target="_blank" rel="noreferrer">
                    {t.buttons.viewMap}
                  </a>
                </>
              )}
            </li>
          </ol>
        </div>
      </div>

      <div className="flex justify-end">
        <button 
          onClick={reset} 
          className="px-5 py-2 rounded-xl border border-white/40 bg-black/30 text-white hover:bg-black/50 transition backdrop-blur-sm"
        >
          {t.buttons.startOver}
        </button>
      </div>
    </div>
  );
}

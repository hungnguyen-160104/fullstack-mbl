// mbl-paragliding/lib/booking/api.ts
import api from "@/lib/api";

export async function getLocations() {
  return api<{ ok: boolean; items: Array<{ key: string; name: string }> }>("/api/booking/locations");
}

export async function createBooking(payload: any) {
  return api<{ ok: boolean; booking: any }>("/api/booking/create", {
    method: "POST",
    body: JSON.stringify(payload),
  });
}

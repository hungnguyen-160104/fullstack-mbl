"use client";

import { create } from "zustand";
import type { LocationKey } from "@/lib/booking/calculate-price";

export type Gender = "Nam" | "Nữ" | "Khác";

export interface Guest {
  fullName: string;
  dob: string; // yyyy-mm-dd
  gender: Gender;
  idNumber?: string;
  weightKg?: number;
  nationality?: string;
}

export interface ContactInfo {
  phone: string;
  email: string;
  pickupLocation?: string;
  specialRequest?: string;
}

export interface BookingData {
  location: LocationKey;
  guestsCount: number;
  addons: { pickup?: boolean; flycam?: boolean; camera360?: boolean };
  dateISO?: string;
  timeSlot?: string; // "07:00" .. "18:00"
  contact?: ContactInfo;
  guests: Guest[];
  acceptedTerms: boolean;
}

type Step = 1 | 2 | 3 | 4 | 5;

interface StoreState {
  step: Step;
  data: BookingData;
  next: () => void;
  back: () => void;
  reset: () => void;
  update: (partial: Partial<BookingData>) => void;
  setGuestsCount: (n: number) => void;
  setGuest: (idx: number, guest: Partial<Guest>) => void;
  setContact: (partial: Partial<ContactInfo>) => void; // <- thêm
}

const defaultData: BookingData = {
  location: "sapa",
  guestsCount: 1,
  addons: {},
  dateISO: "",
  timeSlot: "",
  contact: { phone: "", email: "", pickupLocation: "", specialRequest: "" },
  guests: [],
  acceptedTerms: false,
};

const emptyContact: ContactInfo = {
  phone: "",
  email: "",
  pickupLocation: "",
  specialRequest: "",
};

const clampStep = (n: number): Step => (n < 1 ? 1 : n > 5 ? 5 : (n as Step));

export const useBookingStore = create<StoreState>()((set, get) => ({
  step: 1,
  data: defaultData,

  next: () => set((s) => ({ step: clampStep(s.step + 1) })),
  back: () => set((s) => ({ step: clampStep(s.step - 1) })),
  reset: () => set({ step: 1, data: { ...defaultData } }),

  update: (partial) =>
    set((s) => ({
      data: { ...s.data, ...partial },
    })),

  setGuestsCount: (n) =>
    set((s) => {
      const count = Math.max(1, Math.min(10, n || 1));
      const guests = Array.from({ length: count }).map(
        (_, i): Guest =>
          s.data.guests[i] || {
            fullName: "",
            dob: "",
            gender: "Nam",
            idNumber: "",
            weightKg: undefined,
            nationality: "",
          }
      );
      return { data: { ...s.data, guestsCount: count, guests } };
    }),

  setGuest: (idx, guest) =>
    set((s) => {
      const guests = [...(s.data.guests || [])];
      const current = guests[idx] ?? {
        fullName: "",
        dob: "",
        gender: "Nam" as const,
      };
      guests[idx] = { ...current, ...guest };
      return { data: { ...s.data, guests } };
    }),

  setContact: (partial) =>
    set((s) => ({
      data: {
        ...s.data,
        contact: { ...(s.data.contact ?? emptyContact), ...partial },
      },
    })),
}));

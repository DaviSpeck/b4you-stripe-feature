import { create } from "zustand";

interface iUseKonduto {
  visitorId: null | string;
}

export const useKonduto = create<iUseKonduto>(() => ({
  visitorId: null,
}));

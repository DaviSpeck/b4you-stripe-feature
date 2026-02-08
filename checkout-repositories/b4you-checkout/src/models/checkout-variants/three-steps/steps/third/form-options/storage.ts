import { create } from "zustand";

interface iProps {
  isFormError: boolean;
}

export const formErrorStorage = create<iProps>(() => ({
  isFormError: false,
}));

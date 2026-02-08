import { z } from "zod";
import { create } from "zustand";
import { FormAddressInfoValidation } from "./address-info/_schema";
import { FormUserInfoValidation } from "./user-info/_schema";

type useCheckoutStorageType = {
  userInfo: z.infer<typeof FormUserInfoValidation> | null;
  addressInfo: z.infer<typeof FormAddressInfoValidation> | null;
  userInfoError: boolean;
  addressInfoError: boolean;
};

export const useCheckoutStorage = create<useCheckoutStorageType>(() => ({
  userInfo: null,
  addressInfo: null,
  userInfoError: true,
  addressInfoError: true,
}));

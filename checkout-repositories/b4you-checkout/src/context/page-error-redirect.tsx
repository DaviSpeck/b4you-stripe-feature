import { useRouter } from "next/router";
import { createContext, ReactNode, useContext, useEffect } from "react";
import { create } from "zustand";
import { useOfferPayment } from "@/hooks/states/checkout";

interface iStore {
  isServerError: boolean;
}

export const useErrorStore = create<iStore>(() => ({
  isServerError: false,
}));

const context = createContext({});

interface iProps {
  children: ReactNode;
}

export function PageErrorObserverProvider(props: iProps) {
  const { children } = props;

  const { isServerError } = useErrorStore();
  const { set: setOfferPayment } = useOfferPayment();

  const router = useRouter();

  useEffect(() => {
    useErrorStore.setState({ isServerError: false });
  }, []);

  useEffect(() => {
    if (router.asPath === "/500" || !isServerError) return;
    setOfferPayment({ isPaying: false });
    router.push("/500");
  }, [isServerError]);

  return <context.Provider value={{}}>{children}</context.Provider>;
}

export const useErrorPageObserver = () => useContext(context);

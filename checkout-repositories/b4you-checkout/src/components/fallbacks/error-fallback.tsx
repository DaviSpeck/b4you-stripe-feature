"use client";

import { useEffect } from "react";
import { useErrorStore } from "@/context/page-error-redirect";

export function ErrorFallback() {
    const setServerError = useErrorStore.setState;

    useEffect(() => {
        setServerError({ isServerError: true });
    }, []);

    return null;
}
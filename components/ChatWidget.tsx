"use client";
import { useEffect, useState } from "react";
import dynamicImport from "next/dynamic";

// Lazy-load the inner chat widget so missing CopilotKit exports don't crash
const LazyInner = dynamicImport(() => import("./ChatWidgetInner"), {
  ssr: false,
  loading: () => null,
});

export default function ChatWidget() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  return mounted ? <LazyInner /> : null;
}

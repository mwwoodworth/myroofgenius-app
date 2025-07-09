"use client";
import { useEffect, useState } from "react";

export default function StreamingText({ text }: { text: string }) {
  const [display, setDisplay] = useState("");
  useEffect(() => {
    const words = text.split(/\s+/);
    let i = 0;
    setDisplay("");
    const id = setInterval(() => {
      i++;
      setDisplay(words.slice(0, i).join(" "));
      if (i >= words.length) clearInterval(id);
    }, 40);
    return () => clearInterval(id);
  }, [text]);
  return <span>{display}</span>;
}

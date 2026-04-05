import React, { useEffect } from "react";
import "./Toast.css";

export default function Toast({ message, onDone }) {
  useEffect(() => {
    if (!message) return;
    const t = setTimeout(onDone, 2800);
    return () => clearTimeout(t);
  }, [message, onDone]);

  if (!message) return null;
  return <div className="toast show" role="status" aria-live="polite">{message}</div>;
}

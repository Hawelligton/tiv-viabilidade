"use client";

import { ChangeEvent, useState } from "react";
import { formatNumber, parseLocaleNumber } from "@/lib/format";

interface BaseProps {
  label: string;
  hint?: string;
  className?: string;
}

export function TextField({
  label,
  value,
  onChange,
  className = "",
}: BaseProps & { value: string; onChange: (v: string) => void }) {
  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-[11px] uppercase tracking-[0.09em] text-grafite-300">
        {label}
      </span>
      <input
        type="text"
        value={value}
        onChange={(e: ChangeEvent<HTMLInputElement>) => onChange(e.target.value)}
        className="w-full rounded-md border border-grafite-600 bg-grafite-800/70 px-3 py-2 text-sm text-papel-100 outline-none transition-colors placeholder:text-grafite-400 focus:border-anil-500 focus:ring-1 focus:ring-anil-500"
      />
    </label>
  );
}

export function NumberField({
  label,
  value,
  onChange,
  hint,
  suffix,
  className = "",
  min,
}: BaseProps & {
  value: number;
  onChange: (v: number) => void;
  suffix?: string;
  min?: number;
}) {
  const [syncedValue, setSyncedValue] = useState(value);
  const [text, setText] = useState(formatNumber(value));
  if (value !== syncedValue) {
    setSyncedValue(value);
    setText(formatNumber(value));
  }

  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-[11px] uppercase tracking-[0.09em] text-grafite-300">
        {label}
      </span>
      <span className="relative flex items-center">
        <input
          type="text"
          inputMode="decimal"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => {
            const n = parseLocaleNumber(text);
            const clamped = min !== undefined ? Math.max(min, n) : n;
            onChange(clamped);
            setText(formatNumber(clamped));
          }}
          className="data-field w-full rounded-md border border-grafite-600 bg-grafite-800/70 px-3 py-2 pr-12 text-sm text-papel-100 outline-none transition-colors focus:border-anil-500 focus:ring-1 focus:ring-anil-500"
        />
        {suffix && (
          <span className="data-field pointer-events-none absolute right-3 text-xs text-grafite-300">
            {suffix}
          </span>
        )}
      </span>
      {hint && <span className="text-[11px] text-grafite-400">{hint}</span>}
    </label>
  );
}

export function PercentField({
  label,
  value,
  onChange,
  hint,
  className = "",
}: BaseProps & { value: number; onChange: (v: number) => void }) {
  const [syncedValue, setSyncedValue] = useState(value);
  const [text, setText] = useState(formatNumber(value * 100));
  if (value !== syncedValue) {
    setSyncedValue(value);
    setText(formatNumber(value * 100));
  }

  return (
    <label className={`flex flex-col gap-1.5 ${className}`}>
      <span className="text-[11px] uppercase tracking-[0.09em] text-grafite-300">
        {label}
      </span>
      <span className="relative flex items-center">
        <input
          type="text"
          inputMode="decimal"
          value={text}
          onChange={(e) => setText(e.target.value)}
          onBlur={() => {
            const n = parseLocaleNumber(text) / 100;
            onChange(n);
            setText(formatNumber(n * 100));
          }}
          className="data-field w-full rounded-md border border-grafite-600 bg-grafite-800/70 px-3 py-2 pr-8 text-sm text-papel-100 outline-none transition-colors focus:border-anil-500 focus:ring-1 focus:ring-anil-500"
        />
        <span className="data-field pointer-events-none absolute right-3 text-xs text-grafite-300">
          %
        </span>
      </span>
      {hint && <span className="text-[11px] text-grafite-400">{hint}</span>}
    </label>
  );
}

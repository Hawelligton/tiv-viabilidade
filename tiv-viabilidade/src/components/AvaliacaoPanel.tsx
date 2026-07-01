"use client";

import type { ResultadoCalculo } from "@/lib/calc";
import { formatPercent } from "@/lib/format";
import { Stamp } from "./Stamp";

function LinhaComparativa({
  label,
  meta,
  resultado,
  viavel,
}: {
  label: string;
  meta: number;
  resultado: number;
  viavel: boolean;
}) {
  const pct = Math.max(0, Math.min(1, resultado / (meta * 1.6 || 1)));
  return (
    <div className="space-y-1.5">
      <div className="flex items-baseline justify-between text-sm">
        <span className="text-grafite-300">{label}</span>
        <span className="data-field text-papel-50">
          {formatPercent(resultado)}{" "}
          <span className="text-grafite-400">/ meta {formatPercent(meta)}</span>
        </span>
      </div>
      <div className="h-2 w-full overflow-hidden rounded-full bg-grafite-800">
        <div
          className={`h-full rounded-full transition-all ${
            viavel ? "bg-verde-obra-500" : "bg-vermelho-alerta-500"
          }`}
          style={{ width: `${pct * 100}%` }}
        />
        <div
          className="relative -mt-2 h-2 w-px bg-papel-100/60"
          style={{ marginLeft: meta > 0 ? "62.5%" : "0%" }}
        />
      </div>
    </div>
  );
}

export function AvaliacaoPanel({ r }: { r: ResultadoCalculo }) {
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_auto]">
      <div className="space-y-5">
        <LinhaComparativa
          label="Incorporador"
          meta={r.metaIncorporadorPct}
          resultado={r.resultadoIncorporadorPct}
          viavel={r.viavelIncorporador}
        />
        <LinhaComparativa
          label="Construtor"
          meta={r.metaConstrutorPct}
          resultado={r.resultadoConstrutorPct}
          viavel={r.viavelConstrutor}
        />
        <div className="border-t border-grafite-700 pt-4">
          <LinhaComparativa
            label="Resultado total da operação"
            meta={r.metaTotalPct}
            resultado={r.resultadoTotalPct}
            viavel={r.viavelTotal}
          />
        </div>
      </div>

      <div className="flex items-center justify-center">
        <Stamp
          viavel={r.viavelTotal}
          label={r.viavelTotal ? "VIÁVEL" : "INVIÁVEL"}
        />
      </div>
    </div>
  );
}

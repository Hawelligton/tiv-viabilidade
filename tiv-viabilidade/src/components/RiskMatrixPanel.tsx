"use client";

import type { MatrizRisco, MetricaRiscoCalculada } from "@/lib/riskMatrix";
import { formatPercent, formatNumber } from "@/lib/format";
import { Stamp } from "./Stamp";

function valorFormatado(m: MetricaRiscoCalculada) {
  return m.formatoPercentual
    ? formatPercent(m.valor)
    : formatNumber(m.valor, 2);
}
function refFormatado(v: number, pct: boolean) {
  return pct ? formatPercent(v) : formatNumber(v, 2);
}

function LinhaMetrica({ m }: { m: MetricaRiscoCalculada }) {
  const pct = m.scoreNormalizado * 100;
  const cor =
    m.classificacao === "Oportunidade" ? "bg-verde-obra-500" : "bg-vermelho-alerta-500";

  return (
    <div className="py-2.5">
      <div className="mb-1.5 flex flex-wrap items-baseline justify-between gap-x-4 gap-y-0.5">
        <span className="text-sm text-papel-50">{m.nome}</span>
        <span className="flex items-baseline gap-2 text-xs text-grafite-300">
          <span className="data-field text-papel-100">{valorFormatado(m)}</span>
          <span>· mediano {refFormatado(m.mediano, m.formatoPercentual)}</span>
          <span
            className={
              m.classificacao === "Oportunidade"
                ? "text-verde-obra-500"
                : "text-vermelho-alerta-500"
            }
          >
            {m.classificacao}
          </span>
          <span className="text-grafite-400">peso {m.peso}</span>
        </span>
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-grafite-800">
        <div className="absolute inset-y-0 left-1/2 w-px bg-papel-100/30" />
        <div
          className={`h-full rounded-full transition-all ${cor}`}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

export function RiskMatrixPanel({ matriz }: { matriz: MatrizRisco }) {
  const viavel = matriz.indiceComposto >= 0.5;
  return (
    <div className="grid gap-8 lg:grid-cols-[1fr_auto]">
      <div>
        <p className="mb-1 text-[11px] uppercase tracking-[0.09em] text-grafite-300">
          Ameaça
        </p>
        <div className="divide-y divide-grafite-800">
          {matriz.metricas.map((m) => (
            <LinhaMetrica key={m.id} m={m} />
          ))}
        </div>
        <p className="mt-1 text-right text-[11px] uppercase tracking-[0.09em] text-grafite-300">
          Oportunidade
        </p>
      </div>

      <div className="flex flex-col items-center justify-center gap-3">
        <Stamp
          viavel={viavel}
          label={`${(matriz.indiceComposto * 100).toFixed(0)}%`}
        />
        <p className="max-w-[168px] text-center text-[11px] text-grafite-400">
          Índice composto ponderado pelos pesos de cada indicador
        </p>
      </div>
    </div>
  );
}

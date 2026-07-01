"use client";

import type { ResultadoCalculo } from "@/lib/calc";
import { formatCurrency } from "@/lib/format";

function Linha({
  label,
  value,
  strong = false,
  muted = false,
}: {
  label: string;
  value: number;
  strong?: boolean;
  muted?: boolean;
}) {
  return (
    <div
      className={`flex items-baseline justify-between gap-4 py-1.5 ${
        strong ? "text-papel-50" : "text-grafite-300"
      }`}
    >
      <span className={`text-sm ${muted ? "text-grafite-400" : ""}`}>{label}</span>
      <span
        className={`data-field whitespace-nowrap text-sm ${
          strong ? "text-base font-semibold text-papel-50" : ""
        }`}
      >
        {formatCurrency(value)}
      </span>
    </div>
  );
}

export function ResultadoPanel({ r }: { r: ResultadoCalculo }) {
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div>
        <p className="mb-2 text-[11px] uppercase tracking-[0.09em] text-grafite-300">
          3.1 Receitas
        </p>
        <Linha label="Venda das unidades autônomas" value={r.receitaTotal} strong />
      </div>

      <div>
        <p className="mb-2 text-[11px] uppercase tracking-[0.09em] text-grafite-300">
          3.2 Despesas
        </p>
        <div className="divide-y divide-grafite-800">
          <Linha
            label={
              r.eSubTotal > 0
                ? "Unidades sub-rogadas (pagam o terreno)"
                : "Venda do terreno"
            }
            value={r.despesaVendaSubrogadaOuTerreno}
          />
          <Linha
            label="Comercialização das unidades vendáveis"
            value={r.despesaComercializacaoUnidades}
          />
          <Linha label="Tributação" value={r.despesaTributacao} />
          <Linha
            label="Comercialização do terreno"
            value={r.despesaComercializacaoTerreno}
          />
          <Linha label="Custo operacional" value={r.despesaCustoOperacional} />
        </div>
        <div className="mt-1 border-t border-grafite-700 pt-1.5">
          <Linha label="Total de despesas" value={r.despesaTotal} strong />
        </div>
      </div>

      <div className="lg:col-span-2">
        <div
          className={`flex items-center justify-between rounded-xl border px-5 py-4 ${
            r.lucroIncorporacao >= 0
              ? "border-verde-obra-700/50 bg-verde-obra-700/10"
              : "border-vermelho-alerta-700/50 bg-vermelho-alerta-700/10"
          }`}
        >
          <span className="font-display text-lg italic text-papel-50">
            Lucro da incorporação
          </span>
          <span className="data-field text-xl font-semibold text-papel-50">
            {formatCurrency(r.lucroIncorporacao)}
          </span>
        </div>
      </div>
    </div>
  );
}

"use client";

import type { UnidadeTipo } from "@/lib/types";
import type { UnidadeCalculada } from "@/lib/calc";
import { formatCurrency, formatArea, parseLocaleNumber } from "@/lib/format";
import { novaUnidade } from "@/lib/defaults";

function Cell({
  value,
  onChange,
  width = "w-24",
}: {
  value: number;
  onChange: (v: number) => void;
  width?: string;
}) {
  return (
    <input
      type="text"
      inputMode="decimal"
      defaultValue={value.toLocaleString("pt-BR", { maximumFractionDigits: 3 })}
      onBlur={(e) => onChange(parseLocaleNumber(e.target.value))}
      className={`data-field ${width} rounded border border-transparent bg-transparent px-2 py-1.5 text-right text-[13px] text-papel-100 outline-none transition-colors hover:border-grafite-600 focus:border-anil-500 focus:bg-grafite-800 focus:ring-1 focus:ring-anil-500`}
    />
  );
}

const thBase =
  "sticky top-0 z-10 bg-grafite-900 whitespace-nowrap px-2 py-2 text-left text-[10.5px] font-semibold uppercase tracking-[0.06em] text-grafite-300";

export function UnidadesTable({
  unidades,
  calculadas,
  onChange,
}: {
  unidades: UnidadeTipo[];
  calculadas: UnidadeCalculada[];
  onChange: (u: UnidadeTipo[]) => void;
}) {
  const update = (id: string, patch: Partial<UnidadeTipo>) => {
    onChange(unidades.map((u) => (u.id === id ? { ...u, ...patch } : u)));
  };
  const remove = (id: string) => onChange(unidades.filter((u) => u.id !== id));
  const add = () => onChange([...unidades, novaUnidade()]);

  const calcById = new Map(calculadas.map((c) => [c.id, c]));

  return (
    <div className="space-y-3">
      <div className="max-h-[560px] overflow-auto rounded-xl border border-grafite-700">
        <table className="w-full border-collapse text-sm">
          <thead>
            <tr className="border-b border-grafite-700">
              <th className={`${thBase} min-w-[220px]`}>Tipo de unidade</th>
              <th className={thBase}>Qtd.</th>
              <th className={thBase} title="Área Real Privativa Principal coberta padrão — Coluna 20, Quadro II NBR 12.721">
                Área coberta (m²)
              </th>
              <th className={thBase} title="Área Real Privativa Principal padrão diferente/descoberta, incluindo vagas — Coluna 21, Quadro II NBR 12.721">
                Área diferente (m²)
              </th>
              <th className={thBase}>Vaga garagem (m²)</th>
              <th className={thBase} title="Área Equivalente Total — Coluna 38, Quadro II NBR 12.721">
                Área equiv. total (m²)
              </th>
              <th className={thBase}>Preço venda (R$/m²)</th>
              <th className={thBase} title="Deflator do preço de venda aplicado à área descoberta">
                Deflator área desc.
              </th>
              <th className={thBase} title="CUC — Custo Unitário de Construção">
                CUC (R$/m²)
              </th>
              <th className={thBase} title="Quantidade de unidades deste tipo destinada à sub-rogação do terreno">
                Sub-rogada (qtd.)
              </th>
              <th className={`${thBase} border-l border-grafite-700 bg-anil-700/20`}>
                Preço venda total
              </th>
              <th className={`${thBase} bg-anil-700/20`}>Custo total</th>
              <th className={`${thBase} bg-anil-700/20`}>Fração ideal (R$)</th>
              <th className={thBase}></th>
            </tr>
          </thead>
          <tbody>
            {unidades.map((u) => {
              const c = calcById.get(u.id);
              return (
                <tr
                  key={u.id}
                  className="border-b border-grafite-800 last:border-0 hover:bg-grafite-800/40"
                >
                  <td className="px-2 py-1.5">
                    <input
                      type="text"
                      defaultValue={u.nome}
                      onBlur={(e) => update(u.id, { nome: e.target.value })}
                      className="w-full min-w-[200px] rounded border border-transparent bg-transparent px-2 py-1.5 text-[13px] text-papel-100 outline-none transition-colors hover:border-grafite-600 focus:border-anil-500 focus:bg-grafite-800 focus:ring-1 focus:ring-anil-500"
                    />
                  </td>
                  <td>
                    <Cell value={u.qtd} onChange={(v) => update(u.id, { qtd: v })} width="w-14" />
                  </td>
                  <td>
                    <Cell
                      value={u.areaPrivativaCoberta}
                      onChange={(v) => update(u.id, { areaPrivativaCoberta: v })}
                    />
                  </td>
                  <td>
                    <Cell
                      value={u.areaPrivativaDiferente}
                      onChange={(v) => update(u.id, { areaPrivativaDiferente: v })}
                    />
                  </td>
                  <td>
                    <Cell
                      value={u.areaVagaGaragem}
                      onChange={(v) => update(u.id, { areaVagaGaragem: v })}
                    />
                  </td>
                  <td>
                    <Cell
                      value={u.areaEquivalenteTotal}
                      onChange={(v) => update(u.id, { areaEquivalenteTotal: v })}
                    />
                  </td>
                  <td>
                    <Cell
                      value={u.precoVendaUnitM2}
                      onChange={(v) => update(u.id, { precoVendaUnitM2: v })}
                      width="w-24"
                    />
                  </td>
                  <td>
                    <Cell
                      value={u.deflatorAreaDescoberta}
                      onChange={(v) => update(u.id, { deflatorAreaDescoberta: v })}
                      width="w-16"
                    />
                  </td>
                  <td>
                    <Cell value={u.cucM2} onChange={(v) => update(u.id, { cucM2: v })} width="w-24" />
                  </td>
                  <td>
                    <Cell
                      value={u.qtdSubRogada}
                      onChange={(v) => update(u.id, { qtdSubRogada: v })}
                      width="w-16"
                    />
                  </td>
                  <td className="data-field border-l border-grafite-800 bg-anil-700/10 px-2 py-1.5 text-right text-[13px] text-papel-50">
                    {formatCurrency(c?.precoVendaTotal ?? 0)}
                  </td>
                  <td className="data-field bg-anil-700/10 px-2 py-1.5 text-right text-[13px] text-papel-50">
                    {formatCurrency(c?.custoTotal ?? 0)}
                  </td>
                  <td className="data-field bg-anil-700/10 px-2 py-1.5 text-right text-[13px] text-papel-50">
                    {formatCurrency(c?.fiTotal ?? 0)}
                  </td>
                  <td className="px-1">
                    <button
                      onClick={() => remove(u.id)}
                      aria-label={`Remover ${u.nome}`}
                      className="rounded px-2 py-1 text-grafite-400 transition-colors hover:bg-vermelho-alerta-700/20 hover:text-vermelho-alerta-500"
                    >
                      ✕
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <button
          onClick={add}
          className="rounded-lg border border-dashed border-grafite-600 px-3 py-2 text-xs font-medium text-grafite-300 transition-colors hover:border-anil-500 hover:text-papel-50"
        >
          + Adicionar tipo de unidade
        </button>
        <p className="text-[11px] text-grafite-400">
          {unidades.reduce((a, u) => a + u.qtd, 0)} unidades autônomas · área total equivalente{" "}
          {formatArea(
            unidades.reduce((a, u) => a + u.qtd * u.areaEquivalenteTotal, 0)
          )}
        </p>
      </div>
    </div>
  );
}

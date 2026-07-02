"use client";

import { useMemo } from "react";
import type { CustoOperacionalItem, CategoriaCusto } from "@/lib/types";
import { CATEGORIAS_CUSTO } from "@/lib/types";
import { formatCurrency, parseLocaleNumber } from "@/lib/format";
import { novoCustoItem } from "@/lib/defaults";

export function CustoOperacionalPanel({
  itens,
  vmv,
  vmvPct,
  total,
  onChange,
}: {
  itens: CustoOperacionalItem[];
  vmv: number;
  vmvPct: number;
  total: number;
  onChange: (itens: CustoOperacionalItem[]) => void;
}) {
  const update = (id: string, patch: Partial<CustoOperacionalItem>) =>
    onChange(itens.map((i) => (i.id === id ? { ...i, ...patch } : i)));
  const remove = (id: string) => onChange(itens.filter((i) => i.id !== id));
  const add = (categoria: CategoriaCusto) =>
    onChange([...itens, { ...novoCustoItem(), categoria }]);

  const grupos = useMemo(() => {
    return CATEGORIAS_CUSTO.map((categoria) => ({
      categoria,
      itens: itens.filter((i) => i.categoria === categoria),
      subtotal: itens
        .filter((i) => i.categoria === categoria)
        .reduce((a, i) => a + i.valor, 0),
    })).filter((g) => g.itens.length > 0 || g.categoria !== "Outros");
  }, [itens]);

  const itensSemCategoria = itens.length
    ? itens.reduce((a, i) => a + i.valor, 0)
    : 0;

  return (
    <div className="space-y-6">
      {grupos.map((g) => (
        <div key={g.categoria}>
          <div className="mb-2 flex items-baseline justify-between">
            <p className="text-[11px] uppercase tracking-[0.09em] text-grafite-300">
              {g.categoria}
            </p>
            {g.itens.length > 0 && (
              <span className="data-field text-xs text-grafite-400">
                {formatCurrency(g.subtotal)}
              </span>
            )}
          </div>

          {g.itens.length > 0 && (
            <div className="grid grid-cols-1 gap-x-6 gap-y-2 sm:grid-cols-2">
              {g.itens.map((item) => (
                <div
                  key={item.id}
                  className="flex items-center gap-2 rounded-lg border border-grafite-700 bg-grafite-800/40 px-3 py-2"
                >
                  <input
                    type="text"
                    defaultValue={item.nome}
                    onBlur={(e) => update(item.id, { nome: e.target.value })}
                    className="min-w-0 flex-1 rounded border border-transparent bg-transparent py-1 text-sm text-papel-100 outline-none focus:border-anil-500 focus:bg-grafite-800 focus:px-1"
                  />
                  <input
                    type="text"
                    inputMode="decimal"
                    defaultValue={item.valor.toLocaleString("pt-BR")}
                    onBlur={(e) =>
                      update(item.id, { valor: parseLocaleNumber(e.target.value) })
                    }
                    className="data-field w-28 rounded border border-transparent bg-transparent px-2 py-1 text-right text-sm text-papel-100 outline-none focus:border-anil-500 focus:bg-grafite-800 focus:ring-1 focus:ring-anil-500"
                  />
                  <button
                    onClick={() => remove(item.id)}
                    aria-label={`Remover ${item.nome}`}
                    className="rounded px-1.5 py-1 text-grafite-400 transition-colors hover:bg-vermelho-alerta-700/20 hover:text-vermelho-alerta-500"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}

          <button
            onClick={() => add(g.categoria)}
            className="mt-2 rounded-lg border border-dashed border-grafite-600 px-3 py-1.5 text-xs font-medium text-grafite-300 transition-colors hover:border-anil-500 hover:text-papel-50"
          >
            + Adicionar em &quot;{g.categoria}&quot;
          </button>
        </div>
      ))}

      <div className="space-y-1.5 border-t border-grafite-700 pt-3">
        <div className="flex items-center justify-between text-sm text-grafite-300">
          <span>Soma dos itens acima</span>
          <span className="data-field text-papel-100">
            {formatCurrency(itensSemCategoria)}
          </span>
        </div>
        <div className="flex items-center justify-between text-sm text-grafite-300">
          <span>VMV — marketing e vendas ({(vmvPct * 100).toLocaleString("pt-BR")}% da receita)</span>
          <span className="data-field text-papel-100">{formatCurrency(vmv)}</span>
        </div>
        <div className="flex items-center justify-between text-base font-semibold text-papel-50">
          <span>Custo operacional total</span>
          <span className="data-field">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  );
}

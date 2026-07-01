"use client";

import type { Terreno } from "@/lib/types";
import { NumberField } from "./Fields";
import { formatCurrency, formatArea } from "@/lib/format";

export function TerrenoPanel({
  terreno,
  onChange,
  valorM2,
  areaEquivalenteSugerida,
}: {
  terreno: Terreno;
  onChange: (t: Terreno) => void;
  valorM2: number;
  areaEquivalenteSugerida: number;
}) {
  return (
    <div className="grid grid-cols-2 gap-4">
      <NumberField
        label="Área do terreno"
        value={terreno.areaTerreno}
        onChange={(v) => onChange({ ...terreno, areaTerreno: v })}
        suffix="m²"
        min={0}
        className="col-span-1"
      />
      <NumberField
        label="Valor do terreno"
        value={terreno.valorTerrenoTotal}
        onChange={(v) => onChange({ ...terreno, valorTerrenoTotal: v })}
        suffix="R$"
        min={0}
        className="col-span-1"
      />
      <NumberField
        label="Área total construída"
        value={terreno.areaTotalConstruida}
        onChange={(v) => onChange({ ...terreno, areaTotalConstruida: v })}
        suffix="m²"
        min={0}
        hint={`Opcional — usada na matriz de risco. Em branco (0), assume a área equivalente total (${formatArea(areaEquivalenteSugerida)}).`}
        className="col-span-2"
      />
      <div className="col-span-2 flex items-center justify-between rounded-lg border border-dashed border-grafite-600 bg-grafite-800/40 px-3 py-2 text-xs text-grafite-300">
        <span>Valor unitário implícito</span>
        <span className="data-field text-papel-100">
          {formatCurrency(valorM2)} / m²
        </span>
      </div>
    </div>
  );
}

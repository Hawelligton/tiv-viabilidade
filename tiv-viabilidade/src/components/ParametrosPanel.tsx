"use client";

import type { Parametros } from "@/lib/types";
import { PercentField } from "./Fields";

export function ParametrosPanel({
  parametros,
  onChange,
}: {
  parametros: Parametros;
  onChange: (p: Parametros) => void;
}) {
  const set = <K extends keyof Parametros>(key: K, value: Parametros[K]) =>
    onChange({ ...parametros, [key]: value });

  return (
    <div className="space-y-5">
      <div>
        <p className="mb-3 text-[11px] uppercase tracking-[0.09em] text-grafite-300">
          Taxas e corretagem
        </p>
        <div className="grid grid-cols-2 gap-4">
          <PercentField
            label="Tributação"
            value={parametros.tributacaoPct}
            onChange={(v) => set("tributacaoPct", v)}
          />
          <PercentField
            label="Corretagem — unidades"
            value={parametros.corretagemUnidadePct}
            onChange={(v) => set("corretagemUnidadePct", v)}
          />
          <PercentField
            label="Corretagem — terreno"
            value={parametros.corretagemTerrenoPct}
            onChange={(v) => set("corretagemTerrenoPct", v)}
          />
          <PercentField
            label="VMV (mkt. e vendas)"
            value={parametros.vmvPct}
            onChange={(v) => set("vmvPct", v)}
            hint="% sobre a receita total"
          />
        </div>
      </div>

      <div>
        <p className="mb-3 text-[11px] uppercase tracking-[0.09em] text-grafite-300">
          Metas mínimas de resultado
        </p>
        <div className="grid grid-cols-2 gap-4">
          <PercentField
            label="Incorporador"
            value={parametros.metaIncorporadorPct}
            onChange={(v) => set("metaIncorporadorPct", v)}
          />
          <PercentField
            label="Construtor"
            value={parametros.metaConstrutorPct}
            onChange={(v) => set("metaConstrutorPct", v)}
          />
        </div>
      </div>
    </div>
  );
}

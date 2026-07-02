"use client";

import type { Cronograma, CurvaConfig, ModeloCurva } from "@/lib/types";
import type { FluxoMensal } from "@/lib/schedule";
import type { IndicadoresDinamicos } from "@/lib/indicators";
import { NumberField, PercentField } from "./Fields";
import { formatCurrency, formatPercent } from "@/lib/format";

function CurvaEditor({
  titulo,
  config,
  onChange,
}: {
  titulo: string;
  config: CurvaConfig;
  onChange: (c: CurvaConfig) => void;
}) {
  return (
    <div className="rounded-xl border border-grafite-700 bg-grafite-800/30 p-4">
      <p className="mb-3 text-[11px] uppercase tracking-[0.09em] text-grafite-300">
        {titulo}
      </p>
      <div className="grid grid-cols-3 gap-3">
        <label className="flex flex-col gap-1.5">
          <span className="text-[11px] uppercase tracking-[0.09em] text-grafite-300">
            Modelo
          </span>
          <select
            value={config.modelo}
            onChange={(e) =>
              onChange({ ...config, modelo: e.target.value as ModeloCurva })
            }
            className="rounded-md border border-grafite-600 bg-grafite-800/70 px-2 py-2 text-sm text-papel-100 outline-none focus:border-anil-500"
          >
            <option value="linear">Linear</option>
            <option value="curvaS">Curva S</option>
          </select>
        </label>
        <NumberField
          label="Mês início"
          value={config.mesInicio}
          onChange={(v) => onChange({ ...config, mesInicio: Math.round(v) })}
          min={0}
        />
        <NumberField
          label="Duração"
          value={config.duracao}
          onChange={(v) => onChange({ ...config, duracao: Math.max(1, Math.round(v)) })}
          suffix="meses"
          min={1}
        />
      </div>
    </div>
  );
}

function GraficoFluxo({ fluxo }: { fluxo: FluxoMensal }) {
  const W = 720;
  const H = 260;
  const padL = 8;
  const padR = 8;
  const padT = 14;
  const padB = 26;
  const n = fluxo.meses.length;
  const plotW = W - padL - padR;
  const plotH = H - padT - padB;

  const maxAbs = Math.max(
    1,
    ...fluxo.saldoMensal.map(Math.abs),
    ...fluxo.saldoAcumulado.map(Math.abs)
  );
  const y = (v: number) => padT + plotH / 2 - (v / maxAbs) * (plotH / 2);
  const x = (i: number) => padL + (i + 0.5) * (plotW / n);
  const barW = Math.max(2, (plotW / n) * 0.62);

  const linha = fluxo.saldoAcumulado
    .map((v, i) => `${i === 0 ? "M" : "L"}${x(i).toFixed(1)},${y(v).toFixed(1)}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${W} ${H}`}
      className="w-full"
      role="img"
      aria-label="Fluxo de caixa mensal e saldo acumulado"
    >
      {/* eixo zero */}
      <line
        x1={padL}
        x2={W - padR}
        y1={y(0)}
        y2={y(0)}
        stroke="var(--grafite-600)"
        strokeWidth="1"
      />
      {/* barras de saldo mensal */}
      {fluxo.saldoMensal.map((v, i) => {
        const yv = y(v);
        const y0 = y(0);
        return (
          <rect
            key={i}
            x={x(i) - barW / 2}
            y={Math.min(yv, y0)}
            width={barW}
            height={Math.max(1, Math.abs(yv - y0))}
            fill={v >= 0 ? "var(--verde-obra-500)" : "var(--vermelho-alerta-500)"}
            opacity="0.75"
          >
            <title>{`Mês ${i}: ${formatCurrency(v)}`}</title>
          </rect>
        );
      })}
      {/* linha do acumulado */}
      <path d={linha} fill="none" stroke="var(--anil-500)" strokeWidth="2.5" />
      {/* marcador da exposição máxima */}
      {fluxo.exposicaoMaxima < 0 && (
        <circle
          cx={x(fluxo.mesExposicaoMaxima)}
          cy={y(fluxo.exposicaoMaxima)}
          r="4.5"
          fill="var(--ferrugem-500)"
        >
          <title>{`Exposição máxima: ${formatCurrency(fluxo.exposicaoMaxima)} (mês ${fluxo.mesExposicaoMaxima})`}</title>
        </circle>
      )}
      {/* rótulos de mês (a cada 6) */}
      {fluxo.meses
        .filter((m) => m % 6 === 0)
        .map((m) => (
          <text
            key={m}
            x={x(m)}
            y={H - 8}
            textAnchor="middle"
            fontSize="10"
            fill="var(--grafite-400)"
            fontFamily="var(--font-mono)"
          >
            {m}
          </text>
        ))}
    </svg>
  );
}

export function CronogramaPanel({
  cronograma,
  fluxo,
  indicadores,
  onChange,
}: {
  cronograma: Cronograma;
  fluxo: FluxoMensal;
  indicadores: IndicadoresDinamicos;
  onChange: (c: Cronograma) => void;
}) {
  return (
    <div className="space-y-6">
      <div className="grid gap-4 sm:grid-cols-3">
        <NumberField
          label="Prazo total do empreendimento"
          value={cronograma.prazoTotalMeses}
          onChange={(v) =>
            onChange({ ...cronograma, prazoTotalMeses: Math.max(1, Math.round(v)) })
          }
          suffix="meses"
          min={1}
        />
        <NumberField
          label="Mês de pagamento do terreno"
          value={cronograma.pagamentoTerrenoMes}
          onChange={(v) =>
            onChange({ ...cronograma, pagamentoTerrenoMes: Math.max(0, Math.round(v)) })
          }
          hint="Ignorado quando há sub-rogação"
          min={0}
        />
        <PercentField
          label="Receita no repasse/entrega"
          value={cronograma.pctRepasse}
          onChange={(v) =>
            onChange({ ...cronograma, pctRepasse: Math.max(0, Math.min(1, v)) })
          }
          hint="% recebido só na entrega da obra"
        />
      </div>

      <div className="grid gap-4 lg:grid-cols-3">
        <CurvaEditor
          titulo="Custo de construção"
          config={cronograma.construcao}
          onChange={(construcao) => onChange({ ...cronograma, construcao })}
        />
        <CurvaEditor
          titulo="Custo operacional"
          config={cronograma.custoOperacional}
          onChange={(custoOperacional) =>
            onChange({ ...cronograma, custoOperacional })
          }
        />
        <CurvaEditor
          titulo="Recebimento das vendas"
          config={cronograma.vendas}
          onChange={(vendas) => onChange({ ...cronograma, vendas })}
        />
      </div>

      <div className="rounded-xl border border-grafite-700 bg-grafite-800/20 p-4">
        <div className="mb-3 flex flex-wrap items-baseline justify-between gap-2">
          <p className="text-[11px] uppercase tracking-[0.09em] text-grafite-300">
            Fluxo mensal (barras) e saldo acumulado (linha)
          </p>
          <p className="text-xs text-grafite-400">
            meses no eixo · passe o mouse nas barras para valores
          </p>
        </div>
        <GraficoFluxo fluxo={fluxo} />
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-grafite-700 bg-grafite-900/50 px-4 py-3">
          <p className="text-[10.5px] uppercase tracking-[0.08em] text-grafite-300">
            Exposição máxima de caixa
          </p>
          <p
            className={`data-field mt-1 text-lg font-semibold ${
              fluxo.exposicaoMaxima < 0
                ? "text-vermelho-alerta-500"
                : "text-verde-obra-500"
            }`}
          >
            {formatCurrency(fluxo.exposicaoMaxima)}
          </p>
          {fluxo.exposicaoMaxima < 0 && (
            <p className="text-[11px] text-grafite-400">
              no mês {fluxo.mesExposicaoMaxima}
            </p>
          )}
        </div>
        <div className="rounded-xl border border-grafite-700 bg-grafite-900/50 px-4 py-3">
          <p className="text-[10.5px] uppercase tracking-[0.08em] text-grafite-300">
            Total recebido no período
          </p>
          <p className="data-field mt-1 text-lg font-semibold text-papel-50">
            {formatCurrency(fluxo.totalRecebido)}
          </p>
        </div>
        <div className="rounded-xl border border-grafite-700 bg-grafite-900/50 px-4 py-3">
          <p className="text-[10.5px] uppercase tracking-[0.08em] text-grafite-300">
            Total desembolsado no período
          </p>
          <p className="data-field mt-1 text-lg font-semibold text-papel-50">
            {formatCurrency(fluxo.totalDesembolsado)}
          </p>
        </div>
      </div>

      <div>
        <p className="mb-3 text-[11px] uppercase tracking-[0.09em] text-grafite-300">
          Indicadores dinâmicos
        </p>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-grafite-700 bg-grafite-900/50 px-4 py-3">
            <p className="text-[10.5px] uppercase tracking-[0.08em] text-grafite-300">
              TIR
            </p>
            <p
              className={`data-field mt-1 text-lg font-semibold ${
                indicadores.tirAnual === null
                  ? "text-grafite-400"
                  : indicadores.tirAnual >= 0
                    ? "text-verde-obra-500"
                    : "text-vermelho-alerta-500"
              }`}
            >
              {indicadores.tirAnual === null
                ? "—"
                : `${formatPercent(indicadores.tirAnual)} a.a.`}
            </p>
            <p className="text-[11px] text-grafite-400">
              MTIR{" "}
              {indicadores.mtirAnual === null
                ? "—"
                : `${formatPercent(indicadores.mtirAnual)} a.a.`}
            </p>
          </div>
          <div className="rounded-xl border border-grafite-700 bg-grafite-900/50 px-4 py-3">
            <p className="text-[10.5px] uppercase tracking-[0.08em] text-grafite-300">
              VPL à TMA
            </p>
            <p
              className={`data-field mt-1 text-lg font-semibold ${
                indicadores.vpl >= 0
                  ? "text-verde-obra-500"
                  : "text-vermelho-alerta-500"
              }`}
            >
              {formatCurrency(indicadores.vpl)}
            </p>
            <p className="text-[11px] text-grafite-400">
              TMA {formatPercent(indicadores.tmaMensal, 2)} a.m.
            </p>
          </div>
          <div className="rounded-xl border border-grafite-700 bg-grafite-900/50 px-4 py-3">
            <p className="text-[10.5px] uppercase tracking-[0.08em] text-grafite-300">
              Payback simples
            </p>
            <p className="data-field mt-1 text-lg font-semibold text-papel-50">
              {indicadores.paybackMeses === null
                ? "não zera"
                : `mês ${indicadores.paybackMeses}`}
            </p>
          </div>
          <div className="rounded-xl border border-grafite-700 bg-grafite-900/50 px-4 py-3">
            <p className="text-[10.5px] uppercase tracking-[0.08em] text-grafite-300">
              Payback descontado
            </p>
            <p className="data-field mt-1 text-lg font-semibold text-papel-50">
              {indicadores.paybackDescontadoMeses === null
                ? "não zera"
                : `mês ${indicadores.paybackDescontadoMeses}`}
            </p>
            <p className="text-[11px] text-grafite-400">
              exposição VP {formatCurrency(indicadores.exposicaoMaximaVP)}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

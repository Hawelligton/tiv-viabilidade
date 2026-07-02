"use client";

import { useEffect, useMemo, useState } from "react";
import type { EstudoState } from "@/lib/types";
import { calcular } from "@/lib/calc";
import { calcularMatrizRisco } from "@/lib/riskMatrix";
import { calcularFluxoMensal } from "@/lib/schedule";
import { criarEstudoExemplo, estudoVazio } from "@/lib/defaults";
import { formatCurrency, formatPercent } from "@/lib/format";
import { Section } from "@/components/Section";
import { TerrenoPanel } from "@/components/TerrenoPanel";
import { ParametrosPanel } from "@/components/ParametrosPanel";
import { UnidadesTable } from "@/components/UnidadesTable";
import { CustoOperacionalPanel } from "@/components/CustoOperacionalPanel";
import { ResultadoPanel } from "@/components/ResultadoPanel";
import { AvaliacaoPanel } from "@/components/AvaliacaoPanel";
import { RiskMatrixPanel } from "@/components/RiskMatrixPanel";
import { CronogramaPanel } from "@/components/CronogramaPanel";

const STORAGE_KEY = "tiv.estudo.v1";

export default function Home() {
  const [state, setState] = useState<EstudoState>(() => criarEstudoExemplo());
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    // Leitura do localStorage é uma sincronização legítima com um sistema
    // externo do navegador e só pode ocorrer após a montagem (hidratação).
    try {
      const raw = window.localStorage.getItem(STORAGE_KEY);
      if (raw) {
        const salvo = JSON.parse(raw);
        // Migração: estados salvos por versões anteriores podem não ter
        // cronograma nem categorias de custo — completa com padrões.
        const base = criarEstudoExemplo();
        const migrado: EstudoState = {
          ...base,
          ...salvo,
          cronograma: salvo.cronograma ?? base.cronograma,
          custoOperacional: (salvo.custoOperacional ?? []).map(
            (i: { categoria?: string } & Record<string, unknown>) => ({
              categoria: "Outros",
              ...i,
            })
          ),
        };
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState(migrado);
      }
    } catch {
      // localStorage indisponível ou dado corrompido — segue com o exemplo padrão
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // armazenamento indisponível — segue sem persistir
    }
  }, [state, hydrated]);

  const resultado = useMemo(() => calcular(state), [state]);
  const matrizRisco = useMemo(
    () => calcularMatrizRisco(state, resultado),
    [state, resultado]
  );
  const fluxo = useMemo(
    () => calcularFluxoMensal(state, resultado),
    [state, resultado]
  );

  return (
    <div className="min-h-screen pb-24">
      <header className="blueprint-grid border-b border-grafite-700">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8 sm:py-14">
          <p className="text-[11px] font-medium uppercase tracking-[0.16em] text-ferrugem-500">
            Estudo de Viabilidade Econômica e Financeira · Preliminar
          </p>
          <input
            value={state.nomeProjeto}
            onChange={(e) =>
              setState((s) => ({ ...s, nomeProjeto: e.target.value }))
            }
            aria-label="Nome do projeto"
            className="mt-2 w-full max-w-2xl border-none bg-transparent font-display text-3xl font-semibold italic text-papel-50 outline-none sm:text-4xl"
          />
          <p className="mt-3 max-w-xl text-sm leading-relaxed text-grafite-300">
            Preencha os dados do terreno, das unidades autônomas e dos
            parâmetros financeiros. O resultado é recalculado a cada
            alteração, seguindo a metodologia da Técnica Inteligente de
            Viabilidade.
          </p>

          <dl className="mt-8 grid grid-cols-2 gap-4 sm:grid-cols-5">
            <StatCard label="Receita total" value={formatCurrency(resultado.receitaTotal)} />
            <StatCard label="Custo de construção" value={formatCurrency(resultado.custoConstrucaoTotal)} />
            <StatCard
              label="Lucro da incorporação"
              value={formatCurrency(resultado.lucroIncorporacao)}
              tone={resultado.lucroIncorporacao >= 0 ? "positivo" : "negativo"}
            />
            <StatCard
              label="Resultado vs. meta"
              value={formatPercent(resultado.resultadoTotalPct)}
              tone={resultado.viavelTotal ? "positivo" : "negativo"}
            />
            <StatCard
              label="Índice de risco"
              value={formatPercent(matrizRisco.indiceComposto, 0)}
              tone={matrizRisco.indiceComposto >= 0.5 ? "positivo" : "negativo"}
            />
          </dl>

          <div className="mt-8 flex flex-wrap gap-3">
            <button
              onClick={() => {
                if (confirm("Restaurar o exemplo Santo Antônio Studios? Os dados atuais serão substituídos."))
                  setState(criarEstudoExemplo());
              }}
              className="rounded-lg border border-grafite-600 px-3.5 py-2 text-xs font-medium text-grafite-300 transition-colors hover:border-anil-500 hover:text-papel-50"
            >
              Carregar exemplo
            </button>
            <button
              onClick={() => {
                if (confirm("Limpar todos os dados e começar um estudo em branco?"))
                  setState(estudoVazio());
              }}
              className="rounded-lg border border-grafite-600 px-3.5 py-2 text-xs font-medium text-grafite-300 transition-colors hover:border-vermelho-alerta-500 hover:text-papel-50"
            >
              Começar em branco
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl space-y-6 px-5 py-10 sm:px-8">
        <div className="grid gap-6 lg:grid-cols-2">
          <Section numero="01" titulo="Terreno">
            <TerrenoPanel
              terreno={state.terreno}
              onChange={(terreno) => setState((s) => ({ ...s, terreno }))}
              valorM2={resultado.valorTerrenoM2}
              areaEquivalenteSugerida={resultado.unidades.reduce(
                (a, u) => a + u.qtd * u.areaEquivalenteTotal,
                0
              )}
            />
          </Section>

          <Section numero="02" titulo="Parâmetros financeiros">
            <ParametrosPanel
              parametros={state.parametros}
              onChange={(parametros) => setState((s) => ({ ...s, parametros }))}
            />
          </Section>
        </div>

        <Section
          numero="03"
          titulo="Unidades autônomas"
          descricao="Um tipo por linha. A área equivalente total vem do Quadro II da NBR 12.721; preço de venda e CUC vêm da pesquisa de mercado."
        >
          <UnidadesTable
            unidades={state.unidades}
            calculadas={resultado.unidades}
            onChange={(unidades) => setState((s) => ({ ...s, unidades }))}
          />
        </Section>

        <Section
          numero="04"
          titulo="Custo operacional"
          descricao="Despesas fixas de projeto, aprovação e lançamento, somadas à VMV calculada sobre a receita total."
        >
          <CustoOperacionalPanel
            itens={state.custoOperacional}
            vmv={resultado.vmv}
            vmvPct={state.parametros.vmvPct}
            total={resultado.custoOperacionalTotal}
            onChange={(custoOperacional) =>
              setState((s) => ({ ...s, custoOperacional }))
            }
          />
        </Section>

        <Section
          numero="05"
          titulo="Cronograma físico-financeiro"
          descricao="Curvas de desembolso e recebimento ao longo do empreendimento — modelo linear ou curva S de engenharia, como nas premissas do TIV 4.0. O fluxo representa o empreendimento completo: receitas líquidas de sub-rogação e obra como desembolso."
        >
          <CronogramaPanel
            cronograma={state.cronograma}
            fluxo={fluxo}
            onChange={(cronograma) => setState((s) => ({ ...s, cronograma }))}
          />
        </Section>

        <Section numero="06" titulo="Resultado">
          <ResultadoPanel r={resultado} />
        </Section>

        <Section
          numero="07"
          titulo="Avaliação final"
          descricao="Resultado obtido comparado às metas mínimas do incorporador e do construtor."
        >
          <AvaliacaoPanel r={resultado} />
        </Section>

        <Section
          numero="08"
          titulo="Matriz de risco"
          descricao="Estudo estático de 10 indicadores técnicos e financeiros, com faixas de ameaça/oportunidade e pesos — metodologia TIV 4.0."
        >
          <RiskMatrixPanel matriz={matrizRisco} />
        </Section>
      </main>

      <footer className="mx-auto max-w-6xl px-5 py-10 text-center text-[11px] text-grafite-400 sm:px-8">
        Ferramenta de apoio à decisão. Os resultados não substituem o estudo
        definitivo de viabilidade nem orientação profissional especializada.
      </footer>
    </div>
  );
}

function StatCard({
  label,
  value,
  tone,
}: {
  label: string;
  value: string;
  tone?: "positivo" | "negativo";
}) {
  const toneClass =
    tone === "positivo"
      ? "text-verde-obra-500"
      : tone === "negativo"
        ? "text-vermelho-alerta-500"
        : "text-papel-50";
  return (
    <div className="rounded-xl border border-grafite-700 bg-grafite-900/50 px-4 py-3">
      <dt className="text-[10.5px] uppercase tracking-[0.08em] text-grafite-300">
        {label}
      </dt>
      <dd className={`data-field mt-1 text-lg font-semibold ${toneClass}`}>
        {value}
      </dd>
    </div>
  );
}

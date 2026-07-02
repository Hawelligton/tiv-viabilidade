import type { Cronograma, CurvaConfig, EstudoState } from "./types";
import type { ResultadoCalculo } from "./calc";

/**
 * Cronograma físico-financeiro — Fase 2.
 *
 * Reproduz a lógica de curvas de desembolso das abas de premissas do TIV 4.0
 * (modelo de curva + mês de início + duração, como em "CP 01.4 - Outros
 * Custos" e nas curvas de engenharia de "CP 02"). Dois modelos:
 *
 * - linear: distribuição uniforme ao longo da duração;
 * - curvaS: curva S clássica de engenharia (lenta no início, acelera no
 *   meio, desacelera no fim), obtida pela derivada da suavização
 *   3t² − 2t³ — o formato típico de desembolso de obra.
 */

export interface FluxoMensal {
  meses: number[]; // 0..prazoTotal-1
  receitas: number[];
  custoConstrucao: number[];
  custoOperacional: number[];
  terreno: number[];
  comercializacaoETributos: number[];
  saldoMensal: number[];
  saldoAcumulado: number[];
  exposicaoMaxima: number; // valor mais negativo do acumulado (0 se nunca negativo)
  mesExposicaoMaxima: number;
  totalRecebido: number;
  totalDesembolsado: number;
}

/** Gera pesos mensais (somam 1) para uma curva dentro do horizonte. */
export function pesosCurva(
  config: CurvaConfig,
  prazoTotal: number
): number[] {
  const pesos = new Array<number>(prazoTotal).fill(0);
  const inicio = Math.max(0, Math.min(config.mesInicio, prazoTotal - 1));
  const duracao = Math.max(1, Math.min(config.duracao, prazoTotal - inicio));

  const suave = (t: number) => 3 * t * t - 2 * t * t * t; // smoothstep

  for (let i = 0; i < duracao; i++) {
    if (config.modelo === "curvaS") {
      const t0 = i / duracao;
      const t1 = (i + 1) / duracao;
      pesos[inicio + i] = suave(t1) - suave(t0);
    } else {
      pesos[inicio + i] = 1 / duracao;
    }
  }
  return pesos;
}

function distribuir(
  total: number,
  config: CurvaConfig,
  prazoTotal: number
): number[] {
  return pesosCurva(config, prazoTotal).map((p) => p * total);
}

export function calcularFluxoMensal(
  state: EstudoState,
  r: ResultadoCalculo
): FluxoMensal {
  const c: Cronograma = state.cronograma;
  const n = Math.max(1, Math.round(c.prazoTotalMeses));
  const meses = Array.from({ length: n }, (_, i) => i);

  // ---- Receitas -----------------------------------------------------------
  // Receita efetivamente recebida pelo incorporador: exclui as unidades
  // sub-rogadas (cuja receita pertence ao terreneiro), coerente com o
  // resultado estático.
  const receitaRecebivel = r.receitaTotal - r.eSubTotal;
  const pctRepasse = Math.max(0, Math.min(1, c.pctRepasse));
  const receitaDuranteVendas = receitaRecebivel * (1 - pctRepasse);
  const receitaNoRepasse = receitaRecebivel * pctRepasse;

  const receitas = distribuir(receitaDuranteVendas, c.vendas, n);
  // Repasse concentrado no fim da curva de construção (entrega da obra)
  const mesEntrega = Math.min(
    n - 1,
    Math.max(0, c.construcao.mesInicio + c.construcao.duracao - 1)
  );
  receitas[mesEntrega] += receitaNoRepasse;

  // ---- Custos -------------------------------------------------------------
  const custoConstrucao = distribuir(r.custoConstrucaoTotal, c.construcao, n).map(
    (v) => -v
  );
  const custoOperacional = distribuir(
    r.custoOperacionalTotal,
    c.custoOperacional,
    n
  ).map((v) => -v);

  const terreno = new Array<number>(n).fill(0);
  if (r.eSubTotal <= 0) {
    const mesTerreno = Math.max(0, Math.min(c.pagamentoTerrenoMes, n - 1));
    terreno[mesTerreno] = -state.terreno.valorTerrenoTotal;
  }
  // Com sub-rogação, o terreno é pago com as próprias unidades sub-rogadas:
  // nenhuma saída de caixa; a receita delas tampouco entra (já excluída acima).

  // Comercialização e tributos acompanham o recebimento das vendas
  const pctSobreReceita =
    state.parametros.corretagemUnidadePct + state.parametros.tributacaoPct;
  const comercializacaoETributos = receitas.map((v) => -v * pctSobreReceita);
  // Corretagem do terreno sai junto com o pagamento do terreno
  const corretagemTerreno =
    state.parametros.corretagemTerrenoPct * state.terreno.valorTerrenoTotal;
  if (corretagemTerreno > 0) {
    const mesTerreno = Math.max(0, Math.min(c.pagamentoTerrenoMes, n - 1));
    comercializacaoETributos[mesTerreno] -= corretagemTerreno;
  }

  // ---- Consolidação -------------------------------------------------------
  const saldoMensal = meses.map(
    (i) =>
      receitas[i] +
      custoConstrucao[i] +
      custoOperacional[i] +
      terreno[i] +
      comercializacaoETributos[i]
  );

  const saldoAcumulado: number[] = [];
  let acc = 0;
  for (const v of saldoMensal) {
    acc += v;
    saldoAcumulado.push(acc);
  }

  let exposicaoMaxima = 0;
  let mesExposicaoMaxima = 0;
  saldoAcumulado.forEach((v, i) => {
    if (v < exposicaoMaxima) {
      exposicaoMaxima = v;
      mesExposicaoMaxima = i;
    }
  });

  return {
    meses,
    receitas,
    custoConstrucao,
    custoOperacional,
    terreno,
    comercializacaoETributos,
    saldoMensal,
    saldoAcumulado,
    exposicaoMaxima,
    mesExposicaoMaxima,
    totalRecebido: receitas.reduce((a, b) => a + b, 0),
    totalDesembolsado:
      custoConstrucao.reduce((a, b) => a + b, 0) +
      custoOperacional.reduce((a, b) => a + b, 0) +
      terreno.reduce((a, b) => a + b, 0) +
      comercializacaoETributos.reduce((a, b) => a + b, 0),
  };
}

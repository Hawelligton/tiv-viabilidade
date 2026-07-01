import type { EstudoState, UnidadeTipo } from "./types";

export interface UnidadeCalculada extends UnidadeTipo {
  areaDiferenteSemGaragem: number; // F = D - E
  precoVendaUnitario: number; // D_calc = C*H + F*H*I
  precoVendaTotal: number; // E_calc = qtd * D_calc
  custoUnitario: number; // F_cost = G * J
  custoTotal: number; // G_cost = qtd * F_cost
  fiUnitario: number; // H_fi = D_calc - F_cost
  fiTotal: number; // I_fi = qtd * H_fi
  qtdSubRogadaEfetiva: number;
  eSubRogada: number;
  gSubRogada: number;
  iSubRogada: number;
}

export interface ResultadoCalculo {
  unidades: UnidadeCalculada[];

  // 1. Quadro de unidades autônomas
  receitaTotal: number; // SUM(E)
  custoConstrucaoTotal: number; // SUM(G_cost)
  fracaoIdealTotal: number; // SUM(I_fi)

  // 2. Área sub-rogada
  eSubTotal: number;
  gSubTotal: number;
  iSubTotal: number;

  // Custo operacional
  vmv: number;
  custoOperacionalItens: number;
  custoOperacionalTotal: number;

  // 3. Resultado
  despesaVendaSubrogadaOuTerreno: number;
  despesaComercializacaoUnidades: number;
  despesaTributacao: number;
  despesaComercializacaoTerreno: number;
  despesaCustoOperacional: number;
  despesaTotal: number;
  lucroIncorporacao: number;

  // 4. Avaliação final
  resultadoIncorporadorPct: number;
  resultadoConstrutorPct: number;
  metaIncorporadorPct: number;
  metaConstrutorPct: number;
  metaTotalPct: number;
  resultadoTotalPct: number;
  viavelIncorporador: boolean;
  viavelConstrutor: boolean;
  viavelTotal: boolean;

  valorTerrenoM2: number;
}

export function calcular(state: EstudoState): ResultadoCalculo {
  const { terreno, parametros, unidades, custoOperacional } = state;

  const unidadesCalc: UnidadeCalculada[] = unidades.map((u) => {
    const areaDiferenteSemGaragem = Math.max(
      0,
      u.areaPrivativaDiferente - u.areaVagaGaragem
    );
    const precoVendaUnitario =
      u.areaPrivativaCoberta * u.precoVendaUnitM2 +
      areaDiferenteSemGaragem * u.precoVendaUnitM2 * u.deflatorAreaDescoberta;
    const precoVendaTotal = u.qtd * precoVendaUnitario;
    const custoUnitario = u.areaEquivalenteTotal * u.cucM2;
    const custoTotal = u.qtd * custoUnitario;
    const fiUnitario = precoVendaUnitario - custoUnitario;
    const fiTotal = u.qtd * fiUnitario;

    const qtdSubRogadaEfetiva = Math.min(u.qtdSubRogada, u.qtd);
    const eSubRogada = qtdSubRogadaEfetiva * precoVendaUnitario;
    const gSubRogada = qtdSubRogadaEfetiva * custoUnitario;
    const iSubRogada = qtdSubRogadaEfetiva * fiUnitario;

    return {
      ...u,
      areaDiferenteSemGaragem,
      precoVendaUnitario,
      precoVendaTotal,
      custoUnitario,
      custoTotal,
      fiUnitario,
      fiTotal,
      qtdSubRogadaEfetiva,
      eSubRogada,
      gSubRogada,
      iSubRogada,
    };
  });

  const receitaTotal = sum(unidadesCalc.map((u) => u.precoVendaTotal));
  const custoConstrucaoTotal = sum(unidadesCalc.map((u) => u.custoTotal));
  const fracaoIdealTotal = sum(unidadesCalc.map((u) => u.fiTotal));

  const eSubTotal = sum(unidadesCalc.map((u) => u.eSubRogada));
  const gSubTotal = sum(unidadesCalc.map((u) => u.gSubRogada));
  const iSubTotal = sum(unidadesCalc.map((u) => u.iSubRogada));

  const vmv = parametros.vmvPct * receitaTotal;
  const custoOperacionalItens = sum(custoOperacional.map((c) => c.valor));
  const custoOperacionalTotal = custoOperacionalItens + vmv;

  const despesaVendaSubrogadaOuTerreno =
    eSubTotal > 0 ? eSubTotal : terreno.valorTerrenoTotal;
  const despesaComercializacaoUnidades =
    parametros.corretagemUnidadePct * (receitaTotal - eSubTotal);
  const despesaTributacao =
    parametros.tributacaoPct * (receitaTotal - eSubTotal);
  const despesaComercializacaoTerreno =
    parametros.corretagemTerrenoPct * terreno.valorTerrenoTotal;
  const despesaCustoOperacional = custoOperacionalTotal;

  const despesaTotal =
    despesaVendaSubrogadaOuTerreno +
    despesaComercializacaoUnidades +
    despesaTributacao +
    despesaComercializacaoTerreno +
    despesaCustoOperacional;

  const lucroIncorporacao = receitaTotal - despesaTotal;

  const resultadoIncorporadorPct =
    receitaTotal > 0 ? lucroIncorporacao / receitaTotal : 0;

  const metaTotalPct =
    parametros.metaIncorporadorPct + parametros.metaConstrutorPct;

  const resultadoConstrutorPct =
    receitaTotal > 0 && metaTotalPct + 1 !== 0
      ? (custoConstrucaoTotal / (metaTotalPct + 1)) * metaTotalPct / receitaTotal
      : 0;

  const resultadoTotalPct = resultadoIncorporadorPct + resultadoConstrutorPct;

  const valorTerrenoM2 =
    terreno.areaTerreno > 0 ? terreno.valorTerrenoTotal / terreno.areaTerreno : 0;

  return {
    unidades: unidadesCalc,
    receitaTotal,
    custoConstrucaoTotal,
    fracaoIdealTotal,
    eSubTotal,
    gSubTotal,
    iSubTotal,
    vmv,
    custoOperacionalItens,
    custoOperacionalTotal,
    despesaVendaSubrogadaOuTerreno,
    despesaComercializacaoUnidades,
    despesaTributacao,
    despesaComercializacaoTerreno,
    despesaCustoOperacional,
    despesaTotal,
    lucroIncorporacao,
    resultadoIncorporadorPct,
    resultadoConstrutorPct,
    metaIncorporadorPct: parametros.metaIncorporadorPct,
    metaConstrutorPct: parametros.metaConstrutorPct,
    metaTotalPct,
    resultadoTotalPct,
    viavelIncorporador: resultadoIncorporadorPct >= parametros.metaIncorporadorPct,
    viavelConstrutor: resultadoConstrutorPct >= parametros.metaConstrutorPct,
    viavelTotal: resultadoTotalPct >= metaTotalPct,
    valorTerrenoM2,
  };
}

function sum(arr: number[]): number {
  return arr.reduce((a, b) => a + (isFinite(b) ? b : 0), 0);
}

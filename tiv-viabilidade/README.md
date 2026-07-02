# TIV — Estudo de Viabilidade Econômica e Financeira

Ferramenta web para apoio à decisão de viabilidade em incorporação imobiliária vertical. Preencha os dados do terreno, das unidades autônomas e dos parâmetros financeiros e obtenha, em tempo real, receitas, despesas, lucro da incorporação e o veredito de viabilidade frente às metas do incorporador e do construtor.

A metodologia e a estrutura de campos seguem o **Estudo de Viabilidade Econômica e Financeira (preliminar)**, etapa 2.7.4 da Técnica Inteligente de Viabilidade (TIV) para incorporação vertical, com a **matriz de risco estática do TIV 4.0** (planilha real do projeto, seções `Tab. Viab. - Estático` / `DEFINIÇÃO DAS MÉTRICAS`) adicionada como camada de análise:

1. **Terreno** — área, valor e área total construída (opcional, para a matriz de risco).
2. **Parâmetros financeiros** — tributação, corretagem, VMV e metas mínimas de resultado.
3. **Unidades autônomas** — um tipo por linha: área privativa coberta, área privativa diferente/descoberta, vaga de garagem, área equivalente total (Quadro II da NBR 12.721), preço de venda (pesquisa de mercado), deflator de área descoberta, CUC e quantidade sub-rogada.
4. **Custo operacional** — itens fixos de projeto/aprovação/lançamento, mais a VMV calculada sobre a receita.
5. **Resultado** — receitas, despesas (venda de sub-rogadas ou do terreno, comercialização, tributação, custo operacional) e lucro da incorporação.
6. **Avaliação final** — resultado percentual do incorporador e do construtor comparado às metas mínimas, com o selo de viabilidade.
7. **Matriz de risco** — os 10 indicadores estáticos do TIV 4.0 (lucratividade, lucro/valor venal, custo de terreno e de incorporação e de construção % VGV, ROI, ROE, e as três relações de área privativa/equivalente/total), cada um com faixa de ameaça–mediano–oportunidade e peso extraídos da planilha original, compostos num índice ponderado de 0–100%.

> **Nota de fidelidade — Matriz de risco**: o TIV 4.0 usa uma tabela de faixas discretas (VLOOKUP aproximado) que produz saltos de pontuação entre -5 e +5. Aqui a posição do resultado dentro da mesma faixa (pior → mediano → melhor) é interpolada linearmente, com os mesmos limiares e pesos — mesma lógica de ameaça/oportunidade, curva contínua em vez de degraus. Os demais 11 indicadores "dinâmicos" da planilha (TIR, VPL, payback, exposição de caixa etc.) dependem do fluxo de caixa financiado/securitizado completo, fora do escopo desta fase — ver `src/lib/riskMatrix.ts` para os detalhes.

> Nota geral: as seções 1–6 foram construídas a partir do arquivo `ESTUDO_VIABILIDADE_ECONOMICA_E_FINANCEIRA_preliminar.xlsm` antes do TIV 4.0 estar disponível; a metodologia é a mesma, fórmula a fórmula.


## Stack

- [Next.js 16](https://nextjs.org) (App Router) + TypeScript
- Tailwind CSS v4
- 100% client-side: nenhum backend, nenhum dado enviado a servidores — os dados ficam salvos no `localStorage` do navegador
- Fontes: Fraunces (display), IBM Plex Sans (corpo), IBM Plex Mono (dados numéricos)

## Rodando localmente

```bash
npm install
npm run dev
```

Acesse `http://localhost:3000`.

## Build de produção

```bash
npm run build
npm run start
```

## Deploy no Vercel

1. Suba este repositório para o GitHub (veja abaixo).
2. Em [vercel.com/new](https://vercel.com/new), importe o repositório.
3. Framework preset: **Next.js** (detectado automaticamente). Nenhuma variável de ambiente é necessária.
4. Deploy.

Ou, com a Vercel CLI instalada:

```bash
npm i -g vercel
vercel
```

## Publicando no GitHub

```bash
git init
git add .
git commit -m "Estudo de viabilidade TIV — versão inicial"
git branch -M main
git remote add origin https://github.com/<seu-usuario>/<seu-repositorio>.git
git push -u origin main
```

## Estrutura do código

```
src/
  app/
    layout.tsx        Fontes e metadata
    page.tsx           Orquestra o estado e monta as 6 seções
    globals.css         Paleta e tokens de design
  components/
    Fields.tsx          Campos numéricos/percentuais/texto
    Section.tsx          Cartão de seção numerada
    Stamp.tsx             Selo de viabilidade (SVG)
    TerrenoPanel.tsx
    ParametrosPanel.tsx
    UnidadesTable.tsx      Tabela editável de tipos de unidade
    CustoOperacionalPanel.tsx
    ResultadoPanel.tsx
    AvaliacaoPanel.tsx
    RiskMatrixPanel.tsx    Matriz de risco (10 indicadores, TIV 4.0)
  lib/
    types.ts             Modelo de dados
    calc.ts               Motor de cálculo (fiel às fórmulas da planilha)
    riskMatrix.ts           Matriz de risco estática (TIV 4.0)
    defaults.ts            Dados de exemplo e fábricas de linha
    format.ts               Formatação pt-BR (moeda, área, percentual)
```

## Aviso

Ferramenta de apoio à decisão. Os resultados não substituem o estudo definitivo de viabilidade nem orientação profissional especializada (engenharia, contabilidade e direito imobiliário).
trigger deploy

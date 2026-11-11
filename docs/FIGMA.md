# Design — Figma

> **Este documento é um esqueleto.** Ele tem a estrutura que o projeto espera, mas
> os conteúdos visuais (link do protótipo, wireframes e telas) **não foram
> inventados** — são de preenchimento do aluno.
>
> Enquanto o Figma não existir, o design atual do projeto pode ser consultado nas
> capturas de [`screenshots/`](screenshots/) e nas **variáveis CSS** de
> [`src/index.css`](../src/index.css), que são a fonte da verdade do visual.

---

## 1. Link do protótipo

| Item | Valor |
| ---- | ----- |
| Figma do projeto | *(preencher com o link)* |
| Style guide / cores | *(preencher com o link)* |
| Frame de referência (desktop) | *(preencher)* |
| Frame de referência (mobile) | *(preencher)* |
| Data da última atualização | *(preencher)* |

---

## 2. Wireframe

Desenhe aqui (ou cole uma imagem) o esqueleto das duas telas principais.

### 2.1 Conversor

```
┌──────────────────────────────────────────────────────────────┐
│  Currency Exchange App                                       │
├──────────────────────────────────────────────────────────────┤
│  Conversor de moedas                                        │
│                                                              │
│  Valor a converter     Moeda de origem   ⇄   Moeda destino  │
│  [            ]        [ USD — ...    ]      [ BRL — ... ]  │
│                                                              │
│  Valor convertido      Taxa usada                           │
│  R$ 555,17             1 USD = 5,5517 BRL                   │
│  US$ 100,00 → BRL      Data da cotação                      │
│                        10/11/2026                            │
├──────────────────────────────────────────────────────────────┤
│  Histórico do par                                           │
│  [7 dias][15 dias][30 dias][3 meses][6 meses][1 ano][5][10] │
│                                                              │
│  (gráfico de linha)                                          │
│                                                              │
│  Data inicial [ ] Data final [ ] Cot. mín [ ] Cot. máx [ ]  │
│  [Limpar filtros] [Exportar CSV]                            │
│  23 registros encontrados                                   │
│  ┌────────┬────────┬────────┬──────────────┐                 │
│  │ Data ▲ │ Origem │ Destino│ Cotação ↕    │                 │
│  ├────────┼────────┼────────┼──────────────┤                 │
│  │ 09/10  │ USD    │ BRL    │ 5,0050       │                 │
│  └────────┴────────┴────────┴──────────────┘                 │
└──────────────────────────────────────────────────────────────┘
```

### 2.2 Mobile (360 px)

```
┌────────────────────┐
│ Currency Exchange  │
│ App                │
├────────────────────┤
│ Conversor de moedas│
│ Valor a converter  │
│ [            ]     │
│ Moeda de origem    │
│ [            ]     │
│        ⇄           │
│ Moeda de destino   │
│ [            ]     │
│ Valor convertido   │
│ R$ 555,17          │
│ Taxa usada         │
│ 1 USD = 5,5517 BRL │
├────────────────────┤
│ Histórico do par   │
│ [7][15][30][3]     │
│ [6][1 ano][5][10]  │
│ (gráfico)          │
│ Data inicial [ ]   │
│ ...                │
│ ┌──────┬─────┐     │
│ │ Data │Orig.│ →   │  (rola na horizontal)
│ └──────┴─────┘     │
└────────────────────┘
```

---

## 3. Versão desktop

| Item | Valor |
| ---- | ----- |
| Largura de referência | 1280 px (conteúdo máx. 1120 px) |
| Captura | [`screenshots/desktop.png`](screenshots/desktop.png) |
| Grid do conversor | 4 colunas: valor · origem · inverter · destino |
| Grid dos filtros | 4 colunas iguais |

**Checklist de conferência com o Figma:**

- [ ] Tipografia (fonte, pesos e tamanhos)
- [ ] Cores (texto, fundo, bordas, destaque)
- [ ] Espaçamentos e alinhamentos
- [ ] Estados de hover e foco
- [ ] Altura dos campos e dos botões

---

## 4. Versão mobile

| Item | Valor |
| ---- | ----- |
| Largura de referência | 360 px |
| Captura | [`screenshots/mobile.png`](screenshots/mobile.png) |
| Comportamento | conversor em 1 coluna; filtros em 1 coluna; tabela com rolagem horizontal dentro do contêiner |

**Checklist:**

- [ ] Quebras de layout em 620 px e 860 px
- [ ] Legibilidade dos números
- [ ] Área de toque mínima dos botões
- [ ] Rolagem horizontal apenas da tabela

---

## 5. Estados da interface

Todos os estados previstos já estão implementados. Marque com ✔ o que foi
conferido no Figma.

| Estado | Onde aparece | Já implementado | Conferido no Figma |
| ------ | ------------ | --------------- | ------------------ |
| Carregando | conversor, gráfico, tabela | ✔ (`StatusMessage type="loading"` com spinner em CSS) | ☐ |
| Erro de API | conversor, gráfico, tabela | ✔ (mensagem em português + botão "Tentar novamente") | ☐ |
| Sem resultado (filtros) | tabela | ✔ ("Nenhum registro para os filtros aplicados." + ação "Limpar filtros") | ☐ |
| Aviso de filtros conflitantes | tabela | ✔ (data invertida / cotação invertida) | ☐ |
| Par igual | histórico | ✔ ("Escolha moedas diferentes para ver o histórico.") | ☐ |
| Exportação vazia | tabela | ✔ (botão "Exportar CSV" desabilitado) | ☐ |
| Foco de teclado | todos os campos e botões | ✔ (`:focus-visible` global em `index.css`) | ☐ |
| Erro ao carregar as moedas | topo da página | ✔ (faixa de aviso com "Tentar novamente") | ☐ |

---

## 6. Tokens de design

Enquanto o Figma não estiver disponível, a paleta atual está definida em
[`src/index.css`](../src/index.css). Quando o Figma existir, atualize **as
variáveis** — nunca escreva cores literais dentro dos componentes.

| Token CSS | Uso |
| --------- | --- |
| `--color-bg` | fundo geral da página |
| `--color-surface` | fundo dos painéis e da tabela |
| `--color-surface-inverse` | faixa escura do cabeçalho |
| `--color-ink` / `--color-ink-muted` | texto principal e texto secundário |
| `--color-line` / `--color-line-strong` | bordas |
| `--color-brand` / `--color-brand-strong` / `--color-brand-soft` | cor de ação e destaques |
| `--color-negative` / `--color-negative-soft` | erros |
| `--color-warning-soft` / `--color-warning-ink` | avisos de filtro |
| `--space-1` … `--space-8` | escala de espaçamento |
| `--font-sans` / `--font-mono` | tipografia |
| `--radius-sm` / `--radius-md` / `--radius-lg` / `--radius-pill` | raios de canto |

---

## 7. Espaço do aluno

Use esta seção para registrar o que você comparou entre o Figma e a implementação
e o que ainda falta ajustar.

- Figma criado em: *(preencher)*
- O que já bate: *(preencher)*
- O que ainda não bate: *(preencher)*
- Ajustes feitos no código: *(preencher)*

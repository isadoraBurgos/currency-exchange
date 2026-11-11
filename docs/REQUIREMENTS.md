# Requisitos — Currency Exchange App

> Documento de requisitos funcionais, não funcionais, regras de negócio e critérios de
> aceite do **Currency Exchange App**. Ele foi escrito **antes** da implementação do
> código da aplicação (etapa `docs:` do plano de trabalho) para que o aluno saiba
> exatamente o que precisa ser construído.

---

## 1. Contexto

Pequenos negócios, Wheels e pessoas físicas que recebem ou pagam em moeda estrangeira
precisam responder a perguntas simples com frequência:

- "Quanto vale 1.000 USD em reais hoje?"
- "A cotação do euro subiu ou caiu nos últimos 30 dias?"
- "Qual foi a cotação no dia 15 do mês passado, para fechar um contrato?"

Consultar um site de cotação para cada uma dessas dúvidas é lento, e a maioria das
ferramentas gratuitas não permite filtrar o histórico nem exportar os dados. O
**Currency Exchange App** é uma Single Page Application (SPA) que resolve essas três
necessidades em uma tela, usando dados públicos da API **Frankfurter** (não exige
chave de API, não exige cadastro e não cobra nada).

## 2. Público-alvo

| Público | Necessidade principal |
| ------- | --------------------- |
| Usuário final (leigo) | Converter valores rapidamente, com validação clara e sem anúncios no meio da tela |
| Analista financeiro / administrador | Filtrar o histórico por intervalo e cotação, e levar os dados para o Excel/Google Sheets em CSV |
| Estudante de desenvolvimento front-end | Projeto didático para explicar React, hooks customizados, `fetch`, tratamento de erros e geração de CSV à mão |

## 3. Objetivo

Construir uma SPA em React que permita ao usuário **converter valores entre moedas**,
**consultar a taxa e a data efetiva da cotação** e **explorar a evolução histórica do
par** em gráfico e tabela, com filtros, ordenação e exportação em CSV.

## 4. Escopo

### 4.1 Dentro do escopo

1. **Conversor de moedas**: seleção de moeda de origem e de destino, entrada de valor
   com validação em tempo real e cálculo do valor convertido.
2. **Cotação atual**: exibição da taxa usada e da data efetiva da cotação.
3. **Inversão de par**: troca origem ↔ destino preservando o valor digitado.
4. **Histórico**: gráfico de linha e tabela com a evolução do par para 8 períodos
   pré-definidos (7 dias, 15 dias, 30 dias, 3 meses, 6 meses, 1 ano, 5 anos, 10 anos).
5. **Filtros**: data inicial, data final, cotação mínima e cotação máxima, combináveis.
6. **Ordenação**: por data e por cotação, em ordem crescente e decrescente.
7. **Exportação CSV**: apenas os registros filtrados, na ordem exibida na tela.
8. **Estados de interface**: carregamento, erro de API e ausência de dados.
9. **Responsividade**: funcionamento em telas de 360 px até desktop.

### 4.2 Fora do escopo

- Autenticação, login, cadastro de usuários e perfil salvo.
- Back-end próprio, banco de dados e histórico de operações do usuário.
- Pagamentos, transferências de dinheiro e execução de ordens de câmbio.
- Compra/venda de moeda, carteiras e PORTFÓLIO de investimentos.
- Cotação em tempo real (tick-by-tick): a API fornece **cotações de referência**,
  publicadas pelos bancos centrais, não o preço de mercado ao vivo.
- Conversão de unidades técnicas (XAU, XAG, BTC etc.) como foco do produto.
- Suporte a múltiplos idiomas e tema escuro.

## 5. Requisitos funcionais (RF)

| ID | Requisito |
| -- | --------- |
| RF01 | A aplicação deve listar as moedas disponíveis na API e permitir escolher a moeda de origem e a moeda de destino. |
| RF02 | A aplicação deve receber um valor digitado pelo usuário, validar e converter esse valor usando a taxa da moeda de origem para a moeda de destino. |
| RF03 | A aplicação deve exibir a taxa de câmbio utilizada e a data efetiva da cotação. |
| RF04 | A aplicação deve permitir inverter a moeda de origem com a moeda de destino mantendo o valor digitado. |
| RF05 | A aplicação deve exibir o histórico do par selecionado em um gráfico de linha para um dos 8 períodos disponíveis. |
| RF06 | A aplicação deve exibir o histórico do par selecionado em uma tabela com as colunas Data, Origem, Destino e Cotação. |
| RF07 | A aplicação deve permitir filtrar a tabela por data inicial, data final, cotação mínima e cotação máxima, combinando os filtros entre si. |
| RF08 | A aplicação deve permitir ordenar a tabela por Data e por Cotação, em ordem crescente e decrescente. |
| RF09 | A aplicação deve exportar para CSV exatamente os registros filtrados, na ordem exibida na tabela. |
| RF10 | A aplicação deve exibir estados de carregamento, erro e vazio no conversor, no gráfico e na tabela. |
| RF11 | A aplicação deve cancelar requisições anteriores quando o usuário troca de par ou de período rapidamente. |
| RF12 | A interface deve ser escrita em português do Brasil. |

## 6. Requisitos não funcionais (RNF)

| ID | Requisito |
| -- | --------- |
| RNF01 | Interface responsiva, utilizável de 360 px até 1440 px de largura, sem rolagem horizontal da página. |
| RNF02 | Acessibilidade: todo campo com `label` associado, foco de teclado visível, `aria-live="polite"` no resultado da conversão e `aria-pressed` nos botões de período. |
| RNF03 | Contraste de texto compatível com WCAG AA (4.5:1 para texto normal). |
| RNF04 | As funções de negócio (datas, conversão, filtros, ordenação e CSV) devem ser funções puras, isoladas em `src/utils/` e testáveis sem React e sem rede. |
| RNF05 | O consumo da API deve ser feito com `fetch` + `async/await`, centralizado em `src/services/`, sem bibliotecas de requisição. |
| RNF06 | Nenhuma biblioteca de UI, de estado global, de rotas, de CSV ou de datas deve ser adicionada ao projeto. |
| RNF07 | A aplicação deve degradar com elegância: falha de rede ou de API não pode quebrar a página nem deixar a interface em estado de carregamento eterno. |
| RNF08 | O código deve ser legível por iniciantes: nomes descritivos, funções curtas, comentários nos pontos-chave e ausência de abstrações prematuras. |

## 7. Regras de negócio (RN)

| ID | Regra |
| -- | ----- |
| RN01 | O valor informado deve ser numérico e **maior que zero**. Valor vazio, texto, negativo ou zero são rejeitados com mensagem específica. |
| RN02 | A conversão é calculada **pela aplicação**: `valor × taxa`. O parâmetro `amount` da API nunca é usado. |
| RN03 | Quando origem e destino são iguais, a taxa vale **1** e a aplicação **não deve chamar a API**. No histórico, a aplicação exibe a mensagem "Escolha moedas diferentes para ver o histórico." |
| RN04 | Inverter as moedas troca origem e destino e **mantém o valor digitado**. |
| RN05 | Mudar o par de moedas ou o período dispara nova consulta ao histórico e atualiza gráfico e tabela. |
| RN06 | Os filtros da tabela combinam entre si (lógica **AND**). Uma string vazia significa "sem filtro". |
| RN07 | Cotação mínima maior que a máxima, ou data inicial maior que a data final, deve gerar **aviso na interface** e resultado **vazio**. |
| RN08 | A exportação CSV usa **somente** os dados filtrados e ordenados, na ordem exibida. |
| RN09 | A API não publica cotação em fins de semana e feriados. A aplicação deve usar a **data efetiva** devolvida pela API e não "corrigir" as datas. |
| RN10 | Períodos longos podem devolver dados agregados (semanais ou mensais). A aplicação **não pode assumir um ponto por dia**. |
| RN11 | Requisições antigas devem ser canceladas (`AbortController`) para evitar *race condition* ao trocar de par rapidamente. |
| RN12 | A data de hoje usada no cálculo do período deve ser a data **local** do usuário, e a formatação em DD/MM/AAAA deve ser feita por manipulação de string, sem `new Date(iso)`. |

## 8. Critérios de aceite

Formato **Dado / Quando / Então**.

### Conversão

- **CA01** — Dado um valor válido e um par de moedas com taxa disponível, quando o usuário digita o valor, então a aplicação exibe o resultado convertido, a taxa e a data da cotação.
- **CA02** — Dado um valor vazio, quando o campo é avaliado, então a aplicação exibe "Informe um valor para converter." e não exibe resultado.
- **CA03** — Dado um valor com texto, quando o campo é avaliado, então a aplicação exibe "Digite um valor numérico válido." e não exibe resultado.
- **CA04** — Dado um valor negativo, quando o campo é avaliado, então a aplicação exibe "O valor não pode ser negativo." e não exibe resultado.
- **CA05** — Dado um valor igual a zero, quando o campo é avaliado, então a aplicação exibe "O valor deve ser maior que zero." e não exibe resultado.
- **CA06** — Dado um valor escrito como "1.234,56", quando o campo é avaliado, então a aplicação entende o número 1234.56.
- **CA07** — Dado origem e destino iguais, quando o usuário seleciona a mesma moeda nos dois campos, então a taxa exibida é 1, nenhuma requisição é feita e o histórico exibe "Escolha moedas diferentes para ver o histórico.".

### Inversão

- **CA08** — Dado um par USD → BRL e o valor 100, quando o usuário clica em "Inverter", então o par passa a ser BRL → USD e o campo continua com 100.

### Período, gráfico e tabela

- **CA09** — Dado um par válido, quando o usuário seleciona um dos 8 períodos, então o gráfico e a tabela são recarregados com as cotações do intervalo.
- **CA10** — Dado um histórico carregado, quando o gráfico é renderizado, então o eixo X mostra datas em DD/MM/AAAA e o eixo Y mostra a cotação.
- **CA11** — Dado um histórico carregado, quando a tabela é renderizada, então ela exibe as colunas Data, Origem, Destino e Cotação e informa quantos registros foram encontrados.
- **CA12** — Dado um histórico com menos pontos do que o número de dias do período, quando o gráfico é renderizado, então ele funciona normalmente, sem pressupor um ponto por dia.

### Filtros e ordenação

- **CA13** — Dado um histórico carregado, quando o usuário preenche apenas a data inicial, então a tabela exibe somente os registros a partir dessa data.
- **CA14** — Dado um histórico carregado, quando o usuário preenche data inicial, data final, cotação mínima e cotação máxima, então a tabela exibe somente os registros que atendem **todos** os filtros.
- **CA15** — Dado um histórico carregado, quando o usuário clica em "Limpar filtros", então todos os filtros são apagados e a tabela volta a exibir todos os registros.
- **CA16** — Dado uma cotação mínima maior que a máxima, quando os filtros são aplicados, então a aplicação exibe um aviso e a tabela fica vazia.
- **CA17** — Dado uma data inicial maior que a data final, quando os filtros são aplicados, então a aplicação exibe um aviso e a tabela fica vazia.
- **CA18** — Dado a tabela preenchida, quando o usuário clica no cabeçalho "Data", então as linhas são ordenadas por data crescente; um novo clique inverte para decrescente.
- **CA19** — Dado a tabela preenchida, quando o usuário clica no cabeçalho "Cotação", então as linhas são ordenadas por cotação crescente; um novo clique inverte para decrescente.

### Exportação

- **CA20** — Dado 10 registros filtrados, quando o usuário clica em "Exportar CSV", então o arquivo baixado contém um cabeçalho e exatamente 10 linhas de dados.
- **CA21** — Dado 0 registros filtrados, quando a tabela é renderizada, então o botão "Exportar CSV" está desabilitado.
- **CA22** — Dado um arquivo exportado, quando ele é aberto no Excel, então os acentos aparecem corretamente (o arquivo é gravado com BOM UTF-8).

### Erros e estados

- **CA23** — Dado que a API está indisponível, quando o conversor carrega, então a aplicação exibe uma mensagem de erro clara e o botão "Tentar novamente".
- **CA24** — Dado que a API está indisponível, quando o histórico carrega, então o gráfico e a tabela exibem a mensagem de erro e "Tentar novamente".
- **CA25** — Dado um carregamento em andamento, quando a aplicação está buscando dados, então o conversor, o gráfico e a tabela exibem um indicador visível de carregamento.
- **CA26** — Dado um filtro que remove todos os registros, quando a tabela é renderizada, então ela exibe "Nenhum registro para os filtros aplicados" e a ação "Limpar filtros".

### Responsividade e acessibilidade

- **CA27** — Dado uma tela de 360 px de largura, quando a aplicação é carregada, então não há rolagem horizontal da página e a tabela rola dentro do seu próprio contêiner.
- **CA28** — Dado um usuário de teclado, quando ele navega pela aplicação, então o foco é sempre visível e todo campo tem `label` associado.

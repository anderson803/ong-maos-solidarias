# Plano e resultado dos testes — Experiência Prática III

Testes executados em navegador Chromium (Playwright), com servidor local, em 29/09/2026.
Resolução de computador: 1280 × 900 · Celular: 390 × 760.
O CDN da biblioteca Day.js foi bloqueado de propósito para testar o plano B de datas.

**Resultado:** 34 de 34 testes aprovados, sem erros de JavaScript no console.

| Caso | Descrição | Resultado |
| --- | --- | --- |
| T01 | Rota inicial padrão | Aprovado |
| T02 | Navegação sem recarregar | Aprovado |
| T03 | Link ativo com aria-current | Aprovado |
| T04 | Foco no título após navegar | Aprovado |
| T05 | Botão Voltar do navegador | Aprovado |
| T06 | Página 404 | Aprovado |
| T07 | Rota com seção (rolagem até #voluntariado) | Aprovado |
| T08 | Cartões gerados a partir dos dados | Aprovado |
| T09 | Filtro por categoria | Aprovado |
| T10 | Modal abre e fecha com Esc | Aprovado |
| T11 | Envio vazio bloqueado com resumo de erros | Aprovado |
| T12 | Resumo leva o foco ao campo | Aprovado |
| T13 | Máscara de CPF | Aprovado |
| T14 | CPF com dígitos repetidos recusado | Aprovado |
| T15 | CPF com dígito verificador errado recusado | Aprovado |
| T16 | Correção em tempo real (CPF válido) | Aprovado |
| T17 | Nome sem sobrenome recusado | Aprovado |
| T18 | E-mail inválido recusado | Aprovado |
| T19 | Data futura e menor de 18 anos recusados | Aprovado |
| T20 | UF inexistente recusada | Aprovado |
| T21 | Rascunho restaurado após recarregar (sem CPF) | Aprovado |
| T22 | Descartar rascunho | Aprovado |
| T23 | Envio válido abre confirmação | Aprovado |
| T24 | Cadastro salvo no localStorage com CPF mascarado | Aprovado |
| T25 | Rascunho apagado após envio | Aprovado |
| T26 | E-mail duplicado recusado | Aprovado |
| T27 | Painel lista dados do localStorage | Aprovado |
| T28 | Proteção contra XSS (código exibido como texto) | Aprovado |
| T29 | Dados persistem após recarregar | Aprovado |
| T30 | Remover cadastro | Aprovado |
| T31 | Biblioteca indisponível: plano B ativo | Aprovado |
| T32 | Menu hambúrguer (celular) | Aprovado |
| T33 | Sem rolagem horizontal no celular | Aprovado |
| T34 | "Pular para o conteúdo": 1º foco, leva ao título e mantém a rota | Aprovado |

## Falhas encontradas e corrigidas durante os testes

| Falha | Causa | Correção |
| --- | --- | --- |
| Rascunho voltava a ser salvo após envio com sucesso | Temporizador de gravação agendado antes do envio disparava depois | Cancelamento do temporizador no envio e no reset (`debounce().cancelar()`) |
| Endereço sem rota não recebia `#/inicio` | Roteador desenhava a tela inicial sem normalizar a URL | `location.replace('#/inicio')` quando não há hash |
| Link "Pular para o conteúdo" alterava a URL para `#app` | Âncora comum tratada como rota inexistente | `preventDefault()` no clique e foco direto no título da tela |
| Submenu aparecia aberto nas capturas de página inteira | Efeito do redimensionamento feito pela ferramenta de captura (não ocorre com o usuário) | Capturas feitas com janela maior, sem modo de página inteira |

## Teste manual pendente

- Com internet no computador do usuário, conferir se o painel exibe o tempo relativo
  ("há alguns segundos"), o que confirma o carregamento da biblioteca Day.js pelo CDN.

---

# Auditoria de acessibilidade — Experiência Prática IV

Execução: `python tests/auditoria_acessibilidade.py http://localhost:8000/` (com um servidor local ativo).

| Cenário | Telas e estados | Primeira execução | Após as correções |
| --- | --- | --- | --- |
| Computador (1280 px) | 5 telas + 7 estados + texto em 200% | 45 ocorrências | 0 |
| Celular estreito (320 px) | 5 telas + 7 estados | 22 ocorrências | 0 |
| Alto contraste (1280 px) | 5 telas + 7 estados + texto em 200% | — (modo criado nesta etapa) | 0 |
| Alto contraste (320 px) | 5 telas + 7 estados | — | 0 |

Os 34 testes funcionais acima foram executados novamente após as correções: **34 de 34 aprovados**.
Detalhes de cada problema em [docs/relatorio-acessibilidade.md](docs/relatorio-acessibilidade.md).

## Novos testes funcionais e build de produção

| Caso | Descrição | Resultado |
| --- | --- | --- |
| T35 | Submenu fecha com Esc (WCAG 1.4.13) | Aprovado |
| T36 | Alto contraste: ativa, informa aria-pressed e mantém após recarregar | Aprovado |
| T37 | Alto contraste segue a preferência do sistema (prefers-contrast) | Aprovado |

Os 37 testes funcionais e a auditoria de acessibilidade foram executados também sobre a pasta
`dist/` gerada pelo build: **37 de 37 aprovados e 0 ocorrências de acessibilidade**. Além disso,
o HTML final de cada tela foi comparado entre o código-fonte e o build: idêntico, exceto pelos
comentários removidos.


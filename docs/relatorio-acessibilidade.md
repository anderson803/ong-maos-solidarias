# Relatório de acessibilidade — WCAG 2.1 nível AA

Auditoria realizada na Experiência Prática IV, na branch `feature/acessibilidade`.

## Metodologia

1. **Auditoria automatizada** (`tests/auditoria_acessibilidade.py`, Playwright + Chromium):
   percorre as 5 telas da SPA e 7 estados dinâmicos (formulário com erros, rascunho recuperado,
   painel com cadastros, modal aberto, filtro ativo, link "pular" em foco e menu aberto) em quatro
   cenários: computador (1280 px), celular estreito (320 px, equivalente a zoom de 400%) e os mesmos
   dois no modo de alto contraste.
2. **Testes dirigidos** para critérios que a varredura não cobre: espaçamento de texto (1.4.12),
   conteúdo exibido ao passar o mouse (1.4.13) e cálculo de contraste dos estados de foco e hover.
3. **Roteiro manual** (seção final): teclado, leitor de tela e Lighthouse.

Critérios verificados automaticamente: 1.1.1, 1.3.1, 1.4.3, 1.4.4, 1.4.10, 1.4.11, 2.4.2, 2.4.3,
2.4.7, 3.1.1, 3.3.2, 4.1.1 e 4.1.2.

## Problemas encontrados e correções

A primeira execução encontrou **67 ocorrências** de 6 problemas distintos. Um sétimo problema
(1.4.13) foi encontrado pelos testes dirigidos.

| # | Critério WCAG | Problema | Antes | Correção | Depois |
| --- | --- | --- | --- | --- | --- |
| 1 | 1.4.11 Contraste sem texto | Contorno de foco azul sobre o cabeçalho verde e o rodapé | 1.37:1 e 1.18:1 | Contorno branco em fundos escuros; no link "pular", contorno interno | 5.0:1 e 8.1:1 |
| 2 | 1.4.3 Contraste mínimo | Texto de exemplo (placeholder) com opacidade 0.8 | 4.42:1 | Opacidade 1 | 7.31:1 |
| 3 | 1.4.10 Reflow | Formulário com rolagem horizontal em 320 px (fieldset não encolhia) | 330 px | `min-width: 0` no fieldset | 320 px |
| 4 | 1.4.4 Redimensionar texto | Aviso lateral do cadastro vazava da coluna com texto em 200% | 1344 px | Conteúdo do alerta pode encolher e quebrar palavras | 1280 px |
| 5 | 1.4.4 Redimensionar texto | Títulos, legendas, botões e e-mail do rodapé sem quebra de linha com texto ampliado | — | Quebra de linha e espaçamento do grid limitado a 4% da tela | sem vazamento |
| 6 | 1.4.13 Conteúdo em hover ou foco | Submenu de Projetos não podia ser fechado sem mover o mouse | sem Esc | Tecla Esc fecha o submenu e devolve o foco ao link | fecha com Esc |
| 7 | 1.4.12 Espaçamento de texto | Verificado com altura de linha 1.5, letras 0.12em e palavras 0.16em | sem perda | Nenhuma correção necessária | — |

## Melhoria: modo de alto contraste

- Botão **Alto contraste** no cabeçalho, com `aria-pressed` indicando o estado.
- Paleta em preto e branco (texto 21:1, cabeçalho 12.3:1), links sempre sublinhados, bordas em vez de
  tons de fundo e contorno de foco de 4 px.
- A escolha fica salva no navegador. Sem escolha salva, o modo segue a preferência
  **"aumentar contraste"** do sistema (`prefers-contrast: more`).
- Compatível com o **modo de cores forçadas** do Windows (`forced-colors: active`): estados ativos e
  alertas usam bordas e cores do sistema.

## Resultado final

**0 ocorrências** na auditoria automatizada, nos quatro cenários, e os 34 testes funcionais da
Experiência Prática III continuam aprovados.

## Roteiro manual

| Verificação | Como testar | Resultado |
| --- | --- | --- |
| Navegação só por teclado | Tab, Shift+Tab, Enter, Espaço e Esc em todas as telas | Aprovado |
| Ordem e visibilidade do foco | O foco segue a ordem visual e é sempre visível | Aprovado |
| Modal | Abre com Enter, prende o foco e fecha com Esc | Aprovado |
| Leitor de tela (NVDA) | Títulos, regiões, rótulos e erros anunciados | A executar no Windows |
| Lighthouse (Acessibilidade) | Chrome → DevTools → Lighthouse, no site publicado | A executar após o deploy |

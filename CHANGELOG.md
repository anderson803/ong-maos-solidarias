# Changelog

Todas as mudanças relevantes do projeto são registradas aqui.
O formato segue o [Keep a Changelog](https://keepachangelog.com/pt-BR/1.1.0/) e as versões seguem
o [Versionamento Semântico](https://semver.org/lang/pt-BR/).

## [Não lançado]

### Adicionado
- Modo de alto contraste com preferência salva e suporte a `prefers-contrast` e `forced-colors`.
- Auditoria automatizada de acessibilidade (WCAG 2.1 AA) e relatório em `docs/`.
- Documentação completa: README, guia de contribuição (CONTRIBUTING.md) e este changelog.
- Modelo de pull request com checklist de revisão.
- Arquivo `.gitignore` e `.nojekyll`.

### Corrigido
- Contraste do contorno de foco no cabeçalho e no rodapé (WCAG 1.4.11).
- Contraste do texto de exemplo dos campos (WCAG 1.4.3).
- Rolagem horizontal do formulário em 320 px (WCAG 1.4.10) e com texto em 200% (WCAG 1.4.4).
- Submenu de Projetos agora fecha com a tecla Esc (WCAG 1.4.13).

### Alterado
- `index.html` movido para a raiz do projeto, para publicação no GitHub Pages.

## [0.3.0] — Experiência Prática III

### Adicionado
- Single Page Application com roteamento por hash e página 404.
- Templates com escape automático contra XSS e componentes reutilizáveis.
- Validação do cadastro (CPF, idade mínima, e-mail duplicado, UF) com resumo de erros.
- Persistência no `localStorage`, rascunho automático e painel administrativo simulado.
- Integração com a biblioteca Day.js, com plano B nativo.

## [0.2.0] — Experiência Prática II

### Adicionado
- Design system com variáveis CSS, grid de 12 colunas e 5 pontos de quebra.
- Menu responsivo, componentes (cartões, botões, alertas, etiquetas) e estados de formulário.

## [0.1.0] — Experiência Prática I

### Adicionado
- Páginas em HTML5 semântico (início, projetos e cadastro) e formulário com validação nativa.

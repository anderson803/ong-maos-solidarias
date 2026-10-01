# ONG Mãos Solidárias — Plataforma Web

Plataforma da **ONG Mãos Solidárias** (Curitiba/PR), organização fictícia que mantém os projetos
**Cozinha Solidária**, **Aprender Juntos** e **Conecta Comunidade**. O site apresenta a ONG, divulga
os projetos, recebe cadastros de voluntários e doadores e simula uma área administrativa.

Projeto acadêmico da disciplina **Desenvolvimento Front-end para Web** (ADS — Cruzeiro do Sul Virtual),
construído ao longo das quatro Experiências Práticas:

| Etapa | Entrega |
| --- | --- |
| Experiência Prática I | Estrutura em HTML5 semântico e formulário de cadastro |
| Experiência Prática II | Design system em CSS3, grid de 12 colunas e layout responsivo |
| Experiência Prática III | Single Page Application em JavaScript modular |
| Experiência Prática IV | Versionamento com GitFlow, acessibilidade WCAG 2.1 AA, otimização e deploy |

**Site publicado:** https://anderson803.github.io/ong-maos-solidarias/

---

## Sumário

- [Funcionalidades](#funcionalidades)
- [Tecnologias](#tecnologias)
- [Instalação e execução](#instalação-e-execução)
- [Como usar](#como-usar)
- [Estrutura de pastas](#estrutura-de-pastas)
- [Arquitetura](#arquitetura)
- [Versionamento e fluxo de trabalho](#versionamento-e-fluxo-de-trabalho)
- [Acessibilidade](#acessibilidade)
- [Testes](#testes)
- [Deploy](#deploy)
- [Manutenção](#manutenção)
- [Privacidade](#privacidade)
- [Licença](#licença)

---

## Funcionalidades

- **Navegação sem recarregar a página** (SPA), com endereços próprios para cada tela e suporte
  ao botão Voltar do navegador.
- **Projetos com filtro por categoria**, gerados a partir de um arquivo de dados.
- **Formulário de cadastro** com validação em tempo real: dígitos verificadores do CPF, idade
  mínima de 18 anos, e-mail já cadastrado e UF existente.
- **Rascunho automático:** o formulário é salvo enquanto o usuário digita e pode ser recuperado.
- **Painel administrativo simulado**, que lista e remove os cadastros salvos no navegador.
- **Layout responsivo** do celular ao monitor grande (5 pontos de quebra, abordagem mobile first).
- **Acessibilidade:** navegação completa por teclado, link para pular ao conteúdo, foco gerenciado
  a cada troca de tela e mensagens de erro anunciadas por leitores de tela.

## Tecnologias

| Tecnologia | Uso no projeto |
| --- | --- |
| HTML5 | Estrutura semântica (`header`, `nav`, `main`, `section`, `footer`, `dialog`) |
| CSS3 | Variáveis (design system), CSS Grid, Flexbox, metodologia BEM |
| JavaScript (ES2020+) | Módulos ES (`import`/`export`), roteamento, templates, validação |
| Web Storage API | Persistência dos cadastros e do rascunho no `localStorage` |
| [Day.js 1.11.13](https://day.js.org/) | Cálculo de idade e datas relativas ("há 5 minutos"), via CDN com verificação de integridade (SRI) |
| Git e GitHub | Versionamento com GitFlow e commits semânticos |
| GitHub Pages | Hospedagem estática com HTTPS |

O projeto **não depende de Node.js nem de instalação de pacotes** para funcionar: são arquivos
estáticos servidos diretamente pelo navegador.

## Instalação e execução

**Para usar o site:** [Git](https://git-scm.com/) e um navegador atualizado (Chrome, Edge, Firefox ou Safari).
**Para build e testes:** [Node.js](https://nodejs.org/) 18 ou superior e [Python](https://www.python.org/) 3.10
ou superior com o Playwright (`pip install playwright` e `python -m playwright install chromium`).

1. Clone o repositório:

   ```bash
   git clone https://github.com/anderson803/ong-maos-solidarias.git
   cd ong-maos-solidarias
   ```

2. Inicie um servidor local. Ele é **obrigatório**: por segurança, os navegadores bloqueiam módulos
   JavaScript abertos direto do disco (`file://`). Escolha uma opção:

   - **npm:** `npm start` (equivale a `python -m http.server 8000`)
   - **VS Code:** instale a extensão *Live Server*, clique com o botão direito em `index.html`
     e escolha *Open with Live Server*.

3. Acesse `http://localhost:8000` (ou o endereço indicado pelo Live Server).

O site não tem dependências: não é preciso rodar `npm install`.

### Comandos disponíveis

| Comando | O que faz |
| --- | --- |
| `npm start` | Servidor local com o código-fonte em `http://localhost:8000` |
| `npm run build` | Gera a pasta `dist/` otimizada para produção |
| `npm run preview` | Gera o build e serve a pasta `dist/` em `http://localhost:8000` |
| `npm test` | Testes funcionais (37 casos) e auditoria de acessibilidade no código-fonte |
| `npm run test:dist` | Gera o build e roda os mesmos testes sobre a pasta `dist/` |
| `npm run imagens` | Gera as versões WebP das imagens (após adicionar ou trocar fotos) |

## Como usar

| Endereço | Tela |
| --- | --- |
| `#/inicio` | Apresentação da ONG, indicadores de impacto e projetos em destaque |
| `#/projetos` | Projetos com filtro por categoria, doações e voluntariado |
| `#/projetos/voluntariado` | Mesma tela, já posicionada na seção indicada |
| `#/cadastro` | Formulário de cadastro de voluntários e doadores |
| `#/painel` | Área administrativa simulada com os cadastros salvos |
| qualquer outro | Página não encontrada |

Para testar o fluxo completo: preencha o cadastro com um CPF válido, envie e abra o **Painel**.
O cadastro aparece com a data de envio e pode ser removido. Os dados ficam apenas no seu navegador;
para apagá-los, use o botão Remover ou limpe os dados do site.

## Estrutura de pastas

```text
ong-maos-solidarias/
├── index.html                 → moldura da SPA: cabeçalho, menu, <main id="app">, rodapé, modais
├── css/
│   ├── reset.css              → normalização entre navegadores
│   └── styles.css             → design system, grid de 12 colunas e componentes (BEM)
├── imagens/                   → logotipo e fotos dos projetos
├── js/
│   ├── main.js                → ponto de entrada: inicia componentes e registra as rotas
│   ├── router.js              → roteador por hash (título, menu ativo e foco)
│   ├── utils/                 → templates com escape automático (html.js) e debounce (tempo.js)
│   ├── data/dados.js          → conteúdo: projetos, indicadores, formas de participação, UFs
│   ├── components/            → templates reutilizáveis (cartão, alerta, campo, etiqueta…)
│   ├── pages/                 → uma tela por arquivo (inicio, projetos, cadastro, painel, 404)
│   └── modules/               → regras e serviços (storage, cadastros, validação, máscaras, datas…)
├── scripts/
│   ├── build.mjs              → build de produção (minificação) sem dependências
│   └── otimizar_imagens.py    → conversão das imagens para WebP em dois tamanhos
├── tests/                     → testes funcionais e auditoria de acessibilidade (Playwright)
├── docs/                      → relatório de acessibilidade
├── .github/
│   ├── workflows/ci-deploy.yml → CI/CD: testes em pull requests e deploy no GitHub Pages
│   └── pull_request_template.md → roteiro de revisão usado nos pull requests
├── package.json               → scripts npm (start, build, test)
├── CHANGELOG.md               → histórico de versões
├── CONTRIBUTING.md            → fluxo GitFlow e padrão de commits
├── TESTES.md                  → plano e resultados dos testes
└── README.md
```

## Arquitetura

O código é organizado em camadas, e cada camada só depende das camadas abaixo dela:

```text
main.js  →  router.js  →  pages/  →  components/  →  utils/
                             └────→  modules/   →  data/
```

- **Templates seguros:** a função `html` (em `js/utils/html.js`) escapa todo valor interpolado, então
  dados digitados pelo usuário nunca são interpretados como HTML (proteção contra XSS).
- **Telas independentes:** cada arquivo de `pages/` exporta `titulo`, `render()` e `montar()`.
  O `montar()` devolve uma função de limpeza, chamada pelo roteador antes de trocar de tela.
- **Acesso isolado a recursos externos:** só `modules/storage.js` usa o `localStorage` e só
  `modules/datas.js` usa a Day.js. Se a biblioteca não carregar, o adaptador usa `Date` e `Intl`.

## Versionamento e fluxo de trabalho

O repositório segue o **GitFlow** e o padrão **Conventional Commits**. O passo a passo completo
está em [CONTRIBUTING.md](CONTRIBUTING.md).

| Branch | Finalidade |
| --- | --- |
| `main` | Código em produção. Cada versão publicada recebe uma tag (`v1.0.0`) |
| `develop` | Integração das funcionalidades concluídas |
| `feature/*` | Uma funcionalidade ou melhoria, criada a partir de `develop` |
| `release/*` | Preparação de uma versão: ajustes finais, versão e changelog |
| `hotfix/*` | Correção urgente em produção, criada a partir de `main` |

Exemplos de commits do projeto:

```text
feat: adiciona filtro de projetos por categoria
fix: corrige contraste do texto de ajuda dos campos
docs: documenta instalação e fluxo de contribuição
refactor: move index.html para a raiz do projeto
```

## Acessibilidade

O projeto segue a **WCAG 2.1, nível AA**. A auditoria completa, com os problemas encontrados,
o critério violado, a correção e o resultado, está em
[docs/relatorio-acessibilidade.md](docs/relatorio-acessibilidade.md).

- HTML semântico, idioma `pt-BR` declarado, regiões (`header`, `nav`, `main`, `aside`, `footer`)
  e hierarquia de títulos sem saltos;
- navegação completa por teclado: link "Pular para o conteúdo", foco visível com contraste mínimo
  de 3:1 em qualquer fundo, Esc fecha menu, submenu e modais;
- foco movido para o título a cada troca de tela e link ativo marcado com `aria-current="page"`;
- formulário com `label` associado, `fieldset`/`legend`, `aria-describedby`, `aria-invalid`
  e resumo de erros com atalhos para cada campo;
- texto com contraste mínimo de 4.5:1, layout sem rolagem horizontal em 320 px e com texto em 200%;
- **modo de alto contraste**: botão no cabeçalho (`aria-pressed`) que salva a escolha e, por padrão,
  segue a preferência `prefers-contrast: more` do sistema; suporte ao modo de cores forçadas do Windows;
- respeito à preferência `prefers-reduced-motion`.

## Testes

| Tipo | Comando | Cobertura |
| --- | --- | --- |
| Funcionais | `python tests/testes_funcionais.py [dist]` | 37 casos: rotas, filtro, modal, validação, rascunho, localStorage, XSS, menu, teclado e alto contraste |
| Acessibilidade | `python tests/auditoria_acessibilidade.py [dist]` | WCAG 2.1 AA em 5 telas e 7 estados, em 1280 px, 320 px e alto contraste |
| Manual | roteiro em [TESTES.md](TESTES.md) | Leitor de tela (NVDA) e Lighthouse |

Os scripts iniciam o próprio servidor local. Resultados detalhados em [TESTES.md](TESTES.md).

## Build e otimização

`npm run build` gera a pasta `dist/` com:

- **HTML, CSS e JavaScript minificados** por `scripts/build.mjs` (sem dependências externas):
  comentários e espaços removidos, preservando textos, templates e expressões regulares;
- **imagens WebP** em dois tamanhos com `<picture>` e `srcset`: o navegador baixa a versão adequada
  à tela e usa o JPEG apenas se não suportar WebP;
- `loading="lazy"` nas imagens dos cartões, `fetchpriority="high"` na imagem principal e
  `width`/`height` em todas, evitando deslocamentos do layout.

| Página inicial (transferência) | Antes | Depois | Redução |
| --- | --- | --- | --- |
| HTML | 5.4 KB | 4.1 KB | 24% |
| CSS | 22.9 KB | 19.5 KB | 15%* |
| JavaScript | 56.5 KB | 39.0 KB | 31%* |
| Imagens (computador) | 73.1 KB | 16.2 KB | 78% |
| Imagens (celular) | 73.1 KB | 11.8 KB | 84% |
| **Total (computador)** | **157.9 KB** | **78.8 KB** | **50%** |

\* A redução já desconta o código novo de acessibilidade incluído nesta versão. Os valores não
consideram a compressão gzip aplicada pelo GitHub Pages, que reduz ainda mais a transferência.

## Deploy

O deploy é automático, pelo **GitHub Actions** (`.github/workflows/ci-deploy.yml`):

1. Em cada **pull request** para `develop` ou `main`, o workflow gera o build e roda os testes
   funcionais e a auditoria de acessibilidade sobre a pasta `dist/`.
2. A cada **push na `main`** (merge de uma release ou hotfix), repete as verificações e, se tudo
   passar, publica a pasta `dist/` no **GitHub Pages**, com HTTPS automático.

Configuração inicial (uma única vez): no GitHub, abra **Settings → Pages** e, em *Source*,
escolha **GitHub Actions**. O site fica disponível em `https://anderson803.github.io/ong-maos-solidarias/`.

## Manutenção

| Tarefa | Onde alterar |
| --- | --- |
| Textos, projetos e indicadores | `js/data/dados.js` |
| Cores, fontes e espaçamentos | variáveis no início de `css/styles.css` |
| Nova tela | criar um arquivo em `js/pages/` e registrar a rota em `js/main.js` |
| Regras de validação | `js/modules/validacao.js` |
| Atualizar a Day.js | versão nas tags `<script>` do `index.html` |

Toda alteração segue o fluxo do [CONTRIBUTING.md](CONTRIBUTING.md) e é registrada no
[CHANGELOG.md](CHANGELOG.md).

## Privacidade

Os dados do formulário ficam somente no `localStorage` do navegador de quem preenche. O CPF não é
guardado por completo (apenas os dois últimos dígitos) e não entra no rascunho automático. Em um
sistema real, os dados seriam enviados a um servidor com HTTPS, validados novamente no back-end
e tratados conforme a LGPD, com política de privacidade e consentimento explícito.

## Licença

Projeto acadêmico. Organização, dados e contatos são fictícios, criados exclusivamente para fins de estudo.

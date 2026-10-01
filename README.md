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

**Site publicado:** _link inserido após o deploy_

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
| [Day.js 1.11.13](https://day.js.org/) | Cálculo de idade e datas relativas ("há 5 minutos"), via CDN |
| Git e GitHub | Versionamento com GitFlow e commits semânticos |
| GitHub Pages | Hospedagem estática com HTTPS |

O projeto **não depende de Node.js nem de instalação de pacotes** para funcionar: são arquivos
estáticos servidos diretamente pelo navegador.

## Instalação e execução

**Pré-requisitos:** [Git](https://git-scm.com/) e um navegador atualizado (Chrome, Edge, Firefox ou Safari).

1. Clone o repositório:

   ```bash
   git clone https://github.com/SEU-USUARIO/ong-maos-solidarias.git
   cd ong-maos-solidarias
   ```

2. Inicie um servidor local. Ele é **obrigatório**: por segurança, os navegadores bloqueiam módulos
   JavaScript abertos direto do disco (`file://`). Escolha uma opção:

   - **VS Code:** instale a extensão *Live Server*, clique com o botão direito em `index.html`
     e escolha *Open with Live Server*.
   - **Python:** `python -m http.server 8000`
   - **Node.js:** `npx serve .`

3. Acesse `http://localhost:8000` (ou o endereço indicado pelo Live Server).

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
├── .github/
│   └── pull_request_template.md → roteiro de revisão usado nos pull requests
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

O plano de testes e os resultados estão em [TESTES.md](TESTES.md). Antes de abrir um pull request,
execute ao menos o roteiro manual: navegar por todas as telas usando só o teclado, enviar o
formulário vazio, cadastrar um voluntário e conferir o painel.

## Deploy

O site é publicado no **GitHub Pages** a partir da branch `main`:

1. No GitHub, abra **Settings → Pages**.
2. Em *Source*, escolha **Deploy from a branch**, branch `main` e pasta `/ (root)`.
3. Salve. Em alguns minutos o site fica disponível em `https://SEU-USUARIO.github.io/ong-maos-solidarias/`,
   com HTTPS automático.

A cada merge em `main` o GitHub Pages publica a nova versão. O arquivo `.nojekyll` desativa o
processamento Jekyll, desnecessário para um site estático.

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

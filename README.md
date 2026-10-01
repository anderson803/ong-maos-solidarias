# ONG Mãos Solidárias — Experiência Prática III (SPA em JavaScript)

Projeto acadêmico da disciplina **Desenvolvimento Front-end para Web** (ADS — Cruzeiro do Sul Virtual).
A plataforma da ONG, construída com HTML e CSS nas Experiências I e II, foi transformada em uma
**Single Page Application (SPA)**: um único `index.html` cujo conteúdo é trocado pelo JavaScript,
sem recarregar a página.

## Como executar

O JavaScript usa **módulos ES** (`import`/`export`). Por segurança, os navegadores bloqueiam módulos
abertos diretamente do disco (`file://`), então é preciso um servidor local:

- **VS Code:** abra a pasta do projeto, instale a extensão *Live Server*, clique com o botão direito em `html/index.html` → *Open with Live Server*; ou
- **Terminal:** na pasta do projeto, execute `python -m http.server 8000` e acesse `http://localhost:8000/html/`.

## Rotas da SPA

| Endereço | Tela |
| --- | --- |
| `#/inicio` | Apresentação da ONG, impacto e projetos em destaque |
| `#/projetos` | Projetos com filtro por categoria, doações e voluntariado |
| `#/projetos/voluntariado` | Mesma tela, rolando até a seção indicada |
| `#/cadastro` | Formulário com validação e rascunho automático |
| `#/painel` | Simulação da área administrativa com os cadastros salvos |
| qualquer outro | Página não encontrada |

## Estrutura de diretórios

```text
experiencia-pratica-3/
├── html/
│   └── index.html             → moldura da SPA (cabeçalho, menu, <main id="app">, rodapé, modais, toast)
├── css/
│   ├── reset.css              → normalização entre navegadores (carregado primeiro)
│   └── styles.css             → design system, grid de 12 colunas e componentes (BEM)
├── imagens/
│   ├── logo.svg               → logotipo vetorial
│   ├── ong-maos-solidarias.jpg→ imagem da tela inicial
│   └── projetos/              → uma imagem por projeto
├── js/
│   ├── main.js                → ponto de entrada: inicia componentes e registra as rotas
│   ├── router.js              → roteador por hash: renderiza a tela, atualiza título, menu e foco
│   ├── utils/
│   │   ├── html.js            → sistema de templates com escape automático (proteção contra XSS)
│   │   └── tempo.js           → debounce (adiar execução até o usuário parar de digitar)
│   ├── data/dados.js          → dados dos projetos, indicadores, formas de participação e UFs
│   ├── components/
│   │   └── componentes.js     → templates reutilizáveis: cartão, etiqueta, alerta, indicador, campo…
│   ├── pages/                 → uma tela por arquivo (render + montar)
│   │   ├── inicio.js
│   │   ├── projetos.js
│   │   ├── cadastro.js
│   │   ├── painel.js
│   │   └── nao-encontrada.js
│   └── modules/               → regras de negócio e comportamentos
│       ├── storage.js         → acesso ao localStorage (JSON, prefixo e tratamento de erros)
│       ├── cadastros.js       → "repositório" de cadastros e rascunho
│       ├── validacao.js       → regras de validação (CPF, idade, e-mail duplicado, UF…)
│       ├── formulario.js      → controle genérico de formulários (erros, resumo, preencher, focar)
│       ├── mascaras.js        → máscaras de CPF, telefone e CEP
│       ├── interface.js       → menu hambúrguer, modais e toast
│       └── datas.js           → adaptador da biblioteca Day.js (com plano B nativo)
├── README.md
└── TESTES.md                  → plano de testes e resultados (34 casos)
```

## Biblioteca externa: Day.js

- **Para quê:** cálculo de idade (idade mínima de 18 anos), bloqueio de datas no futuro e datas amigáveis
  no painel ("29/09/2026 às 22:58 (há 5 minutos)").
- **Como é carregada:** via CDN (jsDelivr), com versão fixa `1.11.13`, em três arquivos com `defer`
  no `html/index.html`: a biblioteca, o plugin `relativeTime` e o idioma `pt-br`.
- **Isolamento:** somente `js/modules/datas.js` acessa a variável global `window.dayjs`.
- **Resiliência:** se o CDN estiver fora do ar, o adaptador usa `Date` e `Intl`, nativos do navegador.
- **Melhoria para produção:** adicionar o atributo `integrity` (SRI) às tags de script e hospedar
  uma cópia local da biblioteca.

## Decisões técnicas

- **Templates seguros:** a função `html` escapa todo valor interpolado; dados digitados pelo usuário
  (como o nome exibido no painel) nunca são interpretados como HTML.
- **Acessibilidade na SPA:** a cada troca de tela o roteador atualiza o `<title>`, marca o link ativo
  com `aria-current="page"` e move o foco para o título, para que leitores de tela anunciem a mudança.
- **Validação:** combina a validação nativa do HTML5 com regras em JavaScript (dígitos verificadores do CPF,
  idade mínima, e-mail já cadastrado). Os erros aparecem abaixo de cada campo e em um resumo com links.
- **Privacidade:** o CPF completo não é armazenado (apenas os dois últimos dígitos) e não entra no rascunho.
  Em um sistema real, os dados seriam enviados a um servidor e validados novamente no back-end.

---
Organização, dados e contatos fictícios, criados exclusivamente para fins acadêmicos.

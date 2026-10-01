# Como contribuir

Este documento descreve o fluxo de trabalho do repositório. Ele vale para qualquer pessoa que
for alterar o projeto, inclusive o próprio autor.

## 1. Fluxo de branches (GitFlow)

```text
main     ●───────────────────●─────────────●  (produção, com tags v1.0.0, v1.0.1…)
          \                 / \           /
release    \           ●───●   \         /
            \         /         \       /
develop      ●───●───●───────────●─────●
                  \ /             \   /
feature/*          ●               ● (hotfix/* sai de main e volta para main e develop)
```

| Branch | Criada a partir de | Volta para | Exemplo |
| --- | --- | --- | --- |
| `feature/<assunto>` | `develop` | `develop` | `feature/acessibilidade` |
| `release/<versão>` | `develop` | `main` e `develop` | `release/1.0.0` |
| `hotfix/<assunto>` | `main` | `main` e `develop` | `hotfix/link-quebrado` |

Regras:

- Ninguém faz commit direto em `main` ou `develop`; toda mudança entra por pull request.
- Os merges usam `--no-ff`, para que o histórico mostre onde cada funcionalidade começou e terminou.
- Cada versão publicada em `main` recebe uma tag anotada seguindo o [versionamento semântico](https://semver.org/lang/pt-BR/).

## 2. Passo a passo de uma funcionalidade

```bash
git switch develop
git pull origin develop
git switch -c feature/nome-da-funcionalidade

# ...alterações, testes e commits...

git push -u origin feature/nome-da-funcionalidade
```

Depois, abra um **pull request** de `feature/...` para `develop` no GitHub, preenchendo o modelo
que aparece automaticamente. Após a revisão e a aprovação, faça o merge e apague a branch.

## 3. Padrão de commits (Conventional Commits)

Formato: `tipo: descrição no imperativo`, com a primeira linha curta (de preferência até 50
caracteres, no máximo 72). Se for preciso
explicar o motivo, deixe uma linha em branco e escreva o corpo da mensagem.

| Tipo | Quando usar |
| --- | --- |
| `feat` | Nova funcionalidade para o usuário |
| `fix` | Correção de erro |
| `docs` | Somente documentação |
| `style` | Formatação do código, sem mudar comportamento |
| `refactor` | Reorganização do código, sem mudar comportamento |
| `perf` | Melhoria de desempenho |
| `test` | Criação ou ajuste de testes |
| `build` | Processo de build e otimização para produção |
| `chore` | Tarefas de manutenção e configuração |
| `ci` | Automação de integração e deploy |

Exemplos:

```text
feat: adiciona rascunho automático ao formulário de cadastro
fix: impede que o rascunho seja salvo novamente após o envio
docs: descreve o processo de deploy no README
```

Evite mensagens genéricas como `ajustes`, `update` ou `correções`.

## 4. Antes de abrir o pull request

- [ ] `npm test` e `npm run test:dist` passam sem falhas.
- [ ] O site funciona com um servidor local e o console não mostra erros.
- [ ] Todas as telas podem ser usadas só com o teclado, com o foco sempre visível.
- [ ] Imagens novas têm texto alternativo (ou `alt=""`, se forem decorativas).
- [ ] O `README.md`, o `CHANGELOG.md` e o `TESTES.md` foram atualizados, se necessário.

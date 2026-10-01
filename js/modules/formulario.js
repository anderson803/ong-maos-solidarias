/**
 * Controle genérico de formulários.
 * Reúne o que qualquer formulário da aplicação precisa: exibir e limpar erros,
 * validar campos, gerar o resumo de erros, ler e preencher valores.
 * Não conhece as regras de negócio (elas ficam em validacao.js): recebe a função
 * de validação como parâmetro, o que permite reutilizar este módulo em outros formulários.
 */
import { html } from '../utils/html.js';
import { alerta } from '../components/componentes.js';

/** Retorna o primeiro elemento de um campo (em grupos de radio, o primeiro botão). */
function elementoDoCampo(form, nome) {
    const campo = form.elements[nome];
    return campo instanceof RadioNodeList ? campo[0] : campo;
}

/** Lê todos os campos preenchidos como um objeto { nome: valor }. */
export function dadosDoFormulario(form) {
    return Object.fromEntries(new FormData(form));
}

/** Preenche os campos a partir de um objeto (funciona com texto, data e radio). */
export function preencherFormulario(form, dados) {
    Object.entries(dados).forEach(([nome, valor]) => {
        if (form.elements[nome]) form.elements[nome].value = valor;
    });
}

/** Move o foco para um campo pelo nome. */
export function focarCampo(form, nome) {
    elementoDoCampo(form, nome)?.focus();
}

/**
 * Cria o controlador de validação de um formulário.
 * Convenção: cada campo tem um elemento de mensagem com id="erro-NOME".
 */
export function criarValidador(form, validarCampo) {
    function nomesDosCampos() {
        return [...new Set([...form.elements].filter((el) => el.name).map((el) => el.name))];
    }

    function mostrarErro(nome, mensagem) {
        form.querySelectorAll(`[name="${nome}"]`)
            .forEach((item) => item.setAttribute('aria-invalid', mensagem ? 'true' : 'false'));
        const elementoErro = form.querySelector(`#erro-${nome}`);
        if (elementoErro) {
            elementoErro.textContent = mensagem; // textContent: nunca interpreta HTML
            elementoErro.hidden = !mensagem;
        }
    }

    function validar(nome) {
        const mensagem = validarCampo(elementoDoCampo(form, nome));
        mostrarErro(nome, mensagem);
        return mensagem;
    }

    /** Valida todos os campos e retorna a lista de erros encontrados. */
    function validarTodos() {
        return nomesDosCampos()
            .map((nome) => ({ nome, mensagem: validar(nome) }))
            .filter((item) => item.mensagem);
    }

    /** Remove todas as marcações de erro e de sucesso. */
    function limpar() {
        nomesDosCampos().forEach((nome) => {
            form.querySelectorAll(`[name="${nome}"]`).forEach((item) => item.removeAttribute('aria-invalid'));
            const elementoErro = form.querySelector(`#erro-${nome}`);
            if (elementoErro) {
                elementoErro.textContent = '';
                elementoErro.hidden = true;
            }
        });
    }

    /** Validação em tempo real: ao sair do campo e ao corrigir um campo já marcado com erro. */
    function validarDuranteOPreenchimento() {
        form.addEventListener('focusout', ({ target }) => {
            if (target.name && target.type !== 'radio' && target.value) validar(target.name);
        });
        form.addEventListener('input', ({ target }) => {
            if (target.getAttribute('aria-invalid') === 'true') validar(target.name);
        });
        form.addEventListener('change', ({ target }) => {
            if (target.type === 'radio' || target.type === 'checkbox') validar(target.name);
        });
    }

    return { validar, validarTodos, limpar, validarDuranteOPreenchimento };
}

/** Template do resumo de erros, com botões que levam o foco a cada campo. */
export function resumoDeErros(form, erros, rotulosExtras = {}) {
    const rotulo = (nome) =>
        rotulosExtras[nome] ?? form.querySelector(`label[for="${nome}"]`)?.firstChild.textContent.trim() ?? nome;

    return alerta({
        tipo: 'erro',
        papel: 'alert',
        titulo: erros.length === 1 ? 'Um campo precisa de atenção' : `${erros.length} campos precisam de atenção`,
        conteudo: html`
            <ul class="lista-erros">
                ${erros.map(({ nome, mensagem }) => html`
                    <li>
                        <button type="button" class="link-botao" data-focar="${nome}">${rotulo(nome)}</button>: ${mensagem}
                    </li>`)}
            </ul>`
    });
}

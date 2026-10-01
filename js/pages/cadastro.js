import { html, renderizar } from '../utils/html.js';
import { debounce } from '../utils/tempo.js';
import { campo, cabecalhoPagina, alerta } from '../components/componentes.js';
import { formasParticipacao } from '../data/dados.js';
import { aplicarMascaras } from '../modules/mascaras.js';
import { validarCampo } from '../modules/validacao.js';
import {
    criarValidador, resumoDeErros, dadosDoFormulario, preencherFormulario, focarCampo
} from '../modules/formulario.js';
import {
    adicionarCadastro, salvarRascunho, lerRascunho, descartarRascunho
} from '../modules/cadastros.js';
import { abrirModal, mostrarToast } from '../modules/interface.js';

/** Rótulos dos grupos que não têm <label for> (radio e checkbox). */
const ROTULOS_EXTRAS = { participacao: 'Forma de participação', consentimento: 'Consentimento' };

/* ---------- Template ---------- */
function formulario() {
    return html`
        <form class="formulario" novalidate data-formulario-cadastro>
            <fieldset class="formulario__grupo">
                <legend class="formulario__legenda">Dados pessoais</legend>
                <div class="grid">
                    ${campo({ id: 'nome', rotulo: 'Nome completo', autocomplete: 'name', minlength: 3, maxlength: 100 })}
                    ${campo({ id: 'email', rotulo: 'E-mail', tipo: 'email', colunas: 'col-12 col-md-6',
                              autocomplete: 'email', placeholder: 'nome@exemplo.com' })}
                    ${campo({ id: 'nascimento', rotulo: 'Data de nascimento', tipo: 'date', colunas: 'col-12 col-md-6',
                              autocomplete: 'bday', min: '1900-01-01', ajuda: 'É necessário ter 18 anos ou mais.' })}
                    ${campo({ id: 'cpf', rotulo: 'CPF', colunas: 'col-12 col-md-6', inputmode: 'numeric', maxlength: 14,
                              pattern: '[0-9]{3}\\.[0-9]{3}\\.[0-9]{3}-[0-9]{2}', placeholder: '000.000.000-00',
                              title: 'Digite o CPF no formato 000.000.000-00',
                              ajuda: 'Usado apenas para identificação. Não é salvo por completo.' })}
                    ${campo({ id: 'telefone', rotulo: 'Telefone', tipo: 'tel', colunas: 'col-12 col-md-6',
                              inputmode: 'tel', autocomplete: 'tel', maxlength: 15,
                              pattern: '\\([0-9]{2}\\) [0-9]{5}-[0-9]{4}', placeholder: '(00) 00000-0000',
                              title: 'Digite o telefone no formato (00) 00000-0000' })}
                </div>
            </fieldset>

            <fieldset class="formulario__grupo">
                <legend class="formulario__legenda">Endereço</legend>
                <div class="grid">
                    ${campo({ id: 'cep', rotulo: 'CEP', colunas: 'col-12 col-md-4', inputmode: 'numeric',
                              autocomplete: 'postal-code', maxlength: 9, pattern: '[0-9]{5}-[0-9]{3}',
                              placeholder: '00000-000', title: 'Digite o CEP no formato 00000-000' })}
                    ${campo({ id: 'endereco', rotulo: 'Endereço', colunas: 'col-12 col-md-8',
                              autocomplete: 'address-line1', placeholder: 'Rua, número e complemento', maxlength: 150 })}
                    ${campo({ id: 'cidade', rotulo: 'Cidade', colunas: 'col-12 col-md-8',
                              autocomplete: 'address-level2', maxlength: 60 })}
                    ${campo({ id: 'estado', rotulo: 'Estado (sigla)', colunas: 'col-12 col-md-4',
                              autocomplete: 'address-level1', minlength: 2, maxlength: 2,
                              pattern: '[A-Za-z]{2}', placeholder: 'PR',
                              title: 'Digite a sigla do estado com duas letras, por exemplo PR' })}
                </div>
            </fieldset>

            <fieldset class="formulario__grupo" aria-describedby="erro-participacao">
                <legend class="formulario__legenda">Forma de participação <abbr title="obrigatório">*</abbr></legend>
                ${Object.entries(formasParticipacao).map(([valor, rotulo], indice) => html`
                    <div class="formulario__opcao">
                        <input type="radio" id="participacao-${valor}" name="participacao" value="${valor}"
                               ${indice === 0 ? html`required` : ''}>
                        <label for="participacao-${valor}">${rotulo}</label>
                    </div>`)}
                <p id="erro-participacao" class="formulario__erro" hidden></p>
            </fieldset>

            <fieldset class="formulario__grupo">
                <legend class="formulario__legenda">Consentimento e envio</legend>
                <div class="formulario__opcao">
                    <input type="checkbox" id="consentimento" name="consentimento" value="sim"
                           aria-describedby="erro-consentimento" required>
                    <label for="consentimento">
                        Autorizo a ONG Mãos Solidárias a utilizar meus dados apenas para contato
                        sobre voluntariado e doações, conforme a LGPD. <abbr title="obrigatório">*</abbr>
                    </label>
                </div>
                <p id="erro-consentimento" class="formulario__erro" hidden></p>
                <div class="destaque__acoes">
                    <button type="submit" class="botao">Enviar cadastro</button>
                    <button type="reset" class="botao botao--secundario">Limpar formulário</button>
                </div>
            </fieldset>
        </form>`;
}

export const paginaCadastro = {
    titulo: 'Cadastro',

    render() {
        return html`
            ${cabecalhoPagina({
                titulo: 'Participe da nossa rede',
                subtitulo: 'Preencha o formulário para se tornar voluntário, doador ou ambos. Campos marcados com * são obrigatórios.'
            })}
            <div class="secao">
                <div class="container grid">
                    <div class="col-12 col-lg-8">
                        <div data-avisos></div>
                        ${formulario()}
                    </div>
                    <aside class="col-12 col-lg-4">
                        ${alerta({
                            tipo: 'info',
                            titulo: 'Antes de enviar',
                            conteudo: html`
                                <ul>
                                    <li>CPF, telefone e CEP são formatados automaticamente.</li>
                                    <li>O preenchimento é salvo como rascunho neste navegador (exceto o CPF).</li>
                                    <li>Entraremos em contato em até cinco dias úteis.</li>
                                </ul>`
                        })}
                    </aside>
                </div>
            </div>`;
    },

    montar(raiz) {
        const form = raiz.querySelector('[data-formulario-cadastro]');
        const avisos = raiz.querySelector('[data-avisos]');
        const validador = criarValidador(form, validarCampo);
        const salvarRascunhoDepois = debounce(() => salvarRascunho(dadosDoFormulario(form)), 500);

        aplicarMascaras(form);
        validador.validarDuranteOPreenchimento();
        form.addEventListener('input', salvarRascunhoDepois);

        /* ----- Rascunho recuperado do localStorage ----- */
        const rascunho = lerRascunho();
        if (rascunho) {
            preencherFormulario(form, rascunho);
            renderizar(avisos, alerta({
                tipo: 'info',
                titulo: 'Rascunho recuperado',
                mensagem: 'Restauramos o que você começou a preencher. Por segurança, o CPF precisa ser digitado novamente.',
                conteudo: html`<button type="button" class="botao botao--secundario" data-descartar-rascunho>Descartar rascunho</button>`
            }));
        }

        /* ----- Ações da área de avisos (delegação de eventos) ----- */
        avisos.addEventListener('click', ({ target }) => {
            const botaoFocar = target.closest('[data-focar]');
            if (botaoFocar) focarCampo(form, botaoFocar.dataset.focar);

            if (target.closest('[data-descartar-rascunho]')) {
                form.reset();
                avisos.replaceChildren();
                mostrarToast({ titulo: 'Rascunho descartado', tipo: 'info' });
            }
        });

        form.addEventListener('reset', () => {
            salvarRascunhoDepois.cancelar();
            descartarRascunho();
            validador.limpar();
        });

        /* ----- Envio ----- */
        form.addEventListener('submit', (evento) => {
            evento.preventDefault();

            const erros = validador.validarTodos();
            if (erros.length > 0) {
                renderizar(avisos, resumoDeErros(form, erros, ROTULOS_EXTRAS));
                avisos.scrollIntoView({ behavior: 'smooth', block: 'start' });
                return;
            }

            const cadastro = adicionarCadastro(dadosDoFormulario(form));
            if (!cadastro) {
                mostrarToast({ titulo: 'Não foi possível salvar', mensagem: 'O armazenamento do navegador está indisponível.', tipo: 'erro' });
                return;
            }

            form.reset(); // o evento reset cancela o rascunho pendente e limpa as marcações
            avisos.replaceChildren();
            confirmarCadastro(cadastro);
        });

        // Função de limpeza chamada pelo roteador ao trocar de tela
        return () => salvarRascunhoDepois.cancelar();
    }
};

function confirmarCadastro(cadastro) {
    const primeiroNome = cadastro.nome.split(' ')[0];
    document.querySelector('[data-confirmacao-mensagem]').textContent =
        `Obrigado, ${primeiroNome}! Entraremos em contato pelo e-mail ${cadastro.email} em até cinco dias úteis.`;
    abrirModal('modal-confirmacao');
}

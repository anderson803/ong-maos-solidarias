import { html, renderizar } from '../utils/html.js';
import { cabecalhoPagina, alerta, etiqueta } from '../components/componentes.js';
import { formasParticipacao } from '../data/dados.js';
import { listarCadastros, removerCadastro } from '../modules/cadastros.js';
import { mostrarToast } from '../modules/interface.js';
import { formatarDataHora, tempoRelativo } from '../modules/datas.js';

const variantePorParticipacao = { voluntariado: '', doacao: 'info', ambos: 'aviso' };


/** Template de um cadastro. Todos os dados digitados pelo usuário são escapados pelo html``. */
function cartaoCadastro(cadastro) {
    return html`
        <li class="registro col-12 col-md-6 col-xl-4">
            <div class="registro__cabecalho">
                <h3 class="registro__nome">${cadastro.nome}</h3>
                ${etiqueta(formasParticipacao[cadastro.participacao] ?? cadastro.participacao,
                           variantePorParticipacao[cadastro.participacao])}
            </div>
            <dl class="registro__dados">
                <dt>E-mail</dt><dd>${cadastro.email}</dd>
                <dt>Telefone</dt><dd>${cadastro.telefone}</dd>
                <dt>CPF</dt><dd>${cadastro.cpf}</dd>
                <dt>Cidade</dt><dd>${cadastro.cidade}/${cadastro.estado}</dd>
                <dt>Cadastrado em</dt>
                <dd>
                    <time datetime="${cadastro.criadoEm}">${formatarDataHora(cadastro.criadoEm)}</time>
                    ${tempoRelativo(cadastro.criadoEm) ? html`<span class="registro__relativo">(${tempoRelativo(cadastro.criadoEm)})</span>` : ''}
                </dd>
            </dl>
            <button type="button" class="botao botao--secundario botao--pequeno" data-remover="${cadastro.id}">
                Remover<span class="visualmente-oculto"> o cadastro de ${cadastro.nome}</span>
            </button>
        </li>`;
}

function conteudoPainel() {
    const cadastros = listarCadastros();

    if (cadastros.length === 0) {
        return alerta({
            tipo: 'info',
            titulo: 'Nenhum cadastro ainda',
            mensagem: 'Os cadastros enviados por este navegador aparecerão aqui.',
            conteudo: html`<a class="botao" href="#/cadastro">Fazer o primeiro cadastro</a>`
        });
    }

    const contagem = Object.keys(formasParticipacao).map((chave) => ({
        rotulo: formasParticipacao[chave],
        total: cadastros.filter((cadastro) => cadastro.participacao === chave).length
    }));

    return html`
        <ul class="grid">
            <li class="indicador col-12 col-sm-6 col-lg-3">
                <span class="indicador__numero">${cadastros.length}</span> cadastros no total
            </li>
            ${contagem.map(({ rotulo, total }) => html`
                <li class="indicador col-12 col-sm-6 col-lg-3">
                    <span class="indicador__numero">${total}</span> ${rotulo.toLowerCase()}
                </li>`)}
        </ul>
        <h2 class="secao__titulo painel__subtitulo">Cadastros recebidos</h2>
        <ul class="grid lista-registros">
            ${[...cadastros].reverse().map(cartaoCadastro)}
        </ul>`;
}

export const paginaPainel = {
    titulo: 'Painel de cadastros',

    render() {
        return html`
            ${cabecalhoPagina({
                titulo: 'Painel de cadastros',
                subtitulo: 'Simulação da área administrativa da ONG, com os dados salvos no armazenamento local do navegador.'
            })}
            <div class="secao">
                <div class="container" data-painel>${conteudoPainel()}</div>
            </div>`;
    },

    montar(raiz) {
        const painel = raiz.querySelector('[data-painel]');

        // Delegação de eventos: um único ouvinte atende a todos os botões "Remover"
        painel.addEventListener('click', (evento) => {
            const botao = evento.target.closest('[data-remover]');
            if (!botao) return;
            const nome = botao.closest('.registro').querySelector('.registro__nome').textContent;
            removerCadastro(botao.dataset.remover);
            renderizar(painel, conteudoPainel());
            painel.querySelector('h2, h3, a, button')?.focus();
            mostrarToast({ titulo: 'Cadastro removido', mensagem: nome, tipo: 'info' });
        });
    }
};

import { html, renderizar } from '../utils/html.js';
import { projetos } from '../data/dados.js';
import { cartaoProjeto, cabecalhoPagina, alerta } from '../components/componentes.js';

const categorias = ['Todos', ...new Set(projetos.map((projeto) => projeto.categoria))];

function listaDeProjetos(categoria) {
    const filtrados = categoria === 'Todos'
        ? projetos
        : projetos.filter((projeto) => projeto.categoria === categoria);
    return html`${filtrados.map((projeto) => cartaoProjeto(projeto, { detalhado: true }))}`;
}

export const paginaProjetos = {
    titulo: 'Projetos',

    render() {
        return html`
            ${cabecalhoPagina({
                titulo: 'Iniciativas solidárias',
                subtitulo: 'Conheça as ações que desenvolvemos e escolha como deseja participar: doando, sendo voluntário ou as duas coisas.',
                conteudo: html`
                    <nav class="atalhos" aria-label="Nesta página">
                        <ul class="atalhos__lista">
                            <li><a href="#/projetos/projetos-sociais">Projetos sociais</a></li>
                            <li><a href="#/projetos/doacoes">Doações</a></li>
                            <li><a href="#/projetos/voluntariado">Voluntariado</a></li>
                        </ul>
                    </nav>`
            })}

            <section id="projetos-sociais" class="secao" aria-labelledby="titulo-projetos">
                <div class="container">
                    <h2 id="titulo-projetos" class="secao__titulo">Projetos sociais</h2>
                    <div class="filtros" role="group" aria-label="Filtrar projetos por categoria">
                        ${categorias.map((categoria, indice) => html`
                            <button type="button" class="filtro" data-categoria="${categoria}"
                                    aria-pressed="${indice === 0 ? 'true' : 'false'}">${categoria}</button>`)}
                    </div>
                    <p class="texto-nota" data-contador aria-live="polite">${projetos.length} projetos exibidos.</p>
                    <div class="grid" data-lista-projetos>${listaDeProjetos('Todos')}</div>
                </div>
            </section>

            <div class="secao secao--alternada">
                <div class="container grid">
                    <section id="doacoes" class="col-12 col-lg-6" aria-labelledby="titulo-doacoes">
                        <h2 id="titulo-doacoes">Doações</h2>
                        <p>As doações mantêm os projetos funcionando: compra de alimentos,
                           material escolar, manutenção dos computadores e transporte.</p>
                        <h3>Formas de contribuir</h3>
                        <ul>
                            <li>Contribuição financeira mensal ou única;</li>
                            <li>Alimentos não perecíveis;</li>
                            <li>Livros e material escolar;</li>
                            <li>Computadores e acessórios em bom estado.</li>
                        </ul>
                        <p class="destaque__acoes">
                            <a class="botao" href="#/cadastro">Quero ser doador</a>
                            <button class="botao botao--secundario" type="button" data-abrir-modal="modal-doacao">
                                Como funciona a doação?
                            </button>
                        </p>
                    </section>

                    <section id="voluntariado" class="col-12 col-lg-6" aria-labelledby="titulo-voluntariado">
                        <h2 id="titulo-voluntariado">Voluntariado</h2>
                        <p>Não é preciso experiência: oferecemos uma conversa de acolhimento
                           e orientação antes da primeira atividade.</p>
                        <h3>Atividades disponíveis</h3>
                        <ul>
                            <li>Apoio na cozinha e na distribuição de refeições;</li>
                            <li>Reforço escolar e contação de histórias;</li>
                            <li>Aulas de informática básica;</li>
                            <li>Divulgação e organização de eventos.</li>
                        </ul>
                        <h3>Requisitos</h3>
                        <p>Ter 18 anos ou mais e disponibilidade de pelo menos quatro horas por mês.</p>
                        <p><a class="botao" href="#/cadastro">Quero ser voluntário</a></p>
                    </section>

                    <aside class="col-12">
                        ${alerta({
                            tipo: 'aviso',
                            titulo: 'Transparência',
                            mensagem: 'Publicamos anualmente a prestação de contas com a origem e a aplicação de todos os recursos recebidos.'
                        })}
                    </aside>
                </div>
            </div>`;
    },

    montar(raiz) {
        const grupo = raiz.querySelector('.filtros');
        const lista = raiz.querySelector('[data-lista-projetos]');
        const contador = raiz.querySelector('[data-contador]');

        // Filtro por categoria: o template da lista é gerado novamente a cada clique
        grupo.addEventListener('click', (evento) => {
            const botao = evento.target.closest('[data-categoria]');
            if (!botao) return;
            const categoria = botao.dataset.categoria;

            grupo.querySelectorAll('[data-categoria]').forEach((item) => {
                item.setAttribute('aria-pressed', String(item === botao));
            });
            renderizar(lista, listaDeProjetos(categoria));

            const total = lista.children.length;
            contador.textContent = `${total} ${total === 1 ? 'projeto exibido' : 'projetos exibidos'}.`;
        });
    }
};

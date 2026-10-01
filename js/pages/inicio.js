import { html } from '../utils/html.js';
import { projetos, indicadores } from '../data/dados.js';
import { cartaoProjeto, indicador, imagemResponsiva } from '../components/componentes.js';
import { listarCadastros } from '../modules/cadastros.js';

export const paginaInicio = {
    titulo: 'Início',

    render() {
        const totalCadastros = listarCadastros().length;
        return html`
            <section class="destaque" aria-labelledby="titulo-apresentacao">
                <div class="container grid grid--centro">
                    <div class="col-12 col-lg-7">
                        <h1 id="titulo-apresentacao" tabindex="-1">ONG Mãos Solidárias</h1>
                        <p class="destaque__subtitulo">
                            Transformamos solidariedade em oportunidades para famílias
                            em situação de vulnerabilidade em Curitiba e região.
                        </p>
                        <p class="destaque__acoes">
                            <a class="botao" href="#/projetos">Conheça nossos projetos</a>
                            <a class="botao botao--secundario" href="#/cadastro">Quero participar</a>
                        </p>
                    </div>
                    <div class="col-12 col-lg-5">
                        ${imagemResponsiva({
                            src: 'imagens/ong-maos-solidarias.jpg',
                            alt: 'Voluntários da ONG Mãos Solidárias reunidos em uma ação comunitária',
                            largura: 960,
                            altura: 640,
                            tamanhos: '(min-width: 992px) 42vw, 100vw',
                            classe: 'destaque__imagem',
                            prioridade: true
                        })}
                    </div>
                </div>
            </section>

            <section class="secao" aria-labelledby="titulo-sobre">
                <div class="container grid">
                    <div class="col-12 col-lg-6">
                        <h2 id="titulo-sobre" class="secao__titulo">Quem somos</h2>
                        <p>Somos uma organização sem fins lucrativos dedicada a promover inclusão social,
                           solidariedade e melhores oportunidades para pessoas em situação de vulnerabilidade.</p>
                        <h3>Nossa missão</h3>
                        <p>Desenvolver projetos sociais que fortaleçam a comunidade e incentivem a
                           participação de voluntários e doadores.</p>
                    </div>
                    <div class="col-12 col-lg-6">
                        <h3>Nossos valores</h3>
                        <ul>
                            <li>Respeito à dignidade de cada pessoa;</li>
                            <li>Transparência no uso dos recursos;</li>
                            <li>Participação ativa da comunidade;</li>
                            <li>Compromisso com resultados mensuráveis.</li>
                        </ul>
                    </div>
                </div>
            </section>

            <section class="secao secao--alternada" aria-labelledby="titulo-impacto">
                <div class="container">
                    <h2 id="titulo-impacto" class="secao__titulo">Impacto social</h2>
                    <ul class="grid">${indicadores.map((item) => indicador(item))}</ul>
                    <p class="texto-nota">Dados ilustrativos, criados para esta atividade acadêmica.</p>
                </div>
            </section>

            <section class="secao" aria-labelledby="titulo-destaques">
                <div class="container">
                    <h2 id="titulo-destaques" class="secao__titulo">Iniciativas em destaque</h2>
                    <div class="grid">${projetos.map((projeto) => cartaoProjeto(projeto))}</div>
                    <p><a href="#/projetos">Ver todos os projetos</a></p>
                </div>
            </section>

            <section class="secao secao--alternada" aria-labelledby="titulo-engajamento">
                <div class="container grid grid--centro">
                    <div class="col-12 col-md-8">
                        <h2 id="titulo-engajamento">Como ajudar</h2>
                        <p>Você pode contribuir como voluntário, doador ou das duas formas.
                           O cadastro leva poucos minutos.</p>
                        ${totalCadastros > 0
                            ? html`<p class="texto-nota">${totalCadastros} ${totalCadastros === 1 ? 'pessoa já se cadastrou' : 'pessoas já se cadastraram'} por este navegador.</p>`
                            : ''}
                    </div>
                    <div class="col-12 col-md-4">
                        <a class="botao" href="#/cadastro">Fazer meu cadastro</a>
                    </div>
                </div>
            </section>

            <section class="secao" aria-labelledby="titulo-contato">
                <div class="container">
                    <h2 id="titulo-contato" class="secao__titulo">Entre em contato</h2>
                    <address class="grid">
                        <p class="col-12 col-md-4"><strong>Telefone:</strong><br><a href="tel:+5541999999999">(41) 99999-9999</a></p>
                        <p class="col-12 col-md-4"><strong>E-mail:</strong><br><a href="mailto:contato@maossolidarias.org.br">contato@maossolidarias.org.br</a></p>
                        <p class="col-12 col-md-4"><strong>Endereço:</strong><br>Rua da Solidariedade, 100 — Curitiba/PR</p>
                    </address>
                </div>
            </section>`;
    }
};

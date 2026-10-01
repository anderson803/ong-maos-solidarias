/**
 * Componentes visuais reutilizáveis.
 * Cada função recebe dados e devolve um template. As mesmas funções são usadas
 * em várias telas, garantindo aparência consistente e menos código repetido.
 */
import { html, atributos } from '../utils/html.js';

/** Etiqueta (badge) de categoria ou status. */
export function etiqueta(texto, variante = '', classeExtra = '') {
    const classes = ['etiqueta', variante && `etiqueta--${variante}`, classeExtra].filter(Boolean).join(' ');
    return html`<span class="${classes}">${texto}</span>`;
}

/** Alerta contextual: info, sucesso, aviso ou erro. */
export function alerta({ tipo = 'info', titulo, mensagem, conteudo = '', id = '', papel = '' }) {
    return html`
        <div ${atributos({ id: id || null, role: papel || null })} class="alerta alerta--${tipo}">
            <div>
                ${titulo ? html`<h2 class="alerta__titulo">${titulo}</h2>` : ''}
                ${mensagem ? html`<p>${mensagem}</p>` : ''}
                ${conteudo}
            </div>
        </div>`;
}

/** Indicador numérico de impacto. */
export function indicador({ numero, texto }, colunas = 'col-12 col-sm-6 col-lg-4') {
    return html`<li class="indicador ${colunas}"><span class="indicador__numero">${numero}</span> ${texto}</li>`;
}

/**
 * Imagem responsiva e otimizada.
 * Entrega WebP em dois tamanhos (o navegador escolhe pelo "sizes") e mantém o
 * JPEG como alternativa. As versões são geradas por scripts/otimizar_imagens.py.
 * width/height reservam o espaço e evitam que o layout "pule" ao carregar.
 */
export function imagemResponsiva({ src, alt, largura, altura, tamanhos, classe = '', prioridade = false }) {
    const base = src.replace(/\.jpg$/, '');
    return html`
        <picture>
            <source type="image/webp" sizes="${tamanhos}"
                    srcset="${base}-480.webp 480w, ${base}.webp ${largura}w">
            <img class="${classe}" src="${src}" alt="${alt}" width="${largura}" height="${altura}"
                 decoding="async" ${atributos(prioridade ? { fetchpriority: 'high' } : { loading: 'lazy' })}>
        </picture>`;
}

/**
 * Cartão de projeto.
 * Versão resumida (página inicial) ou detalhada (página de projetos).
 */
export function cartaoProjeto(projeto, { detalhado = false } = {}) {
    const colunas = 'col-12 col-md-6 col-lg-4';
    return html`
        <article ${atributos({ id: detalhado ? projeto.id : null })} class="cartao ${colunas}"
                 aria-labelledby="titulo-${projeto.id}">
            ${imagemResponsiva({
                src: projeto.imagem,
                alt: detalhado ? projeto.alt : '',
                largura: 800,
                altura: 500,
                tamanhos: '(min-width: 992px) 33vw, (min-width: 768px) 50vw, 100vw',
                classe: 'cartao__imagem'
            })}
            <div class="cartao__corpo">
                ${etiqueta(projeto.categoria, projeto.variante, 'cartao__etiqueta')}
                <h3 id="titulo-${projeto.id}" class="cartao__titulo">${projeto.titulo}</h3>
                <p class="cartao__texto">${detalhado ? projeto.descricao : projeto.resumo}</p>
                ${detalhado ? html`
                    <dl class="cartao__detalhes">
                        <dt>Público atendido</dt>
                        <dd>${projeto.publico}</dd>
                        <dt>Como participar</dt>
                        <dd>${projeto.participacao}</dd>
                    </dl>
                    <a class="botao botao--secundario cartao__acao" href="#/cadastro">
                        Apoiar ${projeto.artigo} ${projeto.titulo}
                    </a>` : ''}
            </div>
        </article>`;
}

/**
 * Campo de formulário com rótulo, texto de ajuda e área de mensagem de erro.
 * Os atributos extras (pattern, maxlength, autocomplete...) são repassados ao <input>.
 */
export function campo({ id, rotulo, tipo = 'text', colunas = 'col-12', ajuda = '', obrigatorio = true, ...extras }) {
    const descricao = [ajuda && `ajuda-${id}`, `erro-${id}`].filter(Boolean).join(' ');
    return html`
        <div class="formulario__campo ${colunas}">
            <label class="formulario__rotulo" for="${id}">
                ${rotulo}${obrigatorio ? html` <abbr title="obrigatório">*</abbr>` : ''}
            </label>
            <input class="formulario__entrada" type="${tipo}" id="${id}" name="${id}"
                   aria-describedby="${descricao}" ${atributos({ required: obrigatorio, ...extras })}>
            ${ajuda ? html`<small id="ajuda-${id}" class="formulario__ajuda">${ajuda}</small>` : ''}
            <p id="erro-${id}" class="formulario__erro" hidden></p>
        </div>`;
}

/** Cabeçalho (hero) de página interna. */
export function cabecalhoPagina({ titulo, subtitulo, conteudo = '' }) {
    return html`
        <div class="destaque">
            <div class="container">
                <h1 tabindex="-1">${titulo}</h1>
                ${subtitulo ? html`<p class="destaque__subtitulo">${subtitulo}</p>` : ''}
                ${conteudo}
            </div>
        </div>`;
}

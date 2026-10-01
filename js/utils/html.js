/**
 * Sistema de templates da aplicação.
 *
 * A função html`` é uma "tagged template literal": ela recebe o texto fixo do
 * template e os valores interpolados separadamente. Todo valor é ESCAPADO antes
 * de entrar no HTML, o que impede ataques de XSS quando o conteúdo vem do
 * usuário (por exemplo, um nome digitado no formulário e exibido no painel).
 *
 * Templates podem ser aninhados: um html`` dentro de outro não é escapado de novo,
 * e listas (arrays) de templates são concatenadas automaticamente.
 */

const ENTIDADES = { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' };

/** Converte caracteres especiais em entidades HTML. */
export function escapar(valor) {
    return String(valor).replace(/[&<>"']/g, (caractere) => ENTIDADES[caractere]);
}

/** Marca um trecho como HTML já tratado (não será escapado novamente). */
class HTMLSeguro {
    constructor(texto) {
        this.texto = texto;
    }

    toString() {
        return this.texto;
    }
}

function converter(valor) {
    if (valor instanceof HTMLSeguro) return valor.texto;
    if (Array.isArray(valor)) return valor.map(converter).join('');
    if (valor === null || valor === undefined || valor === false) return '';
    return escapar(valor);
}

/** Tag de template: html`<p>${texto}</p>` */
export function html(partes, ...valores) {
    const resultado = partes.reduce(
        (acumulado, parte, indice) => acumulado + converter(valores[indice - 1]) + parte
    );
    return new HTMLSeguro(resultado);
}

/** Gera atributos HTML a partir de um objeto: { required: true, maxlength: 14 } */
export function atributos(objeto) {
    const texto = Object.entries(objeto)
        .filter(([, valor]) => valor !== false && valor !== null && valor !== undefined)
        .map(([nome, valor]) => (valor === true ? nome : `${nome}="${escapar(valor)}"`))
        .join(' ');
    return new HTMLSeguro(texto);
}

/** Desenha um template dentro de um elemento da página. */
export function renderizar(alvo, template) {
    alvo.innerHTML = template instanceof HTMLSeguro ? template.texto : escapar(template);
}

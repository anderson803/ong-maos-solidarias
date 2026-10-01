/**
 * Roteador da SPA (Single Page Application).
 *
 * A navegação usa o fragmento do endereço (hash): #/inicio, #/projetos, #/cadastro...
 * Ao mudar o hash, o navegador NÃO recarrega a página; o roteador apenas troca o
 * conteúdo do <main id="app"> pelo template da tela correspondente.
 *
 * Formato: #/pagina/secao  →  ex.: #/projetos/voluntariado rola até a seção "voluntariado".
 */
import { renderizar } from './utils/html.js';
import { fecharMenu } from './modules/interface.js';

const NOME_SITE = 'ONG Mãos Solidárias';

let rotas = {};
let paginaPadrao;
let paginaNaoEncontrada;
let raiz;
let desmontarAtual = null;
let primeiraNavegacao = true;

function lerRota() {
    const hash = location.hash;
    if (hash && !hash.startsWith('#/')) return null; // âncora comum (ex.: #app), não é rota
    const [, pagina = '', secao = ''] = hash.replace(/^#/, '').split('/');
    return { pagina, secao };
}

function atualizarMenu(pagina) {
    document.querySelectorAll('[data-rota]').forEach((link) => {
        if (link.dataset.rota === pagina) link.setAttribute('aria-current', 'page');
        else link.removeAttribute('aria-current');
    });
}

function posicionarFoco(secao) {
    const alvo = secao ? document.getElementById(secao) : null;
    if (alvo) {
        alvo.scrollIntoView({ behavior: 'smooth', block: 'start' });
        alvo.setAttribute('tabindex', '-1');
        alvo.focus({ preventScroll: true });
        return;
    }
    window.scrollTo(0, 0);
    // Leva o foco ao título da nova tela para que o leitor de tela anuncie a mudança.
    // Na primeira carga o foco fica no início do documento, como em qualquer site.
    if (!primeiraNavegacao) raiz.querySelector('h1')?.focus();
}

function navegar() {
    // Endereço sem rota (ex.: site aberto pela primeira vez): normaliza para #/inicio.
    // O replace dispara um novo hashchange, que desenha a tela.
    if (!location.hash) {
        location.replace('#/inicio');
        return;
    }

    const rota = lerRota();
    if (!rota) {
        if (primeiraNavegacao) location.replace('#/inicio');
        return;
    }

    const nome = rota.pagina || 'inicio';
    const pagina = rotas[nome] ?? (rota.pagina ? paginaNaoEncontrada : paginaPadrao);

    // Remove ouvintes e temporizadores da tela anterior
    if (typeof desmontarAtual === 'function') desmontarAtual();

    renderizar(raiz, pagina.render(rota));
    raiz.classList.remove('pagina-entrada');
    void raiz.offsetWidth; // reinicia a animação de entrada
    raiz.classList.add('pagina-entrada');

    desmontarAtual = pagina.montar?.(raiz, rota) ?? null;

    document.title = `${pagina.titulo} | ${NOME_SITE}`;
    atualizarMenu(rotas[nome] ? nome : '');
    fecharMenu();
    posicionarFoco(rota.secao);
    primeiraNavegacao = false;
}

/** Navega por código (ex.: após enviar um formulário). */
export function irPara(caminho) {
    location.hash = caminho;
}

export function iniciarRoteador({ elemento, paginas, inicial, naoEncontrada }) {
    raiz = elemento;
    rotas = paginas;
    paginaPadrao = inicial;
    paginaNaoEncontrada = naoEncontrada;
    window.addEventListener('hashchange', navegar);
    navegar();
}

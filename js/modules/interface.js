/**
 * Componentes de interface globais: menu hambúrguer, modais e toast.
 * São iniciados uma única vez, pois ficam na "moldura" da SPA (fora do #app).
 */

/* ===== LINK "PULAR PARA O CONTEÚDO" ===== */
export function iniciarAtalhoConteudo() {
    const atalho = document.querySelector('.pular-conteudo');
    if (!atalho) return;
    atalho.addEventListener('click', (evento) => {
        // Impede que a âncora #app altere o endereço e seja confundida com uma rota da SPA
        evento.preventDefault();
        const destino = document.querySelector('#app h1') ?? document.getElementById('app');
        destino.focus();
        destino.scrollIntoView({ block: 'start' });
    });
}

/* ===== MENU HAMBÚRGUER ===== */
let navegacao;
let botaoMenu;

export function fecharMenu() {
    if (!navegacao) return;
    navegacao.classList.remove('navegacao--aberta');
    botaoMenu.setAttribute('aria-expanded', 'false');
}

export function iniciarMenu() {
    navegacao = document.querySelector('.navegacao');
    botaoMenu = document.querySelector('.navegacao__botao');
    if (!navegacao || !botaoMenu) return;

    botaoMenu.addEventListener('click', () => {
        const abrir = botaoMenu.getAttribute('aria-expanded') !== 'true';
        navegacao.classList.toggle('navegacao--aberta', abrir);
        botaoMenu.setAttribute('aria-expanded', String(abrir));
    });

    document.addEventListener('keydown', (evento) => {
        if (evento.key !== 'Escape') return;
        if (fecharSubmenu()) return;
        if (navegacao.classList.contains('navegacao--aberta')) {
            fecharMenu();
            botaoMenu.focus();
        }
    });

    // O submenu abre com o mouse ou com o foco. Ao sair dele, a classe que o
    // mantinha fechado é removida, para que volte a abrir normalmente.
    navegacao.querySelectorAll('.navegacao__item--submenu').forEach((item) => {
        const reabilitar = () => item.classList.remove('navegacao__item--fechado');
        item.addEventListener('mouseleave', reabilitar);
        item.addEventListener('focusout', (evento) => {
            if (!item.contains(evento.relatedTarget)) reabilitar();
        });
    });
}

/**
 * Fecha o submenu aberto pelo mouse ou pelo teclado (WCAG 1.4.13: conteúdo
 * exibido ao passar o mouse ou focar deve poder ser dispensado com Esc).
 * Retorna true se havia um submenu aberto.
 */
function fecharSubmenu() {
    const item = [...document.querySelectorAll('.navegacao__item--submenu')]
        .find((el) => el.matches(':hover, :focus-within') && !el.classList.contains('navegacao__item--fechado'));
    if (!item || getComputedStyle(item.querySelector('.submenu')).position !== 'absolute') return false;
    item.classList.add('navegacao__item--fechado');
    if (item.contains(document.activeElement)) item.querySelector('.navegacao__link').focus();
    return true;
}

/* ===== MODAIS ===== */
export function abrirModal(id) {
    const modal = document.getElementById(id);
    if (modal && !modal.open) modal.showModal();
    return modal;
}

export function iniciarModais() {
    // Delegação de eventos: os botões são criados depois, pelas telas da SPA,
    // então o ouvinte fica no documento e verifica quem foi clicado.
    document.addEventListener('click', (evento) => {
        const abridor = evento.target.closest('[data-abrir-modal]');
        if (abridor) abrirModal(abridor.dataset.abrirModal);

        const fechador = evento.target.closest('[data-fechar-modal]');
        if (fechador) fechador.closest('dialog')?.close();
    });

    // Clique no fundo escurecido fecha o modal
    document.querySelectorAll('dialog.modal').forEach((modal) => {
        modal.addEventListener('click', (evento) => {
            if (evento.target === modal) modal.close();
        });
    });
}

/* ===== TOAST ===== */
let temporizadorToast;

export function mostrarToast({ titulo, mensagem = '', tipo = 'sucesso', duracao = 4000 }) {
    const toast = document.getElementById('toast');
    if (!toast) return;
    toast.className = `alerta alerta--${tipo} toast toast--visivel`;
    // textContent: o conteúdo nunca é interpretado como HTML
    toast.querySelector('[data-toast-titulo]').textContent = titulo;
    toast.querySelector('[data-toast-mensagem]').textContent = mensagem;
    clearTimeout(temporizadorToast);
    temporizadorToast = setTimeout(() => toast.classList.remove('toast--visivel'), duracao);
}

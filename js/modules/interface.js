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
        if (evento.key === 'Escape' && navegacao.classList.contains('navegacao--aberta')) {
            fecharMenu();
            botaoMenu.focus();
        }
    });
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

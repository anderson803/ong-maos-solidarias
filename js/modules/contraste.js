/**
 * Botão "Alto contraste" do cabeçalho.
 * O estado inicial é aplicado por js/contraste-inicial.js; aqui o botão
 * alterna o modo, informa o estado com aria-pressed e salva a escolha.
 */
import { gravar } from './storage.js';

const CHAVE = 'contraste';

function aplicar(modo, botao) {
    document.documentElement.setAttribute('data-contraste', modo);
    botao.setAttribute('aria-pressed', String(modo === 'alto'));
}

export function iniciarContraste() {
    const botao = document.querySelector('[data-alternar-contraste]');
    if (!botao) return;

    aplicar(document.documentElement.getAttribute('data-contraste') === 'alto' ? 'alto' : 'normal', botao);

    botao.addEventListener('click', () => {
        const novo = botao.getAttribute('aria-pressed') === 'true' ? 'normal' : 'alto';
        aplicar(novo, botao);
        gravar(CHAVE, novo);
    });
}

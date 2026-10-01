/**
 * Aplica o modo de alto contraste ANTES de a página ser desenhada, evitando
 * que ela apareça por um instante com as cores normais.
 * É um script clássico (não é módulo) carregado no <head> sem "defer".
 * A chave segue o mesmo padrão de js/modules/storage.js.
 */
(function () {
    var preferencia = null;
    try {
        preferencia = JSON.parse(localStorage.getItem('maos-solidarias:contraste'));
    } catch (erro) { /* armazenamento indisponível: segue a preferência do sistema */ }

    // Sem escolha salva, respeita a configuração de contraste do sistema operacional
    if (preferencia !== 'alto' && preferencia !== 'normal') {
        preferencia = window.matchMedia && matchMedia('(prefers-contrast: more)').matches ? 'alto' : 'normal';
    }
    document.documentElement.setAttribute('data-contraste', preferencia);
})();

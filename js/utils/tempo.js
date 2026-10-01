/**
 * Utilitário de temporização.
 * debounce: adia a execução de uma função até que ela pare de ser chamada por
 * um intervalo. Usado para salvar o rascunho só depois que a pessoa para de digitar,
 * em vez de gravar no localStorage a cada tecla.
 */
export function debounce(funcao, espera = 300) {
    let temporizador;

    function executarDepois(...argumentos) {
        clearTimeout(temporizador);
        temporizador = setTimeout(() => funcao(...argumentos), espera);
    }

    // Permite cancelar uma execução pendente (ex.: ao enviar o formulário ou trocar de tela)
    executarDepois.cancelar = () => clearTimeout(temporizador);
    return executarDepois;
}

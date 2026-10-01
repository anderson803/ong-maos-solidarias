/**
 * Camada de armazenamento (localStorage).
 * Centraliza leitura e gravação para que o restante do código não precise
 * lidar com JSON, prefixos de chave ou erros do navegador.
 */

const PREFIXO = 'maos-solidarias:';

/** Lê um valor salvo. Retorna o valor padrão se não existir ou se houver erro. */
export function ler(chave, padrao = null) {
    try {
        const texto = localStorage.getItem(PREFIXO + chave);
        return texto === null ? padrao : JSON.parse(texto);
    } catch (erro) {
        // Navegação privada, armazenamento cheio ou dado corrompido
        console.warn(`Não foi possível ler "${chave}" do armazenamento.`, erro);
        return padrao;
    }
}

/** Grava um valor (objetos e listas são convertidos em texto JSON). */
export function gravar(chave, valor) {
    try {
        localStorage.setItem(PREFIXO + chave, JSON.stringify(valor));
        return true;
    } catch (erro) {
        console.warn(`Não foi possível gravar "${chave}" no armazenamento.`, erro);
        return false;
    }
}

/** Remove um valor salvo. */
export function remover(chave) {
    try {
        localStorage.removeItem(PREFIXO + chave);
    } catch (erro) {
        console.warn(`Não foi possível remover "${chave}" do armazenamento.`, erro);
    }
}

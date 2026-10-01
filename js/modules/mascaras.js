/**
 * Máscaras de digitação.
 * Inserem a pontuação enquanto o usuário digita; a validação continua
 * sendo feita pelo atributo pattern e pelo módulo de validação.
 */

export const mascaras = {
    cpf: (v) => v.slice(0, 11)
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d)/, '$1.$2')
        .replace(/(\d{3})(\d{1,2})$/, '$1-$2'),
    telefone: (v) => v.slice(0, 11)
        .replace(/^(\d{2})(\d)/, '($1) $2')
        .replace(/(\d{5})(\d{1,4})$/, '$1-$2'),
    cep: (v) => v.slice(0, 8)
        .replace(/(\d{5})(\d{1,3})$/, '$1-$2')
};

/** Aplica as máscaras aos campos existentes dentro de um formulário. */
export function aplicarMascaras(formulario) {
    Object.keys(mascaras).forEach((nome) => {
        const campo = formulario.elements[nome];
        if (!campo) return;
        campo.addEventListener('input', () => {
            campo.value = mascaras[nome](campo.value.replace(/\D/g, ''));
        });
    });

    const estado = formulario.elements.estado;
    if (estado) {
        estado.addEventListener('input', () => {
            estado.value = estado.value.toUpperCase();
        });
    }
}

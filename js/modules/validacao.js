/**
 * Regras de validação do formulário de cadastro.
 * Combina a validação nativa do HTML5 (required, pattern, type) com regras de
 * consistência que o HTML não consegue verificar sozinho, como os dígitos
 * verificadores do CPF e a idade mínima.
 *
 * Importante: validação no navegador melhora a experiência, mas não substitui
 * a validação no servidor, que é quem garante a segurança dos dados.
 */
import { estados } from '../data/dados.js';
import { emailJaCadastrado } from './cadastros.js';
import { calcularIdade, dataNoFuturo } from './datas.js';

/** Confere os dois dígitos verificadores do CPF. */
export function cpfValido(cpf) {
    const d = cpf.replace(/\D/g, '');
    if (d.length !== 11 || /^(\d)\1{10}$/.test(d)) return false; // ex.: 111.111.111-11

    const digitoVerificador = (quantidade) => {
        let soma = 0;
        for (let i = 0; i < quantidade; i++) {
            soma += Number(d[i]) * (quantidade + 1 - i);
        }
        const resto = (soma * 10) % 11;
        return resto === 10 ? 0 : resto;
    };

    return digitoVerificador(9) === Number(d[9]) && digitoVerificador(10) === Number(d[10]);
}

/** Regras extras por campo: retornam uma mensagem de erro ou string vazia. */
const regras = {
    nome: (valor) =>
        valor.trim().split(/\s+/).length < 2 ? 'Informe nome e sobrenome.' : '',
    email: (valor) =>
        emailJaCadastrado(valor) ? 'Este e-mail já foi cadastrado.' : '',
    nascimento: (valor) => {
        if (dataNoFuturo(valor)) return 'A data de nascimento não pode estar no futuro.';
        const idade = calcularIdade(valor);
        if (idade < 18) return 'É necessário ter 18 anos ou mais para se cadastrar.';
        if (idade > 120) return 'Confira o ano de nascimento.';
        return '';
    },
    cpf: (valor) => (cpfValido(valor) ? '' : 'CPF inválido. Confira os números digitados.'),
    estado: (valor) =>
        estados.includes(valor.toUpperCase()) ? '' : 'Informe uma sigla de estado válida, como PR.'
};

/** Mensagens amigáveis para os erros da validação nativa. */
function mensagemNativa(campo) {
    const v = campo.validity;
    if (v.valueMissing) {
        if (campo.type === 'radio') return 'Escolha uma forma de participação.';
        if (campo.type === 'checkbox') return 'É preciso autorizar o uso dos dados para concluir o cadastro.';
        return 'Este campo é obrigatório.';
    }
    if (v.typeMismatch && campo.type === 'email') return 'Informe um e-mail válido, como nome@exemplo.com.';
    if (v.tooShort) return `Digite pelo menos ${campo.minLength} caracteres.`;
    if (v.patternMismatch) return campo.title || 'Formato inválido.';
    if (v.rangeUnderflow || v.rangeOverflow) return 'Confira a data informada.';
    return '';
}

/** Valida um campo e retorna a mensagem de erro (ou string vazia se estiver correto). */
export function validarCampo(campo) {
    const nativa = mensagemNativa(campo);
    if (nativa) return nativa;
    const regra = regras[campo.name];
    return regra && campo.value ? regra(campo.value) : '';
}

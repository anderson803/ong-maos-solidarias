/**
 * Repositório de cadastros.
 * Simula uma pequena "tabela" de banco de dados usando o localStorage.
 *
 * Privacidade: o CPF completo NÃO é armazenado. O localStorage pode ser lido por
 * qualquer script da página e fica no computador do usuário sem criptografia.
 * Em produção, os dados seriam enviados a um servidor seguro (HTTPS), validados
 * novamente no back-end e protegidos conforme a LGPD.
 */
import { ler, gravar, remover } from './storage.js';

const CHAVE_CADASTROS = 'cadastros';
const CHAVE_RASCUNHO = 'rascunho-cadastro';

function gerarId() {
    return typeof crypto !== 'undefined' && crypto.randomUUID
        ? crypto.randomUUID()
        : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

/** Exibe apenas os dois últimos dígitos do CPF. */
export function mascararCpf(cpf) {
    const digitos = cpf.replace(/\D/g, '');
    return `***.***.***-${digitos.slice(-2)}`;
}

export function listarCadastros() {
    return ler(CHAVE_CADASTROS, []);
}

export function adicionarCadastro(dados) {
    const cadastro = {
        id: gerarId(),
        nome: dados.nome.trim(),
        email: dados.email.trim().toLowerCase(),
        telefone: dados.telefone,
        cpf: mascararCpf(dados.cpf),
        cidade: dados.cidade.trim(),
        estado: dados.estado.toUpperCase(),
        participacao: dados.participacao,
        criadoEm: new Date().toISOString()
    };
    const cadastros = listarCadastros();
    cadastros.push(cadastro);
    return gravar(CHAVE_CADASTROS, cadastros) ? cadastro : null;
}

export function removerCadastro(id) {
    const restantes = listarCadastros().filter((cadastro) => cadastro.id !== id);
    gravar(CHAVE_CADASTROS, restantes);
    return restantes;
}

export function emailJaCadastrado(email) {
    const normalizado = email.trim().toLowerCase();
    return listarCadastros().some((cadastro) => cadastro.email === normalizado);
}

/* ----- Rascunho do formulário (sem CPF e sem consentimento) ----- */
export function salvarRascunho(dados) {
    const { cpf, consentimento, ...seguro } = dados;
    // Não guarda rascunho vazio
    if (Object.values(seguro).every((valor) => !valor)) {
        remover(CHAVE_RASCUNHO);
        return;
    }
    gravar(CHAVE_RASCUNHO, seguro);
}

export function lerRascunho() {
    return ler(CHAVE_RASCUNHO, null);
}

export function descartarRascunho() {
    remover(CHAVE_RASCUNHO);
}

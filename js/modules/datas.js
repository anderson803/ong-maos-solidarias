/**
 * Adaptador da biblioteca externa Day.js (manipulação de datas).
 *
 * A Day.js é carregada via CDN no html/index.html e cria a variável global
 * window.dayjs. Este módulo é o ÚNICO ponto do projeto que acessa essa variável:
 * o restante do código importa as funções abaixo. Isso evita conflitos de escopo
 * e permite trocar a biblioteca no futuro alterando apenas este arquivo.
 *
 * Se o CDN estiver indisponível, as funções usam um plano B com recursos nativos
 * do JavaScript (Date e Intl), e a aplicação continua funcionando.
 */

const dayjs = window.dayjs;
let bibliotecaAtiva = false;

if (typeof dayjs === 'function') {
    // Plugin que habilita frases relativas ("há 5 minutos")
    if (window.dayjs_plugin_relativeTime) dayjs.extend(window.dayjs_plugin_relativeTime);
    // Idioma português do Brasil (registrado pelo arquivo locale/pt-br.js)
    dayjs.locale('pt-br');
    bibliotecaAtiva = true;
}

export function bibliotecaDatasAtiva() {
    return bibliotecaAtiva;
}

/** Idade em anos completos a partir de uma data AAAA-MM-DD. */
export function calcularIdade(dataIso, hoje = new Date()) {
    if (bibliotecaAtiva) return dayjs(hoje).diff(dayjs(dataIso), 'year');

    // Plano B: cálculo manual
    const [ano, mes, dia] = dataIso.split('-').map(Number);
    let idade = hoje.getFullYear() - ano;
    const aindaNaoFezAniversario =
        hoje.getMonth() + 1 < mes || (hoje.getMonth() + 1 === mes && hoje.getDate() < dia);
    if (aindaNaoFezAniversario) idade--;
    return idade;
}

/** Indica se a data é posterior a hoje. */
export function dataNoFuturo(dataIso) {
    if (bibliotecaAtiva) return dayjs(dataIso).isAfter(dayjs(), 'day');
    return new Date(`${dataIso}T00:00:00`) > new Date();
}

/** Data e hora no formato brasileiro: 29/09/2026 às 22:58 */
export function formatarDataHora(iso) {
    if (bibliotecaAtiva) return dayjs(iso).format('DD/MM/YYYY [às] HH:mm');
    const data = new Date(iso);
    const dia = data.toLocaleDateString('pt-BR');
    const hora = data.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    return `${dia} às ${hora}`;
}

/** Tempo relativo: "há 5 minutos". Sem a biblioteca, retorna texto vazio. */
export function tempoRelativo(iso) {
    return bibliotecaAtiva ? dayjs(iso).fromNow() : '';
}

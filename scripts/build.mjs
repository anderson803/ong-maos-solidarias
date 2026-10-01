/**
 * Build de produção — gera a pasta dist/ pronta para publicação.
 *
 *   npm run build      (ou: node scripts/build.mjs)
 *
 * Não depende de pacotes externos: usa apenas o Node.js (18+).
 * - HTML: remove comentários e espaços repetidos;
 * - CSS: remove comentários, espaços e o último ";" de cada bloco;
 * - JavaScript: remove comentários e indentação, preservando o conteúdo de
 *   textos, templates e expressões regulares;
 * - imagens: copia apenas os formatos usados pelo site (JPEG, WebP e SVG).
 * Ao final, mostra o tamanho de cada tipo de arquivo antes e depois.
 */
import { readFile, writeFile, mkdir, rm, readdir, copyFile, stat } from 'node:fs/promises';
import { dirname, extname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const RAIZ = join(dirname(fileURLToPath(import.meta.url)), '..');
const DIST = join(RAIZ, 'dist');

// O que vai para produção (testes, scripts e documentação ficam de fora)
const ENTRADAS = ['index.html', '.nojekyll', 'css', 'js', 'imagens'];
const IMAGENS = new Set(['.jpg', '.webp', '.svg', '.png', '.ico']);

/* ===================== HTML ===================== */
export function minificarHtml(codigo) {
    return codigo
        .replace(/<!--[\s\S]*?-->/g, '')   // comentários
        .replace(/\s+/g, ' ')              // espaços e quebras repetidos viram um espaço
        .replace(/>\s+</g, '> <')          // um espaço entre tags (preserva o espaçamento visual)
        .trim();
}

/* ===================== CSS ===================== */
export function minificarCss(codigo) {
    let saida = '';
    for (let i = 0; i < codigo.length; i++) {
        const c = codigo[i];
        if (c === '/' && codigo[i + 1] === '*') {            // comentário
            i = codigo.indexOf('*/', i + 2) + 1;
            continue;
        }
        if (c === '"' || c === "'") {                         // texto entre aspas: copiado intacto
            const fim = fimDoTexto(codigo, i);
            saida += codigo.slice(i, fim + 1);
            i = fim;
            continue;
        }
        saida += c;
    }
    return saida
        .replace(/\s+/g, ' ')
        .replace(/\s*([{};,>])\s*/g, '$1')    // espaços ao redor de { } ; , >
        .replace(/:\s+/g, ':')                // espaço depois de ":" (antes é preservado: ".a :hover")
        .replace(/;}/g, '}')                  // último ";" do bloco
        .trim();
}

/* ===================== JavaScript ===================== */
const PALAVRAS_ANTES_DE_REGEX = new Set(['return', 'typeof', 'case', 'do', 'else', 'in', 'of', 'new', 'delete', 'void', 'throw', 'yield', 'await']);
const PONTUACAO = new Set('{}()[];,:=<>+-*%&|^!~?.'.split(''));

function fimDoTexto(codigo, inicio) {
    const aspas = codigo[inicio];
    let i = inicio + 1;
    while (i < codigo.length && codigo[i] !== aspas) {
        if (codigo[i] === '\\') i++;
        i++;
    }
    return i;
}

function fimDaRegex(codigo, inicio) {
    let i = inicio + 1;
    let emClasse = false;
    while (i < codigo.length) {
        const c = codigo[i];
        if (c === '\\') i++;
        else if (c === '[') emClasse = true;
        else if (c === ']') emClasse = false;
        else if (c === '/' && !emClasse) break;
        i++;
    }
    i++;
    while (/[a-z]/i.test(codigo[i] ?? '')) i++;   // flags (g, i, u...)
    return i - 1;
}

/** Decide se "/" inicia uma expressão regular olhando o que veio antes. */
function iniciaRegex(saida) {
    const anterior = saida.trimEnd();
    if (!anterior) return true;
    const ultimo = anterior[anterior.length - 1];
    if (')]'.includes(ultimo)) return false;
    if ('(,=:[!&|?{};+-*%<>~^'.includes(ultimo)) return true;
    const palavra = anterior.match(/[A-Za-z_$][\w$]*$/);
    return Boolean(palavra && PALAVRAS_ANTES_DE_REGEX.has(palavra[0]));
}

/**
 * Minifica um trecho de código. Quando "dentroDeTemplate" é verdadeiro, para no
 * "}" que fecha uma expressão ${...} e devolve a posição dele.
 */
function minificarTrecho(codigo, inicio = 0, dentroDeTemplate = false) {
    let saida = '';
    let profundidade = 0;
    let i = inicio;

    /**
     * Substitui um trecho de espaços. Quebras de linha são mantidas (uma só) para
     * não depender da inserção automática de ";". Espaços simples são removidos
     * quando vizinhos de pontuação, exceto se juntar mudaria o código ("a - -b").
     */
    const adicionarEspaco = (temQuebra, seguinte) => {
        const anterior = saida[saida.length - 1];
        if (anterior === undefined || anterior === ' ' || anterior === '\n') return;
        if (temQuebra) {
            saida += '\n';
            return;
        }
        const juntaria = '+-'.includes(anterior) && '+-'.includes(seguinte ?? '');
        const comPontuacao = PONTUACAO.has(anterior) || PONTUACAO.has(seguinte);
        if (comPontuacao && !juntaria && anterior !== '/' && seguinte !== '/') return;
        saida += ' ';
    };

    for (; i < codigo.length; i++) {
        const c = codigo[i];
        const proximo = codigo[i + 1];

        if (c === '/' && proximo === '/') {                     // comentário de linha
            const fim = codigo.indexOf('\n', i);
            i = (fim === -1 ? codigo.length : fim) - 1;
            continue;
        }
        if (c === '/' && proximo === '*') {                     // comentário de bloco
            const fim = codigo.indexOf('*/', i + 2);
            adicionarEspaco(codigo.slice(i, fim).includes('\n'), codigo[fim + 2]);
            i = fim + 1;
            continue;
        }
        if (/\s/.test(c)) {                                     // espaços: no máximo um
            let fim = i;
            while (fim < codigo.length && /\s/.test(codigo[fim])) fim++;
            adicionarEspaco(codigo.slice(i, fim).includes('\n'), codigo[fim]);
            i = fim - 1;
            continue;
        }
        if (c === '"' || c === "'") {
            const fim = fimDoTexto(codigo, i);
            saida += codigo.slice(i, fim + 1);
            i = fim;
            continue;
        }
        if (c === '`') {                                        // template literal
            saida += '`';
            i++;
            while (i < codigo.length && codigo[i] !== '`') {
                if (codigo[i] === '\\') {
                    saida += codigo[i] + codigo[i + 1];
                    i += 2;
                } else if (codigo[i] === '$' && codigo[i + 1] === '{') {
                    const [interno, fim] = minificarTrecho(codigo, i + 2, true);
                    saida += '${' + interno + '}';
                    i = fim + 1;
                } else if (codigo[i] === '\n') {
                    // Indentação dentro de templates HTML não altera a página
                    saida += '\n';
                    i++;
                    while (codigo[i] === ' ' || codigo[i] === '\t') i++;
                } else {
                    saida += codigo[i++];
                }
            }
            saida += '`';
            continue;
        }
        if (c === '/' && iniciaRegex(saida)) {
            const fim = fimDaRegex(codigo, i);
            saida += codigo.slice(i, fim + 1);
            i = fim;
            continue;
        }
        if (dentroDeTemplate) {
            if (c === '{') profundidade++;
            if (c === '}') {
                if (profundidade === 0) return [saida.trim(), i];
                profundidade--;
            }
        }
        saida += c;
    }
    return [saida, i];
}

export function minificarJs(codigo) {
    return minificarTrecho(codigo)[0]
        .split('\n')
        .map((linha) => linha.trim())
        .filter(Boolean)
        .join('\n');
}

/* ===================== Execução ===================== */
async function listarArquivos(caminho) {
    const info = await stat(caminho);
    if (!info.isDirectory()) return [caminho];
    const itens = await readdir(caminho);
    const listas = await Promise.all(itens.map((item) => listarArquivos(join(caminho, item))));
    return listas.flat();
}

const MINIFICADORES = { '.html': minificarHtml, '.css': minificarCss, '.js': minificarJs, '.svg': minificarHtml };

async function construir() {
    await rm(DIST, { recursive: true, force: true });
    const relatorio = {};

    for (const entrada of ENTRADAS) {
        for (const arquivo of await listarArquivos(join(RAIZ, entrada))) {
            const destino = join(DIST, relative(RAIZ, arquivo));
            const extensao = extname(arquivo) || relative(RAIZ, arquivo);
            if (arquivo.includes(`${join('imagens')}`) && !IMAGENS.has(extname(arquivo))) continue;
            await mkdir(dirname(destino), { recursive: true });

            const minificar = MINIFICADORES[extname(arquivo)];
            const antes = (await stat(arquivo)).size;
            if (minificar) await writeFile(destino, minificar(await readFile(arquivo, 'utf8')));
            else await copyFile(arquivo, destino);
            const depois = (await stat(destino)).size;

            const total = (relatorio[extensao] ??= { arquivos: 0, antes: 0, depois: 0 });
            total.arquivos++;
            total.antes += antes;
            total.depois += depois;
        }
    }

    const kb = (bytes) => `${(bytes / 1024).toFixed(1)} KB`;
    console.log('Build concluído em dist/\n');
    console.log('Tipo      Arquivos   Original   Produção   Redução');
    let antes = 0;
    let depois = 0;
    for (const [tipo, t] of Object.entries(relatorio)) {
        antes += t.antes;
        depois += t.depois;
        const reducao = t.antes ? Math.round((1 - t.depois / t.antes) * 100) : 0;
        console.log(`${tipo.padEnd(10)}${String(t.arquivos).padStart(8)}${kb(t.antes).padStart(11)}${kb(t.depois).padStart(11)}${`${reducao}%`.padStart(10)}`);
    }
    console.log(`${'Total'.padEnd(18)}${kb(antes).padStart(11)}${kb(depois).padStart(11)}${`${Math.round((1 - depois / antes) * 100)}%`.padStart(10)}`);
}

if (process.argv[1] === fileURLToPath(import.meta.url)) {
    construir().catch((erro) => {
        console.error('Falha no build:', erro);
        process.exit(1);
    });
}

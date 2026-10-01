"""
Auditoria automatizada de acessibilidade (WCAG 2.1 nível AA).

Percorre todas as telas da SPA em computador e celular e verifica os critérios
que podem ser medidos por código. Os demais (leitor de tela, clareza dos textos)
fazem parte do roteiro manual descrito em TESTES.md.

Uso:
    python -m http.server 8000      (em outro terminal, na raiz do projeto)
    python tests/auditoria_acessibilidade.py [endereço]
"""
import json
import sys

from playwright.sync_api import sync_playwright

BASE = sys.argv[1] if len(sys.argv) > 1 else 'http://localhost:8000/'
ROTAS = ['#/inicio', '#/projetos', '#/cadastro', '#/painel', '#/pagina-inexistente']

# Funções executadas dentro do navegador
JS_AUDITORIA = r"""
() => {
  const problemas = [];
  const add = (criterio, descricao, alvo) => problemas.push({ criterio, descricao, alvo });

  const descrever = (el) => {
    let s = el.tagName.toLowerCase();
    if (el.id) s += '#' + el.id;
    if (el.classList.length) s += '.' + [...el.classList].join('.');
    const texto = (el.innerText || el.getAttribute('aria-label') || '').trim().slice(0, 40);
    return texto ? `${s} "${texto}"` : s;
  };

  const visivel = (el) => {
    const r = el.getBoundingClientRect();
    const cs = getComputedStyle(el);
    if (cs.visibility === 'hidden' || cs.display === 'none') return false;
    if (el.closest('[hidden], dialog:not([open])')) return false;
    if (r.width < 2 || r.height < 2) return false;
    // conteúdo "visualmente oculto" (clip) não é avaliado quanto a contraste
    if (cs.clip === 'rect(0px, 0px, 0px, 0px)' || cs.clipPath === 'inset(50%)') return false;
    return true;
  };

  // ---- Cores ----
  const rgba = (str) => {
    const m = str.match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const misturar = (frente, fundo) => ({
    r: frente.r * frente.a + fundo.r * (1 - frente.a),
    g: frente.g * frente.a + fundo.g * (1 - frente.a),
    b: frente.b * frente.a + fundo.b * (1 - frente.a),
    a: 1,
  });
  const luminancia = ({ r, g, b }) => {
    const c = [r, g, b].map((v) => {
      v /= 255;
      return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const razao = (a, b) => {
    const [l1, l2] = [luminancia(a), luminancia(b)].sort((x, y) => y - x);
    return (l1 + 0.05) / (l2 + 0.05);
  };
  const fundoEfetivo = (el) => {
    const camadas = [];
    for (let n = el; n; n = n.parentElement) {
      const cs = getComputedStyle(n);
      if (cs.backgroundImage && cs.backgroundImage !== 'none') return { imagem: true };
      const c = rgba(cs.backgroundColor);
      if (c && c.a > 0) {
        camadas.push(c);
        if (c.a === 1) break;
      }
    }
    let cor = { r: 255, g: 255, b: 255, a: 1 };
    for (const c of camadas.reverse()) cor = misturar(c, cor);
    return cor;
  };

  // 1.4.3 Contraste mínimo (texto)
  const comTexto = [...document.querySelectorAll('body *')].filter((el) =>
    [...el.childNodes].some((n) => n.nodeType === 3 && n.textContent.trim()) && visivel(el));
  for (const el of comTexto) {
    const cs = getComputedStyle(el);
    const fundo = fundoEfetivo(el);
    if (fundo.imagem) continue;
    const frente = misturar(rgba(cs.color), fundo);
    const tamanho = parseFloat(cs.fontSize);
    const negrito = parseInt(cs.fontWeight, 10) >= 700;
    const grande = tamanho >= 24 || (negrito && tamanho >= 18.66);
    const minimo = grande ? 3 : 4.5;
    const r = razao(frente, fundo);
    if (r < minimo) add('1.4.3 Contraste mínimo', `contraste ${r.toFixed(2)}:1 (mínimo ${minimo}:1)`, descrever(el));
  }

  // 1.4.3 Contraste do texto de exemplo (placeholder)
  for (const campo of document.querySelectorAll('[placeholder]')) {
    if (!visivel(campo)) continue;
    const ph = getComputedStyle(campo, '::placeholder');
    const fundo = fundoEfetivo(campo);
    if (fundo.imagem) continue;
    const cor = rgba(ph.color);
    cor.a *= parseFloat(ph.opacity || '1');
    const r = razao(misturar(cor, fundo), fundo);
    if (r < 4.5) add('1.4.3 Contraste mínimo', `placeholder com contraste ${r.toFixed(2)}:1 (mínimo 4.5:1)`, descrever(campo));
  }

  // 1.4.11 Contraste de componentes (contorno de campos)
  for (const campo of document.querySelectorAll('input:not([type=hidden]):not([type=radio]):not([type=checkbox]), select, textarea')) {
    if (!visivel(campo)) continue;
    const borda = rgba(getComputedStyle(campo).borderTopColor);
    const fundo = fundoEfetivo(campo.parentElement);
    if (fundo.imagem) continue;
    const r = razao(misturar(borda, fundo), fundo);
    if (r < 3) add('1.4.11 Contraste de componentes', `borda do campo ${r.toFixed(2)}:1 (mínimo 3:1)`, descrever(campo));
  }

  // 1.1.1 Conteúdo não textual
  for (const img of document.querySelectorAll('img')) {
    if (!img.hasAttribute('alt')) add('1.1.1 Alternativa em texto', 'imagem sem atributo alt', img.getAttribute('src'));
  }
  for (const svg of document.querySelectorAll('svg')) {
    if (svg.getAttribute('aria-hidden') !== 'true' && !svg.getAttribute('aria-label') && !svg.querySelector('title'))
      add('1.1.1 Alternativa em texto', 'svg sem nome acessível nem aria-hidden', descrever(svg));
  }

  // 1.3.1 Informações e relações: rótulos de campos
  for (const campo of document.querySelectorAll('input:not([type=hidden]), select, textarea')) {
    const temRotulo = (campo.id && document.querySelector(`label[for="${campo.id}"]`)) ||
      campo.closest('label') || campo.getAttribute('aria-label') || campo.getAttribute('aria-labelledby');
    if (!temRotulo) add('1.3.1 / 3.3.2 Rótulos', 'campo sem rótulo associado', descrever(campo));
    for (const id of (campo.getAttribute('aria-describedby') || '').split(/\s+/).filter(Boolean)) {
      if (!document.getElementById(id)) add('1.3.1 Relações', `aria-describedby aponta para id inexistente "${id}"`, descrever(campo));
    }
  }
  for (const grupo of document.querySelectorAll('fieldset')) {
    if (!grupo.querySelector('legend')) add('1.3.1 Relações', 'fieldset sem legend', descrever(grupo));
  }

  // 1.3.1 Hierarquia de títulos
  const titulos = [...document.querySelectorAll('h1,h2,h3,h4,h5,h6')].filter(visivel);
  const h1s = titulos.filter((t) => t.tagName === 'H1');
  if (h1s.length !== 1) add('1.3.1 Títulos', `a tela tem ${h1s.length} h1 (esperado 1)`, location.hash);
  let anterior = 0;
  for (const t of titulos) {
    const nivel = +t.tagName[1];
    if (anterior && nivel > anterior + 1) add('1.3.1 Títulos', `salto de h${anterior} para h${nivel}`, descrever(t));
    anterior = nivel;
  }

  // Landmarks
  for (const marco of ['header', 'nav', 'main', 'footer']) {
    if (!document.querySelector(marco)) add('1.3.1 Regiões', `região <${marco}> ausente`, location.hash);
  }

  // 2.4.4 / 4.1.2 Nome acessível de links e botões
  for (const el of document.querySelectorAll('a[href], button')) {
    if (!visivel(el) && !el.closest('dialog')) continue;
    const nome = (el.innerText || '').trim() || el.getAttribute('aria-label') || el.getAttribute('title') ||
      [...el.querySelectorAll('img[alt]')].map((i) => i.alt).join('').trim();
    if (!nome) add('4.1.2 Nome, função, valor', 'link ou botão sem nome acessível', descrever(el));
  }

  // 4.1.1 IDs duplicados
  const ids = {};
  for (const el of document.querySelectorAll('[id]')) ids[el.id] = (ids[el.id] || 0) + 1;
  for (const [id, n] of Object.entries(ids)) if (n > 1) add('4.1.1 Análise', `id "${id}" repetido ${n} vezes`, id);

  // 3.1.1 Idioma e 2.4.2 Título
  if (!document.documentElement.lang) add('3.1.1 Idioma da página', 'html sem atributo lang', 'html');
  if (!document.title.trim()) add('2.4.2 Página com título', 'title vazio', 'head');

  // aria-hidden em elemento focável
  for (const el of document.querySelectorAll('[aria-hidden="true"]')) {
    if (el.matches('a[href],button,input,select,textarea,[tabindex]:not([tabindex="-1"])') ||
        el.querySelector('a[href],button,input,select,textarea'))
      add('4.1.2 Nome, função, valor', 'elemento focável dentro de aria-hidden', descrever(el));
  }

  return problemas;
}
"""

# 2.4.7 Foco visível: percorre a página com Tab e confere o indicador de foco
JS_FOCO = r"""
() => {
  const el = document.activeElement;
  if (!el || el === document.body) return null;
  const rgba = (str) => {
    const m = (str || '').match(/rgba?\(([^)]+)\)/);
    if (!m) return null;
    const p = m[1].split(/[ ,/]+/).filter(Boolean).map(Number);
    return { r: p[0], g: p[1], b: p[2], a: p.length > 3 ? p[3] : 1 };
  };
  const lum = ({ r, g, b }) => {
    const c = [r, g, b].map((v) => { v /= 255; return v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4; });
    return 0.2126 * c[0] + 0.7152 * c[1] + 0.0722 * c[2];
  };
  const razao = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((m, n) => n - m); return (x + 0.05) / (y + 0.05); };
  const fundo = (n) => {
    for (; n; n = n.parentElement) {
      const c = rgba(getComputedStyle(n).backgroundColor);
      if (c && c.a === 1) return c;
    }
    return { r: 255, g: 255, b: 255, a: 1 };
  };
  const cs = getComputedStyle(el);
  const contorno = cs.outlineStyle !== 'none' && parseFloat(cs.outlineWidth) >= 2;
  const sombra = cs.boxShadow && cs.boxShadow !== 'none';
  // 1.4.11: o contorno de foco precisa de 3:1 em relação à cor ao redor do elemento
  let contrasteFoco = null;
  if (contorno && parseFloat(cs.outlineOffset) > 0) contrasteFoco = razao(rgba(cs.outlineColor), fundo(el.parentElement));
  let s = el.tagName.toLowerCase();
  if (el.classList.length) s += '.' + [...el.classList].join('.');
  s += ' "' + (el.innerText || el.value || el.getAttribute('aria-label') || '').trim().slice(0, 30) + '"';
  const r = el.getBoundingClientRect();
  return { alvo: s, visivel: contorno || sombra, contrasteFoco, dentroDaTela: r.width > 0 && r.height > 0 };
}
"""


def auditar_foco(pagina, limite=80):
    problemas, vistos = [], set()
    pagina.locator('body').focus()
    for _ in range(limite):
        pagina.keyboard.press('Tab')
        info = pagina.evaluate(JS_FOCO)
        if not info:
            continue
        if info['alvo'] in vistos:
            break
        vistos.add(info['alvo'])
        if not info['visivel']:
            problemas.append({'criterio': '2.4.7 Foco visível', 'descricao': 'elemento recebe foco sem indicador visível', 'alvo': info['alvo']})
        if info['contrasteFoco'] is not None and info['contrasteFoco'] < 3:
            problemas.append({'criterio': '1.4.11 Contraste do indicador de foco',
                              'descricao': f"contorno de foco {info['contrasteFoco']:.2f}:1 (mínimo 3:1)", 'alvo': info['alvo']})
        if not info['dentroDaTela']:
            problemas.append({'criterio': '2.4.3 Ordem do foco', 'descricao': 'foco em elemento invisível', 'alvo': info['alvo']})
    return problemas, len(vistos)


def preparar_painel(pagina):
    pagina.goto(BASE + '#/inicio')
    pagina.evaluate("""async () => {
        const m = await import('./js/modules/cadastros.js');
        ['voluntariado', 'doacao'].forEach((participacao, i) => m.adicionarCadastro({
            nome: 'Pessoa de Teste ' + i, email: `teste${i}@exemplo.com`, telefone: '(41) 99999-0000',
            cpf: '529.982.247-25', cidade: 'Curitiba', estado: 'PR', participacao }));
    }""")
    pagina.goto(BASE + '#/painel')


def preparar_erros(pagina):
    pagina.goto(BASE + '#/cadastro')
    pagina.click('button[type=submit]')


def preparar_rascunho(pagina):
    pagina.goto(BASE + '#/cadastro')
    pagina.fill('#nome', 'Maria da Silva')
    pagina.wait_for_timeout(900)
    pagina.goto(BASE + '#/inicio')
    pagina.goto(BASE + '#/cadastro')


def preparar_modal(pagina):
    pagina.goto(BASE + '#/projetos')
    pagina.click('[data-abrir-modal]')


def preparar_filtro(pagina):
    pagina.goto(BASE + '#/projetos')
    pagina.locator('.filtro').nth(1).click()


def preparar_pular(pagina):
    pagina.goto(BASE + '#/inicio')
    pagina.wait_for_timeout(300)
    pagina.keyboard.press('Tab')


def preparar_menu(pagina):
    pagina.goto(BASE + '#/inicio')
    if pagina.is_visible('.navegacao__botao'):
        pagina.click('.navegacao__botao')


ESTADOS = {
    'formulário com erros': preparar_erros,
    'rascunho recuperado': preparar_rascunho,
    'painel com cadastros': preparar_painel,
    'modal aberto': preparar_modal,
    'filtro ativo': preparar_filtro,
    'link "pular" em foco': preparar_pular,
    'menu aberto': preparar_menu,
}


def sem_rolagem_horizontal(pagina):
    return pagina.evaluate('document.documentElement.scrollWidth <= document.documentElement.clientWidth + 1')


def main():
    relatorio, total = {}, 0
    with sync_playwright() as p:
        navegador = p.chromium.launch()
        cenarios = {
            'computador': {'viewport': {'width': 1280, 'height': 900}},
            # 1.4.10 Reflow: 320 px de largura equivale a 1280 px com zoom de 400%
            'reflow-320px': {'viewport': {'width': 320, 'height': 640}},
        }
        for nome, opcoes in cenarios.items():
            contexto = navegador.new_context(**opcoes)
            # Bloqueia o CDN para a auditoria não depender da rede
            contexto.route('**/cdn.jsdelivr.net/**', lambda rota: rota.abort())
            pagina = contexto.new_page()
            for rota in ROTAS:
                pagina.goto(BASE + rota)
                pagina.wait_for_timeout(400)
                problemas = pagina.evaluate(JS_AUDITORIA)
                if nome == 'computador':
                    foco, focaveis = auditar_foco(pagina)
                    problemas += foco
                if not sem_rolagem_horizontal(pagina):
                    problemas.append({'criterio': '1.4.10 Reflow', 'descricao': 'rolagem horizontal', 'alvo': rota})
                relatorio[f'{nome} {rota}'] = problemas
                total += len(problemas)
            # Estados dinâmicos da interface (mensagens, modal, menu, dados)
            for estado, preparar in ESTADOS.items():
                preparar(pagina)
                pagina.wait_for_timeout(400)
                problemas = pagina.evaluate(JS_AUDITORIA)
                if not sem_rolagem_horizontal(pagina):
                    problemas.append({'criterio': '1.4.10 Reflow', 'descricao': 'rolagem horizontal', 'alvo': estado})
                relatorio[f'{nome} [{estado}]'] = problemas
                total += len(problemas)
                pagina.keyboard.press('Escape')
            # 1.4.4 Redimensionar texto: fonte em 200% na tela de computador.
            # (Em 320 px o critério aplicável é o 1.4.10, já verificado acima.)
            if nome != 'computador':
                contexto.close()
                continue
            pagina.goto(BASE + '#/cadastro')
            pagina.add_style_tag(content='html { font-size: 200% !important; }')
            pagina.wait_for_timeout(200)
            if not sem_rolagem_horizontal(pagina):
                relatorio.setdefault(f'{nome} texto 200%', []).append(
                    {'criterio': '1.4.4 Redimensionar texto', 'descricao': 'rolagem horizontal com texto em 200%', 'alvo': '#/cadastro'})
                total += 1
            contexto.close()
        navegador.close()

    for chave, problemas in relatorio.items():
        print(f'\n## {chave}: {len(problemas)} problema(s)')
        vistos = set()
        for pr in problemas:
            linha = f"- [{pr['criterio']}] {pr['descricao']} → {pr['alvo']}"
            if linha not in vistos:
                print(linha)
                vistos.add(linha)
    print(f'\nTOTAL: {total} ocorrência(s)')
    with open('auditoria.json', 'w', encoding='utf-8') as arquivo:
        json.dump(relatorio, arquivo, ensure_ascii=False, indent=2)
    return 1 if total else 0


if __name__ == '__main__':
    sys.exit(main())

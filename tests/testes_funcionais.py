"""
Testes funcionais de ponta a ponta (Playwright + Chromium).

Uso:
    python tests/testes_funcionais.py          # testa o código-fonte
    python tests/testes_funcionais.py dist     # testa o build de produção

O servidor local é iniciado automaticamente. O CDN da Day.js é bloqueado de
propósito, para testar o plano B de datas sem depender da rede.
"""
import sys

from playwright.sync_api import sync_playwright

import servidor

resultados, erros = [], []


def caso(nome, condicao, obs=''):
    resultados.append(('✅' if condicao else '❌', nome, obs))


def executar(base):
    with sync_playwright() as p:
        b=p.chromium.launch(); ctx=b.new_context(viewport={'width':1280,'height':900}, locale='pt-BR')
        ctx.route('**/cdn.jsdelivr.net/**', lambda r: r.abort())
        pg=ctx.new_page(); pg.on('pageerror', lambda e: erros.append(str(e)))
        pg.on('console', lambda m: erros.append(m.text) if m.type=='error' and 'jsdelivr' not in m.text and 'ERR_FAILED' not in m.text else None)
        # Navegação
        pg.goto(base); pg.wait_for_timeout(500)
        caso('T01 Rota inicial padrão', pg.url.endswith('#/inicio') and pg.title().startswith('Início'))
        pg.click('a[data-rota="projetos"]'); pg.wait_for_timeout(400)
        caso('T02 Navegação sem recarregar', pg.evaluate('performance.getEntriesByType("navigation").length')==1 and 'Projetos' in pg.title())
        caso('T03 Link ativo com aria-current', pg.get_attribute('a[data-rota="projetos"]','aria-current')=='page' and pg.get_attribute('a[data-rota="inicio"]','aria-current') is None)
        caso('T04 Foco no título após navegar', pg.evaluate('document.activeElement.tagName')=='H1')
        pg.go_back(); pg.wait_for_timeout(400)
        caso('T05 Botão Voltar do navegador', 'Início' in pg.title())
        pg.goto(base+'#/rota-inexistente'); pg.wait_for_timeout(300)
        caso('T06 Página 404', 'não encontrada' in pg.title())
        pg.goto(base+'#/projetos/voluntariado'); pg.wait_for_timeout(700)
        caso('T07 Rota com seção (rolagem até #voluntariado)', pg.evaluate('document.activeElement.id')=='voluntariado')
        # Templates e filtro
        pg.goto(base+'#/projetos'); pg.wait_for_timeout(300)
        caso('T08 Cartões gerados a partir dos dados', pg.locator('#app .cartao').count()==3)
        pg.click('button[data-categoria="Educação"]'); pg.wait_for_timeout(200)
        caso('T09 Filtro por categoria', pg.locator('#app .cartao').count()==1 and pg.get_attribute('button[data-categoria="Educação"]','aria-pressed')=='true' and '1 projeto' in pg.inner_text('[data-contador]'))
        # Modal e toast
        pg.click('button[data-abrir-modal="modal-doacao"]'); pg.wait_for_timeout(300)
        aberto=pg.evaluate('document.getElementById("modal-doacao").open'); pg.keyboard.press('Escape'); pg.wait_for_timeout(200)
        caso('T10 Modal abre e fecha com Esc', aberto and not pg.evaluate('document.getElementById("modal-doacao").open'))
        # Formulário
        pg.goto(base+'#/cadastro'); pg.wait_for_timeout(300)
        pg.click('button[type=submit]'); pg.wait_for_timeout(300)
        caso('T11 Envio vazio bloqueado com resumo de erros', 'campos precisam de atenção' in pg.inner_text('[data-avisos]') and pg.get_attribute('[data-avisos] .alerta','role')=='alert')
        pg.click('[data-focar="cpf"]'); pg.wait_for_timeout(100)
        caso('T12 Resumo leva o foco ao campo', pg.evaluate('document.activeElement.id')=='cpf')
        pg.keyboard.type('11111111111'); pg.click('#nome'); pg.wait_for_timeout(100)
        caso('T13 Máscara de CPF', pg.input_value('#cpf')=='111.111.111-11')
        caso('T14 CPF com dígitos repetidos recusado', 'CPF inválido' in pg.inner_text('#erro-cpf') and pg.get_attribute('#cpf','aria-invalid')=='true')
        pg.fill('#cpf',''); pg.click('#cpf'); pg.keyboard.type('12345678900'); pg.click('#nome'); pg.wait_for_timeout(100)
        caso('T15 CPF com dígito verificador errado recusado', 'CPF inválido' in pg.inner_text('#erro-cpf'))
        pg.fill('#cpf',''); pg.click('#cpf'); pg.keyboard.type('52998224725'); pg.wait_for_timeout(100)
        caso('T16 Correção em tempo real (CPF válido)', pg.get_attribute('#cpf','aria-invalid')=='false' and pg.is_hidden('#erro-cpf'))
        pg.fill('#nome','Maria'); pg.click('#email'); pg.wait_for_timeout(100)
        caso('T17 Nome sem sobrenome recusado', 'sobrenome' in pg.inner_text('#erro-nome'))
        pg.fill('#email','maria@'); pg.click('#nome'); pg.wait_for_timeout(100)
        caso('T18 E-mail inválido recusado', 'e-mail válido' in pg.inner_text('#erro-email'))
        pg.fill('#nascimento','2031-01-01'); pg.click('#nome'); pg.wait_for_timeout(100)
        f=pg.inner_text('#erro-nascimento')
        pg.fill('#nascimento','2012-01-01'); pg.click('#nome'); pg.wait_for_timeout(100)
        caso('T19 Data futura e menor de 18 anos recusados', 'futuro' in f and '18 anos' in pg.inner_text('#erro-nascimento'))
        pg.fill('#estado','XX'); pg.click('#nome'); pg.wait_for_timeout(100)
        caso('T20 UF inexistente recusada', 'sigla' in pg.inner_text('#erro-estado'))
        # Rascunho
        pg.fill('#nome','Maria Souza'); pg.fill('#cidade','Curitiba'); pg.wait_for_timeout(800)
        pg.reload(); pg.wait_for_timeout(600)
        caso('T21 Rascunho restaurado após recarregar (sem CPF)', pg.input_value('#nome')=='Maria Souza' and pg.input_value('#cidade')=='Curitiba' and pg.input_value('#cpf')=='' and 'Rascunho recuperado' in pg.inner_text('[data-avisos]'))
        pg.click('[data-descartar-rascunho]'); pg.wait_for_timeout(300)
        caso('T22 Descartar rascunho', pg.input_value('#nome')=='' and pg.evaluate('localStorage.getItem("maos-solidarias:rascunho-cadastro")') is None)
        # Envio válido
        pg.fill('#nome','Maria <img src=x onerror=alert(1)> Souza'); pg.fill('#email','maria@exemplo.com'); pg.fill('#nascimento','1990-05-10')
        pg.click('#cpf'); pg.keyboard.type('52998224725'); pg.click('#telefone'); pg.keyboard.type('41999998888')
        pg.click('#cep'); pg.keyboard.type('80010000'); pg.fill('#endereco','Rua XV, 100'); pg.fill('#cidade','Curitiba'); pg.fill('#estado','pr')
        pg.check('#participacao-ambos'); pg.check('#consentimento'); pg.click('button[type=submit]'); pg.wait_for_timeout(900)
        caso('T23 Envio válido abre confirmação', pg.evaluate('document.getElementById("modal-confirmacao").open'))
        salvo=pg.evaluate('JSON.parse(localStorage.getItem("maos-solidarias:cadastros"))')
        caso('T24 Cadastro salvo no localStorage com CPF mascarado', len(salvo)==1 and salvo[0]['cpf']=='***.***.***-25' and salvo[0]['estado']=='PR')
        caso('T25 Rascunho apagado após envio', pg.evaluate('localStorage.getItem("maos-solidarias:rascunho-cadastro")') is None)
        pg.keyboard.press('Escape'); pg.goto(base+'#/cadastro'); pg.wait_for_timeout(300)
        pg.fill('#email','MARIA@exemplo.com'); pg.click('#nome'); pg.wait_for_timeout(100)
        caso('T26 E-mail duplicado recusado', 'já foi cadastrado' in pg.inner_text('#erro-email'))
        # Painel
        pg.goto(base+'#/painel'); pg.wait_for_timeout(400)
        caso('T27 Painel lista dados do localStorage', pg.locator('.registro').count()==1)
        caso('T28 Proteção contra XSS (código exibido como texto)', pg.locator('.registro img').count()==0 and '<img' in pg.inner_text('.registro__nome'))
        pg.reload(); pg.wait_for_timeout(400)
        caso('T29 Dados persistem após recarregar', pg.locator('.registro').count()==1)
        pg.click('[data-remover]'); pg.wait_for_timeout(400)
        caso('T30 Remover cadastro', pg.locator('.registro').count()==0 and pg.evaluate('JSON.parse(localStorage.getItem("maos-solidarias:cadastros")).length')==0)
        caso('T31 Biblioteca indisponível: plano B ativo', not pg.evaluate("import(new URL('js/modules/datas.js', location.href).href).then(m=>m.bibliotecaDatasAtiva())"))
        # Mobile e teclado
        m=b.new_context(viewport={'width':390,'height':760}, locale='pt-BR'); m.route('**/cdn.jsdelivr.net/**', lambda r: r.abort()); mp=m.new_page()
        mp.goto(base+'#/inicio'); mp.wait_for_timeout(400)
        vis_antes=mp.evaluate('getComputedStyle(document.querySelector(".navegacao__lista")).visibility')
        mp.click('.navegacao__botao'); mp.wait_for_timeout(400)
        vis=mp.evaluate('getComputedStyle(document.querySelector(".navegacao__lista")).visibility')
        mp.click('a[data-rota="cadastro"]'); mp.wait_for_timeout(500)
        caso('T32 Menu hambúrguer (celular)', vis_antes=='hidden' and vis=='visible' and mp.get_attribute('.navegacao__botao','aria-expanded')=='false' and 'Cadastro' in mp.title())
        caso('T33 Sem rolagem horizontal no celular', mp.evaluate('document.documentElement.scrollWidth<=window.innerWidth'))
        mp.goto(base+'#/projetos'); mp.reload(); mp.wait_for_timeout(500)
        mp.keyboard.press('Tab'); primeiro=mp.evaluate('document.activeElement.textContent')
        mp.keyboard.press('Enter'); mp.wait_for_timeout(300)
        caso('T34 "Pular para o conteúdo": 1º foco, leva ao título e mantém a rota', 'Pular' in primeiro and mp.evaluate('document.activeElement.tagName')=='H1' and mp.url.endswith('#/projetos'))

        # Acessibilidade (Experiência Prática IV)
        a = b.new_context(viewport={'width': 1280, 'height': 900}, locale='pt-BR')
        a.route('**/cdn.jsdelivr.net/**', lambda r: r.abort())
        ap = a.new_page()
        ap.goto(base + '#/inicio'); ap.wait_for_timeout(400)
        ap.hover('.navegacao__item--submenu > .navegacao__link'); ap.wait_for_timeout(400)
        aberto = ap.evaluate('getComputedStyle(document.querySelector(".submenu")).visibility')
        ap.keyboard.press('Escape'); ap.wait_for_timeout(400)
        caso('T35 Submenu fecha com Esc (WCAG 1.4.13)', aberto == 'visible' and
             ap.evaluate('getComputedStyle(document.querySelector(".submenu")).visibility') == 'hidden')
        botao = '[data-alternar-contraste]'
        ap.click(botao); ap.wait_for_timeout(200)
        ativo = ap.get_attribute('html', 'data-contraste') == 'alto' and ap.get_attribute(botao, 'aria-pressed') == 'true'
        ap.reload(); ap.wait_for_timeout(400)
        caso('T36 Alto contraste: ativa, informa aria-pressed e mantém após recarregar', ativo and
             ap.get_attribute('html', 'data-contraste') == 'alto' and ap.get_attribute(botao, 'aria-pressed') == 'true')
        s = b.new_context(viewport={'width': 1280, 'height': 900}, contrast='more')
        s.route('**/cdn.jsdelivr.net/**', lambda r: r.abort())
        sp = s.new_page()
        sp.goto(base + '#/inicio'); sp.wait_for_timeout(300)
        caso('T37 Alto contraste segue a preferência do sistema (prefers-contrast)',
             sp.get_attribute('html', 'data-contraste') == 'alto')
        b.close()


def main():
    pasta = sys.argv[1] if len(sys.argv) > 1 else '.'
    base, encerrar = servidor.iniciar(pasta)
    try:
        executar(base)
    finally:
        encerrar()
    aprovados = sum(1 for r in resultados if r[0] == '✅')
    for r in resultados:
        print(r[0], r[1], r[2])
    print(f'\n{aprovados}/{len(resultados)} testes aprovados | erros de JavaScript: {erros}')
    return 0 if aprovados == len(resultados) and not erros else 1


if __name__ == '__main__':
    sys.exit(main())

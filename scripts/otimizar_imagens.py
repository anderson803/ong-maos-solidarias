"""
Gera versões otimizadas das imagens do site (executar ao adicionar ou trocar fotos).

Para cada JPEG em imagens/ cria:
  - <nome>.webp       mesma largura, formato WebP (bem menor que o JPEG)
  - <nome>-480.webp   metade da largura, usada em telas pequenas (srcset)
O JPEG original continua como alternativa para navegadores sem WebP.

Uso: python scripts/otimizar_imagens.py   (requer: pip install pillow)
"""
import pathlib

from PIL import Image

RAIZ = pathlib.Path(__file__).resolve().parent.parent
QUALIDADE = 78
LARGURA_PEQUENA = 480


def kb(caminho):
    return caminho.stat().st_size / 1024


def main():
    total_antes = total_depois = 0
    for jpg in sorted((RAIZ / 'imagens').rglob('*.jpg')):
        with Image.open(jpg) as imagem:
            imagem = imagem.convert('RGB')
            webp = jpg.with_suffix('.webp')
            imagem.save(webp, 'WEBP', quality=QUALIDADE, method=6)

            altura = round(imagem.height * LARGURA_PEQUENA / imagem.width)
            pequena = jpg.with_name(f'{jpg.stem}-{LARGURA_PEQUENA}.webp')
            imagem.resize((LARGURA_PEQUENA, altura), Image.LANCZOS).save(
                pequena, 'WEBP', quality=QUALIDADE, method=6)

        total_antes += kb(jpg)
        total_depois += kb(webp)
        print(f'{jpg.relative_to(RAIZ)}: {kb(jpg):.1f} KB → {kb(webp):.1f} KB (WebP) '
              f'| {kb(pequena):.1f} KB ({LARGURA_PEQUENA}px)')
    print(f'Total: {total_antes:.1f} KB → {total_depois:.1f} KB '
          f'({100 - total_depois / total_antes * 100:.0f}% menor)')


if __name__ == '__main__':
    main()

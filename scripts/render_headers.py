#!/usr/bin/env python3
"""Render the shared navigation into the static review pages."""
from hashlib import sha256
from html import escape
from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]
HEADER = re.compile(r'<div\s+data-ala-header\s*></div>|<!-- ALA header start -->.*?<!-- ALA header end -->', re.S)
BLOG = (
    ('Blog de préstamos ALA', 'channel/loan_blog/'),
    ('Guía de préstamos', 'channel/guia-de-prestamos/'),
    ('Diccionario financiero', 'channel/loan_financiero/'),
    ('Noticias financieras', 'channel/noticias-financieras/'),
    ('Préstamo en tu ciudad', 'channel/loan_city/'),
)
BRAND_ROUTE = 'marca/'
MORE = (
    ('Sobre ALA', BRAND_ROUTE),
    ('Contáctanos', 'channel/help-center/#canales-de-atencion'),
    ('Documentos legales', '#documentos-legales'),
    ('Centro de ayuda', 'channel/help-center/'),
    ('Preguntas frecuentes', 'channel/loan_faq/'),
    ('Protección regulatoria', 'channel/loan_protection/'),
)


def render_header(prefix, route):
    home = not route
    home_attr = ' data-home' if home else ''
    assets = f'{prefix}public/assets/'

    def link(label, target):
        active = ' aria-current="page"' if route == target else ''
        href = '#ala-content' if home and not target else f'{prefix}{target}'
        return f'<a class="ala-header-link" href="{href}"{active}>{escape(label)}</a>'

    def disclosure(label, name, links):
        items = '\n'.join(f'            <li>{link(text, target)}</li>' for text, target in links)
        return f"""<li class="ala-header-item ala-header-disclosure">
        <button class="ala-header-trigger" type="button" data-ala-menu="{name}" aria-controls="ala-nav-{name}" aria-expanded="false">
          {escape(label)} <span class="ala-header-chevron" aria-hidden="true"></span>
        </button>
        <ul class="ala-header-drop" id="ala-nav-{name}" hidden>
{items}
        </ul>
      </li>"""

    notice = """
  <button class="ala-site-notice ala-notice-more" type="button" aria-haspopup="dialog" aria-controls="ala-security">
    <span class="ala-notice-copy"><strong>Aviso importante:</strong> El sitio web oficial de ALA es alaprestamo.com.</span>
    <span class="ala-notice-label">Ver aviso</span>
  </button>""" if home else ''
    return f"""<!-- ALA header start -->
<div class="ala-site-chrome"{home_attr}>
  <a class="ala-header-skip" href="#ala-content">Ir al contenido</a>{notice}
  <div class="ala-header-reserve" aria-hidden="true"></div>
  <header class="ala-header-bar">
    <div class="ala-header-frame">
      <a class="ala-header-logo" href="{prefix}" aria-label="ALA, inicio">
        <img class="ala-header-wordmark ala-header-wordmark--white" src="{assets}ala-logo.png" width="126" height="48" alt="">
        <img class="ala-header-wordmark ala-header-wordmark--dark" src="{assets}nav-logo-dark.png" width="126" height="48" alt="">
        <img class="ala-header-icon" src="{assets}ala-app-icon.png" width="29" height="29" alt="">
      </a>
      <a class="ala-header-about" href="{prefix}{BRAND_ROUTE}">Sobre ALA <span aria-hidden="true">›</span></a>
      <button class="ala-header-menu" type="button" aria-label="Abrir menú" aria-controls="ala-nav" aria-expanded="false">
        <span aria-hidden="true"></span><span aria-hidden="true"></span><span aria-hidden="true"></span>
      </button>
      <nav class="ala-header-nav" id="ala-nav" aria-label="Navegación principal">
        <ul class="ala-header-list">
      <li class="ala-header-item">{link('Introducción del producto', '')}</li>
      <li class="ala-header-item">{link('Protección regulatoria', 'channel/loan_protection/')}</li>
      {disclosure('Blog', 'blog', BLOG)}
      <li class="ala-header-item ala-header-item--news">{link('Noticias', 'noticias/')}</li>
      {disclosure('Más información', 'more', MORE)}
      <li class="ala-header-item">{link('Preguntas frecuentes', 'channel/loan_faq/')}</li>
        </ul>
        <a class="ala-header-help" href="{prefix}channel/help-center/">Centro de ayuda <span aria-hidden="true">↗</span></a>
      </nav>
      <div class="ala-header-downloads" aria-label="Descargar ALA">
        <a href="https://sofom-ala.onelink.me/uTdM/taq3lvd3" aria-label="Descargar ALA en Google Play"><img src="{assets}nav-google.png" width="48" height="48" alt=""></a>
        <a href="https://sofom-ala.onelink.me/ndX5/mbzy0s0s" aria-label="Descargar ALA en App Store"><img src="{assets}nav-ios.png" width="48" height="48" alt=""></a>
      </div>
    </div>
  </header>
</div>
<!-- ALA header end -->"""


def version(path):
    return sha256((ROOT / 'shared' / path).read_bytes()).hexdigest()[:10]


def install(page):
    text = page.read_text()
    if not HEADER.search(text):
        return
    relative = page.relative_to(ROOT)
    route = relative.parent.as_posix()
    route = '' if route == '.' else route + '/'
    prefix = '../' * (len(relative.parts) - 1) or './'
    text = HEADER.sub(lambda _: render_header(prefix, route), text, count=1)
    text = re.sub(r'[ \t]*<link\b[^>]*shared/site-header\.css[^>]*>\s*', '', text)
    text = re.sub(r'[ \t]*<script\b[^>]*shared/site-header\.js[^>]*>\s*</script>\s*', '', text)
    tags = (
        f'  <link rel="stylesheet" href="{prefix}shared/site-header.css?v={version("site-header.css")}">\n'
        f'  <script src="{prefix}shared/site-header.js?v={version("site-header.js")}" defer></script>\n'
    )
    text = re.sub(r'</head>', tags + '</head>', text, count=1, flags=re.I)
    if not re.search(r'\bid=["\']ala-content["\']', text):
        text = text.replace('<!-- ALA header end -->', '<!-- ALA header end -->\n<div id="ala-content" tabindex="-1"></div>', 1)
    page.write_text(text)


if __name__ == '__main__':
    import sys

    paths = [ROOT / path for path in sys.argv[1:]] or list(ROOT.rglob('*.html'))
    for file in paths:
        if file.is_file():
            install(file)

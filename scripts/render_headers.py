#!/usr/bin/env python3
"""Render the shared navigation into the static review pages."""
from hashlib import sha256
from html import escape
from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]
HEADER = re.compile(r'<div\s+data-ala-header\s*></div>|<!-- ALA header start -->.*?<!-- ALA header end -->', re.S)
BLOG = [
    ('Guía de préstamos', 'channel/guia-de-prestamos/'),
    ('Diccionario financiero', 'channel/loan_financiero/'),
    ('Noticias financieras', 'channel/noticias-financieras/'),
    ('Préstamo en tu ciudad', 'channel/loan_city/'),
]
MENU = [
    ('Introducción del producto', ''),
    ('Protección regulatoria', 'channel/loan_protection/'),
    ('Blog', 'channel/loan_blog/'),
    ('Ayuda', 'channel/loan_faq/'),
    ('Acerca de ALA', 'channel/about-ala/'),
]
LEGAL = {'channel/' + slug + '/' for slug in (
    'ios_contract', 'privacy', 'ios_privacy', 'regist', 'ios_regist'
)}


def render_header(prefix, route):
    def link(label, target):
        active = ' aria-current="page"' if route == target else ''
        return f'<a class="ala-header-link" href="{prefix}{target}"{active}>{escape(label)}</a>'

    def group(label, target):
        active = False
        if target == 'channel/loan_blog/':
            active = route.startswith('article/') or any(route.startswith(path) for _, path in BLOG)
            active |= route.startswith(target) and route != target
            items = '\n'.join(f'              <li>{link(name, path)}</li>' for name, path in BLOG)
            button = f"""
          {link(label, target)}
          <button class="ala-header-trigger" type="button" aria-label="Categorías de Blog" aria-controls="ala-blog-nav" aria-expanded="false"><span class="ala-header-chevron" aria-hidden="true"></span></button>
          <div class="ala-header-drop" id="ala-blog-nav" hidden>
            <ul class="ala-header-drop-list">
{items}
            </ul>
          </div>
        """
            active_attr = ' aria-current="true"' if active else ''
            return f'<li class="ala-header-item ala-header-item--blog"{active_attr}>{button}</li>'

        if target == 'channel/loan_protection/':
            active = route in LEGAL
        elif target == 'channel/loan_faq/':
            active = route == 'channel/help-center/' or route == 'cobranza/'
        elif target == 'channel/about-ala/':
            active = route == 'marca/'
        elif not target:
            active = route.startswith(('city/', 'channel/loan_city/')) and not route.startswith('channel/')
        active_attr = ' aria-current="true"' if active else ''
        return f'<li class="ala-header-item"{active_attr}>{link(label, target)}</li>'

    home = not route or route.startswith('city/')
    home_attr = ' data-home' if home else ''
    assets = f'{prefix}live/ala-www/img/'
    notice = (
        """
  <div class="ala-site-notice">
    <p><strong>Aviso importante.</strong> El sitio web oficial de ALA es alaprestamo.com.</p>
    <button class="ala-notice-more" type="button" aria-haspopup="dialog" aria-controls="ala-security">Ver más <span aria-hidden="true">›</span></button>
  </div>""" if not route else ''
    )
    items = '\n'.join(f'        {group(label, target)}' for label, target in MENU)
    return f"""<!-- ALA header start -->
<div class="ala-site-chrome"{home_attr}>
  <a class="ala-header-skip" href="#ala-content">Ir al contenido</a>{notice}
  <header class="ala-header-bar">
    <div class="ala-header-frame">
      <a class="ala-header-logo" href="{prefix}" aria-label="ALA, inicio">
        <img class="ala-header-icon" src="{assets}logo.png" width="36" height="36" alt="">
        <img class="ala-header-wordmark" src="{assets}alaText.png" width="52" height="16" alt="">
        <img class="ala-header-wordmark ala-header-wordmark--white" src="{assets}alaTextWhite.png" width="52" height="16" alt="">
      </a>
      <button class="ala-header-menu" type="button" aria-label="Abrir menú" aria-controls="ala-nav" aria-expanded="false">
        <svg viewBox="0 0 24 24" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round"><path d="M3 6h18M3 12h18M3 18h18"/></svg>
      </button>
      <nav class="ala-header-nav" id="ala-nav" aria-label="Navegación principal">
        <ul class="ala-header-list">
{items}
        </ul>
      </nav>
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

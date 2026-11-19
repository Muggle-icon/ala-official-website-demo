#!/usr/bin/env python3
"""Render the existing standalone homepage footer into the newsroom pages."""

from hashlib import sha256
from pathlib import Path
import re


ROOT = Path(__file__).resolve().parents[1]
SOURCE = ROOT / "cobranza/index.html"
PAGES = (ROOT / "noticias/index.html", ROOT / "noticias/nota/index.html")
FOOTER = re.compile(r'<footer\b[^>]*\bid="footer"[^>]*>.*?</footer>', re.S)
TARGET = re.compile(
    r'<!-- ALA footer start -->.*?<!-- ALA footer end -->'
    r'|<footer class="press-footer"[^>]*>.*?</footer>',
    re.S,
)
RESOURCE_START = "<!-- ALA footer assets start -->"
RESOURCE_END = "<!-- ALA footer assets end -->"
RESOURCE = re.compile(rf'{RESOURCE_START}.*?{RESOURCE_END}', re.S)
ASSETS = (
    ("cobranza/home-footer.css", '<link rel="stylesheet" href="{url}">'),
    ("noticias/footer.css", '<link rel="stylesheet" href="{url}">'),
    ("cobranza/home-footer.js", '<script src="{url}" defer></script>'),
)


def render_footer(markup, prefix):
    markup = re.sub(r'((?:href|src)=")\.\./', rf'\g<1>{prefix}', markup)
    markup = re.sub(r'<!--.*?-->\s*', '', markup, flags=re.S)
    markup = re.sub(r'\n\n\n+', '\n\n', markup)
    for value, href in (
        ("8009530794", "tel:+528009530794"),
        ("8002883450", "tel:+528002883450"),
        ("contacto-ala@alaprestamo.com", "mailto:contacto-ala@alaprestamo.com"),
    ):
        markup = markup.replace(value, f'<a class="footer-contact-value" href="{href}">{value}</a>')
    return f"<!-- ALA footer start -->\n{markup}\n<!-- ALA footer end -->"


def asset(path, tag, prefix):
    digest = sha256((ROOT / path).read_bytes()).hexdigest()[:10]
    return tag.format(url=f"{prefix}{path}?v={digest}")


def install(page, markup):
    prefix = "../" * (len(page.relative_to(ROOT).parts) - 1)
    text, replaced = TARGET.subn(lambda _: render_footer(markup, prefix), page.read_text(), count=1)
    if not replaced:
        raise ValueError(f"No footer found in {page.relative_to(ROOT)}")
    resources = "\n  ".join(
        [RESOURCE_START, *(asset(path, tag, prefix) for path, tag in ASSETS), RESOURCE_END]
    )
    if RESOURCE.search(text):
        text = RESOURCE.sub(lambda _: resources, text, count=1)
    else:
        text = text.replace("</head>", f"  {resources}\n</head>", 1)
    page.write_text(text)


if __name__ == "__main__":
    footer = FOOTER.search(SOURCE.read_text())[0]
    for target in PAGES:
        install(target, footer)

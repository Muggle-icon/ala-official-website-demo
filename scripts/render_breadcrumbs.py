#!/usr/bin/env python3
"""Render the shared breadcrumb trail on the site's inner pages."""
from hashlib import sha256
from html import escape, unescape
import json
from pathlib import Path
import re
import sys


ROOT = Path(__file__).resolve().parents[1]
BLOG = ("Blog", "channel/loan_blog/")
AYUDA = ("Ayuda", "channel/loan_faq/")
CITIES = ("Préstamo en tu ciudad", "channel/loan_city/")
LABELS = {
    "channel/loan_protection/": "Protección regulatoria",
    BLOG[1]: BLOG[0],
    AYUDA[1]: AYUDA[0],
    "channel/help-center/": "Centro de ayuda",
    "cobranza/": "Cobranza",
}
LEGAL_ROUTES = {
    f"channel/{slug}/"
    for slug in ("ios_contract", "privacy", "ios_privacy", "regist", "ios_regist")
}
CITY_LABELS = {
    "merida": "Mérida",
    "ciudad juarez": "Ciudad Juárez",
    "nezahualcoyotl": "Nezahualcóyotl",
    "torreon": "Torreón",
}
CONTENT_START = '<div id="ala-content" tabindex="-1"></div>'
BREADCRUMBS = re.compile(r"\n?<!-- ALA breadcrumbs start -->.*?<!-- ALA breadcrumbs end -->", re.S)
STYLESHEET = re.compile(r'^\s*<link\b[^>]*shared/breadcrumbs\.css[^>]*>\n?', re.M)
CATALOG = json.loads((ROOT / "live/blog/catalog.json").read_text())
ARTICLES = {article["url"]: article for article in CATALOG["articles"]}
CATEGORIES = {category["url"]: category["name"] for category in CATALOG["blogMenu"]}
CITY_ROUTES = {city["url"]: city["name"] for city in CATALOG["cities"]}
VERSION = sha256((ROOT / "shared/breadcrumbs.css").read_bytes()).hexdigest()[:10]


def plain_text(markup):
    return " ".join(unescape(re.sub(r"<[^>]+>", "", markup)).split())


def article_title(html):
    headline = re.search(r"<h1\b[^>]*>(.*?)</h1>", html, re.S)
    return plain_text(headline[1])


def city_label(city):
    return CITY_LABELS.get(city.casefold(), city.capitalize() if city.islower() else city)


def trail(route, html):
    if route in LEGAL_ROUTES:
        document = re.search(r'<iframe\b[^>]*\btitle="([^"]+)"', html)
        return [("Documentos legales", "#documentos-legales"), (unescape(document[1]), None)]
    if route in LABELS:
        parents = [AYUDA] if route in ("cobranza/", "channel/help-center/") else []
        return [*parents, (LABELS[route], None)]
    if route in CITY_ROUTES:
        return [BLOG, CITIES, (city_label(CITY_ROUTES[route]), None)]
    if route.startswith("article/"):
        if article := ARTICLES.get(route):
            parents = [
                (city_label(path["name"]) if path["url"] in CITY_ROUTES else path["name"], path["url"])
                for path in article["channel"]["paths"]
            ]
        else:
            parents = [AYUDA]
        return [*parents, (article_title(html), None)]
    for section, name in CATEGORIES.items():
        if route == section:
            return [BLOG, (name, None)]
        if route.startswith(section):
            page = route.removeprefix(section).strip("/")
            return [BLOG, (name, section), (f"Página {page}", None)]
    return []


def render(prefix, items):
    rendered = []
    for label, destination in [("ALA", ""), *items]:
        label = escape(label)
        if destination is None:
            rendered.append(f'    <li><span aria-current="page">{label}</span></li>')
        else:
            rendered.append(f'    <li><a href="{escape(prefix + destination)}">{label}</a></li>')
    return (
        '\n<!-- ALA breadcrumbs start -->\n<nav class="ala-breadcrumbs" aria-label="Ruta de navegación">\n'
        '  <ol role="list">\n' + "\n".join(rendered) +
        '\n  </ol>\n</nav>\n<!-- ALA breadcrumbs end -->'
    )


def install(page):
    html = page.read_text()
    route = page.parent.relative_to(ROOT).as_posix() + "/"
    if not (items := trail(route, html)):
        return
    prefix = "../" * (len(page.relative_to(ROOT).parts) - 1)
    without_trail = BREADCRUMBS.sub("", html, count=1)
    tag = f'  <link rel="stylesheet" href="{prefix}shared/breadcrumbs.css?v={VERSION}">\n'
    updated, matches = re.subn(re.escape(CONTENT_START), lambda m: m[0] + render(prefix, items), without_trail, count=1)
    if not matches:
        raise ValueError(f"Missing page content anchor in {page.relative_to(ROOT)}")
    updated = STYLESHEET.sub("\n", updated)
    updated = updated.replace("</head>", tag + "</head>", 1)
    if updated != html:
        page.write_text(updated)


if __name__ == "__main__":
    files = [ROOT / path for path in sys.argv[1:]] or [
        *(ROOT / "channel").glob("**/index.html"),
        *(ROOT / "article").glob("*/index.html"),
        ROOT / "cobranza/index.html",
    ]
    for file in sorted(files):
        install(file)

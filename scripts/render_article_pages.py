#!/usr/bin/env python3
"""Render Blog article pages and the collection page rich text."""
from datetime import datetime
from hashlib import sha256
from html import escape, unescape
from html.parser import HTMLParser
import json
from pathlib import Path
import re
import sys
from textwrap import indent
from urllib.parse import quote


ROOT = Path(__file__).resolve().parents[1]
CATALOG = json.loads((ROOT / "live/blog/catalog.json").read_text())
ARTICLES = {article["url"]: article for article in CATALOG["articles"]}
SCRIPT = "live/blog/ala-www/js/article-page.js"
STYLE = "live/blog/ala-www/css/article-page.css"
CARD_SCRIPT = "live/blog/article-cards.js"
CARD_STYLE = "shared/editorial-cards.css"
START = "<!-- ALA article start -->"
END = "<!-- ALA article end -->"
FOOTER = re.compile(r"\n<style>\s+\* \{\s+box-sizing: border-box;")
ASSETS = re.compile(
    r'[ \t]*<(?:link|script)\b[^>]*(?:blog/ala-www/(?:css|js)/article-page|'
    r'blog/article-cards|shared/editorial-cards|ala-www/js/swiper(?:\.animate1\.0\.3)?\.min)'
    r'\.(?:css|js)[^>]*>(?:</script>)?\n?', re.M
)


class CaptureDiv(HTMLParser):
    """Return exact source bounds even when the editor nests divs in the body."""
    def __init__(self, html, attribute, value):
        super().__init__(convert_charrefs=False)
        self.attribute = attribute
        self.value = value
        self.starts = [0, *(line.end() for line in re.finditer("\n", html))]
        self.bounds = None
        self.start = None
        self.depth = 0
        self.feed(html)

    def source_offset(self):
        line, column = self.getpos()
        return self.starts[line - 1] + column

    def handle_starttag(self, tag, attrs):
        if tag != "div" or self.bounds:
            return
        if self.depth:
            self.depth += 1
        elif (self.attribute, self.value) in attrs:
            self.start = self.source_offset() + len(self.get_starttag_text())
            self.depth = 1

    def handle_endtag(self, tag):
        if tag == "div" and self.depth:
            self.depth -= 1
            if not self.depth:
                self.bounds = (self.start, self.source_offset())


def div_content(html, attribute, value):
    bounds = CaptureDiv(html, attribute, value).bounds
    return html[slice(*bounds)] if bounds else None


def clean_text(html):
    return " ".join(unescape(re.sub(r"<[^>]+>", "", html)).split())


def matched(pattern, html, default=""):
    match = re.search(pattern, html, re.S)
    return match[1] if match else default


def version(path):
    return sha256((ROOT / path).read_bytes()).hexdigest()[:10]


def asset(path, prefix="../../"):
    return f"{prefix}{path}?v={version(path)}"


def rich_text_markup(body):
    return f'<div class="article-content" id="richTextContent">{body}</div>'


def render_faq_links(links, category):
    items = []
    for href, title in links:
        items.append(f'''        <li class="ala-editorial-card">
          <a class="ala-editorial-link" href="{escape(unescape(href), quote=True)}">
            <div class="ala-editorial-copy">
              <p class="ala-editorial-category">{escape(category)}</p>
              <h3 class="ala-editorial-title">{escape(clean_text(title))}</h3>
            </div>
          </a>
        </li>''')
    return "\n".join(items)


def recommendation_markup(article, category, href, faq_links):
    if article:
        href = "../../channel/loan_blog/"
        paths = article["channel"]["paths"]
        parent = paths[-2]["alias"] if len(paths) > 2 else ""
        data = (f' data-article-id="{article["id"]}"'
                f' data-channel-id="{article["channelId"]}"'
                f' data-parent-channel="{escape(parent, quote=True)}"')
        heading = "Artículos recomendados"
        action = "Ver todos los artículos"
        cards = ""
        hidden = " hidden"
    else:
        data = ""
        heading = "Preguntas relacionadas"
        action = "Ver toda la ayuda"
        cards = "\n" + render_faq_links(faq_links, category) + "\n      "
        hidden = ""

    return f'''  <section class="ala-editorial-section" id="articleRecommendations" aria-labelledby="articleRecommendationsTitle"{data}>
    <h2 class="ala-editorial-heading" id="articleRecommendationsTitle"{hidden}>{heading}</h2>
    <ul class="ala-editorial-grid ala-editorial-grid--swipe"{hidden}>{cards}</ul>
    <div class="ala-editorial-actions">
      <a class="ala-section-more" href="{escape(href, quote=True)}">{action}</a>
    </div>
  </section>'''


def extract_legacy(article_html):
    title = clean_text(matched(r'<h1 class="ala-size article-main-title">(.*?)</h1>', article_html))
    date = clean_text(matched(r'<span class="ala-size article-publishDate">([^<]*)</span>', article_html))
    intro = article_html.split('id="richTextContent"', 1)[0].split("<h1", 1)[1]
    cover = re.search(r'<img\b[^>]*\bsrc="([^"]+)"[^>]*\balt="([^"]*)"[^>]*>', intro, re.S)
    definition = re.search(
        r'<div class="ala-size" style="--base-size: 34px;font-family: \'Roboto-Bold\'">(.*?)</div>\s*'
        r'<div class="ala-size text-two-line"[^>]*>(.*?)</div>', intro, re.S,
    )
    author_body = div_content(article_html, "class", "article-author-block") or ""
    author = (
        matched(r'class="article-author-avatar" src="([^"]*)"', author_body),
        matched(r'class="article-author-name">(.*?)</div>', author_body),
        matched(r'class="article-author-desc">(.*?)</div>', author_body),
    )
    faq = matched(r'<ul\b[^>]*class="[^"]*\barticle-faq-li\b[^"]*"[^>]*>(.*?)</ul>', article_html)
    faqs = re.findall(r'<a href="([^"]+)">(.*?)</a>', faq, re.S)
    return title, date, tuple(cover.groups()) if cover else None, definition, author, faqs


def article_markup(html, route, article_html):
    article = ARTICLES.get(route)
    title, date, cover, definition, author, faqs = extract_legacy(article_html)
    body = div_content(article_html, "id", "richTextContent")
    if not title or not date or body is None or (not article and not faqs):
        raise ValueError(f"Missing article content in {route}")

    breadcrumb = html.split("<!-- ALA breadcrumbs start -->", 1)[1].split("<!-- ALA breadcrumbs end -->", 1)[0]
    parents = re.findall(r'<li><a href="([^"]+)">(.*?)</a></li>', breadcrumb, re.S)
    href, category = parents[-1]
    href, category = unescape(href), clean_text(category)
    pubdate = datetime.strptime(date, "%d/%m/%Y").date().isoformat()
    parts = [f'''{START}
<main class="ala-article-page">
  <article class="ala-article-reading" aria-labelledby="article-title">
    <header class="ala-article-header">
      <div class="ala-article-meta">
        <a href="{escape(href, quote=True)}">{escape(category)}</a>
        <time datetime="{pubdate}">{escape(date)}</time>
      </div>
      <h1 class="ala-article-title" id="article-title">{escape(title)}</h1>
      <div class="ala-article-share" hidden>
        <button class="ala-article-share-button ala-button" type="button">Copiar enlace</button>
        <span class="ala-article-share-status" role="status"></span>
      </div>
    </header>''']

    if cover:
        src, alt = (escape(unescape(value), quote=True) for value in cover)
        parts.append(f'''    <div class="ala-article-cover">
      <img src="{src}" alt="{alt}" decoding="async" fetchpriority="high">
    </div>''')

    if re.search(r"<h[1-6]\b", body, re.I):
        parts.append('''    <details class="ala-article-outline" hidden>
      <summary>Índice del artículo</summary>
      <ol id="anchorDirectory"></ol>
    </details>''')

    if definition:
        parts.append(f'''    <section class="ala-article-definition" aria-labelledby="article-definition">
      <h2 id="article-definition">{definition[1]}</h2>
      <p>{definition[2].strip()}</p>
    </section>''')

    parts.append("    " + rich_text_markup(body))

    avatar, name, about = author
    if name.strip():
        image = f'<img src="{escape(unescape(avatar), quote=True)}" width="40" height="40" alt="" loading="lazy">' if avatar else ""
        summary = f"<p>{about.strip()}</p>" if about.strip() else ""
        parts.append(f'''    <aside class="ala-article-author" aria-label="Acerca del autor">
      <div>{image}<strong>{name}</strong></div>
      {summary}
    </aside>''')

    parts.extend(["  </article>", recommendation_markup(article, category, href, faqs), "</main>", END])
    return "\n".join(parts)


def render(path):
    html = path.read_text()
    if START not in html:
        route = path.parent.relative_to(ROOT).as_posix() + "/"
        start = html.index('<div class="ala-pl ala-pr ala-mt article-page">')
        end = FOOTER.search(html, start).start()
        html = html[:start] + article_markup(html, route, html[start:end]) + "\n\n" + html[end:]

    html = ASSETS.sub("", html)
    assets = f'''
  <link rel="stylesheet" href="{asset(CARD_STYLE)}">
  <link rel="stylesheet" href="{asset(STYLE)}">
  <script src="{asset(CARD_SCRIPT)}" defer></script>
  <script src="{asset(SCRIPT)}" defer></script>
'''
    return html.replace("</head>", assets.strip("\n") + "\n</head>", 1)


def replace_collection_region(html, name, padding, markup):
    start = f"{padding}<!-- ALA collection {name} start -->"
    end = f"{padding}<!-- ALA collection {name} end -->"
    before, start_tag, remainder = html.partition(start)
    _, end_tag, after = remainder.partition(end)
    if not start_tag or not end_tag:
        raise ValueError(f"Missing collection page markers for {name}")
    return before + start_tag + "\n" + indent(markup, padding) + "\n" + end_tag + after


class CollectionHeadings(HTMLParser):
    def __init__(self, body):
        super().__init__()
        self.line_starts = [0, *(line.end() for line in re.finditer("\n", body))]
        self.ids = set()
        self.headings = []
        self.current = None
        self.feed(body)

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if anchor := attrs.get("id"):
            self.ids.add(anchor)
        if re.fullmatch(r"h[2-6]", tag):
            line, column = self.getpos()
            offset = self.line_starts[line - 1] + column + len(self.get_starttag_text()) - 1
            self.current = (tag, attrs, offset, [])

    def handle_data(self, data):
        if self.current:
            self.current[3].append(data)

    def handle_endtag(self, tag):
        if self.current and self.current[0] == tag:
            self.headings.append(self.current)
            self.current = None


def collection_outline(body):
    parsed = CollectionHeadings(body)
    items = []
    insertions = []

    for tag, attrs, offset, parts in parsed.headings:
        title = " ".join("".join(parts).split())
        if not title:
            continue
        anchor = attrs.get("id")
        if not anchor:
            base = f"{tag.upper()}-{len(items)}"
            anchor = base
            suffix = 2
            while anchor in parsed.ids:
                anchor = f"{base}-{suffix}"
                suffix += 1
            parsed.ids.add(anchor)
            insertions.append((offset, f' id="{anchor}"'))

        label = (attrs.get("data-outline-label") or "").strip() or title
        items.append(f'      <li class="link-{tag.upper()}"><a href="#{quote(anchor)}">{escape(label)}</a></li>')

    for offset, attribute in reversed(insertions):
        body = body[:offset] + attribute + body[offset:]

    if not items:
        return body, ""

    outline = [
        '<details class="ala-article-outline collection-outline index-disclosure" open>',
        '  <summary>Índice del artículo</summary>',
        '  <nav class="index-content" aria-label="Índice del artículo">',
        '    <p class="index-title" aria-hidden="true">Índice del artículo</p>',
        '    <ol id="anchorDirectory">',
        *items,
        '    </ol>',
        '  </nav>',
        '</details>',
    ]
    return body, "\n".join(outline) + "\n"


def render_collection(path):
    html = path.read_text()
    body = path.with_name("body.html.txt").read_text().strip()
    if not body:
        raise ValueError("Missing collection rich text")
    assets = "\n".join([
        f'<link rel="stylesheet" href="{asset(STYLE, prefix="../")}">',
        f'<script src="./outline.js?v={version("cobranza/outline.js")}" defer></script>',
    ])
    html = replace_collection_region(html, "rich text assets", "  ", assets)
    body, outline = collection_outline(body)
    markup = outline + rich_text_markup("\n" + indent(body, "  ") + "\n")
    return replace_collection_region(html, "rich text", "        ", markup)

def main():
    check = "--check" in sys.argv
    if "--collection" in sys.argv:
        files = [ROOT / "cobranza/index.html"]
        render_page = render_collection
        label = "collection"
    else:
        files = sorted((ROOT / "article").glob("*/index.html"))
        render_page = render
        label = "Blog"

    changed = 0
    for path in files:
        new_html = render_page(path)
        if new_html != path.read_text():
            changed += 1
            if not check:
                path.write_text(new_html)
    print(f"{changed} {label} pages {'need regeneration' if check else 'updated'}")
    return bool(check and changed)


if __name__ == "__main__":
    raise SystemExit(main())

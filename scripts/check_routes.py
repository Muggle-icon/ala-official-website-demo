from collections import defaultdict
from html.parser import HTMLParser
from pathlib import Path
import re
from urllib.parse import unquote, urlsplit

root = Path.cwd()
paths = [root/'index.html',root/'marca/index.html',root/'cobranza/index.html',root/'noticias/index.html'] + list((root/'channel').rglob('*.html'))+list((root/'article').rglob('*.html'))
seen = defaultdict(set)

class Page(HTMLParser):
    refs = None
    def __init__(self):
        super().__init__()
        self.refs = []
    def handle_starttag(self, tag, attrs):
        for key,value in attrs:
            if key in {'src','href','poster','data-src','data-href','data-url'} and value:
                self.refs.append((tag,key,value))
            if key == 'srcset' and value and not value.startswith('data:'):
                self.refs.extend((tag,key,part.strip().split()[0]) for part in value.split(',') if part.strip())

for p in paths:
    html = p.read_text()
    page = Page()
    page.feed(html)
    for match in re.findall(r'''\\?["']((?:\./|\.\./)+(?:article|channel)/[^"'\\\s#?]+)\\?["']''',html):
        page.refs.append(('script','string',match))
    for tag,key,ref in page.refs:
        ref=ref.strip()
        if not ref or ref.startswith('#'): continue
        try:
            u=urlsplit(ref)
        except ValueError:
            seen['invalid URL'].add((str(p.relative_to(root)),ref))
            continue
        if u.scheme and u.scheme not in ('http','https'): continue
        if u.netloc.lower() in ('alaprestamo.com','www.alaprestamo.com','static.alaprestamo.com'):
            seen['production URL'].add((str(p.relative_to(root)),ref))
            continue
        if u.netloc: continue
        if not u.path: continue
        if u.path.startswith('/'):
           seen['prefix unsafe'].add((str(p.relative_to(root)),ref))
           continue
        target = (p.parent / unquote(u.path)).resolve()
        if not target.is_relative_to(root):
           seen['outside demo'].add((str(p.relative_to(root)),ref))
        elif target.is_dir() and not (target/'index.html').is_file() or not target.exists():
           seen['missing target'].add((str(p.relative_to(root)),ref))
print(len(paths),'pages checked')
for k,v in seen.items():
    print(k,len(v))
    for a in sorted(v)[:20]: print(*a)
if any(seen.values()): raise SystemExit(1)

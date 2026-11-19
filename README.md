# ALA website design demo

This repository contains a self-contained static review of ALA's Mexican website captured on 2026-11-17. GitHub Pages serves the repository root. Relative URLs support both a server root and a GitHub Pages project prefix.

| Route | Page |
| --- | --- |
| `/` | Product homepage |
| `/noticias/` | Featured media coverage and a searchable publication catalog |
| `/noticias/nota/?id=seguimiento-solicitud` | Example newsroom article with related publications |
| `/channel/loan_protection/` | Regulatory protection |
| `/channel/loan_blog/` | Blog, categories, pagination, and article details |
| `/channel/loan_faq/` | Ayuda |
| `/channel/help-center/` | Help center and official contact options |
| `/marca/` | Approved ALA brand design, also reached by `/channel/about-ala/` |
| `/cobranza/` | Collection and late-payment design for review |

Public legal pages and the two linked disclosures are included. Blog and city listings use a local snapshot. Files in the old design at `/diseno-anterior.html` and `/help.html` document prior iterations.

The review site's internal pages, articles, and disclosures stay within the demo. App stores, social channels, regulator sites, and standard call and email links open their original destinations. Customer support actions use the demo contact page where the live chat would require a production service.

The newsroom keeps links to real coverage and published press releases in [its main page](noticias/index.html). The twelve entries in [the sample catalog](noticias/archive-examples.js) are marked Demo in the list and article views. Add or edit a sample there using a stable slug, category, date, title, summary, and body paragraphs. The article view and the catalog read the same records.

The brand design contains historical product disclosures. The standalone collection article uses draft Spanish and can be opened directly at `/cobranza/`. Confirm the approved content before any production CMS release. To update the review copy, edit [the collection rich-text source](cobranza/body.html.txt), then run `python3 scripts/render_article_pages.py --collection` to regenerate the static page. Use `--collection --check` to verify it is up to date.

## Run locally

```bash
python3 -m http.server 4217 --bind 127.0.0.1
```

Open `http://127.0.0.1:4217/`. No build is required to preview the committed HTML.

Run `python3 scripts/render_headers.py` to refresh the shared navigation and `python3 scripts/render_breadcrumbs.py` to refresh the section hierarchy. Use `python3 scripts/check_routes.py` to check local paths and detect any links that send the reader to ALA's production domain.

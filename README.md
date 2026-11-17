# ALA website design demo

Static design review for the Mexican ALA website. GitHub Pages serves this repository root. The routes use relative asset paths so the same files work under a GitHub Pages project prefix.

| Route | Page |
| --- | --- |
| `/` | Production homepage reference captured on 2026-11-17 |
| `/marca/` | Original ALA brand page |
| `/cobranza/` | Spanish collection and late-payment design for review |
| `/diseno-anterior.html` | Former homepage design |
| `/help.html` | Former help center design |

The homepage uses a local snapshot of the public assets and reviews from `www.alaprestamo.com`. Its existing Acerca de ALA link opens the original brand design. Other content and legal links lead to the official site. The support widget hands off to the official help center. The mirror omits analytics and production API calls.

The collection article is available by direct URL. Its copy is adapted from the supplied prototype for design review. Confirm the final approved Spanish copy before publishing to the production CMS. The original brand page shows historical product disclosures.

## Run locally

```bash
python3 -m http.server 4217 --bind 127.0.0.1
```

Open `http://127.0.0.1:4217/`. No build step is required.

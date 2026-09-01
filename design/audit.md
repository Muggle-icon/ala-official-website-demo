target: FAQ section on the ALA homepage
goal: Keep every FAQ state readable, preserve clear hierarchy, and prevent the full-help link from colliding with the footer.

| # | area | issue | sev | fix | eff |
|---|------|-------|-----|-----|-----|
| 1 | layout | The desktop FAQ section had a fixed viewport height, so an expanded answer could place the full-help link against or beneath the footer. | HIGH | Use `min-height: 100svh` with natural content height and reserved bottom padding. | S |
| 2 | hierarchy | The outlined pill for “Ver toda la ayuda” reused the category-tab silhouette and could read as a fourth category. | MED | Demote it to a centered blue text link with a chevron and a 44px minimum target. | S |

notes: Keyboard focus treatment remains visible. Full assistive-technology testing was not performed.
verdict: Fix the height behavior first, then separate the secondary navigation from category controls.

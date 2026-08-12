# ALA production layout DNA

Source inspected: `https://www.alaprestamo.com/`

## Horizontal layout rule

The production site uses a 1920px reference layout. Desktop header, hero copy,
and footer start from a 320px base gutter, multiplied by a breakpoint scale:

| Viewport width | Scale | 320px gutter becomes |
| --- | ---: | ---: |
| 1900px and above | 1 | 320px |
| 1500–1899px | 1 / 1.2 | 266.667px |
| 1366–1499px | 0.8 | 256px |
| 1200–1365px | 1 / 1.4 | 228.571px |
| 769–1199px | 1 / 1.6 | 200px |
| 768px and below | mobile override | 24px |

The source implements this through `--base-*` component variables and a shared
`--current-scale` selected by media queries. Its desktop header and footer both
carry `--base-pl: 320px` and `--base-pr: 320px`; the hero copy carries
`--base-ml: 320px`.

## Demo mapping

- `--ala-layout-scale` reproduces the source breakpoints.
- `--page-gutter` is `320px × --ala-layout-scale`, with the source's 24px
  mobile fallback.
- Desktop navigation, desktop hero copy, help content, and the footer frame use
  the same token so their left and right edges remain aligned.
- Component-specific mobile layouts keep their existing design-specific inner
  spacing where the supplied mobile mockup intentionally differs.

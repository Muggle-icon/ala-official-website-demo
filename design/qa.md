prototype: ALA homepage FAQ + footer
source: latest “Preguntas frecuentes” reference image, homepage hero typography, and the whole-page consistency direction

visual:
- PASS: Desktop heading ladder is 64px hero → 48px FAQ → 24px footer.
- PASS: Supporting scale is 18px hero CTA → 16px FAQ controls/body → 14px footer auxiliary/legal copy.
- PASS: FAQ title, category tabs, and cards share the same left edge, matching the new reference structure.
- PASS: The category row contains Solicitud, Crédito, Problemas, and Otros; the final help action is a centered sentence-style prompt.
- PASS: The help prompt stays in the lower part of the screen when all cards are collapsed and moves naturally when content grows.
- PASS: FAQ component scale remains consistent with the hero: 48px tab height, 96px cards, 20px gaps, 20px icons, and 20px radii.
- PASS: Shared 320px desktop gutters remain unchanged.
- MANUAL: Browser security policy blocked a rendered screenshot capture, so final pixel appearance still needs an in-app visual glance.

behavior:
- PASS: FAQ items remain collapsed by default.
- PASS: Active and inactive tabs share identical height, padding, type size, and weight, so selection does not shift their position.
- PASS: Expanded cards retain natural height and reserved bottom space, preventing the center-help prompt from being covered.

requirements:
- PASS: The hero remains the strongest visual layer.
- PASS: FAQ reads as a secondary content section.
- PASS: Footer reads as supporting and compliance information rather than another primary screen.

a11y:
- PASS: FAQ controls and the center-help link retain accessible target sizing or visible focus styles as appropriate.
- MANUAL: Screen-reader and full contrast testing were not performed.

verdict: READY at code level; rendered pixel confirmation remains manual because browser capture was blocked by policy.

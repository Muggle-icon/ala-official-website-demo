prototype: ALA homepage FAQ + footer
source: homepage hero typography and the latest whole-page consistency direction

visual:
- PASS: Desktop heading ladder is 64px hero → 48px FAQ → 24px footer.
- PASS: Supporting scale is 18px hero CTA → 16px FAQ controls/body → 14px footer auxiliary/legal copy.
- PASS: FAQ component scale was reduced with the type: 48px tabs, 96px cards, 20px gaps, 20px icons, and 20px radii.
- PASS: Shared 320px desktop gutters remain unchanged.
- MANUAL: Browser security policy blocked a rendered screenshot capture, so final pixel appearance still needs an in-app visual glance.

behavior:
- PASS: FAQ items remain collapsed by default.
- PASS: Active and inactive tabs share identical height, padding, type size, and weight, so selection does not shift their position.
- PASS: Expanded cards retain natural height and reserved bottom space, preventing the full-help link from being covered.

requirements:
- PASS: The hero remains the strongest visual layer.
- PASS: FAQ reads as a secondary content section.
- PASS: Footer reads as supporting and compliance information rather than another primary screen.

a11y:
- PASS: FAQ controls and the full-help action retain at least 44px targets and visible focus styles.
- MANUAL: Screen-reader and full contrast testing were not performed.

verdict: READY at code level; rendered pixel confirmation remains manual because browser capture was blocked by policy.

# Navigation and reading review

| Priority | Observation | Change |
| --- | --- | --- |
| High | Primary navigation and article links could leave the demo | Localize primary routes, article details, listings, help and public legal files. Review cross-page links on the deployed project prefix. |
| High | The homepage, secondary pages and review pages used different header implementations | Use one rendered HTML header, a 64px desktop row, a 60px mobile row and 15px labels. Keep the current page underlined on desktop and highlighted in the mobile list. |
| High | Dropdown state depended on pointer position and the position of crossed elements | Use a 100ms intent delay and a 150ms leave delay with a contiguous pointer target. Close immediately on moving to another main item. Support Arrow Down, Escape, outside click and visible keyboard focus. |
| Medium | Hero text faded in after the layout was already visible, and desktop help promos could cover reading controls | Render the home title on first paint. The security notice remains in the header, and its details open on request. Show a compact contact button and reveal the larger home QR after the hero leaves the viewport on wide screens. |
| Medium | The same navigation roles and page headings had inconsistent sizes | Use Roboto throughout shared navigation and unify its labels, principal headers and reading styles. Apply 32–48px to page titles and 16px with 26px leading to reading copy. |

The visible structure of [Wise Mexico](https://wise.com/mx/) informed keeping help separate from product navigation. [GOV.UK service navigation](https://design-system.service.gov.uk/components/service-navigation/) informed reuse, mobile disclosure and current-page semantics. [Stripe Mexico](https://stripe.com/mx) was used to compare how grouped links and primary destinations are presented. The ALA timing and size values are design decisions for this demo.

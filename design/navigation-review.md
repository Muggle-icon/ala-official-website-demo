# ALA homepage and global navigation

The reviewed home reference is the original Demo's 1945 navigation worktree, which includes the final adjustment to the symmetric dropdown. The same proportions and behavior apply to each page in the review site. The homepage also uses the approved portrait crops and restores the original content entrance rhythm. Current product disclosures remain in the hero.

| Item | Review specifications |
| --- | --- |
| Desktop header | At 1920 × 1080 the bar is 72px, the logo is 126 × 48px, and links use Roboto 16/24 at weight 400. At 1440 × 900 the same values are 54px, 94.5 × 36px and 12/18. |
| Scroll states | The notice is part of the page flow. The fixed bar follows its remaining height as it leaves the viewport and becomes solid white when it reaches the top. The white bar also appears while a desktop disclosure is open. |
| Drop-downs | Links and triggers use the same type. The surface is centered on the trigger, padded 12px and rounded to 12px. Active or hovered triggers receive a gray fill. Moving between menus clears the previous highlight immediately. Route position is conveyed semantically. |
| Mobile | Retain the app icon, centered Sobre ALA pill and unboxed hamburger. Opening the menu provides independent scrolling, a focus boundary and Escape to return focus. The real browser supplies the device status bar. |
| Homepage hero | Title, store links and statistics enter in order at 0, 80 and 160ms. The 440ms desktop duration becomes 320ms on phones. Their position and size stay stable. |
| Application steps | Section title is 28–40px in one ink color. Step headings use 24/30 and copy uses 16/24. Four equally sized cards use manual arrow, keyboard and touch scrolling. The cards extend together when text needs extra room. |
| Help and download | The compact control stays at 44px high throughout the page. The QR opens on demand. The mobile control appears after the hero clears, leaving both app-store links unobscured on entry. |

At 1496 × 716, [ChatGPT Business](https://chatgpt.com/zh-Hans-CN/business/) uses the same 14px regular type for nav labels and drop-down rows, with a subdued fill on the open trigger. At 1440 × 900 in Spanish, [Wise Mexico](https://wise.com/mx/) uses a shared 18/26 navigation scale and symmetric row padding. ALA retains its reviewed sizes and uses these references to check consistency across roles. [Vercel's Web Interface Guidelines](https://github.com/vercel-labs/web-interface-guidelines) and the [W3C disclosure example](https://www.w3.org/WAI/ARIA/apg/patterns/disclosure/examples/disclosure-navigation/) informed focus handling, motion preferences and keyboard behavior.

The approved brand layout is the destination for Sobre ALA on desktop and mobile. The older Acerca de ALA URL resolves to this page. The common header leaves its original hero typography in place.

The breadcrumbs and the Ayuda content frame share the logo gutter. Breadcrumbs use 14/20px text and a centered 6px separator. Ayuda starts its heading, categories and question group on this same line. Category labels use 15px at every state, with a 44px target and an underline for selection. On small screens the categories occupy two columns. Questions use 16/24px, with one divider between the rows and stable text alignment when opening an answer. The link to Cobranza is available in Ayuda and within the payment safety guidance in Centro de ayuda.

[Wise Help](https://wise.com/es/help/) and [Stripe Support](https://support.stripe.com/) were reviewed for the order and hierarchy of categories and questions. The shared breadcrumb uses the [W3C breadcrumb pattern](https://www.w3.org/WAI/ARIA/apg/patterns/breadcrumb/).

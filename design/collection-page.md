# ALA collection page review

The MXG-ALA product brief v1.1 §3.9.1 and §3.9.6 specify an independent public URL. In the demo, open `/cobranza/` directly. The page has no breadcrumb, and the main navigation keeps its existing destinations.

The article retains its Spanish title, payment steps, information about due dates, complaint guidance, six questions, and official contact details in the initial HTML. Questions and answers are visible on load. The site header, footer, and ALA illustration are shared design elements. The link below the verification note takes readers directly to the phone numbers and opening hours in the same article.

## Production discovery and checks

The demo includes `noindex, follow` for design review. Publish the approved text at an HTTPS URL on the official domain that returns HTTP 200 without login. Keep the article in the initial HTML, remove the demo's indexing restriction from the production route, set a canonical pointing to that final URL, and include it in the official [page sitemap](https://www.alaprestamo.com/sitemap-pages.xml). Check robots rules and CDN access for Googlebot, Bingbot, and OAI-SearchBot. Sitemap discovery can support the standalone URL without adding a homepage or global navigation entry.

Use [Search Console URL Inspection](https://support.google.com/webmasters/answer/9012289) to review the fetched HTML and Google indexing status. Google AI features use indexed pages eligible for search snippets. [Google AI features guidance](https://developers.google.com/search/docs/appearance/ai-features)

Verify OpenAI search crawler requests in server or CDN logs against the [published OAI-SearchBot IP ranges](https://developers.openai.com/api/docs/bots). A successful fetch confirms access. Actual citations can be checked with relevant Spanish-language queries after publication.

Final official copy and localization, CMS editing, and UBS events remain production requirements under §3.9.2–3.9.5.

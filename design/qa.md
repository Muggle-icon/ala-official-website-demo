# ALA homepage module verification

## Layout

- Application steps, regulatory protection, reviews, FAQ, and articles share the content rail and centered 28–40px section-heading scale.
- FAQ and article cards share the 16px radius. The FAQ link sits inside its content rail and a single section gap precedes articles.
- The homepage and 20 city pages render one regulatory section with three cards. Chrome layout checks covered 320–1920px, including 991px, 992px, the 1101px navigation breakpoint, and wider desktop rails.
- Stretched copy using nested text elements and long words wraps at 320px. Regulatory and FAQ cards grow with their content. Regulatory artwork stays within its grid and clear of reviews.
- Reviews use one title and align their carousel frame to the article rail. Desktop buttons and mobile swipe continue to change the active review.

## Controls

- Shared continuation controls render text only. The 44px target, visible keyboard focus, and underline on hover support navigation.
- Chrome exercised the homepage FAQ accordion and destination, blog article navigation, article return, loading more articles, and both pagination directions. Static inspection covered all 233 shared continuation controls.
- `python3 scripts/check_routes.py` checks local links and demo-prefix compatibility. `python3 scripts/render_article_pages.py --check` verifies the article template output.

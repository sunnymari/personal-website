# Website check — October 30, 2026

Reviewed marissacodes.com, including Home, About, Projects, Growth, Company, Blog, Modeling, Art, Shop, Sprout (both routes), and Starbot.

## Fixes

- Homepage: replaced the overflowing desktop menu with two rows of five cards; kept phone swipe navigation and added a visible hint. Allowed vertical scrolling on short screens and kept the welcome text visible instead of repeatedly fading it to an empty box. The navigation remains available if the decorative 3D scene fails.
- Modeling: enlarged photos now use a native modal dialog, which moves keyboard focus into the viewer, contains navigation there, and restores focus on closing. Previous/next and Escape remain supported.
- Cursor: retain the normal pointer until the sword model loads; restore it on rendering/loading failures; hide the decorative cursor when leaving the page or entering an iframe; stop its render loop while inactive. Skip it for touch and reduced-motion preferences.
- Blog: defer the 91 MB video download until playback is requested. Existing poster and controls remain.

## Verification

- Production build and git diff whitespace check passed.
- All 12 page routes returned 200; 20 discovered internal links/static assets passed; no broken static fragment targets, duplicate IDs, or missing static image alt attributes were found.
- An additional 124 gallery, artwork, and homepage model asset URLs returned 200.
- Retired page redirects work. An unknown page correctly returns 404.
- Browser checks covered phone (390 px), tablet (768 px), desktop (1280 px), menu boundaries, gallery open/next/close and focus restoration, Tech/Life switching with keyboard arrows, interactive art activation, Sprout tabs and live CAISO data, and Starbot injection/reset controls.
- Public GET endpoints for grid, providers, and research logs returned 200. Waitlist correctly rejects GET with 405.
- No console errors appeared during the inspected normal browser flows.

## Limits and follow-up opportunities

- No real waitlist emails, purchases, research votes, or AI requests were submitted during this check.
- Four outgoing destinations (Amazon registry, LinkedIn, Tesla careers, Tesla impact) blocked automated HTTP checks. Their URLs were retained; those blocks do not establish that the user-facing pages are broken. Eight other checked outgoing destinations responded successfully.
- 3D assets and the Sprout map still make some pages heavy on slower connections. The build retains its existing large-bundle warning; the video is now opt-in to download. This was functional and responsive smoke testing, not a formal accessibility or security certification.

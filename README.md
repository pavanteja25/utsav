# The Utsav House — Next.js website

A complete responsive frontend based on the supplied forest-green and beige template, using your original logos.

## Run locally

Install Node.js 20.9 or newer. Extract this ZIP, open the `utsav` folder in VS Code, and run:

```bash
npm ci
npm run dev
```

Open http://localhost:3000.

## Build and host

```bash
npm run build
```

The production website is exported to `out/`. Upload that folder to a static host with directory-index support. Every route has its own HTML file, including wedding and social subcategories. Vercel can build this Next.js project directly. For a local production check, run `python -m http.server 3000 --directory out` after building. `next start` is not used with static export.

## Included

- Next.js 15 App Router, React 19, Three.js and Framer Motion.
- Home, About, Services, Gallery and Contact routes.
- Six main service routes, with 15 images per collection.
- Wedding routes: Engagement, Pellikoduku, Pellikuthuru, Haldi, Sangeeth and Wedding Day Decor.
- Social routes: Kitty Parties, Reunion Parties and Traditional Festival Events.
- Circular continuously rotating category selector, hover/focus pause and manual pause.
- Original logo entrance that shrinks into the header once per session. To replay, clear sessionStorage or use a fresh browser session.
- Three.js metallic floral sculptures with mouse-responsive depth. Graceful fallback without WebGL.
- Animated page transitions; infinite horizontally scrolling sample testimonials.
- Infinite two-axis image gallery, pointer dragging, wheel scrolling, auto-scroll toggle, direction selector, category filters, and green/beige treatments that reveal original colours on hover or keyboard focus.
- Image lightbox with arrow-key and Escape controls.
- Responsive layouts, keyboard navigation and reduced-motion support.
- All imagery and both original brand files bundled locally.

## Content and image sources

`src/images.json` contains 15 entries for each of 15 service/category collections (225 placements). Images are reused across related collections; this is not 225 unique photographs. `public/images/credits.json` records source information. Images were sourced through available web/image search, not a Google API.

These are third-party Indian event inspiration photographs, not a portfolio of work completed by The Utsav House. Source credits do not constitute permission to reuse the images commercially. Obtain permission or replace them with owned/licensed photos before public launch. Some collections use related Indian decor/gathering inspiration rather than a verified photograph of that exact ritual. Do not represent them as your own events.

Sample testimonials are explicitly labelled. Replace them with approved customer reviews in `src/main.jsx`.

The contact form validates the event details and opens a prefilled WhatsApp enquiry to +91 9676837722. The visitor must tap Send in WhatsApp to submit it; there is no backend lead storage. Contact email: theutsavhouse@gmail.com. Phone numbers: +91 9676847722 and +91 9676837722. Instagram: @the_utsavhouse.

## Edit

- Layout, content, routes and interactions: `src/main.jsx`
- Colours, spacing and breakpoints: `src/style.css`
- Image collections: `src/images.json`
- Original logos and optimized display copies: `public/brand/`
- Static route generation: `app/[[...slug]]/page.jsx`
- Export configuration: `next.config.mjs`

If you add a new route, also include it in `generateStaticParams()`.

## Verification

Production compilation and static route generation were checked. Image files were checked for readability and collections for 15 entries each. Browser visual/interaction QA was unavailable in this environment; review on your target devices before launch.

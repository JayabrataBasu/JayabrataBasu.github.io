# Jayabrata Basu – Portfolio

Static, GitHub Pages–ready personal site with: hero + typewriter, CV download, interactive 3D skill sphere (Three.js), searchable / filterable projects grid, scroll‑reactive gradient background, accessible navigation, and pastel gradient design system.

## Quick Start

1. Clone or edit directly in your `JayabrataBasu.github.io` repo (master branch auto-deploys for user site).
2. Add your real `resume.pdf` at repo root.
3. Commit + push. GitHub Pages (User/Org) serves from `https://<username>.github.io/` automatically.

## File Structure (key)

```text
index.html          # Main HTML (sections + markup)
css/styles.css      # Design system & layout
css/animations.css  # Legacy animation helpers
js/main.js          # Typewriter, filters, menu, scroll gradient, tooltips
js/sphere.js        # 3D skills orb (Three.js)
assets/images/*.svg # Skill icons
resume.pdf          # (Add your CV) – referenced in buttons
```

## Customization Cheatsheet

| Area | How to Edit |
|------|-------------|
| Hero name / roles | `js/main.js` → roles array; hero paragraph in `index.html` |
| Bio + goals | About section in `index.html` |
| Skills list (text) | `<ul class="skills-list">` in About section |
| Skill orb icons / labels | `techStackIcons` array in `js/sphere.js` |
| Projects | Duplicate `.project-card` in Projects section. Set `data-tags` & update tags list if needed. |
| Filters (tags) | Buttons in `.filter-tags` (match lowercase tag in each card's `data-tags`) |
| Resume | Place `resume.pdf` at root (same level as `index.html`) |
| Colors / spacing | CSS custom properties at top of `css/styles.css` |
| Scroll gradient palette | `.scroll-gradient` variants in `css/styles.css` |
| Font stacks | Update `--font-sans` / `--font-mono` in CSS root |
| Favicon | Replace `link rel="icon"` in `index.html` |

## Performance Tuning

Already applied:

- Controlled Three.js renderer DPR (caps at 2) + lightweight sprites.
- Eased rotation logic instead of per-frame heavy calculations.
- Lazy UI effects only when scrolled (`scroll` + minimal work).
- Tooltip & filters are O(n) over visible cards only.

Optional further improvements:

1. Conditional Three.js load: move `<script src="three.min.js">` to dynamic import after intersection observes the sphere section.
2. Reduce icon count (each sprite = texture upload). Keep under ~40 for mobile.
3. Replace PNG/JPG project screenshots with optimized WebP.
4. Use CSS `prefers-reduced-motion` media queries to disable complex animations.
5. Inline critical CSS (hero + header) and defer main sheet for perceived faster paint.

## Adjust Skill Sphere Speed / Feel

Edit in `js/sphere.js`:

- `this.maxSpeed`, `this.initialSpeed`, and `this.ease` control responsiveness.
- Radius autoscales on resize; tweak multiplier `0.42` for density.

## Adding a Project

```html
<article class="project-card" data-tags="ml web" tabindex="0">
  <div class="project-media">
    <img src="assets/images/placeholder.webp" alt="Screenshot of Foo" loading="lazy" />
  </div>
  <div class="project-body">
    <h3 class="project-title">Foo Engine</h3>
    <p class="project-desc">Short punchy description (under 140 chars recommended).</p>
    <ul class="project-tags"><li>ML</li><li>Web</li></ul>
    <div class="project-links">
      <a href="https://github.com/..." aria-label="GitHub"><i class="fab fa-github"></i></a>
      <a href="https://demo..." aria-label="Live demo"><i class="fa-solid fa-arrow-up-right-from-square"></i></a>
    </div>
  </div>
</article>
```

## Scroll Reactive Background

Logic: scroll % → class `shift-1|2|3` on `.scroll-gradient` (see `main.js`). Modify gradient sets in `css/styles.css` for different palettes.

## Accessibility Notes

- Skip link, semantic headings, ARIA labels on navigation and live regions.
- Typewriter uses `aria-live="polite"` span for announcements.
- Ensure link text remains descriptive; update placeholders.

## Light vs Additional Theming

Current design is light pastel. To add dark mode:

1. Add `[data-theme="dark"]` variable overrides under `:root`.
2. Toggle attribute on `<html>` using a simple button & persist with `localStorage`.

## Deploy

User site: push to `master` of `JayabrataBasu.github.io`.

If custom domain: create `CNAME` file containing domain and configure DNS A + AAAA (or ALIAS) records to GitHub Pages IPs.

## License

You control the content. For open-source sharing, you can apply MIT (optional). Icons may have their own licenses – confirm before commercial reuse.

## Future Enhancements (Ideas)

- Dark mode toggle.
- Project detail modals (ARIA-compliant dialog) to keep grid lean.
- Blog/notes section (static markdown to HTML precommit build).
- WebGL fallback (pure CSS orbit) if WebGL unsupported.
- Replace Three.js with CSS 3D transform sphere for zero WebGL cost on low-power devices.

---

Happy building! Edit boldly, commit often.

# Fatih Tatoğlu Blog Design Guidelines (Tailwind + VanillaJS)

## 0) Brand Core

- **Voice:** Warm, candid, never salesy; deep yet approachable.
- **Impression:** A developer who simplifies complexity — disciplined, trustworthy, humble.
- **Content Pillars:**
    1. Technical Notes
    2. Life & Learning
- **Motto:** _“Hayat devam ediyor, bir ucundan tutmak lazım.”_ (Used subtly, never louder than the logo.)

## 1) Color System

Soft, low-saturation tones. Avoid high-contrast or neon shades. Both **Light** and **Dark** themes are required.

**CSS Variables (Design Tokens)**

```css
:root {
  /* Brand */
  --brand-50:#f2f7ff; --brand-100:#e6f0fe; --brand-200:#cfe0fd; --brand-300:#a8c5fb;
  --brand-400:#7ea7f6; --brand-500:#5a8df0; --brand-600:#3d73d6; --brand-700:#2f5aa9;
  --brand-800:#274a88; --brand-900:#213e6d;

  /* Sage secondary */
  --sage-50:#f4f7f5; --sage-100:#e9f0ec; --sage-200:#d5e2db; --sage-300:#b8cfc4;
  --sage-400:#95b3a5; --sage-500:#7a9b8b; --sage-600:#5f7f70; --sage-700:#4e685c;
  --sage-800:#40554b; --sage-900:#35463e;

  /* Neutrals */
  --bg:#fcfcfd; --bg-elev:#f6f7f9; --ink:#1c1f23; --ink-dim:#2a2f35; --muted:#6b7280; --border:#e5e7eb;

  /* Semantic (soft) */
  --ok:#7fb37b; --warn:#d6b25d; --err:#ce6b6b;
}
:root.dark {
  --bg:#0e1116; --bg-elev:#151a21; --ink:#e9edf3; --ink-dim:#cbd5e1; --muted:#94a3b8; --border:#263040;
}
```

## 2) Typography & Font Families

- **Headings / Logo (Monospace, retro-tech):** `"IBM Plex Mono", "JetBrains Mono", "Fira Code", ui-monospace, SFMono-Regular, Menlo, Consolas, monospace`
- **Body (Sans):** `Inter, "Helvetica Neue", Helvetica, Arial, ui-sans-serif, system-ui, sans-serif`
- **Code:** Same as heading font.
- **Measure:** 60–80 characters per line; **line-height:** body 1.6, headings 1.25.

**Type Scale (Tailwind classes)**

- h1: `text-4xl md:text-5xl font-medium tracking-tight`
- h2: `text-2xl md:text-3xl font-medium`
- h3: `text-xl md:text-2xl font-medium`
- body: `text-[17px] md:text-[18px] leading-relaxed`
- small: `text-sm text-muted`

## 3) Screen Breakdowns & Grid System

Defined in SCSS to align with design responsiveness:

```scss
$breakpoints: (
  "xs": null,
  "sm": 30em,   // ≈480px
  "md": 62em,   // ≈992px
  "lg": 75em,   // ≈1200px
  "xl": 90em    // ≈1440px
);

$columns: (
  "xs": 4,
  "sm": 8,
  "md": 12,
  "lg": 12,
  "xl": 12
);

$padding: 1em;
$gutter: 1em;
```

The system follows a **mobile-first** approach, scaling content and grids progressively.

## 4) Spacing, Radius, Elevation

- **Spacing:** Default Tailwind scale with added rhythm utilities (`gap-7`, `gap-9`).
- **Radius:** `rounded` = 8px, `rounded-lg` = 12px, `rounded-2xl` = 16px.
- **Elevation:** Gentle shadows only — use sparingly to separate layers.

## 5) Lighting & Shadows

Shadows simulate subtle lighting, giving the interface depth without distraction.

### Rules:

1. **Purpose:** Only apply shadows to emphasize hierarchy (cards, modals, sticky headers). Avoid decorative shadows.
2. **Softness:** Use wide, low-opacity spreads; no hard edges.
3. **Color:** Always neutral — derived from `rgba(0, 0, 0, 0.04–0.08)` for light mode, and `rgba(0, 0, 0, 0.3–0.4)` for dark mode.
4. **Elevation levels:**
    - _Low:_ `0 1px 2px rgba(0,0,0,0.04)`
    - _Medium:_ `0 1px 2px rgba(0,0,0,0.04), 0 8px 24px rgba(0,0,0,0.06)`
    - _High (modals):_ `0 12px 32px rgba(0,0,0,0.12)`
5. **Blending:** Prefer soft-light blending with background colors to keep a calm tone.

## 6) Iconography

- **Style:** Minimal line icons or small pixel-art touches.
- **Implementation:** Inline SVG, stroke width ≈1.5.
- **Recommended sets:** Feather-like or Lucide-like.
- **Usage:** Support meaning, never decoration.
- **Color:** Must meet contrast rules with surrounding text.

## 7) Accessibility Features

- **Contrast:** Must meet WCAG **AA** standards (`--ink` vs. `--bg`).
- **Keyboard Navigation:** Visible focus (`outline-offset-2 outline-brand-500/70`).
- **Skip Link:** Include “Skip to content” at top of pages.
- **Language:** Toggle updates `<html lang>` between TR/EN.
- **Motion:** Respect `prefers-reduced-motion` for animations.
- **Forms:** Labeled inputs, helper/error text, `aria-*` support.
- **Media:** Images require descriptive `alt`; code blocks include copy buttons.

## 8) Text Elements Guidelines

- **Links:** `text-brand-700 hover:text-brand-800 dark:text-brand-300 dark:hover:text-brand-200 underline-offset-4 hover:underline`
- **Blockquote:** Left border `brand-300`, soft background `brand-50` (dark: `bg-elev`).
- **Inline Code:** `px-1.5 py-0.5 rounded bg-brand-50 dark:bg-[#111827] text-[0.95em]`
- **Code Blocks:** Pre + code, copy button top-right.

## 9) Buttons

- **Base Token (`.btn`):** Inline-flex, uppercase IBM Plex Mono labels, shared transitions and focus ring. Background, border, ink, and shadow all come from CSS variables so every variant reads consistently in light/dark themes.
- **Sizes:** `btn--xs`, `btn--sm`, `btn--md`, `btn--lg`, `btn--xl`, and `btn--full` adjust padding, radius, and icon footprint. Header controls use `btn--md`; footer tag pills use `btn--xs`.
- **Thickness:** `btn--thin` (1px/regular) for lightweight tags, `btn--thick` (2px/bold) for primary affordances like language/theme/menu toggles and social CTAs.
- **Types:** `btn--fill` adds the soft shadow stack for pill-like chips; `btn--text` removes chrome for inline links; `btn--icon` locks the control to a square icon box while inheriting the selected size token.
- **Tones / Colors:** Tokens map to the palette—`btn--tone-neutral` (header default), `btn--tone-brand`, `btn--tone-sage` (footer tags), plus social-specific tones (`btn--tone-rss`, `btn--tone-github`, `btn--tone-linkedin`). Extend by overriding the same CSS custom properties in new tone classes.
- **Header usage:** Theme, language, and menu buttons = `btn btn--icon btn--md btn--thick btn--tone-neutral` plus their component class. `data-theme-state`, `data-active-lang`, and `data-menu-open` toggle the tone variables to highlight the active control without separate CSS; dil bayrağı kapsüllerinde hiçbir border/box-shadow yok.
- **Menu & policy:** Drawer linkleri `btn btn--fill btn--thick btn--tone-neutral menu-link` olarak hizalanır; aktif durumda brand tonuna geçer. Politika bağlantıları `btn btn--text btn--thin btn--tone-neutral policy-link` varyantını kullanır; menü açıldığında `menu-overlay` katmanı blur + karartma sağlar.
- **Footer usage:** Tag chip'leri = `btn btn--fill btn--xs btn--thin btn--tone-sage`. Sosyal linkler = `btn btn--fill btn--sm btn--thick btn--tone-{rss,github,linkedin}` ensuring consistent spacing and icon/text pairing.

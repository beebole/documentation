---
name: optimize-images
description: "Optimize all images in help/images/ by converting PNG/JPG to WebP format and compressing them. Use when asked to optimize images, compress screenshots, convert to WebP, or before publishing new documentation pages with images."
---

# Optimize Images

Optimize all images in `help/images/` for the Beebole documentation site.

## What to do

Run the local optimization script:

```bash
bash .claude/scripts/optimize-images.sh
```

This converts all PNG/JPG files in `help/images/` to WebP format using `cwebp` at quality 80. Requires `cwebp` (`brew install webp`).

## Image guidelines

Follow the image conventions in CLAUDE.md (WebP, under 200 KB, kebab-case naming). Additional notes:

- **Organization:** Place images in section subdirectories (e.g., `help/images/timesheets/`, `help/images/billing/`). Do not dump all images flat in `help/images/`.
- **Resolution:** 2x for retina (e.g., capture at 1440px wide for 720px display), then compress
- **Language-specific images:** Use subdirectories like `help/images/fr/`
- **Don'ts:** No uncompressed screenshots, no BMP/TIFF, don't keep both original and optimized versions

## Report

After running, print a summary:

```
## Image Optimization Report

**Images processed:** X
**Converted to WebP:** X
**Already optimized (skipped):** X
**Total size before:** X MB → **After:** X MB (**Saved:** X MB, X%)

### Details
| File | Original | Format | New size | Savings |
|------|----------|--------|----------|---------|
| example-feature.png | 450 KB | → WebP | 85 KB | -81% |
```

If no images needed optimization: "All images in `help/images/` are already optimized. Nothing to do."

If the script fails (e.g., `cwebp` not installed), explain the error and how to fix it.

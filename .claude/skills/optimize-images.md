# Optimize Images

Optimize all images in `help/images/` for the Beebole documentation site.

## When to use

When the user asks to "optimize images", "compress images", "convert images to webp", or similar.

## What to do

Run the local optimization script:

```bash
bash scripts/optimize-images.sh
```

This converts all PNG/JPG files in `help/images/` to WebP format using `cwebp` at quality 80. Requires `cwebp` (`brew install webp`).

## Image guidelines

- **Format:** WebP, under 200 KB per image
- **Resolution:** 2x for retina (e.g., capture at 1440px wide for 720px display), then compress
- **Naming:** Lowercase kebab-case with feature context (e.g., `approval-workflow-pending.webp`)
- **Language-specific images:** Use subdirectories like `help/images/fr/`
- **Don'ts:** No uncompressed screenshots, no BMP/TIFF, don't keep both original and optimized versions

## Automatic optimization (GitHub Action)

A GitHub Action (`.github/workflows/optimize-images.yml`) also runs on push for PNG/JPG files in `help/images/`. It renames images for SEO (prefixes with page slug, kebab-case), converts to WebP, updates `.mdx` references, and commits changes. The local script is for manual/preview use.

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

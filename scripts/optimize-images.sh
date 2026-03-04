#!/bin/bash
#
# Optimize all PNG/JPG images in help/images/:
#   - Convert to WebP at quality 80
#   - Rename for SEO (prefix with page slug from referencing .mdx)
#   - Update .mdx references automatically
#   - Remove originals
#
# Usage: bash scripts/optimize-images.sh
#
# Requires: cwebp (brew install webp)
#

QUALITY=80
IMAGES_DIR="help/images"

# Check if cwebp is available
if ! command -v cwebp &>/dev/null; then
  echo "❌ cwebp not found. Install it with: brew install webp"
  exit 1
fi

# Convert a string to clean kebab-case
to_kebab() {
  echo "$1" \
    | sed 's/\.[^.]*$//' \
    | tr '[:upper:]' '[:lower:]' \
    | sed 's/[^a-z0-9]/-/g' \
    | sed 's/--*/-/g' \
    | sed 's/^-//' \
    | sed 's/-$//'
}

# Find all PNG and JPG files in help/images/ (including subdirectories)
IMAGES=$(find "$IMAGES_DIR" -type f \( -iname '*.png' -o -iname '*.jpg' -o -iname '*.jpeg' \) 2>/dev/null)

if [ -z "$IMAGES" ]; then
  echo "✅ No PNG/JPG images found in $IMAGES_DIR — nothing to optimize."
  exit 0
fi

COUNT=0
TOTAL_SAVED=0

echo "🖼  Optimizing images to WebP..."
echo ""

while IFS= read -r img; do
  [ -f "$img" ] || continue

  img_dir=$(dirname "$img")
  img_basename=$(basename "$img")
  old_ref="/images/${img#help/images/}"

  # Clean the original filename to kebab-case
  clean_name=$(to_kebab "$img_basename")

  # Find the .mdx file that references this image
  page_slug=""
  mdx_match=$(grep -rl "$old_ref" help/ --include='*.mdx' 2>/dev/null | head -1)

  if [ -n "$mdx_match" ]; then
    page_slug=$(basename "$mdx_match" .mdx)
  fi

  # Build the new filename
  if [ -n "$page_slug" ]; then
    if echo "$clean_name" | grep -q "^${page_slug}"; then
      new_name="${clean_name}.webp"
    else
      new_name="${page_slug}-${clean_name}.webp"
    fi
  else
    new_name="${clean_name}.webp"
  fi

  webp_path="${img_dir}/${new_name}"

  # Convert to WebP
  if cwebp -q "$QUALITY" "$img" -o "$webp_path" -quiet; then
    orig_size=$(wc -c < "$img" | tr -d ' ')
    webp_size=$(wc -c < "$webp_path" | tr -d ' ')
    savings=$(( (orig_size - webp_size) * 100 / orig_size ))
    saved_bytes=$(( orig_size - webp_size ))
    TOTAL_SAVED=$(( TOTAL_SAVED + saved_bytes ))
    COUNT=$(( COUNT + 1 ))

    echo "   ✅ $(basename "$img") → ${new_name} (${savings}% smaller)"

    # Build the new reference path
    new_ref="/images/${webp_path#help/images/}"

    # Update all .mdx files that reference the old image
    mdx_files=$(grep -rl "$old_ref" help/ --include='*.mdx' 2>/dev/null)
    if [ -n "$mdx_files" ]; then
      for mdx in $mdx_files; do
        sed -i '' "s|${old_ref}|${new_ref}|g" "$mdx"
        echo "   📝 Updated reference in $(basename "$mdx")"
      done
    fi

    # Remove the original
    rm "$img"
  else
    echo "   ❌ Failed to convert $(basename "$img")"
  fi
done <<< "$IMAGES"

echo ""
if [ "$COUNT" -gt 0 ]; then
  TOTAL_SAVED_KB=$(( TOTAL_SAVED / 1024 ))
  echo "🎉 Done! Converted ${COUNT} image(s), saved ${TOTAL_SAVED_KB} KB total."
  echo ""
  echo "💡 Run 'git add help/' to stage all changes."
else
  echo "✅ No images needed conversion."
fi

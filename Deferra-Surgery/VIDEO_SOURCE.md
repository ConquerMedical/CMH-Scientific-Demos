# Deferra moving operative-field asset

The page prefers `field.mp4` in this directory. If that file is absent or fails, the page cycles public research clips from Zenodo record 21709853.

For a locally cleared source clip, create `field.mp4` with:

```bash
ffmpeg -ss 00:04:22 -i input.mp4 -t 30 \
  -vf "scale=1280:-2,fps=30" \
  -c:v libx264 -crf 26 -preset slow \
  -pix_fmt yuv420p -an -movflags +faststart \
  field.mp4
```

This strips audio and produces a web-ready H.264 asset. The canvas overlay is separate from the video: no arrows, labels, boxes or HUD need to be baked into the footage.

# Deferra operative video — deployment source

The deployed page requires a local file named `field.mp4` in this directory.

The v2.8 installer creates that file from a source video supplied at deployment time. It accepts the downloaded Wikimedia Commons OGV, MP4, MOV, WebM, or another ffmpeg-readable source.

Recommended source:

- Boer J, Boerma D, de Vries Reilingh TS. *A gallbladder torsion presenting as acute cholecystitis in an elderly woman: A case report* (2011).
- Wikimedia Commons media file: `A-gallbladder-torsion-presenting-as-acute-cholecystitis-in-an-elderly-woman-A-case-report-1752-1947-5-588-S1.ogv`
- License: CC BY 2.0.
- Source/license page: https://commons.wikimedia.org/wiki/File:A-gallbladder-torsion-presenting-as-acute-cholecystitis-in-an-elderly-woman-A-case-report-1752-1947-5-588-S1.ogv

The installer takes seconds 8 through 38, removes audio, scales to 640 pixels wide at 24 fps, encodes H.264/yuv420p, and sets `+faststart` for web playback.

The surgical footage is only the moving background field. Deferra overlays are page-rendered and scripted against playback time; they are not anatomical identification or validated tracking.

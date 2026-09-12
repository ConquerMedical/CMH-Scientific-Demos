# CMH Scientific interactive demonstrations v2.8

Interactive scientific demonstrations for CMH Scientific, pairing each instrument with the empirical or validated basis used to interpret it.

## v2.8 deployment notes

- Deferra-Surgery requires a locally hosted `field.mp4` generated at deployment time from a cleared source video supplied to the installer with `--video PATH`.
- The recommended source is the CC BY 2.0 laparoscopic cholecystectomy clip identified in `Deferra-Surgery/VIDEO_SOURCE.md`.
- The installer cuts seconds 8–38, removes audio, compresses to H.264/yuv420p at 640 px wide and 24 fps, and verifies the output before committing.
- OptiCeil mobile order is figure first, controls second, readout third.
- ABP includes responsive volumetric interaction and support-constrained inverse optimization.
- NPIS exposes its metric battery with spelled-out names and live interpretations.
- CTF exposes claim-level counterfactual testing and clarified score labels.
- All demos retain downloadable state-specific reports.

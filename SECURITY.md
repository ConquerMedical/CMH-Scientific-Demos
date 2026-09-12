# Security

This repository contains public demonstration software only. It must not contain production credentials, API keys, protected engine source, private datasets, patient-level data, or unrestricted production endpoints.

## Public-site network boundary

Public demo pages are intentionally configured with a browser Content Security Policy that disables browser network connections (`connect-src 'none'`). Public demonstrations therefore cannot call CMH production APIs from page JavaScript.

## Reporting

Please report suspected credential exposure, protected-code exposure, or security issues privately to admin@conquermedical.health. Do not place sensitive details in a public GitHub issue.

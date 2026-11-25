# Branding

This fork of [Koito](https://github.com/gabehf/koito) can be built under your own name and icons. Everything is set at build time with Docker build args. A build with none of them set looks exactly like upstream Koito.

| Build arg | What it does | Default |
| --- | --- | --- |
| `SITE_TITLE` | Name in browser tabs ("Artist - *title*"), the home-screen app name (web manifest and iOS), the footer and Settings › About. When it isn't "Koito", the footer and About box credit Koito: "*title* · a fork of Koito *version*". | `Koito` |
| `SOURCE_URL` | Where "View the source on GitHub" and the sidebar ⓘ point. | `https://github.com/gabehf/koito` |
| `BRANDING` | A folder name under `branding/`. Its `public/` files replace Koito's icons. | none: Koito's icons |
| `KOITO_VERSION` | Version shown in the footer and About box. Use something like `v0.3.2-yourname.1`; the update check compares against the base version (0.3.2). | `package.json` version |

## A branding folder

```
branding/<name>/
  logo.svg        tab icon, any shape (source)
  app-icon.svg    home-screen icon: opaque background, logo with padding (source, optional)
  public/         copied over client/public/ at build time
    favicon.svg  favicon.ico  favicon-96x96.png
    apple-touch-icon.png  web-app-manifest-192x192.png  web-app-manifest-512x512.png
    record.svg        optional: the spinning record on /now (default: client/public/record.svg)
    site.webmanifest  optional: your own manifest (its name is still set from SITE_TITLE)
```

Only `public/` is used by the build; the SVG sources are there so the icons can be re-rendered. To render `public/` from `logo.svg` and `app-icon.svg`:

```bash
docker run --rm -v "$PWD/branding":/branding -w /tmp node:24 \
  sh -c 'npm i -s sharp@0.34.4 && cp /branding/render.mjs . && node render.mjs /branding/<name>'
```

`branding/spin/` is the branding for [spin](https://spin.logicshop.press), the site this fork was made for. Use it as an example.

## Building

```bash
docker build \
  --build-arg SITE_TITLE=yourname \
  --build-arg SOURCE_URL=https://github.com/you/your-fork \
  --build-arg BRANDING=yourname \
  --build-arg KOITO_VERSION=v0.3.2-yourname.1 \
  -t yourname-koito:0.3.2-yourname.1 .
```

Or in Docker Compose:

```yaml
services:
  koito:
    image: yourname-koito:0.3.2-yourname.1
    build:
      context: ../koito-spin
      args:
        SITE_TITLE: yourname
        SOURCE_URL: https://github.com/you/your-fork
        BRANDING: yourname
        KOITO_VERSION: v0.3.2-yourname.1
```

Browsers cache icons for a long time (Koito serves them as immutable for a year), so after changing them, hard-refresh and, behind a CDN, purge its cache.

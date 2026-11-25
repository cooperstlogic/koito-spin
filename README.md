> [!NOTE]
> **This is a fork of [Koito](https://github.com/gabehf/koito)**, maintained for [spin](https://spin.logicshop.press), a self-hosted listening history site. The original README follows below the line.

# koito-spin

## Why fork

Koito is a very good scrobbler and listening-stats site, but upstream has been quiet: no commits since 2026-07-23, and pull requests waiting without review. spin needed a few changes Koito doesn't support: its own name and icons, a home page that keeps now playing current, and a full-screen now playing page. Working around those from outside (rewriting Koito's pages through a proxy) would have kept getting more complicated, so this fork makes the changes in the code instead.

## What's different from Koito v0.3.2

- **Rebrandable at build time.** `SITE_TITLE`, `SOURCE_URL` and `BRANDING` build args set the name in titles and the web app manifest, the footer and About credit ("*name* · a fork of Koito"), the source links, and the icons. With none set, the build is plain Koito, byte for byte. See [`branding/README.md`](branding/README.md).
- **Now playing stays current.** The home page polls now playing every 15 s and recent listens every 30 s (paused while the tab is hidden), instead of only on page load.
- **`/now` page.** A full-screen now playing view for a phone or a spare screen: cover art with a record that spins while something plays, "last played" when idle, and a screen wake lock. It's linked from the sidebar and from the now playing row.
- **Smaller fixes.** The update check compares against the base version, so a fork build like `v0.3.2-spin.3` isn't flagged as older than upstream's `v0.3.2`; sidebar labels no longer wrap.
- **spin's branding** lives in [`branding/spin/`](branding/spin/) and is only used when built with `BRANDING=spin`.

**What hasn't changed:** the database schema, the API, importing, relaying and configuration. Data from this fork works with upstream Koito v0.3.2 and the other way round, so you can switch in either direction.

## What's changing

- **Staying close to upstream.** `main` tracks upstream Koito; this fork's work is on `spin`, the default branch. If upstream becomes active again, its changes get merged in.
- **Offering changes upstream.** The changes are small, separate commits so the generic ones (the title setting, polling, the update check) can be offered back to Koito.
- **Dependency updates.** The dependencies inherited from v0.3.2 have known vulnerabilities; updating them is next.
- **No database changes.** That rule keeps the fork interchangeable with upstream.

## Using it

There's no published image; build your own:

```bash
git clone https://github.com/cooperstlogic/koito-spin && cd koito-spin
docker build --build-arg SITE_TITLE=yourname --build-arg BRANDING=yourname -t koito-yourname .
```

Run it exactly like Koito (same environment variables, port and data directory); see the original instructions below and [koito.io](https://koito.io). Branding is documented in [`branding/README.md`](branding/README.md). Leave out the build args for plain Koito with this fork's features.

Issues with this fork's changes belong here; anything else about Koito belongs [upstream](https://github.com/gabehf/koito/issues). Koito is by [Gabe Farrell](https://github.com/gabehf) under the [MIT license](LICENSE); this fork keeps that license.

---

<div align="center">
  
![Koito logo](https://github.com/user-attachments/assets/bd69a050-b40f-4da7-8ff1-4607554bfd6d)

_Koito (小糸) is a Japanese surname. It is also homophonous with the words 恋と (koi to), meaning "and/with love"._

</div>

<div align="center">
  
  [![Ko-Fi](https://img.shields.io/badge/Ko--fi-F16061?style=for-the-badge&logo=ko-fi&logoColor=white)](https://ko-fi.com/gabehf)
  
</div>

Koito is a modern, themeable ListenBrainz-compatible scrobbler for self-hosters who want control over their data and insights into their listening habits.
It supports relaying to other compatible scrobblers, so you can try it safely without replacing your current setup.

> This project is under active development and still considered "unstable", which means the main branch can be unusable at times, and some breaking changes may occur. If you don't want to replace your current scrobbler
> with Koito quite yet, you can [set up a relay](https://koito.io/guides/scrobbler/#set-up-a-relay) from Koito to another ListenBrainz-compatible
> scrobbler. This is what I've been doing for the entire development of this app and it hasn't failed me once. Or, you can always use something
> like [multi-scrobbler](https://github.com/FoxxMD/multi-scrobbler).

## Features

- ⚡ More performant than similar software
- 🖌️ Sleek UI
- 🔁 Compatible with anything that scrobbles to ListenBrainz
- 🔌 Easy relay to your existing setup
- 📂 Import support for Maloja, ListenBrainz, LastFM, and Spotify

## Demo

You can view my public instance with my listening data at https://koito.mnrva.dev

## Screenshots

![screenshot one](assets/screenshot1_2.png)
![screenshot two](assets/screenshot2.png)
![screenshot three](assets/screenshot3.png)

## Installation

See the [installation guide](https://koito.io/guides/installation/), or, if you just want to cut to the chase, use this docker compose file with a minimal configuration:

```yaml
services:
  koito:
    image: gabehf/koito:latest
    container_name: koito
    ports:
      - "4110:4110"
    volumes:
      - ./koito:/etc/koito
    restart: unless-stopped
```

## Importing Data

See the [data importing guide](https://koito.io/guides/importing/) in the docs.

Before importing, it is recommended you set up any image sources you want to have enabled. You can view the configuration options for image sources in the full list of configuration options.

## Full list of configuration options

See the [configuration reference](https://koito.io/reference/configuration/) in the docs.

## Contributing

There are currently some known issues that I am actively working on, in addition to adding new features. If you want to contribute (especially more and more robust testing) feel free to fork the repository and make a pull request with your changes.

If you have any feature ideas, open a GitHub issue to let me know. I'm sorting through ideas to decide which data visualizations and customization options to add next.

You can also donate money to me, @gabehf, the primary developer, via the "sponsor" or "ko-fi" buttons, and I will spend that money on luxurious trips and fine cuisine in foreign countries, or rent.

## Albums that fueled development + notes

More relevant here than any of my other projects...

Not just during development, you can see my complete listening data on my [live demo instance](https://koito.mnrva.dev).

#### Random notes

- I find it a little annoying when READMEs use emoji but everyone else is doing it so I felt like I had to...
- About 50% of the reason I built this was minor/not-so-minor greivances with Maloja. Could I have just contributed to Maloja? Maybe, but I like building stuff and I like Koito's UI a lot more anyways.

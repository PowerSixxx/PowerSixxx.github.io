# Baowen Liu — Personal Website

Personal portfolio built with plain HTML, CSS and JavaScript. No framework, no build step. Hosted on GitHub Pages.

- Live: https://www.baowenliu.com/ (mirror: https://powersixxx.github.io/)

## Features

**Content**
- Home: hero, "Now" status block, education, work-experience timeline, LeetCode & study notes, projects, skills, guestbook, contact
- About page: hobbies (games, music player) and a photography gallery
- Resume page: web version of the PDF in English and Chinese, print-optimised (Ctrl/Cmd+P gives a one-page PDF)
- Study notes and projects tables on separate pages

**Site-wide**
- Light / dark theme; first visit follows the OS setting, then the toggle is remembered
- English / Chinese toggle, remembered across pages (`data-en` / `data-zh` on every text node)
- Responsive layout with a capsule nav on desktop and a compact bar on mobile
- Page transitions via the cross-document View Transitions API (older browsers simply navigate)
- Command palette: press Cmd+K / Ctrl+K to jump to any section, switch theme or language, open the resume, copy contact info
- Terminal easter egg: click the `>_` button or press the backtick key, then type `help`
- Guestbook powered by giscus (comments and reactions stored in the repo's GitHub Discussions)
- Footer status card: days online plus today's / total visitors from GoatCounter (privacy-friendly, no cookies)
- SEO: meta descriptions, Open Graph tags, canonical URLs, `robots.txt`, `sitemap.xml`, custom 404 page
- Honours the OS "reduce motion" setting

## Project structure

```
index.html            Home page
about.html            About page
resume.html           Web resume (EN / 中文)
study.html            Study notes
projects.html         Projects table
404.html              Custom not-found page
assets/
  glass-theme.css     Shared theme (palette, nav, cards, timeline, transitions)
  terminal.js         Terminal easter egg
  palette.js          Cmd+K command palette
  site-stats.js       Footer status card (uptime + GoatCounter counts)
  *.png               Logos (light and dark-mode variants)
  *.webp, *.mp3       Photos, game cards, music covers and tracks
photo1.jpg            Profile photo (also the Open Graph preview)
Baowen_Resume.pdf     English resume
Baowen_Resume_CN.pdf  Chinese resume
CNAME                 Custom domain
robots.txt, sitemap.xml
```

## Where to edit things

| What | Where |
|---|---|
| Fun facts under the hero | `FACTS` array near the bottom of `index.html` |
| "Now" block text and its "Updated" date | `<section id="now">` in `index.html` |
| Guestbook (giscus) settings | `GISCUS` object near the bottom of `index.html` |
| Visitor counter | `GOATCOUNTER` and `LAUNCHED` in `assets/site-stats.js` |
| Command palette entries | `COMMANDS` array in `assets/palette.js` |
| Terminal commands and data | `DATA` and `commands` in `assets/terminal.js` |
| Resume content | `resume.html` (keep in sync with the PDFs) |
| Theme colours | `:root` / `[data-theme="dark"]` in `index.html` and `assets/glass-theme.css` |

## Run locally

```bash
git clone https://github.com/PowerSixxx/PowerSixxx.github.io
cd PowerSixxx.github.io
python3 -m http.server 8000   # open http://localhost:8000
```

Use a local server rather than opening the files directly: the guestbook and the pixel-art avatar need an http(s) origin.

## Deployment

Push to `main`. GitHub Pages serves the repository root; `CNAME` points it at the custom domain.

## License

MIT License, Baowen Liu

# Baowen Liu

**Building useful things. Seeing more.**

My personal website — a place for my projects, study notes, photography, and the things I learn along the way. I'm a Computer Science and Engineering student with a Mathematics minor at The Ohio State University, and the creator of [Canvas+](https://getcanvasplus.com/).

[Visit the website](https://www.baowenliu.com/) · [LeetCode Notes](https://powersixxx.github.io/leetcode-blog/) · [LinkedIn](https://www.linkedin.com/in/baowen-liu-959104340/)

个人网站：记录我的项目、学习笔记与摄影作品，支持中英文切换。

## Explore

- **Home** — an interactive photo orbit, education, experience, selected projects, and guestbook.
- **About** — interests, music, and a photography gallery.
- **Projects** — the things I've built, including Canvas+.
- **Notes** — LeetCode and university course notes.
- **Résumé** — English and Chinese résumés with PDF downloads.

## Experience

The site includes a bilingual name reveal, animated scroll ruler, light and dark themes, and a searchable command palette. Press **⌘ K / Ctrl K** to navigate, or discover the terminal with the backtick key.

Photos load near the viewport, transitioning from a small blurred preview to the full image without shifting the layout. The site adapts to mobile screens and respects the system's reduced motion preference.

## Run locally

Built with HTML, CSS, and vanilla JavaScript. No build step is required.

From the project folder, start a local server:

```bash
python3 -m http.server 8000 --bind 127.0.0.1
```

Open [localhost:8000](http://127.0.0.1:8000/). Use a local server rather than opening HTML files directly, so browser features and the guestbook can work normally.

## Customize

| Change | Location |
| --- | --- |
| Page content and translations | Root HTML files; `data-en` / `data-zh` |
| Shared styles and mobile layout | `assets/css/site.css` |
| Orbit photos and animation settings | `assets/js/orbit-config.js` |
| Name reveal timing | `assets/js/name-intro.js` |
| Photos, logos, and covers | `assets/images/` |
| Command palette entries | `assets/js/palette.js` |

After adding photos, regenerate their small previews with Python 3 and Pillow:

```bash
python3 scripts/generate-photo-previews.py
```

## Hosting

This repository hosts the static site through GitHub Pages. The custom domain is recorded in `CNAME`. Publish the site files, including assets and generated previews, together; no Python runtime is needed on the deployed site.

# Baowen Liu — 个人网站

纯 HTML、CSS、JavaScript 静态网站，无构建步骤。GitHub Pages 从仓库根目录提供页面，域名配置保留在 `CNAME`。

## 目录

```text
index.html                 首页、环绕动画、经历、项目和留言板
about.html                 个人介绍、兴趣、音乐和摄影
projects.html              项目目录
study.html                 Notes（LeetCode 和课程笔记）
resume.html                中英文简历、打印版
404.html                   未找到页面
assets/
  images/                  所有照片、封面、logo 和宣传图片
  audio/                   音乐文件
  css/
    site.css               全站外观、对齐、响应式规则
    photo-wall.css         固定照片框、模糊与缩放过渡
    index.css / about.css  各页的基础布局和组件
    projects.css / study.css / resume.css / 404.css
  js/
    site.js                公共导航、语言适配、照片查看和章节索引
    progressive-photos.js  300px 预加载与解码后的渐进显示
    photo-previews.js      自动生成的小图、主色和尺寸清单
    scroll-instrument.js   右侧滚动刻度与标题动画
    orbit-config.js        首页环绕参数和图片清单
    orbit-engine.js        环绕渲染与鼠标交互
    index-page.js          首页像素头像、详情展开、趣味文字和 giscus
    about-page.js          兴趣切换、图片加载、联系方式
    resume-page.js         简历语言、PDF 链接和主题
    palette.js             Cmd+K / Ctrl+K 命令面板
    terminal.js            终端彩蛋
    site-stats.js          页脚上线天数和访客统计
scripts/
  generate-photo-previews.py  生成占位小图与主色
canvas-plus/
  index.html               跳转到 getcanvasplus.com，保留原入口
  demo.html / site.js      首页嵌入的交互演示
  privacy*.html            保留公开隐私政策地址
Baowen_Resume*.pdf          保留公开下载地址
CNAME / robots.txt / sitemap.xml
baidu_verify_*.html         保留站点验证文件
docs/
  artcraft-reference.md    原站 REA 分析记录
  cleanup.md               本次整理范围及验证结果
```

## 本地预览

```bash
python3 -m http.server 8000
```

打开 http://127.0.0.1:8000/ 。使用 HTTP 预览以支持留言板和像素头像，不要直接双击 HTML。

## 常用修改位置

| 内容 | 文件 |
| --- | --- |
| 页面文字和中英翻译 | 对应 HTML 的 `data-en` / `data-zh` |
| 配色、页面边距、按钮尺寸、手机适配 | `assets/css/site.css` |
| 环绕图片、数量、半径、速度 | `assets/js/orbit-config.js` |
| 趣味文字、留言板设置 | `assets/js/index-page.js` 的 `FACTS` / `GISCUS` |
| 命令面板菜单 | `assets/js/palette.js` 的 `COMMANDS` |
| 终端命令 | `assets/js/terminal.js` |
| 简历内容 | `resume.html`，同时更新两个 PDF |

环绕照片密度由 `cardRadiusFraction`（活动范围）、`evenPhases`（均匀分布）和 `look.density`（图片尺寸）调整。当前环绕图片不重复，桌面 16 张、手机 14 张；支持浅色/深色、中英文和减少动态效果。

## 发布

将整理后的全部文件一起提交、推送至 GitHub Pages 所用分支。页面入口、简历 PDF、Canvas+ 跳转与隐私政策地址保持原路径；所有图片引用已经改到 `assets/images/`。不需要上传旧调试截图或本机备份。

## License

MIT License, Baowen Liu

## 照片预览与加载

照片墙、首页横幅和环绕图片使用 `assets/js/progressive-photos.js`。主色与预览清单位于 `photo-previews.js`，小图位于 `assets/images/previews/`。距离视口约 300px 才请求原图，解码后用 500ms 清晰与缩放过渡；减少动态效果时直接显示。

新增照片后，可用 Python 3 + Pillow 运行 `python3 scripts/generate-photo-previews.py` 重新生成预览。生成文件直接随网站部署，线上不需要 Python。

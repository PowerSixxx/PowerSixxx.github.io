# 照片墙渐进加载

- 相册、首页横幅、首页 Orbit 共用 `assets/js/progressive-photos.js`。
- 预览是保留原图色调的 40px JPEG，由 `scripts/generate-photo-previews.py` 生成。主色、原始尺寸和预览路径记录在 `assets/js/photo-previews.js`。原图文件不改动。
- 固定框使用主色底和预览图，CSS 高斯模糊 20px。原图初始无 `src`，到视口附近 300px 时由 IntersectionObserver 设置。
- 原图加载并解码后，模糊 20px → 0、缩放 1.04 → 1、透明度 0 → 1，在 500ms 内完成。减少动态效果设置下直接显示。
- 相册框：桌面 320px、最后一张独占一行时 420px，手机 260px；横幅沿用原固定高度；Orbit 框由原渲染器提前计算大小。原图绝对定位，不改变框尺寸。
- 加载失败保留主色和模糊小图，显示提示；相册点击查看使用完整原图。
- `sea_boston.jpg` 已替换首页摄影横幅，并加入 Orbit 和相册。相册现为 11 张，Orbit 桌面 16 张、手机 14 张，不重复。

验证使用独立 Chrome：延迟原图响应时，距视口 350px 未请求，290px 时开始请求；加载前后框的位置、宽高一致。过渡中实测 blur(15.58px)、scale(1.031)，完成后 blur(0px)、scale(1)。所有 11 张相册图片和 16 张桌面 Orbit 图片加载成功，无本地资源 404 或 JavaScript 异常。手机、原图查看、减少动态效果和故障占位均已检查。

生成文件可直接放到 GitHub Pages，不需要线上构建。新增图片后使用安装了 Pillow 的 Python 3 重新运行生成脚本。

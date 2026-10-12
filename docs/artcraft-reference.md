> 历史分析记录：当前运行代码位于 `assets/js/` 和 `assets/css/`。旧演示、原始截图及分析附件已从发布目录移除，保留在整理前完整备份中，详见 `cleanup.md`。

# ArtCraft 首屏取证与独立复刻

> 阶段说明：此报告记录 2026-10-10 的首屏取证和独立演示。2026-10-12 已继续完成个人站首页及所有独立页面的统一改版，见 `../site-redesign/REPORT.md`；预览正式站请打开 `http://127.0.0.1:8000/`。

检查日期：2026-10-10。原站：https://getartcraft.com/ 。演示：http://127.0.0.1:8000/orbit-demo/ 。

## 方法与证据边界

独立 Google Chrome 154 调试实例，临时用户目录 `/private/tmp/artcraft-rea-chrome`，CDP `http://127.0.0.1:9333`。Playwright 浏览器工具负责导航、视口、真实指针/滚轮输入、截图及页面检查；REA `list_browser_targets` 和 `inspect_web_page` 只做被动取证，没有用 REA 执行页面操作。

REA 页面证据：`ev_be9b1f27c23b567a61c4afaab20dc1dd1f5770f98eff48d28ad16e681bda9df9`。完整结果保存在 [rea-inspection.json](rea-inspection.json)。检查窗口 2026-10-10 17:48:04–17:48:05 UTC；捕获 DOM、可访问性结构、43 条同源脚本记录及素材清单。该证据是外部运行时观察，不能据此声称脚本每个分支都执行过。

核心首屏 bundle：`https://getartcraft.com/_next/static/chunks/223tafwc4nxdm.js`，源文本 SHA-256 见完整 REA 证据。副本 [script-18.js](script-18.js)，仅加换行的阅读版本 [hero-readable.js](hero-readable.js)。模块 `17031` 包含 galaxyLayout/Mobile/Motion/Pointer/Look 配置、几何、逐帧运动和着色器；模块 `33209` 包含 wordmark 与 scrim。相关素材/wordmark 常量在 [script-3.js](script-3.js)。

覆盖限制：REA 默认同源过滤，1 条异源脚本、8 条无可归属来源脚本及目标外 worker 不在结果中；网络只覆盖挂接后的短窗口。未取得原始 TypeScript/React 工程或 source map。没有读取 cookies、认证数据或存储值。以下数字是已捕获的**发布脚本默认配置**与可见代码公式，未直接读取 GPU uniforms；tuner 代码支持 localStorage 覆盖，所以不能把这些数字冒充所有访客的实时状态。

## 已查到的实现

| 项目 | 发布代码事实 | 演示实现 |
|---|---|---|
| 技术 | Next.js / React；three.js r184 / React Three Fiber；GSAP intro clock | 原生 HTML/CSS/JavaScript，Canvas 2D 轨道与 DOM 图片 |
| 素材 | 35 个 `/cdn-media/videos/001.mp4`…`035.mp4`，VideoTexture；附近最多 8 个活跃解码器，内部卡片用冻结帧 | 9 张本地现有素材；摄影、游戏图、个人照片；无远端素材依赖 |
| 位置 | 6 条阿基米德螺旋，1.05 圈；`r=bθ`，`θ=θBirth+p(θExit−θBirth)`；每臂角偏移 `2π arm/arms` | 同一几何和分臂方式 |
| 半径 | 绘制半径为视口半对角线的 .70；出生位置为 θMax 的 .08；退出半径超过半对角线加 1.5 倍卡片高度上限 | 同公式，卡片完全出屏后回到中心 |
| 数量 | 桌面最多 64，按实际画布 CSS 面积 / 1.65Mpx 缩减；每臂错位 .76 个间隙 | 相同；1440×952 画布约 53 张，配置的 64 是上限 |
| 空闲速度 | .57 次出生到退出完整行程/分钟；轨道整体 −50°/分钟；卡片本体抵消轨道旋转以保持正立 | 同速度和旋转方向 |
| 滚动 | `idleProgress + scrollY×.2/1000`，是绝对滚动位置耦合，可逆；悬停减速通过逐卡偏移抵消行程增量 | 同绝对位置耦合与偏移抵消 |
| 漂浮 | 6px、.25Hz 的正弦漂浮，每卡片不同相位，切向/径向组合；悬停时目标漂浮衰减 | 同组合；整体旋转后测量邻居间距是轻微简化 |
| 大小 | 高度上限 `min(340,max(70,画布高度×.25))`；出生高度 cap×.45，再逐步增长；邻居距离决定实际大小，density .82；变小时立即响应、变大渐近 | 同上限/增长/邻居规则，使用屏幕坐标计算间距；不是简单 scale 正弦 |
| 宽高比 | 前 .30 行程由正方形平滑变成 16:9 | 同阶段变化 |
| 透明度 | 前 .15 行程线性渐显；没有退出淡出；入场波再乘一次透明度 | 同出生渐显/出屏回收 |
| 模糊 | blurMax .12 UV 单位，前 .18 行程平滑归零；目标另有 .12s 光学清晰响应 | 用 CSS 像素 blur 近似，不宣称 UV→像素等价 |
| 倾斜 | pointer tiltDeg 默认 **0°**；曲面 curvePx 32、局部鼠标 warp 200px，在 vertex shader 中改变曲面 z，30° FOV 相机投影 | 默认也正立；可配置 CSS 倾斜，未复刻真实网格曲面 |
| 鼠标牵引 | 高斯影响半径 320px，最多 8px 牵引 | 同高斯范围与牵引 |
| 悬停 | 命中卡片后目标 hold τ=.15s，其余 rest τ=1s，旋转乘 `1−rest`；离开缓慢恢复；目标焦点 τ=.25s | 同两段减速/恢复 |
| 点击 | 目标最大 3×，τ=.18s；波纹速度 900px/s、宽140px、生命周期1.8s；表面 punch/色散 | 同目标放大；普通 Canvas 圆环近似波纹，未复刻 UV punch |
| 轨道线 | line alpha .15、ticks .30、每臂16个刻度、虚构建圆 .56×半径 | 同几何/透明度配置 |
| 脉冲 | shader 相位 `fract(aT×count−time×speed+arm×.618)`；speed .19、count 3；不对称高斯头尾 .55/1.7；宽度 .05、附加厚度3.5px、峰值 alpha .72 | 相同相位/高斯/粗细，Canvas 分段描绘；光学混色近似 |
| 首次入场 | cardsAt 1s，4s 从中心扫到外缘；rollChunk .12；初始速度3×，2.5s ease-out-cubic 恢复；轨道与文字有单独节拍 | 卡片波/外移/速度 burst；没有原站 A 标志展开成 ARTCRAFT 的逐字 intro |
| 手机 | 小于 .6Mpx 使用3臂、.7圈、14张、半径.8、cap高度.3、density×1.15 | 相同小屏配置；媒体查询另控制版式 |
| 减少动态效果 | `prefers-reduced-motion: reduce` 阻止 WebGL 场初始化，仍有正文 | 演示改为静态卡片与轨道；不自动播放，不响应指针/滚动改变卡片，运行时设置变更立即生效 |
| 后台 | IntersectionObserver 和 visibilitychange 暂停帧循环/解码器 | 暂停 RAF，重新进入不追赶后台累计时间 |

## 实际观察、推断与未知

**实际观察**：首屏是一个 canvas 覆盖的场，图片不在 DOM 中逐张定位；视频资源确实加载。前景文字、按钮、轨道构建线与图卡的连续外移/系统旋转在桌面截图中可见。滚动会推进场，首屏随正常文档流上移；原站另有 wordmark 向右侧标尺飞入的 choreographer。390×844 下原站与演示都切换为稀疏场。截图名称 `initial / settled / continuous / pointer / scroll / scroll-back / mobile / reduced` 对应浏览器实测阶段。

**由代码推导**：未悬停时稳态完整行程约 105.26 秒；系统完整旋转约 432 秒；轨道脉冲相位每秒 .19，除以3个带得到归一化轨道位置速度约 .0633/s。角度与半径同时变化，所以屏幕像素速度随离中心距离改变，不能写成一个固定 px/s。

**未确认**：没有抓取原站 WebGL 每帧 mesh 状态、运行时 tuner 值或真实视频解码性能分布；不能逐卡证明实时位置/速度/纹理对应哪一个视频帧。原站 intro 可被输入加速，截图的挂接时间也不是浏览器首次 paint 的精确时间。原站变体、缓存或以后版本可能不同。本次没有验证所有不同尺寸与 Safari/Firefox 实机。

## 对比后修改与仍未对齐

1. 对比发现卡片可能盖住姓名，修复 field stacking context，文字始终位于全部卡片之上；姓名背后添加局部 backdrop blur；手机的中心衬底进一步加宽，避免照片影响正文对比度。
2. 从近似 comet 线段改为发布 shader 同样的相位、不对称高斯与 .618 臂错位，让轨道脉冲的节奏更接近原站。
3. 比较时必须让被测页在前台，否则两边的后台暂停逻辑会影响运动判断；滚动复位使用浏览器工具的即时滚动，排除 smooth scroll 和页面恢复的影响。
4. 仍未对齐：视频内容内部运动、真实曲面/色散/点击纹理变形、原站卡片去重/decoder/FPS governor、完整 wordmark/标尺滚动编排。演示图片来源较少，因此重复感更明显。中心文案字体、内容和长度已按个人网站设计，不是原站品牌复制。
5. 可见独立 Chrome 已实际打开原站和演示；最终数值验证另外使用隔离的无头 Chrome（CDP 9334）排除桌面原生指针事件干扰。实际验证结果见 [validation.json](validation.json)，桌面/手机截图保存于本目录。最终记录：零页面/资源错误；连续运动生效；悬停目标编号3，系统制动系数约.814；点击宽度由165.1px增至496.8px，约3倍；滚动300px；手机390px无横向溢出、14张图片且零坏图；减少动态效果和暂停的卡片DOM保持不变。滑杆在上一轮浏览器检查中确认写入数量80、半径.9和速度.4。

不是像素一致或逐帧同步保证；两边时间相位不同，截图只用于布局和运动结构对比。

## 运行与调整

在项目根目录执行 `python3 -m http.server 8000 --bind 127.0.0.1`，打开 `http://127.0.0.1:8000/orbit-demo/`。无安装、无构建。个人站原主页未替换。

主要配置在 `orbit-demo/config.js`：`layout.cardCount`（桌面上限）、`layout.radiusFraction`（半对角线比例）、`motion.journeysPerMinute`（完整行程/分钟）、`motion.spinDegreesPerMinute`（轨道旋转）、`mobile`（小屏单独参数）、`images`（可增删路径）。可在演示第二屏展开 Orbit controls 临时调整。调整滑杆不写浏览器存储，刷新恢复配置文件。暂停按钮可停止动画；系统减少动态效果优先于播放按钮。按钮、正文和链接均可键盘操作。

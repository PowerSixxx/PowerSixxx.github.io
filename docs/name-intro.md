# 首页姓名打开动画

实现：`assets/js/name-intro.js`，样式：`assets/css/name-intro.css`。顶部 config 集中设置起始延迟、展开时间、首字渐显、交互加速和遮挡距离。

## 原站证据与适配

2026-10-12，使用独立 Chrome 的 CDP 9336，由 Playwright 打开 https://getartcraft.com/，REA 被动检查页面及已加载的脚本。证据：ev_02c93796974ae8dc65d45bb25d924f5a55ea34665f3540e29901e3e28dedf60f。

实际查到：223tafwc4nxdm.js 的 wordmark 首字从整词中心移动到自身槽位，后续字用 translate3d 横移并以首字右缘作为 clipPath 遮挡边；首字用 cubic-in-out、后续字 cubic-out。0bcsxmid94pmr.js 的默认 wordAt=.35s、wordDur=.85s，首字渐显 .3s，输入加速为4倍；减少动态效果会跳过入场。

这里使用相同形成逻辑，首字换成 B／刘，其余字符滑出。字体、字号和最终位置继续使用原页面样式。原站首字是品牌 SVG，本页是姓名文字，不复制品牌图形。REA 此次未记录每帧运行时 tuner 值，上述秒数是查到的源码默认值。

真实 h1 保持纯文本，临时的 aria-hidden 动画图层使用文字 Range 测得的位置，完成后移除，避免影响标尺的逐字测量和无障碍标题。语言切换重播；滚动离开首屏、窗口改变或减少动态设置开启时清理图层；没有 JavaScript 时仍正常显示标题。

验证：Chrome 桌面1440px中英文、手机390px、深色模式、语言切换、滚动中断和减少动态设置。动画结束后图层移除、标题可见，未产生页面脚本异常或横向溢出。未做 Safari/Firefox 实机验证。

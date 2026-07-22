# Design system

## Visual language

深墨蓝背景与薰衣草紫构成夜间信号场，荧光绿只承担萤火微光、重点与交互反馈。首屏信号盘和带轻微延迟的鼠标圆点是唯一主要的炫技签名，其他版面不额外堆叠动效。

## Confirmed homepage copy

- 首屏：从现场出发，把想法做出来
- “我在意的事”：成片之外，还有下一步
- 精选项目：再次回到现场

## Color tokens

- `--ink`: `#11172d`
- `--ink-soft`: `#202944`
- `--lavender`: `#aaa2e8`
- `--lavender-light`: `#e5e1ff`
- `--acid`: `#ddff3f`
- `--ice`: `#eef1ff`
- `--paper`: `#f7f8fc`

## Typography

- Display: 得意黑 Smiley Sans Oblique，仅用于首屏、章节标题、项目路径标题和核心数字。
- Body: `PingFang SC`, `Microsoft YaHei`, `system-ui`, sans-serif，用于导航、按钮、正文、标签和中文界面文本。
- Instrument: `SFMono-Regular`, `SF Mono`, `Consolas`, monospace，仅用于信号盘刻度、年份、技术缩写和少量仪表数据。
- 全站通过根目录 `shared.css` 统一颜色 token、字体栈与导航基础字重；各页面专属 CSS 在其后加载，保留页面实现。
- 7 个页面都预加载同一份 Smiley Sans WOFF2（`as="font"`、`type="font/woff2"`、`crossorigin`），共享层使用 `font-display: swap`，降低首次加载时的字体替换延迟与跳变。
- 文本角色：caption 0.75rem，body 1rem，lead 1.125rem，subheading 1.5rem，section 使用有界 `clamp()`，hero 使用有界 `clamp()`。
- 大标题使用自然的微紧字距，中文不得沿用过紧的负字距；正文行长控制在 45 至 75ch。
- 长中文项目详情标题使用正文中文无衬线栈的粗体；得意黑只承担短标题、项目预告标题与核心数字。
- 大型中文展示标题省略句末标点并采用人工语义行；正文保留完整标点与自然断句。
- 得意黑采用官方 `atelier-anchor/smiley-sans` v2.0.1 WOFF2，自托管并使用 `font-display: swap`。许可证为 SIL OFL-1.1，来源和许可证随字体保留在 `assets/fonts/`。
- 顶栏层级由合法系统字体栈承担：主导航使用 16px / 600，品牌文字使用 14px / 600，简历入口使用 14px / 700；当前页只用 2px 荧光绿下划线提示，避免字号和装饰互相争抢。

## Brand mark

- `assets/signal-mark.svg` 是首屏信号盘的 32px 缩译：深墨蓝圆盘、三段不完整轨道与一枚偏心荧光信号点。导航只复用这一份资产，图形为装饰，品牌名称仍由 `ZHOU HAO` 表达。

## Interaction guardrails

- 桌面精细指针保留荧光鼠标跟随与首屏信号盘响应。
- 触屏使用环境脉冲作为替代。
- `prefers-reduced-motion: reduce` 时统一降级。
- 首页成果数字使用一次性、独立数字位纵向滚动；每一位至少经过一轮 0—9，初始已在视口时延迟启动。最终值保留在 HTML 中，减少动态效果时直接显示最终值。

## Layout guardrails

- 全屏背景与氛围图形可以铺满视口，核心阅读内容统一收进约 1500px 的居中走廊；超宽屏不把标题、信号盘、成果数字或主要模块拉到视野两端。

## Video strategy

- 首页不直接加载完整播放器；只使用封面图，或 6—12 秒、静音循环的轻量动态预览。点击后先进入项目详情页，不直接把访客带离网站。
- 项目详情页优先使用 15—45 秒的精选证据片段，由网站直接托管，展示“我具体做了什么”；片段需压缩并延迟加载。
- 已经在 B 站公开的完整作品，可在独立的“影像作品”页面嵌入播放器，同时保留“在 B 站打开”的备用入口。
- B 站播放器不在页面首次打开时立即加载，改为封面点击后加载，并使用 `https://player.bilibili.com/`、`loading="lazy"` 与全屏支持。
- 未发布的公司视频只有在确认可公开后才能使用；网站直接托管时优先放剪辑片段，不默认上传完整片源。
- 完整片源、精选剧照与短片段并非三选一：剧照承担快速浏览，短片段承担能力证明，完整作品承担深度观看。
- 详情页在素材未就绪前只标明“未来视频 / 动态预览区域”，不伪造视频或截图。

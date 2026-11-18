# ALA 墨西哥催收专题开发交付与验收

## 页面和西语核对

专题在 Demo 中通过 `/cobranza/` 直接访问。产品文档 v1.1 §3.9 要求正式站提供独立公开网址，首页和全局导航沿用现有入口。页面保留一个主标题、一个顺序阅读的正文区域、六条可见问答和官方联系方式。首屏、正文和页脚沿用导航的左右留白，正文外边线对齐导航 Logo 与最右控件。头图后使用与 Blog 相同的富文本容器与排版。三步说明用编号列表，FAQ 用问题小标题和段落，联系方式用可编辑的正文链接。目录复用 Blog 的标题提取逻辑，由当前正文小标题生成。桌面在正文左侧，窄屏可展开。选择条目定位到同页对应段落，并标记当前条目。

| 核对项 | 当前西语口径 | 官网依据 |
| --- | --- | --- |
| 官方联系方式 | 免费客服号码 **800 953 0794**、**800 288 3450**。人工服务 **De lunes a domingo, de 9:00 a 18:00.** 页脚邮箱为 **contacto-ala@alaprestamo.com**。核对页面未标注时区。 | [帮助中心](https://www.alaprestamo.com/channel/help-center) · [逾期说明](https://www.alaprestamo.com/article/que-pasa-si-tengo-un-atraso-en-mi-prestamo-ala) |
| 逾期、付款和协商 | 尽早联系客服。逾期可能按合同产生费用并影响信用记录。App 显示本笔贷款适用的付款方式。延期和协议需评估与审批。 | [逾期说明](https://www.alaprestamo.com/article/que-pasa-si-tengo-un-atraso-en-mi-prestamo-ala) · [官方付款方式](https://www.alaprestamo.com/article/cuales-son-los-metodos-oficiales-de-pago-para-mi-prestamo-ala) · [协商说明](https://www.alaprestamo.com/article/si-tengo-dificultades-para-pagar-puedo-llegar-a-un-acuerdo-con-ala) |
| 已付款仍收到通知 | 官网写明常见入账时间约两小时，可能更久，处理后发短信。超过 24 小时无确认或入账后仍接到通知，可带凭证请客服核查。核实期间避免重复付款。 | [入账说明](https://www.alaprestamo.com/article/estoy-al-corriente-por-que-recibo-mensajes-de-cobranza) · [逾期说明](https://www.alaprestamo.com/article/que-pasa-si-tengo-un-atraso-en-mi-prestamo-ala) |
| 可疑联系、投诉与陌生借款 | 通过官方渠道核实。禁止向个人账户付款或提供密码和验证码。投诉可提供时间、联系方式、经过和手头证据。陌生借款由 ALA 核查申请、身份验证和放款记录。涉及亲友或同事的异常联系交由 ALA 核查，页面列明禁止威胁、恐吓及泄露个人数据。 | [冒名核验](https://www.alaprestamo.com/article/que-hacer-ante-la-presunta-suplantacion-de-ala-o-dudas-sobre-el-proceso-de-cobranza) · [投诉](https://www.alaprestamo.com/article/como-puedo-reportar-una-irregularidad-o-presentar-una-queja-sobre-el-proceso-de-cobranza) · [陌生借款](https://www.alaprestamo.com/article/que-hago-si-no-reconozco-una-deuda-o-un-prestamo-a-mi-nombre) · [隐私与催收行为](https://www.alaprestamo.com/article/ala-puede-publicar-mis-fotos-contactos-o-informacion-personal) |

Demo 文案按 ALA 已公开页面核对。正式发布使用产品文档 §3.9.2 指定的多方审核西语定稿。本次附件包含需求和原型，尚无单独的审核定稿。

## 内容编辑与发布

- **页面模板**保留首屏布局、品牌插画和导航。正式 CMS 将页面主标题与下方正文作为两个字段。产品可以更新标题文字，以及正文的小标题、段落、加粗、列表和链接。
- **编辑流程**复用 Blog 已有的编辑器、预览、草稿和发布流程。正文保存为一块富文本，段落顺序由编辑器决定。复用现有的富文本清洗和链接处理。专题维持独立路由。
- **发布验收**由产品用测试条目实际编辑一段文字、一条列表和一个链接，先确认预览，再发布并验证游客访问时的 HTML。修改或移动小标题后，确认目录同步更新、列表顺序与正文一致。检查桌面目录、手机展开收起和页内定位，并保留首屏联系方式快捷链接所用的 `#contacto`。检查拨号链接和客服跳转。完成后恢复审核稿。
- **Demo**的富文本源文件为 [`cobranza/body.html.txt`](../cobranza/body.html.txt)。修改后运行 `python3 scripts/render_article_pages.py --collection`。脚本通过 Blog 的正文容器生成静态 HTML。正式站的编辑入口由现有 Blog CMS 接入。

## 开发配置

| 配置 | 开发要求 | 可交付的验收证据 |
| --- | --- | --- |
| 正式路由和 canonical | 建议沿用正式站无尾斜杠惯例，使用 `https://www.alaprestamo.com/cobranza`。唯一最终 URL 匿名 GET 返回 `200` 和 `text/html`，canonical 指向该地址。其它等价路由永久重定向，分享参数和锚点留在访问 URL，canonical 使用干净地址。 | 匿名 GET 响应头、最终 URL 及 HTML 中的 canonical。对比有无尾斜杠访问结果。 |
| CMS 和初始 HTML | 复用官网富文本编辑器，标题、段落、链接和列表支持独立保存及发布。服务端或静态生成输出 `lang="es-MX"`、唯一 `<h1>`、各主题 `<h2>`、问题 `<h3>`，并直接输出正文、完整问答及电话。发布后刷新相关 CDN 缓存。 | 关闭 JS，正文和电话仍可读，两个 `tel:` 与可见号码一致。CMS 发布后重新 GET，HTML 反映最新版。 |
| 索引和摘要 | 仅生产路径移除 Demo 的 `noindex`。检查 HTML 的 robots/googlebot meta 与 CDN 的 `X-Robots-Tag`，确保正式页可索引且可生成摘要，核心正文可用于摘要。 | 响应头和页面源码检查，无 `noindex`、`nosnippet` 或等效限制，核心正文不带 `data-nosnippet`。 |
| 爬虫与边缘层 | 确认正式域名 `robots.txt` 的实际匹配规则允许 Googlebot、Bingbot 和 `OAI-SearchBot` 获取该路径，且 CDN/WAF 不向已验证爬虫返回验证码、登录重定向、403 或 429。按平台公开 IP 或官方验证方法确认身份。ChatGPT 搜索的 `OAI-SearchBot` 和训练的 `GPTBot` 按各自目的配置。 | robots 规则检查，边缘或服务端日志记录经过身份验证的爬虫、路径和 200 状态。手动改 User-Agent 的请求只能用于诊断。 |
| 站点发现 | 把最终 canonical URL 加入官网 `sitemap-pages.xml`，由现有 `sitemap.xml` 索引引用，并在 Search Console 提交或确认已有提交。 | 公开 XML 返回 200，`<loc>` 与 canonical 一致。首页和全局导航继续沿用现有入口。 |
| 客服、边距与埋点 | 客服按钮指向正式站帮助中心首页。验证拨号链接和页内电话锚点。富文本正文的外边线对齐导航内容。按产品文档记录 UBS 专题访问和官方客服入口点击。 | 320、390、1024 和桌面宽度截图，用导航 Logo 和最右控件的实际坐标比对目录与正文的整体外边线，检查各级标题、正文和列表缩进，无横向溢出。实际点击客服，记录跳转与 UBS 测试事件。 |

配置依据 [Google 可抓取和 AI 摘要要求](https://developers.google.com/search/docs/appearance/ai-features) · [Google robots 指令](https://developers.google.com/search/docs/crawling-indexing/robots-meta-tag) · [OpenAI 爬虫](https://developers.openai.com/api/docs/bots) · [ALA 页面站点地图](https://www.alaprestamo.com/sitemap-pages.xml)

## 发布后的检索验收

1. **确认能读取。** 对正式 URL 用 Search Console「网址检查 → 测试实际网址 → 查看测试的网页」核对抓取允许状态、渲染和 HTML。访问日志中核对真实 `OAI-SearchBot` 对该路径的 200，来源 IP 对照官方清单。 [Search Console 网址检查](https://support.google.com/webmasters/answer/9012289) · [OpenAI 爬虫与 IP 清单](https://developers.openai.com/api/docs/bots)
2. **确认收录。** 提交正式 sitemap 或请求索引后，回查 URL Inspection 的索引状态与 Google 选定的 canonical。记录时间、状态和截图。实际网址测试通过表示具备被索引的条件。 [Google 站点地图](https://developers.google.com/search/docs/crawling-indexing/sitemaps/overview) · [Search Console 网址检查](https://support.google.com/webmasters/answer/9012289)
3. **观察引用。** 分别用墨西哥西语测试「¿Qué hago si no puedo pagar a tiempo a ALA?」和「¿Cómo verifico un contacto de cobranza de ALA?」。记录平台、日期、返回答案和是否引用正式 URL。Bing Webmaster Tools 的 AI Performance 可查看受支持渠道的引用数据。是否收录和引用由各平台决定。 [Google AI 搜索](https://developers.google.com/search/docs/appearance/ai-features) · [Bing AI Performance](https://blogs.bing.com/webmaster/2026/2/Introducing-AI-Performance-in-Bing-Webmaster-Tools-Public-Preview/)

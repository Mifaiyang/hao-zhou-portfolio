# 作品集访问统计

## 数据边界

- 页面打开后自动开始匿名会话统计，不使用 Cookie 或跨会话访客标识。
- 每个访问会话在 `portfolio_visits` 集合中保存一条记录。
- 保存访问时间、页面、来源域名、设备粗分类、IP 推算地区、脱敏 IP、会话标识、滚动深度和有效浏览时长。
- 不保存完整 IP、URL 查询参数、完整 User-Agent、浏览器指纹或键盘内容。
- 数据保留 90 天；统计函数会抽样清理过期记录。

## 查看方式

数据库集合保持服务端私有，不提供公开读取接口。使用已登录且绑定到 `zhouhao-portfolio-d1drb10353ce76` 的 CloudBase MCP 查询：

1. 读取 `portfolio_visits` 最近记录。
2. 按 `startedAt`、`geo`、`referrerHost`、`firstPath`、`activeMs` 聚合。
3. 如访客提出删除请求，根据对方提供的访问时间、脱敏 IP 或匿名标识定位并删除。

## HR 专属链接

在正常网址后增加不含姓名的 `rid` 编号，例如：

`https://zhouhao-portfolio-d1drb10353ce76-1457168889.tcloudbaseapp.com/?rid=hr_a1b2c3&utm_source=job_application`

每位联系人使用不同编号，并在自己的投递记录中保存“编号 → 联系人”的对应关系。统计后台只保存编号，不保存 HR 姓名。编号命中代表这条链接被打开，不等同于证明本人亲自阅读。

## 指标解释

- `activeMs`：页面处于可见状态时累计的有效浏览时长；不是精确观看证明。
- `elapsedMs`：从会话开始到最后事件的自然时长，可能包含后台挂起时间。
- `geo`：IP 数据库推算的粗略位置，可能受 VPN、运营商出口和数据库更新影响。
- `pageViews`：同一会话访问过的不同页面数量。
- `scrollDepth`：单个会话报告过的最大页面滚动百分比。
- `recipientTag`：专属链接中的匿名 `rid` 编号，用于区分不同投递渠道或联系人。

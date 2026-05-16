# 周灏个人作品网站

这是周灏的个人作品与简历网站，适合部署到 GitHub Pages、Cloudflare Pages 或其他静态网站托管服务。

线上地址：

```text
https://mifaiyang.github.io/hao-zhou-portfolio/
```

## 本地预览

在当前目录启动静态服务器后打开 `index.html`：

```bash
python3 -m http.server 4173 --bind 127.0.0.1
```

预览地址：

```text
http://127.0.0.1:4173/index.html
```

## GitHub Pages 发布

1. 在 GitHub 新建公开仓库，例如 `hao-zhou-portfolio`。
2. 上传本目录中未被 `.gitignore` 排除的文件。
3. 进入仓库 `Settings` -> `Pages`。
4. `Build and deployment` 选择 `Deploy from a branch`。
5. `Branch` 选择 `main`，目录选择 `/root`。
6. 保存后等待 GitHub Pages 生成公开访问链接。

## 更新方式

后续修改 `index.html`、`styles.css`、`main.js` 或 `assets/` 中被网站引用的素材后，同步到 GitHub 仓库，线上网站会自动更新。

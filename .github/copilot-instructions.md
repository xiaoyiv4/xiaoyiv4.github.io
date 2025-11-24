<!-- .github/copilot-instructions.md -->
# AI 开发者指南（供 Copilot / AI 代理使用）

本文件为在此仓库中工作的 AI 编码代理提供可操作、项目特定的信息片段。目的是快速让代理对项目架构、常用命令、约定和关键实现点有可执行的知识。

**快速总览**
- **项目类型**: 静态站点生成 + Vite 前端构建（ESM, `type: "module"`）。关键目录：`src/`（源码与 Markdown 源文件）、`scripts/`（生成器、模板与配置管理）、`public/`（已生成的静态输出/资源）、根级 `index.html` 与 `vite.config.js`。
- **构建流程**: `npm run build` 执行 `vite build && node scripts/config/configManager.js regenerate && node scripts/index.js && vite build`（注意：repo 中存在 build 与 html 生成之间的循环依赖警告）。
- **部署**: 使用 `./github/workflows/deploy.yml` 在 `main` 分支推送时构建并部署到 `gh-pages`（Node 版本：`22.14.0`）。

**关键文件/示例位置**
- 配置与生成器：`scripts/config/*`, `scripts/generators/*`, `scripts/index.js`。
- 模板：`scripts/templates/*`（使用 `nunjucks` 渲染）。
- Markdown/文章源码：`src/docs/*.md`（将由生成器转为 `public/posts/*.html`）。
- 前端负责渲染/交互：`src/js/ArticleManager.js`, `src/js/ArticleRenderer.js`, `src/js/main.js`。
- 静态元数据：`public/articles-metadata.json`（生成/消费的关键 artifact）。

**项目约定与注意事项（具体且可执行）**
- ESM 模式：`package.json` 中 `type: "module"`，所有内部脚本使用 `import`/`export`。改动脚本时请保持 ESM 导入风格。
- 生成器驱动：站点内容通过 `scripts/` 下的生成器导出 HTML 到 `public/posts/`。要新增文章：
  - 将 Markdown 放到 `src/docs/`，然后运行 `npm run build` 生成并写入 `public/`。
  - 可单独运行生成器：`node scripts/generators/metadata-generator.js` 或 `node scripts/index.js` 用于快速本地调试。
- 配置管理：`scripts/config/configManager.js` 提供 `regenerate` 入口，build 流程依赖它生成的路径/元数据。修改配置格式时同时更新 `configLoader.js` 与 `validator.js`。
- 模板渲染：使用 `nunjucks`。模板示例在 `scripts/templates/article.html`，模板管理逻辑在 `scripts/templates/index.js`。

**常用命令（可复制运行）**
```powershell
# 安装
npm install
# 本地开发服务器
npm run dev
# 完整生产构建（会执行生成器与 config regenerate）
npm run build
# 运行站点生成器（调试/单独生成）
npm run generate
# 仅同步静态资源到 public/（可在本地运行）
npm run sync
```

**静态资源同步说明（注意）**
- 为了在本地直接打开 `public/posts/*.html` 时样式与脚本可用，生成器现在会在本地运行时自动把 `src/styles` 与 `src/js` 复制到 `public/`（通过 `scripts/utils/syncStatic.js`）。
- 同步会被 CI 自动跳过（通过检测 `process.env.CI`）或手动跳过：设置 `SKIP_STATIC_SYNC=1` 可以关闭同步（例如在 CI 或特殊场景）。
- 如果你想在本地显式跳过同步并直接生成：
```powershell
# 跳过同步并运行生成
SKIP_STATIC_SYNC=1 npm run generate
```

**调试提示（Agent 专用）**
- 如果 `npm run build` 报错或生成结果不一致：先单独运行 `node scripts/config/configManager.js regenerate`，然后 `node scripts/index.js`，最后运行 `vite build`，分步确定失败阶段。
- 查看 `public/articles-metadata.json` 和 `public/posts/`，这是判断生成器是否成功的第一手证据。
- README 中提及的 “循环依赖” 问题：修改生成器或 vite 构建流程时，优先避免在同一构建步骤里同时读取尚未生成的 `public/` 文件列表。

**代码风格与小型约定**
- 无专门 lint 配置（仓库未包含 ESLint/Prettier 配置文件）。保持现有风格，使用完整的 `import` 路径且避免相对路径过深（可利用 `scripts/config/pathResolver.js`）。
- Node 脚本中尽量捕获并抛出清晰错误（生成器/配置加载阶段），便于 CI 日志定位。

**CI / PR 流程**
- 部署触发器：`on: push` 到 `main` 会运行 `npm run build` 并部署 `./dist`（请注意 `build` 产出目录为 `dist`，同时生成器写入 `public/` —— CI 环境会以 `vite build` 的 `dist` 为最终部署目录）。
- 开发流程建议：在 feature 分支或 `dev` 上提交并发起 PR，合并到 `main` 会触发部署。

**如果需要我完成的具体任务，请明确**
- 例如："在 `scripts/generators` 中添加新文章模板以支持 X front-matter 字段"，或 "修复 build 中的循环依赖，优先让生成器不依赖未构建的 vite 产物"。

---
如有遗漏或仓库中特殊约定（例如额外的部署步骤、私有 secrets、或本地开发依赖），请指出，我会据此更新或合并已有指南。

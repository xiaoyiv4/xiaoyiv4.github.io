## 项目结构
```tree
project/
├── .github/                  # GitHub 自动化配置（适配团队协作）
│   └── workflows/
│       └── deploy.yml        # 测试工作流（代码提交前自动测试）
├── .gitignore
├── package.json
├── vite.config.js
├── articles-metadata.json    # 文章元数据文件
├── index.html
├── docs/                     # 文档目录
├── public/                   # 静态资源优化：细分目录
│   ├── favicon.ico
│   ├── posts/                # 预渲染文章
│   └── images/               # 图片单独归类
├── scripts/                  # 脚本目录优化：按功能细分脚本
│   └── generate-posts.js     # 生成预渲染文章的脚本
├── src/                      # 源代码目录（业务逻辑集中管理）
│   ├── main.js               # 入口 JS
│   ├── js                    # JS
│   └── styles/               # 样式目录归属到 src，明确为“业务样式”
│       ├── main.css          # 主样式
│       └── post-list.css         # 文章列表样式
└──
```

## 运行项目

```bash
# 安装依赖
npm install
# 启动开发服务器
npm run dev
# 构建生产版本
npm run build
# 预览生产版本
npm run preview
```

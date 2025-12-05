## 项目结构
```tree
project/
├── README.md
├── index.html
├── package-lock.json
├── package.json
├── public
│   ├── articles-metadata.json
│   ├── images
│   │   ├── bg.png
│   │   └── default-cover.png
│   └── posts
├── scripts
│   ├── config
│   │   ├── config.json
│   │   ├── config.yaml
│   │   ├── configLoader.js
│   │   ├── configManager.js
│   │   ├── index.js
│   │   ├── pathResolver.js
│   │   └── validator.js
│   ├── generators
│   │   ├── index.js
│   │   ├── metadata-generator.js
│   │   └── post-generator.js
│   ├── index.js
│   ├── templates
│   │   ├── article.html
│   │   ├── index.js
│   │   └── manager.js
│   └── utils
│       ├── ArticleUtils.js
│       ├── debug-utils.js
│       └── tree.js
├── src
│   ├── docs
│   ├── js
│   │   ├── ArticleManager.js
│   │   ├── ArticleRenderer.js
│   │   ├── ArticleUtils.js
│   │   ├── EventBus.js
│   │   ├── UIManager.js
│   │   ├── article.js
│   │   ├── config.js
│   │   ├── main.js
│   │   └── toggleTheme.js
│   └── styles
│       ├── components
│       ├── main.css
│       └── themes
└── vite.config.js
```

```javascript
// 方式1: 使用主入口
import { main } from './src/index.js';
await main();

// 方式2: 使用单独的生成器
import { generateMetadata, generatePosts } from './src/generators/index.js';
await generateMetadata();
await generatePosts();

// 方式3: 使用配置管理
import { configLoader, getPaths } from './src/config/index.js';
const config = await configLoader.load();
const paths = await getPaths();

// 方式4: 使用模板管理
import { templateManager } from './src/templates/index.js';
const html = await templateManager.render('article.html', data);
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
111

## 待解决问题
- **循环依赖**：
html 生成需要 vite 构建的资源路径，vite 构建需要 html 生成的文件列表，存在循环依赖问题，需重构解决。
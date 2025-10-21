import { marked } from 'marked';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 修复路径
const projectRoot = path.join(__dirname, '..');
const docDir = path.join(projectRoot, 'docs');
const postDir = path.join(projectRoot, 'public/posts');

console.log('项目根目录:', projectRoot);
console.log('文档目录:', docDir);
console.log('输出目录:', postDir);

// 配置 marked 选项
marked.setOptions({
    gfm: true,
    breaks: true,
    sanitize: false
});

// HTML 模板
const htmlTemplate = (content, title = '文档') => `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <link rel="stylesheet" href="/article.css">
</head>
<body>
    <div class="article-container">
        <h2>${title}</h2>
        ${content}
    </div>
</body>
</html>
`;

// 移除 frontmatter 的函数
function removeFrontmatter(content) {
    // 匹配 YAML frontmatter (以 --- 开头和结束)
    const frontmatterRegex = /^---\s*\n[\s\S]*?\n---\s*\n/;

    // 如果找到 frontmatter，就移除它
    const cleanedContent = content.replace(frontmatterRegex, '');

    return cleanedContent.trim();
}

// 提取 frontmatter 中的标题（如果有的话）
function extractTitleFromFrontmatter(content) {
    const frontmatterMatch = content.match(/^---\s*\n([\s\S]*?)\n---\s*\n/);

    if (frontmatterMatch) {
        const frontmatter = frontmatterMatch[1];
        const titleMatch = frontmatter.match(/title:\s*(.+)/);
        if (titleMatch) {
            return titleMatch[1].trim().replace(/^['"](.*)['"]$/, '$1'); // 移除引号
        }
    }

    // 如果没有在 frontmatter 中找到标题，就从内容中提取第一个 # 标题
    const contentTitleMatch = content.match(/^#\s+(.+)$/m);
    return contentTitleMatch ? contentTitleMatch[1] : null;
}

async function convertMdToHtml() {
    try {
        console.log('🔄 开始转换 Markdown 文件...');

        // 确保目录存在
        await fs.mkdir(postDir, { recursive: true });

        // 检查文档目录是否存在
        try {
            await fs.access(docDir);
        } catch {
            console.error(`❌ 文档目录不存在: ${docDir}`);
            return;
        }

        const files = await fs.readdir(docDir);
        const mdFiles = files.filter(file => path.extname(file).toLowerCase() === '.md');

        console.log(`📄 找到 ${mdFiles.length} 个 Markdown 文件:`, mdFiles);

        let convertedCount = 0;

        for (const file of mdFiles) {
            try {
                const mdPath = path.join(docDir, file);
                const htmlPath = path.join(postDir, path.basename(file, '.md') + '.html');

                console.log(`🔄 正在处理: ${file}`);

                const mdContent = await fs.readFile(mdPath, 'utf-8');
                console.log(`📝 文件内容长度: ${mdContent.length} 字符`);

                let title = extractTitleFromFrontmatter(mdContent) || path.basename(file, '.md');
                console.log(`📌 提取的标题: ${title}`);

                const contentWithoutFrontmatter = removeFrontmatter(mdContent);
                console.log(`📄 移除 frontmatter 后内容长度: ${contentWithoutFrontmatter.length} 字符`);

                // 修复：使用 await 调用 marked.parse()
                const htmlContent = await marked.parse(contentWithoutFrontmatter);
                console.log(`🔄 转换后的 HTML 长度: ${htmlContent.length} 字符`);

                const fullHtml = htmlTemplate(htmlContent, title);

                await fs.writeFile(htmlPath, fullHtml);
                console.log(`✅ 转换完成: ${file} -> ${path.basename(htmlPath)}`);
                convertedCount++;

                // 输出前100个字符用于调试
                // console.log(`🔍 HTML 预览: ${htmlContent.substring(0, 100)}...`);

            } catch (error) {
                console.error(`❌ 处理文件 ${file} 时出错:`, error);
            }
        }

        if (convertedCount === 0) {
            console.log('ℹ️  没有找到 .md 文件，请在 docs 目录下添加 Markdown 文件');
        } else {
            console.log(`🎉 转换完成！共转换了 ${convertedCount} 个文件`);
        }
    } catch (error) {
        console.error('❌ 转换过程出错:', error);
        process.exit(1);
    }
}

// 运行转换
convertMdToHtml();
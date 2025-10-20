import { marked } from 'marked';
import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const inputDir = path.join(__dirname, '..', 'docs');
const outputDir = path.join(__dirname, '..', 'posts');

// HTML 模板
const htmlTemplate = (content, title = '文档') => `
<!DOCTYPE html>
<html lang="zh-CN">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${title}</title>
    <style>
        body {
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
            line-height: 1.6;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
            color: #333;
        }
        code {
            background-color: #f4f4f4;
            padding: 2px 4px;
            border-radius: 3px;
        }
        pre {
            background-color: #f8f8f8;
            padding: 15px;
            border-radius: 5px;
            overflow-x: auto;
        }
        blockquote {
            border-left: 4px solid #ddd;
            margin-left: 0;
            padding-left: 20px;
            color: #666;
        }
    </style>
</head>
<body>
    ${content}
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
    // 从脚本目录向上到项目根目录
    const projectRoot = path.join(__dirname, '..');
    const docDir = path.join(projectRoot, inputDir);
    const postDir = path.join(projectRoot, outputDir);

    console.log('📁 文档目录:', docDir);
    console.log('📁 输出目录:', postDir);

    try {
        await fs.mkdir(postDir, { recursive: true });

        const files = await fs.readdir(docDir);
        console.log(`📄 找到 ${files.length} 个文件:`, files);

        let convertedCount = 0;

        for (const file of files) {
            if (path.extname(file).toLowerCase() === '.md') {
                const mdPath = path.join(docDir, file);
                const htmlPath = path.join(postDir, path.basename(file, '.md') + '.html');

                console.log(`🔄 正在处理: ${file}`);

                const mdContent = await fs.readFile(mdPath, 'utf-8');

                // 提取标题（优先从 frontmatter 中获取）
                let title = extractTitleFromFrontmatter(mdContent);
                if (!title) {
                    // 如果没有 frontmatter 标题，使用文件名
                    title = path.basename(file, '.md');
                }

                // 移除 frontmatter
                const contentWithoutFrontmatter = removeFrontmatter(mdContent);

                // 转换为 HTML
                const htmlContent = marked.parse(contentWithoutFrontmatter);

                // 使用模板包装 HTML
                const fullHtml = htmlTemplate(htmlContent, title);

                await fs.writeFile(htmlPath, fullHtml);
                console.log(`✅ 转换完成: ${file} -> ${path.basename(htmlPath)}`);
                convertedCount++;
            }
        }

        if (convertedCount === 0) {
            console.log('ℹ️  没有找到 .md 文件，请在 doc 目录下添加 Markdown 文件');
        } else {
            console.log(`🎉 转换完成！共转换了 ${convertedCount} 个文件`);
        }
    } catch (error) {
        console.error('❌ 转换出错:', error);
    }
}

convertMdToHtml();
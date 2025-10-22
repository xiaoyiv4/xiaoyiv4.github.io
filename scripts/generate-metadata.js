import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 修复路径：从脚本位置计算相对路径
const projectRoot = path.join(__dirname, '..'); // 脚本在 scripts/ 目录下
const postsDirectory = path.join(projectRoot, 'docs');
const outputDir = path.join(projectRoot, 'public');
const outputFile = path.join(outputDir, 'articles-metadata.json');

console.log('项目根目录:', projectRoot);
console.log('文章目录:', postsDirectory);
console.log('输出目录:', outputDir);

function getPosts() {
    try {
        // 确保目录存在
        if (!fs.existsSync(postsDirectory)) {
            console.error('错误: 文章目录不存在:', postsDirectory);
            return [];
        }

        const fileNames = fs.readdirSync(postsDirectory);
        console.log(`找到 ${fileNames.length} 个文件:`, fileNames);

        const posts = fileNames
            .filter(fileName => fileName.endsWith('.md'))
            .map((fileName) => {
                const slug = fileName.replace(/\.md$/, '');
                const fullPath = path.join(postsDirectory, fileName);

                try {
                    const fileContents = fs.readFileSync(fullPath, 'utf8');
                    const { data, excerpt, content } = matter(fileContents, { excerpt: true });

                    return {
                        slug,
                        title: data.title || slug,
                        date: data.date || new Date().toISOString().split('T')[0],
                        lastmod: data.lastmod || data.date || new Date().toISOString().split('T')[0],
                        tags: data.tags || [],
                        excerpt: data.excerpt || excerpt || content.slice(0, 200) + '...',
                        description: data.description || '',
                        cover: data.cover || '',
                        readTime: estimateReadTime(content)
                    };
                } catch (error) {
                    console.error(`处理文件 ${fileName} 时出错:`, error);
                    return null;
                }
            })
            .filter(post => post !== null);

        posts.sort((a, b) => new Date(b.date) - new Date(a.date));
        return posts;
    } catch (error) {
        console.error('读取文章目录失败:', error);
        return [];
    }
}

// 估算阅读时间（简单版本）
function estimateReadTime(content) {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute) + '分钟';
}

// 生成元数据JSON文件
try {
    // 确保输出目录存在
    if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
    }

    const postsMetadata = getPosts();
    fs.writeFileSync(outputFile, JSON.stringify(postsMetadata, null, 2));
    console.log(`✅ 文章元数据已生成！共 ${postsMetadata.length} 篇文章，输出到: ${outputFile}`);
} catch (error) {
    console.error('生成元数据失败:', error);
    process.exit(1);
}
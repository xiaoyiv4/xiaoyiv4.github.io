import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import matter from 'gray-matter';

// 获取当前文件的目录路径
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// 文章目录
const postsDirectory = path.join(process.cwd(), 'docs');
// 输出文件路径
const outputFile = path.join(process.cwd(), 'articles-metadata.json');

function getPosts() {
    // 读取post目录下的所有文件
    const fileNames = fs.readdirSync(postsDirectory);
    const posts = fileNames.map((fileName) => {
        // 移除.md扩展名得到slug
        const slug = fileName.replace(/\.md$/, '');
        const fullPath = path.join(postsDirectory, fileName);
        // 读取文件内容
        const fileContents = fs.readFileSync(fullPath, 'utf8');
        // 使用gray-matter解析front matter和内容
        const { data, excerpt, content } = matter(fileContents, { excerpt: true });

        // 提取元数据
        const metadata = {
            slug,
            title: data.title || slug,
            date: data.date || new Date().toISOString().split('T')[0],
            tags: data.tags || [],
            excerpt: data.excerpt || excerpt || content.slice(0, 200) + '...',
            description: data.description || '',
            cover: data.cover || '',
            readTime: estimateReadTime(content) // 可以计算阅读时间
        };

        return metadata;
    });

    // 按日期排序，最新的在前
    posts.sort((a, b) => new Date(b.date) - new Date(a.date));

    return posts;
}

// 估算阅读时间（简单版本）
function estimateReadTime(content) {
    const wordsPerMinute = 200;
    const wordCount = content.split(/\s+/).length;
    return Math.ceil(wordCount / wordsPerMinute) + '分钟';
}

// 生成元数据JSON文件
const postsMetadata = getPosts();
fs.writeFileSync(outputFile, JSON.stringify(postsMetadata, null, 2));
console.log('文章元数据已生成！');
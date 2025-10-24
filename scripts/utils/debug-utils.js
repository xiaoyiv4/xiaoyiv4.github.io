/**
 * import { debugMarkdownFile } from './src/utils/debug-utils.js';
 * await debugMarkdownFile('文件.md');
 */

import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { getPaths } from '../config/index.js';

export async function debugMarkdownFile(filename) {
    const paths = await getPaths();
    const filePath = path.join(paths.docDir, filename);

    try {
        const content = await fs.readFile(filePath, 'utf-8');
        console.log('=== Markdown 文件调试信息 ===');
        console.log(`文件: ${filename}`);
        console.log(`原始内容长度: ${content.length}`);
        console.log('--- 原始内容前200字符 ---');
        console.log(content.slice(0, 200));
        console.log('--- Frontmatter 解析 ---');

        const { data, content: markdownContent } = matter(content);
        console.log('Frontmatter 数据:', data);
        console.log(`去除 frontmatter 后内容长度: ${markdownContent.length}`);
        console.log('--- 去除 frontmatter 后的内容前200字符 ---');
        console.log(markdownContent.slice(0, 200));
        console.log('=== 调试结束 ===');

        return { data, markdownContent };
    } catch (error) {
        console.error(`调试文件 ${filename} 时出错:`, error);
        throw error;
    }
}
await debugMarkdownFile('post.md');
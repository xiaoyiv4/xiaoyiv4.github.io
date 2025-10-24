import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import { getSiteConfig, getPaths, getFileConfig, pathResolver } from '../config/index.js';
import { ArticleUtils } from '../utils/ArticleUtils.js';

class MetadataGenerator {
    constructor() {
        this.site = null;
        this.paths = null;
        this.fileConfig = null;
    }

    async initialize() {
        this.site = await getSiteConfig();
        this.paths = await getPaths();
        this.fileConfig = await getFileConfig();
        console.log('🔧 元数据生成器初始化完成');
    }

    /**
     * 估算阅读时间
     */
    estimateReadTime(content) {
        return ArticleUtils.estimateReadTime(content);
    }

    /**
     * 从内容中提取摘要
     */
    extractExcerpt(content, frontmatter) {
        return ArticleUtils.extractExcerpt(content, frontmatter);
    }

    /**
     * 从文件名生成 slug
     */
    generateSlug(filename) {
        const name = path.basename(filename, '.md');

        // 处理日期前缀的文件名，如：2024-01-01-my-post.md
        const dateMatch = name.match(/^(\d{4}-\d{2}-\d{2})-(.+)$/);
        if (dateMatch) {
            return dateMatch[2]; // 返回去掉日期的部分
        }

        return name;
    }

    /**
     * 从内容中提取标题
     */
    extractTitle(frontmatter, content, filename) {
        // 1. 优先使用 frontmatter 中的标题
        if (frontmatter.title) {
            return frontmatter.title;
        }

        // 2. 从内容中提取一级标题
        const titleMatch = content.match(/^#\s+(.+)$/m);
        if (titleMatch) {
            return titleMatch[1].trim();
        }

        // 3. 从文件名生成标题
        const slug = this.generateSlug(filename);
        return slug
            .replace(/[-_]/g, ' ')
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/\b\w/g, l => l.toUpperCase())
            .replace(/\s+/g, ' ')
            .trim();
    }

    /**
     * 获取所有文章数据
     */
    async getPosts() {
        try {
            console.log(`📂 扫描目录: ${this.paths.docDir}`);

            // 检查目录是否存在
            if (!await pathResolver.pathExists(this.paths.docDir)) {
                console.warn(`⚠️  文档目录不存在: ${this.paths.docDir}`);
                return [];
            }

            const fileNames = await fs.readdir(this.paths.docDir);
            console.log(`📄 找到 ${fileNames.length} 个文件`);

            const posts = await Promise.all(
                fileNames
                    .filter(fileName => this.fileConfig.supportedExtensions.includes(path.extname(fileName)))
                    .map(async (fileName) => {
                        const fullPath = path.join(this.paths.docDir, fileName);

                        try {
                            const fileContents = await fs.readFile(fullPath, 'utf8');
                            const { data: frontmatter, content } = matter(fileContents);

                            const slug = this.generateSlug(fileName);
                            const title = this.extractTitle(frontmatter, content, fileName);
                            const excerpt = this.extractExcerpt(content, frontmatter);
                            const readTime = this.estimateReadTime(content);

                            console.log(`📝 处理文件: ${fileName}`);

                            return {
                                slug,
                                title,
                                date: frontmatter.date || new Date().toISOString().split('T')[0],
                                lastmod: frontmatter.lastmod || frontmatter.date || new Date().toISOString().split('T')[0],
                                tags: frontmatter.tags || [],
                                categories: frontmatter.categories || [],
                                excerpt,
                                description: frontmatter.description || excerpt,
                                cover: frontmatter.cover || this.site.defaultCover || '',
                                readTime,
                                wordCount: content.split(/\s+/).length,
                                fileName,
                                draft: frontmatter.draft || false
                            };
                        } catch (error) {
                            console.error(`❌ 处理文件 ${fileName} 时出错:`, error.message);
                            return null;
                        }
                    })
            );

            const validPosts = posts
                .filter(post => post !== null && !post.draft) // 过滤掉无效文章和草稿
                .sort((a, b) => new Date(b.date) - new Date(a.date)); // 按日期倒序排列

            console.log(`✅ 成功处理 ${validPosts.length} 篇文章`);
            return validPosts;

        } catch (error) {
            console.error('❌ 读取文章目录失败:', error.message);
            return [];
        }
    }

    /**
     * 生成分类和标签索引
     */
    generateIndexes(posts) {
        const categories = {};
        const tags = {};

        posts.forEach(post => {
            // 分类索引
            post.categories.forEach(category => {
                if (!categories[category]) {
                    categories[category] = [];
                }
                categories[category].push(post.slug);
            });

            // 标签索引
            post.tags.forEach(tag => {
                if (!tags[tag]) {
                    tags[tag] = [];
                }
                tags[tag].push(post.slug);
            });
        });

        return { categories, tags };
    }

    /**
     * 生成完整的元数据
     */
    async generate() {
        try {
            await this.initialize();

            console.log('🚀 开始生成文章元数据...');

            // 确保输出目录存在
            const outputDir = path.dirname(this.paths.metadataFile);
            await fs.mkdir(outputDir, { recursive: true });

            // 获取文章数据
            const posts = await this.getPosts();

            if (posts.length === 0) {
                console.log('ℹ️  没有找到可处理的文章');
                return;
            }

            // 生成索引
            const indexes = this.generateIndexes(posts);

            // 构建完整的元数据
            const metadata = {
                generatedAt: new Date().toISOString(),
                postCount: posts.length,
                posts,
                ...indexes
            };

            // 写入元数据文件
            await fs.writeFile(this.paths.metadataFile, JSON.stringify(metadata, null, 2));

            console.log(`✅ 文章元数据已生成！`);
            console.log(`  输出文件: ${this.paths.metadataFile}`);
            console.log(`  文章数量: ${posts.length}`);
            console.log(`  分类数量: ${Object.keys(indexes.categories).length}`);
            console.log(`  标签数量: ${Object.keys(indexes.tags).length}`);

            // 显示统计信息
            if (posts.length > 0) {
                console.log('\n📊 最新文章:');
                posts.slice(0, 3).forEach((post, index) => {
                    console.log(`  ${index + 1}. ${post.title} (${post.date})`);
                });
            }

            return metadata;

        } catch (error) {
            console.error('❌ 生成元数据失败:', error.message);
            throw error;
        }
    }
}

// 创建单例实例
const metadataGenerator = new MetadataGenerator();

// 导出默认函数，保持向后兼容
async function generateMetadata() {
    return await metadataGenerator.generate();
}

export default generateMetadata;
export { MetadataGenerator, metadataGenerator };
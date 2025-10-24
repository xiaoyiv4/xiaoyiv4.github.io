import fs from 'fs/promises';
import path from 'path';
import matter from 'gray-matter';
import MarkdownIt from 'markdown-it';
import anchor from 'markdown-it-anchor';
import toc from 'markdown-it-toc-done-right';
import highlightjs from 'markdown-it-highlightjs';
import { getPaths, getMarkdownConfig, getTemplateConfig, getFileConfig, pathResolver } from '../config/index.js';
import { templateManager } from '../templates/index.js';

class PostGenerator {
    constructor() {
        this.paths = null;
        this.markdownConfig = null;
        this.templateConfig = null;
        this.fileConfig = null;
        this.md = null;
        this.metadata = null;
    }

    async initialize() {
        this.paths = await getPaths();
        this.markdownConfig = await getMarkdownConfig();
        this.templateConfig = await getTemplateConfig();
        this.fileConfig = await getFileConfig();

        // 初始化模板管理器（确保只初始化一次）
        await templateManager.init();

        // 加载元数据文件
        await this.loadMetadata();
        
        // 加载构建资源
        await this.loadBuiltResources();

        // 初始化 Markdown 处理器
        this.md = new MarkdownIt(this.markdownConfig.options);

        // 配置 anchor 插件（使用新的 API）
        const anchorOptions = { ...this.markdownConfig.plugins.anchor };

        // 使用 headerLink permalink
        anchorOptions.permalink = anchor.permalink.headerLink({
            safariReaderFix: true,
            class: anchorOptions.permalinkClass || 'header-anchor',
            symbol: anchorOptions.permalinkSymbol || '#'
        });

        this.md
            .use(anchor, anchorOptions)
            .use(toc, this.markdownConfig.plugins.toc)
            .use(highlightjs, this.markdownConfig.plugins.highlightjs);

        console.log('🔧 文章生成器初始化完成');
    }

    /**
     * 从Markdown内容中提取标题并生成TOC
     */
    generateTocFromHeadings(markdownContent) {
        const headingRegex = /^(#{1,6})\s+(.+)$/gm;
        const headings = [];
        let match;

        while ((match = headingRegex.exec(markdownContent)) !== null) {
            const level = match[1].length;
            const title = match[2].trim();
            // 生成一个简单的锚点ID
            const anchorId = encodeURIComponent(title.toLowerCase().replace(/\s+/g, '-'));
            headings.push({ level, title, anchorId });
        }

        if (headings.length === 0) {
            return '';
        }

        // 生成TOC HTML
        let tocHtml = '<nav class="table-of-contents">\n';
        tocHtml += '<ul>\n';
        
        let currentLevel = 0;
        for (const heading of headings) {
            // 处理层级嵌套
            if (heading.level > currentLevel) {
                while (heading.level > currentLevel) {
                    tocHtml += '<li><ul>\n';
                    currentLevel++;
                }
            } else if (heading.level < currentLevel) {
                while (heading.level < currentLevel) {
                    tocHtml += '</ul></li>\n';
                    currentLevel--;
                }
            }
            
            tocHtml += `<li><a href="#${heading.anchorId}">${heading.title}</a>`;
            tocHtml += '</li>\n';
        }
        
        // 关闭所有打开的标签
        while (currentLevel > 0) {
            tocHtml += '</ul></li>\n';
            currentLevel--;
        }
        
        return tocHtml;
    }

    /**
     * 加载构建后的资源信息
     */
    async loadBuiltResources() {
        try {
            const manifestPath = path.join(process.cwd(), 'dist', '.vite', 'manifest.json');
            
            if (!await pathResolver.pathExists(manifestPath)) {
                console.warn('⚠️  manifest.json 不存在，使用开发环境路径');
                this.builtResources = {
                    main: {
                        css: 'src/styles/main.css',
                        js: 'src/js/main.js'
                    },
                    article: {
                        css: 'src/styles/components/article.css',
                        js: 'src/js/article.js'
                    }
                };
                return;
            }

            const manifestContent = await fs.readFile(manifestPath, 'utf-8');
            const manifest = JSON.parse(manifestContent);

            console.log('📦 构建资源清单:', Object.keys(manifest));

            // 查找以article开头的资源
            const articleJsEntry = Object.keys(manifest).find(key => 
                key.startsWith('src/js/article.js') || 
                (manifest[key].name && manifest[key].name.startsWith('article'))
            );
            
            const articleCssEntry = Object.keys(manifest).find(key => 
                (manifest[key].name && manifest[key].name.startsWith('article')) &&
                key.endsWith('.css')
            );

            this.builtResources = {
                main: {
                    css: manifest['index.html']?.css?.[0] ? `/${manifest['index.html'].css[0]}` : null,
                    js: manifest['index.html']?.file ? `/${manifest['index.html'].file}` : null
                },
                article: {
                    // 优先使用article开头的资源，否则回退到main资源
                    css: articleCssEntry ? `/${manifest[articleCssEntry].file}` : 
                         manifest['index.html']?.css?.[0] ? `/${manifest['index.html'].css[0]}` : null,
                    js: articleJsEntry ? `/${manifest[articleJsEntry].file}` : 
                        manifest['index.html']?.file ? `/${manifest['index.html'].file}` : null
                }
            };

            console.log('🎯 解析的构建资源:', this.builtResources);

        } catch (error) {
            console.error('❌ 加载构建资源失败:', error.message);
            // 降级到开发环境路径
            this.builtResources = {
                main: {
                    css: 'src/styles/main.css',
                    js: 'src/js/main.js'
                },
                article: {
                    css: 'src/styles/components/article.css',
                    js: 'src/js/article.js'
                }
            };
        }
    }

    /**
     * 加载元数据文件
     */
    async loadMetadata() {
        try {
            // 检查元数据文件是否存在
            if (!await pathResolver.pathExists(this.paths.metadataFile)) {
                console.warn(`⚠️  元数据文件不存在: ${this.paths.metadataFile}`);
                console.log('ℹ️  请先运行元数据生成器');
                this.metadata = { posts: [] };
                return;
            }

            const metadataContent = await fs.readFile(this.paths.metadataFile, 'utf-8');
            this.metadata = JSON.parse(metadataContent);
            console.log(`📊 已加载元数据，包含 ${this.metadata.postCount} 篇文章`);

            // 验证元数据完整性
            if (!this.metadata.posts || !Array.isArray(this.metadata.posts)) {
                console.warn('⚠️  元数据格式不正确，posts 字段缺失或不是数组');
                this.metadata.posts = [];
            }
        } catch (error) {
            console.error('❌ 加载元数据文件失败:', error.message);
            this.metadata = { posts: [] };
        }
    }

    /**
     * 从元数据中获取文章标题
     */
    getTitleFromMetadata(filename) {
        if (!this.metadata || !this.metadata.posts) {
            return null;
        }

        // 查找匹配的文章
        const post = this.metadata.posts.find(p => p.fileName === filename);
        if (post && post.title) {
            console.log(`📌 从元数据获取标题: "${post.title}"`);
            return post.title;
        }

        return null;
    }

    /**
     * 提取文章标题
     */
    extractTitle(frontmatter, content, filename) {
        // 1. 优先从元数据中获取标题
        const metadataTitle = this.getTitleFromMetadata(filename);
        if (metadataTitle) {
            return metadataTitle;
        }

        // 2. 使用 frontmatter 中的标题
        if (frontmatter.title) {
            console.log(`📌 从 frontmatter 提取标题: "${frontmatter.title}"`);
            return frontmatter.title;
        }

        // 3. 从内容中提取一级标题
        const contentTitleMatch = content.match(/^#\s+(.+)$/m);
        if (contentTitleMatch) {
            const title = contentTitleMatch[1].trim();
            console.log(`📌 从内容提取标题: "${title}"`);
            return title;
        }

        // 4. 从文件名生成标题
        const name = path.basename(filename, '.md');
        let title = name
            .replace(/[-_]/g, ' ')
            .replace(/([a-z])([A-Z])/g, '$1 $2')
            .replace(/\b\w/g, l => l.toUpperCase())
            .replace(/\s+/g, ' ')
            .trim();

        // 处理日期前缀的文件名
        const dateMatch = name.match(/^(\d{4})-(\d{2})-(\d{2})-(.+)$/);
        if (dateMatch) {
            const [, year, month, day, rest] = dateMatch;
            title = this.extractTitle({}, '', rest); // 递归处理剩余部分
            title += ` (${year}-${month}-${day})`;
        }

        console.log(`📌 从文件名生成标题: "${title}"`);
        return title || '未命名文档';
    }

    /**
     * 从元数据中获取文章的其他信息
     */
    getPostMetadata(filename) {
        if (!this.metadata || !this.metadata.posts) {
            return {};
        }

        const post = this.metadata.posts.find(p => p.fileName === filename);
        if (post) {
            return {
                slug: post.slug,
                date: post.date,
                lastmod: post.lastmod,
                tags: post.tags || [],
                categories: post.categories || [],
                description: post.description,
                excerpt: post.excerpt,
                cover: post.cover,
                readTime: post.readTime,
                wordCount: post.wordCount,
                draft: post.draft || false
            };
        }

        return {};
    }

    /**
     * 处理单个 Markdown 文件
     */
    async processFile(file) {
        try {
            const mdPath = path.join(this.paths.docDir, file);
            const htmlFileName = path.basename(file, '.md') + this.fileConfig.outputExtension;
            const htmlPath = path.join(this.paths.postDir, htmlFileName);

            // 读取 Markdown 内容
            const mdContent = await fs.readFile(mdPath, 'utf-8');

            // 解析 frontmatter 和内容
            const { data: frontmatter, content: markdownContent } = matter(mdContent);
            console.log(`\n🔄 正在处理: ${file}`);
            console.log(`  内容长度: ${markdownContent.length} 字符`);
            console.log(`  Frontmatter:`, Object.keys(frontmatter));

            // 提取标题（优先从元数据获取）
            const title = this.extractTitle(frontmatter, markdownContent, file);
            console.log(`  标题: "${title}"`);

            // 从元数据获取其他信息
            const postMetadata = this.getPostMetadata(file);

            // 手动生成TOC
            const tocHtml = this.generateTocFromHeadings(markdownContent);
            console.log(`  生成目录: ${tocHtml.length} 字符`);

            // 转换 Markdown 为 HTML
            const htmlContent = this.md.render(markdownContent);

            // 准备模板数据（合并元数据和 frontmatter，元数据优先级更高）
            const templateData = {
                title,
                content: htmlContent,
                toc: tocHtml,
                timestamp: new Date().toLocaleString('zh-CN'),
                showToc: this.templateConfig.templateData.showToc && tocHtml.length > 0,
                highlightjs: this.templateConfig.templateData.highlightjs,
                // 添加构建资源信息
                builtResources: this.builtResources,
                // 合并元数据和 frontmatter（元数据优先级更高）
                ...frontmatter,
                ...postMetadata,
                // 添加一些有用的元数据
                meta: {
                    fileName: file,
                    generatedAt: new Date().toISOString(),
                    wordCount: markdownContent.split(/\s+/).length,
                    // 如果元数据中有 wordCount，使用元数据的值
                    ...(postMetadata.wordCount && { wordCount: postMetadata.wordCount })
                }
            };

            // 渲染模板
            const fullHtml = await templateManager.render(this.templateConfig.defaultTemplate, templateData);

            // 写入文件
            await fs.writeFile(htmlPath, fullHtml);
            console.log(`✅ 完成: ${file} -> ${htmlFileName}`);

            return {
                success: true,
                file: htmlFileName,
                title,
                path: htmlPath,
                metadata: postMetadata
            };

        } catch (error) {
            console.error(`❌ 处理文件 ${file} 时出错:`, error.message);
            return {
                success: false,
                file,
                error: error.message
            };
        }
    }

    /**
     * 获取所有 Markdown 文件
     */
    async getMarkdownFiles() {
        try {
            if (!await pathResolver.pathExists(this.paths.docDir)) {
                console.error(`❌ 文档目录不存在: ${this.paths.docDir}`);
                return [];
            }

            const files = await fs.readdir(this.paths.docDir);
            const mdFiles = files.filter(file =>
                path.extname(file).toLowerCase() === '.md'
            );

            console.log(`📄 找到 ${mdFiles.length} 个 Markdown 文件`);
            return mdFiles;

        } catch (error) {
            console.error('❌ 读取文档目录失败:', error.message);
            return [];
        }
    }

    /**
     * 生成所有文章
     */
    async generate() {
        try {
            await this.initialize();

            console.log('🚀 开始生成 HTML 文章...');

            // 检查元数据是否可用
            if (!this.metadata || !this.metadata.posts || this.metadata.posts.length === 0) {
                console.warn('⚠️  没有可用的文章元数据，可能影响标题和其他信息的获取');
            }

            // 确保输出目录存在
            await fs.mkdir(this.paths.postDir, { recursive: true });

            // 获取所有 Markdown 文件
            const mdFiles = await this.getMarkdownFiles();

            if (mdFiles.length === 0) {
                console.log('ℹ️  没有找到 .md 文件，请在文档目录下添加 Markdown 文件');
                return { success: 0, failure: 0, total: 0 };
            }

            // 处理所有文件
            const results = await Promise.all(
                mdFiles.map(file => this.processFile(file))
            );

            // 统计结果
            const successCount = results.filter(r => r.success).length;
            const failureCount = results.filter(r => !r.success).length;

            console.log(`\n🎉 文章生成完成！`);
            console.log(`✅ 成功: ${successCount} 个文件`);

            if (failureCount > 0) {
                console.log(`❌ 失败: ${failureCount} 个文件`);

                // 显示失败的文件
                const failedFiles = results.filter(r => !r.success);
                failedFiles.forEach(result => {
                    console.log(`   - ${result.file}: ${result.error}`);
                });
            }

            return {
                success: successCount,
                failure: failureCount,
                total: mdFiles.length,
                results: results.filter(r => r.success)
            };

        } catch (error) {
            console.error('❌ 文章生成过程出错:', error.message);
            throw error;
        }
    }

    /**
     * 生成单个文章（用于开发时的增量生成）
     */
    async generateSingle(filePath) {
        try {
            await this.initialize();

            const fileName = path.basename(filePath);
            if (path.extname(fileName).toLowerCase() !== '.md') {
                throw new Error('只支持 .md 文件');
            }

            console.log(`🚀 生成单个文章: ${fileName}`);
            return await this.processFile(fileName);

        } catch (error) {
            console.error(`❌ 生成单个文章失败:`, error.message);
            throw error;
        }
    }
}

// 创建单例实例
const postGenerator = new PostGenerator();

// 导出默认函数，保持向后兼容
async function generatePosts() {
    return await postGenerator.generate();
}

export default generatePosts;
export { PostGenerator, postGenerator };
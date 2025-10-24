/**
 * 文章数据处理工具类 (Node.js版本)
 * 提供统一的文章数据处理方法，避免前后端重复代码
 */

export class ArticleUtils {
    /**
     * 按日期排序文章（最新的在前）
     * @param {Array} articles - 文章数组
     * @returns {Array} 排序后的文章数组
     */
    static sortArticlesByDate(articles) {
        return [...articles].sort((a, b) => new Date(b.date) - new Date(a.date));
    }

    /**
     * 获取最新的文章
     * @param {Array} articles - 文章数组
     * @param {number} count - 获取文章数量
     * @returns {Array} 最新的文章数组
     */
    static getLatestArticles(articles, count = 5) {
        return this.sortArticlesByDate(articles).slice(0, count);
    }

    /**
     * 根据slug获取文章
     * @param {Array} articles - 文章数组
     * @param {string} slug - 文章slug
     * @returns {Object|null} 匹配的文章或null
     */
    static getArticleBySlug(articles, slug) {
        return articles.find(article => article.slug === slug) || null;
    }

    /**
     * 根据标签获取文章
     * @param {Array} articles - 文章数组
     * @param {string} tag - 标签
     * @returns {Array} 匹配的文章数组
     */
    static getArticlesByTag(articles, tag) {
        return articles.filter(article => 
            article.tags && article.tags.includes(tag)
        );
    }

    /**
     * 根据分类获取文章
     * @param {Array} articles - 文章数组
     * @param {string} category - 分类
     * @returns {Array} 匹配的文章数组
     */
    static getArticlesByCategory(articles, category) {
        return articles.filter(article => article.category === category);
    }

    /**
     * 搜索文章
     * @param {Array} articles - 文章数组
     * @param {string} keyword - 搜索关键词
     * @returns {Array} 匹配的文章数组
     */
    static searchArticles(articles, keyword) {
        const lowerKeyword = keyword.toLowerCase();
        return articles.filter(article =>
            article.title.toLowerCase().includes(lowerKeyword) ||
            (article.description && article.description.toLowerCase().includes(lowerKeyword)) ||
            (article.excerpt && article.excerpt.toLowerCase().includes(lowerKeyword)) ||
            (article.tags && article.tags.some(tag => tag.toLowerCase().includes(lowerKeyword)))
        );
    }

    /**
     * 获取所有分类
     * @param {Array} articles - 文章数组
     * @returns {Array} 去重后的分类数组
     */
    static getAllCategories(articles) {
        const categories = articles
            .map(article => article.category)
            .filter(Boolean);
        return [...new Set(categories)];
    }

    /**
     * 获取所有标签
     * @param {Array} articles - 文章数组
     * @returns {Array} 去重后的标签数组
     */
    static getAllTags(articles) {
        const allTags = articles
            .filter(article => article.tags)
            .flatMap(article => article.tags);
        return [...new Set(allTags)];
    }

    /**
     * 格式化日期
     * @param {string} dateString - 日期字符串
     * @returns {string} 格式化后的日期
     */
    static formatDate(dateString) {
        if (!dateString) return '未知日期';

        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '无效日期';

        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    /**
     * 估算阅读时间
     * @param {string} content - 文章内容
     * @returns {string} 阅读时间
     */
    static estimateReadTime(content) {
        const wordsPerMinute = 200;
        const wordCount = content.split(/\s+/).length;
        const minutes = Math.ceil(wordCount / wordsPerMinute);
        return minutes > 0 ? `${minutes}分钟` : '少于1分钟';
    }

    /**
     * 从内容中提取摘要
     * @param {string} content - 文章内容
     * @param {Object} frontmatter - frontmatter数据
     * @returns {string} 摘要
     */
    static extractExcerpt(content, frontmatter = {}) {
        // 优先使用 frontmatter 中的摘要
        if (frontmatter.excerpt) {
            return frontmatter.excerpt;
        }

        if (frontmatter.description) {
            return frontmatter.description;
        }

        // 从内容中提取前200个字符作为摘要
        const plainText = content
            .replace(/^#+\s+.+$/gm, '') // 移除标题
            .replace(/```[\s\S]*?```/g, '') // 移除代码块
            .replace(/`[^`]*`/g, '') // 移除行内代码
            .replace(/!\[.*?\]\(.*?\)/g, '') // 移除图片
            .replace(/\[.*?\]\(.*?\)/g, '') // 移除链接
            .replace(/\n+/g, ' ') // 换行符替换为空格
            .trim();

        return plainText.slice(0, 200) + (plainText.length > 200 ? '...' : '');
    }
}
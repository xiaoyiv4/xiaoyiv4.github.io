/**
 * 文章工具类，用于处理文章数据的格式化和操作
 */
export class ArticleUtils {
    /**
     * 按日期排序文章（新到旧）
     * @param {Array} articles - 文章数组
     * @returns {Array} 排序后的文章数组
     */
    static sortArticlesByDate(articles) {
        return articles.sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
    }

    /**
     * 格式化日期为中文格式
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
     * 提取纯文本内容
     * @param {string} excerpt - 摘要文本
     * @returns {string} 纯文本内容
     */
    static extractPlainText(excerpt) {
        return excerpt
            .replace(/^## .*\n/, '')
            .replace(/```[\s\S]*?```/g, '')
            .replace(/`[^`]*`/g, '')
            .replace(/#{1,6}\s?/g, '')
            .replace(/\*\*/g, '')
            .replace(/\*/g, '')
            .trim();
    }
}

export class ArticleRenderer {
    constructor(config) {
        this.config = config;
    }

    renderPosts(articles, containerId = this.config.selectors.postsList) {
        const postsList = document.getElementById(containerId);
        if (!postsList) {
            console.warn(`Container #${containerId} not found`);
            return;
        }

        if (!articles || articles.length === 0) {
            postsList.innerHTML = '<p class="no-posts">暂无文章</p>';
            return;
        }

        const sortedArticles = ArticleUtils.sortArticlesByDate(articles);
        const postsHTML = this.generatePostsHTML(sortedArticles);

        postsList.innerHTML = postsHTML;
    }

    generatePostsHTML(articles) {
        return articles.map(article => this.generateArticleHTML(article)).join('');
    }

    generateArticleHTML(article) {
        return `
            <article class="article-card" role="listitem">
                ${article.cover ? this.generateCoverHTML(article) : ''}
                <div class="article-content">
                    <div class="article-title-wrapper">
                        <h2 class="article-title">
                            <a href="./posts/${article.slug}.html">${article.title}</a>
                        </h2>
                        <span class="read-time">${article.readTime || '阅读时间未知'}</span>
                    </div>
                    <p class="article-description">${this.getArticleDescription(article)}</p>
                    <div class="article-meta">
                        <span class="publish-date">发表于 ${ArticleUtils.formatDate(article.date)}</span>
                        ${article.lastmod ? `<span class="update-date">更新于 ${ArticleUtils.formatDate(article.lastmod)}</span>` : ''}
                    </div>
                    ${article.tags && article.tags.length > 0 ? this.generateTagsHTML(article.tags) : ''}
                </div>
            </article>
        `;
    }

    generateCoverHTML(article) {
        let coverPath = article.cover;

        // 处理不完整的封面路径
        if (coverPath && !coverPath.startsWith('/') && !coverPath.startsWith('http')) {
            coverPath = `./images/${coverPath}`;
        }

        return `
    <div class="article-cover">
        <img src="${coverPath || './images/default-cover.png'}" alt="${article.title}" loading="lazy">
    </div>
    `;
    }

    generateTagsHTML(tags) {
        return `
        <div class="tags">
            ${tags.map(tag => `<span class="tag" data-tag="${tag}">${tag}</span>`).join('')}
        </div>
    `;
    }

    getArticleDescription(article) {
        if (article.description) {
            return article.description;
        }

        if (article.excerpt) {
            const plainText = ArticleUtils.extractPlainText(article.excerpt);
            const maxLength = this.config.defaults.descriptionLength;

            return plainText.length > maxLength ?
                plainText.substring(0, maxLength) + '...' : plainText;
        }

        return '暂无描述';
    }
}
export default class ArticleManager {
    constructor() {
        this.articles = [];
        this.isLoaded = false;
        this.loadPromise = null;
    }

    // 加载文章数据
    async loadPosts(onLoadCallback) {
        if (this.loadPromise) {
            return this.loadPromise;
        }

        this.loadPromise = (async () => {
            try {
                const response = await fetch('./articles-metadata.json');
                if (!response.ok) {
                    throw new Error(`HTTP error! status: ${response.status}`);
                }
                this.articles = await response.json();
                this.isLoaded = true;

                this.renderPosts(this.articles);

                if (onLoadCallback && typeof onLoadCallback === 'function') {
                    onLoadCallback(this.articles);
                }

                return this.articles;
            } catch (error) {
                console.error('加载文章数据失败:', error);
                const postsList = document.getElementById('postsList');
                if (postsList) {
                    postsList.innerHTML = '<p class="error">加载文章列表失败，请刷新页面重试。</p>';
                }
                throw error;
            }
        })();

        return this.loadPromise;
    }

    // 渲染文章列表
    renderPosts(articles = this.articles) {
        const postsList = document.getElementById('postsList');
        if (!postsList) return;

        if (!articles || articles.length === 0) {
            postsList.innerHTML = '<p class="no-posts">暂无文章</p>';
            return;
        }

        // 按日期排序（最新的在前面）
        const sortedArticles = articles.sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });

        const postsHTML = sortedArticles.map(article => `
            <div class="card" role="listitem">
                ${article.cover ? `
                    <div class="card-cover">
                        <img src="${article.cover}" alt="${article.title}" loading="lazy">
                    </div>
                ` : ''}
                <div class="card-content">
                    <span class="card-title">
                        <a href="posts/${article.slug}.html">${article.title}</a>
                    </span>
                    <p class="card-description">${this.getArticleDescription(article)}</p>
                    <div class="card-meta">
                        <span class="publish-date">发表于 ${this.formatDate(article.date)}</span>
                        <span class="read-time">${article.readTime || '阅读时间未知'}</span>
                    </div>
                    ${article.tags && article.tags.length > 0 ? `
                        <div class="card-tags">
                            ${article.tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
                        </div>
                    ` : ''}
                </div>
            </div>
        `).join('');

        postsList.innerHTML = postsHTML;
    }

    // 获取文章描述
    getArticleDescription(article) {
        // 优先使用 description，如果没有则使用 excerpt 的前100个字符
        if (article.description) {
            return article.description;
        }
        if (article.excerpt) {
            // 从 excerpt 中提取纯文本（移除 markdown 标记）
            const plainText = article.excerpt
                .replace(/^## .*\n/, '') // 移除开头的标题
                .replace(/```[\s\S]*?```/g, '') // 移除代码块
                .replace(/`[^`]*`/g, '') // 移除行内代码
                .replace(/#{1,6}\s?/g, '') // 移除标题标记
                .replace(/\*\*/g, '') // 移除加粗
                .replace(/\*/g, '') // 移除斜体
                .trim();

            return plainText.length > 100 ? plainText.substring(0, 100) + '...' : plainText;
        }
        return '暂无描述';
    }

    // 格式化日期
    formatDate(dateString) {
        if (!dateString) return '未知日期';

        const date = new Date(dateString);
        if (isNaN(date.getTime())) return '无效日期';

        return date.toLocaleDateString('zh-CN', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    }

    // 获取所有文章
    getAllArticles() {
        this.ensureLoaded();
        return this.articles;
    }

    // 根据ID获取文章
    getArticleById(id) {
        this.ensureLoaded();
        return this.articles.find(article => article.id === id);
    }

    // 根据slug获取文章
    getArticleBySlug(slug) {
        this.ensureLoaded();
        return this.articles.find(article => article.slug === slug);
    }

    // 根据分类获取文章
    getArticlesByCategory(category) {
        this.ensureLoaded();
        return this.articles.filter(article => article.category === category);
    }

    // 根据标签获取文章
    getArticlesByTag(tag) {
        this.ensureLoaded();
        return this.articles.filter(article =>
            article.tags && article.tags.includes(tag)
        );
    }

    // 搜索文章
    searchArticles(keyword) {
        this.ensureLoaded();
        const lowerKeyword = keyword.toLowerCase();
        return this.articles.filter(article =>
            article.title.toLowerCase().includes(lowerKeyword) ||
            (article.description && article.description.toLowerCase().includes(lowerKeyword)) ||
            (article.excerpt && article.excerpt.toLowerCase().includes(lowerKeyword)) ||
            (article.tags && article.tags.some(tag => tag.toLowerCase().includes(lowerKeyword)))
        );
    }

    // 获取所有分类
    getAllCategories() {
        this.ensureLoaded();
        const categories = this.articles.map(article => article.category).filter(Boolean);
        return [...new Set(categories)];
    }

    // 获取所有标签
    getAllTags() {
        this.ensureLoaded();
        const allTags = this.articles
            .filter(article => article.tags)
            .flatMap(article => article.tags);
        return [...new Set(allTags)];
    }

    // 获取最新文章
    getLatestArticles(count = 5) {
        this.ensureLoaded();
        return this.articles
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, count);
    }

    // 获取推荐文章（如果有 featured 标记）
    getFeaturedArticles() {
        this.ensureLoaded();
        return this.articles.filter(article => article.featured);
    }

    // 更新文章计数
    updatePostCount() {
        const postCount = document.getElementById('postCount');
        if (postCount) {
            postCount.textContent = this.articles.length;
        }
    }

    // 确保数据已加载
    ensureLoaded() {
        if (!this.isLoaded) {
            throw new Error('文章数据未加载，请先调用 loadPosts() 方法');
        }
    }

    // 重新加载数据
    async reload() {
        this.loadPromise = null;
        this.isLoaded = false;
        return this.loadPosts();
    }

    // 获取加载状态
    getLoadStatus() {
        return {
            isLoaded: this.isLoaded,
            articleCount: this.articles.length
        };
    }
}
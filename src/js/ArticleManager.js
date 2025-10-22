import { ArticleRenderer } from './ArticleRenderer.js';

export default class ArticleManager {
    constructor(eventBus, config) {
        this.articles = [];
        this.isLoaded = false;
        this.loadPromise = null;
        this.eventBus = eventBus;
        this.config = config;
        this.renderer = new ArticleRenderer(config);
    }

    async loadPosts() {
        if (this.loadPromise) {
            return this.loadPromise;
        }

        this.loadPromise = this.fetchArticles();
        return this.loadPromise;
    }

    async fetchArticles() {
        try {
            const response = await fetch(this.config.endpoints.articlesMetadata);
            if (!response.ok) {
                throw new Error(`HTTP error! status: ${response.status}`);
            }

            this.articles = await response.json();
            this.isLoaded = true;

            this.eventBus.emit('articles:loaded', this.articles);

            return this.articles;
        } catch (error) {
            console.error('加载文章数据失败:', error);
            this.eventBus.emit('articles:error', error);
            throw error;
        }
    }

    renderPosts(articles = this.articles) {
        this.renderer.renderPosts(articles);
    }

    getAllArticles() {
        this.ensureLoaded();
        return [...this.articles];
    }

    getArticleById(id) {
        this.ensureLoaded();
        return this.articles.find(article => article.id === id);
    }

    getArticleBySlug(slug) {
        this.ensureLoaded();
        return this.articles.find(article => article.slug === slug);
    }

    getArticlesByCategory(category) {
        this.ensureLoaded();
        return this.articles.filter(article => article.category === category);
    }

    getArticlesByTag(tag) {
        this.ensureLoaded();
        return this.articles.filter(article =>
            article.tags && article.tags.includes(tag)
        );
    }

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

    getAllCategories() {
        this.ensureLoaded();
        const categories = this.articles
            .map(article => article.category)
            .filter(Boolean);
        return [...new Set(categories)];
    }

    getAllTags() {
        this.ensureLoaded();
        const allTags = this.articles
            .filter(article => article.tags)
            .flatMap(article => article.tags);
        return [...new Set(allTags)];
    }

    getLatestArticles(count = this.config.defaults.latestArticlesCount) {
        this.ensureLoaded();
        return this.articles
            .sort((a, b) => new Date(b.date) - new Date(a.date))
            .slice(0, count);
    }

    getFeaturedArticles() {
        this.ensureLoaded();
        return this.articles.filter(article => article.featured);
    }

    ensureLoaded() {
        if (!this.isLoaded) {
            throw new Error('文章数据未加载，请先调用 loadPosts() 方法');
        }
    }

    async reload() {
        this.loadPromise = null;
        this.isLoaded = false;
        return this.loadPosts();
    }

    getLoadStatus() {
        return {
            isLoaded: this.isLoaded,
            articleCount: this.articles.length
        };
    }

    updatePostCount() {
        const postCountElement = document.getElementById(this.config.selectors.postCount);
        if (postCountElement) {
            postCountElement.textContent = this.articles.length;
        }
    }
}
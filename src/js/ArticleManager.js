import { ArticleRenderer } from './ArticleRenderer.js';
import { ArticleUtils } from './ArticleUtils.js';

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

            const data = await response.json();
            // 从返回的数据中提取 posts 数组
            this.articles = data.posts || [];
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

    getArticleBySlug(slug) {
        this.ensureLoaded();
        return ArticleUtils.getArticleBySlug(this.articles, slug);
    }

    getArticlesByCategory(category) {
        this.ensureLoaded();
        return ArticleUtils.getArticlesByCategory(this.articles, category);
    }

    getArticlesByTag(tag) {
        this.ensureLoaded();
        return ArticleUtils.getArticlesByTag(this.articles, tag);
    }

    searchArticles(keyword) {
        this.ensureLoaded();
        return ArticleUtils.searchArticles(this.articles, keyword);
    }

    getAllCategories() {
        this.ensureLoaded();
        return ArticleUtils.getAllCategories(this.articles);
    }

    getAllTags() {
        this.ensureLoaded();
        return ArticleUtils.getAllTags(this.articles);
    }

    getLatestArticles(count = this.config.defaults.latestArticlesCount) {
        this.ensureLoaded();
        return ArticleUtils.getLatestArticles(this.articles, count);
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
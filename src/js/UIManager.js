export class UIManager {
    constructor(eventBus, articleManager, config) {
        this.eventBus = eventBus;
        this.articleManager = articleManager;
        this.config = config;
        this.bindEvents();
    }

    bindEvents() {
        this.eventBus.on('articles:loaded', (articles) => {
            this.onArticlesLoaded(articles);
        });

        this.eventBus.on('articles:error', (error) => {
            this.onArticlesError(error);
        });
    }

    onArticlesLoaded(articles) {
        this.updatePostCount(articles.length);
        this.renderLatestArticles();
        this.renderTagsList();
        this.articleManager.renderPosts(articles);
    }

    onArticlesError(error) {
        const postsList = document.getElementById(this.config.selectors.postsList);
        if (postsList) {
            postsList.innerHTML = '<p class="error">加载文章列表失败，请刷新页面重试。</p>';
        }
    }

    updatePostCount(count) {
        const postCount = document.getElementById(this.config.selectors.postCount);
        if (postCount) {
            postCount.textContent = count;
        }
    }

    renderLatestArticles() {
        const latest = this.articleManager.getLatestArticles();
        const recentSection = document.getElementById(this.config.selectors.recentList);
        const lastUpdated = document.getElementById(this.config.selectors.lastUpdated);

        if (lastUpdated && latest.length > 0) {
            lastUpdated.textContent = latest[0].lastmod;
        }

        if (recentSection) {
            recentSection.innerHTML = latest.map(article => `
                <a href="posts/${article.slug}.html" class="recent-item">${article.title}</a>
            `).join('');
        }
    }

    renderTagsList() {
        const tagsListElement = document.getElementById(this.config.selectors.tagsList);
        if (!tagsListElement) return;

        const allTags = this.articleManager.getAllTags();

        if (allTags.length === 0) {
            tagsListElement.innerHTML = '<p class="no-tags">暂无标签</p>';
            return;
        }

        tagsListElement.innerHTML = allTags.map(tag => {
            return `<button type="button" data-tag="${tag}" class="tag">#${tag}</button>`;
        }).join('');
    }

    initSearch() {
        const searchInput = document.getElementById(this.config.selectors.searchInput);
        const searchBtn = document.getElementById(this.config.selectors.searchBtn);

        if (searchBtn && searchInput) {
            const performSearch = () => {
                const results = this.articleManager.searchArticles(searchInput.value);
                this.displaySearchResults(results);
            };

            searchBtn.addEventListener('click', performSearch);
            searchInput.addEventListener('keypress', (e) => {
                if (e.key === 'Enter') {
                    performSearch();
                }
            });
        }
    }

    displaySearchResults(results) {
        this.articleManager.renderPosts(results);

        const searchResults = document.getElementById(this.config.selectors.searchResults);
        if (searchResults) {
            searchResults.innerHTML = `找到 ${results.length} 篇相关文章`;
        }
    }

    initTagHandlers() {
        const tagsList = document.getElementById(this.config.selectors.tagsList);
        const totalPost = document.getElementById(this.config.selectors.totalPost);

        if (totalPost) {
            totalPost.addEventListener('click', () => {
                this.articleManager.renderPosts(this.articleManager.getAllArticles());
            });
        }

        if (tagsList) {
            tagsList.addEventListener('click', (event) => {
                const target = event.target;
                if (target.classList.contains('tag')) {
                    const tag = target.dataset.tag;
                    const tagArticles = this.articleManager.getArticlesByTag(tag);
                    this.articleManager.renderPosts(tagArticles);
                }
            });
        }
    }
}
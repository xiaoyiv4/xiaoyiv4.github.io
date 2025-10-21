import ArticleManager from './ArticleManager.js';

// 创建全局实例
const articleManager = new ArticleManager();

document.addEventListener('DOMContentLoaded', async function () {
    try {
        // 加载文章并渲染
        await articleManager.loadPosts((articles) => {
            // 回调函数（可选）
            console.log('文章加载完成:', articles.length);

            // 更新文章计数
            articleManager.updatePostCount();
            latestArticles();

            renderTagsList();
            
            // 其他初始化操作...
            initSearch();
            initCategories();
        });

    } catch (error) {
        console.error('初始化失败:', error);
    }
    const tagsList = document.getElementById('tagsList');
    document.getElementById('totalPost').addEventListener('click', () => {
        articleManager.renderPosts(articleManager.getAllArticles());
    });
    tagsList.addEventListener('click', (event) => {
        const target = event.target;
        if (target.classList.contains('tag-link')) {
            const tag = target.dataset.tag;
            // 处理标签点击事件
            const tagItem = articleManager.getArticlesByTag(tag);
            articleManager.renderPosts(tagItem);
        }
    });
});

// 搜索功能示例
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchBtn = document.getElementById('searchBtn');

    if (searchBtn && searchInput) {
        searchBtn.addEventListener('click', () => {
            const results = articleManager.searchArticles(searchInput.value);
            displaySearchResults(results);
        });
    }
}

// 分类功能示例
function initCategories() {
    const categories = articleManager.getAllCategories();
    // 渲染分类菜单...
}

// 显示搜索结果
function displaySearchResults(results) {
    // 使用 articleManager 的 renderPosts 方法渲染结果
    articleManager.renderPosts(results);

    // 或者自定义渲染
    const searchResults = document.getElementById('searchResults');
    if (searchResults) {
        searchResults.innerHTML = `找到 ${results.length} 篇相关文章`;
    }
}
function latestArticles() {
    // 获取最新文章
    const latest = articleManager.getLatestArticles(5);
    const recentSection = document.getElementById('recentList');
    if (recentSection) {
        recentSection.innerHTML = latest.map(article => `
                <a href="posts/${article.slug}.html" class="item">${article.title}</a>
        `).join('');
    }
}


// 渲染标签列表
function renderTagsList() {
    const tagsListElement = document.getElementById('tagsList');
    if (!tagsListElement) return;

    // 根据标签获取文章
    const allTags = articleManager.getAllTags();

    if (allTags.length === 0) {
        tagsListElement.innerHTML = '<p class="no-tags">暂无标签</p>';
        return;
    }

    // 渲染标签列表
    tagsListElement.innerHTML = allTags.map(tag => {
        return `<button data-tag="${tag}" class="tag-link">#${tag}</button>`;
    }).join('');
}

// 在其他地方使用文章数据
function someOtherFunction() {

    // 获取特定文章
    const article = articleManager.getArticleBySlug('my-article-slug');
}
export { loadPosts };

async function loadPosts() {
    try {
        const response = await fetch('/articles-metadata.json');
        const articles = await response.json();

        renderPosts(articles);
    } catch (error) {
        console.error('加载文章数据失败:', error);
        document.getElementById('postsList').innerHTML =
            '<p class="error">加载文章列表失败，请刷新页面重试。</p>';
    }
}

function renderPosts(articles) {
    const postsList = document.getElementById('postsList');

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
                <p class="card-description">${getArticleDescription(article)}</p>
                <div class="card-meta">
                    <span class="publish-date">发表于 ${formatDate(article.date)}</span>
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

function getArticleDescription(article) {
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

function formatDate(dateString) {
    if (!dateString) return '未知日期';

    const date = new Date(dateString);
    if (isNaN(date.getTime())) return '无效日期';

    return date.toLocaleDateString('zh-CN', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
    });
}
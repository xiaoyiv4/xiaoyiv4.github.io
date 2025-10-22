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

        const sortedArticles = this.sortArticlesByDate(articles);
        const postsHTML = this.generatePostsHTML(sortedArticles);

        postsList.innerHTML = postsHTML;
    }

    sortArticlesByDate(articles) {
        return articles.sort((a, b) => {
            return new Date(b.date) - new Date(a.date);
        });
    }

    generatePostsHTML(articles) {
        return articles.map(article => this.generateArticleHTML(article)).join('');
    }

    generateArticleHTML(article) {
        return `
            <div class="card" role="listitem">
                ${article.cover ? this.generateCoverHTML(article) : ''}
                <div class="card-content">
                    <span class="card-title">
                        <a href="posts/${article.slug}.html">${article.title}</a>
                    </span>
                    <p class="card-description">${this.getArticleDescription(article)}</p>
                    <div class="card-meta">
                        <span class="publish-date">发表于 ${this.formatDate(article.date)}</span>
                        <span class="read-time">${article.readTime || '阅读时间未知'}</span>
                    </div>
                    ${article.tags && article.tags.length > 0 ? this.generateTagsHTML(article.tags) : ''}
                </div>
            </div>
        `;
    }

    generateCoverHTML(article) {
        return `
            <div class="card-cover">
                <img src="${article.cover}" alt="${article.title}" loading="lazy">
            </div>
        `;
    }

    generateTagsHTML(tags) {
        return `
            <div class="card-tags">
                ${tags.map(tag => `<span class="tag">${tag}</span>`).join('')}
            </div>
        `;
    }

    getArticleDescription(article) {
        if (article.description) {
            return article.description;
        }

        if (article.excerpt) {
            const plainText = this.extractPlainText(article.excerpt);
            const maxLength = this.config.defaults.descriptionLength;

            return plainText.length > maxLength ?
                plainText.substring(0, maxLength) + '...' : plainText;
        }

        return '暂无描述';
    }

    extractPlainText(excerpt) {
        return excerpt
            .replace(/^## .*\n/, '')
            .replace(/```[\s\S]*?```/g, '')
            .replace(/`[^`]*`/g, '')
            .replace(/#{1,6}\s?/g, '')
            .replace(/\*\*/g, '')
            .replace(/\*/g, '')
            .trim();
    }

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
}
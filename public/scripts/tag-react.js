document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const tagName = urlParams.get('tag');
  const tagTitle = document.getElementById('currentTag');
  const tagPostsList = document.getElementById('tagPostsList');
  const emptyHint = document.getElementById('emptyHint');

  if (!tagName) {
    tagTitle.textContent = '错误：未指定标签';
    emptyHint.hidden = false;
    return;
  }

  // 更新页面标题
  tagTitle.textContent = `标签：${tagName}`;
  document.title = `${tagName} - 标签文章 | 轻量博客`;

  // 确保标签是 React
  if (tagName !== 'React') {
    tagTitle.textContent = '错误：标签不匹配';
    emptyHint.hidden = false;
    return;
  }

  // 静态文章数据（您可以根据需要添加更多文章）
  const articles = [
    {
      id: "react-article-1",
      title: "React 基础教程",
      content: "初学者入门 React 的必备指南...",
      createdAt: "2023-10-12"
    },
    {
      id: "react-article-2",
      title: "React 高级技巧",
      content: "深入讲解 React 的高级特性和最佳实践...",
      createdAt: "2023-10-15"
    }
  ];

  if (articles.length === 0) {
    emptyHint.hidden = false;
    return;
  }

  // 渲染文章列表
  articles.forEach(article => {
    const card = document.createElement('a');
    card.href = `post.html?id=${article.id}`;
    card.className = 'card';
    card.innerHTML = `
      <h3 class="card h3">${article.title}</h3>
      <p class="card p">${article.content.substring(0, 100)}...</p>
      <div class="meta">${new Date(article.createdAt).toLocaleDateString()}</div>
    `;
    tagPostsList.appendChild(card);
  });
});

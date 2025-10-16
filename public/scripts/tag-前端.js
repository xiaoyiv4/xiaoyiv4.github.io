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

  // 确保标签是 前端
  if (tagName !== '前端') {
    tagTitle.textContent = '错误：标签不匹配';
    emptyHint.hidden = false;
    return;
  }

  // 静态文章数据（您可以根据需要添加更多文章）
  const articles = [
    {
      id: "前端-article-1",
      title: "现代前端开发技术趋势",
      content: "探讨2023年最值得关注的前端开发技术和工具...",
      createdAt: "2023-10-01"
    },
    {
      id: "前端-article-2",
      title: "深入理解CSS Grid",
      content: "CSS Grid 布局详解...",
      createdAt: "2023-10-03"
    }
  ];

  if (articles.length === 0) {
    emptyHint.hidden = false;
    return;
  }

  
  // 渲染文章列表
articles.forEach(article => {
  const card = document.createElement('a');
  // 动态生成链接，每篇文章有不同的 ID
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


// ...existing code...
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const tagName = urlParams.get('tag');
  const tagTitle = document.getElementById('currentTag');    // 页面主体的标题
  const headerTag = document.getElementById('tagTitle');     // header 中的 site-sub（可选）
  const tagPostsList = document.getElementById('tagPostsList');
  const emptyHint = document.getElementById('emptyHint');

  if (!tagName) {
    tagTitle.textContent = '错误：未指定标签';
    if (headerTag) headerTag.textContent = '标签文章';
    emptyHint.hidden = false;
    return;
  }

  // 更新页面标题
  tagTitle.textContent = `标签：${tagName}`;
  if (headerTag) headerTag.textContent = `标签：${tagName}`;
  document.title = `${tagName} - 标签文章 | 轻量博客`;

  // 确保标签是 "前端"（严格匹配）
  if (tagName !== '前端') {
    tagTitle.textContent = '错误：标签不匹配';
    emptyHint.hidden = false;
    return;
  }

  // 静态文章数据 —— 注意 url 字段需指向你项目中实际存在的文章页面
  const articles = [
    {
      id: "1",
      title: "现代前端开发技术趋势",
      summary: "探讨2023年最值得关注的前端开发技术和工具",
      url: "post.html?id=1",
      createdAt: "2023-10-01"
    },
    {
      id: "3",
      title: "深入理解CSS Grid",
      summary: "CSS Grid 布局详解",
      url: "post3.html?id=3",
      createdAt: "2023-10-03"
    }
  ];

  if (!articles || articles.length === 0) {
    emptyHint.hidden = false;
    return;
  }

  // 清空并渲染文章列表
  tagPostsList.innerHTML = '';
  articles.forEach(article => {
    const card = document.createElement('a');
    card.href = article.url;
    card.className = 'card';
    card.setAttribute('role', 'listitem');
    card.innerHTML = `
      <h3 class="card-title">${article.title}</h3>
      <p class="card-excerpt">${(article.summary || '').substring(0, 120)}${(article.summary && article.summary.length > 120) ? '...' : ''}</p>
      <div class="meta">${new Date(article.createdAt).toLocaleDateString()}</div>
    `;
    tagPostsList.appendChild(card);
  });

  emptyHint.hidden = true;
});
// ...existing code...
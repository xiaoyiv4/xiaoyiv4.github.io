// ...existing code...
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const tagName = urlParams.get('tag');
  const tagTitle = document.getElementById('currentTag');
  const headerTag = document.getElementById('tagTitle');
  const tagPostsList = document.getElementById('tagPostsList');
  const emptyHint = document.getElementById('emptyHint');

  if (!tagTitle || !tagPostsList || !emptyHint) {
    console.warn('缺少必需的 DOM 元素：currentTag / tagPostsList / emptyHint');
    return;
  }

  if (!tagName) {
    tagTitle.textContent = '错误：未指定标签';
    if (headerTag) headerTag.textContent = '标签文章';
    emptyHint.hidden = false;
    return;
  }

  tagTitle.textContent = `标签：${tagName}`;
  if (headerTag) headerTag.textContent = `标签：${tagName}`;
  document.title = `${tagName} - 标签文章 | 轻量博客`;

  if (tagName !== 'React') {
    tagTitle.textContent = '错误：标签不匹配';
    emptyHint.hidden = false;
    return;
  }

  // 映射到工作区中存在的文章文件（按需调整）
  const articles = [
    {
      id: "1",
      title: "现代前端开发技术趋势",
      summary: "探讨2023年最值得关注的前端开发技术和工具",
      url: "post.html?id=1",
      createdAt: "2023-10-01"
    }
  ];

  if (!articles.length) {
    emptyHint.hidden = false;
    return;
  }

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
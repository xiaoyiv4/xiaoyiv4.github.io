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

  if (tagName !== '基础') {
    tagTitle.textContent = '错误：标签不匹配';
    emptyHint.hidden = false;
    return;
  }

  // 指向工作区中存在的文章文件（按需调整）
  const articles = [
    {
      id: "2",
      title: "JavaScript 编程基础",
      summary: "JavaScript 编程基础教程",
      url: "post2.html?id=2",
      createdAt: "2023-10-02"
    },
    {
      id: "3",
      title: "深入理解CSS Grid",
      summary: "CSS Grid 布局详解",
      url: "post3.html?id=3",
      createdAt: "2023-10-03"
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
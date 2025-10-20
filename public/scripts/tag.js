// ...existing code...
document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const tagName = urlParams.get('tag');
  const tagTitle = document.getElementById('currentTag');
  const tagPostsList = document.getElementById('tagPostsList');
  const emptyHint = document.getElementById('emptyHint');

  if (!tagTitle || !tagPostsList || !emptyHint) {
    console.warn('tag 页面缺少必要元素');
    return;
  }

  if (!tagName) {
    tagTitle.textContent = '错误：未指定标签';
    emptyHint.hidden = false;
    return;
  }

  tagTitle.textContent = `标签：${tagName}`;
  document.title = `${tagName} - 标签文章 | 轻量博客`;

  // 从 localStorage 读取文章（兼容静态场景：若没有 localStorage，则可以扩展为 fetch JSON）
  let posts = [];
  try {
    posts = JSON.parse(localStorage.getItem('posts') || '[]');
  } catch (e) {
    posts = [];
  }

  const filtered = posts.filter(p => Array.isArray(p.tags) && p.tags.includes(tagName));

  // 如果没有本地文章，尝试用静态映射（映射到你的静态 post 文件）
  const staticMap = {
    '前端': [
      { id: '1', title: '现代前端开发技术趋势', summary: '探讨2023年最值得关注的前端开发技术和工具', url: 'post.html?id=1', createdAt: '2023-10-01' },
      { id: '3', title: '深入理解CSS Grid', summary: 'CSS Grid 布局详解', url: 'post3.html?id=3', createdAt: '2023-10-03' }
    ],
    'JavaScript': [
      { id: '2', title: 'JavaScript 编程基础', summary: 'JavaScript 编程基础教程', url: 'post2.html?id=2', createdAt: '2023-10-02' },
      { id: '1', title: '现代前端开发技术趋势', summary: '探讨前端技术', url: 'post.html?id=1', createdAt: '2023-10-01' }
    ],
    '编程': [
      { id: '4', title: '编程的含义', summary: '编程的意义与思考', url: 'post4.html?id=4', createdAt: '2023-10-03' }
    ],
    '基础': [
      { id: '2', title: 'JavaScript 编程基础', summary: 'JavaScript 编程基础教程', url: 'post2.html?id=2', createdAt: '2023-10-02' }
    ]
  };

  const articles = filtered.length > 0 ? filtered : (staticMap[tagName] || []);

  tagPostsList.innerHTML = ''; // 清空旧列表

  if (!articles || articles.length === 0) {
    emptyHint.hidden = false;
    return;
  }
  emptyHint.hidden = true;

  articles.forEach(article => {
    const a = document.createElement('a');
    a.className = 'card';
    a.href = article.url || (`post.html?id=${article.id}`);
    a.dataset.ajax = "1"; // 标记为可被 AJAX 加载（若主页脚本使用 data-ajax）
    // 内部使用语义化元素
    const h = document.createElement('h3');
    h.className = 'card-title';
    h.textContent = article.title || '无标题';

    const p = document.createElement('p');
    p.className = 'card-excerpt';
    p.textContent = article.summary ? article.summary.substring(0, 200) : '';

    const meta = document.createElement('div');
    meta.className = 'meta';
    const date = article.createdAt ? new Date(article.createdAt).toLocaleDateString() : '';
    meta.textContent = date;

    a.appendChild(h);
    a.appendChild(p);
    a.appendChild(meta);

    tagPostsList.appendChild(a);
  });
});
// ...existing code...
document.addEventListener('DOMContentLoaded', () => {
  // 获取 URL 参数并提取标签名称
  const urlParams = new URLSearchParams(window.location.search);
  const tagName = urlParams.get('tag');
  // 获取页面上显示当前标签的元素
  const tagTitle = document.getElementById('currentTag');
  // 获取页面上显示标签文章列表的元素
  const tagPostsList = document.getElementById('tagPostsList');
  // 获取页面上显示空列表提示的元素
  const emptyHint = document.getElementById('emptyHint');

  // 如果未指定标签，显示错误信息并隐藏文章列表，结束函数
  if (!tagName) {
    tagTitle.textContent = '错误：未指定标签';
    emptyHint.hidden = false;
    return;
  }

  // 更新页面标题以显示当前标签
  tagTitle.textContent = `标签：${tagName}`;
  document.title = `${tagName} - 标签文章 | 轻量博客`;

  // 如果标签不是“编程”，显示错误信息并隐藏文章列表，结束函数
  if (tagName !== '编程') {
    tagTitle.textContent = '错误：标签不匹配';
    emptyHint.hidden = false;
    return;
  }

  // 静态文章数据（您可以根据需要添加更多文章）
  const articles = [
    {
      id: "编程-article-1",
      title: "现代前端开发技术趋势",
      content: "探讨2023年最值得关注的前端开发技术和工具...",
      createdAt: "2023-10-01"
    },
    {
      id: "编程-article-2",
      title: "JavaScript 编程基础",
      content: "JavaScript 编程基础教程...",
      createdAt: "2023-10-02"
    },
    {
      id: "编程-article-3",
      title: "编程的含义",
      content: "编程",
      createdAt: "2023-10-04"
    }
  ];

  // 如果没有文章，显示空列表提示并结束函数
  if (articles.length === 0) {
    emptyHint.hidden = false;
    return;
  }

  // 根据文章数据渲染文章列表
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

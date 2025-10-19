document.addEventListener('DOMContentLoaded', () => {
  const urlParams = new URLSearchParams(window.location.search);
  const tagName = urlParams.get('tag');
  const tagTitle = document.getElementById('currentTag');
  const tagPostsList = document.getElementById('tagPostsList');
  const emptyHint = document.getElementById('emptyHint');

  // 如果没有提供标签名称，显示错误信息
  if (!tagName) {
    tagTitle.textContent = '错误：未指定标签';
    emptyHint.hidden = false;
    return;
  }

  // 更新页面标题和标签名
  tagTitle.textContent = `标签：${tagName}`;
  document.title = `${tagName} - 标签文章 | 轻量博客`;

  // 从本地存储加载文章
  const posts = JSON.parse(localStorage.getItem('posts')) || [];
  const filteredPosts = posts.filter(post => 
    post.tags && post.tags.includes(tagName)
  );

  // 如果没有相关文章，显示提示信息
  if (filteredPosts.length === 0) {
    emptyHint.hidden = false;
    return;
  }

  // 渲染文章列表
  filteredPosts.forEach(post => {
    const card = document.createElement('a');
    card.href = `post.html?id=${post.id}`;
    card.className = 'card';
    card.innerHTML = `
      <h3 class="card h3">${post.title}</h3>
      <p class="card p">${post.content.substring(0, 100)}...</p>
      <div class="meta">${new Date(post.createdAt).toLocaleDateString()}</div>
    `;
    tagPostsList.appendChild(card);
  });
});

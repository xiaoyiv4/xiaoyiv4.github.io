// public/scripts/read.js

/**
 * 安全获取URL参数
 * @param {string} name - 参数名
 * @returns {string|null} 参数值
 */
function getUrlParam(name) {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  } catch (e) {
    console.error('解析URL参数失败:', e);
    return null;
  }
}

/**
 * 增强版Markdown转换
 * @param {string} text - Markdown文本
 * @returns {string} HTML字符串
 */
function simpleMarkdownToHTML(text) {
  if (!text) return '';
  
  return text
    .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^\* (.*$)/gm, '<li>$1</li>')
    .replace(/^(\d+)\. (.*$)/gm, '<li>$2</li>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

/**
 * 渲染文章内容
 */
function renderPost() {
  const readRoot = document.getElementById('readRoot');
  if (!readRoot) return; // 防止在非文章页执行

  try {
    const postId = getUrlParam('id');
    if (!postId) throw new Error('缺少文章ID参数');

    const posts = JSON.parse(localStorage.getItem('posts')) || [];
    const post = posts.find(p => p.id === postId);
    if (!post) throw new Error('文章不存在');

    // 渲染元数据
    document.getElementById('rTitle').textContent = post.title;
    
    const metaText = `发表于 ${new Date(post.createdAt).toLocaleDateString()} • 最后更新 ${new Date(post.updatedAt).toLocaleDateString()}`;
    document.getElementById('rMeta').textContent = metaText;
    
    // 渲染标签
    const tagsContainer = document.getElementById('rTags');
    tagsContainer.innerHTML = post.tags.map(tag => 
      `<span class="tag" data-tag="${tag}">#${tag}</span>`
    ).join(' ');

    // 渲染内容
    document.getElementById('rContent').innerHTML = simpleMarkdownToHTML(post.content);

    // 添加标签点击事件
    tagsContainer.querySelectorAll('.tag').forEach(tag => {
      tag.addEventListener('click', () => {
        window.location.href = `../index.html?tag=${tag.dataset.tag}`;
      });
    });

  } catch (error) {
    console.error('渲染文章失败:', error);
    readRoot.innerHTML = `
      <div class="error">
        <p>${error.message}</p>
        <a href="../index.html"><button class="btn">返回文章列表</button></a>
      </div>
    `;
  }
}

// 页面加载时执行
document.addEventListener('DOMContentLoaded', renderPost);

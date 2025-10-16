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
    console.error(`解析URL参数失败: ${e.message}`);
    return ''; // 返回空字符串而非 null
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
    .replace(/^#### (.*$)/gm, '<h4>\$1</h4>')
    .replace(/^### (.*$)/gm, '<h3>\$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>\$1</h2>')
    .replace(/^\* (.*$)/gm, '<ul><li>\$1</li></ul>')  // 包装无序列表
    .replace(/^(\d+)\. (.*$)/gm, '<ol><li>\$2</li></ol>')  // 包装有序列表
    .replace(/`([^`]+)`/g, '<code>\$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>\$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>\$1</em>')
    .replace(/\n/g, '<br>');
}

/**
 * 渲染文章元数据
 * @param {Object} post 文章对象
 */
function renderMeta(post) {
  const metaEl = document.getElementById('rMeta');
  const metaText = `发表于 ${new Date(post.createdAt).toLocaleDateString()} • 最后更新 ${new Date(post.updatedAt).toLocaleDateString()}`;
  metaEl.textContent = metaText;
}

/**
 * 渲染文章标签
 * @param {Array} tags 标签数组
 */
function renderTags(tags) {
  const tagsEl = document.getElementById('rTags');
  tagsEl.innerHTML = tags.map(tag =>
    `<span class="tag">#${tag}</span>`
  ).join(' ');
}

/**
 * 渲染文章内容
 * @param {string} content 文章内容
 */
function renderContent(content) {
  const contentEl = document.getElementById('rContent');
  contentEl.innerHTML = simpleMarkdownToHTML(content);
}

/**
 * 渲染文章页面
 */
function renderPost() {
  console.log('---开始渲染---');
  
  const readRoot = document.getElementById('readRoot');
  if (!readRoot) {
    console.log('不在文章阅读页，跳过渲染');
    return;
  }

  try {
    const postId = getUrlParam('id');
    if (!postId) throw new Error('缺少文章ID参数');

    const posts = JSON.parse(localStorage.getItem('posts')) || [];
    const post = posts.find(p => p.id === postId);
    if (!post) throw new Error('文章不存在');

    const titleEl = document.getElementById('rTitle');
    if (!titleEl) throw new Error('文章标题元素未找到');
    titleEl.textContent = post.title;

    renderMeta(post);
    renderTags(post.tags);
    renderContent(post.content);
    
    console.log('---渲染完成---');

  } catch (error) {
    console.error('渲染文章失败:', error);
    const readRoot = document.getElementById('readRoot');
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

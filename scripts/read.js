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
  console.log('---开始渲染---'); // 调试日志
  
  const readRoot = document.getElementById('readRoot');
  if (!readRoot) {
    console.log('不在文章阅读页，跳过渲染');
    return;
  }

  try {
    // 获取文章ID
    const postId = getUrlParam('id');
    console.log('获取到的文章ID:', postId);
    if (!postId) throw new Error('缺少文章ID参数');

    // 加载文章数据
    const posts = JSON.parse(localStorage.getItem('posts')) || [];
    console.log('本地文章数据:', posts);
    const post = posts.find(p => p.id === postId);
    if (!post) throw new Error('文章不存在');
    console.log('匹配到的文章:', post);

    // 检查DOM元素
    const titleEl = document.getElementById('rTitle');
    const metaEl = document.getElementById('rMeta');
    const tagsEl = document.getElementById('rTags');
    const contentEl = document.getElementById('rContent');
    
    if (!titleEl || !metaEl || !tagsEl || !contentEl) {
      throw new Error('页面元素加载失败');
    }

    // 渲染元数据
    titleEl.textContent = post.title;
    
    const metaText = `发表于 ${new Date(post.createdAt).toLocaleDateString()} • 最后更新 ${new Date(post.updatedAt).toLocaleDateString()}`;
    metaEl.textContent = metaText;
    
    // 渲染标签
    tagsEl.innerHTML = post.tags.map(tag => 
      `<span class="tag" data-tag="${tag}">#${tag}</span>`
    ).join(' ');

    // 渲染内容
    contentEl.innerHTML = simpleMarkdownToHTML(post.content);

    // 添加标签点击事件
    tagsEl.querySelectorAll('.tag').forEach(tag => {
      tag.addEventListener('click', () => {
        window.location.href = `../index.html?tag=${tag.dataset.tag}`;
      });
    });

    console.log('---渲染完成---');

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

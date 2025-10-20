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
    return '';
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
    .replace(/^# (.*$)/gm, '<h1>$1</h1>')
    .replace(/^\* (.*$)/gm, '<ul><li>$1</li></ul>')
    .replace(/^- (.*$)/gm, '<ul><li>$1</li></ul>')
    .replace(/^(\d+)\. (.*$)/gm, '<ol><li>$2</li></ol>')
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/!\[(.*?)\]\((.*?)\)/g, '<img alt="$1" src="$2" />')
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2">$1</a>')
    .replace(/\n/g, '<br>');
}

/**
 * 从URL加载Markdown文件
 * @param {string} url - Markdown文件URL
 * @returns {Promise<string>} Markdown内容
 */
async function loadMarkdownFromUrl(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error('加载Markdown文件失败:', error);
    throw new Error(`无法加载文章内容: ${error.message}`);
  }
}

/**
 * 从文章数据URL加载文章信息
 * @param {string} url - 文章数据JSON URL
 * @returns {Promise<Object>} 文章数据
 */
async function loadPostDataFromUrl(url) {
  try {
    const response = await fetch(url);
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return await response.json();
  } catch (error) {
    console.error('加载文章数据失败:', error);
    throw new Error(`无法加载文章信息: ${error.message}`);
  }
}

/**
 * 渲染文章元数据
 * @param {Object} post 文章对象
 */
function renderMeta(post) {
  const metaEl = document.getElementById('rMeta');
  if (metaEl && post.createdAt) {
    const metaText = `发表于 ${new Date(post.createdAt).toLocaleDateString()}${post.updatedAt ? ` • 最后更新 ${new Date(post.updatedAt).toLocaleDateString()}` : ''
      }`;
    metaEl.textContent = metaText;
  }
}

/**
 * 渲染文章标题
 * @param {string} title 文章标题
 */
function renderTitle(title) {
  const titleEl = document.getElementById('rTitle');
  if (titleEl) {
    titleEl.textContent = title;
  }
  // 同时设置页面标题
  document.title = `${title} - 我的博客`;
}

/**
 * 渲染文章标签
 * @param {Array} tags 标签数组
 */
function renderTags(tags) {
  const tagsEl = document.getElementById('rTags');
  if (tagsEl && tags && tags.length > 0) {
    tagsEl.innerHTML = tags.map(tag =>
      `<span class="tag">#${tag}</span>`
    ).join(' ');
  }
}

/**
 * 渲染文章内容
 * @param {string} content 文章内容
 */
function renderContent(content) {
  const contentEl = document.getElementById('rContent');
  if (contentEl) {
    contentEl.innerHTML = simpleMarkdownToHTML(content);
  }
}

/**
 * 显示加载状态
 */
function showLoading() {
  const contentEl = document.getElementById('rContent');
  if (contentEl) {
    contentEl.innerHTML = '<div class="loading">加载中...</div>';
  }
}

/**
 * 显示错误信息
 * @param {string} message 错误信息
 */
function showError(message) {
  const readRoot = document.getElementById('readRoot');
  if (readRoot) {
    readRoot.innerHTML = `
      <div class="error">
        <h2>加载失败</h2>
        <p>${message}</p>
        <a href="../index.html"><button class="btn">返回文章列表</button></a>
      </div>
    `;
  }
}

/**
 * 渲染文章页面 - 支持多种数据源
 */
async function renderPost() {
  console.log('---开始渲染文章---');

  const readRoot = document.getElementById('readRoot');
  if (!readRoot) {
    console.log('不在文章阅读页，跳过渲染');
    return;
  }

  try {
    // 方式1: 通过文章ID从API获取
    const postId = getUrlParam('id');
    // 方式2: 直接指定Markdown文件URL
    const mdUrl = getUrlParam('md');
    // 方式3: 通过文章数据URL获取完整信息
    const dataUrl = getUrlParam('data');

    let postData = {};
    let markdownContent = '';

    showLoading();

    if (dataUrl) {
      // 从数据URL加载完整文章信息
      console.log('从数据URL加载:', dataUrl);
      postData = await loadPostDataFromUrl(dataUrl);
      if (postData.contentUrl) {
        markdownContent = await loadMarkdownFromUrl(postData.contentUrl);
      } else if (postData.content) {
        markdownContent = postData.content;
      }
    } else if (mdUrl) {
      // 直接加载Markdown文件
      console.log('直接加载Markdown文件:', mdUrl);
      markdownContent = await loadMarkdownFromUrl(mdUrl);
      // 从Markdown中提取标题（第一行作为标题）
      const lines = markdownContent.split('\n');
      if (lines[0].startsWith('# ')) {
        postData.title = lines[0].replace('# ', '').trim();
        markdownContent = lines.slice(1).join('\n');
      } else {
        postData.title = '未命名文章';
      }
    } else if (postId) {
      // 从API根据ID获取文章（需要你实现后端API）
      const apiUrl = `/api/posts/${postId}`;
      postData = await loadPostDataFromUrl(apiUrl);
      if (postData.contentUrl) {
        markdownContent = await loadMarkdownFromUrl(postData.contentUrl);
      } else if (postData.content) {
        markdownContent = postData.content;
      }
    } else {
      throw new Error('请提供文章ID、Markdown文件URL或数据URL');
    }

    // 渲染文章
    renderTitle(postData.title || '未命名文章');
    renderMeta(postData);
    renderTags(postData.tags || []);
    renderContent(markdownContent);

    console.log('---文章渲染完成---');

  } catch (error) {
    console.error('渲染文章失败:', error);
    showError(error.message);
  }
}

// 页面加载时执行
document.addEventListener('DOMContentLoaded', renderPost);
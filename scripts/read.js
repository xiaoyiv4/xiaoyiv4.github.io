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
    .replace(/\[(.*?)\]\((.*?)\)/g, '<a href="$2" target="_blank">$1</a>')
    .replace(/\n\n/g, '</p><p>')
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
      throw new Error(`HTTP错误! 状态: ${response.status}`);
    }
    return await response.text();
  } catch (error) {
    console.error('加载Markdown文件失败:', error);
    throw new Error(`无法加载文章内容: ${error.message}`);
  }
}

/**
 * 渲染文章内容到页面
 * @param {string} markdownContent - Markdown内容
 * @param {Object} postInfo - 文章信息（从卡片获取）
 */
function renderArticle(markdownContent, postInfo = {}) {
  const mainCol = document.querySelector('.main-col');
  if (!mainCol) {
    throw new Error('找不到主要内容区域');
  }

  // 从Markdown中提取标题（如果第一行是标题）
  let title = postInfo.title || '未命名文章';
  let content = markdownContent;

  const lines = markdownContent.split('\n');
  if (lines[0].startsWith('# ')) {
    title = lines[0].replace('# ', '').trim();
    content = lines.slice(1).join('\n');
  }

  // 生成文章HTML
  const articleHTML = `
    <article class="post-article">
      <header class="article-header">
        <h1 class="article-title">${title}</h1>
        ${postInfo.meta ? `<div class="article-meta">${postInfo.meta}</div>` : ''}
        ${postInfo.tags ? `<div class="article-tags">${postInfo.tags}</div>` : ''}
      </header>
      <div class="article-content">
        ${simpleMarkdownToHTML(content)}
      </div>
      <footer class="article-footer">
        <button id="backToList" class="btn btn-secondary">返回列表</button>
      </footer>
    </article>
  `;

  // 替换内容
  mainCol.innerHTML = articleHTML;

  // 添加返回按钮事件
  const backButton = document.getElementById('backToList');
  if (backButton) {
    backButton.addEventListener('click', showArticleList);
  }

  // 更新页面标题
  document.title = `${title} - 我的博客`;
}

/**
 * 显示文章列表（恢复原始状态）
 */
function showArticleList() {
  const mainCol = document.querySelector('.main-col');
  if (mainCol) {
    // 这里可以重新加载文章列表，或者使用history.back()
    window.history.back();
  }
}

/**
 * 显示加载状态
 */
function showLoading() {
  const mainCol = document.querySelector('.main-col');
  if (mainCol) {
    mainCol.innerHTML = `
      <div class="loading">
        <div class="spinner"></div>
        <p>加载中...</p>
      </div>
    `;
  }
}

/**
 * 显示错误信息
 * @param {string} message 错误信息
 */
function showError(message) {
  const mainCol = document.querySelector('.main-col');
  if (mainCol) {
    mainCol.innerHTML = `
      <div class="error">
        <h2>加载失败</h2>
        <p>${message}</p>
        <button id="backToList" class="btn">返回列表</button>
      </div>
    `;

    // 添加返回按钮事件
    const backButton = document.getElementById('backToList');
    if (backButton) {
      backButton.addEventListener('click', showArticleList);
    }
  }
}

/**
 * 处理文章链接点击事件
 * @param {Event} event - 点击事件
 */
async function handleArticleClick(event) {
  // 阻止默认跳转行为
  event.preventDefault();

  const link = event.target.closest('a.post-link');
  if (!link) return;

  const mdUrl = link.getAttribute('href');
  if (!mdUrl) return;

  try {
    // 获取文章卡片信息
    const card = link.closest('.card');
    const postInfo = {
      title: link.textContent.trim(),
      meta: card.querySelector('.card-meta')?.innerHTML || '',
      tags: card.querySelector('.card-tags')?.innerHTML || ''
    };

    console.log('加载文章:', mdUrl);

    // 显示加载状态
    showLoading();

    // 加载Markdown内容
    const markdownContent = await loadMarkdownFromUrl(mdUrl);

    // 渲染文章
    renderArticle(markdownContent, postInfo);

    // 更新URL（不刷新页面）
    const newUrl = `${window.location.pathname}?article=${encodeURIComponent(mdUrl)}`;
    window.history.pushState({ article: mdUrl }, '', newUrl);

  } catch (error) {
    console.error('加载文章失败:', error);
    showError(error.message);
  }
}

/**
 * 从URL参数加载文章（页面刷新或直接访问时）
 */
async function loadArticleFromUrl() {
  const articleParam = getUrlParam('article');
  if (!articleParam) return;

  try {
    showLoading();
    const markdownContent = await loadMarkdownFromUrl(articleParam);
    renderArticle(markdownContent);
  } catch (error) {
    console.error('从URL加载文章失败:', error);
    showError(error.message);
  }
}

/**
 * 初始化事件监听
 */
function initEventListeners() {
  // 监听文章链接点击
  document.addEventListener('click', handleArticleClick);

  // 监听浏览器前进后退
  window.addEventListener('popstate', function (event) {
    const articleParam = getUrlParam('article');
    if (articleParam) {
      loadArticleFromUrl();
    } else {
      // 返回列表页，刷新页面或重新加载列表
      location.reload();
    }
  });
}

/**
 * 初始化函数
 */
function init() {
  console.log('---初始化文章阅读功能---');

  // 检查是否直接访问文章URL
  const articleParam = getUrlParam('article');
  if (articleParam) {
    loadArticleFromUrl();
  }

  // 初始化事件监听
  initEventListeners();
}

// 页面加载时初始化
document.addEventListener('DOMContentLoaded', init);
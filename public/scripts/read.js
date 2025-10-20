// ...existing code...
/**
 * 覆盖并增强 read.js：优先从 localStorage 读取文章，找不到时回退到抓取静态 post*.html
 */

function getUrlParam(name) {
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get(name);
  } catch (e) {
    console.error(`解析URL参数失败: ${e.message}`);
    return null;
  }
}

function simpleMarkdownToHTML(text) {
  if (!text) return '';
  return text
    .replace(/^#### (.*$)/gm, '<h4>$1</h4>')
    .replace(/^### (.*$)/gm, '<h3>$1</h3>')
    .replace(/^## (.*$)/gm, '<h2>$1</h2>')
    .replace(/^\* (.*$)/gm, '<li>$1</li>')             // 先转换为 <li>
    .replace(/(\n<li>.*?<\/li>)+/gs, (m) => {           // 把连续的 <li> 包成一个 <ul>
      return '<ul>' + m.replace(/\n/g, '') + '</ul>';
    })
    .replace(/^(\d+)\. (.*$)/gm, '<li>$2</li>')        // 有序 list -> li
    .replace(/(\n<li>.*?<\/li>)+/gs, (m) => {          // 包成 <ol>（上面的简单实现会混用，若需完整 md 建议引入库）
      // 简单判断：若行以数字开头则视为 ol（此处为兼容性处理，实际场景推荐用 markdown 库）
      return '<ol>' + m.replace(/\n/g, '') + '</ol>';
    })
    .replace(/`([^`]+)`/g, '<code>$1</code>')
    .replace(/\*\*([^*]+)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+)\*/g, '<em>$1</em>')
    .replace(/\n/g, '<br>');
}

function renderMeta(post) {
  const metaEl = document.getElementById('rMeta');
  if (!metaEl) return;
  const created = post.createdAt ? new Date(post.createdAt).toLocaleDateString() : '';
  const updated = post.updatedAt ? new Date(post.updatedAt).toLocaleDateString() : created;
  metaEl.textContent = `发表于 ${created} • 最后更新 ${updated}`;
}

function renderTags(tags) {
  const tagsEl = document.getElementById('rTags');
  if (!tagsEl) return;
  if (!Array.isArray(tags) || tags.length === 0) {
    tagsEl.innerHTML = '';
    return;
  }
  tagsEl.innerHTML = tags.map(tag => `<span class="tag">#${tag}</span>`).join(' ');
}

function renderContentFromHtml(html) {
  const contentEl = document.getElementById('rContent');
  if (!contentEl) return;
  contentEl.innerHTML = html;
}

function renderContentFromMarkdown(md) {
  const contentEl = document.getElementById('rContent');
  if (!contentEl) return;
  contentEl.innerHTML = simpleMarkdownToHTML(md);
}

async function fetchStaticPostHtml(id) {
  // 映射现有静态文件名（按你的工作区文件名）
  const map = {
    '1': 'post.html',
    '2': 'post2.html',
    '3': 'post3.html',
    '4': 'post4.html'
  };
  const filename = map[id];
  if (!filename) throw new Error('未找到对应的静态文章文件');
  const res = await fetch(`../${filename}`, { credentials: 'same-origin' });
  if (!res.ok) throw new Error(`静态文章获取失败: ${res.status}`);
  const text = await res.text();
  // 解析 HTML，取 <main class="post-container"> 或 article.post-content
  const parser = new DOMParser();
  const doc = parser.parseFromString(text, 'text/html');
  const mainNode = doc.querySelector('main.post-container') || doc.querySelector('.post-container') || doc.querySelector('article') || doc.querySelector('main');
  const title = doc.querySelector('.post-title') ? doc.querySelector('.post-title').textContent : (doc.querySelector('title') ? doc.querySelector('title').textContent : '');
  const tagsNode = doc.querySelector('.post-tags');
  const tags = tagsNode ? Array.from(tagsNode.querySelectorAll('.tag')).map(t => t.textContent.replace(/^#/, '')) : [];
  const createdMeta = doc.querySelector('.post-meta') ? doc.querySelector('.post-meta').textContent : '';
  return { mainNode, title, tags, createdMeta, htmlText: text };
}

async function renderPost() {
  const readRoot = document.getElementById('readRoot');
  if (!readRoot) return; // 不在阅读页，结束

  try {
    const id = getUrlParam('id');
    if (!id) throw new Error('缺少文章 id');

    // 先从 localStorage 尝试读取 posts 数据
    let posts = [];
    try {
      posts = JSON.parse(localStorage.getItem('posts') || '[]');
    } catch (e) {
      posts = [];
    }
    const post = posts.find(p => String(p.id) === String(id));

    if (post) {
      const titleEl = document.getElementById('rTitle');
      if (titleEl) titleEl.textContent = post.title || '文章';
      renderMeta(post);
      renderTags(post.tags || []);
      // 判断内容格式：若以 HTML 标签开头则作为 HTML，否则当做 Markdown
      if (/<\/?[a-z][\s\S]*>/i.test(post.content || '')) {
        renderContentFromHtml(post.content || '');
      } else {
        renderContentFromMarkdown(post.content || '');
      }
      return;
    }

    // localStorage 中没有，回退到抓取静态 post 文件
    const staticPost = await fetchStaticPostHtml(id);
    // 插入内容：如果拿到了 mainNode，直接把 innerHTML 注入 rContent（保留样式链接在 head）
    const titleEl = document.getElementById('rTitle');
    if (titleEl && staticPost.title) titleEl.textContent = staticPost.title;
    // 如果 staticPost.mainNode 存在，取其中的 .post-content 内容或整个 main 的 innerHTML
    if (staticPost.mainNode) {
      const contentNode = staticPost.mainNode.querySelector('.post-content') || staticPost.mainNode;
      renderContentFromHtml(contentNode.innerHTML);
      // 解析并渲染元信息（尝试从 .post-meta）
      const metaText = staticPost.mainNode.querySelector('.post-meta') ? staticPost.mainNode.querySelector('.post-meta').textContent : '';
      const metaEl = document.getElementById('rMeta');
      if (metaEl) metaEl.textContent = metaText;
      renderTags(staticPost.tags || []);
    } else {
      // 兜底：显示整个 fetched HTML（不推荐）
      renderContentFromHtml(staticPost.htmlText);
    }
  } catch (err) {
    console.error('渲染文章失败:', err);
    const readRootEl = document.getElementById('readRoot');
    if (readRootEl) {
      readRootEl.innerHTML = `
        <div class="error">
          <p>${err.message}</p>
          <a href="../index.html"><button class="btn">返回文章列表</button></a>
        </div>
      `;
    }
  }
}

document.addEventListener('DOMContentLoaded', renderPost);
// ...existing code...
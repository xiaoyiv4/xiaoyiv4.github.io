// read.js
document.addEventListener('DOMContentLoaded', () => {
  const rTitle = document.getElementById('rTitle');
  const rMeta = document.getElementById('rMeta');
  const rTags = document.getElementById('rTags');
  const rContent = document.getElementById('rContent');

  // 示例数据
  const articleData = {
    title: '示例文章',
    meta: '作者: 小毅 | 日期: 2023-10-01',
    tags: ['技术', '生活'],
    content: '这里是示例文章的内容。'
  };

  rTitle.textContent = articleData.title;
  rMeta.textContent = articleData.meta;
  rTags.innerHTML = articleData.tags.map(tag => `<span class="tag">${tag}</span>`).join(' ');
  rContent.textContent = articleData.content;
});

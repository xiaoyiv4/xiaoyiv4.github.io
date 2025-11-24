import fs from 'fs/promises';
import path from 'path';

async function copyDir(src, dest) {
  await fs.mkdir(dest, { recursive: true });
  const entries = await fs.readdir(src, { withFileTypes: true });

  for (const entry of entries) {
    const srcPath = path.join(src, entry.name);
    const destPath = path.join(dest, entry.name);

    if (entry.isDirectory()) {
      await copyDir(srcPath, destPath);
    } else if (entry.isFile()) {
      try {
        await fs.copyFile(srcPath, destPath);
      } catch (err) {
        console.warn(`⚠️ 复制文件失败: ${srcPath} -> ${destPath}`, err.message);
      }
    }
  }
}

export async function syncStatic() {
  const cwd = process.cwd();
  const srcStyles = path.join(cwd, 'src', 'styles');
  const srcJs = path.join(cwd, 'src', 'js');
  const publicStyles = path.join(cwd, 'public', 'styles');
  const publicJs = path.join(cwd, 'public', 'js');

  // 仅在源目录存在时复制
  const copyTasks = [];
  try { await fs.access(srcStyles); copyTasks.push(copyDir(srcStyles, publicStyles)); } catch (err) { /* ignore */ }
  try { await fs.access(srcJs); copyTasks.push(copyDir(srcJs, publicJs)); } catch (err) { /* ignore */ }

  if (copyTasks.length === 0) {
    console.log('ℹ️ 没有找到需要同步的静态资源 (src/styles 或 src/js)');
    return { copied: 0 };
  }

  try {
    await Promise.all(copyTasks);
    console.log('✅ 静态资源同步到 public/ 完成');
    return { copied: copyTasks.length };
  } catch (error) {
    console.error('❌ 静态资源同步失败:', error.message);
    throw error;
  }
}

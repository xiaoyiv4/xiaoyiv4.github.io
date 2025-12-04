import path from 'path';
import { copyDir, pathExists } from './fsUtils.js';
import logger from './logger.js';

export async function syncStatic() {
  const cwd = process.cwd();
  const srcStyles = path.join(cwd, 'src', 'styles');
  const srcJs = path.join(cwd, 'src', 'js');
  const publicStyles = path.join(cwd, 'public', 'styles');
  const publicJs = path.join(cwd, 'public', 'js');

  // 仅在源目录存在时复制
  const copyTasks = [];
  if (await pathExists(srcStyles)) copyTasks.push(copyDir(srcStyles, publicStyles));
  if (await pathExists(srcJs)) copyTasks.push(copyDir(srcJs, publicJs));

  if (copyTasks.length === 0) {
    logger.info('没有找到需要同步的静态资源 (src/styles 或 src/js)');
    return { copied: 0 };
  }

  try {
    await Promise.all(copyTasks);
    logger.info('静态资源同步到 public/ 完成');
    return { copied: copyTasks.length };
  } catch (error) {
    logger.error('静态资源同步失败:', error.message);
    throw error;
  }
}

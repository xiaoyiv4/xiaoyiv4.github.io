import path from 'path';
import { copyDir, ensureDir, pathExists } from './fsUtils.js';
import logger from './logger.js';

async function main() {
  try {
    const cwd = process.cwd();
    const publicDir = path.join(cwd, 'public');
    const distDir = path.join(cwd, 'dist');

    // 确保 dist 目录存在
    await ensureDir(distDir);

    // 检查 public 是否存在
    if (!await pathExists(publicDir)) {
      logger.error('public 目录不存在，无法复制到 dist');
      process.exit(1);
    }

    logger.info('正在将 public/ 内容复制到 dist/ ...');
    await copyDir(publicDir, distDir);
    logger.info('public -> dist 复制完成');
  } catch (error) {
    logger.error('复制 public 到 dist 失败:', error.message);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

export default main;

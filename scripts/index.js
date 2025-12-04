import { generateMetadata, generatePosts, PostGenerator } from './generators/index.js';
import { validateConfig, loadConfig } from './config/index.js';
import { syncStatic } from './utils/syncStatic.js';
import logger from './utils/logger.js';

export async function generateBlog() {
    try {
        logger.info('🚀 开始生成博客...');

        // 首先加载配置
        logger.info('⚙️  加载配置...');
        await loadConfig();

        // 验证配置
        logger.info('🔍 验证配置...');
        const isValid = await validateConfig();
        if (!isValid) {
            logger.error('❌ 配置验证失败，请检查配置文件');
            process.exit(1);
        }

        logger.info('📊 生成文章元数据...');
        await generateMetadata();

        // 同步静态资源到 public/，保证生成的 HTML 能找到样式/脚本（不会改变主构建流程）
        // 在 CI 环境或当设置了 SKIP_STATIC_SYNC=1 时跳过（避免在 CI 中重复无用复制）
        const isCI = !!process.env.CI;
        const skipSync = process.env.SKIP_STATIC_SYNC === '1' || isCI;
        if (skipSync) {
            logger.info('ℹ️ 跳过静态资源同步（CI 或 SKIP_STATIC_SYNC=1）');
        } else {
            logger.info('📁 同步静态资源到 public/...');
            await syncStatic();
        }

        logger.info('🔄 生成 HTML 文章...');
        await generatePosts();

        logger.info('🎉 博客生成完成！');
    } catch (error) {
        logger.error('❌ 生成过程出错:', error);
        throw error;
    }
}

generateBlog();
// 全局未处理异常捕获，保证友好日志
process.on('unhandledRejection', (reason, p) => {
    logger.error('Unhandled Rejection at:', p, 'reason:', reason);
});
process.on('uncaughtException', (err) => {
    logger.error('Uncaught Exception thrown:', err);
    process.exit(1);
});

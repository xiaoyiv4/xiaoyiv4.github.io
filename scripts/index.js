import { generateMetadata, generatePosts, PostGenerator } from './generators/index.js';
import { validateConfig, loadConfig } from './config/index.js';

export async function generateBlog() {
    try {
        console.log('🚀 开始生成博客...');

        // 首先加载配置
        console.log('⚙️  加载配置...');
        await loadConfig();

        // 验证配置
        console.log('🔍 验证配置...');
        const isValid = await validateConfig();
        if (!isValid) {
            console.error('❌ 配置验证失败，请检查配置文件');
            process.exit(1);
        }

        console.log('📊 生成文章元数据...');
        await generateMetadata();

        console.log('🔄 生成 HTML 文章...');
        await generatePosts();

        console.log('🎉 博客生成完成！');
    } catch (error) {
        console.error('❌ 生成过程出错:', error);
        throw error;
    }
}

generateBlog();

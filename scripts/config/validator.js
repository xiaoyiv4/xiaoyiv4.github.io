import { getPaths, pathResolver, getMarkdownConfig, getTemplateConfig } from './index.js';
import fs from 'fs/promises';

async function validateConfig() {
    try {
        console.log('🔍 验证配置...');

        const paths = await getPaths();
        console.log('📋 配置路径:', paths);

        // 检查必需配置
        const requiredPaths = ['docDir', 'postDir', 'templateDir'];

        for (const path of requiredPaths) {
            if (!paths[path]) {
                console.error(`❌ 缺少必需配置: paths.${path}`);
                return false;
            }
        }

        // 检查目录是否存在
        console.log('📁 检查目录是否存在...');
        for (const [key, dirPath] of Object.entries(paths)) {
            if (key.endsWith('Dir')) {
                try {
                    // 使用 pathResolver 检查路径
                    const exists = await pathResolver.pathExists(dirPath);
                    if (exists) {
                        console.log(`✅ ${key}: ${dirPath}`);
                    } else {
                        console.warn(`⚠️  ${key} 目录不存在: ${dirPath}`);
                        // 对于关键目录，可以在这里自动创建
                        if (['postDir', 'dist'].includes(key)) {
                            console.log(`   正在创建目录: ${dirPath}`);
                            await fs.mkdir(dirPath, { recursive: true });
                        }
                    }
                } catch (error) {
                    console.error(`❌ 检查目录 ${key} 时出错:`, error.message);
                }
            }
        }

        // 检查其他必需配置
        const markdownConfig = await getMarkdownConfig();
        if (!markdownConfig) {
            console.error('❌ 缺少 markdownConfig 配置');
            return false;
        }

        const templateConfig = await getTemplateConfig();
        if (!templateConfig) {
            console.error('❌ 缺少 templateConfig 配置');
            return false;
        }

        console.log('✅ 配置验证完成');
        return true;

    } catch (error) {
        console.error('❌ 配置验证失败:', error.message);
        return false;
    }
}

export default validateConfig;
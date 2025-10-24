import fs from 'fs/promises';
import yaml from 'yaml';
import pathResolver from './pathResolver.js';

class ConfigLoader {
    constructor() {
        this.config = null;
        this.configPath = pathResolver.getConfigPath('config.yaml');
        this.jsonConfigPath = pathResolver.getConfigPath('config.json');
    }

    async load() {
        if (this.config) {
            return this.config;
        }

        try {
            console.log(`🔍 加载配置文件: ${this.configPath}`);
            const yamlContent = await fs.readFile(this.configPath, 'utf-8');
            this.config = yaml.parse(yamlContent);

            // 解析路径为绝对路径
            this.resolvePaths();

            // 生成 JSON 配置备份
            await this.generateJsonConfig();

            console.log('✅ 配置已从 YAML 文件加载');
            return this.config;
        } catch (error) {
            console.warn('⚠️  YAML 配置加载失败，尝试加载 JSON 配置:', error.message);
            return await this.loadFromJson();
        }
    }

    async loadFromJson() {
        try {
            const jsonContent = await fs.readFile(this.jsonConfigPath, 'utf-8');
            this.config = JSON.parse(jsonContent);
            console.log('✅ 配置已从 JSON 文件加载');
            return this.config;
        } catch (error) {
            console.error('❌ 配置加载失败:', error.message);
            throw new Error('无法加载配置文件');
        }
    }

    resolvePaths() {
        if (!this.config.paths) return;

        // 使用 PathResolver 解析所有路径
        for (const [key, value] of Object.entries(this.config.paths)) {
            if (typeof value === 'string') {
                this.config.paths[key] = pathResolver.resolve(value);
            }
        }
    }

    async generateJsonConfig() {
        try {
            // 确保markdownConfig中的toc插件配置正确
            if (this.config.markdownConfig && this.config.markdownConfig.plugins && this.config.markdownConfig.plugins.toc) {
                // 添加默认的slugify函数
                if (!this.config.markdownConfig.plugins.toc.slugify) {
                    this.config.markdownConfig.plugins.toc.slugify = (s) => encodeURIComponent(String(s).trim().toLowerCase().replace(/\s+/g, '-'));
                }
            }
            
            const jsonConfig = JSON.stringify(this.config, null, 2);
            await fs.writeFile(this.jsonConfigPath, jsonConfig, 'utf-8');
            console.log('📄 JSON 配置文件已生成');
        } catch (error) {
            console.warn('⚠️  无法生成 JSON 配置文件:', error.message);
        }
    }

    get(path, defaultValue = null) {
        if (!this.config) {
            throw new Error('配置未加载，请先调用 load() 方法');
        }

        const keys = path.split('.');
        let value = this.config;

        for (const key of keys) {
            if (value && typeof value === 'object' && key in value) {
                value = value[key];
            } else {
                return defaultValue;
            }
        }

        return value;
    }

    isLoaded() {
        return this.config !== null;
    }

    // 获取配置文件的绝对路径
    getConfigFilePath(filename = 'config.yaml') {
        return pathResolver.getConfigPath(filename);
    }

    // 重新加载配置（清除缓存）
    async reload() {
        this.config = null;
        return await this.load();
    }

    // 获取路径解析器实例
    getPathResolver() {
        return pathResolver;
    }
}

// 创建单例实例
const configLoader = new ConfigLoader();

// 便捷导出方法
export default configLoader;

export async function loadConfig() {
    return await configLoader.load();
}

export async function getConfigValue(path, defaultValue = null) {
    await configLoader.load();
    return configLoader.get(path, defaultValue);
}

// 导出常用的配置部分

export async function getSiteConfig() {
    return await getConfigValue('site');
}

export async function getPaths() {
    return await getConfigValue('paths');
}

export async function getMarkdownConfig() {
    return await getConfigValue('markdownConfig');
}

export async function getTemplateConfig() {
    return await getConfigValue('templateConfig');
}

export async function getFileConfig() {
    return await getConfigValue('fileConfig');
}

export async function getLogConfig() {
    return await getConfigValue('logConfig');
}

// 导出路径解析器
export { pathResolver };
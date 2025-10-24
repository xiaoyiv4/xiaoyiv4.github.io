import nunjucks from 'nunjucks';
import fs from 'fs/promises';
import { getPaths, getTemplateConfig, getSiteConfig } from '../config/index.js';

export class TemplateManager {
    constructor() {
        this.env = null;
        this.paths = null;
        this.templateConfig = null;
        this.siteConfig = null; // 站点配置
        this.initialized = false;
    }

    async init() {
        if (this.initialized) return this;

        try {
            this.paths = await getPaths();
            this.templateConfig = await getTemplateConfig();
            this.siteConfig = await getSiteConfig(); // 加载站点配置

            // 确保模板目录存在
            await this.ensureTemplateDir();

            // 初始化 Nunjucks 环境
            await this.initNunjucks();

            this.initialized = true;
            console.log('✅ 模板管理器初始化完成 (Nunjucks)');
            return this;
        } catch (error) {
            console.error('❌ 模板管理器初始化失败:', error.message);
            throw error;
        }
    }

    /**
     * 确保模板目录存在
     */
    async ensureTemplateDir() {
        try {
            await fs.mkdir(this.paths.templateDir, { recursive: true });
            console.log(`📁 模板目录: ${this.paths.templateDir}`);
        } catch (error) {
            console.error(`❌ 无法创建模板目录: ${error.message}`);
            throw error;
        }
    }

    /**
     * 初始化 Nunjucks 环境
     */
    async initNunjucks() {
        // 配置 Nunjucks
        this.env = nunjucks.configure(this.paths.templateDir, {
            autoescape: true,
            throwOnUndefined: false,
            trimBlocks: true,
            lstripBlocks: true,
            noCache: process.env.NODE_ENV === 'development', // 开发环境关闭缓存
            watch: process.env.NODE_ENV === 'development' // 开发环境监听文件变化
        });

        // 添加自定义过滤器
        this.addCustomFilters();

        // 添加全局变量
        this.addGlobalVariables();
    }

    /**
     * 添加自定义过滤器
     */
    addCustomFilters() {
        // 日期格式化过滤器
        this.env.addFilter('formatDate', (date, format = 'zh-CN') => {
            if (!date) return '';
            const dateObj = date instanceof Date ? date : new Date(date);
            return dateObj.toLocaleDateString(format);
        });

        // 数组转字符串过滤器
        this.env.addFilter('join', (array, separator = ', ') => {
            if (!Array.isArray(array)) return array;
            return array.join(separator);
        });

        // 安全输出 HTML（类似 {{{ }}}）
        this.env.addFilter('safe', (str) => {
            return nunjucks.runtime.markSafe(str);
        });

        // slugify 过滤器 - 将字符串转换为 URL 友好的格式
        this.env.addFilter('slugify', (str) => {
            if (!str) return '';
            return str
                .toLowerCase()
                .replace(/\s+/g, '-')           // 空格替换为连字符
                .replace(/[^\w\-]+/g, '')       // 移除非单词字符
                .replace(/\-\-+/g, '-')         // 多个连字符替换为一个
                .replace(/^-+/, '')             // 移除开头的连字符
                .replace(/-+$/, '');            // 移除结尾的连字符
        });

        // 四舍五入过滤器
        this.env.addFilter('round', (num) => {
            return Math.round(num);
        });

        console.log('🎛️  自定义过滤器已添加');
    }

    /**
     * 添加全局变量
     */
    addGlobalVariables() {
        this.env.addGlobal('timestamp', new Date().toLocaleString('zh-CN'));
        this.env.addGlobal('year', new Date().getFullYear());

        // 添加站点配置
        if (this.siteConfig) {
            this.env.addGlobal('site', this.siteConfig);
        }

        // 添加模板配置中的全局数据
        if (this.templateConfig && this.templateConfig.templateData) {
            Object.entries(this.templateConfig.templateData).forEach(([key, value]) => {
                this.env.addGlobal(key, value);
            });
        }

        console.log('🌍 全局变量已添加');
    }

    /**
     * 获取所有可用模板
     */
    async getAvailableTemplates() {
        await this.init();

        try {
            const files = await fs.readdir(this.paths.templateDir);
            return files.filter(file =>
                file.endsWith('.html') || file.endsWith('.htm')
            );
        } catch (error) {
            console.error('❌ 无法读取模板目录:', error.message);
            return [];
        }
    }

    /**
     * 渲染模板
     */
    async render(templateName, data = {}) {
        await this.init();

        const actualTemplateName = templateName || this.templateConfig.defaultTemplate;

        try {
            // 准备模板数据
            const templateData = this.prepareTemplateData(data);

            // 使用 Nunjucks 渲染
            const result = await new Promise((resolve, reject) => {
                this.env.render(actualTemplateName, templateData, (err, res) => {
                    if (err) reject(err);
                    else resolve(res);
                });
            });

            return result;

        } catch (error) {
            throw new Error(`渲染模板 ${actualTemplateName} 失败: ${error.message}`);
        }
    }

    /**
     * 准备模板数据
     */
    prepareTemplateData(data) {
        const baseData = {
            // 用户数据
            ...data
        };

        // 确保必要的字段存在
        if (!baseData.meta) {
            baseData.meta = {};
        }

        return baseData;
    }

    /**
     * 添加自定义过滤器（运行时）
     */
    addFilter(name, filterFn, async = false) {
        if (!this.initialized) {
            throw new Error('模板管理器未初始化');
        }
        this.env.addFilter(name, filterFn, async);
        console.log(`🔧 添加过滤器: ${name}`);
    }

    /**
     * 添加全局变量（运行时）
     */
    addGlobal(name, value) {
        if (!this.initialized) {
            throw new Error('模板管理器未初始化');
        }
        this.env.addGlobal(name, value);
        console.log(`🔧 添加全局变量: ${name}`);
    }

    /**
     * 清除模板缓存
     */
    clearCache() {
        if (this.env) {
            // Nunjucks 会自动处理缓存
            console.log('🧹 Nunjucks 缓存已清除');
        }
    }

    /**
     * 获取模板信息
     */
    async getTemplateInfo() {
        await this.init();

        const templates = await this.getAvailableTemplates();
        const info = {
            templateDir: this.paths.templateDir,
            defaultTemplate: this.templateConfig.defaultTemplate,
            availableTemplates: templates,
            engine: 'Nunjucks',
            filters: Object.keys(this.env.filters || {}),
            globals: Object.keys(this.env.globals || {})
        };

        return info;
    }

    /**
     * 渲染字符串（不涉及文件）
     */
    async renderString(templateString, data = {}) {
        await this.init();

        try {
            const templateData = this.prepareTemplateData(data);
            return this.env.renderString(templateString, templateData);
        } catch (error) {
            throw new Error(`渲染模板字符串失败: ${error.message}`);
        }
    }
}

// 创建单例实例
const templateManager = new TemplateManager();
export default templateManager;
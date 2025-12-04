import fs from 'fs/promises';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class TemplateManager {
    constructor(templatesDir = path.join(__dirname, '../templates')) {
        this.templatesDir = templatesDir;
        this.templates = new Map();
    }

    async loadTemplate(templateName) {
        try {
            const templatePath = path.join(this.templatesDir, `${templateName}.html`);
            const content = await fs.readFile(templatePath, 'utf-8');
            this.templates.set(templateName, content);
            return content;
        } catch (error) {
            throw new Error(`无法加载模板 ${templateName}: ${error.message}`);
        }
    }

    async render(templateName, data = {}) {
        let template = this.templates.get(templateName);

        if (!template) {
            template = await this.loadTemplate(templateName);
        }

        return this.compileTemplate(template, data);
    }

    compileTemplate(template, data) {
        return template.replace(/\{\{([^}]+)\}\}/g, (match, expression) => {
            expression = expression.trim();

            // 处理 {{{content}}} 这样的三重括号（不转义）
            if (match.startsWith('{{{') && match.endsWith('}}}')) {
                return this.evaluateExpression(expression, data, false);
            }

            // 处理条件语句 {{#if condition}} ... {{/if}}
            if (expression.startsWith('#if ')) {
                return this.processCondition(expression.slice(4), template, data);
            }

            // 处理循环 {{#each array}} ... {{/each}}
            if (expression.startsWith('#each ')) {
                return this.processLoop(expression.slice(6), template, data);
            }

            // 普通表达式
            return this.evaluateExpression(expression, data, true);
        });
    }

    evaluateExpression(expression, data, escape = true) {
        const value = this.getNestedValue(data, expression);

        if (value === undefined || value === null) {
            return '';
        }

        // 特殊处理日期格式化
        if (expression === 'date' && data.formatDate && typeof data.formatDate === 'function') {
            return data.formatDate(value);
        }

        return escape ? this.escapeHtml(value) : value;
    }

    getNestedValue(obj, path) {
        return path.split('.').reduce((current, key) => {
            return current && current[key] !== undefined ? current[key] : undefined;
        }, obj);
    }

    escapeHtml(unsafe) {
        if (typeof unsafe !== 'string') return unsafe;
        return unsafe
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/'/g, "&#039;");
    }

    processCondition(condition, template, data) {
        // 简化处理，实际项目中可以使用更复杂的模板引擎
        const value = this.getNestedValue(data, condition);
        return value ? '' : '';
    }

    processLoop(expression, template, data) {
        // 简化处理，实际项目中可以使用更复杂的模板引擎
        const [arrayName, itemName] = expression.split(' ');
        const array = this.getNestedValue(data, arrayName);

        if (!Array.isArray(array)) return '';

        return array.map(item => {
            const loopData = { ...data, [itemName]: item };
            // 这里需要更复杂的逻辑来提取循环体
            return item;
        }).join('');
    }
}
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs/promises';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

class PathResolver {
    constructor() {
        // 当前文件在 scripts/config 目录
        this.configDir = __dirname;
        this.scriptsDir = path.dirname(this.configDir); // scripts 目录
        this.projectRoot = path.dirname(this.scriptsDir); // 项目根目录

        this.initializePaths();
    }

    initializePaths() {
        // 定义项目中的关键路径
        this.paths = {
            // 配置文件路径
            config: {
                yaml: path.join(this.configDir, 'config.yaml'),
                json: path.join(this.configDir, 'config.json'),
                validator: path.join(this.configDir, 'validator.js')
            },

            // 项目目录路径（与 scripts 同级）
            directories: {
                src: path.join(this.projectRoot, 'src'),
                dist: path.join(this.projectRoot, 'dist'),
                templates: path.join(this.projectRoot, 'templates'),
                assets: path.join(this.projectRoot, 'assets'),
                logs: path.join(this.projectRoot, 'logs')
            },

            // scripts 内部目录
            scripts: {
                generators: path.join(this.scriptsDir, 'generators'),
                templates: path.join(this.scriptsDir, 'templates'),
                utils: path.join(this.scriptsDir, 'utils'),
                config: this.configDir
            }
        };
    }

    /**
     * 获取配置文件路径
     */
    getConfigPath(filename = 'config.yaml') {
        // Accept either a key like 'yaml'/'json' or a filename like 'config.yaml'
        if (!filename) return path.join(this.configDir, 'config.yaml');
        const key = filename.replace(/^config\.?/, '');
        if (filename.endsWith('.yaml') || filename.endsWith('.yml') || key === 'yaml') {
            return this.paths.config.yaml;
        }
        if (filename.endsWith('.json') || key === 'json') {
            return this.paths.config.json;
        }
        // fallback to joining
        return this.paths.config[filename] || path.join(this.configDir, filename);
    }

    /**
     * 解析相对路径为绝对路径（相对于项目根目录）
     */
    resolve(relativePath) {
        if (path.isAbsolute(relativePath)) {
            return relativePath;
        }
        return path.resolve(this.projectRoot, relativePath);
    }

    /**
     * 获取项目根目录
     */
    getProjectRoot() {
        return this.projectRoot;
    }

    /**
     * 获取配置目录
     */
    getConfigDir() {
        return this.configDir;
    }

    /**
     * 获取 scripts 目录
     */
    getScriptsDir() {
        return this.scriptsDir;
    }

    /**
     * 获取项目目录路径
     */
    getProjectDir(name) {
        return this.paths.directories[name];
    }

    /**
     * 获取 scripts 内部目录路径
     */
    getScriptsSubDir(name) {
        return this.paths.scripts[name];
    }

    /**
     * 检查路径是否存在
     */
    async pathExists(filePath) {
        try {
            await fs.access(filePath);
            return true;
        } catch {
            return false;
        }
    }

    /**
     * 显示所有路径信息（用于调试）
     */
    showAllPaths() {
        console.log('🗂️  路径信息:');
        console.log('项目根目录:', this.projectRoot);
        console.log('Scripts 目录:', this.scriptsDir);
        console.log('配置目录:', this.configDir);

        console.log('\n📁 项目目录:');
        for (const [key, dirPath] of Object.entries(this.paths.directories)) {
            console.log(`  - ${key}: ${dirPath}`);
        }

        console.log('\n📁 Scripts 内部目录:');
        for (const [key, dirPath] of Object.entries(this.paths.scripts)) {
            console.log(`  - ${key}: ${dirPath}`);
        }

        console.log('\n📄 配置文件:');
        for (const [key, filePath] of Object.entries(this.paths.config)) {
            console.log(`  - ${key}: ${filePath}`);
        }
    }
}

// 创建单例
const pathResolver = new PathResolver();
export default pathResolver;
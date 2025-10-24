import configLoader from './configLoader.js';
import pathResolver from './pathResolver.js';
import fs from 'fs/promises';

class ConfigManager {
    constructor() {
        this.loader = configLoader;
    }

    // 显示当前配置
    async show() {
        const config = await this.loader.load();
        console.log('📋 配置信息:');
        console.log('项目根目录:', pathResolver.getProjectRoot());
        console.log('Scripts 目录:', pathResolver.getScriptsDir());
        console.log('配置目录:', pathResolver.getConfigDir());
        console.log('YAML 配置文件:', this.loader.getConfigFilePath('config.yaml'));
        console.log('JSON 配置文件:', this.loader.getConfigFilePath('config.json'));
        console.log('\n📄 配置内容:');
        console.log(JSON.stringify(config, null, 2));
    }

    // 验证配置
    async validate() {
        try {
            const validatorPath = pathResolver.getConfigPath('validator.js');
            if (await pathResolver.pathExists(validatorPath)) {
                const { default: validateConfig } = await import(validatorPath);
                return await validateConfig();
            } else {
                console.log('⚠️  未找到验证器，跳过验证');
                return true;
            }
        } catch (error) {
            console.error('❌ 配置验证失败:', error.message);
            return false;
        }
    }

    // 重新生成 JSON 配置
    async regenerateJson() {
        try {
            await this.loader.reload(); // 这会自动重新生成 JSON
            console.log('✅ JSON 配置文件已重新生成');
            return true;
        } catch (error) {
            console.error('❌ 重新生成 JSON 配置失败:', error.message);
            return false;
        }
    }

    // 检查配置路径
    async checkPaths() {
        const config = await this.loader.load();

        console.log('📁 检查配置路径:');
        console.log('项目根目录:', pathResolver.getProjectRoot());

        // 检查配置中的 paths 节
        if (config.paths) {
            for (const [key, value] of Object.entries(config.paths)) {
                const exists = await pathResolver.pathExists(value);
                const status = exists ? '✅' : '❌';
                const statusText = exists ? '' : '(不存在)';
                console.log(`  ${status} ${key}: ${value} ${statusText}`);
            }
        } else {
            console.log('  ℹ️  配置中没有 paths 节');
        }

        // 检查项目目录
        console.log('\n📁 检查项目目录:');
        const projectDirs = {
            'src': pathResolver.getProjectDir('src'),
            'dist': pathResolver.getProjectDir('dist'),
            'templates': pathResolver.getProjectDir('templates'),
            'assets': pathResolver.getProjectDir('assets')
        };

        for (const [name, dirPath] of Object.entries(projectDirs)) {
            const exists = await pathResolver.pathExists(dirPath);
            const status = exists ? '✅' : '❌';
            const statusText = exists ? '' : '(不存在)';
            console.log(`  ${status} ${name}: ${dirPath} ${statusText}`);
        }
    }

    // 显示路径信息
    async showPaths() {
        pathResolver.showAllPaths();
    }

    // 检查配置文件状态
    async checkConfigFiles() {
        console.log('🔍 检查配置文件状态:');

        const yamlPath = this.loader.getConfigFilePath('config.yaml');
        const jsonPath = this.loader.getConfigFilePath('config.json');
        const validatorPath = this.loader.getConfigFilePath('validator.js');

        const yamlExists = await pathResolver.pathExists(yamlPath);
        const jsonExists = await pathResolver.pathExists(jsonPath);
        const validatorExists = await pathResolver.pathExists(validatorPath);

        console.log(`  ${yamlExists ? '✅' : '❌'} config.yaml: ${yamlPath}`);
        console.log(`  ${jsonExists ? '✅' : '❌'} config.json: ${jsonPath}`);
        console.log(`  ${validatorExists ? '✅' : '❌'} validator.js: ${validatorPath}`);

        if (yamlExists) {
            try {
                const stats = await fs.stat(yamlPath);
                console.log(`    config.yaml 最后修改: ${stats.mtime.toLocaleString()}`);
            } catch (error) {
                console.log('    无法获取文件信息');
            }
        }
    }

    // 创建缺失的目录
    async createMissingDirs() {
        console.log('📁 创建缺失的目录:');

        const dirsToCheck = [
            pathResolver.getProjectDir('src'),
            pathResolver.getProjectDir('dist'),
            pathResolver.getProjectDir('templates'),
            pathResolver.getProjectDir('assets'),
            pathResolver.getProjectDir('logs')
        ];

        for (const dirPath of dirsToCheck) {
            try {
                await fs.mkdir(dirPath, { recursive: true });
                console.log(`  ✅ 创建目录: ${dirPath}`);
            } catch (error) {
                console.log(`  ⚠️  无法创建目录 ${dirPath}: ${error.message}`);
            }
        }
    }
}

// 创建实例
const configManager = new ConfigManager();

// CLI 命令处理
const command = process.argv[2];

switch (command) {
    case 'show':
        await configManager.show();
        break;
    case 'validate':
        await configManager.validate();
        break;
    case 'regenerate':
        await configManager.regenerateJson();
        break;
    case 'check-paths':
        await configManager.checkPaths();
        break;
    case 'show-paths':
        await configManager.showPaths();
        break;
    case 'check-files':
        await configManager.checkConfigFiles();
        break;
    case 'create-dirs':
        await configManager.createMissingDirs();
        break;
    default:
        console.log(`
用法: node scripts/config/configManager.js [command]

命令:
  show          显示当前配置
  validate      验证配置
  regenerate    重新生成 JSON 配置
  check-paths   检查配置路径是否存在
  show-paths    显示所有路径信息
  check-files   检查配置文件状态
  create-dirs   创建缺失的目录
        `);
        process.exit(1);
}
import { defineConfig } from 'vite';
import { resolve } from 'path';

export default defineConfig({
    // 根目录设置为项目根目录
    root: '.',

    // 公共静态资源目录
    publicDir: 'public',

    build: {
        // 构建输出目录
        outDir: 'dist',

        // 静态资源输出目录
        assetsDir: 'assets',

        // 代码分割配置
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                // 如果将来有多页面，可以在这里添加
                // about: resolve(__dirname, 'about.html')
            }
        },
        

        // 压缩配置
        minify: 'esbuild',

        // 生成 sourcemap
        sourcemap: false
    },

    // 开发服务器配置
    server: {
        port: 3000,
        open: true, // 自动打开浏览器
        cors: true
    },

    // 预览配置
    preview: {
        port: 4173,
        open: true
    },

    // 插件配置
    plugins: [
        // 可以在这里添加插件
    ],

    // 路径别名配置
    resolve: {
        alias: {
            '@': resolve(__dirname, 'src'),
            '@js': resolve(__dirname, 'src/js'),
            '@styles': resolve(__dirname, 'src/styles'),
            '@scripts': resolve(__dirname, 'scripts')
        }
    },

    // CSS 配置
    css: {
        devSourcemap: true,
        // 如果需要 CSS 预处理可以在这里配置
    }
});
import { defineConfig } from 'vite';
import { resolve } from 'path';
import fs from 'fs';

// 动态获取 posts 目录下的所有 HTML 文件
// function getPostFiles() {
//     const postsDir = resolve(__dirname, 'src/posts');
//     const entries = {};

//     if (fs.existsSync(postsDir)) {
//         const files = fs.readdirSync(postsDir);
//         const htmlFiles = files.filter(file => file.endsWith('.html'));

//         htmlFiles.forEach(file => {
//             const name = file.replace('.html', '');
//             // 这里直接使用文件名作为键，不添加 posts/ 前缀
//             entries[name] = resolve(postsDir, file);
//         });
//     }

//     return entries;
// }

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

        manifest: true,
        // 代码分割配置
        rollupOptions: {
            input: {
                main: resolve(__dirname, 'index.html'),
                article: resolve(__dirname, 'src/js/article.js'),
                // ...getPostFiles()
            },
            // 确保资源引用使用相对路径
            output: {
                assetFileNames: 'assets/[name]-[hash][extname]',
                chunkFileNames: 'assets/[name]-[hash].js',
                entryFileNames: 'assets/[name]-[hash].js'
                // entryFileNames: ({ name }) => {
                //     // 将 posts 目录下的文件输出到 dist/posts 目录
                //     // 排除 main 入口
                //     if (name !== 'main' && getPostFiles()[name]) {
                //         // 对于文章页面，我们使用统一的入口文件
                //         return 'assets/article-[hash].js';
                //     }
                //     return 'assets/[name]-[hash].js';
                // }
            }
        },
        
        // 启用压缩
        minify: 'esbuild',

        // 生成 sourcemap
        sourcemap: false,

        // CSS 代码分割
        cssCodeSplit: true,

        // 静态资源处理
        assetsInlineLimit: 4096, // 小于4kb的资源内联为base64

        // 启用 brotli 压缩
        brotliSize: true,

        // 禁用 gzip 压缩（如果服务器支持 brotli）
        chunkSizeWarningLimit: 1000 // 增加块大小警告限制
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
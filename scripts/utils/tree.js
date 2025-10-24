import fs from 'fs/promises';
import path from 'path';

async function quickTree(dir = '.', depth = 3) {
    const ignoreList = new Set(['node_modules', '.git', 'dist']);

    async function buildTree(currentDir, prefix = '', currentDepth = 0) {
        if (currentDepth >= depth) return '';

        try {
            const files = (await fs.readdir(currentDir))
                .filter(file => !file.startsWith('.') && !ignoreList.has(file))
                .sort();

            let tree = '';

            for (const [i, file] of files.entries()) {
                const filePath = path.join(currentDir, file);
                const isLast = i === files.length - 1;
                const connector = isLast ? '└── ' : '├── ';

                try {
                    const stat = await fs.stat(filePath);
                    tree += prefix + connector + file + '\n';

                    if (stat.isDirectory()) {
                        const newPrefix = prefix + (isLast ? '    ' : '│   ');
                        tree += await buildTree(filePath, newPrefix, currentDepth + 1);
                    }
                } catch {
                    // 跳过无法访问的文件
                }
            }

            return tree;
        } catch {
            return '';
        }
    }

    return await buildTree(dir);
}

// 使用
quickTree().then(console.log).catch(console.error);
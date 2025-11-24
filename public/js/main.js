import { EventBus } from './EventBus.js';
import { UIManager } from './UIManager.js';
import { ThemeToggle } from './toggleTheme.js';
import ArticleManager from './ArticleManager.js';
import { CONFIG } from './config.js';

class App {
    constructor() {
        this.eventBus = new EventBus();
        this.articleManager = new ArticleManager(this.eventBus, CONFIG);
        this.uiManager = new UIManager(this.eventBus, this.articleManager, CONFIG);
        this.themeToggle = new ThemeToggle(CONFIG);
    }

    async initialize() {
        try {
            // 如果 DOM 已经加载完成，直接启动
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', () => {
                    this.start();
                });
            } else {
                // DOM 已经加载完成
                await this.start();
            }
        } catch (error) {
            console.error('应用初始化失败:', error);
        }
    }

    async start() {
        try {
            await this.articleManager.loadPosts();
            this.uiManager.initSearch();
            this.uiManager.initTagHandlers();
            document.getElementById("postsList").addEventListener('click', function (e) {
                const card = e.target.closest('.article-card');
                if (card) {
                    const link = card.querySelector('.article-title a');
                    if (link && !e.target.closest('.tags')) {
                        e.preventDefault();
                        window.location.href = link.href;
                    }
                }
            });

            console.log(' %c 应用初始化完成', 'background:#35495e ; padding: 2px; border-radius: 3px; color: #fff');
        } catch (error) {
            console.error('应用启动失败:', error);
        }
    }
}

// 启动应用
const app = new App();
app.initialize();
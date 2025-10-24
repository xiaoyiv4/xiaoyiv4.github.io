// 页面加载完成后初始化暗色模式切换
document.addEventListener('DOMContentLoaded', function () {
    // 暗色模式切换功能（合并自toggleTheme.js）
    class ThemeToggle {
        constructor(config) {
            this.config = config;
            this.themeToggle = document.getElementById(config.selectors.themeToggle);
            this.currentTheme = this.getStoredTheme() || this.getSystemTheme();

            this.init();
        }

        init() {
            this.setTheme(this.currentTheme);
            this.bindEvents();
        }

        getStoredTheme() {
            return localStorage.getItem('theme');
        }

        getSystemTheme() {
            return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
        }

        setTheme(theme) {
            document.documentElement.setAttribute('data-theme', theme);
            localStorage.setItem('theme', theme);
            this.currentTheme = theme;

            // 更新图标显示逻辑
            const sunIcon = document.querySelector('.fas.fa-sun');
            const moonIcon = document.querySelector('.fas.fa-moon');
            if (sunIcon && moonIcon) {
                if (theme === 'light') {
                    sunIcon.style.display = 'block';
                    moonIcon.style.display = 'none';
                } else {
                    sunIcon.style.display = 'none';
                    moonIcon.style.display = 'block';
                }
            }
            
            // 切换highlight.js主题
            this.toggleHighlightTheme(theme);
        }

        toggleHighlightTheme(theme) {
            const lightTheme = document.getElementById('highlight-light-theme');
            const darkTheme = document.getElementById('highlight-dark-theme');
            
            if (lightTheme && darkTheme) {
                if (theme === 'dark') {
                    lightTheme.disabled = true;
                    darkTheme.disabled = false;
                } else {
                    lightTheme.disabled = false;
                    darkTheme.disabled = true;
                }
            }
        }

        toggleTheme() {
            const newTheme = this.currentTheme === 'light' ? 'dark' : 'light';
            this.setTheme(newTheme);
        }

        bindEvents() {
            if (this.themeToggle) {
                this.themeToggle.addEventListener('click', () => {
                    this.toggleTheme();
                });

                window.matchMedia('(prefers-color-scheme: dark)').addEventListener('change', (e) => {
                    if (!this.getStoredTheme()) {
                        this.setTheme(e.matches ? 'dark' : 'light');
                    }
                });
            }
        }
    }

    // 返回顶部
    function scrollToTop() {
        window.scrollTo({ top: 0, behavior: 'smooth' });
    }
    document.querySelector(".scroll-to-top-btn").onclick = scrollToTop;

    // 添加复制代码按钮
    document.querySelectorAll('pre code').forEach((block) => {
        const pre = block.parentNode;
        const button = document.createElement('button');
        button.className = 'copy-code-btn';
        button.innerHTML = '<i class="fas fa-copy"></i>';
        button.title = '复制代码';

        button.addEventListener('click', async () => {
            try {
                await navigator.clipboard.writeText(block.textContent);
                button.innerHTML = '<i class="fas fa-check"></i>';
                setTimeout(() => {
                    button.innerHTML = '<i class="fas fa-copy"></i>';
                }, 2000);
            } catch (err) {
                console.error('复制失败:', err);
            }
        });

        pre.style.position = 'relative';
        pre.appendChild(button);
    });

    // 目录高亮
    const headings = document.querySelectorAll('h1, h2, h3, h4, h5, h6');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            const id = entry.target.getAttribute('id');
            if (entry.intersectionRatio > 0) {
                document.querySelectorAll('.toc-content a').forEach(link => {
                    link.classList.remove('active');
                    if (link.getAttribute('href') === `#${id}`) {
                        link.classList.add('active');
                    }
                });
            }
        });
    }, { rootMargin: '0px 0px -80% 0px' });

    headings.forEach(heading => {
        if (heading.id) {
            observer.observe(heading);
        }
    });

    // 图片灯箱效果
    document.querySelectorAll('.article-content img').forEach(img => {
        img.style.cursor = 'zoom-in';
        img.addEventListener('click', () => {
            const overlay = document.createElement('div');
            overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: rgba(0,0,0,0.8);
            display: flex;
            align-items: center;
            justify-content: center;
            z-index: 1000;
            cursor: zoom-out;
          `;

            const enlargedImg = document.createElement('img');
            enlargedImg.src = img.src;
            enlargedImg.style.cssText = `
            max-width: 90%;
            max-height: 90%;
            object-fit: contain;
          `;

            overlay.appendChild(enlargedImg);
            overlay.addEventListener('click', () => {
                document.body.removeChild(overlay);
            });

            document.body.appendChild(overlay);
        });
    });

    // 初始化主题切换
    const CONFIG = {
        selectors: {
            themeToggle: 'themeToggle'
        }
    };
    
    new ThemeToggle(CONFIG);
});
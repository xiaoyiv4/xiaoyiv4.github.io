document.addEventListener("DOMContentLoaded",function(){class s{constructor(e){this.config=e,this.themeToggle=document.getElementById(e.selectors.themeToggle),this.currentTheme=this.getStoredTheme()||this.getSystemTheme(),this.init()}init(){this.setTheme(this.currentTheme),this.bindEvents()}getStoredTheme(){return localStorage.getItem("theme")}getSystemTheme(){return window.matchMedia("(prefers-color-scheme: dark)").matches?"dark":"light"}setTheme(e){document.documentElement.setAttribute("data-theme",e),localStorage.setItem("theme",e),this.currentTheme=e;const t=document.querySelector(".fas.fa-sun"),o=document.querySelector(".fas.fa-moon");t&&o&&(e==="light"?(t.style.display="block",o.style.display="none"):(t.style.display="none",o.style.display="block")),this.toggleHighlightTheme(e)}toggleHighlightTheme(e){const t=document.getElementById("highlight-light-theme"),o=document.getElementById("highlight-dark-theme");t&&o&&(e==="dark"?(t.disabled=!0,o.disabled=!1):(t.disabled=!1,o.disabled=!0))}toggleTheme(){const e=this.currentTheme==="light"?"dark":"light";this.setTheme(e)}bindEvents(){this.themeToggle&&(this.themeToggle.addEventListener("click",()=>{this.toggleTheme()}),window.matchMedia("(prefers-color-scheme: dark)").addEventListener("change",e=>{this.getStoredTheme()||this.setTheme(e.matches?"dark":"light")}))}}function n(){window.scrollTo({top:0,behavior:"smooth"})}document.querySelector(".scroll-to-top-btn").onclick=n,document.querySelectorAll("pre code").forEach(i=>{const e=i.parentNode,t=document.createElement("button");t.className="copy-code-btn",t.innerHTML='<i class="fas fa-copy"></i>',t.title="复制代码",t.addEventListener("click",async()=>{try{await navigator.clipboard.writeText(i.textContent),t.innerHTML='<i class="fas fa-check"></i>',setTimeout(()=>{t.innerHTML='<i class="fas fa-copy"></i>'},2e3)}catch(o){console.error("复制失败:",o)}}),e.style.position="relative",e.appendChild(t)});const c=document.querySelectorAll("h1, h2, h3, h4, h5, h6"),r=new IntersectionObserver(i=>{i.forEach(e=>{const t=e.target.getAttribute("id");e.intersectionRatio>0&&document.querySelectorAll(".toc-content a").forEach(o=>{o.classList.remove("active"),o.getAttribute("href")===`#${t}`&&o.classList.add("active")})})},{rootMargin:"0px 0px -80% 0px"});c.forEach(i=>{i.id&&r.observe(i)}),document.querySelectorAll(".article-content img").forEach(i=>{i.style.cursor="zoom-in",i.addEventListener("click",()=>{const e=document.createElement("div");e.style.cssText=`
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
          `;const t=document.createElement("img");t.src=i.src,t.style.cssText=`
            max-width: 90%;
            max-height: 90%;
            object-fit: contain;
          `,e.appendChild(t),e.addEventListener("click",()=>{document.body.removeChild(e)}),document.body.appendChild(e)})});const l={selectors:{themeToggle:"themeToggle"}};new s(l)});

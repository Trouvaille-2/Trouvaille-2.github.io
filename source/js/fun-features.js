/**
 * Hexo Blog Fun & Interactive Features
 * 包含：极光渐变阅读进度条、一键切换随机壁纸、卡片 3D 视差倾斜
 */

(function () {
  'use strict';

  /* ========================================================
   * 1. 顶部极光渐变滚动阅读进度条 (Feature A)
   * ======================================================== */
  function initReadingProgress() {
    let bar = document.getElementById('aurora-progress');
    if (!bar) {
      bar = document.createElement('div');
      bar.id = 'aurora-progress';
      document.body.appendChild(bar);
    }

    function update() {
      const docHeight = document.documentElement.scrollHeight - window.innerHeight;
      if (docHeight <= 0) {
        bar.style.width = '0%';
        return;
      }
      const scrollPos = window.scrollY || window.pageYOffset || document.documentElement.scrollTop;
      const pct = Math.min(Math.max((scrollPos / docHeight) * 100, 0), 100);
      bar.style.width = pct + '%';
    }

    window.addEventListener('scroll', update, { passive: true });
    update();
  }

  /* ========================================================
   * 2. 一键切换随机精美壁纸 (Feature 4)
   * ======================================================== */
  const WALLPAPERS = [
    '/img/miao5.webp',
    'https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=1920&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1506744038136-46273834b3fb?q=80&w=1920&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1534447677768-be436bb09401?q=80&w=1920&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1511447333015-45b65e60f6d5?q=80&w=1920&auto=format&fit=crop',
    'https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=1920&auto=format&fit=crop'
  ];

  function applyWallpaper(url) {
    const bgEl = document.getElementById('web_bg');
    if (bgEl) {
      bgEl.style.transition = 'background-image 0.5s ease-in-out';
      bgEl.style.backgroundImage = `url("${url}")`;
    }
    const footerEl = document.getElementById('footer');
    if (footerEl) {
      footerEl.style.transition = 'background-image 0.5s ease-in-out';
      footerEl.style.backgroundImage = `url("${url}")`;
    }
  }

  function initWallpaperSwitcher() {
    // 恢复用户保存的壁纸
    const saved = localStorage.getItem('user_wallpaper');
    if (saved) applyWallpaper(saved);

    // 检查右侧悬浮栏
    const configHide = document.getElementById('rightside-config-hide');
    if (configHide && !document.getElementById('change-bg-btn')) {
      const btn = document.createElement('button');
      btn.id = 'change-bg-btn';
      btn.type = 'button';
      btn.title = '随机切换背景壁纸';
      btn.innerHTML = '<i class="fas fa-image"></i>';
      btn.onclick = function () {
        const cur = localStorage.getItem('user_wallpaper') || WALLPAPERS[0];
        let nextIndex = (WALLPAPERS.indexOf(cur) + 1) % WALLPAPERS.length;
        if (nextIndex < 0) nextIndex = 0;
        const nextUrl = WALLPAPERS[nextIndex];
        localStorage.setItem('user_wallpaper', nextUrl);
        applyWallpaper(nextUrl);
        if (typeof btf !== 'undefined' && btf.snackbarShow) {
          btf.snackbarShow('🎨 已为您切换到新壁纸', false, 2000);
        }
      };
      configHide.prepend(btn);
    }
  }

  /* ========================================================
   * 3. 首页放映厅直达推荐横幅 (Movie Showcase Banner)
   * ======================================================== */
  function initHomeMovieBanner() {
    const path = window.location.pathname;
    const isHome = path === '/' || path === '/index.html' || /^\/page\/\d+\/?$/.test(path);
    if (!isHome) return;

    if (document.getElementById('home-movie-banner')) return;

    const recentPosts = document.getElementById('recent-posts');
    if (!recentPosts) return;

    const banner = document.createElement('div');
    banner.id = 'home-movie-banner';
    banner.className = 'home-movie-banner';
    banner.innerHTML = `
      <div class="movie-banner-inner">
        <div class="movie-banner-left">
          <span class="movie-banner-badge"><i class="fas fa-sparkles"></i> 专栏推荐</span>
          <div class="movie-banner-title">🎬 光影放映室 · 私人影单与追番墙</div>
          <div class="movie-banner-desc">蓦然回首 / 秒速五厘米 / HELLO WORLD / 夏日幻魂 / 横道世之介 / 进击的巨人 ——“用别人的故事，过梦寐以求的人生”</div>
        </div>
        <div class="movie-banner-right">
          <span class="movie-banner-btn">进入放映厅 <i class="fas fa-arrow-right"></i></span>
        </div>
      </div>
    `;

    banner.onclick = function () {
      if (typeof pjax !== 'undefined' && pjax.loadUrl) {
        pjax.loadUrl('/movies/');
      } else {
        window.location.href = '/movies/';
      }
    };

    recentPosts.prepend(banner);
  }

  /* ========================================================
   * 生命周期调度（首屏 + Pjax 路由切换）
   * ======================================================== */
  function initAll() {
    initReadingProgress();
    initWallpaperSwitcher();
    initHomeMovieBanner();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initAll);
  } else {
    initAll();
  }

  document.addEventListener('pjax:complete', initAll);
})();

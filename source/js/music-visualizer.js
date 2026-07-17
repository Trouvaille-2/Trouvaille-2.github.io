/**
 * Music Visualizer — Mineradio 风格：歌词舞台 + 氛围粒子
 */
(function() {
  'use strict';

  let canvas, ctx, W, H, dpr;
  let audioCtx, analyser, running = false;
  let animId = null;
  let audioEl = null;

  // 粒子系统
  let stars = [];
  const STAR_COUNT = 180;

  // 歌词
  let lrcData = [];
  let lrcIdx = -1;
  let lrcTimer = null;

  // 音乐能量
  let energy = 0, smoothEnergy = 0;
  let beat = false, beatFrame = 0;

  // ======================== 初始化 ========================

  function init() {
    canvas = document.getElementById('viz-canvas');
    if (!canvas || running) return;
    ctx = canvas.getContext('2d');
    dpr = window.devicePixelRatio || 1;
    resize();
    window.addEventListener('resize', resize);
    createStars();
    waitForPlayer();
  }

  function resize() {
    const r = canvas.parentElement.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  }

  // ======================== 连接音频 ========================

  function waitForPlayer() {
    var poll = setInterval(function() {
      var audio = document.querySelector('.aplayer audio');
      if (audio && audio.readyState > 0) {
        connectAudio(audio);
        clearInterval(poll);
      }
    }, 600);
    setTimeout(function() { clearInterval(poll); }, 15000);
  }

  function connectAudio(audio) {
    if (running) return;
    audioEl = audio;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 128;

      if (audioCtx.state === 'suspended') {
        document.addEventListener('click', function r() {
          audioCtx.resume();
          document.removeEventListener('click', r);
        });
      }

      try {
        var src = audioCtx.createMediaElementSource(audio);
        src.connect(analyser);
        analyser.connect(audioCtx.destination);
      } catch(e) {}

      running = true;

      // 监听切歌
      document.querySelector('.aplayer').addEventListener('play', function() {
        lrcData = [];
        lrcIdx = -1;
        fetchLyrics();
      });

      // 监听时间更新歌词
      audio.addEventListener('timeupdate', updateLrc);

      fetchLyrics();
      animate();
    } catch(e) {
      running = true;
      animate();
    }
  }

  // ======================== 获取歌词 ========================

  function fetchLyrics() {
    // 从 APlayer 实例获取歌词
    var audio = document.querySelector('.aplayer audio');
    if (!audio) return;

    // 先尝试从 APlayer 的 lrc 数据获取
    // APlayer 会把 lrc 存在 .aplayer-lrc 中
    var lrcEl = document.querySelector('.aplayer-lrc-contents');
    if (lrcEl) {
      parseLrcFromDom(lrcEl);
      return;
    }

    // 如果没有，尝试 fetch meting api 获取歌词
    var title = document.querySelector('.aplayer-title');
    var author = document.querySelector('.aplayer-author');
    if (title && title.textContent && title.textContent !== '...') {
      var songName = title.textContent;
      var artist = author ? author.textContent : '';

      // 用 meting api 搜索歌词
      var url = 'https://api.i-meto.com/meting/api?server=netease&type=search&id=' +
                encodeURIComponent(songName + ' ' + artist) + '&r=' + Math.random();
      fetch(url)
        .then(function(r) { return r.json(); })
        .then(function(data) {
          if (data && data.length > 0) {
            // 获取第一首歌的歌词
            var lrcUrl = 'https://api.i-meto.com/meting/api?server=netease&type=lrc&id=' +
                          data[0].id + '&r=' + Math.random();
            return fetch(lrcUrl).then(function(r) { return r.text(); });
          }
        })
        .then(function(lrcText) {
          if (lrcText) parseLrc(lrcText);
        })
        .catch(function() {});
    }
  }

  function parseLrc(lrcText) {
    lrcData = [];
    var lines = lrcText.split('\n');
    for (var i = 0; i < lines.length; i++) {
      var match = lines[i].match(/\[(\d{2}):(\d{2})\.(\d{2,3})\](.*)/);
      if (match) {
        var min = parseInt(match[1]);
        var sec = parseInt(match[2]);
        var ms = parseInt(match[3]);
        var time = min * 60 + sec + ms / 1000;
        var text = match[4].trim();
        if (text) {
          lrcData.push({ time: time, text: text });
        }
      }
    }
    lrcData.sort(function(a, b) { return a.time - b.time; });
  }

  function parseLrcFromDom(el) {
    // 从 APlayer 的歌词 DOM 解析
    lrcData = [];
    var items = el.querySelectorAll('p');
    for (var i = 0; i < items.length; i++) {
      var bg = items[i].getAttribute('data-bg') || '';
      var match = bg ? bg.match(/\[(\d{2}):(\d{2})\.(\d{2,3})\]/) : null;
      if (match) {
        var time = parseInt(match[1]) * 60 + parseInt(match[2]) + parseInt(match[3]) / 1000;
        var text = items[i].textContent.trim();
        if (text) lrcData.push({ time: time, text: text });
      }
    }
    lrcData.sort(function(a, b) { return a.time - b.time; });
  }

  function updateLrc() {
    if (!audioEl || !lrcData.length) return;
    var currentTime = audioEl.currentTime;
    var idx = -1;
    for (var i = lrcData.length - 1; i >= 0; i--) {
      if (currentTime >= lrcData[i].time) {
        idx = i;
        break;
      }
    }
    if (idx !== lrcIdx) {
      lrcIdx = idx;
    }
  }

  // ======================== 粒子系统 ========================

  function createStars() {
    stars = [];
    for (var i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * 2000 - 500,
        y: Math.random() * 2000 - 500,
        z: Math.random() * 1500 + 200,
        size: 0.5 + Math.random() * 2,
        speed: 0.2 + Math.random() * 0.8,
        brightness: 0.3 + Math.random() * 0.7,
      });
    }
  }

  // ======================== 动画主循环 ========================

  function animate() {
    if (!running) return;

    // 获取频谱能量
    var freq = null;
    if (analyser) {
      freq = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(freq);
      var total = 0;
      for (var i = 0; i < freq.length; i++) total += freq[i];
      energy = total / freq.length / 255;
    }

    // 平滑能量
    smoothEnergy += (energy - smoothEnergy) * 0.15;

    // 检测鼓点
    if (energy > 0.35 && smoothEnergy < 0.2) {
      beat = true;
      beatFrame = 10;
    }
    if (beatFrame > 0) beatFrame--;
    else beat = false;

    // === 绘制 ===
    ctx.clearRect(0, 0, W, H);

    // 深色背景
    var bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.8);
    bg.addColorStop(0, '#0e0e24');
    bg.addColorStop(0.5, '#08081a');
    bg.addColorStop(1, '#020208');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // 背景光晕（随音乐能量变化）
    var glowSize = W * (0.3 + smoothEnergy * 0.4);
    var glow = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, glowSize);
    var hue = 260 + smoothEnergy * 60;
    glow.addColorStop(0, 'hsla(' + hue + ', 60%, 40%, ' + (0.08 + smoothEnergy * 0.12) + ')');
    glow.addColorStop(0.5, 'hsla(' + hue + ', 40%, 20%, ' + (0.04 + smoothEnergy * 0.06) + ')');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // 星云粒子（随音乐流动）
    drawStars();

    // 歌词舞台
    drawLyrics();

    animId = requestAnimationFrame(animate);
  }

  // ======================== 星云粒子 ========================

  function drawStars() {
    var cx = W / 2;
    var cy = H / 2;
    var flowSpeed = 0.002 + smoothEnergy * 0.005;
    var beatBoost = beat ? 15 : 0;

    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];

      // 粒子缓慢旋转（银河效果）
      var angle = Math.atan2(s.y, s.x) + flowSpeed * s.speed;
      var radius = Math.sqrt(s.x * s.x + s.y * s.y);
      s.x = Math.cos(angle) * radius;
      s.y = Math.sin(angle) * radius;

      // Z轴呼吸
      s.z += (Math.random() - 0.5) * (1 + smoothEnergy * 2);

      // 投影到屏幕
      var scale = 600 / (s.z + 100);
      var px = cx + s.x * scale;
      var py = cy + s.y * scale - 30;

      // 裁剪
      if (px < 0 || px > W || py < 0 || py > H) continue;

      // 大小随能量变化
      var size = s.size * scale * (0.5 + smoothEnergy * 1.5) + (beat ? s.size : 0);

      // 亮度随音乐闪烁
      var bright = s.brightness * (0.5 + smoothEnergy * 0.8) + (beat ? 0.3 : 0);
      bright = Math.min(1, bright);

      // 颜色：白/蓝/紫渐变
      var hue2 = 240 + s.brightness * 60 + smoothEnergy * 30;
      ctx.beginPath();
      ctx.arc(px, py, Math.max(0.3, size), 0, Math.PI * 2);
      ctx.fillStyle = 'hsla(' + hue2 + ', 70%, ' + (70 + bright * 30) + '%, ' + bright + ')';
      ctx.fill();

      // 大能量时加光晕
      if (smoothEnergy > 0.25 && Math.random() > 0.7) {
        ctx.beginPath();
        ctx.arc(px, py, size * 3, 0, Math.PI * 2);
        ctx.fillStyle = 'hsla(' + hue2 + ', 60%, 70%, ' + (smoothEnergy * 0.04) + ')';
        ctx.fill();
      }
    }
  }

  // ======================== 歌词舞台 ========================

  function drawLyrics() {
    if (!lrcData.length) {
      // 没有歌词时显示歌曲名
      var title = document.querySelector('.aplayer-title');
      if (title && title.textContent && title.textContent !== '...') {
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';

        // 歌名 - 大号发光
        var fs = Math.min(W * 0.06, 36);
        ctx.font = '600 ' + fs + 'px system-ui, -apple-system, sans-serif';

        // 发光
        ctx.shadowColor = 'rgba(140, 120, 255, 0.4)';
        ctx.shadowBlur = 30 + smoothEnergy * 40;

        ctx.fillStyle = 'rgba(255,255,255,0.9)';
        ctx.fillText(title.textContent, W / 2, H / 2 - fs * 0.3);

        ctx.shadowBlur = 0;

        // 歌手
        var author = document.querySelector('.aplayer-author');
        if (author && author.textContent) {
          ctx.font = '14px system-ui, sans-serif';
          ctx.fillStyle = 'rgba(255,255,255,0.4)';
          ctx.fillText(author.textContent, W / 2, H / 2 + fs * 0.6);
        }
      }
      return;
    }

    // 有歌词时显示歌词
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';

    var currentText = '';
    var nextText = '';
    var currentIdx = lrcIdx >= 0 ? lrcIdx : -1;

    if (currentIdx >= 0 && currentIdx < lrcData.length) {
      currentText = lrcData[currentIdx].text;
    }
    if (currentIdx + 1 >= 0 && currentIdx + 1 < lrcData.length) {
      nextText = lrcData[currentIdx + 1].text;
    }

    // 主歌词（当前行）—— 大号发光字体
    if (currentText) {
      var fs = Math.min(W * 0.055, 32);
      ctx.font = '700 ' + fs + 'px system-ui, -apple-system, sans-serif';

      // 多层发光
      var glowIntensity = 0.3 + smoothEnergy * 0.4 + (beat ? 0.3 : 0);

      ctx.shadowColor = 'rgba(160, 130, 255, ' + glowIntensity + ')';
      ctx.shadowBlur = 40 + glowIntensity * 60;

      ctx.fillStyle = 'rgba(255,255,255,0.95)';
      ctx.fillText(currentText, W / 2, H / 2 - fs * 0.5);

      ctx.shadowBlur = 0;
    }

    // 下一行歌词（预显示）—— 小号半透明
    if (nextText) {
      var fs2 = Math.min(W * 0.03, 18);
      ctx.font = '400 ' + fs2 + 'px system-ui, sans-serif';
      ctx.fillStyle = 'rgba(255,255,255,0.3)';
      ctx.fillText(nextText, W / 2, H / 2 + W * 0.07);
    }

    // 底部状态
    ctx.font = '11px system-ui, sans-serif';
    ctx.fillStyle = 'rgba(255,255,255,0.15)';
    ctx.textAlign = 'right';
    ctx.textBaseline = 'bottom';
    // 显示歌词进度
    if (audioEl && lrcData.length > 0) {
      var progress = lrcIdx >= 0 ? (lrcIdx + 1) / lrcData.length : 0;
      ctx.fillText(Math.round(progress * 100) + '%', W - 15, H - 10);
    }
    ctx.textAlign = 'center';
  }

  // ======================== 启动 ========================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  document.addEventListener('pjax:complete', function() {
    setTimeout(init, 500);
  });

})();

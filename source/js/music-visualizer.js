/**
 * Music Visualizer — Emily 封面效果
 * 粒子氛围 + 封面光晕 + 右侧歌单
 */
(function() {
  'use strict';

  let canvas, ctx, W, H, dpr;
  let audioCtx, analyser, running = false;
  let animId = null, energy = 0, smoothEnergy = 0;

  // 粒子
  const STAR_COUNT = 120;
  let stars = [];
  let firstInit = true;

  // ======================== 初始化 ========================

  function init() {
    canvas = document.getElementById('viz-canvas');
    if (!canvas) return;
    ctx = canvas.getContext('2d');
    dpr = window.devicePixelRatio || 1;
    resize();
    window.addEventListener('resize', resize);
    if (firstInit) { createStars(); firstInit = false; }

    // 监听封面切换
    watchCover();

    // 连接音频
    waitForPlayer();
    animate();
  }

  function resize() {
    const p = canvas.parentElement;
    if (!p) return;
    const r = p.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = W * dpr; canvas.height = H * dpr;
    canvas.style.width = W + 'px'; canvas.style.height = H + 'px';
  }

  // ======================== 封面监听 ========================

  function watchCover() {
    function update() {
      const pic = document.querySelector('.aplayer-pic');
      if (!pic) return;
      const bg = pic.style.backgroundImage;
      if (!bg) return;
      const url = bg.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');

      const img = document.getElementById('cover-art');
      if (img && img.src !== url) { img.src = url; }

      // 光晕颜色从封面取色
      const temp = new Image();
      temp.crossOrigin = 'anonymous';
      temp.src = url;
      temp.onload = function() {
        const c = document.createElement('canvas');
        c.width = 1; c.height = 1;
        const cx = c.getContext('2d');
        cx.drawImage(temp, 0, 0, 1, 1);
        const p = cx.getImageData(0, 0, 1, 1).data;
        const glow = document.getElementById('cover-glow');
        if (glow) glow.style.background = `radial-gradient(circle, rgba(${p[0]},${p[1]},${p[2]},0.5) 0%, transparent 70%)`;
      };
    }

    // 轮询监听封面变化
    var lastUrl = '';
    setInterval(function() {
      var pic = document.querySelector('.aplayer-pic');
      if (!pic) return;
      var bg = pic.style.backgroundImage;
      if (!bg) return;
      var url = bg.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
      if (url !== lastUrl) {
        lastUrl = url;
        var img = document.getElementById('cover-art');
        if (img) img.src = url;
        // 更新光晕
        var temp = new Image();
        temp.crossOrigin = 'anonymous';
        temp.src = url;
        temp.onload = function() {
          var c = document.createElement('canvas');
          c.width = 1; c.height = 1;
          var cx = c.getContext('2d');
          cx.drawImage(temp, 0, 0, 1, 1);
          var p = cx.getImageData(0, 0, 1, 1).data;
          var glow = document.getElementById('cover-glow');
          if (glow) glow.style.background = 'radial-gradient(circle, rgba(' + p[0] + ',' + p[1] + ',' + p[2] + ',0.5) 0%, transparent 70%)';
        };
      }
    }, 500);

    // 监听 APlayer 事件更新标题
    document.querySelector('.aplayer')?.addEventListener('play', function() {
      setTimeout(updateTitle, 200);
    });
    setInterval(updateTitle, 1000);
  }

  function updateTitle() {
    var t = document.querySelector('.aplayer-title');
    var a = document.querySelector('.aplayer-author');
    var st = document.getElementById('song-title');
    var sa = document.getElementById('song-artist');
    if (t && t.textContent && st) st.textContent = t.textContent;
    if (a && a.textContent && sa) sa.textContent = a.textContent;
  }

  // ======================== 音频连接 ========================

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
    } catch(e) {
      running = true;
    }
  }

  // ======================== 粒子 ========================

  function createStars() {
    stars = [];
    for (var i = 0; i < STAR_COUNT; i++) {
      stars.push({
        x: Math.random() * 2000 - 500,
        y: Math.random() * 2000 - 500,
        z: Math.random() * 1200 + 200,
        size: 0.5 + Math.random() * 2.5,
        speed: 0.1 + Math.random() * 0.4,
        bright: 0.2 + Math.random() * 0.8,
      });
    }
  }

  // ======================== 动画 ========================

  function animate() {
    if (!canvas || !ctx) return;

    // 获取能量
    var freq = null;
    if (analyser) {
      freq = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(freq);
      var total = 0;
      for (var i = 0; i < freq.length; i++) total += freq[i];
      energy = total / freq.length / 255;
    }
    smoothEnergy += (energy - smoothEnergy) * 0.12;

    // 清空
    ctx.clearRect(0, 0, W, H);

    // 背景
    var bg = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, W * 0.8);
    bg.addColorStop(0, '#0e0e22');
    bg.addColorStop(0.5, '#080818');
    bg.addColorStop(1, '#020208');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // 光晕背景
    var glowR = W * (0.25 + smoothEnergy * 0.25);
    var glow = ctx.createRadialGradient(W / 2, H / 2, 0, W / 2, H / 2, glowR);
    var hue = 260 + smoothEnergy * 40;
    glow.addColorStop(0, 'hsla(' + hue + ', 60%, 40%, ' + (0.06 + smoothEnergy * 0.08) + ')');
    glow.addColorStop(0.6, 'hsla(' + hue + ', 40%, 20%, ' + (0.03 + smoothEnergy * 0.04) + ')');
    glow.addColorStop(1, 'transparent');
    ctx.fillStyle = glow;
    ctx.fillRect(0, 0, W, H);

    // 粒子
    drawStars();

    // 继续
    animId = requestAnimationFrame(animate);
  }

  function drawStars() {
    var cx = W / 2, cy = H / 2;
    var flow = 0.001 + smoothEnergy * 0.003;

    for (var i = 0; i < stars.length; i++) {
      var s = stars[i];
      var angle = Math.atan2(s.y, s.x) + flow * s.speed;
      var radius = Math.sqrt(s.x * s.x + s.y * s.y);
      s.x = Math.cos(angle) * radius;
      s.y = Math.sin(angle) * radius;

      var scale = 500 / (s.z + 100);
      var px = cx + s.x * scale;
      var py = cy + s.y * scale;

      if (px < -10 || px > W + 10 || py < -10 || py > H + 10) continue;

      var size = s.size * scale * (0.6 + smoothEnergy * 1.2);
      var bright = s.bright * (0.4 + smoothEnergy * 0.8);
      bright = Math.min(1, bright);

      var h = 240 + s.bright * 40 + smoothEnergy * 20;
      ctx.beginPath();
      ctx.arc(px, py, Math.max(0.3, size), 0, Math.PI * 2);
      ctx.fillStyle = 'hsla(' + h + ', 60%, ' + (65 + bright * 30) + '%, ' + (bright * 0.6) + ')';
      ctx.fill();
    }
  }

  // ======================== 启动 ========================

  function startup() {
    init();
    if (!animId) animate();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', startup);
  } else {
    startup();
  }
  document.addEventListener('pjax:complete', function() {
    setTimeout(startup, 500);
  });
})();

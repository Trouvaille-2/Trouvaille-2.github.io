/**
 * Music Visualizer — Mineradio 风格：封面粒子化 + 随节奏跳动
 * 专辑封面采样为彩色粒子阵列，随音乐低频鼓点扩散/收缩
 */
(function() {
  'use strict';

  let canvas, ctx, W, H, dpr;
  let audioCtx, analyser, source;
  let running = false, animId = null;
  let energy = 0, smoothEnergy = 0, bass = 0, beat = false;
  let particles = [];
  let coverUrl = '';
  let coverDensity = 55;
  let fallbackMode = false;

  // ======================== 初始化 ========================

  function init() {
    canvas = document.getElementById('viz-canvas');
    if (!canvas || running) return;
    ctx = canvas.getContext('2d');
    dpr = window.devicePixelRatio || 1;
    resize();
    window.addEventListener('resize', function() { resize(); });
    waitForPlayer();
    watchCover();
    animate();
    running = true;
  }

  function resize() {
    var r = canvas.parentElement.getBoundingClientRect();
    W = r.width; H = r.height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
    // 窗口大小变化时重建粒子
    if (particles.length > 0) {
      for (var i = 0; i < particles.length; i++) {
        var p = particles[i];
        p.ox = p.origX !== undefined ? p.origX : p.ox;
        p.oy = p.origY !== undefined ? p.origY : p.oy;
        // 重新计算位置比例
      }
    }
  }

  // ======================== 封面监听 ========================

  function watchCover() {
    var last = '';
    setInterval(function() {
      var pic = document.querySelector('.aplayer-pic');
      if (!pic) return;
      var bg = pic.style.backgroundImage;
      if (!bg) return;
      var url = bg.replace(/^url\(["']?/, '').replace(/["']?\)$/, '');
      if (url && url !== last) {
        last = url;
        loadCover(url);
      }
    }, 500);
  }

  function loadCover(url) {
    coverUrl = url;
    var img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = function() { sampleCover(img); };
    img.onerror = function() {
      var img2 = new Image();
      img2.src = url;
      img2.onload = function() { sampleCover(img2); };
      img2.onerror = function() { fallbackParticles(); };
    };
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
    if (source) return;
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
      source = audioCtx.createMediaElementSource(audio);
      source.connect(analyser);
      analyser.connect(audioCtx.destination);
    } catch(e) {}
  }

  // ======================== 封面采样 → 粒子 ========================

  function sampleCover(img) {
    fallbackMode = false;
    var s = coverDensity;
    var iw = s, ih = Math.round(s * img.height / img.width);
    var off = document.createElement('canvas');
    off.width = iw; off.height = ih;
    var oc = off.getContext('2d');
    oc.drawImage(img, 0, 0, iw, ih);
    var id = oc.getImageData(0, 0, iw, ih);
    buildParticles(id.data, iw, ih);
  }

  function buildPixels(idata, w, h) {
    return idata;
  }

  function buildParticles(data, w, h) {
    particles = [];
    var gap = 1;
    // 计算粒子在舞台上的布局
    var padding = 60;
    var availW = W - padding * 2;
    var availH = H - padding * 2;
    var scaleX = availW / (w + 2);
    var scaleY = availH / (h + 2);
    var s = Math.min(scaleX, scaleY) * 0.85;
    var cx = (W - w * s) / 2;
    var cy = (H - h * s) / 2;

    var count = 0;
    for (var y = 0; y < h; y += gap) {
      for (var x = 0; x < w; x += gap) {
        var idx = (y * w + x) * 4;
        var r = data[idx], g = data[idx+1], b = data[idx+2], a = data[idx+3];
        if (a < 100) continue;

        var tx = cx + x * s;
        var ty = cy + y * s;
        var size = 1.5 + (255 - Math.max(r, g, b)) / 255 * 2.5;

        particles.push({
          x: tx, y: ty,       // 当前位置
          tx: tx, ty: ty,     // 目标位置
          ox: tx, oy: ty,     // 原始目标（无波动时）
          c: 'rgb(' + r + ',' + g + ',' + b + ')',
          sz: size,
          ph: Math.random() * Math.PI * 2,  // 相位差
          sp: 0.3 + Math.random() * 1.0,    // 速度系数
        });
        count++;
      }
    }

    // 如果粒子太少，降低密度重试
    if (count < 50 && coverDensity < 100) {
      coverDensity += 10;
      sampleCoverUrl();
      return;
    }
  }

  function sampleCoverUrl() {
    if (coverUrl) loadCover(coverUrl);
  }

  function fallbackParticles() {
    if (particles.length > 0) return;
    fallbackMode = true;
    particles = [];
    for (var i = 0; i < 500; i++) {
      var x = W * 0.1 + Math.random() * W * 0.8;
      var y = H * 0.1 + Math.random() * H * 0.8;
      particles.push({
        x: x, y: y, tx: x, ty: y, ox: x, oy: y,
        c: 'hsl(' + (i * 0.72) + ', 80%, 65%)',
        sz: 2 + Math.random() * 2,
        ph: Math.random() * Math.PI * 2,
        sp: 0.3 + Math.random() * 1.0,
      });
    }
  }

  // ======================== 动画 ========================

  function animate() {
    animId = requestAnimationFrame(animate);

    // 计算音乐能量
    var freq = null;
    energy = 0; bass = 0;
    if (analyser) {
      freq = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(freq);
      var all = 0;
      for (var i = 0; i < freq.length; i++) all += freq[i];
      energy = all / freq.length / 255;
      // 低频 (前4个)
      for (var j = 0; j < 4 && j < freq.length; j++) bass += freq[j];
      bass = bass / 4 / 255;
    }

    var prevSmooth = smoothEnergy;
    smoothEnergy += (energy - smoothEnergy) * 0.15;

    // 鼓点检测
    var spread = bass * 40 * (1 - smoothEnergy * 0.5);
    beat = bass > 0.3 && smoothEnergy > prevSmooth;

    // === 绘制 ===
    ctx.clearRect(0, 0, W, H);

    // 背景
    var bg = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, W*0.8);
    bg.addColorStop(0, '#0e0e24');
    bg.addColorStop(0.5, '#08081a');
    bg.addColorStop(1, '#020208');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // 背景光晕
    if (bass > 0.05) {
      var glowR = W * (0.1 + bass * 0.3);
      var gh = ctx.createRadialGradient(W/2, H/2, 0, W/2, H/2, glowR);
      var hue = 260 + bass * 50;
      gh.addColorStop(0, 'hsla(' + hue + ', 70%, 50%, ' + (bass * 0.15) + ')');
      gh.addColorStop(1, 'transparent');
      ctx.fillStyle = gh;
      ctx.fillRect(0, 0, W, H);
    }

    // 绘制粒子
    drawParticles(spread);

    // 歌曲信息
    drawInfo();
  }

  function drawParticles(spread) {
    if (!particles.length) return;
    var t = performance.now();

    for (var i = 0; i < particles.length; i++) {
      var p = particles[i];

      // 粒子随音乐波动：低频 → 主要扩散，高频 → 细微颤动
      var bassOffset = spread * 0.7;
      var tremor = energy * 8;

      var ox = Math.sin(p.ph + t * 0.002 * p.sp) * bassOffset +
               Math.sin(p.ph * 1.3 + t * 0.004) * tremor;
      var oy = Math.cos(p.ph + t * 0.0015 * p.sp) * bassOffset * 0.8 +
               Math.cos(p.ph * 1.5 + t * 0.003) * tremor * 0.7;

      // 鼓点时更大的跳动
      if (beat) {
        ox += Math.sin(p.ph * 2 + t * 0.01) * 15;
        oy += Math.cos(p.ph * 2 + t * 0.01) * 12;
      }

      // 更新目标位置（原始位置 + 音乐偏移）
      p.tx = p.ox + ox;
      p.ty = p.oy + oy;

      // 平滑归位
      p.x += (p.tx - p.x) * 0.08;
      p.y += (p.ty - p.y) * 0.08;

      // 绘制
      var size = p.sz + (beat ? p.sz * 0.8 : 0) + energy * 1.5;
      ctx.beginPath();
      ctx.arc(p.x, p.y, Math.max(0.5, size), 0, Math.PI * 2);
      ctx.fillStyle = p.c;
      ctx.fill();

      // 发光（大能量时）
      if (bass > 0.2) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, size * 2.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(255,255,255,' + (bass * 0.04) + ')';
        ctx.fill();
      }
    }
  }

  function drawInfo() {
    // 歌名 + 歌手简单显示在底部
    var title = document.querySelector('.aplayer-title');
    var author = document.querySelector('.aplayer-author');
    if (!title || !title.textContent || title.textContent === '...') return;

    // 半透明黑底
    ctx.fillStyle = 'rgba(0,0,0,0.4)';
    var tw = ctx.measureText(title.textContent).width || 200;
    var pad = 20;
    var bx = (W - tw) / 2 - pad;
    var by = H - 70;
    var bw = tw + pad * 2;
    var bh = 50;
    ctx.beginPath();
    ctx.roundRect(bx, by, bw, bh, 10);
    ctx.fill();

    ctx.textAlign = 'center';
    ctx.textBaseline = 'bottom';
    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '16px system-ui, sans-serif';
    ctx.fillText(title.textContent, W / 2, by + 33);

    if (author && author.textContent) {
      ctx.fillStyle = 'rgba(255,255,255,0.35)';
      ctx.font = '12px system-ui, sans-serif';
      ctx.fillText(author.textContent, W / 2, by + 48);
    }
  }

  // ======================== 启动 ========================

  function startup() {
    if (document.getElementById('viz-canvas')) {
      if (animId) { cancelAnimationFrame(animId); running = false; }
      init();
    }
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

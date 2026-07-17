/**
 * Music Visualizer - 封面粒子化 + 频谱
 * 用于 /music/ 页面，配合 APlayer + MetingJS
 */
(function() {
  'use strict';

  const CFG = {
    density: 50,       // 采样密度
    pSize: 2.5,        // 粒子大小
    spread: 18,        // 音乐扩散半径
    smooth: 0.06,      // 归位平滑度
    bars: 64,          // 频谱柱数
  };

  let canvas, ctx, W, H, dpr;
  let audioCtx, analyser;
  let particles = [], running = false;
  let animId = null, imgData = null;
  let coverUrl = '';

  // ======================== 初始化 ========================

  function init() {
    canvas = document.getElementById('viz-canvas');
    if (!canvas || running) return;
    ctx = canvas.getContext('2d');
    dpr = window.devicePixelRatio || 1;
    resize();
    window.addEventListener('resize', resize);
    waitForPlayer();
  }

  function resize() {
    const rect = canvas.parentElement.getBoundingClientRect();
    W = rect.width;
    H = rect.height;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    canvas.style.width = W + 'px';
    canvas.style.height = H + 'px';
  }

  // ======================== 连接音频 ========================

  function waitForPlayer() {
    function tryConnect() {
      const audio = document.querySelector('.aplayer audio');
      const el = document.querySelector('.aplayer');
      if (audio && audio.readyState > 0 && el) {
        connectAudio(audio, el);
        return true;
      }
      return false;
    }

    // 轮询
    const poll = setInterval(() => {
      if (tryConnect()) clearInterval(poll);
    }, 600);
    setTimeout(() => clearInterval(poll), 15000);

    // 事件
    document.addEventListener('play', tryConnect);

    // 如果 APlayer 还没创建，等 DOM
    if (document.querySelector('.aplayer')) {
      setTimeout(tryConnect, 1000);
    }
  }

  function connectAudio(audio, el) {
    if (running) return;
    try {
      audioCtx = new (window.AudioContext || window.webkitAudioContext)();
      analyser = audioCtx.createAnalyser();
      analyser.fftSize = 256;

      if (audioCtx.state === 'suspended') {
        document.addEventListener('click', function r() {
          audioCtx.resume();
          document.removeEventListener('click', r);
        });
      }

      // 每个 audio 只能 createMediaElementSource 一次
      try {
        const src = audioCtx.createMediaElementSource(audio);
        src.connect(analyser);
        analyser.connect(audioCtx.destination);
      } catch (e) {
        // 可能已经连接过了
      }

      running = true;
      loadCover();
      el.addEventListener('play', loadCover);
      animate();
    } catch (e) {
      running = true;
      loadCover();
      animate();
    }
  }

  // ======================== 封面粒子化 ========================

  function getCoverUrl() {
    const pic = document.querySelector('.aplayer-pic');
    if (!pic) return '';
    const bg = pic.style.backgroundImage;
    return bg ? bg.replace(/^url\(["']?/, '').replace(/["']?\)$/, '') : '';
  }

  function loadCover() {
    const url = getCoverUrl();
    if (!url || url === coverUrl) return;
    coverUrl = url;

    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.src = url;
    img.onload = () => sampleCover(img);
    img.onerror = () => {
      const img2 = new Image();
      img2.src = url;
      img2.onload = () => sampleCover(img2);
      img2.onerror = () => fallbackParticles();
    };
  }

  function sampleCover(img) {
    const s = CFG.density;
    const w = s, h = Math.round(s * img.height / img.width);
    const off = document.createElement('canvas');
    off.width = w; off.height = h;
    const oc = off.getContext('2d');
    oc.drawImage(img, 0, 0, w, h);
    const id = oc.getImageData(0, 0, w, h);
    imgData = id;
    buildParticles(id, w, h);
  }

  function buildParticles(id, w, h) {
    particles = [];
    const d = id.data;
    const gap = 1;
    const cw = W, ch = H;
    const sx = cw / (w + 2) * 0.78;
    const sy = ch / (h + 2) * 0.78;
    const s = Math.min(sx, sy);
    const cx = (cw - w * s) / 2;
    const cy = (ch - h * s) / 2 - 30;

    for (let y = 0; y < h; y += gap) {
      for (let x = 0; x < w; x += gap) {
        const i = (y * w + x) * 4;
        const r = d[i], g = d[i + 1], b = d[i + 2], a = d[i + 3];
        if (a < 128) continue;

        const tx = cx + x * s;
        const ty = cy + y * s;
        particles.push({
          x: tx + (Math.random() - 0.5) * 80,
          y: ty + (Math.random() - 0.5) * 80,
          tx, ty, ox: tx, oy: ty,
          c: `rgb(${r},${g},${b})`,
          sz: CFG.pSize * (1 + (255 - a) / 510),
          ph: Math.random() * Math.PI * 2,
          sp: 0.3 + Math.random() * 1.2,
        });
      }
    }

    if (particles.length < 50) {
      buildParticles(id, w, h);
    }
  }

  function fallbackParticles() {
    particles = [];
    for (let i = 0; i < 500; i++) {
      const x = W * 0.1 + Math.random() * W * 0.8;
      const y = H * 0.1 + Math.random() * H * 0.8;
      particles.push({
        x, y, tx: x, ty: y, ox: x, oy: y,
        c: `hsl(${i * 0.72}, 80%, 65%)`,
        sz: 1.5 + Math.random() * 2,
        ph: Math.random() * Math.PI * 2,
        sp: 0.3 + Math.random() * 1.2,
      });
    }
  }

  // ======================== 动画 ========================

  function animate() {
    if (!running) return;

    // 获取频谱
    let freq = null, bass = 0, mid = 0, avg = 0;
    if (analyser) {
      freq = new Uint8Array(analyser.frequencyBinCount);
      analyser.getByteFrequencyData(freq);
      const n = freq.length;
      if (n > 0) {
        for (let i = 0; i < n; i++) {
          if (i < 4) bass += freq[i];
          else if (i < 14) mid += freq[i];
        }
        bass = bass / 4 / 255;
        mid = mid / 10 / 255;
        avg = freq.reduce((a, b) => a + b, 0) / n / 255;
      }
    }

    const energy = Math.min(1, bass * 2.5 + mid * 0.3);

    // 清空
    ctx.clearRect(0, 0, W, H);

    // 背景
    const bg = ctx.createLinearGradient(0, 0, 0, H);
    bg.addColorStop(0, '#08081a');
    bg.addColorStop(0.5, '#10102e');
    bg.addColorStop(1, '#1a082a');
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    // 频谱
    if (freq) drawSpectrum(freq, energy);

    // 粒子
    drawParticles(energy, bass, mid);

    // 歌曲信息
    drawSongInfo(energy);

    animId = requestAnimationFrame(animate);
  }

  function drawSpectrum(freq) {
    const n = Math.min(CFG.bars, freq.length);
    const bw = W / n;
    const mh = H * 0.22;
    const by = H - 10;

    for (let i = 0; i < n; i++) {
      const idx = Math.floor(i * freq.length / n);
      const v = freq[idx] / 255;
      if (v < 0.04) continue;

      const bh = v * mh;
      const h = 240 + i * 1.8;

      ctx.fillStyle = `hsla(${h}, 85%, 65%, ${0.5 + v * 0.5})`;
      const r = Math.min(2.5, bw / 3);
      ctx.beginPath();
      ctx.roundRect(i * bw + 0.5, by - bh, bw - 1, bh, r);
      ctx.fill();
    }
  }

  function drawParticles(energy, bass, mid) {
    if (!particles.length) return;
    const spread = energy * CFG.spread;

    for (const p of particles) {
      const ox = Math.sin(p.ph + performance.now() * 0.002 * p.sp) * spread;
      const oy = Math.cos(p.ph + performance.now() * 0.0015 * p.sp) * spread * 0.6;

      p.tx = p.ox + ox;
      p.ty = p.oy + oy;

      p.x += (p.tx - p.x) * CFG.smooth;
      p.y += (p.ty - p.y) * CFG.smooth;

      const sz = p.sz + energy * 1.2;
      ctx.beginPath();
      ctx.arc(p.x, p.y, sz, 0, Math.PI * 2);
      ctx.fillStyle = p.c;
      ctx.fill();

      // 发光
      if (energy > 0.25) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, sz * 2.2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(255,255,255,${energy * 0.06})`;
        ctx.fill();
      }
    }
  }

  function drawSongInfo(energy) {
    const title = document.querySelector('.aplayer-title');
    const author = document.querySelector('.aplayer-author');
    if (!title) return;

    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    ctx.font = '18px system-ui, sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(title.textContent, W / 2, 30);

    if (author && author.textContent) {
      ctx.fillStyle = 'rgba(255,255,255,0.45)';
      ctx.font = '13px system-ui, sans-serif';
      ctx.fillText(author.textContent, W / 2, 52);
    }

    // 播放状态
    const playing = document.querySelector('.aplayer-play')?.classList.contains('aplayer-play');
    if (playing) {
      ctx.fillStyle = `rgba(255,255,255,${0.15 + energy * 0.15})`;
      ctx.font = '11px system-ui, sans-serif';
      ctx.fillText('▶ PLAYING', W / 2, H - 20);
    }
  }

  // ======================== 启动 ========================

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
  document.addEventListener('pjax:complete', () => setTimeout(init, 500));

})();

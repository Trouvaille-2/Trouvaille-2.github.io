---
title: 音乐馆
date: 2021-04-24 21:41:30
type: music
aplayer: true
top_img: false
comments: false
aside: false
---

<style>
.music-viz-wrap {
  position: relative;
  width: 100%;
  height: 72vh;
  min-height: 460px;
  border-radius: 16px;
  overflow: hidden;
  background: #08081a;
  margin-bottom: 20px;
}
#viz-canvas {
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  height: 100%;
  display: block;
}
.viz-player {
  position: absolute;
  bottom: 20px;
  left: 50%;
  transform: translateX(-50%);
  z-index: 10;
  width: 92%;
  max-width: 520px;
}
/* 覆盖 APlayer 样式，让他透明融入背景 */
.viz-player .aplayer {
  background: rgba(255,255,255,0.08) !important;
  backdrop-filter: blur(12px) !important;
  -webkit-backdrop-filter: blur(12px) !important;
  border: 1px solid rgba(255,255,255,0.08) !important;
  border-radius: 14px !important;
}
.viz-player .aplayer .aplayer-info {
  border-bottom: none !important;
}
.viz-player .aplayer .aplayer-list {
  border-radius: 12px !important;
  overflow: hidden !important;
}
.viz-player .aplayer.aplayer-fixed {
  position: relative !important;
  bottom: auto !important;
  right: auto !important;
}
@media (prefers-color-scheme: light) {
  .music-viz-wrap { background: #0a0a20; }
}
</style>

<div class="music-viz-wrap">
  <canvas id="viz-canvas"></canvas>
  <div class="viz-player">
{% meting "9516678957" "netease" "playlist" "autoplay" "mutex:true" "listmaxheight:220px" "theme:#ad7a86" "preload:auto" %}
  </div>
</div>

<script src="/js/music-visualizer.js"></script>

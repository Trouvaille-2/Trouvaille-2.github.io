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
.music-layout {
  display: flex;
  height: 75vh;
  min-height: 520px;
  border-radius: 16px;
  overflow: hidden;
  background: #08081a;
}
.music-stage {
  flex: 1;
  position: relative;
  overflow: hidden;
  min-width: 0;
}
#viz-canvas {
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  height: 100%;
}
.music-sidebar {
  width: 330px;
  flex-shrink: 0;
  background: rgba(0,0,0,0.3);
  border-left: 1px solid rgba(255,255,255,0.06);
  display: flex;
  flex-direction: column;
  overflow: hidden;
}
.music-sidebar .aplayer {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
  margin: 0 !important;
  flex: 1;
  display: flex;
  flex-direction: column;
}
.music-sidebar .aplayer .aplayer-body {
  flex-shrink: 0;
}
.music-sidebar .aplayer .aplayer-info {
  border-bottom: 1px solid rgba(255,255,255,0.06) !important;
  padding: 10px 12px !important;
}
.music-sidebar .aplayer .aplayer-pic {
  width: 48px !important;
  height: 48px !important;
  border-radius: 10px !important;
}
.music-sidebar .aplayer .aplayer-title {
  color: rgba(255,255,255,0.85) !important;
  font-size: 14px !important;
}
.music-sidebar .aplayer .aplayer-author {
  color: rgba(255,255,255,0.4) !important;
  font-size: 12px !important;
}
.music-sidebar .aplayer .aplayer-list {
  position: relative !important;
  flex: 1;
  overflow-y: auto !important;
  background: transparent !important;
  border: none !important;
  max-height: none !important;
}
.music-sidebar .aplayer .aplayer-list ol {
  padding: 0 !important;
}
.music-sidebar .aplayer .aplayer-list ol li {
  border-bottom: 1px solid rgba(255,255,255,0.04) !important;
  color: rgba(255,255,255,0.6) !important;
  padding: 10px 14px !important;
}
.music-sidebar .aplayer .aplayer-list ol li:hover {
  background: rgba(255,255,255,0.06) !important;
  color: rgba(255,255,255,0.9) !important;
}
.music-sidebar .aplayer .aplayer-list ol li.aplayer-list-light {
  background: rgba(140,120,255,0.12) !important;
  color: rgba(255,255,255,0.95) !important;
}
.music-sidebar .aplayer .aplayer-list::-webkit-scrollbar { width: 4px }
.music-sidebar .aplayer .aplayer-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px }
</style>

<div class="music-layout">
  <div class="music-stage">
    <canvas id="viz-canvas"></canvas>
  </div>
  <div class="music-sidebar">
{% meting "9516678957" "netease" "playlist" "autoplay" "mutex:true" "listmaxheight:0" "theme:#8c78ff" "preload:auto" "order:random" %}
  </div>
</div>

<script src="/js/music-visualizer.js"></script>

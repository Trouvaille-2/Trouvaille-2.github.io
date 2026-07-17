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
  gap: 0;
  height: 72vh;
  min-height: 500px;
  border-radius: 16px;
  overflow: hidden;
  background: #08081a;
  position: relative;
}
.music-stage {
  flex: 1;
  position: relative;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
}
#viz-canvas {
  position: absolute;
  top: 0; left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
}
.cover-stage {
  position: relative;
  z-index: 2;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 16px;
}
.cover-wrap {
  position: relative;
  width: 260px;
  height: 260px;
  border-radius: 20px;
  overflow: visible;
}
#cover-art {
  width: 260px;
  height: 260px;
  border-radius: 20px;
  object-fit: cover;
  box-shadow: 0 0 60px rgba(140,120,255,0.15), 0 0 120px rgba(100,80,200,0.08);
  transition: box-shadow .5s;
  position: relative;
  z-index: 1;
}
.cover-glow {
  position: absolute;
  top: -30px; left: -30px;
  width: calc(100% + 60px);
  height: calc(100% + 60px);
  border-radius: 50%;
  filter: blur(50px);
  opacity: 0.3;
  transition: background .8s;
  z-index: 0;
  pointer-events: none;
}
.song-info {
  text-align: center;
  z-index: 1;
}
.song-title {
  font-size: 22px;
  font-weight: 700;
  color: rgba(255,255,255,0.9);
  margin-bottom: 4px;
  text-shadow: 0 0 20px rgba(140,120,255,0.3);
}
.song-artist {
  font-size: 14px;
  color: rgba(255,255,255,0.45);
}
.music-sidebar {
  width: 340px;
  min-width: 340px;
  background: rgba(255,255,255,0.03);
  backdrop-filter: blur(8px);
  border-left: 1px solid rgba(255,255,255,0.06);
  padding: 16px;
  overflow-y: auto;
}
/* 侧边栏 APlayer 样式 */
.music-sidebar .aplayer {
  background: transparent !important;
  border: none !important;
  box-shadow: none !important;
}
.music-sidebar .aplayer .aplayer-info {
  border-bottom: 1px solid rgba(255,255,255,0.06) !important;
  padding: 10px 0 !important;
}
.music-sidebar .aplayer .aplayer-pic {
  width: 50px !important;
  height: 50px !important;
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
  max-height: calc(72vh - 200px) !important;
  overflow-y: auto !important;
  background: transparent !important;
  border: none !important;
}
.music-sidebar .aplayer .aplayer-list ol {
  padding: 0 !important;
}
.music-sidebar .aplayer .aplayer-list ol li {
  border-bottom: 1px solid rgba(255,255,255,0.04) !important;
  color: rgba(255,255,255,0.6) !important;
  padding: 10px 12px !important;
}
.music-sidebar .aplayer .aplayer-list ol li:hover {
  background: rgba(255,255,255,0.05) !important;
  color: rgba(255,255,255,0.9) !important;
}
.music-sidebar .aplayer .aplayer-list ol li.aplayer-list-light {
  background: rgba(140,120,255,0.12) !important;
  color: rgba(255,255,255,0.95) !important;
}
.music-sidebar .aplayer .aplayer-list::-webkit-scrollbar { width: 4px }
.music-sidebar .aplayer .aplayer-list::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.15); border-radius: 4px }
@media (max-width: 768px) {
  .music-layout { flex-direction: column; height: auto }
  .music-stage { min-height: 380px }
  .cover-wrap, #cover-art { width: 180px; height: 180px }
  .music-sidebar { width: 100%; min-width: unset; border-left: none; border-top: 1px solid rgba(255,255,255,0.06) }
}
</style>

<div class="music-layout">
  <div class="music-stage">
    <canvas id="viz-canvas"></canvas>
    <div class="cover-stage">
      <div class="cover-wrap">
        <div class="cover-glow" id="cover-glow"></div>
        <img id="cover-art" src="/img/miao5.webp" alt="cover">
      </div>
      <div class="song-info">
        <div class="song-title" id="song-title">🎵 选择一首歌开始</div>
        <div class="song-artist" id="song-artist"></div>
      </div>
    </div>
  </div>
  <div class="music-sidebar">
{% meting "9516678957" "netease" "playlist" "autoplay" "mutex:true" "listmaxheight:600px" "theme:#8c78ff" "preload:auto" "order:random" %}
  </div>
</div>

<script src="/js/music-visualizer.js"></script>

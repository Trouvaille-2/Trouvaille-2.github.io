/**
 * 404 页面彩蛋：Chrome 经典跳一跳小恐龙游戏 (Dino Runner)
 * 仅在 404 错误页面自动激活，支持键盘空格/上键与手机触屏点击
 */

(function () {
  'use strict';

  function initDino() {
    const errorContent = document.querySelector('.error-content');
    if (!errorContent || document.getElementById('dino-game-wrapper')) return;

    const wrapper = document.createElement('div');
    wrapper.id = 'dino-game-wrapper';
    wrapper.style.cssText = `
      margin: 25px auto 10px auto;
      max-width: 600px;
      width: 95%;
      background: rgba(255, 255, 255, 0.08);
      border-radius: 14px;
      border: 1px solid rgba(162, 155, 254, 0.25);
      box-shadow: 0 8px 30px rgba(0, 0, 0, 0.15);
      padding: 16px;
      text-align: center;
      position: relative;
      user-select: none;
    `;

    wrapper.innerHTML = `
      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px; font-size: 0.88rem; opacity: 0.85;">
        <span>🦖 <b>404 摸鱼小彩蛋 · 经典跳一跳</b></span>
        <span>得分: <b id="dino-score">0</b> | 最高: <b id="dino-high">0</b></span>
      </div>
      <canvas id="dino-canvas" width="580" height="150" style="width: 100%; height: 150px; display: block; border-radius: 8px; background: rgba(0,0,0,0.03); cursor: pointer;"></canvas>
      <div id="dino-tip" style="margin-top: 10px; font-size: 0.8rem; opacity: 0.75;">
        按 <b>空格键 / 方向键上</b> 或 <b>点击/触摸屏幕</b> 开始跳跃
      </div>
    `;

    errorContent.appendChild(wrapper);

    const canvas = document.getElementById('dino-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const scoreEl = document.getElementById('dino-score');
    const highEl = document.getElementById('dino-high');
    const tipEl = document.getElementById('dino-tip');

    let highScore = parseInt(localStorage.getItem('dino_high_score') || '0', 10);
    highEl.textContent = highScore;

    let score = 0;
    let gameSpeed = 5;
    let isPlaying = false;
    let isGameOver = false;
    let animId = null;

    // 恐龙属性
    const dino = {
      x: 40,
      y: 110,
      width: 22,
      height: 26,
      vy: 0,
      gravity: 0.75,
      jumpForce: -11.5,
      isGrounded: true,
      legStep: 0
    };

    // 障碍物与地面
    let obstacles = [];
    let clouds = [{ x: 200, y: 30 }, { x: 450, y: 45 }];
    const groundY = 135;

    function resetGame() {
      score = 0;
      gameSpeed = 5;
      obstacles = [];
      dino.y = groundY - dino.height;
      dino.vy = 0;
      dino.isGrounded = true;
      isGameOver = false;
      isPlaying = true;
      tipEl.innerHTML = '奔跑中... 避开前方障碍物！';
    }

    function jump() {
      if (isGameOver) {
        resetGame();
        return;
      }
      if (!isPlaying) {
        resetGame();
        return;
      }
      if (dino.isGrounded) {
        dino.vy = dino.jumpForce;
        dino.isGrounded = false;
      }
    }

    // 事件绑定：键盘与触控
    window.addEventListener('keydown', (e) => {
      if (e.code === 'Space' || e.code === 'ArrowUp') {
        e.preventDefault();
        jump();
      }
    });

    canvas.addEventListener('click', (e) => {
      e.preventDefault();
      jump();
    });

    canvas.addEventListener('touchstart', (e) => {
      e.preventDefault();
      jump();
    }, { passive: false });

    // 主绘制循环
    function update() {
      if (!isPlaying) {
        drawScene();
        animId = requestAnimationFrame(update);
        return;
      }

      // 更新恐龙状态
      dino.vy += dino.gravity;
      dino.y += dino.vy;
      if (dino.y >= groundY - dino.height) {
        dino.y = groundY - dino.height;
        dino.vy = 0;
        dino.isGrounded = true;
      }

      // 更新分数与递增难度
      score += 0.2;
      gameSpeed = 5 + Math.floor(score / 150) * 0.5;
      scoreEl.textContent = Math.floor(score);

      // 云朵移动
      clouds.forEach((c) => {
        c.x -= 1;
        if (c.x < -40) c.x = canvas.width + 40;
      });

      // 障碍物生成与移动
      if (obstacles.length === 0 || obstacles[obstacles.length - 1].x < canvas.width - (180 + Math.random() * 120)) {
        const isTall = Math.random() > 0.5;
        const obW = isTall ? 16 : 24;
        const obH = isTall ? 32 : 22;
        obstacles.push({
          x: canvas.width + 20,
          y: groundY - obH,
          width: obW,
          height: obH
        });
      }

      for (let i = obstacles.length - 1; i >= 0; i--) {
        const ob = obstacles[i];
        ob.x -= gameSpeed;

        // 碰撞检测 (AABB)
        const hitX = dino.x + dino.width > ob.x + 3 && dino.x + 3 < ob.x + ob.width;
        const hitY = dino.y + dino.height > ob.y + 3;
        if (hitX && hitY) {
          gameOver();
          break;
        }

        if (ob.x + ob.width < -10) {
          obstacles.splice(i, 1);
        }
      }

      drawScene();
      if (!isGameOver) {
        animId = requestAnimationFrame(update);
      }
    }

    function gameOver() {
      isGameOver = true;
      isPlaying = false;
      const finalScore = Math.floor(score);
      if (finalScore > highScore) {
        highScore = finalScore;
        localStorage.setItem('dino_high_score', highScore);
        highEl.textContent = highScore;
      }
      tipEl.innerHTML = `<span style="color:#ff6b6b; font-weight:bold;">💥 哎呀撞上了！最终得分: ${finalScore}</span> (点击或按空格重新开始)`;
      drawGameOverOverlay();
    }

    function drawScene() {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const isDark = document.documentElement.getAttribute('data-theme') === 'dark';
      const mainColor = isDark ? '#e0e0e0' : '#4a4a4a';
      const accentColor = isDark ? '#68d391' : '#319795';

      // 1. 画地面
      ctx.strokeStyle = isDark ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(0, groundY);
      ctx.lineTo(canvas.width, groundY);
      ctx.stroke();

      // 2. 画云朵
      ctx.fillStyle = isDark ? 'rgba(255,255,255,0.15)' : 'rgba(0,0,0,0.1)';
      clouds.forEach((c) => {
        ctx.beginPath();
        ctx.arc(c.x, c.y, 10, 0, Math.PI * 2);
        ctx.arc(c.x + 10, c.y - 4, 12, 0, Math.PI * 2);
        ctx.arc(c.x + 22, c.y, 9, 0, Math.PI * 2);
        ctx.fill();
      });

      // 3. 画小恐龙 (像素风格矩形组合)
      ctx.fillStyle = accentColor;
      // 躯干
      ctx.fillRect(dino.x + 4, dino.y + 6, 14, 15);
      // 头部
      ctx.fillRect(dino.x + 10, dino.y, 12, 10);
      // 眼睛
      ctx.fillStyle = isDark ? '#1a202c' : '#ffffff';
      ctx.fillRect(dino.x + 13, dino.y + 2, 2.5, 2.5);
      // 腿部奔跑动画
      ctx.fillStyle = accentColor;
      dino.legStep = (dino.legStep + 0.2) % 2;
      if (dino.isGrounded) {
        if (dino.legStep < 1) {
          ctx.fillRect(dino.x + 6, dino.y + 21, 3, 5);
          ctx.fillRect(dino.x + 14, dino.y + 21, 3, 3);
        } else {
          ctx.fillRect(dino.x + 6, dino.y + 21, 3, 3);
          ctx.fillRect(dino.x + 14, dino.y + 21, 3, 5);
        }
      } else {
        ctx.fillRect(dino.x + 6, dino.y + 21, 3, 4);
        ctx.fillRect(dino.x + 13, dino.y + 21, 3, 4);
      }

      // 4. 画障碍物（仙人掌）
      ctx.fillStyle = isDark ? '#fc8181' : '#e53e3e';
      obstacles.forEach((ob) => {
        // 主干
        ctx.fillRect(ob.x + ob.width * 0.35, ob.y, ob.width * 0.3, ob.height);
        // 左枝干
        ctx.fillRect(ob.x, ob.y + ob.height * 0.25, ob.width * 0.35, 4);
        ctx.fillRect(ob.x, ob.y + ob.height * 0.1, 4, ob.height * 0.25);
        // 右枝干
        ctx.fillRect(ob.x + ob.width * 0.65, ob.y + ob.height * 0.4, ob.width * 0.35, 4);
        ctx.fillRect(ob.x + ob.width - 4, ob.y + ob.height * 0.2, 4, ob.height * 0.25);
      });
    }

    function drawGameOverOverlay() {
      drawScene();
      ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 18px sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', canvas.width / 2, canvas.height / 2 - 6);
      ctx.font = '12px sans-serif';
      ctx.fillText('按空格键或点击重新起跑', canvas.width / 2, canvas.height / 2 + 16);
    }

    // 初次绘制场景
    drawScene();
    update();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initDino);
  } else {
    initDino();
  }
  document.addEventListener('pjax:complete', initDino);
})();

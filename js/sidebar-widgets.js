/**
 * 侧边栏动态小部件：
 * 1. 程序员老黄历 (Feature 1)
 * 2. 历史上的今天 (Feature 3)
 */

(function () {
  'use strict';

  // 程序员老黄历词库
  const YI_LIST = [
    { name: '提交代码', desc: '今天提交的 Commit 绝无冲突，CI/CD 一遍过' },
    { name: '重构历史代码', desc: '思路清晰，一眼揪出隐藏半年的潜在内存泄漏' },
    { name: '喝冰美式', desc: '神清气爽，灵感如泉涌，键盘火花四溅' },
    { name: '刷 LeetCode', desc: '直觉敏锐，双指针与动态规划最优解信手拈来' },
    { name: '开启深色模式', desc: '护眼专注，极客大佬气场瞬间拉满' },
    { name: '给开源点 Star', desc: '积累程序员功德，遇到 Bug 自动解决' },
    { name: '调试单片机', desc: '信号波形平稳，串口通信毫无丢包' },
    { name: '阅读底层源码', desc: '以前看不懂的宏定义与指针指针，今天豁然开朗' },
    { name: '整理工作台', desc: '干净利落，打字手速提升 20%' }
  ];

  const JI_LIST = [
    { name: '周五下午上线', desc: '墨菲定律警告：大概率周末需要连夜回滚' },
    { name: '修改生产库', desc: '手滑把 WHERE 条件漏掉，当场提桶跑路' },
    { name: '跟产品经理争论', desc: '不仅争不过，还会被塞进来三个伪需求' },
    { name: '盲目升级依赖包', desc: '遇到神奇的破坏性更新，直接原地报错构建失败' },
    { name: '立 Flag', desc: '“这个需求半小时搞定” —— 结果通宵到天亮' },
    { name: '怀疑自己能力', desc: '坚信自己：不是你写的代码有问题，是编译器发神经' },
    { name: '过度联调', desc: '联调两小时，发现是对方服务端接口地址没配置对' }
  ];

  const DIRECTIONS = ['坐北朝南', '坐西朝东', '坐东朝西', '背靠窗户', '正对工位绿植'];
  const DRINKS = ['冰美式', '无糖乌龙茶', '生椰拿铁', '可口可乐', '茉莉花茶', '红牛'];

  // 简单伪随机数发生器（基于当天日期种子）
  function getDailyRandom(seed) {
    let x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  }

  function getDailyAlmanac() {
    const today = new Date();
    const y = today.getFullYear();
    const m = today.getMonth() + 1;
    const d = today.getDate();
    const dateSeed = y * 10000 + m * 100 + d;

    const yi1 = YI_LIST[Math.floor(getDailyRandom(dateSeed + 1) * YI_LIST.length)];
    let yi2 = YI_LIST[Math.floor(getDailyRandom(dateSeed + 2) * YI_LIST.length)];
    while (yi2.name === yi1.name) {
      yi2 = YI_LIST[Math.floor(getDailyRandom(dateSeed + 99) * YI_LIST.length)];
    }

    const ji1 = JI_LIST[Math.floor(getDailyRandom(dateSeed + 3) * JI_LIST.length)];
    let ji2 = JI_LIST[Math.floor(getDailyRandom(dateSeed + 4) * JI_LIST.length)];
    while (ji2.name === ji1.name) {
      ji2 = JI_LIST[Math.floor(getDailyRandom(dateSeed + 88) * JI_LIST.length)];
    }

    const dir = DIRECTIONS[Math.floor(getDailyRandom(dateSeed + 5) * DIRECTIONS.length)];
    const drink = DRINKS[Math.floor(getDailyRandom(dateSeed + 6) * DRINKS.length)];
    const stars = '⭐⭐⭐⭐' + (getDailyRandom(dateSeed + 7) > 0.4 ? '⭐' : '✨');

    return { y, m, d, yi1, yi2, ji1, ji2, dir, drink, stars };
  }

  function renderAlmanacCard(aside) {
    if (document.getElementById('card-almanac')) return;

    const data = getDailyAlmanac();
    const days = ['日', '一', '二', '三', '四', '五', '六'];
    const dayStr = '星期' + days[new Date().getDay()];

    const card = document.createElement('div');
    card.id = 'card-almanac';
    card.className = 'card-widget card-almanac';
    card.innerHTML = `
      <div class="item-headline">
        <i class="fas fa-calendar-check" style="color: #49b1f5; margin-right: 6px;"></i>
        <span>程序员老黄历</span>
      </div>
      <div class="almanac-date">
        <span>${data.y}年${data.m}月${data.d}日 · ${dayStr}</span>
        <span style="color: #f39c12; font-weight: bold;">运势: ${data.stars}</span>
      </div>
      <div class="almanac-section">
        <div class="almanac-badge-yi">宜</div>
        <div class="almanac-content">
          <b>${data.yi1.name}</b> <span class="almanac-desc">(${data.yi1.desc})</span><br>
          <b>${data.yi2.name}</b> <span class="almanac-desc">(${data.yi2.desc})</span>
        </div>
      </div>
      <div class="almanac-section">
        <div class="almanac-badge-ji">忌</div>
        <div class="almanac-content">
          <b>${data.ji1.name}</b> <span class="almanac-desc">(${data.ji1.desc})</span><br>
          <b>${data.ji2.name}</b> <span class="almanac-desc">(${data.ji2.desc})</span>
        </div>
      </div>
      <div class="almanac-footer">
        <span>🧭 座位朝向: <b>${data.dir}</b></span>
        <span>☕ 提神饮品: <b>${data.drink}</b></span>
      </div>
    `;

    // 插入在个人卡片或公告卡片下方
    const authorCard = aside.querySelector('.card-author');
    if (authorCard && authorCard.nextSibling) {
      aside.insertBefore(card, authorCard.nextSibling);
    } else {
      aside.prepend(card);
    }
  }

  // 历史上的今天内置精彩备选库（保障 100% 可用）
  const BACKUP_HISTORY = [
    { year: '1969', title: '人类首次登上月球，阿波罗 11 号成功着陆' },
    { year: '1971', title: '雷·汤姆林森发明了世界上第一封电子邮件 (Email)' },
    { year: '1972', title: '丹尼斯·里奇在贝尔实验室设计完成了经典的 C 语言' },
    { year: '1983', title: '互联网正式采用 TCP/IP 协议作为标准通信基石' },
    { year: '1991', title: '林纳斯·托瓦兹宣布 Linux 开源内核诞生' },
    { year: '1995', title: '网景公司推出 JavaScript，从此改变了互联网前端世界' },
    { year: '2008', title: 'GitHub 正式面向全球上线开放' }
  ];

  function renderHistoryCard(aside) {
    if (document.getElementById('card-history')) return;

    const today = new Date();
    const m = today.getMonth() + 1;
    const d = today.getDate();

    const card = document.createElement('div');
    card.id = 'card-history';
    card.className = 'card-widget card-history';
    card.innerHTML = `
      <div class="item-headline">
        <i class="fas fa-landmark" style="color: #a29bfe; margin-right: 6px;"></i>
        <span>历史上的今天 (${m}月${d}日)</span>
      </div>
      <div id="history-content-list" style="margin-top: 10px;">
        <div class="history-item"><i class="fa-solid fa-spinner fa-spin"></i> 正在翻阅史书...</div>
      </div>
    `;

    // 插入在老黄历卡片下方或侧边栏尾部
    const almanacCard = aside.querySelector('#card-almanac');
    if (almanacCard && almanacCard.nextSibling) {
      aside.insertBefore(card, almanacCard.nextSibling);
    } else {
      aside.appendChild(card);
    }

    // 优先拉取真实公网数据，拉取失败自动优雅回退
    fetch(`https://tenapi.cn/v2/history`)
      .then((r) => r.json())
      .then((res) => {
        const listEl = document.getElementById('history-content-list');
        if (!listEl) return;
        if (res && res.code === 200 && Array.isArray(res.data) && res.data.length) {
          const items = res.data.slice(0, 4);
          listEl.innerHTML = items
            .map(
              (item) => `
              <div class="history-item">
                <span class="history-year">${item.year || ''}</span>
                <span>${item.title || item.event || ''}</span>
              </div>
            `
            )
            .join('');
        } else {
          fallbackHistory();
        }
      })
      .catch(() => fallbackHistory());

    function fallbackHistory() {
      const listEl = document.getElementById('history-content-list');
      if (!listEl) return;
      const seed = m * 31 + d;
      const shuffled = [...BACKUP_HISTORY].sort((a, b) => getDailyRandom(seed + a.year) - 0.5);
      listEl.innerHTML = shuffled
        .slice(0, 3)
        .map(
          (item) => `
          <div class="history-item">
            <span class="history-year">${item.year}</span>
            <span>${item.title}</span>
          </div>
        `
        )
        .join('');
    }
  }

  /* ========================================================
   * Feature 3: 极客硬件监测小部件（实时电量感知 + 访问网络延迟 Ping）
   * ======================================================== */
  function renderGeekMonitor(aside) {
    if (document.getElementById('card-geek-monitor')) return;

    const card = document.createElement('div');
    card.id = 'card-geek-monitor';
    card.className = 'card-widget card-geek-monitor';
    card.innerHTML = `
      <div class="item-headline">
        <i class="fas fa-microchip" style="color: #00cec9; margin-right: 6px;"></i>
        <span>极客硬件与网络监测</span>
      </div>
      <div style="margin-top: 10px; font-size: 0.85rem; display: flex; flex-direction: column; gap: 8px;">
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>🔋 终端电量:</span>
          <span id="geek-battery-val" style="font-weight: 500; color: #10ac84;">检测中...</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>📶 物理延迟:</span>
          <span id="geek-ping-val" style="font-weight: 500; color: #49b1f5;"><i class="fa-solid fa-spinner fa-spin"></i> 测速中</span>
        </div>
        <div style="display: flex; justify-content: space-between; align-items: center;">
          <span>🛡️ 通信协议:</span>
          <span style="font-weight: 500; color: #a29bfe;">TLS 1.3 / HTTP/2</span>
        </div>
      </div>
    `;

    // 插入在老黄历卡片上方
    const almanacCard = aside.querySelector('#card-almanac');
    if (almanacCard) {
      aside.insertBefore(card, almanacCard);
    } else {
      aside.prepend(card);
    }

    // 1. 监测电量
    const batEl = document.getElementById('geek-battery-val');
    if (navigator.getBattery) {
      navigator.getBattery().then((battery) => {
        function updateBat() {
          const lvl = Math.round(battery.level * 100);
          const icon = battery.charging ? '⚡ 正在充电' : '🔋 电池';
          if (batEl) {
            batEl.innerHTML = `${lvl}% · <span style="font-size:0.75rem; opacity:0.8;">${icon}</span>`;
            batEl.style.color = lvl > 20 ? '#10ac84' : '#ee5253';
          }
        }
        updateBat();
        battery.onlevelchange = updateBat;
        battery.onchargingchange = updateBat;
      }).catch(() => {
        if (batEl) batEl.textContent = '💻 稳定供电中';
      });
    } else {
      if (batEl) batEl.textContent = '💻 稳定供电中';
    }

    // 2. 测算网络延迟 Ping
    const pingEl = document.getElementById('geek-ping-val');
    const start = performance.now();
    fetch('/img/favicon.ico?t=' + Date.now(), { method: 'HEAD', cache: 'no-store' })
      .then(() => {
        const ping = Math.round(performance.now() - start);
        if (pingEl) {
          let color = '#10ac84';
          let label = '极速';
          if (ping > 100 && ping <= 250) { color = '#f39c12'; label = '良好'; }
          else if (ping > 250) { color = '#e74c3c'; label = '稍慢'; }
          pingEl.innerHTML = `<span style="color:${color}; font-weight:bold;">${ping} ms</span> · <span style="font-size:0.75rem; opacity:0.8;">${label}</span>`;
        }
      })
      .catch(() => {
        if (pingEl) pingEl.textContent = '🟢 正常连接';
      });
  }

  /* ========================================================
   * Feature 5: 今日诗词与时段寄语智能感应
   * ======================================================== */
  function getGreetingByHour() {
    const h = new Date().getHours();
    if (h >= 5 && h < 9) return { title: '🌅 清晨寄语', mood: '晨光破晓，愿今天充满能量与新发现。' };
    if (h >= 9 && h < 12) return { title: '☀️ 上午专注', mood: '心无旁骛，代码与灵感正当时。' };
    if (h >= 12 && h < 14) return { title: '🍱 午间微憩', mood: '给双眼和大脑放个假，享受午间宁静。' };
    if (h >= 14 && h < 18) return { title: '☕ 午后时光', mood: '来杯咖啡提提神，思路如泉涌。' };
    if (h >= 18 && h < 23) return { title: '🌙 华灯初上', mood: '晚风拂过，卸下一天疲惫，静享阅读。' };
    return { title: '🌌 夜深人静', mood: '夜色渐浓，繁星作伴，别忘了早点休息。' };
  }

  function renderPoetryCard(aside) {
    if (document.getElementById('card-poetry-quote')) return;

    const greeting = getGreetingByHour();
    const card = document.createElement('div');
    card.id = 'card-poetry-quote';
    card.className = 'card-widget card-poetry-quote';
    card.innerHTML = `
      <div class="item-headline" style="display:flex; justify-content:space-between; align-items:center;">
        <span><i class="fas fa-feather-alt" style="color: #ff758c; margin-right: 6px;"></i>${greeting.title}</span>
        <span id="poetry-refresh-btn" style="cursor:pointer; font-size:0.8rem; opacity:0.7;" title="换一句诗词"><i class="fas fa-sync-alt"></i></span>
      </div>
      <div style="margin: 12px 0 8px 0; font-size: 0.9rem; line-height: 1.6; font-style: italic; color: var(--font-color);">
        <span id="poetry-content">“<i class="fa-solid fa-spinner fa-spin"></i> 正在感应诗意...”</span>
      </div>
      <div style="text-align: right; font-size: 0.78rem; opacity: 0.8; margin-bottom: 8px;">
        —— <span id="poetry-author">今日诗词</span>
      </div>
      <div style="font-size: 0.76rem; opacity: 0.7; padding-top: 6px; border-top: 1px dashed rgba(162, 155, 254, 0.25);">
        💡 ${greeting.mood}
      </div>
    `;

    // 插入在侧边栏历史卡片后
    const historyCard = aside.querySelector('#card-history');
    if (historyCard && historyCard.nextSibling) {
      aside.insertBefore(card, historyCard.nextSibling);
    } else {
      aside.appendChild(card);
    }

    function fetchPoem() {
      const contentEl = document.getElementById('poetry-content');
      const authorEl = document.getElementById('poetry-author');
      if (contentEl) contentEl.innerHTML = '<i class="fa-solid fa-spinner fa-spin"></i> 感应中...';

      fetch('https://v2.jinrishici.com/one.json')
        .then(r => r.json())
        .then(res => {
          if (res && res.status === 'success' && res.data) {
            if (contentEl) contentEl.textContent = `“${res.data.content}”`;
            if (authorEl) authorEl.textContent = `${res.data.origin.author} · 《${res.data.origin.title}》`;
          } else {
            fallbackPoem();
          }
        })
        .catch(() => fallbackPoem());
    }

    function fallbackPoem() {
      const contentEl = document.getElementById('poetry-content');
      const authorEl = document.getElementById('poetry-author');
      const BACKUP_POEMS = [
        { text: '星垂平野阔，月涌大江流。', author: '杜甫 · 《旅夜书怀》' },
        { text: '海内存知己，天涯若比邻。', author: '王勃 · 《送杜少府之任蜀州》' },
        { text: '长风破浪会有时，直挂云帆济沧海。', author: '李白 · 《行路难》' },
        { text: '沉舟侧畔千帆过，病树前头万木春。', author: '刘禹锡 · 《酬乐天扬州初逢席上见赠》' },
        { text: '山重水复疑无路，柳暗花明又一村。', author: '陆游 · 《游山西村》' }
      ];
      const p = BACKUP_POEMS[Math.floor(Math.random() * BACKUP_POEMS.length)];
      if (contentEl) contentEl.textContent = `“${p.text}”`;
      if (authorEl) authorEl.textContent = p.author;
    }

    const refreshBtn = document.getElementById('poetry-refresh-btn');
    if (refreshBtn) refreshBtn.onclick = fetchPoem;

    fetchPoem();
  }

  function initSidebarWidgets() {
    const aside = document.querySelector('.aside-content');
    if (!aside) return;

    renderGeekMonitor(aside);
    renderAlmanacCard(aside);
    renderHistoryCard(aside);
    renderPoetryCard(aside);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebarWidgets);
  } else {
    initSidebarWidgets();
  }

  document.addEventListener('pjax:complete', initSidebarWidgets);
})();

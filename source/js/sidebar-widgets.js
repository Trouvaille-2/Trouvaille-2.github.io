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

  function initSidebarWidgets() {
    const aside = document.querySelector('.aside-content');
    if (!aside) return;

    renderAlmanacCard(aside);
    renderHistoryCard(aside);
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initSidebarWidgets);
  } else {
    initSidebarWidgets();
  }

  document.addEventListener('pjax:complete', initSidebarWidgets);
})();

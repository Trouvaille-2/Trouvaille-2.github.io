/**
 * 极简轻量鼠标点击爱心特效
 * 零依赖、纯原生、兼容 PJAX
 */
!function (window, document) {
  var hearts = [];
  window.requestAnimationFrame = window.requestAnimationFrame ||
    window.webkitRequestAnimationFrame ||
    window.mozRequestAnimationFrame ||
    window.oRequestAnimationFrame ||
    window.msRequestAnimationFrame ||
    function (cb) { setTimeout(cb, 1000 / 60); };

  function init() {
    css(".heart{width: 10px;height: 10px;position: fixed;background: #f00;transform: rotate(45deg);-webkit-transform: rotate(45deg);-moz-transform: rotate(45deg);pointer-events:none;}.heart:after,.heart:before{content: '';width: inherit;height: inherit;background: inherit;border-radius: 50%;-webkit-border-radius: 50%;-moz-border-radius: 50%;position: fixed;}.heart:after{top: -5px;}.heart:before{left: -5px;}");
    attachEvent();
    gameloop();
  }

  function gameloop() {
    for (var i = 0; i < hearts.length; i++) {
      if (hearts[i].alpha <= 0) {
        document.body.removeChild(hearts[i].el);
        hearts.splice(i, 1);
        continue;
      }
      hearts[i].y--;
      hearts[i].scale += 0.004;
      hearts[i].alpha -= 0.013;
      hearts[i].el.style.cssText = "left:" + hearts[i].x + "px;top:" + hearts[i].y + "px;opacity:" + hearts[i].alpha + ";transform:scale(" + hearts[i].scale + "," + hearts[i].scale + ") rotate(45deg);background:" + hearts[i].color + ";z-index:99999";
    }
    requestAnimationFrame(gameloop);
  }

  function attachEvent() {
    var oldClick = typeof window.onclick === "function" && window.onclick;
    window.onclick = function (event) {
      oldClick && oldClick(event);
      createHeart(event);
    };
  }

  function createHeart(event) {
    var d = document.createElement("div");
    d.className = "heart";
    hearts.push({
      el: d,
      x: event.clientX - 5,
      y: event.clientY - 5,
      scale: 1,
      alpha: 1,
      color: randomColor()
    });
    document.body.appendChild(d);
  }

  function css(content) {
    var style = document.createElement("style");
    style.type = "text/css";
    try {
      style.appendChild(document.createTextNode(content));
    } catch (e) {
      style.styleSheet.cssText = content;
    }
    document.getElementsByTagName("head")[0].appendChild(style);
  }

  function randomColor() {
    var colors = ["#ff7675", "#fd79a8", "#6c5ce7", "#00cec9", "#e84393", "#a29bfe", "#fdcb6e", "#e17055"];
    return colors[Math.floor(Math.random() * colors.length)];
  }

  init();
}(window, document);

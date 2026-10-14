// 动态标题（兼容 PJAX 切页）
var OriginTitle = document.title;
var titleTime;
document.addEventListener('visibilitychange', function () {
  if (document.hidden) {
    OriginTitle = document.title;
    document.title = '👀又去哪儿了~';
    clearTimeout(titleTime);
  } else {
    document.title = '🐖找到你了～';
    titleTime = setTimeout(function () {
      document.title = OriginTitle;
    }, 2000);
  }
});
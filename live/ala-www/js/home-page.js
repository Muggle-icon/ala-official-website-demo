let dy = '';

document.addEventListener('DOMContentLoaded', function() {
  if (window.pageDy) {
    dy = window.pageDy;
  }
});

// 尝试从页面获取 dy 变量
function setDy(value) {
  dy = value;
}

// 媒体查询条件
const mediaQuery = window.matchMedia("(min-width: 992px)");
let matches = mediaQuery.matches;

// 监听媒体查询变化
mediaQuery.addEventListener("change", (e) => {
  matches = e.matches;
  // 重新检查所有元素状态
  checkElements();
});

// 选择所有需要动画的元素
const motionElements = document.querySelectorAll(".motion-element");
const scaleFadeElements = document.querySelectorAll(".scale-fade-element");

// 创建交叉观察器实例（检测元素是否进入视口）
const observer = new IntersectionObserver(
  (entries) => {
    entries.forEach((entry) => {
      // 当元素进入视口时触发动画
      if (entry.isIntersecting) {
        // 只在大屏幕上有延迟动画，小屏幕立即显示
        if (matches) {
          entry.target.classList.add("animated");
        } else {
          entry.target.classList.add("animated", "no-transition");
        }
        // 只执行一次动画
        observer.unobserve(entry.target);
      }
    });
  },
  {
    // 元素进入视口10%时触发
    threshold: 0.1,
  }
);

// 检查元素状态的函数
function checkElements() {
  // 处理普通 motion 元素
  motionElements.forEach((element) => {
    if (matches) {
      // 大屏 - 有动画
      element.classList.remove("no-transition");
      observer.observe(element);
    } else {
      // 小屏 - 无动画直接显示
      element.classList.add("animated", "no-transition");
      observer.unobserve(element);
    }
  });

  // 处理 scale-fade 元素
  scaleFadeElements.forEach((element) => {
    if (matches) {
      // 大屏 - 有动画
      element.classList.remove("no-transition");
      observer.observe(element);
    } else {
      // 小屏 - 无动画直接显示
      element.classList.add("animated", "no-transition");
      observer.unobserve(element);
    }
  });
}

// 初始化
checkElements();

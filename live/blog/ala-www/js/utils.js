
window.alaUtils = window.alaUtils || {};

function getAppCode() {
  return window.location.host.includes("test") ||
    window.location.host.includes("3000")
    ? "sf"
    : "ala";
}

function throttle(fn, delay) {
    let prev = Date.now();
    return function() {
        const context = this, args = arguments;
        let now = Date.now();
        console.log(now, prev)
        if (now - prev >= delay) {
            fn.call(context, args);
            prev = now;
        }
    }
}



 function formatDate(dateStr, format) {
  const date = new Date(dateStr);

  if (isNaN(date.getTime())) {
    return '';
  }

  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');

  return format
    .replace('yyyy', year)
    .replace('MM', month)
    .replace('dd', day);
};

function convertDateFormat(dateStr) {
  const date = new Date(dateStr);

  if (isNaN(date.getTime())) {
    return '';
  }

  const month = String(date.getMonth() + 1).padStart(2, '0'); // 月份从0开始，需+1
  const day = String(date.getDate()).padStart(2, '0');
  const year = date.getFullYear();

  return `${day}/${month}/${year}`;
}


let all_blog_channels = 'loan_blog,loan_guide,loan_financiero,financial_news,loan_city'
window.alaUtils.convertDateFormat = convertDateFormat;
window.alaUtils.throttle = throttle;
window.alaUtils.getAppCode = getAppCode;
window.alaUtils.formatDate = formatDate;
window.alaUtils.all_blog_channels = all_blog_channels;

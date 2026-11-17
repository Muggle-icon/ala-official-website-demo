document.addEventListener("DOMContentLoaded", function () {
  const blogUrl = './channel/loan_blog/';

  document.querySelectorAll('.gotoBlog').forEach(button => {
    button.addEventListener('click', () => window.location.assign(blogUrl));
  });
});

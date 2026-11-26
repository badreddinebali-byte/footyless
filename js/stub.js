/* FOOTYLESS stub pages — render the "in the making" panel for body[data-slug] */
(function () {
  "use strict";
  const slug = document.body.dataset.slug;
  window.Shell.mount(".app", slug);
  window.Shell.renderComingSoon("#stub-mount", { slug });
})();

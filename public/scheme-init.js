/*
 * Sets the dark class on <html> before the first paint, so a dark-scheme visitor never sees a light
 * frame while the app bundle loads. A classic script: the CSP allows 'self' scripts and no inline ones.
 * It reads the stored layout the way LayoutService does and nothing else. Keep the two literals below
 * equal to LAYOUT_STORAGE_KEY and DARK_CLASS in src/app/layout/layout.service.ts; scripts/scheme-init.test.mjs
 * fails when they differ.
 */
(function () {
  var KEY = 'weeljack-admin:layout';
  var DARK = 'wj-dark';
  var dark = false;
  try {
    var scheme = null;
    try {
      var stored = JSON.parse(localStorage.getItem(KEY));
      scheme = stored && stored.scheme;
    } catch (e) {
      scheme = null;
    }
    dark =
      scheme === 'dark' ||
      (scheme !== 'light' && window.matchMedia('(prefers-color-scheme: dark)').matches);
    document.documentElement.classList.toggle(DARK, dark);
  } catch (e) {
    /* Storage or matchMedia unavailable: leave the page as it is; the app applies the scheme once it boots. */
  }
})();

/**
 * footer.js — injecte le footer commun sur toutes les pages.
 * Inclure depuis les sous-dossiers : <script src="../footer.js"></script>
 */
(function () {
  const scriptSrc = document.currentScript
    ? document.currentScript.src
    : '';
  const base = scriptSrc
    ? scriptSrc.replace(/footer\.js$/, '')
    : '../';

  const footerHTML = `
<link rel="stylesheet" href="${base}footer.css">
<footer id="site-footer">
  <div class="footer-inner">
    <span class="footer-copy">© 2026 CLAIREVO'lAnce</span>
    <nav class="footer-nav">
      <a href="#">Mentions légales</a>
      <a href="#">Confidentialité</a>
    </nav>
  </div>
</footer>
`;

  document.body.insertAdjacentHTML('beforeend', footerHTML);
})();

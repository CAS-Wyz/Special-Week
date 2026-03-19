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
    <span class="footer-copy">© 2026 Clairvo'IAnce</span>
    <nav class="footer-nav">
      <a href="/Site Web/mentions-legales.html">Mentions légales</a>
      <a href="/Site Web/confidentialite.html">Confidentialité</a>
    </nav>
  </div>
</footer>
`;

  document.body.insertAdjacentHTML('beforeend', footerHTML);
})();

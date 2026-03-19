// Attendre que la page soit complètement chargée
document.addEventListener("DOMContentLoaded", function() {
  
  // On sélectionne tous les boutons de l'accordéon
  const accordions = document.querySelectorAll(".accordion-btn");

  accordions.forEach(function(btn) {
    btn.addEventListener("click", function() {
      
      // On bascule la classe 'active' sur le bouton cliqué
      this.classList.toggle("active");

      // On sélectionne l'élément suivant (qui est le div .accordion-content)
      const panel = this.nextElementSibling;

      // Si le panneau a déjà une hauteur (il est ouvert), on le ferme
      if (panel.style.maxHeight) {
        panel.style.maxHeight = null;
      } else {
        // Sinon, on calcule sa hauteur exacte pour l'ouvrir avec une animation fluide
        panel.style.maxHeight = panel.scrollHeight + "px";
      }
    });
  });

});
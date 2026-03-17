
  function openTopic(topicId) {
    // Cache la liste et la navigation
    document.getElementById('list-view').classList.add('hidden');
    document.querySelector('.sub-nav').classList.add('hidden');
    
    // Affiche la vue détail
    document.getElementById('detail-view').classList.remove('hidden');
    
    // Remonte en haut de la page pour lire depuis le début
    window.scrollTo({ top: 0, behavior: 'smooth' });
  
    }

  function closeTopic() {
    // Cache la vue détail
    document.getElementById('detail-view').classList.add('hidden');
    
    // Réaffiche la liste et la navigation
    document.getElementById('list-view').classList.remove('hidden');
    document.querySelector('.sub-nav').classList.remove('hidden');
  }


  function toggleQuiz() {
    // Sélectionne la section du quiz
    const quizSection = document.getElementById('quiz-section');
    
    // Alterne la classe 'hidden' (l'enlève si elle y est, l'ajoute si elle n'y est pas)
    quizSection.classList.toggle('hidden');
    
    // Optionnel : fait défiler la page doucement vers le quiz pour qu'il soit bien visible
    if (!quizSection.classList.contains('hidden')) {
      quizSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  }

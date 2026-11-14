
# language: fr

Fonctionnalité: Gestion des projets et des tâches
  En tant qu'utilisateur
  Je veux gérer mes projets et mes tâches
  Afin d'organiser mon travail

  Scénario: Ajouter un nouveau projet
    Étant donné que je suis sur la page de gestion des projets
    Quand je saisis le nom "Projet INF563"
    Et que je valide l'ajout du projet
    Alors le projet "Projet INF563" doit apparaître dans la liste

  Scénario: Modifier un projet existant
    Étant donné qu'un projet nommé "Projet INF563" existe
    Quand je modifie son nom en "Projet INF563 V2"
    Alors le projet doit porter le nom "Projet INF563 V2"

  Scénario: Supprimer un projet existant
    Étant donné qu'un projet nommé "Projet INF563" existe
    Quand je demande sa suppression
    Et que je confirme la suppression
    Alors le projet ne doit plus apparaître dans la liste

  Scénario: Conserver un projet après rechargement
    Étant donné qu'un projet nommé "Projet INF563" existe
    Quand je recharge la page
    Alors le projet "Projet INF563" doit toujours apparaître dans la liste

  Scénario: Conserver une tâche après rechargement
    Étant donné qu'un projet nommé "Projet INF563" existe
    Quand je sélectionne le projet "Projet INF563"
    Et que je crée une tâche intitulée "Réaliser les tests BDD"
    Quand je recharge la page
    Et que je sélectionne le projet "Projet INF563"
    Alors la tâche "Réaliser les tests BDD" doit toujours apparaître dans la liste

  Scénario: Modifier le titre et la description d'une tâche
    Étant donné qu'un projet nommé "Projet INF563" existe
    Quand je sélectionne le projet "Projet INF563"
    Et que je crée une tâche intitulée "Réaliser les tests BDD"
    Et que je modifie la tâche "Réaliser les tests BDD" avec le titre "Valider les tests de modification" et la description "Vérifier la mise à jour du titre et de la description."
    Alors la tâche "Réaliser les tests BDD" doit afficher le titre "Valider les tests de modification" et la description "Vérifier la mise à jour du titre et de la description."

  Scénario: Marquer une tâche comme terminée et conserver son état
    Étant donné qu'un projet nommé "Projet INF563" existe
    Quand je sélectionne le projet "Projet INF563"
    Et que je crée une tâche intitulée "Réaliser les tests de validation"
    Et que je marque la tâche "Réaliser les tests de validation" comme terminée
    Alors la tâche "Réaliser les tests de validation" doit être marquée comme terminée
    Quand je recharge la page
    Et que je sélectionne le projet "Projet INF563"
    Alors la tâche "Réaliser les tests de validation" doit être marquée comme terminée

  Scénario: Remettre une tâche terminée à faire
    Étant donné qu'un projet nommé "Projet INF563" existe
    Quand je sélectionne le projet "Projet INF563"
    Et que je crée une tâche intitulée "Préparer le rapport INF563"
    Et que je marque la tâche "Préparer le rapport INF563" comme terminée
    Et que je remets la tâche "Préparer le rapport INF563" à faire
    Alors la tâche "Préparer le rapport INF563" ne doit plus être marquée comme terminée
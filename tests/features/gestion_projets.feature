
# language: fr

Fonctionnalité: Gestion des projets
  En tant qu'utilisateur
  Je veux gérer mes projets
  Afin d'organiser mes tâches

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

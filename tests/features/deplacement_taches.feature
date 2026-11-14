
# language: fr

Fonctionnalité: Déplacement des tâches entre projets

  Scénario: Déplacer une tâche d'un projet vers un autre
    Étant donné que les projets "Projet source" et "Projet destination" sont créés
    Quand je crée la tâche "Tâche à déplacer" dans le projet "Projet source"
    Et que je déplace cette tâche vers "Projet destination"
    Alors la tâche "Tâche à déplacer" ne doit plus être présente dans le projet "Projet source"
    Quand je consulte le projet "Projet destination"
    Alors la tâche "Tâche à déplacer" doit être présente dans le projet "Projet destination"

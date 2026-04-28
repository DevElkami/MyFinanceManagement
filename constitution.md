Présentation générale:
Un outil complet de gestion de finances personnelles, développé avec un backend en Node.js et un front en React / typescript. L'application sera Progressive web app (PWA), permettant son installation via le navigateur web. Le stockage des données se fait en base de donnée mysql. Les échanges entre le back (Node.js) et le front (React / typescript) sont sécurisés (JWT) et réalisés en API rest. Le token JWT aura une durée de vie de 6 mois.
L'interface graphique doit être responsive (desktop et mobile) et posséde un style claire et sombre

Définitions:
- Type d'opération: CB, virement, remise de chèque, prélévement, chèque
- Tiers: Défini qui effectue l'opération. Le tiers est composé d'un libelé. Exemple: sécurité sociale, mutuelle, trésor public, etc.
- Montant: Nombre dont le signe est déterminé par le type de l'opération (débit alors négatif, crédit alors positif)
- Catégorie: Défini le thème de l'opération. La catégorie est composé d'un libelé et d'une type. Exemple: salaire, alimentation, voiture, impots, santé, etc. Type possible pour les catégories: Salaire, Alimentation, Essence, Péage, Maison, Energie, Voiture et Divers.
- Opération: L'opération bancaire est composée d'une date, d'un montant (nombre signé avec deux chiffres après la virgule), d'un type d'opération, d'un tiers, d'une catégorie, d'une note (champ texte) et posséde un statut: 'Aucun' (par défault), 'Pointé', 'Rapproché' et d'une option "Equilibre". Si cette option est cochée, alors l'opération est disponible dans l'écran d'équilibrage de compte
- Comptes: listes d'opération provenant d'une banque. il posséde un solde initial, un nom, et un propriétaire (texte) qui seront renseignée lors de sa création. Le solde du compte est calculé à chaque ajout d'opération sur le compte et le calcul intégre le solde initial. Le solde affiché est toujours le solde globale (il n'existe pas de notion de solde "filtré) et l'affichage va du plus ancien au plus récent.
- Echéance: L'échéance posséde les mêmes caractéritiques que l'opération. Rataché à un compte, l'opération revient périodiquement, chaque mois. C'est en début de mois qu'on ajoute automatiquement (au moment de la consultation) les échéances à la liste des opérations du compte. Si l'utilisateur ne s'est pas connecté pendant plusieurs mois, alors à l'ouverture on ajoute les échéances our chaque mois où il n'y a pas eu de connexion. On peut modifier ou supprimer une occurence ajoutée automatiquement par l'échéancier.

Accès à l'application:
L'accès à l'application se fait via un formulaire de connexion avec un login et un mot de passe. Ce mot de passe et ce login sont stockés dans la base de données de manière sécurisée.
Lors de la première utilisation, si aucun compte n'existe, on propose une interface de création de compte où l'utilisateur va créer son login et son mot de passe. L'application est mono utilisateur.

Ecran d'accueil:
L'écran d'accueil de l'application affiche la liste de compte avec leur libellé et le solde de chaque compte ainsi que les dépenses et les recettes pour le mois en cours et des 3 derniers mois.
On doit pouvoir depuis cet écran créer un compte, de modifier un compte, de supprimer un compte (et toutes ses opérations et ses échéances), de consulter un compte. On propose, si au moins deux comptes existent, l'accès à l'écran "Ecran d'équlibrage" décrit plus bas

Ecran de consultation:
L'écran de consultation du compte permet d'afficher les opérations et d'effectuer différentes actions. Cet écran se compose d'un bandeau supérieur qui permet:
- de revenir à l'écran d'accueil
- d'importer des données via un écran distinct "Ecran d'import des données" décrit plus bas
- d'ajouter / modifier / supprimer une opération via une popup "Popup d'ajout ou de modification d'une opération" décrite plus bas
- de gérer des catégories via un écran distinct "Ecran de gestion des catégories" décrit plus bas
- de gérer des tiers via un écran distinct "Ecran de gestion des tiers" décrit plus bas
- de gérer des échéances via un écran distinct "Ecran de l'échéancier" décrit plus bas
- possiblité de rapprocher les opérations (champ de saisie avec le montant à rapprocher ainsi qu'un champ montrant l'écart entre les opérations pointés et un bouton rapprocher). Une action sur le bouton rapprocher marque toutes les opérations pointées précédemment dans la liste principales des opérations comme opérations rapprochées. Cette acrtion est irréversibles mais on autorise (avertissement avant) la modification des opérations rapprochées.
puis l'écran principale la liste des opérations, triée par date chronologique avec pour chaque opération : date, type, tiers, montant au débit si l'opération est du type débit vide sinon, montant au crédit si l'opération est type crédit, vide sinon, un indicateur pour dire si l'opération est rapproché / pointé / ou aucun (on peut changer ce statut soit en cliquant soit en appuyant sur la touche F5) et enfin le solde cumulé (depuis le début du ompte). On pourra filter cette liste par le type d'opération, par catégorie, par le statut, le tiers et par note (prévoir un champ de saisie pour ce filtre avec un filtrage en temps réel).
on termine cet écran par un bandeau pied de page contenant les dépenses et les recettes pour le mois en cours et des 3 derniers mois, le solde pointé et le solde courant.

Ecran d'import des données:
L'écran d'importation permet d'ajouter des données au compte sélectionné grace à un un wizard dont voici les étapes:
1. Choisir un fichier (format csv, xml , OFX ou CFONB). Prévoir un mapping des colonnes avec l'opération (mapping qui sera sauvegardé et proposé lors du prochain import) pour tous les formats, y copris OFX et CFONB.
2. Aperçu des données importées dans un liste similaire à celle de l'écran principale des opérations.
3. Avertissement si le compte actuel contient déjà des opérations
4. import (spinner d'attente) puis basculer sur l'écran de consultation du compte
Lors de l'import, si les opérations existent déjà (même date, même montant, même tiers, même type (débit / crédit), il faut les ignorer et ne pas les ajouter.

Popup d'ajout ou de modification d'une opération
Cette popup se compose de différents champs permettant la création d'une opération:
- un champ date de l'opération (avec calendrier)
- un champ montant (deux chiffres après la virgule max)
- une combox type d'opération
- combobox avec la liste des tiers préalablement enregistrés ainsi qu'un raccourci permettant de se rendre à l'écran de gestion des tiers
- une combobox catégorie, ainsi qu'un raccourci permettant de se rendre à l'écran de gestion des catégories
- un champ de saisie de note
- une case à cochée pour l'option équilibre (active par défaut)
- une comboxbox virement inter comptes qui ajoutera au débit ou au crédit l'opération courante dans un autre compte lors de la validation de cette popup (si débit sur le compte actuel, alors crédit sur le compte sélectionné dans la combobox, et si crédit sur le compte actuel, alors débit sur le compte sélectionné). le tiers, la catégorie, la note et les autres données sont celles de l'opération (voir définission plus haut). Si cette opération est modifiée ultérieurement sur un compte, alors il faut mettre à jour sur l'autre compte. Si elle est supprimée, alors il faut supprimer aussi sur l'autre compte.
- le type d'opération: crédit ou débit
- deux boutons: valider qui enregistre l'opération et fermer, qui ferme la popup sans rien faire d'autre

Ecran de gestion des catégories
Dans cet écran on gère les catégories. Cet écran se compose d'un bandeau supérieur avec des boutons permettant:
- Ajout d'une catégorie
- Modfication  d'une catégorie
- Supression d'une catégorie
En dessous la liste des catégories existantes

Ecran de gestion des tiers
Bandeau supérieur avec des boutons permettant:
- Ajout  d'un tiers
- Modfication  d'un tiers
- Supression d'un tiers
En dessous la liste des tiers existants

Ecran de l'échéancier
L'écran permet la gestion des échéances. Une échéance est une opération périodique qui est ajouté à l'ouverture du compte, une seule fois par mois. La date de l'ajout est la date de l'échance (donc la date de l'opération). En cas de suppresion de l'échéance, on conserve les échéances ajoutées au compte.
 Bandeau supérieur avec des boutons permettant:
- Ajout d'une échéance
- Modfication d'une échéance 
- Supression d'une échéance
En dessous la liste d'échéance existantes

Ecran d'équlibrage
Cet écran permet d'associer deux comptes et de suivre le total des débits pour chacun des deux comptes sélectionnés ainsi que le total des débits en prorata des crédits de la catégorie "salaire" de chacun des deux comptes pour un mois donné. Il n'est disponible que si au moins deux comptes existent. 
Tous les calculs effectués ici ne concernent que les opérations avec l'option équilibre active.
Un bandeau supérieur permet de sélectionner via des combobox deux comptes. Cette selection des deux comptes sera mémorisé afin de proposer les mêmes comptes au prochain affichage.
En dessous du bandeau, une liste d'onglets pour chacun des mois en commun des deux comptes sélectionné ainsi qu'un bouton permettant d'accéder à l'écran des statistiques. 
Dans chaque onglet, on affiche une liste avec deux colonnes, une pour chaque compte sélectionné
Et pour chaque catégorie, une ligne, qui sera la somme des débits. On pourra afficher la liste des opérations qui ont été utlisé pour calculer la somme des débits.
Toujours dans l'onglet, en bas, on affichera le total des débits pour chacun des deux comptes sélectionnés, le total des débits en prorata (calcul du prorata exppliqué ci-dessous), et l'écart (cacul de l'écart expliqué ci-dessous) de chacun des deux comptes.

On ne peut effectuer les calculs que si chaque compte a une opération salaire. Tant que ce n'est pas le cas, alors ne pas efectuer de calcul.

Calcul du prorata est effectué de la manière suivante:
- le ratio du premier compte (premier comboxbox) est égale à la somme des opérations de la catégorie salaires des deux comptes pour le mois selectionné (celui de l'onglet) divisé par l'opération de la catégorie salaire du premier compte
- le ratio du second compte (deuxième comboxbox) est égale à la somme des opérations de la catégorie salaires des deux comptes pour le mois selectionné (celui de l'onglet) divisé par l'opération de la catégorie salaire du second compte
Le calcul du total des débits en prorata du premier compte selectionné est la sommes des opérations de débits des deux comptes divisé par le ratio du second compte
Le calcul du total des débits en prorata du second compte selectionné est la sommes des opérations de débits des deux comptes  divisé par le ratio du premier compte

Calcul de l'écart (nombre signé) par mois
Écart compte 1 = (Total débits compte 1 - Total débits prorata compte 1) + Report
Écart compte 2 = (Total débits compte 2 - Total débits prorata compte 2) + Report

Exemple de calcul de l'écart:
Salaire compte 1: 2275
Salaire compte 2: 3089.24
Total des dépenses pour compte 1: 2483.91
Total des dépenses pour compte 2 : 3441.46
Total des dépenses pour les deux comptes: 5925.37
Ratio compte 1: 2.3579
Ratio compte 2: 1.7364
Total des dépenses prorata compte 1: 2512.98
Total des dépenses prorata compte 2 : 3412.39
Report de l'écart du mois précédent pour compte 1: 32.61
Report de l'écart du mois précédent pour compte 2: -32.61
Ecart du mois pour compte 1: 3.54
Ecart du mois pour compte 2: -3.54
Cet écart est mémorisé et peut être ajusté (forcé) par l'utilisateur. En cas de forçage de l'écart, c'est la valeur saisie par l'utilisateur qui prévaut. Si on supprime cette valeur saisie, alors on recacul l'écart. L'écart est reporté d'un mois sur l'autre.

Ecran des statistiques (accès uniquement depuis l'écran d'équilibrage):
Possibilité de choisir le calcul des statistiques (Avec possiblité de selection du 1er compte, du second compte, et des deux comptes):
- Comparaisons avec le mois précédant  (graphique avec courbes)
- Calcul des cumuls de chaque catégorie sur l'année en cours (graphique avec courbes)
- Calcul des cumuls de chaque catégorie sur les 5 dernières années  (graphique avec courbes)
- Calcul des cumuls de chaque catégorie depuis le début  (graphique avec courbes)
Par défaut les calculs sont réalisés pour l'ensemble des catégories mais on doit avoir la possiblité de filtrer par catégorie.








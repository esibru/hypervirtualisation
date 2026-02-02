# Organisation

## Évaluation 

L'évaluation est continue, elle consiste à la présentation des différentes étapes à réaliser (cfr. _check list_ ci-dessous).

Un rapport complet est rédigé au fil des séances, au format **markdown**. Ce rapport est rédigé par groupe. 

:::warning 
Bien que la défense et le rapport soient commun à un groupe, la cote est individuelle. 
::: 

Pour la _seconde session_, toutes les étapes doivent être présentées. 

## Planning

_Planning informatif pouvant être sujet à changements._

| **Séance** | **Sujets** |  **Objectifs**                     |
|------------|------------|------------------------------------|
| **1**       | Introduction à la virtualisation.<br/> Prise en main du matériel.  | Concepts clés de la virtualisation et des hyperviseurs. Démonstration avec QEmu, virt-manager. Prise en main du matériel. Répartition en groupes.|
| **2**       | Réseaux dans les hyperviseurs |Configuration des réseaux virtuels (vSwitch, _bridge_, NAT, VLANs…). Installation de l'hyperviseur. |
| **3**       | Installation et configuration de l'hyperviseur (Proxmox) | Installer un hyperviseur sur un serveur physique et configurer un cluster basique; Proxmox.|
| **4**       | Gestion des VMs sur un hyperviseur           | Créer, configurer et gérer des VMs (CPU, RAM, disques, réseau). |
| **5**       | Stockage (**SAN** _storage area network_)  dans les hyperviseurs | Configuration et/ou utilisation du stockage partagé (NFS/iSCSI).|
| **6**       | Gestion avancée de l'hyperviseur      | Configurer les snapshots, la migration de VMs, le stockage partagé et le monitoring (de l'hyperviseur) |
| **7**       | Haute disponibilité de la virtualisation | Mise en _clusters_
| **8**       | Automatisation avec Ansible            | Automatiser la configuration de serveurs et de conteneurs avec Ansible. |
| **9**       | Automatisation avec Ansible (suite)       | Automatiser la configuration de serveurs et de conteneurs avec Ansible. |
| **10**       | Conteneurisation avec Docker<br/>Docker Compose et réseau Docker          | Installer Docker, créer des conteneurs, et travailler avec des images Docker. Automatiser les déploiements avec Docker Compose et configurer les réseaux Docker. |
| **11**      | Finalisation | Finalisation du _lab_|
| **12**       | Présentation finale du travail ||

## Organisation des séances

Le travail au cours se fait par équipe de 4 personnes. Il y a 2, 3 ou 4 équipes par groupe classe. 

Une séance de cours se compose de : une présentation théorique de 15-30 min, de travail en équipe et d'une clôture qui consiste à présenter aux autres le travail effectué. 

Pour rappel, un rapport complet est rédigé au fil des séances, au format **markdown**  et dans un dépôt **git**. Ce rapport est rédigé par équipe. 

### *Check list* 

_(Cette liste sera construite au fur et à mesure du cours)_

|Sujet          | Détail                    ||
|--             |--                         |--|
|Matériel       |Reconnaissance du matériel et état des lieux.| 🔲 |
|Installation   |Installation de l'hyperviseur.| 🔲 |
|Accessibilité  |L'hyperviseur est accessible en ssh et à distance au sein du local. | 🔲 |
|Configuration réseau  | À chaque groupe est associé un _range IP_. La configuration _hyperviseur-switch-extérieur_ est opérationnelle.| 🔲 |
|Rack           |L'hyperviseur est dans le rack (selon les possibilités). | 🔲 |
|Services       |Au minimum deux services internet tournent sur 2 machines virtuelles différentes [^f1][^f2]. | 🔲 |
|Conteneur      |Déploiement d'au moins 2 conteneurs (avec un service dans chaque conteneur)| 🔲 |
|Cluster        | Mettre au moins deux hyperviseurs en _cluster_ (un sous-groupe avec un autre sous-groupe) | 🔲 |
|Migration      |Une migration d'une machine est possible d'un hyperviseur à un autre.| 🔲 |
|Ansible        | Automatisation d'une install d'une machine virtuelle avec un environnement à définir.| 🔲 |
|Rapport   |Le rapport est disponible et complet<br/>En particulier, la liste des services, leur nom (ou à défaut leur IP) ainsi que le moyen de s'y connecter est clairement disponible.| 🔲 |

[^f1]: [Liste de services web installables](https://docs.google.com/document/d/1u57PAqw5KZpO-jKE0YdORzq0XbSkMCoyncOtNzU62X4/edit?usp=sharing) Chaque groupe peut proposer d'autres services. **La liste est informative**. 

[^f2]: Au minimum un service a son _storage_ sur le SAN commun.

## Aspects pratiques et réseaux

### Configuration réseau

Toutes les machines sont connectées dans le même _switch_ non configuré et sont toutes dans le même _range_ IP. Il n'y a aucune configuration à faire **excepté** une configuration statique des IP.

Nous utilisons dans le _range_ d'IP du réseau expérimental, le _range_ :  
`192.168.217-218.0 /18` 

|Usage|Range
|--|--
|_Default gateway_ | `192.168.192.1`
|_Domain Name Server_ | `192.168.217.255`
|Pour l’hyperviseur, les machines virtuelles, les conteneurs… / groupe.<br/><br/>groupe 1<br/>groupe 2<br/>groupe 3<br/>groupe 4<br/>| `192.168.217.0-250 /18`<br/><br/>`192.168.217.0-49 /18`<br/>`192.168.217.50-99 /18`<br/>`192.168.217.100-149 /18`<br/>`192.168.217.150-199 /18`
|_zeus_<br/>SAN (isci)|`192.168.217.255 /18`
|wifi|`192.168.217.254 /18`
|Range IP pour les utilisateurices | `192.168.218.0 /18`

_Les autres détails (credentials, attribution d'IP…) sont donnés au laboratoire._






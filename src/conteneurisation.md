# Conteneurisation

## Introduction

> Un **conteneur** (_container_) est une forme légère de virtualisation où l'on encapsule uniquement ce qui est nécessaire à l'application. Le conteneur est exécuté sur le système hôte.

> Il n'y a pas de système d'exploitation à proprement dit dans un conteneur. Uniquement les binaires et les bibliothèques (_libraries_) nécessaires. 

Au départ, des outils linux

- `chroot` (1960) pour **ch**ange **root** qui change la racine du _filesystem_  pour un processus.
- _BSD jail_ (2000) amélioration du `chroot` en séparant également les processus, les utilisateurs et le réseau. Les processus se trouvent dans une _sandbox_ (bac à sable).
- _namespace_ (2002) est une fonctionnalisé du noyau (_kernel_) qui séparent les ressources de manière telle qu'un ensemble de processus voient un ensemble de ressources tandis qu'un autre ensemble de processus voit un autre ensemble de ressource. Les _namespaces_ permettent une isolation des processus. 
- _cgroups_ (2007) pour **c**ontrol **groups** limitent les ressources (CPU, mémoire, IO, réseau…) disponibles pour un processus. Les _cgroups_ ont été initiés par Google (2006) avant d'être intégré au noyau linux >2.6.24
- LXC (2008) pour **l**inu**x** **c**ontainers combinent les _cgroups_ et les _namespaces_… et souffrent de problème de sécurité. 

Quelques projets (VServer, OpenVZ, Warden, LMCTFY _let my contain that for you_) ont vécus et ont été vaincus par Docker. 

**Docker** (2013) est l'héritier direct de LXC puisqu'il utilisait LXC et l'a ensuite remplacé par `libcontainer`. 

Pourquoi Docker et pas un autre ? 

Quelques fonctionnalités de Docker : 

- un démon _Docker CLI_ avec une API et un modèle client-serveur;
- un fichier _Dockerfile_ qui est un fichier texte définissant le conteneur à partir d'une image de base à laquelle on ajoute des fonctionnalités;
- un dépôt d'images _Docker Registry_ pour partager ses images;
- un fichier _Docker-compose_ définissant une application multi-conteneurs en un fichier YAML.

## Un (pré)-conteneur à l'ancienne

Un conteneur se base sur les _namespaces_ et les _cgroups_ disponibles dans un noyau linux. À partir de ces deux technologies, il doit être possible de créer un conteneur. 

### *namespace* 

```bash
~:# unshare --fork --pid --mount-proc bash 
~:# ps aux
USER  PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root    1  0.2  0.0   8208  4944 pts/21   S    14:10   0:00 bash
root    9  0.0  0.0  11256  4760 pts/21   R+   14:10   0:00 ps aux
```

Crée un _namespace_ tel que : 
- le _process id_ (PID) devient le PID 1 sans autre processus;
- le processus peut utiliser n'importe quel port sans entrer en conflit avec d'autres ports utilisés;
- peut monter (et démonter) des systèmes de fichiers sans affecter ceux de l'hôte;

### *cgroup*

```bash
~:# cgcreate -a user -g memory:my-group
~:# ls -l /sys/fs/cgroup/my-group
~:$ echo 10000000 > /sys/fs/cgroup/my-group/memory.max 
~:# cgexec -g memory:my-group bash
```

Crée un _cgroup_ et le limite à 10MB. Lancer un processus demandant _un peu trop de mémoire_ sera refusé. 

Par exemple, un simple `apt update` prend un « temps anormalement long ». 

:::warning

Nécessite l'installation du paquet `cgroup-tools`.

:::

## *The twelve factor app*

À l'origine de la conteneurisation une méthodologie proposée par Adam Wiggins de la société Heroku pour proposer du **_software as a service_** (**saas**). 

1. **Le code de base** (_codebase_) : Une version du code pour une (ou plusieurs) versions du code déployé. Quand le code change, un nouveau déploiement peut être réalisé facilement. 

2. **Dépendances** (_dependencies_) : Les dépendances sont explicitement déclarées. 

    Par exemple : 

    ```dockerfile
    FROM debian

    RUN apt update && \
        apt install -y cosway && \\
        apt clean

    CMD ["/usr/games/cowsthink", "-f tux", "Who am I"]
    ```

3. **Configuration** : Les configurations doivent être stockées et il sera possible de stocker des valeurs dans ces variables et de les passer à l'environnement lors de l'exécution du conteneur. 

4. **Services externes** (_backing services_ : Les services externes sont traités comme des ressources attachées. 

5. **Build, release and run** (_build, release, run_) : L'image construite est clairement séparée de son exécution. 

6. **Processus** (_processes_)_:  les applications sont sans états (_stateless_). La persistence est assurée par des services _backend_. 

    :::info stateless versus statefull
    Un processus **_statefull_** va garder un status en mémoire tandis qu'un service **_stateless_** ne conserve rien ; il peut être supprimé et recrée sans qu'aucune information ne soit perdue. 
    :::

7. **Association de ports** (_port binding_) ou encore _port mapping_ permet de lier un port de l'hôte à un port du conteneur. 

8. **Concurrence** (_concurrency_) : la mise à l'échelle (_scale_) ou la montée en charge est aisée puisque un conteneur est _stateless_. Placés derrière un _load balancer_ une application peut avoir un ou plusieurs conteneurs (qui peuvent être lancés à la volée)

9. **Jetable** (_disposability_) : _Maximize robustness with fast startup and graceful shutdown_. Les conteneurs peuvent être démarrés à la demande et supprimés tout aussi aisément. 

10. **Parité dev/prod** (_dev/prod parity_)_ : _Keep development, staging, and production as similar as possible. Un conteneur est l'exécution d'une image. Cette image ne change pas. 

11. **Logs** (_logs_) : Les logs sont des _flux d'évènements_ qui peuvent être lus à l'extérieur du conteneur. 

12. **Processus d'administration** (_admin processus_) : _Run admin/management tasks as one-off processes._ Ces tâches doivent être lancées à l'extérieur du conteneur. 

## Conteneur *versus* machine virtuelle 

Si l'on compare une **machine virtuelle** à une maison qui a une infrastructure propre pour l'eau, l'électricité… et un ensemble de pièces qui la constituent. Que l'on veuille une grande, très grande ou toute petite maison, on a toutes les pièces de la maison. On peut comparer un **conteneur** à une seule pièce de la maison  — dont on peut faire ce que l'on veut : une chambre, un petit bureau ou encore un grand loft — qui peut bénéficier des ressources de la maison comme l'eau, l'électricité…

Comme un nouvelle instance d'un conteneur n'a pas besoin d'un nouveau système d'exploitation, un conteneur génère moins d'_overhead_ (mémoire, CPU, I/O.)

:::info

Un conteneur porte ce nom par analogie aux conteneurs maritimes qui peuvent contenir des choses fort différentes mais qui ont tous le même format leur permettant d'être acheminer sur n'importe quel moyen de transport. 

Fini le  : _Chez moi, ça marche !_

:::

L'idée de la conteneurisation est de ne prendre que les _binaires_ et les bibliothèques (_libraries_) nécessaires à l'application et des les transporter dans une enveloppe — le conteneur — qu'en _container runtime_ (comme Docker) pourra exécuter. 

:::warning

Un **_container runtime_** permet : 
- l'exécution du conteneur (_run_);
- la création d'une image (_build_);
- la gestion des ces images (_images, rm_);
- la gestion des différentes instances de conteneurs (_ps, rm_);
- le partage d'images (_push, pull_).

Le _container runtime_ a un format propre. 

:::

Les conteneurs se basent sur les _namespaces_ et les _cgroups_ : le _namespace_ définit ce que le processus peut voir tandis que les _cgroups_, ce à quoi il a droit (CPU, RAM, I/O, etc.).

## Conteneur et image

> Un conteneur n'est pas une image et une image n'est pas un conteneur. 

L'image est au programme ce que le conteneur est au processus : une image est un ensemble de fichiers tandis qu'un conteneur est une exécution d'une image. 

Une fois que l'on dispose d'une image on peut : 

- l'exécuter, 
- la partager. 

Pour la partager, on utilise un _registry_ comme _dockerhub_ et le partage d'une image est aussi simple qu'un `push` et un `pull`. 

:::warning

Il également techniquement possible d'en faire un `tar` et de le partager mais ce n'est pas l'habitude. 

::: 

Par rapport à une machine virtuelle, un conteneur change la manière de faire : 

- là où les services (`http` par exemple) tournaient en arrière plan, ils restent en avant plan dans un conteneur;
- les _logs_ quant-à eux sont simplement envoyés, tous, sur `stdout`. 

## Cas particulier des conteneurs LXC

:::warning
Sur proxmox, les conteneurs ne sont pas gérés par _docker_ mais sont de simples conteneurs LXC. Ils sont plus vus comme des « conteneurs systèmes » (_system containers_) plutôt que comme des « conteneurs applicatifs » (_app containers_).
:::

Avant de lancer un conteneur, il est nécessaire de télécharger l'un ou l'autre _template_. Ça se fait _via_ l'interface web

![](assets/img/proxmox-gui-ct-0.webp)

![](assets/img/proxmox-gui-ct.webp)

Il sera alors possible de créer un conteneur et de le lancer. 

Par défaut les conteneurs sont basiques et proposent principalement des distributions linux. Pour avoir des conteneurs plus complets, on peut utiliser le projet [Turnkey Linux](https://www.turnkeylinux.org/). 

Pour accéder aux images du projet, mettre à jour la base de _templates_ des conteneurs _via_ `pveam update`. Ensuite, les nouveaux templates devraient apparaitre. 


### Créer un template custom

Il est également possible de créer un template LXC personnalisé sous Proxmox. Il sera sous la forme d'un _tgz_ partageable. 

En quelques étapes : 

1. créer et personnaliser le conteneur
    - déployer un conteneur LXC basé sur une image existante (par exemple, Alpine ou Debian).
    - s'y connecter et installer le ou les services visées. 

    :::tip
    Pour le test, installer par exemple l'application `cowsay` et ajouter un script dans `/etc/profile.d/cowsay.sh` qui contient 
    ```bash 
    if command -v cowsay >/dev/null 2>&1; then
        cowsay "wouf"
    fi
    ```
    ::: 

2. éteindre le conteneur (_via_ l'interface web ou `pct shutdown <ID_CT>`)

3. créer un template exportable 
    - supprimer l'interface réseau du conteneur _via_ l'interface web
    - générer une archive du conteneur avec `vzdump` :  
        ```bash
        vzdump <ID_CT> 
           --dumpdir /var/lib/vz/template/cache 
           --compress gzip 
           --mode stop
        ```
    - renommer l'archive pour qu'elle soit facilement identifiable :  
        ```bash
        mv /var/lib/vz/template/cache/vzdump-lxc-<ID>.tar.gz 
           /var/lib/vz/template/cache/my-beautiful-name_1.0.tar.gz
        ```


4. déployer un conteneur depuis ce template de la manière habituelle

Le template est maintenant disponible et peut être exporté. 

### Docker *work arround* 

Si l'on veut impérativement utiliser docker (principalement pour sa base d'images et la facilité de ses _dockerfiles_), il y a plusieurs manières de faire : 

- installer docker dans un conteneur LXC (par exemple un conteneur alpine **avec les options _nesting_ et _keyctl_** dans lequel, on ajoute docker et l'image désirée).

    Cette solution permet d'isoler un service par conteneur mais amène des problèmes dès lors que l'on voudrait faire communiquer des conteneurs (dans des conteneurs) entre eux;

    **Nous déconseillons cette solution.**

- installer une _vm_ (voire plusieurs en fonction des applications) qui fera tourner (tous les) conteneurs docker.

    Cette approche présente plusieurs avantages par rapport à l'installation de Docker dans un conteneur LXC :

    - elle permet l'utilisation complète de fonctionnalités comme **Docker Compose**, facilitant la gestion d'applications multi-conteneurs ;
    - elle offre une meilleure compatibilité et stabilité pour les mises à jour et l'orchestration des conteneurs ;
    - elle simplifie la configuration réseau entre les conteneurs, (ce qui sera important pour des environnements complexes ou de production) ;
    - elle évite les limitations liées à l'isolation des conteneurs dans des conteneurs, notamment pour la communication inter-services.






:::danger
Ne pas installer docker sur l'hyperviseurs « en-dessous » de proxmox. 

— Pourquoi ?  
— Si j'utilise Proxmox pour la virtualisation, j'évite de mettre d'autres services car ça peut être un faille de sécurité. Proxmox va permettre le **migration** de conteneurs que je n'aurai pas sans Proxmox ainsi que la haute disponibilité (**HA**).
::: 





:::info À LIRE AUSSI

[Docker](/docker)

:::
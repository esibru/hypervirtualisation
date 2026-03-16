# Virtualisation (suite)

## Cluster

_Quand l'hyperviseur n'est plus seul…_

Proxmox VE propose la gestion de _clusters_ regroupant plusieurs hyperviseurs. Lorsque plusieurs hyperviseurs sont configurés de cette manière, 
- chaque hyperviseur voit les machines et les conteneurs se trouvant sur les autres hyperviseurs ;
- des migrations peuvent être faites ;
- une redondance peut être mise en place.

Pour créer un cluster, il faut disposer d'au moins deux machines Proxmox VE qui _se voient_ sur le réseau. Pour de la « haute disponibilité » et une réaction en cas de panne, il en faudra au moins trois (cfr. infra). 

Plus précisément, il faut 
- pouvoir se connecter en UDP (ports 5405-5412)
- être à la même heure (par ex. _via_ `ntp`)
- pour la haute disponibilité, les nœuds doivent être de la même version de proxmox
- _proxmox recommande une carte réseau dédiée pour la gestion du cluster_
- _la migration à chaud entre machines de processeurs provenant de vendeurs différents « peut fonctionner »_

:::warning 
Pour pouvoir faire de la réplication à chaud et mettre en place de la haute disponibilité, le système de fichier (_file system_) doit être **distribué** (cfr [stockage](stockage.md)) ou doit être `ZFS` s'il est local. 
:::

Dans les paramètres du **datacenter**, la section _cluster_ propose la création du _cluster_ : 
- lui choisir un nom;
- l'interface réseau par laquelle les serveurs se voient. 

![](assets/img/proxmox-gui-cluster-create.png "Screenshot, création d'un cluster proxmox")  
_Source Proxmox docs_

En console, la création peut se faire par : 

```bash 
~:# pvecm create <CLUSTERNAME>
```

Pour vérifier le statut d'un cluster : 

```bash
~:# pvecm status 
```

Une fois le _cluster_ créé, utiliser les « _join information_ » pour lier les différents serveurs.

D'un côté 

![](assets/img/proxmox-gui-cluster-join-information.png "Screenshot proxmox, cluster join information")

… et de l'autre…

![](assets/img/proxmox-gui-cluster-join.png "Screenshot proxmox, cluster join, other side")

En console, l'ajout d'un nœud peut se faire par : 

```bash
~:# pvecm add <IP ADDRESS CLUSTER> 
```

:::info
Chaque hyperviseur peut gérer **toutes les machines virtuelles** du cluster et la section _summary_ affiche les ressources globales du cluster. 
:::

En console, la liste des nœuds est donnée par `pvecm nodes`. 


Si un cluster a été créé par erreur ou si vous souhaitez le supprimer pour repartir de zéro, voici les étapes à suivre. Notez que cette opération est destructive et doit être effectuée avec précaution.

1. **Vérifiez l'état du cluster**  
    Avant de commencer, assurez-vous de vérifier l'état actuel du cluster pour identifier les nœuds qui y participent. (Et profitez-en pour noter le nom des nœuds).  
    ```bash
    pvecm status
    ```

2. **Supprimez les nœuds du cluster**  
    Pour chaque nœud du cluster, exécutez la commande suivante pour le retirer proprement :  
    ```bash
    pvecm delnode NODE_NAME
    ```
    Remplacez `NODE_NAME` par le nom du nœud à supprimer. Répétez cette étape pour tous les nœuds sauf le dernier.



3. **Supprimez le cluster sur le dernier nœud**  
    Une fois que tous les autres nœuds ont été supprimés, exécutez les commandes suivantes sur le dernier nœud pour supprimer le cluster :  
    ```bash
    systemctl stop pve-cluster
    systemctl stop corosync
    rm -rf /etc/pve/corosync.conf
    rm -rf /etc/corosync/*
    systemctl start pve-cluster
    systemctl start corosync
    ```

:::danger 
La suppression d'un cluster est irréversible. Assurez-vous d'avoir sauvegardé toutes les données importantes avant de procéder.
:::

:::danger 
Lorsque la doc me dit d'exécuter `rm -rf <dir>`, je suis méfiant. 

- Je relis
- Je prends une copie des fichiers à supprimer
- Je supprime
- Si c'est cassé, je remets les fichiers et je relance les services. 
:::

[Suppression d'un nœud _via_ la commande `pcecm`](https://pve.proxmox.com/pve-docs/chapter-pvecm.html#_remove_a_cluster_node)

### Quorum

Proxmox utilise la notion de _quorum_ pour garder les clusters dans un état cohérent. 

> A quorum is the minimum number of votes that a distributed transaction has to obtain in order to be allowed to perform an operation in a distributed system.  
> Quorum (distributed computing)  
>— from Wikipedia 

### Migration et réplication 

La **migration** et la **réplication** dans Proxmox sont deux processus distincts, utilisés pour gérer les machines virtuelles (VM) et les conteneurs, mais avec des objectifs différents.

Une **migration** est le déplacement d'une machine virtuelle ou d'un conteneur d'une machine à une autre au sein du même cluster. 

La **réplication** est la copie régulière des données d'une machine virtuelle ou d'un conteneur vers un autre nœud pour garantir leur disponibilité en cas de panne.

| **Aspect**         | **Migration**      | **Réplication**               |
|--------------------|-------------------|--------------------------------|
| **Finalité**       | Déplacement d'une VM/conteneur    | Sauvegarde redondante         |
| **Moment**         | Instantané (ponctuel)            | Planifié (récurrent)          |
| **Utilisation**    | Maintenance/Équilibrage de charge | Haute disponibilité (HA)      |
| **Impact utilisateur** | Presque invisible (live migration) | Impact nul sauf en récupération |


Pendant une migration en direct, la mémoire et l'état de la VM sont transférés sans interruption notable pour l'utilisateur.

```bash
qm migrate ID_VM NOEUD_DESTINATION
pct migrate ID_CONTENEUR NOEUD_DESTINATION
```


## Haute disponibilité

Actuellement, les utilisateurices sont habitués à pouvoir accéder à l'information de n'importe où et n'importe quand. Il est donc important qu'un service soit accessible la _plupart du temps_. 

Si l'on parle d'une disponibilité de 99%, cela signifie que la période d’inaccessibilité (_downtime_) est de `365 jours * 0.01` soit **3.65 jours**.  

| Disponibilité  | _Downtime_ annuel
|--               |-- 
|99% |3.65 days
|99.9%|8.76 hours
|99.99%|52.56 minutes
|99.999%|5.26 minutes
|99.9999%|31.5 seconds
|99.99999%|3.15 seconds

Pour augmenter la disponibilité :

- utiliser du matériel de qualité
- éliminer les _single point of failure_ 
    - utiliser un UPS (_uninterruptible power supply_)
    - utiliser plusieurs alimentations sur les serveurs
    - ajouter de la redondance dans le réseaux (cartes…)
    - utiliser des disque en RAID pour le stockage local
    - stocker les données des VM sur du stockage distribué et redondant 
- réduire les temps d'indisponibilité 
    - une équipe disponible
    - avoir d'autres nœuds et du matériel de remplacement à disposition
    - avoir une détection d'erreur automatique 
    - avoir un basculement (_failover_) automatique l'un serveur à l'autre 

Proxmox fournit `ha-manager`, un composant software facilitant la détection d'erreurs et le basculement. 

Ressource (_resource_) : une ressource ou un service est identifiée par son _id_. Par exemple : **vm:100** est une machine virtuelle d'_id_ 100. Les types de resources sont, les machines virtuelles (_vm_) et les conteneurs (_ct_).

La haute disponibilité est configurable via le GUI et en ligne de commande. 

![](assets/img/proxmox-gui-ha-manager-status.png "Exemple de l'interface HA de proxmox")


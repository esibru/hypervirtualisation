# Le stockage dans les hyperviseurs

Il convient ici de distinguer le stockage  pour l'hyperviseur et l'endroit — et la manière — dont seront stockées les machines virtuelles (_vm_, _virtual machine_).

## L'hyperviseur 

Pour l'hyperviseur, une partition sera dédiée au système tandis que l'on stockera les machines virtuelles « ailleurs ». 

Une manière de faire est de configurer les disques du serveur en RAID (logiciel ou matériel en fonction de son équipement) et d'utiliser LVM pour la gestion du ou des disques présentés par la machine. 

[Qu'est-ce qu'un RAID ?](raid.md)  
[Qu'est-ce que LVM ?](lvm.md)

## Ses machines virtuelles

Les machines virtuelles pourront être — en fonction de l'usage — stockées : 

- localement; 
- à distance.

### Stockage local

Le ou les disques virtuels se trouvent directement sur l'hôte. Une ou plusieurs partitions de l'hyperviseur sont dédiées au stockage des machines virtuelles. 


### Stockage distant

Le stockage se trouve sur une autre machine ce qui permet de centraliser les données et de séparer les ressources qui _font tourner les machines_ des ressources qui persistent les données. Un effet de bord est le partage du stockage entre plusieurs hyperviseurs. 

Types courants de stockage distant :
- **NFS** (_Network File System_)
- **iSCSI** (_Internet Small Computer System Interface_).

Un machine qui offre du stockage est un **SAN** (_Storage Area Network_) en langage verbeux, c'est _une architecture réseau spécialisée pour centraliser le stockage_. Elle utilise généralement **iSCSI** ou  Fibre Channel (protocole réseau dédié au stockage).

**NFS** et **iSCSI** ont une approche différente :   
- **NFS** est orienté partage de fichiers tandis que,
- **iSCSI** c'est du stockage brut au niveau des blocs de données.

**NFS** est un **système de fichiers distribué**. Le client monte un partage distant dans son système de fichier. Le client voit un système de fichiers accessible _au niveau fichier_. 

**iSCSI** est un **protocole de transport de blocs**. Le client accède à un disque distant comme s'il s'agit d'un disque physique local. Le client voit un disque brut accessible _au niveau blocs_. C'est donc le client qui doit formater — et choisir un système de fichiers — le disque. 

Les performances de _iSCSI_ sont supérieures (supporte mieux la charge). 

[Qu'est-ce que NFS ?](nfs.md)  
[Qu'est-ce que iSCSI ?](iscsi.md)  


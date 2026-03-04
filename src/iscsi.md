# iSCSI

**iSCSI** (_internet Small Computer System Interface_) est un protocole de stockage qui utilise TCP/IP pour les communications entre les clients (serveurs MS Windows / Linux) et les serveurs que sont les baies de stockages.

Le stockage iSCSI est un stockage de type **SAN** (_Storage Area Network_) — partage de stockage de type bloc — contrairement au partage de fichiers (genre NFS/Samba/CIFS) qui est appelé **NAS** (_Network Attached Storage_). Dans le cas du iSCSI et des configuration SAN en général, le partage se fait au niveau d'un disque — **LUN** (_Logical UNit_) — et pas de fichiers ou répertoires.

Le nom iSCSI vient de la méthode utilisée pour accéder aux disques distants, qui transporte des commandes SCSI sur un réseau TCP/IP classique. Ceci permet d'utiliser du stockage distant et (potentiellement) partagé sans nécessiter une infrastructure dédiée et coûteuse en _fiber channel_ (FC).

SCSI -> iSCSI -> TCP -> IP -> Ethernet

Le port par défaut est le **TCP 3620**

# Les composants

Les éléments présents dans une infrastructure iSCSI sont :

- l'**initiator**, le composant software qui tourne sur le serveur qui doit accéder au stockage. Chaque hôte est identifié par un nom unique appelé **IQN** (_iSCSI Qualified Name_). Dans notre cas, ce sera le serveur Proxmox;
- la **target** qui est le périphérique de stockage qui partage l'espace disque et;
- la **LUN**, le disque présenté à travers iSCSI

Il existe un composant spécifique qui est appelé passerelle iSCSI, en général du hardware dédié, qui permet de donner accès à des baies de stockage FC qui ne sont pas capable de communiquer en iSCSI nativement. C'est un équipement qui fait la conversion entre iSCSI et FC.

# Configuration

Description de la config sur debian ? Printscreen de Proxmox ? 

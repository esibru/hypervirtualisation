# iSCSI

**iSCSI** (internet Small Computer System Interface) est un protocole de stockage qui utilise TCP/IP pour les communications entre les clients (serveurs Windows/Linux) et les serveurs que sont les baies de stockages.


Le stockage iSCSI est un stockage de type **SAN** (Storage Area Network), partage de stockage de type bloc, contrairement au partage de fichiers (genre NFS/Samba/CIFS) qui est apellé **NAS** (Network Attached Storage). Dans le cas du iSCI et des configuration SAN en général, le partage se fait au niveau d'un disque (LUN) et pas de fichiers ou répertoires.

Le nom iSCSI vient de la méthode utilisée pour accéder au disques distants, qui transporte des commandes SCSI sur un réseau TCP/IP classique. Ce qui permet d'utiliser du stockage distant et (potentiellement) partagé sans nécessiter une infrastructure dédié et coûteuse en fiber channel.

SCSI -> iSCSI -> TCP -> IP -> Ethernet

Le port par défaut est le **TCP 3620**

# Les composants

Les éléments présent dans une infrastructure iSCSI sont :
- L'initiator, le composant software qui tourne sur le serveur qui doit accéder au stockage. Chaque hôte est identifier par un nom unique appelé **IQN**. Dans notre cas, ce sera le serveur Proxmox
- La **target** qui est le périphérique de stockage qui partage l'espace disque.
- La **LUN** Logical Unit, le disque présenté à travers iSCSI

Il existe un composant spécifique qui est appelé passerelle iSCSI, en général du hardware dédié, qui permet de donner accès à des baies de stockage FC qui ne sont pas capable de communiquer en iSCSI nativement. C'est un équipement qui fait la conversion entre iSCSI et Fiber Channel.

# Configuration

Description de la config sur debian ? Printscreen de Proxmox ? 

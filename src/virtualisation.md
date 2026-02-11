# Virtualisation

> La **virtualisation** permet à plusieurs systèmes d’exploitation de fonctionner en parallèle sur une seule machine physique.  


- En 1960, IBM introduit le concept de virtualisation avec son système CP-40 🔗 en 1964, suivi du CP-67 en 1966. Ces systèmes permettaient de partitionner les mainframes (ordinateurs capables de traiter des milliards de calculs et de transactions en temps réel, de manière sécurisée et fiable) en plusieurs machines virtuelles, chacune exécutant son propre système d’exploitation.

- 1970-1980, la virtualisation est moins utile puisque les PCs se démocratisent;
- 1990, croissance d'internet et des besoins;
- 1998 création de VMWare;
- 2003 création de Xen (_open source_), hébergé depuis 2013 par la Linux Foundation. Encore utilisé notamment par [AWS](https://docs.aws.amazon.com/AWSEC2/latest/UserGuide/instance-types.html#instance-hypervisor-type), Citrix et Oracle, mais supplanté par KVM dans de nombreux cas d'usage;
- 2007 KVM (_Kernel-based Virtual Machine_) est intégré au noyau linux;
- 2010… virtualisation « partout »;
- 2024 VMWare est racheté par Broadcom qui met fin aux licences « éducation ».

![IBM 360. Photo promotionnelle 1964. IBM](assets/img/ibm-360.webp)  
_Source IBM. Photo promotionnelle (1964) pour l'IBM 360_


**Avantages** :

- **efficacité** : meilleure utilisation des ressources matérielles.
- **flexibilité** : facilité de déploiement et de gestion.
- **sécurité** : isolation entre les systèmes.
- **économie** : réduction des coûts d’achat et de maintenance.


> Un **hyperviseur** est une plateforme de virtualisation. 

## Hyperviseur de **type 1** (natif)

Un **hyperviseur de Type 1**, **natif**, voire « **_bare metal_** » est un logiciel qui s'exécute directement sur une plateforme matérielle.

<div class="float-right">

![Hyperviseur de type 1 (Source Wikipedia)](assets/img/Diagramme_ArchiHyperviseur_type1.png)  
_(Source : Wikipedia - Hyperviseur de type 1)_

</div>

L'hyperviseur de type 1 est un noyau hôte allégé et optimisé. 

Exemples : 

- CP, développé par IBM (_obsolète_) 
- [Xen](https://xenproject.org/projects/hypervisor/)
- Microsoft Hyper-V
- ESXI Server  (VMware)
    - propriétaire
    - support professionnel 
- KVM
- [Proxmox](https://www.proxmox.com/en/) (utilise KVM et LXC (_LinuX Container_))
    - _open source_ basée sur Debian




## Hyperviseur de **type 2** (_hosted_)

Un **hyperviseur de type 2** est un logiciel qui s'exécute à l'intérieur d'un autre système d'exploitation. Un système d'exploitation invité s'exécutera donc en troisième niveau au-dessus du matériel. Les systèmes d'exploitation invités n'ayant pas conscience d'être virtualisés, ils n'ont pas besoin d'être adaptés. 
On peut parler d'**émulation**. 

<div class="float-right">

![Hyperviseur de type 2 (Source Wikipedia)](assets/img/Diagramme_ArchiEmulateur_type2.png)  
_(Source : Wikipedia - Hyperviseur de type 2)_

</div>


Exemples : 

- VMware Workstation
- QEMU 
- Virtual PC
- VirtualBox d'Oracle

> Une **machine virtuelle** (VM _virtual machine_) est une machine physique simulée de manière logicielle. Une machine virtuelle exécute un OS (_operating system_) complet, isolé des autres. 

🙃 virtualisation _versus_ émulation. 

Un émulateur *hardware* est un programme qui va émuler — c'est-à-dire imiter — le comportement d'un autre programme ou d'un périphérique (*device*). L'émulateur imite le comportement de tous les composants de la machine. Cette émulation a un coût. Dans le cas de la virtualisation, c'est également un programme qui va imiter le comportement de la machine **et** utiliser une sous-couche matérielle (*hardware*) permettant de faire directement des appels matériels. 

### Cas particulier de **QEmu** et **KVM**

Dans son rôle d'émulateur de machine, QEmu émule une machine sur une autre. Il est capable d'émuler une machine 32 bits sur une 64 bits et *vice versa* ou encore d'émuler une architecture ARM sur une architecture x86. Il est peu efficace à cause du surcout occasionné par l'émulation du matériel. 

[QEmu][qemu] peut être un émulateur de machine ou faire de la virtualisation. 

Couplé à [KVM][kvm], QEmu peut-être un hyperviseur — élément logiciel, *hardware* ou *firmware* permettant de créer et faire fonctionner des machines virtuelles — et permettre la création et l'exécution de machines virtuelles de même architectures que l'hôte. Ces *vm* bénéficieront alors de l'accélération matérielle fournie par [KVM][kvm].

[*libvirtd*][libvirt], *virsh* et *virt-manager* permettent d'offrir une couche d'abstraction supplémentaire en virtualisation. *virt-manager* est une interface graphique permettant de gérer les machines virtuelles. *virsh* une sorte de *shell*. 

KVM convertit Linux en un hyperviseur de type 1 en intégrant dans le noyau : gestionnaire de mémoire, ordonnanceur, pile d'entrées/sorties (E/S), pilotes de périphériques, gestionnaire de sécurité, pile réseau, etc. Chaque machine virtuelle est mise en œuvre comme un processus Linux standard.

## Exemples

### *gitesi* et *poesi*

Les machines hébergeant le serveur **Gitlab** de l'école (_gitesi_) et la plateforme pédagogique **Moodle** (_poesi_) sont (actuellement) deux machines virtuelles sur un serveur physique et virtualisée grâce à QEMU-KVM et _virt-manager_. 

![Screenshot virt-manager](assets/img/virt-manager-esi.png "Screenshot virt-manager")

### Le réseau pédagogique

Le réseau pédagogique offre les services suivants (_Pouvons nous les reconnaitre ?_ ) : 

![Hôtes virtuels en production à l'ESI (jan. 2025)](assets/img/esi-hotes.png "Hôtes virtuels en production à l'ESI (jan. 2025)")

La virtualisation se fait avec **QEMU-KVM** avec **_virt-manager_** comme surcouche graphique. 

[Exemple d'appel d'offre](assets/pdf/2024CahierDesChargesVirtualisation_FMA_01.pdf)

### Un laboratoire virtuel

Pour les besoins d'un cours (et _because_ COVID19), je veux proposer à chaque étudiant et étudiante une machine linux sur laquelle elle [^f1] pourra faire ses manipulations. J'ai deux contraintes (fortes) : 

- cette machine doit être accessible de l'extérieure;
- je ne dispose que de 2 IP publiques

Voici le schéma de l'organisation.

![Illustration laboratoire virtuel](assets/img/lab.png "Illustration laboratoire virtuel")

[^f1]: Accord de proximité.

## Outils

### VMWare 

VMWare fait partie de Broadcom. Broadcom ne propose plus de licence éducation ni de licence de test. 

### Proxmox

**Proxmox VE** (_virtual environment_) est une plateforme open-source pour la virtualisation. Proxmox VE est basé sur Debian et utilise — entre autre — KVM. Il propose une interface web pour la gestion des machines virtuelles et des conteneurs. 









[qemu]:http://wiki.qemu.org/Main_Page
[kvm]:http://www.linux-kvm.org/page/Main_Page
[libvirt]:http://libvirt.org/

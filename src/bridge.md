# Bridge

## Configuration d'un bridge

La configuration d'un _bridge_ se fait grâce au paquet `bridge-utils` et la commande associée est `brctl`. 

La création d'un _bridge_ aura cette allure : 

```bash 
:~# brctl addbr br0
:~# brctl addif br0 eth0
:~# ip a br0 <IP>
```

1. création du bridge
2. ajout de l'interface `ethO` au bridge
3. attribution d'une adresse IP au bridge

Pour rendre cette configuration automatique, éditer le fichier `/etc/network/interfaces` : 

```conf
auto br0
iface br0 inet static
  address <IP>/<mask>
  broadcast <IP>
  gateway <IP>
  bridge_ports eth0
```

:::info 
La configuration réseau au sein d'une machine virtuelle, ne change pas. C'est bien lors de la configuration de la machine virtuelle (_vm_) que l'interface réseau (virtuelle) de la machine est assignée au _bridge_.
::: 

## Configuration de VLANs

Par défaut, le noyau linux ne prend pas en charge les VLANs. Il ne prend pas en charge le protocole **802.1Q**. Le noyau linux peut être recompilé pour que le protocole soit pris en charge ou, plus simplement, un _module peut être ajouté au noyau_. 

:::info

Le noyau linux offre la possibilité de pouvoir ajouter _à chaud_ des fonctionnalité au système. 

Un module noyau est un _bout de code_ pouvant être inséré au code en cours de fonctionnement. Les commandes associées aux modules sont : `lsmdo`, `modprobe`, `rmmod` et `insmod`. 

:::

### Ajout du module au noyau

```bash 
:~# modprobe 8021q
```

:::tip
Des infos sur le modules peuvent être données par `modinfo 8021q`.
:::

### Création du VLAN

```bash
:~# ip link add link <interface> name <interface.vlan> 
    type vlan id <vlan id> 
:~# ip link set dev <interface.vlan> up
:~# ip addr <IP/mask> brd <broadcast IP> dev <interface.vlan>
:~# ip -d link show <interface.vlan>
```

1. ajout du VLAN
2. interface _up_
3. attribution d'une adresse IP et d'un _default gateway_ (passerelle par défaut)
4. affichage des détails sur l'interface

Par exemple 
```bash
:~# ip link add link eth0 name eth0.5 type vlan id 5    
:~# ip link set dev eth0.5 up
:~# ip addr add 172.16.0.1/16 brd 172.16.255.200 dev eth0.5
:~# ip -d link show eth0.5
```

## Agrégation de liens

L'agrégation de liens (_bonding_) permet de combiner plusieurs interfaces réseau physiques en une seule interface logique. Cela offre de la redondance et/ou une augmentation de la bande passante.

### Ajout du module au noyau

```bash
:~# modprobe bonding
```

### Création d'une interface bond

```bash
:~# ip link add bond0 type bond mode <mode>
:~# ip link set dev <interface1> master bond0
:~# ip link set dev <interface2> master bond0
:~# ip link set dev bond0 up
:~# ip addr add <IP/mask> dev bond0
```

  1. création de l'interface bond avec un mode spécifique
  2. ajout de la première interface physique au bond
  3. ajout de la deuxième interface physique au bond
  4. activation de l'interface bond
  5. attribution d'une adresse IP au bond


Modes de bonding :

- **mode 0 (balance-rr)** : Round-robin, répartition de charge
- **mode 1 (active-backup)** : Une interface active, les autres en backup
- **mode 2 (balance-xor)** : Répartition basée sur les adresses MAC
- **mode 4 (802.3ad)** : Agrégation dynamique selon IEEE 802.3ad (LACP)
- **mode 5 (balance-tlb)** : Équilibrage de charge adaptatif en transmission
- **mode 6 (balance-alb)** : Équilibrage de charge adaptatif

Pour rendre la configuration persistante, il suffit d'éditer `/etc/network/interfaces` :

```conf
auto bond0
iface bond0 inet static
  address <IP>/<mask>
  bond-slaves <interface1> <interface2>
  bond-mode <mode>
  bond-miimon 100
```
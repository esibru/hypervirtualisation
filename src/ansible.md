# Automatisation avec Ansible

Ansible est un outil d'automatisation open source qui permet de gérer la configuration, le déploiement d'applications et l'orchestration de tâches sur un grand nombre de serveurs. Il fonctionne sans agent, en utilisant SSH pour communiquer avec les machines distantes, ce qui simplifie son installation et sa maintenance. 

Ansible utilise une syntaxe simple en `YAML`.

L'installation est aussi simple qu'un `apt install ansible` (qui gèrera les dépendances).

Dans l'architecture d'Ansible, il existe deux rôles principaux : le **contrôleur** (_control node_) et la **cible** (_managed node_) :

- le **contrôleur** (_control node_) est la machine qui exécute le _playbook_
- la **cible** (_managed node_) — plus généralement **les** cibles — sont les systèmes que le contrôleur configure. 

Le *contrôleur* gère donc l'orchestration, tandis que les *cibles* reçoivent et exécutent les instructions.

Les machines cibles sont définies dans **l'inventaire** (_inventory_), c'est-à-dire la liste des hôtes et groupes d'hôtes que Ansible peut gérer.

Un **playbook** est un fichier écrit en YAML qui la description de l'état souhaité d'une machine cible. 

Il permet d'automatiser des actions complexes, comme l'installation de logiciels, la configuration de services ou la gestion de fichiers. Les playbooks sont composés de *plays*, qui associent des groupes d'hôtes à des tâches spécifiques, facilitant ainsi la gestion cohérente et reproductible de l'infrastructure.

Il s'agit bien d'un fichier qui décrit une série d'états dans lesquels doivent se trouver la cible. Ainsi si l'état requis est déjà mis en place, Ansible n'effectuera pas l'opération. 

## Exemple de playbook simple

Ce playbook vérifie l'existence d'un compte sur la cible. Si lecompte n'existe pas, il le créera. 

```yaml
- name: 'Ensure user account {{ username }} exists'
    hosts: all
    become: yes
    tasks:
        - name: 'Account {{ username }} exists'
          ansible.builtin.user:
            name: "{{ username }}"
            state: present
```


TODO


## Exemple de playbook simple

Voici un exemple de playbook qui installe le paquet _nginx_ sur un groupe d'hôtes nommé _webservers_ :

```yaml
- name: Installer nginx sur les serveurs web
    hosts: webservers
    become: yes
    tasks:
        - name: Installer le paquet nginx
            apt:
                name: nginx
                state: present
```

Pour exécuter ce playbook, on utilise la commande :

```bash
ansible-playbook mon_playbook.yaml
```

Ce playbook demande à Ansible d'installer **nginx** sur tous les hôtes du groupe _webservers_, en utilisant les privilèges administrateur (_become: yes_).
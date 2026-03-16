# Automatisation avec Ansible

Ansible est un outil d'automatisation open source qui permet de gérer la configuration, le déploiement d'applications et l'orchestration de tâches sur un grand nombre de serveurs. Il fonctionne sans agent, en utilisant SSH pour communiquer avec les machines distantes, ce qui simplifie son installation et sa maintenance. 

Ansible utilise une syntaxe simple en `YAML`.

Dans l'architecture d'Ansible, il existe deux rôles principaux : le **contrôleur** (_control node_) et la **cible** (_managed node_) :

- le **contrôleur** (_control node_) est la machine qui exécute le _playbook_
- la **cible** (_managed node_) — plus généralement **les** cibles — sont les systèmes que le contrôleur configure. 

Le *contrôleur* gère donc l'orchestration, tandis que les *cibles* reçoivent et exécutent les instructions.

Les machines cibles sont définies dans **l'inventaire** (_inventory_), c'est-à-dire la liste des hôtes et groupes d'hôtes que Ansible peut gérer.

Un **playbook** est un fichier écrit en YAML qui la description de l'état souhaité d'une machine cible. 

Il permet d'automatiser des actions complexes, comme l'installation de logiciels, la configuration de services ou la gestion de fichiers. Les playbooks sont composés de *plays*, qui associent des groupes d'hôtes à des tâches spécifiques, facilitant ainsi la gestion cohérente et reproductible de l'infrastructure.

Il s'agit bien d'un fichier qui décrit une série d'états dans lesquels doivent se trouver la cible. Ainsi si l'état requis est déjà mis en place, Ansible n'effectuera pas l'opération. 

## Exemple d'inventaire

Voici un exemple de fichier d'inventaire (_inventory_) :

```ini
[webservers]
web1.example.org
web2.example.org
192.168.1.10

[databases]
db1.example.org
db2.example.org

[users]
192.168.1.[1:254]

[all:vars]
ansible_user=alice
ansible_ssh_private_key_file=~/.ssh/id_rsa
```
Cet inventaire définit plusieurs groupes d'hôtes : `webservers`, `databases` et `users`. Le groupe `users` concerne **plusieurs** adresses IP ; celles allant de `192.168.1.1` à `192.168.1.254`.

Les variables `all:vars` s'appliquent à tous les hôtes et spécifient l'utilisateur SSH et la clé privée à utiliser pour la connexion.



## Exemples de playbook simple

Ce playbook vérifie l'existence d'un compte sur la cible. Si le compte n'existe pas, il le créera.

```yaml
- name: 'Ensure user account exists'
    hosts: all
    become: yes
    vars:
        username: john
    tasks:
        - name: 'Create user account'
          ansible.builtin.user:
            name: "{{ username }}"
            state: present
```

Pour exécuter ce playbook — contenu dans le fichier `my_playbook.yaml` — on utilise la commande :

```bash
ansible-playbook my_playbook.yaml
```

Le mot-clé `all` fait référence à tous les hôtes définis dans l'inventaire. La variable `username` est définie dans la section `vars` du playbook. Vous pouvez également la passer en ligne de commande avec `-e username=john`.


## Prérequis et installation

Ansible doit être installé **uniquement sur le contrôleur**. Les cibles n'ont besoin que d'un serveur SSH et de Python.

L'installation — sur le **contrôleur** — est aussi simple que 

```bash
># apt install ansible
```

Les cibles, quant-à elles, doivent disposer de :

- un serveur **SSH**  ;
- **Python 3**.

:::tip Pas d'agent !
Contrairement à d'autres outils comme Puppet ou Chef, Ansible ne nécessite **aucun agent** sur les machines cibles. Toute la communication passe par SSH.
:::

:::warning 

Pour éviter de saisir un mot de passe à chaque exécution, on utilise l'authentification par clé SSH.
:::

:::warning Privilèges
L'utilisateur sur la cible doit pouvoir exécuter des commandes avec `sudo` sans mot de passe pour que `become: yes` fonctionne correctement. On peut configurer cela dans `/etc/sudoers` :

```
alice ALL=(ALL) NOPASSWD: ALL
```
:::


## L'inventaire en détail

Le fichier d'inventaire peut être écrit en **INI** (vu ci-dessus) ou en **YAML**.

Le même inventaire que ci-dessus en YAML cette fois aura cette allure :

```yaml
all:
  vars:
    ansible_user: alice
    ansible_ssh_private_key_file: ~/.ssh/id_rsa
  children:
    webservers:
      hosts:
        web1.example.org:
        web2.example.org:
        192.168.1.10:
    databases:
      hosts:
        db1.example.org:
        db2.example.org:
    users:
      hosts:
        192.168.1.[0-254]:
```

### Variables d'hôte et de groupe

On peut définir des variables spécifiques à un hôte ou à un groupe :

```ini
[webservers]
web1.example.org  http_port=80
web2.example.org  http_port=8080

[webservers:vars]
nginx_version=1.24
```

### Inventaire par défaut

Par défaut, Ansible cherche l'inventaire dans `/etc/ansible/hosts`. On peut spécifier un autre fichier avec l'option `-i` :

```bash
$ ansible-playbook -i my_inventory.ini my_playbook.yaml
```

:::tip Vérification de l'inventaire
Pour lister tous les hôtes détectés dans un inventaire :

```bash
$ ansible-inventory -i my_inventory.ini --list
```
:::


## Commandes ad-hoc

Avant d'écrire un playbook, on peut exécuter une commande ponctuelle sur un ou plusieurs hôtes avec la syntaxe :

```bash
$ ansible <groupe> -m <module> -a "<arguments>"
```
Par exemple : 

- tester la connectivité vers tous les hôtes :

    ```bash
    $ ansible all -m ping
    ```

    > Le module `ping` ne fait pas un *ping ICMP* — il vérifie qu'Ansible peut se connecter à la cible et y exécuter du Python.

- exécuter une commande sur les serveurs web :

    ```bash
    $ ansible webservers -m command -a "uptime"
    ```

- installer un paquet :

    ```bash
    $ ansible databases -m apt -a "name=mariadb-server state=present" --become
    ```

- redémarrer un service :

    ```bash
    $ ansible webservers -m service -a "name=nginx state=restarted" --become
    ```

- copier un fichier vers les cibles :

    ```bash
    $ ansible all -m copy -a "src=/etc/motd dest=/etc/motd" --become
    ```


## Les modules

Les **modules** sont les unités de travail d'Ansible. Chaque module réalise une tâche précise. Ansible est livré avec des centaines de modules.

Voici les modules courants

| Module | Description | Exemple |
|--------|-------------|---------|
| `apt` | Gestion des paquets Debian/Ubuntu | `apt: name=nginx state=present` |
| `yum` | Gestion des paquets RedHat/CentOS | `yum: name=httpd state=latest` |
| `copy` | Copier un fichier vers la cible | `copy: src=fichier.conf dest=/etc/` |
| `template` | Copier un fichier avec substitution Jinja2 | `template: src=conf.j2 dest=/etc/app.conf` |
| `file` | Gérer fichiers et répertoires | `file: path=/data state=directory` |
| `service` | Gérer les services systemd | `service: name=nginx state=started` |
| `user` | Gérer les comptes utilisateur | `user: name=john state=present` |
| `command` | Exécuter une commande | `command: whoami` |
| `shell` | Exécuter via le shell (pipes, redirections) | `shell: cat /etc/passwd \| grep root` |
| `lineinfile` | Modifier une ligne dans un fichier | `lineinfile: path=/etc/hosts line="..."` |
| `cron` | Gérer les tâches cron | `cron: name="backup" minute="0" hour="2"` |

:::warning command vs shell
Le module `command` n'utilise pas le shell : pas de pipes (`|`), pas de redirection (`>`), pas de variables d'environnement `$VAR`. Pour cela, utiliser le module `shell`. Mais préférez toujours un module dédié quand il existe (ex : `apt` plutôt que `command: apt install ...`).
:::

Pour consulter la documentation d'un module :

```bash
$ ansible-doc apt
$ ansible-doc -l                # lister tous les modules disponibles
$ ansible-doc -l | grep file    # rechercher un module
```


## Structure d'un playbook

Un playbook est composé d'un ou plusieurs **plays**. Chaque play associe un groupe d'hôtes à une liste de **tâches** (_tasks_).

```yaml
- name: Premier play - configurer les serveurs web
  hosts: webservers
  become: yes
  tasks:
    - name: Installer nginx
      apt:
        name: nginx
        state: present

    - name: Démarrer nginx
      service:
        name: nginx
        state: started
        enabled: yes

- name: Second play - configurer les bases de données
  hosts: databases
  become: yes
  tasks:
    - name: Installer MariaDB
      apt:
        name: mariadb-server
        state: present
```

> Un playbook peut contenir **plusieurs plays**, chacun ciblant des groupes d'hôtes différents.

### L'idempotence

Un concept fondamental d'Ansible : une tâche est **idempotente** si elle peut être exécutée plusieurs fois sans changer le résultat au-delà de la première application.

Par exemple, `apt: name=nginx state=present` n'installera nginx que s'il n'est pas déjà installé. À la deuxième exécution, Ansible détecte que l'état est déjà correct et affiche **ok** au lieu de **changed**.

:::danger Attention aux modules `command` et `shell`
Les modules `command` et `shell` ne sont **pas idempotents** par défaut. Ils exécuteront la commande à chaque fois. Utilisez les paramètres `creates` ou `removes` pour conditionner leur exécution, ou préférez un module dédié.
:::


## Variables

Les variables permettent de rendre les playbooks réutilisables.

### Définition dans le playbook

```yaml
- name: Configurer un serveur
  hosts: webservers
  become: yes
  vars:
    http_port: 80
    doc_root: /var/www/html
  tasks:
    - name: Créer le répertoire racine
      file:
        path: "{{ doc_root }}"
        state: directory
```

:::warning Syntaxe des variables
Les variables s'utilisent avec la syntaxe Jinja2 <code v-pre>{{ variable }}</code>. Quand une valeur **commence** par une variable, il faut l'entourer de guillemets : <code v-pre>"{{ my_variable }}"</code>.
:::

### Fichiers de variables

On peut externaliser les variables dans des fichiers :

```yaml
- name: Configurer un serveur
  hosts: webservers
  become: yes
  vars_files:
    - vars/webserver.yaml
  tasks:
    - name: Afficher le port
      debug:
        msg: "Le port est {{ http_port }}"
```

Avec le fichier `vars/webserver.yaml` :

```yaml
http_port: 80
doc_root: /var/www/html
```

### Variables en ligne de commande

```bash
$ ansible-playbook site.yaml -e "http_port=8080"
```

:::warning

Ansible applique un ordre de priorité (_precedence_) strict. Du moins prioritaire au plus prioritaire :

1. valeurs par défaut du rôle (`defaults/main.yaml`)
2. variables d'inventaire (groupe, hôte)
3. variables du playbook (`vars`)
4. variables en ligne de commande (`-e`)

> Les variables passées en ligne de commande (`-e`) ont **toujours** la priorité la plus haute.
::: 

## Les facts

Les **facts** sont des variables collectées automatiquement par Ansible sur les cibles au début de chaque play. Ils contiennent des informations sur le système : adresse IP, distribution, mémoire, disques, etc.

Cette commande affiche l'ensemble des facts d'un hôte (que l'on peut filtrer):

```bash
$ ansible webservers -m setup
$ ansible webservers -m setup -a "filter=ansible_distribution*"
```

Ces facts peuvent être utilisés dans un _playbook_.

```yaml
- name: Afficher des informations système
  hosts: all
  tasks:
    - name: Afficher la distribution
      debug:
        msg: "Ce serveur tourne sous {{ ansible_distribution }} {{ ansible_distribution_version }}"
```

Les facts les plus utiles :

| Fact | Description |
|------|-------------|
| `ansible_hostname` | Nom de la machine |
| `ansible_distribution` | Distribution (Debian, Ubuntu…) |
| `ansible_default_ipv4.address` | Adresse IPv4 principale |
| `ansible_memtotal_mb` | Mémoire totale en Mo |
| `ansible_processor_vcpus` | Nombre de vCPU |

:::tip Désactiver la collecte de facts
Si les facts ne sont pas nécessaires, on peut accélérer l'exécution en désactivant la collecte de ces informations :

```yaml
- name: Play rapide
  hosts: all
  gather_facts: no
  tasks:
    ...
```
:::


## Conditions

Le mot-clé `when` permet d'exécuter une tâche uniquement si une condition est remplie.

```yaml
- name: Installer Apache uniquement sur Debian
  apt:
    name: apache2
    state: present
  when: ansible_distribution == "Debian"
```

Les conditions peuvent être combinées : 

```yaml
- name: Installer uniquement sur Debian 12+
  apt:
    name: apache2
    state: present
  when:
    - ansible_distribution == "Debian"
    - ansible_distribution_major_version | int >= 12
```

> Quand `when` reçoit une **liste**, toutes les conditions doivent être vraies (ET logique).

Il est également possible de mémoriser le résultat d'une tâche et d'ajouter une condition sur le résultat de celle-ci :

```yaml
- name: Vérifier si nginx est installé
  command: which nginx
  register: nginx_check
  ignore_errors: yes

- name: Installer nginx si absent
  apt:
    name: nginx
    state: present
  when: nginx_check.rc != 0
```

> Le mot-clé `register` permet de stocker le résultat d'une tâche dans une variable.


## Boucles

Le mot-clé `loop` (anciennement `with_items`) permet de répéter une tâche pour chaque élément d'une liste.

```yaml
- name: Créer plusieurs utilisateurs
  user:
    name: "{{ item }}"
    state: present
  loop:
    - alice
    - bob
    - charlie
```

- boucle sur des dictionnaires

    ```yaml
    - name: Créer des utilisateurs avec leur groupe
      user:
        name: "{{ item.name }}"
        groups: "{{ item.group }}"
        state: present
      loop:
        - { name: alice, group: admin }
        - { name: bob, group: dev }
        - { name: charlie, group: dev }
    ```

- installer plusieurs paquets

    ```yaml
    - name: Installer les outils de base
      apt:
        name: "{{ item }}"
        state: present
      loop:
        - vim
        - htop
        - curl
        - git
        - tmux

    ```

:::tip Raccourci pour apt
Le module `apt` accepte directement une liste :

```yaml
- name: Installer les outils de base
  apt:
    name:
      - vim
      - htop
      - curl
    state: present
```

:::


## Handlers

Un **handler** est une tâche qui ne s'exécute que lorsqu'elle est **notifiée** (_notify_) par une autre tâche — et uniquement si cette tâche a effectivement modifié quelque chose (_changed_).

Le cas d'usage classique : redémarrer un service après modification de son fichier de configuration.

```yaml
- name: Configurer nginx
  hosts: webservers
  become: yes
  tasks:
    - name: Copier la configuration nginx
      copy:
        src: nginx.conf
        dest: /etc/nginx/nginx.conf
      notify: Redémarrer nginx

  handlers:
    - name: Redémarrer nginx
      service:
        name: nginx
        state: restarted
```

> Le handler `Redémarrer nginx` ne sera exécuté que si la tâche `Copier la configuration nginx` a effectivement modifié le fichier. Si le fichier est identique, rien ne se passe.

:::info Ordre d'exécution
Les handlers s'exécutent à la **fin de toutes les tâches** du play, pas immédiatement après le `notify`. Si plusieurs tâches notifient le même handler, il ne sera exécuté **qu'une seule fois**.
:::


## Templates Jinja2

Les **templates** permettent de générer des fichiers de configuration dynamiques à partir de variables. Ils utilisent le moteur de templates **Jinja2** (syntaxe Python).

### Exemple de template

Fichier `templates/nginx.conf.j2` :

```jinja2
server {
    listen {{ http_port }};
    server_name {{ ansible_hostname }};

    root {{ doc_root }};
    index index.html;

    {% if ssl_enabled %}
    listen 443 ssl;
    ssl_certificate /etc/ssl/certs/{{ domain }}.crt;
    {% endif %}
}
```

### Utilisation dans un playbook

```yaml
- name: Déployer la configuration nginx
  hosts: webservers
  become: yes
  vars:
    http_port: 80
    doc_root: /var/www/html
    ssl_enabled: false
  tasks:
    - name: Générer la configuration nginx
      template:
        src: templates/nginx.conf.j2
        dest: /etc/nginx/sites-available/default
      notify: Redémarrer nginx

  handlers:
    - name: Redémarrer nginx
      service:
        name: nginx
        state: restarted
```


## Les rôles

Un **rôle** est une manière de structurer et de réutiliser du code Ansible. Il regroupe les tâches, variables, templates, fichiers et handlers liés à une même fonction (ex : installer nginx, configurer MariaDB…).

### Structure d'un rôle

```
roles/
  nginx/
    tasks/
      main.yaml       # tâches principales
    handlers/
      main.yaml       # handlers
    templates/
      nginx.conf.j2   # templates Jinja2
    files/
      index.html      # fichiers statiques
    vars/
      main.yaml       # variables du rôle
    defaults/
      main.yaml       # valeurs par défaut
```

### Créer un rôle

Ansible fournit une commande pour générer la structure :

```bash
$ ansible-galaxy init roles/nginx
```

### Utiliser un rôle dans un playbook

```yaml
- name: Configurer les serveurs web
  hosts: webservers
  become: yes
  roles:
    - nginx
```

C'est équivalent à inclure les tâches, handlers, variables et templates du rôle automatiquement.

### Ansible Galaxy

**Ansible Galaxy** est un dépôt communautaire de rôles prêts à l'emploi.

[Site web du projet](https://docs.ansible.com/projects/galaxy-ng/en/latest/index.html)

```bash
$ ansible-galaxy role install geerlingguy.docker    # installer un rôle
$ ansible-galaxy list                          # lister les rôles installés
```

:::info Authentification sur Galaxy
**Installer** des rôles ne nécessite aucun compte. En revanche, pour **publier** un rôle ou une collection, il faut :

1. créer un compte sur [galaxy.ansible.com](https://galaxy.ansible.com) ;
2. générer un **token d'API** depuis son profil ;
3. le renseigner dans `~/.ansible/galaxy_token` ou dans `ansible.cfg` :

```ini
[galaxy]
server_list = my_org_hub

[galaxy_server.my_org_hub]
url=https://galaxy.ansible.com/
auth_url=https://sso.redhat.com/auth/realms/redhat-external/protocol/openid-connect/token
token=mon_token_api
```
:::

:::info Quand utiliser un rôle ?
On utilise un rôle dès que la configuration d'un service dépasse quelques tâches, ou lorsqu'on souhaite **réutiliser** la même configuration dans plusieurs playbooks.
:::



## Ansible Vault

**Ansible Vault** permet de chiffrer des données sensibles : mots de passe, clés API, certificats.

### Créer un fichier chiffré

```bash
$ ansible-vault create secrets.yaml
```

Un éditeur s'ouvre pour saisir le contenu. Le fichier est chiffré avec AES-256.

### Modifier un fichier chiffré

```bash
$ ansible-vault edit secrets.yaml
```

### Utiliser un fichier chiffré dans un playbook

```yaml
- name: Déployer avec des secrets
  hosts: all
  become: yes
  vars_files:
    - secrets.yaml
  tasks:
    - name: Créer un utilisateur avec mot de passe
      user:
        name: deploy
        password: "{{ deploy_password | password_hash('sha512') }}"
```

Exécuter le playbook en fournissant le mot de passe du vault :

```bash
$ ansible-playbook site.yaml --ask-vault-pass
```

Ou via un fichier contenant le mot de passe :

```bash
$ ansible-playbook site.yaml --vault-password-file ~/.vault_pass
```

:::danger Protection du fichier de mot de passe
Le fichier `.vault_pass` ne doit **jamais** être versionné. Ajoutez-le à votre `.gitignore`.
:::


## Organisation d'un projet Ansible

Un projet Ansible typique suit cette arborescence :

```
projet-ansible/
  inventory/
    production.ini
    staging.ini
  group_vars/
    all.yaml
    webservers.yaml
  host_vars/
    web1.example.org.yaml
  roles/
    nginx/
    mariadb/
  templates/
  files/
  site.yaml            # playbook principal
  webservers.yaml      # playbook par groupe
  dbservers.yaml
```

> Les fichiers dans `group_vars/` et `host_vars/` sont automatiquement chargés par Ansible selon le nom du groupe ou de l'hôte correspondant.


## Bonnes pratiques

- **Nommer chaque tâche** avec un `name` descriptif : facilite le débogage et la lisibilité.
- **Utiliser les modules** plutôt que `command` ou `shell` : ils sont idempotents.
- **Versionner** les playbooks et rôles avec `git`.
- **Séparer** les variables sensibles dans un fichier Vault.
- **Tester** avant d'appliquer : le mode _dry-run_ simule l'exécution sans rien modifier :
  ```bash
  $ ansible-playbook site.yaml --check
  ```
- **Limiter** l'exécution à un sous-ensemble d'hôtes pendant les tests :
  ```bash
  $ ansible-playbook site.yaml --limit web1.example.org
  ```
- **Augmenter la verbosité** pour le débogage :
  ```bash
  $ ansible-playbook site.yaml -v    # verbeux
  $ ansible-playbook site.yaml -vvv  # très verbeux
  ```


## *Troubleshooting*

- Vérifier la connectivité

    ```bash
    $ ansible all -m ping
    ```

    Si la connexion échoue, vérifier :

    - la connectivité SSH (`ssh user@host`) ;
    - l'utilisateur et la clé SSH configurés dans l'inventaire ;
    - que Python est installé sur la cible.

- Mode verbeux (_verbose_)

    ```bash
    $ ansible-playbook site.yaml -vvv
    ```

    Affiche les détails complets de chaque tâche : connexion, commandes exécutées, retours.

- Vérifier la syntaxe

    ```bash
    $ ansible-playbook site.yaml --syntax-check
    ```

- Lister les tâches d'un playbook

    ```bash
    $ ansible-playbook site.yaml --list-tasks
    ```

- Lister les hôtes ciblés

    ```bash
    $ ansible-playbook site.yaml --list-hosts
    ```

- Exécuter une seule tâche à la fois (_step by step_)

    ```bash
    $ ansible-playbook site.yaml --step
    ```

    Ansible demandera confirmation avant chaque tâche.

:::tip Le module debug
Le module `debug` est l'équivalent du `print` pour Ansible. Utile pour afficher la valeur d'une variable ou vérifier un résultat :

```yaml
- name: Afficher une variable
  debug:
    msg: "La valeur est {{ ma_variable }}"

- name: Afficher le contenu d'un register
  debug:
    var: resultat_commande
```
:::
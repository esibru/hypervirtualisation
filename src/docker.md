# Docker 

## Installation 

L'installation de Docker se résume à `apt install docker.io`. Les dépendances du packet sont : 

Depends: libc6 (>= 2.34), libdevmapper1.02.1 (>= 2:1.02.97), libsystemd0, adduser, containerd (>= 1.4~), iptables, lsb-base, runc (>= 1.0.0~rc8~), tini

- `runc` est le _runtime_, le composant qui gère l'exécution des conteneurs, les application packagées en respectant _Open Container Format_ (`OCF`);

- `containerd` est l'API d'exécution (_runtime API_) qui va gérer le cycle de vie d'un conteneur; stockage et transfert des images, exécution du conteneur et supervision, liens avec le stockage et le réseau, etc. Il se concentre sur la simplicité, la robustesse et la portabilité; 

Pour vérifier la présence de docker, exécuter 

```bash 
~:$ docker ps
CONTAINER ID IMAGE COMMAND CREATED STATUS PORTS NAMES
```

::: tip
Docker s'exécute en _root_. Un moyen simple de donner le droit à un _user_ d'utiliser Docker est de l'ajouter au groupe `docker`. 

```bash
~:# usermod -aG docker user
```
:::

`docker info` donne moult infos sur l'installation de docker.

## Commencer avec Docker

Pour commencer lançons un image _debian_ de manière interactive. 

```bash
~:$ docker run -ti debian bash 
Unable to find image 'debian:latest' locally
latest: Pulling from library/debian 
a492eee5e559: Pull complete 
Digest: sha256:72297848[cut]782
Status: Downloaded newer image for debian:latest
root@e89b4fa490ce:/# ls                   
bin  boot  dev  etc  home  lib  lib64  media  mnt  opt  proc  root  run  sbin  srv  sys  tmp  usr  var
root@e89b4fa490ce:/# apt update && apt install procps 
root@e89b4fa490ce:/# ps -aux
USER         PID %CPU %MEM    VSZ   RSS TTY      STAT START   TIME COMMAND
root           1  0.0  0.0   4188  3412 pts/0    Ss   07:17   0:00 bash
root         195  100  0.0   8060  3896 pts/0    R+   07:21   0:00 ps -aux
```
- la première fois, l'image doit être téléchargée avant d'être exécutée;
- `-ti` demande de lancer le conteneur de manière interactive avec `bash` comme _shell_;
- l'image _debian_ ne connait pas la commande `ps`, il faut l'installer;
- le shell est le seul processus et a le PID 1;
- un `exit` quitte _bash_ et quitte la session interactive. Le container est arrêté;

```bash
$ docker ps -a                                        
CONTAINER ID   IMAGE  COMMAND CREATED        STATUS       PORTS         NAMES
e89b4fa490ce   debian "bash"  47 seconds ago Exited (127) 7 seconds ago great_curran
```
- `docker ps -a` montre que le container a été quitté

Si vous essayez de créer un fichier dans la session interactive, le fichier sera créé… et sera perdu lors de la destruction du container. 

Il est possible de relancer un nouveau conteneur avec la même image : 

```bash 
~:$ docker run -ti debian bash 
```

et dans ce cas le fichier n'existe plus. Il est également possible de relancer le conteneur préalablement quitté grâce à son _container id_ ou son nom : 

```bash
~:$ docker start -ai e89b4fa490ce
```

ou 

```bash
~:$ docker start -ai lucid_lovelace
```

et dans ce cas c'est le même conteneur qui est redémarré et les données se trouvant dans le conteneur s'y trouvent toujours. 

:::info
Il n'est pas nécessaire d'écrire tous les chiffres du _container id_, seuls ceux permettant de différencier deux containers sont utiles. 
:::

:::warning
Les images docker sont créées en **couches successives**, chacune — exceptée la dernière — est en lecture seule. 
::: 

Considérons le _Dockerfile_ suivant : 

```dockerfile
FROM debian
MAINTAINER me
RUN apt update \
    && apt install -y nginx \
    && apt clean 
COPY index.html /var/www/html
EXPOSE 80, 443
CMD nginx -g 'daemon off;'
```

- la commande `FROM` va créer une nouvelle couche basée sur _debian_;
- la commande `RUN`, une autre couche ne contenant que les différences avec la précédente et;
- ainsi de suite pour   `COPY` et `CMD`;
- seule la dernière couche — celle du conteneur construit — sera en lecture-écriture. 

## Le réseau

Docker propose plusieurs manières de configurer le réseau grâce à plusieurs _drivers_ : 

|Type de réseau | Description
|--             |-- 
|**bridge**     |Driver par défaut.<br/>Attribue l'adresse `172.17.0.2` non routable. Nécessite de _nater_ les ports
|**host**       | Supprime l'isolation du conteneur qui utilise alors le pile réseau de l'hôte
|**macvlan**    | Attribution d'une adresse MAC au conteneur qui pourra avoir son identité sur le réseau
|**none**       | Désactive le réseau
|**overlay**    | Superpose un réseau à celui de l'hôte permettant à plusieurs conteneurs de communiquer. 

### bridge

Driver par défaut. L'adresse IP n'est pas routable. Il est nécessaire de _nater_ un port de l'hôte sur un port du conteneur. 

```bash
~:$ docker run -ti nginx bash 
Unable to find image 'nginx:latest' locally 
latest: Pulling from library/nginx
c29f5b76f736: Pull complete
e19db8451adb: Pull complete
24ff42a0d907: Pull complete
c558df217949: Pull complete 
976e8f6b25dd: Pull complete 
6c78b0ba1a32: Pull complete
84cade77a831: Pull complete
Digest: sha256:917[cut]>34   
Status: Downloaded newer image for nginx:latest
root@da5131be4ef1:/# apt update && apt install iproute2
root@da5131be4ef1:/# ip a 
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN group default qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host 
       valid_lft forever preferred_lft forever
40: eth0@if41: <BROADCAST,MULTICAST,UP,LOWER_UP> mtu 1500 qdisc noqueue state UP group default 
    link/ether 02:42:ac:11:00:03 brd ff:ff:ff:ff:ff:ff link-netnsid 0
    inet 172.17.0.3/16 brd 172.17.255.255 scope global eth0
       valid_lft forever preferred_lft forever
```

En l'état, le conteneur est inutile. 

- Natons le port en faisant correspondre le port `80` de l'hôte avec le port `80` du conteneur : option `-p`
- Détachons le conteneur pour que le service _nginx_ soit disponible (et plus un shell `bash`)

```bash 
~:$ docker run -d  -p 80:80 nginx  
75a9ae27b43[cut]0e92df3f506f92b
:~$ curl -I localhost 
HTTP/1.1 200 OK
Server: nginx/1.27.4
Date: Tue, 18 Feb 2025 14:18:43 GMT
Content-Type: text/html
Content-Length: 615
Last-Modified: Wed, 05 Feb 2025 11:06:32 GMT
Connection: keep-alive
ETag: "67a34638-267"
Accept-Ranges: bytes
```
- fait une requête `http` sur la machine locale, sur son port 80. Le port 80 est redirigé par docker sur le port 80 du conteneur. 

```bash
~:$ docker ps
$ docker ps 
CONTAINER ID IMAGE COMMAND                  CREATED       STATUS PORTS  NAMES
75a9ae27b43b nginx "/docker-entrypoint.…"   4 minutes ago Up 4 minutes  0.0.0.0:80->80/tcp, :::80->80/tcp  amazing_morse
```
- montre les conteneurs dont le conteneur `nginx` actif

:::warning
Il sera nécessaire de supprimer le conteneur qui monopolise le port 80. 
```bash
~:$ docker rm -f <ID | NAME>
~:$ docker rm -f amazing_morse
```
:::

### host

Cette fois, le driver utilisé doit être précisé _via_ `--net=host` et c'est bien la pile réseau de l'hôte qui est utilisée. 

```bash
~:$ docker run --rm --net=host -d nginx
```
- `--rm` supprimera automatiquement le conteneur lorsqu'il sera arrêté

```bash
~:$ docker ps
CONTAINER ID IMAGE COMMAND                  CREATED          STATUS PORTS NAMES        
4120242817eb nginx "/docker-entrypoint.…"   29 seconds ago   Up 29 seconds      hungry_mcclinTock  
```
- la colonne port ne contient plus d'information de _nating_

```
:~$ curl -I localhost 
HTTP/1.1 200 OK
Server: nginx/1.27.4
Date: Tue, 18 Feb 2025 14:18:43 GMT
Content-Type: text/html
Content-Length: 615
Last-Modified: Wed, 05 Feb 2025 11:06:32 GMT
Connection: keep-alive
ETag: "67a34638-267"
Accept-Ranges: bytes
```
- cette fois `curl` interroge l'hôte et l'hôte partage sa pile réseau… et son port 80.

`docker stop hungry_mcclintock` stoppe le conteneur et le supprime (puisqu'il avait été créé avec l'option `--rm`)

:::warning 
Il est possible de voir les logs d'un conteneur et dans ce cas les logs du serveur `nginx` _via_ 
```bash 
~:$ docker logs <ID | NAME>
```
:::

### macvlan

Il est nécessaire de créer un réseau associé à la carte reseau de l'hôte

```bash
~:$ docker network create -d macvlan --subnet=172.16.0.0/16 --gateway=172.16.0.1 -o parent=eth0 public
afd81863b538[cut]ad1b78e7dcd210fb
```

Le réseau devrait apparaitre dans la liste des réseaux _via_ `docker network ls`

```bash
NETWORK ID     NAME   DRIVER    SCOPE
afd81863b538   public macvlan   local
```

Lançons un conteneur utilisant ce réseau (et faisant un petit dodo) et exécutons la commande `ip address` au sein de celui-ci. 

```bash
~:$ docker run -d --net=public alpine sleep 3600
~:$ docker exec modest_lehmann ip a
1: lo: <LOOPBACK,UP,LOWER_UP> mtu 65536 qdisc noqueue state UNKNOWN qlen 1000
    link/loopback 00:00:00:00:00:00 brd 00:00:00:00:00:00
    inet 127.0.0.1/8 scope host lo
       valid_lft forever preferred_lft forever
    inet6 ::1/128 scope host 
       valid_lft forever preferred_lft forever
53: eth0@if2: <NO-CARRIER,BROADCAST,MULTICAST,UP,M-DOWN> mtu 1500 qdisc noqueue state LOWERLAYERDOWN 
    link/ether 02:42:ac:10:00:02 brd ff:ff:ff:ff:ff:ff
    inet 172.16.0.2/16 brd 172.16.255.255 scope global eth0
       valid_lft forever preferred_lft forever
```

## Persistance 

La bonne pratique est que les conteneurs soient _stateless_ et donc sans persistance des données. Les données ne devraient pas se trouver **dans** le conteneur. Où les stocker ?

### Les données stockées sur l'hôte

La technique _binds mounts_ permets de monter n'importe quel point du _filesystem_ (système de fichiers) à l'intérieur du conteneur. 

Imaginons que les données se trouvent — sur l'hôte — dans `/share/data`, le lien se fait par : 

```bash
~:# docker run -ti --rm --volume /share/data:/data debian bash
```
- `-ti` pour que le terminal soit interactif,
- `--rm` supprime l'image à la fermeture du conteneur

Cette technique limite la portabilité du conteneur (puisque les données sont sur l'hôte) et donne un accès au _filesystem_ de l'hôte ce qui est un trou de sécurité. 

### Les bases de données conteneurisées

Il existe des images pour les principaux SGBD (MySQL, PostgreSQL, MongoDB, etc.).

Par exemple : 

```bash
docker run --name my-mysql -e MYSQL_ROOT_PASSWORD=my-secret-pw 
  -e MYSQL_DATABASE=mydb -d mysql:latest
```
- `--name my-mysql` donne un nom au conteneur;
- `-e` donne des valeurs aux variables d'environnement. Ici pour la base de donnée et pour le mot de passe _root_;
- `-d` détache le conteneur pour qu'il s'exécute en _background_
- _mysql:latest_ le nom de l'image

Une fois que le conteneur tourne en _background_, il est possible d'y exécuter un _shell_ : 

```bash
~:$ docker exec -it my-mysql bash
root@1234# mysql -u root -p
```

:::warning
Pour se connecter à partir de l'hôte, mapper les ports avec `-p 3306:3306`. 

Pour tester, supprimer l'image avec `docker remove -f <id | name>` et la recréer avec le mappage de ports. 
:::

:::warning
Pour se connecter à partir d'un autre conteneur, mettre les conteneur dans le même réseau _via_   
`--network <network name>` ou `--net=<network name>`.
:::

Les données sont stockées dans le conteneur et sont supprimées si le conteneur est supprimé. Attacher un volume permet de les conserver. 


```bash
docker run --name my-mysql 
    -e MYSQL_ROOT_PASSWORD=my-secret-pw -e MYSQL_DATABASE=mydb 
    -p 3306:3306 
    -v my-mysql-data:/var/lib/mysql 
    -d 
    mysql:latest
```

Cette commande utilise un volume nommé `my-mysql-data` pour stocker les données de la base de données MySQL.

### Personnalisation d'une image de base de données

Avec un `Dockerfile` il est possible de créer son image personnalisée. Voici un exemple : 

```dockerfile
FROM mysql:latest
ENV MYSQL_DATABASE mydb
COPY ./scripts/ /docker-entrypoint-initdb.d/
```
- `ENV` défini une variable d'environnement donnant le nom de la BD;
- `COPY` copie les fichiers contenu dans le répertoire `scripts` de l'hôte dans le répertoire `/docker-entrypoint-initdb.d/`. Dans ce répertoire les fichiers `.sh`, `.sql` et `.slq.gz` sont exécutés lorsque le conteneur est exécuté pour la première fois. 

Avec une structure comme celle-ci : 

```
├── your-project-directory/
│ ├── scripts/
│ │ └── create_table.sql
│ └── Dockerfile
```

et 

```bash
~:$ cat scripts/create_table.sql
CREATE TABLE IF NOT EXISTS mydb.myothertable (
  column_name VARCHAR(255)
);

INSERT INTO mydb.myothertable (column_name) VALUES ('other_value');
```

la création d'une image docker se fait par  : 

```bash
~:$ docker build -t my-custom-mysql .
```
- `-t <name>` associe un nom à l'image
- `.` signifie à docker que les fichiers nécessaires au _build_ de l'image sont dans le répertoire courant. 

Lancer l'image nouvellement créée se fait par : 

```bash
~:$ docker run --name my-mysql 
    -e MYSQL_ROOT_PASSWORD=my-secret-pw 
    -d 
    my-custom-mysql
```

`docker ps` permet de vérifier que le conteneur est actif. Et il est également possible de lancer un `SELECT` directement sur le conteneur par : 

```bash
 docker exec my-mysql mysql 
    -u root -pmy-secret-pw 
    -e "SELECT * FROM mydb.myothertable;"
```

:::info À LIRE AUSSI / SOURCE
[Database guide on Docker](https://docs.docker.com/guides/databases/)  
[Containers from scratch](http://ericchiang.github.io/post/containers-from-scratch) Utilise _cgroup v1_ et pas _v2_.
:::

## Limiter les ressources d'un conteneur

Par défaut, un conteneur Docker peut utiliser autant de CPU et de mémoire RAM que l'hôte le permet. Il est possible de restreindre ces ressources pour éviter qu'un conteneur monopolise les ressources de la machine ou pour simuler un environnement contraint.

### Limiter la mémoire RAM

L'option `--memory` (ou `-m`) fixe la quantité maximale de RAM utilisable par le conteneur. L'option `--memory-swap` définit la limite combinée RAM + _swap_.
 
```bash
~:$ docker run -d --memory="512m" --memory-swap="512m" nginx
```
- le conteneur ne peut pas utiliser plus de 512 Mo de RAM;
- `--memory-swap` égal à `--memory` désactive le swap pour ce conteneur.

### Limiter le CPU

Deux options principales permettent de limiter l'usage processeur :

| Option | Description |
|--|--|
| `--cpus` | Nombre de CPU (ou fraction) alloués au conteneur |
| `--cpu-shares` | Poids relatif en cas de contention CPU (défaut : 1024) |

```bash
~:$ docker run -d --cpus="1.5" nginx
```
- le conteneur ne peut pas utiliser l'équivalent de plus d'1,5 cœur CPU.

```bash
~:$ docker run -d --cpu-shares=512 nginx
```
- en cas de contention, ce conteneur reçoit deux fois moins de temps CPU qu'un conteneur avec la valeur par défaut (1024).

### Vérifier les limites appliquées

`docker stats` affiche en temps réel la consommation CPU, mémoire, réseau et disque de chaque conteneur actif :

```bash
~:$ docker stats
CONTAINER ID   NAME      CPU %   MEM USAGE / LIMIT   MEM %   NET I/O   BLOCK I/O
75a9ae27b43b   nginx     0.00%   3.5MiB / 512MiB     0.68%   …         …
```

`docker inspect <ID | NAME>` permet de retrouver les limites configurées dans la section `HostConfig` de la sortie JSON (`Memory`, `NanoCpus`, etc.).

:::info
La limitation des ressources s'appuie sur les **cgroups** du noyau Linux. Docker utilise _cgroup v2_ sur les distributions récentes.
:::

## Créer ses propres images

Pour créer sa propre image, il est nécessaire d'écrire un fichier `Dockerfile` précisant les couches devant se trouver dans l'image. 

Par exemple : 

```dockerfile
FROM debian
RUN apt update && apt install -y nginx
COPY index.html /var/www/html/
EXPOSE 80
CMD nginx -g 'daemon off;'
```
- la première couche est une `debian` ;
- la deuxième couche et commande `RUN` installe `nginx`;
- il faut ensuite copier le fichier `index.html` — se trouvant dans le répertoire courant — dans l'image;
- préciser que l'on expose le port 80 et lancer `nginx` en avant-plan (_foreground_). 

Dans le répertoire courant doit se trouver un fichier `index.html` contenant la page à afficher. 

Dans le répertoire courant, construire l'image _via_ : 

```bash
docker build -t first-image:v01 .                                   
[+] Building 13.4s (8/8) FINISHED                               docker:default
 => [internal] load build definition from Dockerfile            0.0s
 => => transferring dockerfile: 156B                            0.0s
 => WARN: JSONArgsRecommended: JSON arguments recommended for…  0.0s
 => [internal] load metadata for docker.io/library/debian:latest0.0s
 => [internal] load .dockerignore                               0.0s   
 => => transferring context: 2B                                 0.0    
 => [1/3] FROM docker.io/library/debian:latest                  0.1s   
 => [internal] load build context                               0.1s
 => => transferring context: 31B                                0.0s    
 => [2/3] RUN apt update && apt install -y nginx               12.3s  
 => [3/3] COPY index.html /var/www/html/                        0.2s   
 => exporting to image                                          0.5s  
 => => exporting layers                                         0.5s   
 => => writing image sha256:9cebb3[cut]d53a86e2                 0.0s  
 => => naming to docker.io/library/first-image                  0.0s 
 1 warning found (use docker --debug to expand): 
 - JSONArgsRecommended: JSON arguments recommended for CMD to prevent unintended behavior related to OS signals (line 5)
 ```

L'image est créée : 

```bash
~:$ docker images                                 
REPOSITORY     TAG  IMAGE ID      CREATED          SIZE            
first-image    v0:1 9cebb3c3bac6  42 seconds ago   154MB     
```

Il reste à lancer l'image et à la tester : 

```bash
~:$ docker run  -d -p 80:80 first-image:v01
dbc680[cut]8a646c8a4424aefd8bfb3
~:$ curl localhost
Yet another hello world
```

:::warning
Ici l'image porte le _tag_ `v0.1`. Pour ajouter le _tag_ `latest`… ajouter le _tag_ avec : 
```bash 
docker tag first-image:v0.1 first-image:latest
```
:::

`docker images` montre l'image avec toutes ses versions. Pour reconstruire l'image après un petit changement, `docker build -t first-image:v0.2 .` fera l'affaire et docker utilisera un **cache** et ne reconstruira que les parties modifiées. Le _build_ sera plus rapide. 

Pour avoir une image plus petite, c'est mieux d'utiliser la distribution **alpine** au lieu de debian. Dans ce cas, le Dockerfile devient : 

```dockerfile
FROM alpine
RUN apk update && apk add nginx
COPY index.html /var/www/html/
EXPOSE 80
CMD nginx -g 'daemon off;'
```

… et l'image passe de 154MB à 6,74MB ce qui n'est pas négligeable. 



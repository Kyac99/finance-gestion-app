# Application de Gestion des Finances d'Entreprise

Cette application permet à une entrepreneure vendant des sacs, chaussures et autres produits de gérer efficacement ses transactions financières, ses fournisseurs, ses clients, et d'avoir une visibilité claire sur ses flux financiers à travers des tableaux de bord interactifs.

## Fonctionnalités principales

- **Gestion des fournisseurs et des achats**: Suivi des commandes, paiements et livraisons
- **Gestion des stocks**: Suivi des niveaux de stock, alertes de stock bas
- **Gestion des clients et des ventes**: Enregistrement des ventes, suivi des paiements
- **Facturation automatique**: Génération et suivi des factures
- **Tableaux de bord**: Visualisation des données financières et opérationnelles

## Technologies utilisées

### Backend
- **Django**: Framework web Python
- **Django REST Framework**: API RESTful 
- **PostgreSQL**: Base de données relationnelle
- **JWT**: Authentification par token

### Frontend
- **React**: Bibliothèque JavaScript pour construire l'interface utilisateur
- **Material-UI**: Framework de composants UI
- **React Router**: Gestion des routes
- **React Query**: Gestion des requêtes API et du cache
- **Chart.js**: Visualisation des données

## Prérequis

- Python 3.9+
- Node.js 16+
- PostgreSQL 13+

## Installation

### Configurer l'environnement de développement

1. Cloner le dépôt:
```bash
git clone https://github.com/Kyac99/finance-gestion-app.git
cd finance-gestion-app
```

### Backend (Django)

1. Créer un environnement virtuel Python:
```bash
python -m venv venv
source venv/bin/activate  # Sur Windows : venv\Scripts\activate
```

2. Installer les dépendances:
```bash
pip install -r backend/requirements.txt
```

3. Créer une base de données PostgreSQL:
```bash
createdb finance_db
```

4. Créer un fichier `.env` dans le dossier `backend` avec les variables suivantes:
```
DEBUG=True
SECRET_KEY=your-secret-key
DB_NAME=finance_db
DB_USER=your-db-user
DB_PASSWORD=your-db-password
DB_HOST=localhost
DB_PORT=5432
ALLOWED_HOSTS=localhost,127.0.0.1
```

Voici comment renseigner chaque variable:

- **DEBUG**: Mode débogage de Django. Réglez sur `True` pour le développement et `False` pour la production.
- **SECRET_KEY**: Clé secrète utilisée par Django pour la sécurité. Générez une clé forte et unique (vous pouvez utiliser [ce générateur](https://djecrety.ir/) ou exécutez `python -c "import secrets; print(secrets.token_urlsafe(50))"` dans votre terminal).
- **DB_NAME**: Nom de votre base de données PostgreSQL (utilisez `finance_db` comme indiqué dans l'étape précédente).
- **DB_USER**: Nom d'utilisateur PostgreSQL avec accès à la base de données.
- **DB_PASSWORD**: Mot de passe de l'utilisateur PostgreSQL. Vous avez deux options :
  - Utiliser un mot de passe PostgreSQL existant si vous avez déjà configuré un utilisateur
  - Créer un nouvel utilisateur et mot de passe avec les commandes suivantes :
    ```bash
    # Se connecter à PostgreSQL
    sudo -u postgres psql
    
    # Créer un nouvel utilisateur et définir son mot de passe
    CREATE USER your_db_user WITH PASSWORD 'your-db-password';
    
    # Accorder les privilèges sur la base de données
    GRANT ALL PRIVILEGES ON DATABASE finance_db TO your_db_user;
    
    # Quitter psql
    \q
    ```
- **DB_HOST**: Hôte de la base de données (`localhost` pour le développement local).
- **DB_PORT**: Port PostgreSQL standard (généralement `5432`).
- **ALLOWED_HOSTS**: Liste des noms d'hôtes/domaines autorisés à servir votre application Django, séparés par des virgules.

5. Appliquer les migrations et créer un superutilisateur:
```bash
cd backend
python manage.py migrate
python manage.py createsuperuser
```

6. Démarrer le serveur de développement:
```bash
python manage.py runserver
```

### Frontend (React)

1. Installer les dépendances:
```bash
cd frontend
npm install
```

2. Créer un fichier `.env` dans le dossier `frontend` avec les variables suivantes:
```
REACT_APP_API_URL=http://localhost:8000/api
```

3. Démarrer l'application:
```bash
npm start
```

## Structure du projet

- `backend/`: Code Django
  - `finance_app/`: Projet Django principal
  - `core/`: Application Django principale
    - `models.py`: Modèles de données
    - `views.py`: Vues API
    - `serializers.py`: Sérialiseurs pour l'API
    - `urls.py`: Configuration des URLs

- `frontend/`: Code React
  - `src/`: Code source
    - `components/`: Composants réutilisables
    - `pages/`: Pages de l'application
    - `contexts/`: Contextes React (authentification, etc.)

## Usage

1. Accéder à l'interface d'administration Django:
   - URL: http://localhost:8000/admin/
   - Se connecter avec le compte superutilisateur créé

2. Accéder à l'application frontend:
   - URL: http://localhost:3000/
   - Se connecter avec le même compte

## Documentation API

La documentation de l'API est disponible aux URLs suivantes:
- Swagger UI: http://localhost:8000/swagger/
- ReDoc: http://localhost:8000/redoc/

## Captures d'écran

*Des captures d'écran seront ajoutées ici.*

## Déploiement

### Backend (Django)

Pour le déploiement en production, suivez ces étapes:

1. Configurez les variables d'environnement pour la production:
```
DEBUG=False
SECRET_KEY=your-secure-secret-key
DATABASE_URL=postgres://user:password@host:port/database
ALLOWED_HOSTS=yourdomain.com,www.yourdomain.com
```

2. Collectez les fichiers statiques:
```bash
python manage.py collectstatic
```

3. Configurez un serveur web comme Nginx avec Gunicorn.

### Frontend (React)

1. Construisez l'application pour la production:
```bash
npm run build
```

2. Déployez le dossier `build` sur votre serveur web.

## Roadmap

- [ ] Intégration de paiements en ligne
- [ ] Application mobile native
- [ ] Génération de rapports avancés
- [ ] Module de gestion des employés

## Contribution

Les contributions sont les bienvenues! N'hésitez pas à ouvrir une issue ou à soumettre une pull request.

## Licence

Ce projet est sous licence MIT.